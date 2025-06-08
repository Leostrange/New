// ProfileManagerPanel.js
// UI-компонент для управления профилями настроек

const ProfileManager = require('../profile/ProfileManager');

class ProfileManagerPanel {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM-элемент для рендера
     */
    constructor(options) {
        this.container = options.container;
        this.profileManager = new ProfileManager();
        this.state = {
            profiles: this.profileManager.getProfiles(),
            current: this.profileManager.getCurrentProfileName(),
            error: ''
        };
        this.render();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        const header = document.createElement('h3');
        header.textContent = 'Профили настроек';
        this.container.appendChild(header);
        // Список профилей
        const list = document.createElement('ul');
        list.className = 'profile-list';
        this.state.profiles.forEach(profile => {
            const li = document.createElement('li');
            li.textContent = profile.name;
            if (profile.name === this.state.current) li.style.fontWeight = 'bold';
            // Кнопка применить
            const applyBtn = document.createElement('button');
            applyBtn.textContent = 'Применить';
            applyBtn.onclick = () => this.handleApply(profile.name);
            li.appendChild(applyBtn);
            // Кнопка экспорт
            const exportBtn = document.createElement('button');
            exportBtn.textContent = 'Экспорт';
            exportBtn.onclick = () => this.handleExport(profile.name);
            li.appendChild(exportBtn);
            // Кнопка удалить
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Удалить';
            delBtn.onclick = () => this.handleDelete(profile.name);
            li.appendChild(delBtn);
            list.appendChild(li);
        });
        this.container.appendChild(list);
        // Кнопки создать/импорт
        const btnPanel = document.createElement('div');
        btnPanel.className = 'profile-btn-panel';
        const createBtn = document.createElement('button');
        createBtn.textContent = 'Создать профиль';
        createBtn.onclick = () => this.handleCreate();
        btnPanel.appendChild(createBtn);
        const importBtn = document.createElement('button');
        importBtn.textContent = 'Импортировать профиль';
        importBtn.onclick = () => this.handleImport();
        btnPanel.appendChild(importBtn);
        this.container.appendChild(btnPanel);
        // Ошибки
        if (this.state.error) {
            const err = document.createElement('div');
            err.className = 'profile-error';
            err.textContent = this.state.error;
            this.container.appendChild(err);
        }
    }

    handleApply(name) {
        try {
            this.profileManager.applyProfile(name);
            this.state.current = name;
            this.render();
        } catch (e) {
            this.state.error = e.message;
            this.render();
        }
    }
    handleExport(name) {
        try {
            const data = this.profileManager.exportProfile(name);
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${name}-profile.json`;
            a.click();
        } catch (e) {
            this.state.error = e.message;
            this.render();
        }
    }
    handleDelete(name) {
        try {
            this.profileManager.deleteProfile(name);
            this.state.profiles = this.profileManager.getProfiles();
            if (this.state.current === name) this.state.current = this.state.profiles[0]?.name || '';
            this.render();
        } catch (e) {
            this.state.error = e.message;
            this.render();
        }
    }
    handleCreate() {
        const name = prompt('Введите имя нового профиля:');
        if (!name) return;
        try {
            this.profileManager.createProfile(name);
            this.state.profiles = this.profileManager.getProfiles();
            this.render();
        } catch (e) {
            this.state.error = e.message;
            this.render();
        }
    }
    handleImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    this.profileManager.importProfile(data);
                    this.state.profiles = this.profileManager.getProfiles();
                    this.render();
                } catch (e) {
                    this.state.error = e.message;
                    this.render();
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
}

module.exports = ProfileManagerPanel; 