/**
 * SyncUI.js
 * 
 * Пользовательский интерфейс для управления синхронизацией в приложении Mr.Comic.
 * Предоставляет диалоговые окна и элементы управления для синхронизации данных.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const SyncManager = require('./SyncManager');

class SyncUI {
  /**
   * Создает экземпляр пользовательского интерфейса для синхронизации
   * @param {Object} syncManager - Экземпляр менеджера синхронизации
   * @param {Object} options - Параметры инициализации
   */
  constructor(syncManager, options = {}) {
    this.syncManager = syncManager || new SyncManager();
    
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
    const styleId = 'sync-ui-styles';
    
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
      .sync-dialog-overlay {
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
      
      .sync-dialog {
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
      
      .sync-dialog-header {
        padding: 16px;
        border-bottom: 1px solid ${borderColor};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .sync-dialog-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .sync-dialog-close {
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
      
      .sync-dialog-content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }
      
      .sync-dialog-footer {
        padding: 16px;
        border-top: 1px solid ${borderColor};
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      
      .sync-button {
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid ${borderColor};
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${textColor};
        cursor: pointer;
        font-size: 14px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .sync-button:hover {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
      }
      
      .sync-button.primary {
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: white;
        border-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .sync-button.primary:hover {
        background-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .sync-form-group {
        margin-bottom: 16px;
      }
      
      .sync-form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .sync-form-input,
      .sync-form-select,
      .sync-form-textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#fff'};
        color: ${textColor};
        font-size: 14px;
      }
      
      .sync-form-textarea {
        min-height: 150px;
        font-family: monospace;
      }
      
      .sync-form-checkbox {
        margin-right: 8px;
      }
      
      .sync-form-help {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
        margin-top: 4px;
      }
      
      .sync-message {
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .sync-message.success {
        background-color: ${isDarkMode ? '#143d14' : '#d4edda'};
        color: ${isDarkMode ? '#8fd48f' : '#155724'};
        border: 1px solid ${isDarkMode ? '#1e541e' : '#c3e6cb'};
      }
      
      .sync-message.error {
        background-color: ${isDarkMode ? '#4d1a1a' : '#f8d7da'};
        color: ${isDarkMode ? '#f5a9a9' : '#721c24'};
        border: 1px solid ${isDarkMode ? '#692424' : '#f5c6cb'};
      }
      
      .sync-message.warning {
        background-color: ${isDarkMode ? '#4d3d10' : '#fff3cd'};
        color: ${isDarkMode ? '#f5d88f' : '#856404'};
        border: 1px solid ${isDarkMode ? '#6d5616' : '#ffeeba'};
      }
      
      .sync-message.info {
        background-color: ${isDarkMode ? '#1a3c4d' : '#d1ecf1'};
        color: ${isDarkMode ? '#8fc5d4' : '#0c5460'};
        border: 1px solid ${isDarkMode ? '#245669' : '#bee5eb'};
      }
      
      .sync-progress {
        margin-bottom: 16px;
      }
      
      .sync-progress-bar {
        height: 8px;
        background-color: ${isDarkMode ? '#333' : '#e9ecef'};
        border-radius: 4px;
        overflow: hidden;
      }
      
      .sync-progress-bar-fill {
        height: 100%;
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        transition: ${isEInkMode ? 'none' : 'width 0.3s ease'};
      }
      
      .sync-progress-text {
        font-size: 12px;
        text-align: center;
        margin-top: 4px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      .sync-status {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding: 8px;
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
      }
      
      .sync-status-icon {
        margin-right: 8px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }
      
      .sync-status-icon.success {
        background-color: ${isDarkMode ? '#28a745' : '#28a745'};
      }
      
      .sync-status-icon.error {
        background-color: ${isDarkMode ? '#dc3545' : '#dc3545'};
      }
      
      .sync-status-icon.warning {
        background-color: ${isDarkMode ? '#ffc107' : '#ffc107'};
      }
      
      .sync-status-icon.info {
        background-color: ${isDarkMode ? '#17a2b8' : '#17a2b8'};
      }
      
      .sync-status-icon.syncing {
        background-color: ${isDarkMode ? '#007bff' : '#007bff'};
        animation: ${isEInkMode ? 'none' : 'pulse 1.5s infinite'};
      }
      
      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }
      
      .sync-status-text {
        flex: 1;
      }
      
      .sync-status-time {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      @media (max-width: 768px) {
        .sync-dialog {
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
      // Ctrl+S или Cmd+S для синхронизации
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.showSyncDialog();
      }
    });
  }
  
  /**
   * Отображение диалогового окна синхронизации
   */
  showSyncDialog() {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'sync-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'sync-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'sync-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'sync-dialog-title';
    title.textContent = 'Синхронизация данных';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'sync-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'sync-dialog-content';
    
    // Статус синхронизации
    const statusSection = document.createElement('div');
    statusSection.className = 'sync-form-group';
    
    const statusLabel = document.createElement('div');
    statusLabel.className = 'sync-form-label';
    statusLabel.textContent = 'Статус синхронизации:';
    
    const statusContainer = document.createElement('div');
    statusContainer.className = 'sync-status';
    
    const statusIcon = document.createElement('div');
    statusIcon.className = 'sync-status-icon info';
    
    const statusText = document.createElement('div');
    statusText.className = 'sync-status-text';
    
    const lastSyncTime = this.syncManager.getLastSyncTime();
    if (lastSyncTime) {
      statusText.textContent = 'Последняя синхронизация:';
      
      const statusTime = document.createElement('div');
      statusTime.className = 'sync-status-time';
      statusTime.textContent = lastSyncTime.toLocaleString();
      
      statusText.appendChild(statusTime);
    } else {
      statusText.textContent = 'Синхронизация еще не выполнялась';
    }
    
    statusContainer.appendChild(statusIcon);
    statusContainer.appendChild(statusText);
    
    statusSection.appendChild(statusLabel);
    statusSection.appendChild(statusContainer);
    
    // Форма синхронизации
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSync(form);
    });
    
    // Выбор стратегии разрешения конфликтов
    const strategyGroup = document.createElement('div');
    strategyGroup.className = 'sync-form-group';
    
    const strategyLabel = document.createElement('label');
    strategyLabel.className = 'sync-form-label';
    strategyLabel.textContent = 'Стратегия разрешения конфликтов:';
    
    const strategySelect = document.createElement('select');
    strategySelect.className = 'sync-form-select';
    strategySelect.name = 'conflictResolution';
    
    const strategies = [
      { value: 'newest', text: 'Использовать новейшую версию' },
      { value: 'local', text: 'Предпочитать локальные данные' },
      { value: 'remote', text: 'Предпочитать удаленные данные' }
    ];
    
    strategies.forEach(strategy => {
      const option = document.createElement('option');
      option.value = strategy.value;
      option.textContent = strategy.text;
      strategySelect.appendChild(option);
    });
    
    strategyGroup.appendChild(strategyLabel);
    strategyGroup.appendChild(strategySelect);
    
    // Данные для синхронизации
    const dataGroup = document.createElement('div');
    dataGroup.className = 'sync-form-group';
    
    const dataLabel = document.createElement('label');
    dataLabel.className = 'sync-form-label';
    dataLabel.textContent = 'Данные для синхронизации:';
    
    const dataTextarea = document.createElement('textarea');
    dataTextarea.className = 'sync-form-textarea';
    dataTextarea.name = 'data';
    dataTextarea.placeholder = 'Вставьте JSON-данные для синхронизации или перетащите файл сюда';
    
    const dataHelp = document.createElement('div');
    dataHelp.className = 'sync-form-help';
    dataHelp.textContent = 'Вы можете вставить данные напрямую или перетащить файл в поле выше.';
    
    dataGroup.appendChild(dataLabel);
    dataGroup.appendChild(dataTextarea);
    dataGroup.appendChild(dataHelp);
    
    // Кнопка экспорта
    const exportGroup = document.createElement('div');
    exportGroup.className = 'sync-form-group';
    
    const exportButton = document.createElement('button');
    exportButton.className = 'sync-button';
    exportButton.type = 'button';
    exportButton.textContent = 'Экспортировать текущие данные';
    exportButton.addEventListener('click', () => {
      this.handleExport();
    });
    
    exportGroup.appendChild(exportButton);
    
    form.appendChild(statusSection);
    form.appendChild(strategyGroup);
    form.appendChild(dataGroup);
    form.appendChild(exportGroup);
    
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
    footer.className = 'sync-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'sync-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const syncButton = document.createElement('button');
    syncButton.className = 'sync-button primary';
    syncButton.type = 'submit';
    syncButton.textContent = 'Синхронизировать';
    syncButton.addEventListener('click', () => {
      form.dispatchEvent(new Event('submit'));
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(syncButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Обработка синхронизации данных
   * @param {HTMLFormElement} form - Форма синхронизации
   */
  async handleSync(form) {
    const conflictResolution = form.conflictResolution.value;
    const data = form.data.value;
    
    if (!data) {
      this.showSyncMessage(form, 'error', 'Данные для синхронизации не указаны');
      return;
    }
    
    try {
      // Проверяем формат данных
      const jsonData = JSON.parse(data);
      if (!jsonData.bookmarks || !jsonData.annotations) {
        this.showSyncMessage(form, 'error', 'Неверный формат данных для синхронизации');
        return;
      }
      
      // Обновляем статус
      const statusContainer = form.querySelector('.sync-status');
      const statusIcon = statusContainer.querySelector('.sync-status-icon');
      const statusText = statusContainer.querySelector('.sync-status-text');
      
      statusIcon.className = 'sync-status-icon syncing';
      statusText.textContent = 'Выполняется синхронизация...';
      
      // Выполняем синхронизацию
      const result = await this.syncManager.syncWithJSON(data, {
        conflictResolution: conflictResolution
      });
      
      if (result.success) {
        // Обновляем статус
        statusIcon.className = 'sync-status-icon success';
        statusText.textContent = 'Синхронизация успешно завершена';
        
        const statusTime = document.createElement('div');
        statusTime.className = 'sync-status-time';
        statusTime.textContent = result.timestamp.toLocaleString();
        
        statusText.appendChild(statusTime);
        
        // Показываем сообщение об успехе
        this.showSyncMessage(form, 'success', `Синхронизация успешно завершена. Закладок: ${result.bookmarksCount}, аннотаций: ${result.annotationsCount}`);
        
        // Закрываем диалог через 2 секунды
        setTimeout(() => {
          const overlay = document.querySelector('.sync-dialog-overlay');
          if (overlay) {
            document.body.removeChild(overlay);
          }
        }, 2000);
      } else {
        // Обновляем статус
        statusIcon.className = 'sync-status-icon error';
        statusText.textContent = 'Ошибка при синхронизации';
        
        // Показываем сообщение об ошибке
        this.showSyncMessage(form, 'error', `Ошибка при синхронизации: ${result.message}`);
      }
    } catch (error) {
      console.error('Ошибка при синхронизации:', error);
      this.showSyncMessage(form, 'error', `Ошибка при синхронизации: ${error.message}`);
    }
  }
  
  /**
   * Обработка экспорта данных
   */
  handleExport() {
    try {
      const exportData = this.syncManager.exportToJSON();
      
      // Создаем ссылку для скачивания
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `mr-comic-sync-data_${new Date().toISOString().slice(0, 10)}.json`;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Очистка
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      
      // Показываем сообщение об ошибке
      const overlay = document.querySelector('.sync-dialog-overlay');
      if (overlay) {
        const form = overlay.querySelector('form');
        this.showSyncMessage(form, 'error', `Ошибка при экспорте данных: ${error.message}`);
      }
    }
  }
  
  /**
   * Отображение сообщения при синхронизации
   * @param {HTMLFormElement} form - Форма синхронизации
   * @param {string} type - Тип сообщения ('success', 'error', 'warning', 'info')
   * @param {string} text - Текст сообщения
   */
  showSyncMessage(form, type, text) {
    // Удаляем предыдущие сообщения
    const previousMessages = form.querySelectorAll('.sync-message');
    previousMessages.forEach(message => {
      message.parentNode.removeChild(message);
    });
    
    // Создаем новое сообщение
    const message = document.createElement('div');
    message.className = `sync-message ${type}`;
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
  module.exports = SyncUI;
}
