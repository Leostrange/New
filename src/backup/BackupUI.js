/**
 * BackupUI.js
 * 
 * Пользовательский интерфейс для управления резервными копиями в приложении Mr.Comic.
 * Предоставляет диалоговые окна и элементы управления для работы с резервными копиями.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const BackupManager = require('./BackupManager');

class BackupUI {
  /**
   * Создает экземпляр пользовательского интерфейса для резервных копий
   * @param {Object} backupManager - Экземпляр менеджера резервных копий
   * @param {Object} options - Параметры инициализации
   */
  constructor(backupManager, options = {}) {
    this.backupManager = backupManager || new BackupManager();
    
    this.options = Object.assign({
      parentElement: document.body,
      theme: { mode: 'light' },
      isEInkMode: false
    }, options);
    
    this.theme = this.options.theme;
    this.isEInkMode = this.options.isEInkMode;
    
    this.init();
  }
  
  /**
   * Инициализация пользовательского интерфейса
   */
  init() {
    this.createStyles();
    this.registerHotkeys();
  }
  
  /**
   * Создание стилей компонента
   */
  createStyles() {
    const styleId = 'backup-ui-styles';
    
    // Проверяем, не добавлены ли уже стили
    if (document.getElementById(styleId)) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    
    const isDarkMode = this.theme.mode === 'dark';
    const isEInkMode = this.isEInkMode;
    
    const bgColor = isDarkMode ? '#222' : (isEInkMode ? '#fff' : '#f5f5f5');
    const textColor = isDarkMode ? '#eee' : (isEInkMode ? '#000' : '#333');
    const borderColor = isDarkMode ? '#444' : (isEInkMode ? '#000' : '#ddd');
    const overlayColor = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
    
    style.textContent = `
      .backup-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${overlayColor};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      
      .backup-dialog {
        background-color: ${bgColor};
        color: ${textColor};
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: ${isEInkMode ? 'none' : 'all 0.2s ease'};
      }
      
      .backup-dialog-header {
        padding: 16px;
        border-bottom: 1px solid ${borderColor};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .backup-dialog-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .backup-dialog-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: ${textColor};
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .backup-dialog-content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }
      
      .backup-dialog-footer {
        padding: 16px;
        border-top: 1px solid ${borderColor};
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      
      .backup-button {
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid ${borderColor};
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${textColor};
        cursor: pointer;
        font-size: 14px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .backup-button:hover {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
      }
      
      .backup-button.primary {
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: white;
        border-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .backup-button.primary:hover {
        background-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .backup-button.danger {
        background-color: ${isDarkMode ? '#bd2130' : '#dc3545'};
        color: white;
        border-color: ${isDarkMode ? '#a71d2a' : '#c82333'};
      }
      
      .backup-button.danger:hover {
        background-color: ${isDarkMode ? '#a71d2a' : '#c82333'};
      }
      
      .backup-form-group {
        margin-bottom: 16px;
      }
      
      .backup-form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .backup-form-input,
      .backup-form-select,
      .backup-form-textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#fff'};
        color: ${textColor};
        font-size: 14px;
      }
      
      .backup-form-textarea {
        min-height: 150px;
        font-family: monospace;
      }
      
      .backup-form-checkbox {
        margin-right: 8px;
      }
      
      .backup-form-help {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
        margin-top: 4px;
      }
      
      .backup-message {
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .backup-message.success {
        background-color: ${isDarkMode ? '#143d14' : '#d4edda'};
        color: ${isDarkMode ? '#8fd48f' : '#155724'};
        border: 1px solid ${isDarkMode ? '#1e541e' : '#c3e6cb'};
      }
      
      .backup-message.error {
        background-color: ${isDarkMode ? '#4d1a1a' : '#f8d7da'};
        color: ${isDarkMode ? '#f5a9a9' : '#721c24'};
        border: 1px solid ${isDarkMode ? '#692424' : '#f5c6cb'};
      }
      
      .backup-message.warning {
        background-color: ${isDarkMode ? '#4d3d10' : '#fff3cd'};
        color: ${isDarkMode ? '#f5d88f' : '#856404'};
        border: 1px solid ${isDarkMode ? '#6d5616' : '#ffeeba'};
      }
      
      .backup-message.info {
        background-color: ${isDarkMode ? '#1a3c4d' : '#d1ecf1'};
        color: ${isDarkMode ? '#8fc5d4' : '#0c5460'};
        border: 1px solid ${isDarkMode ? '#245669' : '#bee5eb'};
      }
      
      .backup-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .backup-list-item {
        padding: 12px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .backup-list-item:hover {
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
      }
      
      .backup-list-item-info {
        flex: 1;
      }
      
      .backup-list-item-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .backup-list-item-date {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      .backup-list-item-size {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      .backup-list-item-actions {
        display: flex;
        gap: 8px;
      }
      
      .backup-list-item-button {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid ${borderColor};
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${textColor};
        cursor: pointer;
        font-size: 12px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .backup-list-item-button:hover {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
      }
      
      .backup-list-item-button.restore {
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: white;
        border-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .backup-list-item-button.restore:hover {
        background-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .backup-list-item-button.delete {
        background-color: ${isDarkMode ? '#bd2130' : '#dc3545'};
        color: white;
        border-color: ${isDarkMode ? '#a71d2a' : '#c82333'};
      }
      
      .backup-list-item-button.delete:hover {
        background-color: ${isDarkMode ? '#a71d2a' : '#c82333'};
      }
      
      .backup-empty {
        text-align: center;
        padding: 24px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      @media (max-width: 768px) {
        .backup-dialog {
          width: 95%;
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Регистрация горячих клавиш
   */
  registerHotkeys() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+B или Cmd+B для создания резервной копии
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !e.shiftKey) {
        e.preventDefault();
        this.showCreateBackupDialog();
      }
      
      // Ctrl+Shift+B или Cmd+Shift+B для восстановления из резервной копии
      if ((e.ctrlKey || e.metaKey) && e.key === 'B' && e.shiftKey) {
        e.preventDefault();
        this.showManageBackupsDialog();
      }
    });
  }
  
  /**
   * Отображение диалогового окна создания резервной копии
   * @param {Object} data - Данные для резервного копирования
   */
  showCreateBackupDialog(data = null) {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'backup-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'backup-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'backup-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'backup-dialog-title';
    title.textContent = 'Создание резервной копии';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'backup-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'backup-dialog-content';
    
    // Форма создания резервной копии
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateBackup(form, data);
    });
    
    // Название резервной копии
    const nameGroup = document.createElement('div');
    nameGroup.className = 'backup-form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.className = 'backup-form-label';
    nameLabel.textContent = 'Название резервной копии:';
    
    const nameInput = document.createElement('input');
    nameInput.className = 'backup-form-input';
    nameInput.name = 'name';
    nameInput.value = `Резервная копия от ${new Date().toLocaleString()}`;
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Информация о данных
    const infoGroup = document.createElement('div');
    infoGroup.className = 'backup-form-group';
    
    const infoMessage = document.createElement('div');
    infoMessage.className = 'backup-message info';
    infoMessage.textContent = 'Резервная копия будет содержать прогресс чтения, закладки, аннотации и настройки приложения.';
    
    infoGroup.appendChild(infoMessage);
    
    form.appendChild(nameGroup);
    form.appendChild(infoGroup);
    
    content.appendChild(form);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'backup-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'backup-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const createButton = document.createElement('button');
    createButton.className = 'backup-button primary';
    createButton.type = 'submit';
    createButton.textContent = 'Создать';
    createButton.addEventListener('click', () => {
      form.dispatchEvent(new Event('submit'));
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(createButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Обработка создания резервной копии
   * @param {HTMLFormElement} form - Форма создания резервной копии
   * @param {Object} data - Данные для резервного копирования
   */
  handleCreateBackup(form, data) {
    const name = form.name.value;
    
    try {
      // Если данные не переданы, получаем их из приложения
      const backupData = data || this.getAppData();
      
      // Создаем резервную копию
      const backup = this.backupManager.createBackup(backupData, name);
      
      if (backup) {
        // Показываем сообщение об успехе
        this.showBackupMessage(form, 'success', 'Резервная копия успешно создана');
        
        // Закрываем диалог через 2 секунды
        setTimeout(() => {
          const overlay = document.querySelector('.backup-dialog-overlay');
          if (overlay) {
            document.body.removeChild(overlay);
          }
        }, 2000);
      } else {
        // Показываем сообщение об ошибке
        this.showBackupMessage(form, 'error', 'Не удалось создать резервную копию');
      }
    } catch (error) {
      console.error('Ошибка при создании резервной копии:', error);
      this.showBackupMessage(form, 'error', `Ошибка при создании резервной копии: ${error.message}`);
    }
  }
  
  /**
   * Отображение диалогового окна управления резервными копиями
   */
  showManageBackupsDialog() {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'backup-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'backup-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'backup-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'backup-dialog-title';
    title.textContent = 'Управление резервными копиями';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'backup-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'backup-dialog-content';
    
    // Получаем список резервных копий
    const backupsList = this.backupManager.getBackupsList();
    
    if (backupsList.length > 0) {
      // Создаем список резервных копий
      const list = document.createElement('ul');
      list.className = 'backup-list';
      
      backupsList.forEach(backup => {
        const listItem = document.createElement('li');
        listItem.className = 'backup-list-item';
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'backup-list-item-info';
        
        const itemName = document.createElement('div');
        itemName.className = 'backup-list-item-name';
        itemName.textContent = backup.name;
        
        const itemDate = document.createElement('div');
        itemDate.className = 'backup-list-item-date';
        itemDate.textContent = new Date(backup.timestamp).toLocaleString();
        
        const itemSize = document.createElement('div');
        itemSize.className = 'backup-list-item-size';
        itemSize.textContent = `Размер: ${this.formatSize(backup.size)}`;
        
        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemDate);
        itemInfo.appendChild(itemSize);
        
        const itemActions = document.createElement('div');
        itemActions.className = 'backup-list-item-actions';
        
        const restoreButton = document.createElement('button');
        restoreButton.className = 'backup-list-item-button restore';
        restoreButton.textContent = 'Восстановить';
        restoreButton.addEventListener('click', () => {
          this.showRestoreConfirmDialog(backup.id, overlay);
        });
        
        const exportButton = document.createElement('button');
        exportButton.className = 'backup-list-item-button';
        exportButton.textContent = 'Экспорт';
        exportButton.addEventListener('click', () => {
          this.handleExportBackup(backup.id);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'backup-list-item-button delete';
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => {
          this.showDeleteConfirmDialog(backup.id, listItem);
        });
        
        itemActions.appendChild(restoreButton);
        itemActions.appendChild(exportButton);
        itemActions.appendChild(deleteButton);
        
        listItem.appendChild(itemInfo);
        listItem.appendChild(itemActions);
        
        list.appendChild(listItem);
      });
      
      content.appendChild(list);
    } else {
      // Показываем сообщение, если нет резервных копий
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'backup-empty';
      emptyMessage.textContent = 'Нет доступных резервных копий';
      
      content.appendChild(emptyMessage);
    }
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'backup-dialog-footer';
    
    const closeFooterButton = document.createElement('button');
    closeFooterButton.className = 'backup-button';
    closeFooterButton.type = 'button';
    closeFooterButton.textContent = 'Закрыть';
    closeFooterButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const createButton = document.createElement('button');
    createButton.className = 'backup-button primary';
    createButton.type = 'button';
    createButton.textContent = 'Создать новую';
    createButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      this.showCreateBackupDialog();
    });
    
    const importButton = document.createElement('button');
    importButton.className = 'backup-button';
    importButton.type = 'button';
    importButton.textContent = 'Импорт';
    importButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      this.showImportBackupDialog();
    });
    
    footer.appendChild(closeFooterButton);
    footer.appendChild(importButton);
    footer.appendChild(createButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Отображение диалогового окна подтверждения восстановления из резервной копии
   * @param {string} backupId - ID резервной копии
   * @param {HTMLElement} parentOverlay - Родительский оверлей
   */
  showRestoreConfirmDialog(backupId, parentOverlay) {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'backup-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'backup-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'backup-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'backup-dialog-title';
    title.textContent = 'Подтверждение восстановления';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'backup-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'backup-dialog-content';
    
    const warningMessage = document.createElement('div');
    warningMessage.className = 'backup-message warning';
    warningMessage.textContent = 'Вы уверены, что хотите восстановить данные из этой резервной копии? Текущие данные будут заменены.';
    
    content.appendChild(warningMessage);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'backup-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'backup-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'backup-button primary';
    confirmButton.type = 'button';
    confirmButton.textContent = 'Восстановить';
    confirmButton.addEventListener('click', () => {
      this.handleRestoreBackup(backupId);
      document.body.removeChild(overlay);
      
      // Закрываем родительский оверлей
      if (parentOverlay && parentOverlay.parentNode) {
        document.body.removeChild(parentOverlay);
      }
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Отображение диалогового окна подтверждения удаления резервной копии
   * @param {string} backupId - ID резервной копии
   * @param {HTMLElement} listItem - Элемент списка резервных копий
   */
  showDeleteConfirmDialog(backupId, listItem) {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'backup-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'backup-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'backup-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'backup-dialog-title';
    title.textContent = 'Подтверждение удаления';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'backup-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'backup-dialog-content';
    
    const warningMessage = document.createElement('div');
    warningMessage.className = 'backup-message warning';
    warningMessage.textContent = 'Вы уверены, что хотите удалить эту резервную копию? Это действие нельзя отменить.';
    
    content.appendChild(warningMessage);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'backup-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'backup-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'backup-button danger';
    confirmButton.type = 'button';
    confirmButton.textContent = 'Удалить';
    confirmButton.addEventListener('click', () => {
      const result = this.backupManager.deleteBackup(backupId);
      
      if (result && listItem && listItem.parentNode) {
        listItem.parentNode.removeChild(listItem);
        
        // Проверяем, остались ли еще резервные копии
        const list = document.querySelector('.backup-list');
        if (list && list.children.length === 0) {
          const content = list.parentNode;
          content.removeChild(list);
          
          const emptyMessage = document.createElement('div');
          emptyMessage.className = 'backup-empty';
          emptyMessage.textContent = 'Нет доступных резервных копий';
          
          content.appendChild(emptyMessage);
        }
      }
      
      document.body.removeChild(overlay);
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Отображение диалогового окна импорта резервной копии
   */
  showImportBackupDialog() {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'backup-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'backup-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'backup-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'backup-dialog-title';
    title.textContent = 'Импорт резервной копии';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'backup-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'backup-dialog-content';
    
    // Форма импорта резервной копии
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleImportBackup(form);
    });
    
    // Название резервной копии
    const nameGroup = document.createElement('div');
    nameGroup.className = 'backup-form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.className = 'backup-form-label';
    nameLabel.textContent = 'Название резервной копии:';
    
    const nameInput = document.createElement('input');
    nameInput.className = 'backup-form-input';
    nameInput.name = 'name';
    nameInput.value = `Импортированная копия от ${new Date().toLocaleString()}`;
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Данные для импорта
    const dataGroup = document.createElement('div');
    dataGroup.className = 'backup-form-group';
    
    const dataLabel = document.createElement('label');
    dataLabel.className = 'backup-form-label';
    dataLabel.textContent = 'Данные для импорта:';
    
    const dataTextarea = document.createElement('textarea');
    dataTextarea.className = 'backup-form-textarea';
    dataTextarea.name = 'data';
    dataTextarea.placeholder = 'Вставьте JSON-данные для импорта или перетащите файл сюда';
    
    const dataHelp = document.createElement('div');
    dataHelp.className = 'backup-form-help';
    dataHelp.textContent = 'Вы можете вставить данные напрямую или перетащить файл в поле выше.';
    
    dataGroup.appendChild(dataLabel);
    dataGroup.appendChild(dataTextarea);
    dataGroup.appendChild(dataHelp);
    
    form.appendChild(nameGroup);
    form.appendChild(dataGroup);
    
    // Обработка перетаскивания файлов
    dataTextarea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dataTextarea.style.borderColor = '#007bff';
    });
    
    dataTextarea.addEventListener('dragleave', () => {
      dataTextarea.style.borderColor = '';
    });
    
    dataTextarea.addEventListener('drop', (e) => {
      e.preventDefault();
      dataTextarea.style.borderColor = '';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          dataTextarea.value = event.target.result;
        };
        reader.readAsText(file);
      }
    });
    
    content.appendChild(form);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'backup-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'backup-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const importButton = document.createElement('button');
    importButton.className = 'backup-button primary';
    importButton.type = 'submit';
    importButton.textContent = 'Импортировать';
    importButton.addEventListener('click', () => {
      form.dispatchEvent(new Event('submit'));
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(importButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Обработка импорта резервной копии
   * @param {HTMLFormElement} form - Форма импорта резервной копии
   */
  handleImportBackup(form) {
    const name = form.name.value;
    const data = form.data.value;
    
    if (!data) {
      this.showBackupMessage(form, 'error', 'Данные для импорта не указаны');
      return;
    }
    
    try {
      // Импортируем резервную копию
      const backup = this.backupManager.importBackup(data, name);
      
      if (backup) {
        // Показываем сообщение об успехе
        this.showBackupMessage(form, 'success', 'Резервная копия успешно импортирована');
        
        // Закрываем диалог через 2 секунды
        setTimeout(() => {
          const overlay = document.querySelector('.backup-dialog-overlay');
          if (overlay) {
            document.body.removeChild(overlay);
          }
        }, 2000);
      } else {
        // Показываем сообщение об ошибке
        this.showBackupMessage(form, 'error', 'Не удалось импортировать резервную копию');
      }
    } catch (error) {
      console.error('Ошибка при импорте резервной копии:', error);
      this.showBackupMessage(form, 'error', `Ошибка при импорте резервной копии: ${error.message}`);
    }
  }
  
  /**
   * Обработка восстановления из резервной копии
   * @param {string} backupId - ID резервной копии
   */
  handleRestoreBackup(backupId) {
    try {
      // Восстанавливаем данные из резервной копии
      const restoredData = this.backupManager.restoreBackup(backupId);
      
      if (restoredData) {
        // Применяем восстановленные данные к приложению
        this.applyRestoredData(restoredData);
        
        // Показываем сообщение об успехе
        alert('Данные успешно восстановлены из резервной копии');
      } else {
        // Показываем сообщение об ошибке
        alert('Не удалось восстановить данные из резервной копии');
      }
    } catch (error) {
      console.error('Ошибка при восстановлении из резервной копии:', error);
      alert(`Ошибка при восстановлении из резервной копии: ${error.message}`);
    }
  }
  
  /**
   * Обработка экспорта резервной копии
   * @param {string} backupId - ID резервной копии
   */
  handleExportBackup(backupId) {
    try {
      // Экспортируем резервную копию
      const exportData = this.backupManager.exportBackup(backupId);
      
      if (exportData) {
        // Создаем ссылку для скачивания
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `mr-comic-backup_${new Date().toISOString().slice(0, 10)}.json`;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Очистка
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        }, 100);
      } else {
        // Показываем сообщение об ошибке
        alert('Не удалось экспортировать резервную копию');
      }
    } catch (error) {
      console.error('Ошибка при экспорте резервной копии:', error);
      alert(`Ошибка при экспорте резервной копии: ${error.message}`);
    }
  }
  
  /**
   * Отображение сообщения при работе с резервными копиями
   * @param {HTMLFormElement} form - Форма
   * @param {string} type - Тип сообщения ('success', 'error', 'warning', 'info')
   * @param {string} text - Текст сообщения
   */
  showBackupMessage(form, type, text) {
    // Удаляем предыдущие сообщения
    const previousMessages = form.querySelectorAll('.backup-message');
    previousMessages.forEach(message => {
      message.parentNode.removeChild(message);
    });
    
    // Создаем новое сообщение
    const message = document.createElement('div');
    message.className = `backup-message ${type}`;
    message.textContent = text;
    
    // Добавляем сообщение в начало формы
    form.insertBefore(message, form.firstChild);
    
    // Удаляем сообщение через 5 секунд, если это не сообщение об успехе
    if (type !== 'success') {
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 5000);
    }
  }
  
  /**
   * Получение данных приложения для резервного копирования
   * @returns {Object} Данные приложения
   */
  getAppData() {
    // Получаем данные из приложения
    // Этот метод должен быть реализован в соответствии с конкретным приложением
    
    // Пример реализации
    const readingProgress = localStorage.getItem('mr-comic-reading-progress');
    const bookmarks = localStorage.getItem('mr-comic-bookmarks');
    const annotations = localStorage.getItem('mr-comic-annotations');
    const settings = localStorage.getItem('mr-comic-settings');
    
    return {
      readingProgress: readingProgress ? JSON.parse(readingProgress) : [],
      bookmarks: bookmarks ? JSON.parse(bookmarks) : [],
      annotations: annotations ? JSON.parse(annotations) : [],
      settings: settings ? JSON.parse(settings) : {}
    };
  }
  
  /**
   * Применение восстановленных данных к приложению
   * @param {Object} data - Восстановленные данные
   */
  applyRestoredData(data) {
    // Применяем восстановленные данные к приложению
    // Этот метод должен быть реализован в соответствии с конкретным приложением
    
    // Пример реализации
    if (data.readingProgress) {
      localStorage.setItem('mr-comic-reading-progress', JSON.stringify(data.readingProgress));
    }
    
    if (data.bookmarks) {
      localStorage.setItem('mr-comic-bookmarks', JSON.stringify(data.bookmarks));
    }
    
    if (data.annotations) {
      localStorage.setItem('mr-comic-annotations', JSON.stringify(data.annotations));
    }
    
    if (data.settings) {
      localStorage.setItem('mr-comic-settings', JSON.stringify(data.settings));
    }
    
    // Уведомляем приложение о восстановлении данных
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('mr-comic-data-restored', { detail: data }));
    }
  }
  
  /**
   * Форматирование размера в байтах в человекочитаемый формат
   * @param {number} bytes - Размер в байтах
   * @returns {string} Отформатированный размер
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 Байт';
    
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Обновление темы оформления
   * @param {Object} theme - Новые настройки темы
   */
  updateTheme(theme) {
    this.theme = theme || { mode: 'light' };
    this.createStyles();
  }
  
  /**
   * Обновление режима E-Ink
   * @param {boolean} isEInkMode - Флаг режима E-Ink
   */
  updateEInkMode(isEInkMode) {
    this.isEInkMode = isEInkMode;
    this.createStyles();
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackupUI;
}
