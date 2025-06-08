/**
 * ThemeEditorPanel.js
 * Редактор тем: выбор и настройка цветов, сохранение/загрузка тем, применение.
 */

class ThemeEditorPanel {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM-элемент для рендера
     * @param {Function} [options.onThemeChange] - Колбэк при изменении темы
     */
    constructor(options) {
        this.container = options.container;
        this.onThemeChange = options.onThemeChange;
        this.stateKey = 'userTheme';
        this.theme = this.loadTheme() || this.getDefaultTheme();
    }

    getDefaultTheme() {
        return {
            name: 'Светлая',
            isDark: false,
            colors: {
                '--plugin-bg': '#fafbfc',
                '--plugin-border': '#ccc',
                '--plugin-row-border': '#eee',
                '--plugin-accent': '#0078d7',
                '--plugin-text': '#222',
                '--plugin-muted': '#888',
                '--plugin-error': '#d70022',
                '--plugin-success': '#1a9c2e',
            },
            font: 'Segoe UI, Arial, sans-serif',
            fontSize: '15px'
        };
    }

    /**
     * Инициализация панели
     */
    init() {
        this.render();
    }

    /**
     * Применить тему к приложению
     */
    applyTheme(theme) {
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        root.setAttribute('data-theme', theme.isDark ? 'dark' : 'light');
        root.style.setProperty('--plugin-font', theme.font);
        root.style.setProperty('--plugin-font-size', theme.fontSize);
        if (this.onThemeChange) this.onThemeChange(theme);
    }

    /**
     * Сохранить тему
     */
    saveTheme(theme) {
        localStorage.setItem(this.stateKey, JSON.stringify(theme));
    }

    /**
     * Загрузить тему
     */
    loadTheme() {
        const saved = localStorage.getItem(this.stateKey);
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return null; }
        }
        return null;
    }

    /**
     * Рендер панели
     */
    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        const panel = document.createElement('div');
        panel.className = 'theme-editor-panel';
        const title = document.createElement('h2');
        title.textContent = 'Редактор темы';
        panel.appendChild(title);
        // Цвета
        Object.entries(this.theme.colors).forEach(([key, value]) => {
            const row = document.createElement('div');
            row.style.marginBottom = '8px';
            const label = document.createElement('label');
            label.textContent = key.replace('--plugin-', '').replace('-', ' ');
            label.style.marginRight = '8px';
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.oninput = (e) => {
                this.theme.colors[key] = e.target.value;
                this.applyTheme(this.theme);
                this.saveTheme(this.theme);
            };
            row.appendChild(label);
            row.appendChild(input);
            panel.appendChild(row);
        });
        // Шрифт
        const fontRow = document.createElement('div');
        fontRow.style.marginBottom = '8px';
        fontRow.innerHTML = '<label>Шрифт: <input type="text" value="' + this.theme.font + '" style="width:220px"></label>';
        fontRow.querySelector('input').oninput = (e) => {
            this.theme.font = e.target.value;
            this.applyTheme(this.theme);
            this.saveTheme(this.theme);
        };
        panel.appendChild(fontRow);
        // Размер шрифта
        const fontSizeRow = document.createElement('div');
        fontSizeRow.style.marginBottom = '8px';
        fontSizeRow.innerHTML = '<label>Размер шрифта: <input type="number" min="10" max="32" value="' + parseInt(this.theme.fontSize) + '"> px</label>';
        fontSizeRow.querySelector('input').oninput = (e) => {
            this.theme.fontSize = e.target.value + 'px';
            this.applyTheme(this.theme);
            this.saveTheme(this.theme);
        };
        panel.appendChild(fontSizeRow);
        // Тёмная тема
        const darkRow = document.createElement('div');
        darkRow.style.marginBottom = '8px';
        const darkLabel = document.createElement('label');
        darkLabel.textContent = 'Тёмная тема';
        const darkCheckbox = document.createElement('input');
        darkCheckbox.type = 'checkbox';
        darkCheckbox.checked = this.theme.isDark;
        darkCheckbox.onchange = (e) => {
            this.theme.isDark = e.target.checked;
            this.applyTheme(this.theme);
            this.saveTheme(this.theme);
        };
        darkRow.appendChild(darkLabel);
        darkRow.appendChild(darkCheckbox);
        panel.appendChild(darkRow);
        // Сохранить/загрузить тему
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить тему';
        saveBtn.onclick = () => this.saveTheme(this.theme);
        panel.appendChild(saveBtn);
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Загрузить тему';
        loadBtn.onclick = () => {
            const loaded = this.loadTheme();
            if (loaded) {
                this.theme = loaded;
                this.applyTheme(this.theme);
                this.render();
            }
        };
        panel.appendChild(loadBtn);
        this.container.appendChild(panel);
        // Применить тему сразу
        this.applyTheme(this.theme);
    }
}

module.exports = ThemeEditorPanel; 