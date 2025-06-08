/**
 * FontEditorPanel.js
 * Редактор шрифтов интерфейса: выбор семейства, размера, жирности, стиля.
 */

class FontEditorPanel {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM-элемент для рендера
     * @param {Function} [options.onFontChange] - Колбэк при изменении шрифта
     */
    constructor(options) {
        this.container = options.container;
        this.onFontChange = options.onFontChange;
        this.stateKey = 'userFont';
        this.font = this.loadFont() || this.getDefaultFont();
    }

    getDefaultFont() {
        return {
            family: 'Segoe UI, Arial, sans-serif',
            size: '15px',
            weight: '400',
            style: 'normal'
        };
    }

    /**
     * Инициализация панели
     */
    init() {
        this.render();
    }

    /**
     * Применить шрифт к приложению
     */
    applyFont(font) {
        const root = document.documentElement;
        root.style.setProperty('--plugin-font', font.family);
        root.style.setProperty('--plugin-font-size', font.size);
        root.style.setProperty('--plugin-font-weight', font.weight);
        root.style.setProperty('--plugin-font-style', font.style);
        if (this.onFontChange) this.onFontChange(font);
    }

    /**
     * Сохранить шрифт
     */
    saveFont(font) {
        localStorage.setItem(this.stateKey, JSON.stringify(font));
    }

    /**
     * Загрузить шрифт
     */
    loadFont() {
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
        panel.className = 'font-editor-panel';
        const title = document.createElement('h2');
        title.textContent = 'Редактор шрифтов';
        panel.appendChild(title);
        // Семейство
        const familyRow = document.createElement('div');
        familyRow.style.marginBottom = '8px';
        familyRow.innerHTML = '<label>Семейство: <input type="text" value="' + this.font.family + '" style="width:220px"></label>';
        familyRow.querySelector('input').oninput = (e) => {
            this.font.family = e.target.value;
            this.applyFont(this.font);
            this.saveFont(this.font);
        };
        panel.appendChild(familyRow);
        // Размер
        const sizeRow = document.createElement('div');
        sizeRow.style.marginBottom = '8px';
        sizeRow.innerHTML = '<label>Размер: <input type="number" min="10" max="32" value="' + parseInt(this.font.size) + '"> px</label>';
        sizeRow.querySelector('input').oninput = (e) => {
            this.font.size = e.target.value + 'px';
            this.applyFont(this.font);
            this.saveFont(this.font);
        };
        panel.appendChild(sizeRow);
        // Жирность
        const weightRow = document.createElement('div');
        weightRow.style.marginBottom = '8px';
        weightRow.innerHTML = '<label>Жирность: <input type="number" min="100" max="900" step="100" value="' + this.font.weight + '"></label>';
        weightRow.querySelector('input').oninput = (e) => {
            this.font.weight = e.target.value;
            this.applyFont(this.font);
            this.saveFont(this.font);
        };
        panel.appendChild(weightRow);
        // Стиль
        const styleRow = document.createElement('div');
        styleRow.style.marginBottom = '8px';
        styleRow.innerHTML = '<label>Стиль: <select><option value="normal">Обычный</option><option value="italic">Курсив</option><option value="oblique">Наклонный</option></select></label>';
        styleRow.querySelector('select').value = this.font.style;
        styleRow.querySelector('select').onchange = (e) => {
            this.font.style = e.target.value;
            this.applyFont(this.font);
            this.saveFont(this.font);
        };
        panel.appendChild(styleRow);
        // Сохранить/загрузить
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить шрифт';
        saveBtn.onclick = () => this.saveFont(this.font);
        panel.appendChild(saveBtn);
        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Загрузить шрифт';
        loadBtn.onclick = () => {
            const loaded = this.loadFont();
            if (loaded) {
                this.font = loaded;
                this.applyFont(this.font);
                this.render();
            }
        };
        panel.appendChild(loadBtn);
        this.container.appendChild(panel);
        // Применить сразу
        this.applyFont(this.font);
    }
}

module.exports = FontEditorPanel; 