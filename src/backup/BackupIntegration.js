/**
 * BackupIntegration.js
 * 
 * Модуль интеграции компонентов резервного копирования с основным приложением Mr.Comic.
 * Обеспечивает связь между компонентами резервного копирования и основным приложением.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const BackupManager = require('./BackupManager');
const BackupUI = require('./BackupUI');

class BackupIntegration {
  /**
   * Создает экземпляр интеграции компонентов резервного копирования
   * @param {Object} app - Экземпляр основного приложения
   * @param {Object} options - Параметры инициализации
   */
  constructor(app, options = {}) {
    this.app = app;
    this.options = Object.assign({
      autoInit: true,
      autoBackupOnClose: true
    }, options);
    
    this.backupManager = null;
    this.backupUI = null;
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  /**
   * Инициализация интеграции
   */
  init() {
    this.initBackupManager();
    this.initBackupUI();
    this.registerAppEvents();
  }
  
  /**
   * Инициализация менеджера резервного копирования
   */
  initBackupManager() {
    this.backupManager = new BackupManager({
      onBackupCreated: this.handleBackupCreated.bind(this),
      onBackupRestored: this.handleBackupRestored.bind(this),
      onBackupError: this.handleBackupError.bind(this)
    });
  }
  
  /**
   * Инициализация пользовательского интерфейса резервного копирования
   */
  initBackupUI() {
    const theme = this.app.getTheme ? this.app.getTheme() : { mode: 'light' };
    const isEInkMode = this.app.isEInkMode ? this.app.isEInkMode() : false;
    
    this.backupUI = new BackupUI(this.backupManager, {
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
        if (this.backupUI) {
          this.backupUI.updateTheme(theme);
        }
      });
      
      this.app.on('eInkModeChanged', (isEInkMode) => {
        if (this.backupUI) {
          this.backupUI.updateEInkMode(isEInkMode);
        }
      });
      
      // Регистрация события закрытия приложения для автоматического создания резервной копии
      if (this.options.autoBackupOnClose) {
        this.app.on('beforeClose', () => {
          this.createAutoBackup();
        });
      }
    }
    
    // Регистрация горячих клавиш
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
    
    // Добавление кнопок в панель инструментов, если доступно
    if (this.app.addToolbarButton && typeof this.app.addToolbarButton === 'function') {
      this.app.addToolbarButton({
        id: 'backup-button',
        icon: 'backup',
        tooltip: 'Резервное копирование',
        onClick: () => this.showManageBackupsDialog()
      });
    }
  }
  
  /**
   * Обработчик создания резервной копии
   * @param {Object} backup - Информация о созданной резервной копии
   */
  handleBackupCreated(backup) {
    // Уведомляем приложение о создании резервной копии
    if (this.app.emit && typeof this.app.emit === 'function') {
      this.app.emit('backupCreated', backup);
    }
  }
  
  /**
   * Обработчик восстановления из резервной копии
   * @param {Object} data - Восстановленные данные
   */
  handleBackupRestored(data) {
    // Уведомляем приложение о восстановлении из резервной копии
    if (this.app.emit && typeof this.app.emit === 'function') {
      this.app.emit('backupRestored', data);
    }
    
    // Обновляем данные приложения
    this.updateAppData(data);
  }
  
  /**
   * Обработчик ошибки резервного копирования
   * @param {string} error - Сообщение об ошибке
   */
  handleBackupError(error) {
    // Уведомляем приложение об ошибке резервного копирования
    if (this.app.emit && typeof this.app.emit === 'function') {
      this.app.emit('backupError', error);
    }
  }
  
  /**
   * Отображение диалогового окна создания резервной копии
   */
  showCreateBackupDialog() {
    if (this.backupUI) {
      const appData = this.getAppData();
      this.backupUI.showCreateBackupDialog(appData);
    }
  }
  
  /**
   * Отображение диалогового окна управления резервными копиями
   */
  showManageBackupsDialog() {
    if (this.backupUI) {
      this.backupUI.showManageBackupsDialog();
    }
  }
  
  /**
   * Создание автоматической резервной копии
   */
  createAutoBackup() {
    try {
      const appData = this.getAppData();
      const backup = this.backupManager.createBackup(appData, `Автоматическая копия от ${new Date().toLocaleString()}`);
      
      if (backup) {
        console.log('Автоматическая резервная копия успешно создана:', backup);
      }
    } catch (error) {
      console.error('Ошибка при создании автоматической резервной копии:', error);
    }
  }
  
  /**
   * Получение данных приложения для резервного копирования
   * @returns {Object} Данные приложения
   */
  getAppData() {
    // Получаем данные из приложения
    const readingProgress = this.app.getReadingProgress ? this.app.getReadingProgress() : [];
    const bookmarks = this.app.getBookmarks ? this.app.getBookmarks() : [];
    const annotations = this.app.getAnnotations ? this.app.getAnnotations() : [];
    const settings = this.app.getSettings ? this.app.getSettings() : {};
    
    return {
      readingProgress,
      bookmarks,
      annotations,
      settings
    };
  }
  
  /**
   * Обновление данных приложения после восстановления из резервной копии
   * @param {Object} data - Восстановленные данные
   */
  updateAppData(data) {
    // Обновляем данные приложения
    if (data.readingProgress && this.app.setReadingProgress) {
      this.app.setReadingProgress(data.readingProgress);
    }
    
    if (data.bookmarks && this.app.setBookmarks) {
      this.app.setBookmarks(data.bookmarks);
    }
    
    if (data.annotations && this.app.setAnnotations) {
      this.app.setAnnotations(data.annotations);
    }
    
    if (data.settings && this.app.setSettings) {
      this.app.setSettings(data.settings);
    }
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackupIntegration;
}
