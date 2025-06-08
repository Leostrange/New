// ProfileManager.js
// Модуль для управления профилями настроек

class ProfileManager {
    constructor() {
        this.storageKey = 'mrcomic-profiles';
        this.currentKey = 'mrcomic-current-profile';
        this._profiles = this._loadProfiles();
        this._current = localStorage.getItem(this.currentKey) || (this._profiles[0]?.name || 'Default');
        if (!this._profiles.length) {
            this.createProfile('Default');
        }
    }

    _loadProfiles() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    _saveProfiles() {
        localStorage.setItem(this.storageKey, JSON.stringify(this._profiles));
    }

    getProfiles() {
        return this._profiles.map(p => ({ name: p.name }));
    }

    getCurrentProfileName() {
        return this._current;
    }

    createProfile(name) {
        if (this._profiles.find(p => p.name === name)) throw new Error('Профиль с таким именем уже существует');
        const settings = this._getCurrentSettings();
        this._profiles.push({ name, settings });
        this._saveProfiles();
    }

    deleteProfile(name) {
        if (this._profiles.length === 1) throw new Error('Должен остаться хотя бы один профиль');
        this._profiles = this._profiles.filter(p => p.name !== name);
        if (this._current === name) {
            this._current = this._profiles[0].name;
            localStorage.setItem(this.currentKey, this._current);
            this.applyProfile(this._current);
        }
        this._saveProfiles();
    }

    applyProfile(name) {
        const profile = this._profiles.find(p => p.name === name);
        if (!profile) throw new Error('Профиль не найден');
        this._setCurrentSettings(profile.settings);
        this._current = name;
        localStorage.setItem(this.currentKey, name);
    }

    exportProfile(name) {
        const profile = this._profiles.find(p => p.name === name);
        if (!profile) throw new Error('Профиль не найден');
        return profile;
    }

    importProfile(profile) {
        if (!profile.name || !profile.settings) throw new Error('Некорректный профиль');
        if (this._profiles.find(p => p.name === profile.name)) throw new Error('Профиль с таким именем уже существует');
        this._profiles.push(profile);
        this._saveProfiles();
    }

    _getCurrentSettings() {
        // Здесь должна быть логика получения всех настроек приложения
        // Например:
        return window.mrComicApp ? window.mrComicApp.getAllSettings() : {};
    }

    _setCurrentSettings(settings) {
        // Здесь должна быть логика применения настроек приложения
        // Например:
        if (window.mrComicApp) window.mrComicApp.applySettings(settings);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
} 