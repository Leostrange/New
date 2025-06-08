/**
 * SettingsPanel.js
 * Вкладки: Тема, Шрифты, Поднастройки, Темы сообщества, Резервное копирование
 */

const ThemeEditorPanel = require('./ThemeEditorPanel');
const FontEditorPanel = require('./FontEditorPanel');

class SettingsPanel {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM-элемент для рендера
     */
    constructor(options) {
        this.container = options.container;
        this.activeTab = 'theme';
        this.themeEditor = null;
        this.fontEditor = null;
        this.communityThemes = [
            { name: 'Dark Blue', isDark: true, colors: { '--plugin-bg': '#1a2233', '--plugin-border': '#223', '--plugin-row-border': '#223', '--plugin-accent': '#4fa3ff', '--plugin-text': '#e0e6f0', '--plugin-muted': '#7a8ca3', '--plugin-error': '#ff4d6d', '--plugin-success': '#4dff7a' }, font: 'Segoe UI, Arial, sans-serif', fontSize: '15px' },
            { name: 'Solarized Light', isDark: false, colors: { '--plugin-bg': '#fdf6e3', '--plugin-border': '#eee8d5', '--plugin-row-border': '#eee8d5', '--plugin-accent': '#268bd2', '--plugin-text': '#657b83', '--plugin-muted': '#93a1a1', '--plugin-error': '#dc322f', '--plugin-success': '#859900' }, font: 'Segoe UI, Arial, sans-serif', fontSize: '15px' }
        ];
        this.interfaceSettings = {
            borderRadius: 8,
            animation: true,
            density: 'comfortable'
        };
    }

    init() {
        this.render();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        // Вкладки
        const tabs = document.createElement('div');
        tabs.className = 'settings-tabs';
        tabs.style.display = 'flex';
        tabs.style.marginBottom = '12px';
        const tabList = [
            { id: 'theme', label: 'Тема' },
            { id: 'font', label: 'Шрифты' },
            { id: 'ui', label: 'Поднастройки' },
            { id: 'community', label: 'Темы сообщества' },
            { id: 'backup', label: 'Резервное копирование' },
            { id: 'custom', label: 'Кастомизация' },
            { id: 'profiles', label: 'Профили' }
        ];
        tabList.forEach(tab => {
            const btn = document.createElement('button');
            btn.textContent = tab.label;
            btn.className = this.activeTab === tab.id ? 'active' : '';
            btn.style.marginRight = '8px';
            btn.onclick = () => { this.activeTab = tab.id; this.render(); };
            tabs.appendChild(btn);
        });
        this.container.appendChild(tabs);
        // Контент
        const content = document.createElement('div');
        content.className = 'settings-content';
        content.style.border = '1px solid #ccc';
        content.style.borderRadius = '8px';
        content.style.padding = '16px';
        content.style.background = '#fafbfc';
        switch (this.activeTab) {
            case 'theme':
                if (!this.themeEditor) this.themeEditor = new ThemeEditorPanel({ container: content });
                this.themeEditor.render();
                break;
            case 'font':
                if (!this.fontEditor) this.fontEditor = new FontEditorPanel({ container: content });
                this.fontEditor.render();
                break;
            case 'ui':
                this.renderInterfaceSettings(content);
                break;
            case 'community':
                this.renderCommunityThemes(content);
                break;
            case 'backup':
                this.renderBackupManagerPanel(content);
                break;
            case 'custom':
                this.renderCustomization(content);
                break;
            case 'profiles':
                this.renderProfiles(content);
                break;
        }
        this.container.appendChild(content);
    }

