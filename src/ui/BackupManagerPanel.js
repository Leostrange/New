// BackupManagerPanel.js
// UI-компонент для резервного копирования и синхронизации пользовательских данных

const BackupManager = require('../backup/BackupManager');
// CloudSyncAdapter должен поддерживать Google Drive и в будущем Dropbox
const CloudSyncAdapter = require('../cloud/GoogleDriveManager');

class BackupManagerPanel {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM-элемент для рендера
     */
    constructor(options) {
        this.container = options.container;
        this.backupManager = new BackupManager();
        this.cloudSync = new CloudSyncAdapter({
            clientId: '', // TODO: вставить OAuth clientId
            apiKey: '',   // TODO: вставить API key
            onAuthSuccess: () => { this.state.auth = true; this.render(); },
            onAuthFailure: () => { this.state.auth = false; this.state.error = 'Ошибка авторизации Google'; this.render(); }
        });
        this.state = {
            status: 'idle', // idle | syncing | error | synced | need_backup
            error: '',
            auth: false,
            lastBackup: null,
            auto: !!localStorage.getItem('mrcomic-backup-auto'),
            history: JSON.parse(localStorage.getItem('mrcomic-backup-history')||'[]')
        };
        this.render();
        // --- Автоматическая синхронизация ---
        if (!window._mrcomic_auto_sync_inited) {
            window._mrcomic_auto_sync_inited = true;
            const doAutoSync = async () => {
                if (localStorage.getItem('mrcomic-backup-auto') === '1') {
                    await this.handleSyncCloud('auto');
                }
            };
            // При запуске
            setTimeout(doAutoSync, 3000);
            // По расписанию (раз в час)
            setInterval(doAutoSync, 60 * 60 * 1000);
        }
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        // Заголовок и статус
        const header = document.createElement('h3');
        header.textContent = 'Резервное копирование и синхронизация';
        this.container.appendChild(header);
        const status = document.createElement('div');
        status.className = 'backup-status';
        status.textContent = {
            idle: 'Ожидание',
            syncing: 'Синхронизация...',
            error: 'Ошибка: ' + this.state.error,
            synced: 'Синхронизировано',
            need_backup: 'Требуется резервная копия'
        }[this.state.status];
        this.container.appendChild(status);
        // Кнопки
        const btnPanel = document.createElement('div');
        btnPanel.className = 'backup-btn-panel';
        // Экспортировать всё
        const btnExportAll = document.createElement('button');
        btnExportAll.textContent = 'Экспортировать всё (JSON)';
        btnExportAll.onclick = async () => {
            const data = this.backupManager.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'mrcomic-full-backup.json';
            a.click();
        };
        btnPanel.appendChild(btnExportAll);
        // Импортировать всё
        const btnImportAll = document.createElement('button');
        btnImportAll.textContent = 'Импортировать всё (JSON)';
        btnImportAll.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        // UI для выбора, что импортировать
                        const dlg = document.createElement('div');
                        dlg.style.position = 'fixed';
                        dlg.style.left = '50%';
                        dlg.style.top = '50%';
                        dlg.style.transform = 'translate(-50%, -50%)';
                        dlg.style.background = '#fff';
                        dlg.style.border = '1px solid #ccc';
                        dlg.style.padding = '24px';
                        dlg.style.zIndex = 10000;
                        dlg.innerHTML = '<h3>Выберите, что импортировать</h3>';
                        const options = [
                            { key: 'profiles', label: 'Профили' },
                            { key: 'userThemes', label: 'Пользовательские темы' },
                            { key: 'settings', label: 'Настройки' },
                            { key: 'readingProgress', label: 'Прогресс' },
                            { key: 'bookmarks', label: 'Закладки' },
                            { key: 'annotations', label: 'Аннотации' }
                        ];
                        const checks = {};
                        options.forEach(opt => {
                            const row = document.createElement('div');
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.checked = !!data[opt.key];
                            checks[opt.key] = cb;
                            row.appendChild(cb);
                            const lbl = document.createElement('span');
                            lbl.textContent = opt.label;
                            row.appendChild(lbl);
                            dlg.appendChild(row);
                        });
                        const okBtn = document.createElement('button');
                        okBtn.textContent = 'Импортировать выбранное';
                        okBtn.onclick = async () => {
                            document.body.removeChild(dlg);
                            // Формируем частичный архив
                            const partial = {};
                            options.forEach(opt => {
                                if (checks[opt.key].checked) partial[opt.key] = data[opt.key];
                            });
                            await this.backupManager.importAll(partial);
                            alert('Импорт завершён!');
                            this.state.status = 'synced';
                            this.render();
                        };
                        dlg.appendChild(okBtn);
                        const cancelBtn = document.createElement('button');
                        cancelBtn.textContent = 'Отмена';
                        cancelBtn.onclick = () => document.body.removeChild(dlg);
                        dlg.appendChild(cancelBtn);
                        document.body.appendChild(dlg);
                    } catch (e) {
                        alert('Ошибка импорта: ' + e.message);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
        btnPanel.appendChild(btnImportAll);
        // Поделиться резервной копией (QR)
        const btnShareQR = document.createElement('button');
        btnShareQR.textContent = 'Поделиться резервной копией (QR)';
        btnShareQR.onclick = async () => {
            const data = this.backupManager.exportAll();
            const json = JSON.stringify(data);
            // Для больших данных QR-код может быть слишком длинным, поэтому делаем data URL
            // Используем стороннюю библиотеку или API для генерации QR (пример: https://api.qrserver.com/v1/create-qr-code/)
            const url = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(json)));
            const qrImg = document.createElement('img');
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
            const dlg = document.createElement('div');
            dlg.style.position = 'fixed';
            dlg.style.left = '50%';
            dlg.style.top = '50%';
            dlg.style.transform = 'translate(-50%, -50%)';
            dlg.style.background = '#fff';
            dlg.style.border = '1px solid #ccc';
            dlg.style.padding = '24px';
            dlg.style.zIndex = 10000;
            dlg.innerHTML = '<h3>QR-код для обмена резервной копией</h3>';
            dlg.appendChild(qrImg);
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Закрыть';
            closeBtn.onclick = () => document.body.removeChild(dlg);
            dlg.appendChild(closeBtn);
            document.body.appendChild(dlg);
        };
        btnPanel.appendChild(btnShareQR);
        // Публикация резервной копии через gist/pastebin
        const btnPublish = document.createElement('button');
        btnPublish.textContent = 'Опубликовать резервную копию (gist/pastebin)';
        btnPublish.onclick = async () => {
            const data = this.backupManager.exportAll();
            const json = JSON.stringify(data, null, 2);
            // Попробуем gist.github.com (анонимно)
            try {
                const resp = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        description: 'Mr.Comic резервная копия',
                        public: false,
                        files: { 'mrcomic-backup.json': { content: json } }
                    })
                });
                const result = await resp.json();
                if (result.html_url) {
                    window.mrcomicToast('Ссылка на gist скопирована в буфер обмена!');
                    navigator.clipboard.writeText(result.html_url);
                    window.open(result.html_url, '_blank');
                } else {
                    throw new Error(result.message || 'Не удалось создать gist');
                }
            } catch (e) {
                // Если gist не сработал — пробуем pastebin (требуется API-ключ)
                const pastebinKey = localStorage.getItem('mrcomic-pastebin-key') || '';
                if (!pastebinKey) {
                    window.mrcomicToast('Ошибка публикации: gist недоступен, а API-ключ pastebin не задан', 'error');
                    return;
                }
                try {
                    const form = new URLSearchParams();
                    form.append('api_dev_key', pastebinKey);
                    form.append('api_option', 'paste');
                    form.append('api_paste_code', json);
                    form.append('api_paste_private', '1');
                    form.append('api_paste_name', 'mrcomic-backup.json');
                    const resp = await fetch('https://pastebin.com/api/api_post.php', {
                        method: 'POST',
                        body: form
                    });
                    const url = await resp.text();
                    if (url.startsWith('http')) {
                        window.mrcomicToast('Ссылка на pastebin скопирована в буфер обмена!');
                        navigator.clipboard.writeText(url);
                        window.open(url, '_blank');
                    } else {
                        throw new Error(url);
                    }
                } catch (e2) {
                    window.mrcomicToast('Ошибка публикации: ' + e2.message, 'error');
                }
            }
        };
        btnPanel.appendChild(btnPublish);
        // Синхронизировать всё с Google Drive
        const btnSyncAll = document.createElement('button');
        btnSyncAll.textContent = 'Синхронизировать всё с Google Drive';
        btnSyncAll.onclick = async () => {
            this.state.status = 'syncing';
            this.render();
            try {
                const data = this.backupManager.exportAll();
                await this.cloudSync.uploadFile(new Blob([JSON.stringify(data)], {type: 'application/json'}), { name: 'mrcomic-full-backup.json' });
                this.state.status = 'synced';
                this.addHistory('Google Drive (всё)', JSON.stringify(data).length);
                this.render();
            } catch (e) {
                this.state.status = 'error';
                this.state.error = e.message;
                this.render();
            }
        };
        btnPanel.appendChild(btnSyncAll);
        // Синхронизировать с Dropbox
        const btnSyncDropbox = document.createElement('button');
        btnSyncDropbox.textContent = 'Синхронизировать с Dropbox';
        btnSyncDropbox.onclick = async () => {
            alert('Синхронизация с Dropbox пока не реализована. Требуется подключить Dropbox API/SDK.');
            // Здесь будет логика DropboxSync.uploadFile(blob, ...)
        };
        btnPanel.appendChild(btnSyncDropbox);
        // Синхронизировать с WebDAV
        const btnSyncWebDAV = document.createElement('button');
        btnSyncWebDAV.textContent = 'Синхронизировать с WebDAV';
        btnSyncWebDAV.onclick = async () => {
            alert('Синхронизация с WebDAV пока не реализована. Требуется подключить WebDAV-клиент.');
            // Здесь будет логика WebDAVSync.uploadFile(blob, ...)
        };
        btnPanel.appendChild(btnSyncWebDAV);
        // Автосохранение
        const autoSwitch = document.createElement('label');
        autoSwitch.innerHTML = `<input type="checkbox" ${this.state.auto ? 'checked' : ''}> Автосохранение`;
        autoSwitch.querySelector('input').onchange = (e) => {
            this.state.auto = e.target.checked;
            localStorage.setItem('mrcomic-backup-auto', this.state.auto ? '1' : '');
        };
        btnPanel.appendChild(autoSwitch);
        // Google Drive
        const gdriveBtn = document.createElement('button');
        gdriveBtn.textContent = this.state.auth ? 'Синхронизировать с Google Drive' : 'Войти через Google';
        gdriveBtn.onclick = () => {
            if (!this.state.auth) this.cloudSync.authorize();
            else this.handleSyncCloud();
        };
        btnPanel.appendChild(gdriveBtn);
        // Dropbox (заглушка)
        const dropboxBtn = document.createElement('button');
        dropboxBtn.textContent = 'Dropbox (скоро)';
        dropboxBtn.disabled = true;
        btnPanel.appendChild(dropboxBtn);
        this.container.appendChild(btnPanel);
        // История резервных копий
        const histTitle = document.createElement('div');
        histTitle.textContent = 'История резервных копий:';
        histTitle.style.marginTop = '16px';
        this.container.appendChild(histTitle);
        const histList = document.createElement('ul');
        (this.state.history||[]).slice(-5).reverse().forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.date} — ${item.type} — ${item.size} байт`;
            histList.appendChild(li);
        });
        this.container.appendChild(histList);
        // --- История синхронизаций ---
        const syncHistTitle = document.createElement('div');
        syncHistTitle.textContent = 'История синхронизаций:';
        syncHistTitle.style.marginTop = '16px';
        this.container.appendChild(syncHistTitle);
        const syncHistList = document.createElement('ul');
        const syncHistory = JSON.parse(localStorage.getItem('mrcomic-sync-history')||'[]');
        syncHistory.slice(-5).reverse().forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.date} — ${item.type} — ${item.service} — ${item.status} — ${item.size||0} байт`;
            syncHistList.appendChild(li);
        });
        this.container.appendChild(syncHistList);
        // --- Лог событий ---
        const logTitle = document.createElement('div');
        logTitle.textContent = 'Лог событий:';
        logTitle.style.marginTop = '16px';
        this.container.appendChild(logTitle);
        const logList = document.createElement('ul');
        const logs = JSON.parse(localStorage.getItem('mrcomic-log')||'[]');
        logs.slice(-5).reverse().forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.date} — ${item.level} — ${item.message}`;
            logList.appendChild(li);
        });
        this.container.appendChild(logList);
        // --- Экспорт/импорт отдельных сущностей ---
        const entityPanel = document.createElement('div');
        entityPanel.style.marginTop = '24px';
        entityPanel.innerHTML = '<b>Экспорт/импорт отдельных сущностей:</b>';
        const entities = [
            { key: 'annotations', label: 'Аннотации', storage: 'mr-comic-annotations' },
            { key: 'readingProgress', label: 'Прогресс', storage: 'mr-comic-progress' },
            { key: 'settings', label: 'Настройки', storage: null },
            { key: 'profiles', label: 'Профили', storage: 'mrcomic-profiles' },
            { key: 'userThemes', label: 'Пользовательские темы', storage: 'mrcomic-user-themes' }
        ];
        entities.forEach(ent => {
            const row = document.createElement('div');
            row.style.marginBottom = '6px';
            // Экспорт
            const expBtn = document.createElement('button');
            expBtn.textContent = 'Экспорт ' + ent.label;
            expBtn.onclick = () => {
                let data = null;
                if (ent.storage) {
                    data = localStorage.getItem(ent.storage) || '[]';
                } else if (ent.key === 'settings') {
                    const settings = {};
                    Object.keys(localStorage).forEach(k => {
                        if (k.startsWith('mrcomic-')) settings[k] = localStorage.getItem(k);
                    });
                    data = JSON.stringify(settings, null, 2);
                }
                const blob = new Blob([data], {type: 'application/json'});
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `mrcomic-${ent.key}.json`;
                a.click();
            };
            row.appendChild(expBtn);
            // Импорт
            const impBtn = document.createElement('button');
            impBtn.textContent = 'Импорт ' + ent.label;
            impBtn.onclick = () => {
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
                            if (ent.storage) {
                                localStorage.setItem(ent.storage, JSON.stringify(data));
                            } else if (ent.key === 'settings') {
                                Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
                            }
                            window.mrcomicToast('Импорт завершён!');
                        } catch (e) {
                            window.mrcomicToast('Ошибка импорта: ' + e.message, 'error');
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            };
            row.appendChild(impBtn);
            entityPanel.appendChild(row);
        });
        this.container.appendChild(entityPanel);
        // --- Toast уведомления ---
        window.mrcomicToast = (msg, type='info') => {
            const toast = document.createElement('div');
            toast.textContent = msg;
            toast.style.position = 'fixed';
            toast.style.bottom = '32px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.background = type==='error' ? '#ff4d6d' : '#333';
            toast.style.color = '#fff';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = 10001;
            toast.style.fontSize = '16px';
            document.body.appendChild(toast);
            setTimeout(()=>{ document.body.removeChild(toast); }, 3500);
        };
    }

    async handleExport() {
        const data = await this.backupManager.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mrcomic-backup.json';
        a.click();
        this.addHistory('Экспорт', JSON.stringify(data).length);
    }

    handleImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    await this.backupManager.importAll(data);
                    this.state.status = 'synced';
                    this.addHistory('Импорт', file.size);
                    this.render();
                } catch (e) {
                    this.state.status = 'error';
                    this.state.error = e.message;
                    this.render();
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    async handleSyncCloud(syncType='manual') {
        this.state.status = 'syncing';
        this.render();
        try {
            const data = this.backupManager.exportAll();
            await this.cloudSync.uploadFile(new Blob([JSON.stringify(data)], {type: 'application/json'}), { name: 'mrcomic-full-backup.json' });
            this.state.status = 'synced';
            this.addHistory('Google Drive (всё)', JSON.stringify(data).length);
            // История синхронизаций
            const syncHistory = JSON.parse(localStorage.getItem('mrcomic-sync-history')||'[]');
            syncHistory.push({
                date: new Date().toLocaleString(),
                type: syncType,
                service: 'Google Drive',
                status: 'успех',
                size: JSON.stringify(data).length
            });
            localStorage.setItem('mrcomic-sync-history', JSON.stringify(syncHistory));
            // Лог
            const logs = JSON.parse(localStorage.getItem('mrcomic-log')||'[]');
            logs.push({ date: new Date().toLocaleString(), level: 'info', message: 'Синхронизация с Google Drive успешна' });
            localStorage.setItem('mrcomic-log', JSON.stringify(logs));
            window.mrcomicToast('Синхронизация с Google Drive успешна!');
            this.render();
        } catch (e) {
            this.state.status = 'error';
            this.state.error = e.message;
            // История синхронизаций
            const syncHistory = JSON.parse(localStorage.getItem('mrcomic-sync-history')||'[]');
            syncHistory.push({
                date: new Date().toLocaleString(),
                type: syncType,
                service: 'Google Drive',
                status: 'ошибка',
                size: 0
            });
            localStorage.setItem('mrcomic-sync-history', JSON.stringify(syncHistory));
            // Лог
            const logs = JSON.parse(localStorage.getItem('mrcomic-log')||'[]');
            logs.push({ date: new Date().toLocaleString(), level: 'error', message: 'Ошибка синхронизации: ' + e.message });
            localStorage.setItem('mrcomic-log', JSON.stringify(logs));
            window.mrcomicToast('Ошибка синхронизации: ' + e.message, 'error');
            this.render();
        }
    }

    /**
     * Диалог разрешения конфликта между локальной и облачной версией
     * @param {Object} cloudMeta - Метаданные облачного файла
     * @param {Object} localData - Локальные данные
     * @returns {Promise<boolean>} true = использовать локальную, false = облачную
     */
    handleCloudConflict(cloudMeta, localData) {
        return new Promise((resolve) => {
            const dlg = document.createElement('div');
            dlg.style.position = 'fixed';
            dlg.style.left = '50%';
            dlg.style.top = '50%';
            dlg.style.transform = 'translate(-50%, -50%)';
            dlg.style.background = '#fff';
            dlg.style.border = '1px solid #ccc';
            dlg.style.padding = '24px';
            dlg.style.zIndex = 10000;
            dlg.innerHTML = `<h3>Конфликт версий</h3>
                <p>Обнаружены различия между локальной и облачной резервной копией.<br>
                Локальная: ${new Date(this.backupManager.getLastModified ? this.backupManager.getLastModified() : Date.now()).toLocaleString()}<br>
                Облачная: ${new Date(cloudMeta.modifiedTime).toLocaleString()}<br>
                Какую версию использовать?</p>
                <button id="use-local">Локальную</button>
                <button id="use-cloud">Облачную</button>
                <button id="cancel">Отмена</button>`;
            document.body.appendChild(dlg);
            dlg.querySelector('#use-local').onclick = () => { document.body.removeChild(dlg); resolve(true); };
            dlg.querySelector('#use-cloud').onclick = () => { document.body.removeChild(dlg); resolve(false); };
            dlg.querySelector('#cancel').onclick = () => { document.body.removeChild(dlg); throw new Error('Синхронизация отменена пользователем'); };
        });
    }

    addHistory(type, size) {
        const entry = { date: new Date().toLocaleString(), type, size };
        this.state.history = this.state.history || [];
        this.state.history.push(entry);
        localStorage.setItem('mrcomic-backup-history', JSON.stringify(this.state.history));
    }
}

module.exports = BackupManagerPanel; 