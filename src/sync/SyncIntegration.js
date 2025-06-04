/**
 * SyncIntegration.js
 *
 * Модуль интеграции компонентов синхронизации с основным приложением Mr.Comic.
 * Обеспечивает связь между компонентами синхронизации и основным приложением.
 *
 * @version 1.0.0
 * @author Manus AI
 */

const SyncManager = require('./SyncManager');
const SyncUI = require('./SyncUI');

class SyncIntegration {
  /**
   * Создает экземпляр интеграции компонентов синхронизации
   * @param {Object} app - Экземпляр основного приложения
   * @param {Object} options - Параметры инициализации
   */
  constructor(app, options = {}) {
    this.app = app;
    this.options = Object.assign({
      autoInit: true,
      storageKeyBookmarks: 'mr-comic-bookmarks',
      storageKeyAnnotations: 'mr-comic-annotations'
    }, options);
    
    this.syncManager = null;
    this.syncUI = null;
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  /**
   * Инициализация интеграции
   */
  init() {
    this.initSyncManager();
    this.initSyncUI();
    this.registerAppEvents();
  }
  
  /**
   * Инициализация менеджера синхронизации
   */
  initSyncManager() {
    this.syncManager = new SyncManager({
      storageKeyBookmarks: this.options.storageKeyBookmarks,
      storageKeyAnnotations: this.options.storageKeyAnnotations,
      onSyncStart: this.handleSyncStart.bind(this),
      onSyncComplete: this.handleSyncComplete.bind(this),
      onSyncError: this.handleSyncError.bind(this)
    });
  }
  
  /**
   * Инициализация пользовательского интерфейса синхронизации
   */
  initSyncUI() {
    const theme = this.app.getTheme ? this.app.getTheme() : { mode: 'light' };
    const isEInkMode = this.app.isEInkMode ? this.app.isEInkMode() : false;
    
    this.syncUI = new SyncUI(this.syncManager, {
      parentElement: document.body,
      theme: theme,
      isEInkMode: isEInkMode
    });
  }
  
  /**
   * Регистрация обработчиков событий приложения
   */
  registerAppEvents() {
    // Регистрация события изменения темы
    if (this.app.on && typeof this.app.on === 'function') {
      this.app.on('themeChanged', (theme) => {
        if (this.syncUI) {
          this.syncUI.updateTheme(theme);
        }
      });
      
      this.app.on('eInkModeChanged', (isEInkMode) => {
        if (this.syncUI) {
          this.syncUI.updateEInkMode(isEInkMode);
        }
      });
      
      this.app.on('bookmarksChanged', (bookmarks) => {
        if (this.syncManager) {
          this.syncManager.updateBookmarks(bookmarks);
        }
      });
      
      this.app.on('annotationsChanged', (annotations) => {
        if (this.syncManager) {
          this.syncManager.updateAnnotations(annotations);
        }
      });
    }
    
    // Регистрация горячих клавиш
    document.addEventListener('keydown', (e) => {
      // Ctrl+S или Cmd+S для синхронизации
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.showSyncDialog();
      }
    });
    
    // Добавление кнопок в панель инструментов, если доступно
    if (this.app.addToolbarButton && typeof this.app.addToolbarButton === 'function') {
      this.app.addToolbarButton({
        id: 'sync-button',
        icon: 'sync',
        tooltip: 'Синхронизация',
        onClick: () => this.showSyncDialog()
      });
    }
  }
  
  /**
   * Обработчик начала синхронизации
   */
  handleSyncStart() {
    // Уведомляем приложение о начале синхронизации
    if (this.app.emit && typeof this.app.emit === 'function') {
      this.app.emit('syncStart');
    }
  }
  
  /**
   * Обработчик завершения синхронизации
   * @param {Object} result - Результат синхронизации
   */
  handleSyncComplete(result) {
    // Уведомляем приложение о завершении синхронизации
    if (this.app.emit && typeof this.app.emit === 'function') {
      this.app.emit('syncComplete', result);
    }
  }
  
  /**
   * Обработчик ошибки синхронизации
   * @param {string} error - Сообщение об ошибке
   */
  handleSyncError(error) {
    // Уведомляем приложение об ошибке синхронизации
    if (this.app.emit && typeof this.app.emit === 'function') {
      this.app.emit('syncError', error);
    }
  }
  
  /**
   * Отображение диалогового окна синхронизации
   */
  showSyncDialog() {
    if (this.syncUI) {
      this.syncUI.showSyncDialog();
    }
  }
  
  /**
   * Синхронизация данных с JSON-строкой
   * @param {string} jsonData - JSON-строка с данными для синхронизации
   * @param {Object} options - Параметры синхронизации
   * @returns {Promise<Object>} Результат синхронизации
   */
  async syncWithJSON(jsonData, options) {
    return this.syncManager ? this.syncManager.syncWithJSON(jsonData, options) : {
      success: false,
      message: 'Менеджер синхронизации не инициализирован'
    };
  }
  
  /**
   * Экспорт данных в формате JSON для синхронизации
   * @returns {string} JSON-строка с данными
   */
  exportToJSON() {
    return this.syncManager ? this.syncManager.exportToJSON() : '';
  }
  
  /**
   * Получение времени последней синхронизации
   * @returns {Date|null} Время последней синхронизации или null, если синхронизация не выполнялась
   */
  getLastSyncTime() {
    return this.syncManager ? this.syncManager.getLastSyncTime() : null;
  }
  
  /**
   * Проверка, выполняется ли синхронизация в данный момент
   * @returns {boolean} Флаг выполнения синхронизации
   */
  isSyncInProgress() {
    return this.syncManager ? this.syncManager.isSyncInProgress() : false;
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SyncIntegration;
}