    renderInterfaceSettings(panel) {
        panel.innerHTML = '<h3>Поднастройки интерфейса</h3>';
        // Скругления
        const radiusRow = document.createElement('div');
        radiusRow.innerHTML = '<label>Скругление углов: <input type="number" min="0" max="32" value="' + this.interfaceSettings.borderRadius + '"> px</label>';
        radiusRow.querySelector('input').oninput = (e) => {
            this.interfaceSettings.borderRadius = e.target.value;
            document.documentElement.style.setProperty('--plugin-border-radius', e.target.value + 'px');
        };
        panel.appendChild(radiusRow);
        // Анимации
        const animRow = document.createElement('div');
        animRow.innerHTML = '<label><input type="checkbox" ' + (this.interfaceSettings.animation ? 'checked' : '') + '> Анимации</label>';
        animRow.querySelector('input').onchange = (e) => {
            this.interfaceSettings.animation = e.target.checked;
            document.documentElement.style.setProperty('--plugin-animations', e.target.checked ? 'all 0.2s' : 'none');
        };
        panel.appendChild(animRow);
        // Плотность
        const densityRow = document.createElement('div');
        densityRow.innerHTML = '<label>Плотность: <select><option value="comfortable">Комфортная</option><option value="compact">Компактная</option></select></label>';
        densityRow.querySelector('select').value = this.interfaceSettings.density;
        densityRow.querySelector('select').onchange = (e) => {
            this.interfaceSettings.density = e.target.value;
            document.documentElement.style.setProperty('--plugin-density', e.target.value);
        };
        panel.appendChild(densityRow);
        // Размер иконок
        const iconSizeRow = document.createElement('div');
        iconSizeRow.innerHTML = '<label>Размер иконок: <input type="number" min="12" max="64" value="' + (this.interfaceSettings.iconSize || 24) + '"> px</label>';
        iconSizeRow.querySelector('input').oninput = (e) => {
            this.interfaceSettings.iconSize = e.target.value;
            document.documentElement.style.setProperty('--plugin-icon-size', e.target.value + 'px');
        };
        panel.appendChild(iconSizeRow);
        // Цвет акцента
        const accentRow = document.createElement('div');
        accentRow.innerHTML = '<label>Цвет акцента: <input type="color" value="' + (this.interfaceSettings.accentColor || '#4fa3ff') + '"></label>';
        accentRow.querySelector('input').oninput = (e) => {
            this.interfaceSettings.accentColor = e.target.value;
            document.documentElement.style.setProperty('--plugin-accent', e.target.value);
        };
        panel.appendChild(accentRow);
        // Тени
        const shadowRow = document.createElement('div');
        shadowRow.innerHTML = '<label><input type="checkbox" ' + (this.interfaceSettings.shadows ? 'checked' : '') + '> Отображать тени</label>';
        shadowRow.querySelector('input').onchange = (e) => {
            this.interfaceSettings.shadows = e.target.checked;
            document.documentElement.style.setProperty('--plugin-shadow', e.target.checked ? '0 2px 8px rgba(0,0,0,0.12)' : 'none');
        };
        panel.appendChild(shadowRow);
        // Масштаб UI
        const scaleRow = document.createElement('div');
        scaleRow.innerHTML = '<label>Масштаб UI: <input type="range" min="0.7" max="1.5" step="0.01" value="' + (this.interfaceSettings.uiScale || 1) + '"></label>';
        scaleRow.querySelector('input').oninput = (e) => {
            this.interfaceSettings.uiScale = e.target.value;
            document.documentElement.style.setProperty('--plugin-ui-scale', e.target.value);
        };
        panel.appendChild(scaleRow);
        // Быстрые пресеты
        const presetRow = document.createElement('div');
        presetRow.innerHTML = '<label>Быстрые пресеты: </label>';
        const presets = [
            { name: 'Минимал', settings: { borderRadius: 2, animation: false, density: 'compact', iconSize: 16, accentColor: '#888', shadows: false, uiScale: 0.85 } },
            { name: 'Классика', settings: { borderRadius: 8, animation: true, density: 'comfortable', iconSize: 24, accentColor: '#4fa3ff', shadows: true, uiScale: 1 } },
            { name: 'Крупно', settings: { borderRadius: 16, animation: true, density: 'comfortable', iconSize: 32, accentColor: '#ff4d6d', shadows: true, uiScale: 1.2 } }
        ];
        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.textContent = preset.name;
            btn.onclick = () => {
                Object.assign(this.interfaceSettings, preset.settings);
                this.renderInterfaceSettings(panel);
                // Применить все переменные
                document.documentElement.style.setProperty('--plugin-border-radius', this.interfaceSettings.borderRadius + 'px');
                document.documentElement.style.setProperty('--plugin-animations', this.interfaceSettings.animation ? 'all 0.2s' : 'none');
                document.documentElement.style.setProperty('--plugin-density', this.interfaceSettings.density);
                document.documentElement.style.setProperty('--plugin-icon-size', this.interfaceSettings.iconSize + 'px');
                document.documentElement.style.setProperty('--plugin-accent', this.interfaceSettings.accentColor);
                document.documentElement.style.setProperty('--plugin-shadow', this.interfaceSettings.shadows ? '0 2px 8px rgba(0,0,0,0.12)' : 'none');
                document.documentElement.style.setProperty('--plugin-ui-scale', this.interfaceSettings.uiScale);
            };
            presetRow.appendChild(btn);
        });
        panel.appendChild(presetRow);
        // Массовое применение ко всем профилям
        const massApplyBtn = document.createElement('button');
        massApplyBtn.textContent = 'Применить эти настройки ко всем профилям';
        massApplyBtn.style.marginTop = '16px';
        massApplyBtn.onclick = () => {
            try {
                const ProfileManager = require('../profile/ProfileManager');
                const pm = new ProfileManager();
                pm._profiles.forEach(p => {
                    Object.assign(p.settings.interface || {}, this.interfaceSettings);
                });
                pm._saveProfiles();
                alert('Настройки применены ко всем профилям!');
            } catch (e) {
                alert('Ошибка массового применения: ' + e.message);
            }
        };
        panel.appendChild(massApplyBtn);
    }

    renderCommunityThemes(panel) {
        panel.innerHTML = '<h3>Темы сообщества</h3>';
        this.communityThemes.forEach(theme => {
            const row = document.createElement('div');
            row.style.marginBottom = '10px';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            const name = document.createElement('span');
            name.textContent = theme.name;
            name.style.flex = '1';
            row.appendChild(name);
            const preview = document.createElement('span');
            preview.style.display = 'inline-block';
            preview.style.width = '32px';
            preview.style.height = '16px';
            preview.style.background = theme.colors['--plugin-bg'];
            preview.style.border = '1px solid #ccc';
            preview.style.marginRight = '8px';
            row.appendChild(preview);
            const applyBtn = document.createElement('button');
            applyBtn.textContent = 'Применить';
            applyBtn.onclick = () => {
                if (!this.themeEditor) this.themeEditor = new ThemeEditorPanel({ container: panel });
                this.themeEditor.theme = theme;
                this.themeEditor.applyTheme(theme);
                this.themeEditor.saveTheme(theme);
                this.themeEditor.render();
                alert('Тема применена!');
            };
            row.appendChild(applyBtn);
            panel.appendChild(row);
        });
    }

    renderBackupManagerPanel(panel) {
        panel.innerHTML = '';
        const BackupManagerPanel = require('./BackupManagerPanel');
        // Адаптивный контейнер
        panel.style.width = '100%';
        panel.style.maxWidth = '700px';
        panel.style.margin = '0 auto';
        new BackupManagerPanel({ container: panel });
    }

    renderProfiles(panel) {
        panel.innerHTML = '';
        const ProfileManagerPanel = require('./ProfileManagerPanel');
        panel.style.width = '100%';
        panel.style.maxWidth = '700px';
        panel.style.margin = '0 auto';
        new ProfileManagerPanel({ container: panel });
    }

    renderCustomization(panel) {
        panel.innerHTML = '<h3>Кастомизация интерфейса (Material 3 Expressive)</h3>';
        // Подвкладки
        const subTabs = [
            { id: 'theme', label: 'Темы' },
            { id: 'font', label: 'Шрифты' },
            { id: 'style', label: 'Стили' },
            { id: 'community', label: 'Темы сообщества' },
            { id: 'eink', label: 'Режим E-ink' }
        ];
        this.customActiveTab = this.customActiveTab || 'theme';
        const subTabPanel = document.createElement('div');
        subTabPanel.className = 'custom-subtabs';
        subTabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.textContent = tab.label;
            btn.className = this.customActiveTab === tab.id ? 'active' : '';
            btn.onclick = () => { this.customActiveTab = tab.id; this.renderCustomization(panel); };
            subTabPanel.appendChild(btn);
        });
        panel.appendChild(subTabPanel);
        // Контент подвкладки
        const subContent = document.createElement('div');
        subContent.className = 'custom-subcontent';
        switch (this.customActiveTab) {
            case 'theme':
                this.renderThemeEditor(subContent);
                break;
            case 'font':
                this.renderFontEditor(subContent);
                break;
            case 'style':
                this.renderStyleEditor(subContent);
                break;
            case 'community':
                this.renderCommunityThemesEditor(subContent);
                break;
            case 'eink':
                this.renderEinkSettings(subContent);
                break;
        }
        panel.appendChild(subContent);
    }

    renderThemeEditor(panel) {
        panel.innerHTML = '<b>Выбор цветовой схемы и основных цветов</b><br>';
        // Цветовая схема
        const themeRow = document.createElement('div');
        themeRow.innerHTML = '<label>Тема: <select><option value="light">Светлая</option><option value="dark">Тёмная</option></select></label>';
        const themeSelect = themeRow.querySelector('select');
        themeSelect.value = localStorage.getItem('mrcomic-theme') || 'dark';
        themeSelect.onchange = (e) => {
            this.applyThemeVars(e.target.value);
            localStorage.setItem('mrcomic-theme', e.target.value);
        };
        panel.appendChild(themeRow);
        // Основные цвета
        const colors = [
            { var: '--ctp-primary', label: 'Primary', def: '#d0bcff' },
            { var: '--ctp-surface', label: 'Surface', def: '#1c1b1f' },
            { var: '--ctp-on-surface', label: 'On Surface', def: '#e6e1e5' }
        ];
        colors.forEach(c => {
            const row = document.createElement('div');
            row.innerHTML = `<label>${c.label}: <input type="color" value="${getComputedStyle(document.documentElement).getPropertyValue(c.var).trim() || c.def}"></label>`;
            const input = row.querySelector('input');
            input.oninput = (e) => {
                document.documentElement.style.setProperty(c.var, e.target.value);
                localStorage.setItem('mrcomic-custom-' + c.var, e.target.value);
            };
            panel.appendChild(row);
        });
        // Скругления
        const radiusRow = document.createElement('div');
        radiusRow.innerHTML = '<label>Скругление: <input type="range" min="0" max="32" value="'+(getComputedStyle(document.documentElement).getPropertyValue('--ctp-radius').replace('px','')||'16')+'"> <span></span>px</label>';
        const radiusInput = radiusRow.querySelector('input');
        const radiusSpan = radiusRow.querySelector('span');
        radiusSpan.textContent = radiusInput.value;
        radiusInput.oninput = (e) => {
            document.documentElement.style.setProperty('--ctp-radius', e.target.value+'px');
            radiusSpan.textContent = e.target.value;
            localStorage.setItem('mrcomic-custom--ctp-radius', e.target.value+'px');
        };
        panel.appendChild(radiusRow);
        // Шрифт
        const fontRow = document.createElement('div');
        fontRow.innerHTML = '<label>Шрифт: <input type="text" value="'+(getComputedStyle(document.documentElement).getPropertyValue('--ctp-font').replace(/['"]/g,'').trim()||'Google Sans, Segoe UI, Arial, sans-serif')+'" style="width:320px"></label>';
        const fontInput = fontRow.querySelector('input');
        fontInput.onchange = (e) => {
            document.documentElement.style.setProperty('--ctp-font', e.target.value);
            localStorage.setItem('mrcomic-custom--ctp-font', e.target.value);
        };
        panel.appendChild(fontRow);
        // Кнопки управления пользовательскими темами
        const userThemes = JSON.parse(localStorage.getItem('mrcomic-user-themes')||'[]');
        const userThemesPanel = document.createElement('div');
        userThemesPanel.innerHTML = '<b>Пользовательские темы:</b>';
        userThemes.forEach((theme, idx) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '6px';
            const name = document.createElement('span');
            name.textContent = theme.name;
            name.style.flex = '1';
            row.appendChild(name);
            const applyBtn = document.createElement('button');
            applyBtn.textContent = 'Применить';
            applyBtn.onclick = () => {
                Object.entries(theme.colors).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
                if (theme.font) document.documentElement.style.setProperty('--ctp-font', theme.font);
                if (theme.radius) document.documentElement.style.setProperty('--ctp-radius', theme.radius);
                // Сохраняем в localStorage
                Object.entries(theme.colors).forEach(([k, v]) => localStorage.setItem('mrcomic-custom-'+k, v));
                if (theme.font) localStorage.setItem('mrcomic-custom--ctp-font', theme.font);
                if (theme.radius) localStorage.setItem('mrcomic-custom--ctp-radius', theme.radius);
                alert('Тема применена!');
            };
            row.appendChild(applyBtn);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.onclick = () => {
                const newName = prompt('Новое имя темы:', theme.name);
                if (!newName) return;
                theme.name = newName;
                userThemes[idx] = theme;
                localStorage.setItem('mrcomic-user-themes', JSON.stringify(userThemes));
                this.renderThemeEditor(panel);
            };
            row.appendChild(editBtn);
            const exportBtn = document.createElement('button');
            exportBtn.textContent = 'Экспорт';
            exportBtn.onclick = () => {
                const blob = new Blob([JSON.stringify(theme, null, 2)], {type: 'application/json'});
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${theme.name}-theme.json`;
                a.click();
            };
            row.appendChild(exportBtn);
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.onclick = () => {
                userThemes.splice(idx, 1);
                localStorage.setItem('mrcomic-user-themes', JSON.stringify(userThemes));
                this.renderThemeEditor(panel);
            };
            row.appendChild(delBtn);
            userThemesPanel.appendChild(row);
        });
        panel.appendChild(userThemesPanel);
        // Кнопка сохранить текущую тему
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить текущую тему как пользовательскую';
        saveBtn.onclick = () => {
            const name = prompt('Имя темы:');
            if (!name) return;
            const theme = {
                name,
                colors: Object.fromEntries(colors.map(c => [c.var, getComputedStyle(document.documentElement).getPropertyValue(c.var).trim() || c.def])),
                font: getComputedStyle(document.documentElement).getPropertyValue('--ctp-font').replace(/['"]/g,'').trim(),
                radius: getComputedStyle(document.documentElement).getPropertyValue('--ctp-radius').replace('px','').trim()
            };
            userThemes.push(theme);
            localStorage.setItem('mrcomic-user-themes', JSON.stringify(userThemes));
            this.renderThemeEditor(panel);
        };
        panel.appendChild(saveBtn);
        // Импорт темы из файла
        const importBtn = document.createElement('button');
        importBtn.textContent = 'Импортировать тему из файла';
        importBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const theme = JSON.parse(ev.target.result);
                        if (theme && theme.colors) {
                            userThemes.push(theme);
                            localStorage.setItem('mrcomic-user-themes', JSON.stringify(userThemes));
                            this.renderThemeEditor(panel);
                            alert('Тема импортирована!');
                        } else {
                            alert('Некорректный формат темы.');
                        }
                    } catch (e) {
                        alert('Ошибка импорта: ' + e.message);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
        panel.appendChild(importBtn);
    }

    renderFontEditor(panel) {
        panel.innerHTML = '<b>Шрифты интерфейса</b><br>';
        // Шрифт
        const fontRow = document.createElement('div');
        fontRow.innerHTML = '<label>Шрифт: <input type="text" value="'+(getComputedStyle(document.documentElement).getPropertyValue('--ctp-font').replace(/['"]/g,'').trim()||'Google Sans, Segoe UI, Arial, sans-serif')+'" style="width:320px"></label>';
        const fontInput = fontRow.querySelector('input');
        fontInput.onchange = (e) => {
            document.documentElement.style.setProperty('--ctp-font', e.target.value);
            localStorage.setItem('mrcomic-custom--ctp-font', e.target.value);
        };
        panel.appendChild(fontRow);
    }

    renderStyleEditor(panel) {
        panel.innerHTML = '<b>Скругления, размеры, дополнительные стили</b><br>';
        // Скругления
        const radiusRow = document.createElement('div');
        radiusRow.innerHTML = '<label>Скругление: <input type="range" min="0" max="32" value="'+(getComputedStyle(document.documentElement).getPropertyValue('--ctp-radius').replace('px','')||'16')+'"> <span></span>px</label>';
        const radiusInput = radiusRow.querySelector('input');
        const radiusSpan = radiusRow.querySelector('span');
        radiusSpan.textContent = radiusInput.value;
        radiusInput.oninput = (e) => {
            document.documentElement.style.setProperty('--ctp-radius', e.target.value+'px');
            radiusSpan.textContent = e.target.value;
            localStorage.setItem('mrcomic-custom--ctp-radius', e.target.value+'px');
        };
        panel.appendChild(radiusRow);
    }

    renderCommunityThemesEditor(panel) {
        panel.innerHTML = '<b>Темы сообщества</b><br>';
        // Список тем сообщества
        const themes = this.communityThemes || [];
        themes.forEach(theme => {
            const row = document.createElement('div');
            row.style.marginBottom = '10px';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            const name = document.createElement('span');
            name.textContent = theme.name;
            name.style.flex = '1';
            row.appendChild(name);
            const preview = document.createElement('span');
            preview.style.display = 'inline-block';
            preview.style.width = '32px';
            preview.style.height = '16px';
            preview.style.background = theme.colors['--plugin-bg'] || theme.colors['--ctp-surface'] || '#222';
            preview.style.border = '1px solid #ccc';
            preview.style.marginRight = '8px';
            row.appendChild(preview);
            const applyBtn = document.createElement('button');
            applyBtn.textContent = 'Применить';
            applyBtn.onclick = () => {
                Object.entries(theme.colors).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
                if (theme.font) document.documentElement.style.setProperty('--ctp-font', theme.font);
                if (theme.radius) document.documentElement.style.setProperty('--ctp-radius', theme.radius);
                // Сохраняем в localStorage
                Object.entries(theme.colors).forEach(([k, v]) => localStorage.setItem('mrcomic-custom-'+k, v));
                if (theme.font) localStorage.setItem('mrcomic-custom--ctp-font', theme.font);
                if (theme.radius) localStorage.setItem('mrcomic-custom--ctp-radius', theme.radius);
                alert('Тема применена!');
            };
            row.appendChild(applyBtn);
            panel.appendChild(row);
        });
        // Импорт темы из файла
        const importBtn = document.createElement('button');
        importBtn.textContent = 'Принять тему (импорт из файла)';
        importBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const theme = JSON.parse(ev.target.result);
                        if (theme && theme.colors) {
                            this.communityThemes = this.communityThemes || [];
                            this.communityThemes.push(theme);
                            localStorage.setItem('mrcomic-community-themes', JSON.stringify(this.communityThemes));
                            this.renderCustomization(panel.parentElement);
                            alert('Тема сообщества добавлена!');
                        } else {
                            alert('Некорректный формат темы.');
                        }
                    } catch (e) {
                        alert('Ошибка импорта: ' + e.message);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
        panel.appendChild(importBtn);
        // Загрузка тем из localStorage
        const saved = localStorage.getItem('mrcomic-community-themes');
        if (saved) this.communityThemes = JSON.parse(saved);
    }

    renderEinkSettings(panel) {
        panel.innerHTML = '<b>Режим E-ink (максимальная читаемость для электронных чернил)</b><br>';
        const einkSwitch = document.createElement('label');
        einkSwitch.innerHTML = `<input type="checkbox" ${localStorage.getItem('mrcomic-eink')==='1' ? 'checked' : ''}> Включить режим E-ink`;
        einkSwitch.querySelector('input').onchange = (e) => {
            if (e.target.checked) {
                document.documentElement.style.setProperty('--ctp-surface', '#fff');
                document.documentElement.style.setProperty('--ctp-on-surface', '#000');
                document.documentElement.style.setProperty('--ctp-primary', '#000');
                document.documentElement.style.setProperty('--ctp-shadow', 'none');
                document.documentElement.style.setProperty('--ctp-outline', '#000');
                document.documentElement.style.setProperty('--ctp-radius', '0px');
                document.documentElement.style.setProperty('--ctp-font', 'serif');
                document.documentElement.style.setProperty('--ctp-overlay-bg', '#fff');
                document.documentElement.style.setProperty('--ctp-overlay-text', '#000');
                document.documentElement.style.setProperty('--ctp-overlay-border', '#000');
                document.body.classList.add('eink-mode');
                localStorage.setItem('mrcomic-eink', '1');
            } else {
                localStorage.setItem('mrcomic-eink', '');
                document.body.classList.remove('eink-mode');
                // Применить тему по умолчанию
                this.applyThemeVars(localStorage.getItem('mrcomic-theme')||'dark');
            }
        };
        panel.appendChild(einkSwitch);
        const desc = document.createElement('div');
        desc.style.marginTop = '10px';
        desc.style.color = '#888';
        desc.textContent = 'В этом режиме отключаются тени, анимации, используются только чёрно-белые цвета и шрифт с засечками.';
        panel.appendChild(desc);
    }

    applyThemeVars(scheme) {
        if (scheme === 'dark') {
            document.documentElement.style.setProperty('--ctp-primary', '#d0bcff');
            document.documentElement.style.setProperty('--ctp-surface', '#1c1b1f');
            document.documentElement.style.setProperty('--ctp-on-surface', '#e6e1e5');
        } else {
            document.documentElement.style.setProperty('--ctp-primary', '#6750a4');
            document.documentElement.style.setProperty('--ctp-surface', '#f5f3ff');
            document.documentElement.style.setProperty('--ctp-on-surface', '#1c1b1f');
        }
    }
}

module.exports = SettingsPanel; 