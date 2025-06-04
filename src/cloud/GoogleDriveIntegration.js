/**
 * GoogleDriveIntegration.js
 * 
 * Модуль интеграции Google Drive с основным приложением Mr.Comic.
 * Обеспечивает связь между компонентами Google Drive и основным приложением.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const GoogleDriveManager = require('./GoogleDriveManager');
const GoogleDriveUI = require('./GoogleDriveUI');

class GoogleDriveIntegration {
  /**
   * Создает экземпляр интеграции Google Drive
   * @param {Object} app - Экземпляр основного приложения
   * @param {Object} options - Параметры инициализации
   */
  constructor(app, options = {}) {
    this.app = app;
    
    this.options = Object.assign({
      clientId: '',
      apiKey: '',
      allowedFileTypes: ['application/pdf', 'application/x-cbz', 'application/zip'],
      autoInit: true
    }, options);
    
    // Создаем экземпляр менеджера Google Drive
    this.driveManager = new GoogleDriveManager({
      clientId: this.options.clientId,
      apiKey: this.options.apiKey,
      onAuthSuccess: () => this.handleAuthSuccess(),
      onAuthFailure: (error) => this.handleAuthFailure(error)
    });
    
    // Создаем экземпляр пользовательского интерфейса
    this.driveUI = new GoogleDriveUI(this.driveManager, {
      theme: this.app.theme,
      isEInkMode: this.app.isEInkMode,
      allowedFileTypes: this.options.allowedFileTypes
    });
    
    // Инициализируем интеграцию
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  /**
   * Инициализация интеграции
   */
  init() {
    // Добавляем пункты меню
    this.addMenuItems();
    
    // Добавляем горячие клавиши
    this.addHotkeys();
    
    // Проверяем авторизацию
    this.driveManager.checkAuth();
  }
  
  /**
   * Добавление пунктов меню
   */
  addMenuItems() {
    // Проверяем наличие меню
    if (!this.app.menu) {
      console.warn('Меню приложения не найдено');
      return;
    }
    
    // Добавляем пункт меню "Google Drive"
    this.app.menu.addItem({
      id: 'google-drive',
      label: 'Google Drive',
      icon: 'cloud',
      submenu: [
        {
          id: 'google-drive-auth',
          label: 'Авторизация',
          icon: 'log-in',
          action: () => this.handleAuthAction()
        },
        {
          id: 'google-drive-open',
          label: 'Открыть из Google Drive',
          icon: 'folder-open',
          action: () => this.handleOpenFromDrive()
        },
        {
          id: 'google-drive-save',
          label: 'Сохранить в Google Drive',
          icon: 'save',
          action: () => this.handleSaveToDrive()
        },
        {
          id: 'google-drive-backup',
          label: 'Резервное копирование',
          icon: 'archive',
          action: () => this.handleBackupToDrive()
        }
      ]
    });
    
    // Обновляем состояние пунктов меню
    this.updateMenuItems();
  }
  
  /**
   * Обновление состояния пунктов меню
   */
  updateMenuItems() {
    // Проверяем наличие меню
    if (!this.app.menu) {
      return;
    }
    
    const isAuthorized = this.driveManager.isUserAuthorized();
    
    // Обновляем пункт "Авторизация"
    this.app.menu.updateItem('google-drive-auth', {
      label: isAuthorized ? 'Выйти из аккаунта' : 'Авторизация',
      icon: isAuthorized ? 'log-out' : 'log-in'
    });
    
    // Обновляем доступность других пунктов
    this.app.menu.updateItem('google-drive-open', {
      disabled: !isAuthorized
    });
    
    this.app.menu.updateItem('google-drive-save', {
      disabled: !isAuthorized || !this.app.currentDocument
    });
    
    this.app.menu.updateItem('google-drive-backup', {
      disabled: !isAuthorized
    });
  }
  
  /**
   * Добавление горячих клавиш
   */
  addHotkeys() {
    // Проверяем наличие менеджера горячих клавиш
    if (!this.app.hotkeys) {
      console.warn('Менеджер горячих клавиш не найден');
      return;
    }
    
    // Добавляем горячие клавиши
    this.app.hotkeys.add({
      id: 'google-drive-open',
      keys: 'Ctrl+Alt+O',
      action: () => this.handleOpenFromDrive()
    });
    
    this.app.hotkeys.add({
      id: 'google-drive-save',
      keys: 'Ctrl+Alt+S',
      action: () => this.handleSaveToDrive()
    });
    
    this.app.hotkeys.add({
      id: 'google-drive-backup',
      keys: 'Ctrl+Alt+B',
      action: () => this.handleBackupToDrive()
    });
  }
  
  /**
   * Обработчик действия авторизации
   */
  handleAuthAction() {
    if (this.driveManager.isUserAuthorized()) {
      // Выход из аккаунта
      this.driveManager.signOut();
      
      // Обновляем состояние пунктов меню
      this.updateMenuItems();
      
      // Показываем уведомление
      this.app.notifications.show({
        type: 'info',
        message: 'Вы вышли из аккаунта Google Drive'
      });
    } else {
      // Авторизация
      this.driveUI.showAuthDialog();
    }
  }
  
  /**
   * Обработчик успешной авторизации
   */
  handleAuthSuccess() {
    // Обновляем состояние пунктов меню
    this.updateMenuItems();
    
    // Показываем уведомление
    this.app.notifications.show({
      type: 'success',
      message: 'Авторизация в Google Drive успешно выполнена'
    });
  }
  
  /**
   * Обработчик ошибки авторизации
   * @param {string} error - Сообщение об ошибке
   */
  handleAuthFailure(error) {
    // Обновляем состояние пунктов меню
    this.updateMenuItems();
    
    // Показываем уведомление
    this.app.notifications.show({
      type: 'error',
      message: `Ошибка авторизации в Google Drive: ${error}`
    });
  }
  
  /**
   * Обработчик открытия файла из Google Drive
   */
  handleOpenFromDrive() {
    // Проверяем авторизацию
    if (!this.driveManager.isUserAuthorized()) {
      this.driveUI.showAuthDialog();
      return;
    }
    
    // Показываем диалог выбора файла
    this.driveUI.showFileBrowserDialog((file) => {
      // Показываем индикатор загрузки
      this.app.showLoading('Скачивание файла из Google Drive...');
      
      // Скачиваем файл
      this.driveManager.downloadFile(file.id)
        .then((blob) => {
          // Создаем файл
          const downloadedFile = new File([blob], file.name, { type: file.mimeType });
          
          // Открываем файл
          this.app.openFile(downloadedFile);
          
          // Скрываем индикатор загрузки
          this.app.hideLoading();
          
          // Показываем уведомление
          this.app.notifications.show({
            type: 'success',
            message: `Файл "${file.name}" успешно открыт из Google Drive`
          });
        })
        .catch((error) => {
          console.error('Ошибка при скачивании файла из Google Drive:', error);
          
          // Скрываем индикатор загрузки
          this.app.hideLoading();
          
          // Показываем уведомление
          this.app.notifications.show({
            type: 'error',
            message: `Ошибка при скачивании файла: ${error.message}`
          });
        });
    });
  }
  
  /**
   * Обработчик сохранения файла в Google Drive
   */
  handleSaveToDrive() {
    // Проверяем авторизацию
    if (!this.driveManager.isUserAuthorized()) {
      this.driveUI.showAuthDialog();
      return;
    }
    
    // Проверяем наличие текущего документа
    if (!this.app.currentDocument) {
      this.app.notifications.show({
        type: 'warning',
        message: 'Нет открытого документа для сохранения'
      });
      return;
    }
    
    // Получаем файл текущего документа
    const file = this.app.currentDocument.file;
    
    // Показываем диалог загрузки файла
    this.driveUI.showUploadDialog(file, (result) => {
      // Показываем уведомление
      this.app.notifications.show({
        type: 'success',
        message: `Файл "${result.name}" успешно сохранен в Google Drive`
      });
    });
  }
  
  /**
   * Обработчик резервного копирования в Google Drive
   */
  handleBackupToDrive() {
    // Проверяем авторизацию
    if (!this.driveManager.isUserAuthorized()) {
      this.driveUI.showAuthDialog();
      return;
    }
    
    // Проверяем наличие менеджера резервного копирования
    if (!this.app.backupManager) {
      this.app.notifications.show({
        type: 'warning',
        message: 'Менеджер резервного копирования не найден'
      });
      return;
    }
    
    // Показываем индикатор загрузки
    this.app.showLoading('Создание резервной копии...');
    
    // Создаем резервную копию
    this.app.backupManager.createBackup()
      .then((backupData) => {
        // Создаем файл резервной копии
        const backupFile = new File(
          [JSON.stringify(backupData, null, 2)],
          `mr-comic-backup-${new Date().toISOString().slice(0, 10)}.json`,
          { type: 'application/json' }
        );
        
        // Скрываем индикатор загрузки
        this.app.hideLoading();
        
        // Показываем диалог загрузки файла
        this.driveUI.showUploadDialog(backupFile, (result) => {
          // Показываем уведомление
          this.app.notifications.show({
            type: 'success',
            message: `Резервная копия успешно сохранена в Google Drive как "${result.name}"`
          });
        });
      })
      .catch((error) => {
        console.error('Ошибка при создании резервной копии:', error);
        
        // Скрываем индикатор загрузки
        this.app.hideLoading();
        
        // Показываем уведомление
        this.app.notifications.show({
          type: 'error',
          message: `Ошибка при создании резервной копии: ${error.message}`
        });
      });
  }
  
  /**
   * Обновление темы оформления
   * @param {Object} theme - Новые настройки темы
   */
  updateTheme(theme) {
    if (this.driveUI) {
      this.driveUI.updateTheme(theme);
    }
  }
  
  /**
   * Обновление режима E-Ink
   * @param {boolean} isEInkMode - Флаг режима E-Ink
   */
  updateEInkMode(isEInkMode) {
    if (this.driveUI) {
      this.driveUI.updateEInkMode(isEInkMode);
    }
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleDriveIntegration;
}
