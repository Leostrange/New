/**
 * BackupManager.js
 * 
 * Менеджер резервного копирования прогресса чтения и пользовательских настроек в приложении Mr.Comic.
 * Обеспечивает создание, восстановление и управление резервными копиями.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

class BackupManager {
  /**
   * Создает экземпляр менеджера резервного копирования
   * @param {Object} options - Параметры инициализации
   * @param {Function} options.onBackupCreated - Callback при создании резервной копии
   * @param {Function} options.onBackupRestored - Callback при восстановлении из резервной копии
   * @param {Function} options.onBackupError - Callback при ошибке резервного копирования
   */
  constructor(options = {}) {
    this.options = Object.assign({
      storageKeyPrefix: 'mr-comic-backup-',
      maxBackups: 5,
      onBackupCreated: null,
      onBackupRestored: null,
      onBackupError: null
    }, options);
    
    this.backupsList = [];
    this.loadBackupsList();
  }
  
  /**
   * Загрузка списка резервных копий
   */
  loadBackupsList() {
    try {
      const storedList = localStorage.getItem(`${this.options.storageKeyPrefix}list`);
      if (storedList) {
        this.backupsList = JSON.parse(storedList);
      }
    } catch (error) {
      console.error('Ошибка при загрузке списка резервных копий:', error);
      this.backupsList = [];
    }
  }
  
  /**
   * Сохранение списка резервных копий
   */
  saveBackupsList() {
    try {
      localStorage.setItem(`${this.options.storageKeyPrefix}list`, JSON.stringify(this.backupsList));
    } catch (error) {
      console.error('Ошибка при сохранении списка резервных копий:', error);
      this.triggerBackupError('Ошибка при сохранении списка резервных копий: ' + error.message);
    }
  }
  
  /**
   * Создание резервной копии
   * @param {Object} data - Данные для резервного копирования
   * @param {Object} data.readingProgress - Прогресс чтения
   * @param {Object} data.bookmarks - Закладки
   * @param {Object} data.annotations - Аннотации
   * @param {Object} data.settings - Настройки приложения
   * @param {string} [name] - Название резервной копии (опционально)
   * @returns {Object} Информация о созданной резервной копии
   */
  createBackup(data, name = '') {
    try {
      // Проверяем данные
      if (!data) {
        throw new Error('Данные для резервного копирования не указаны');
      }
      
      // Создаем метаданные резервной копии
      const timestamp = new Date().toISOString();
      const id = `backup-${timestamp.replace(/[:.]/g, '-')}`;
      const backupName = name || `Резервная копия от ${new Date().toLocaleString()}`;
      
      const backup = {
        id,
        name: backupName,
        timestamp,
        size: 0,
        version: 1
      };
      
      // Подготавливаем данные для сохранения
      const backupData = {
        version: 1,
        timestamp,
        readingProgress: data.readingProgress || [],
        bookmarks: data.bookmarks || [],
        annotations: data.annotations || [],
        settings: data.settings || {}
      };
      
      // Сохраняем данные резервной копии
      const backupDataString = JSON.stringify(backupData);
      localStorage.setItem(`${this.options.storageKeyPrefix}${id}`, backupDataString);
      
      // Обновляем размер резервной копии
      backup.size = backupDataString.length;
      
      // Добавляем резервную копию в список
      this.backupsList.unshift(backup);
      
      // Ограничиваем количество резервных копий
      if (this.backupsList.length > this.options.maxBackups) {
        const removedBackups = this.backupsList.splice(this.options.maxBackups);
        
        // Удаляем данные удаленных резервных копий
        removedBackups.forEach(removedBackup => {
          localStorage.removeItem(`${this.options.storageKeyPrefix}${removedBackup.id}`);
        });
      }
      
      // Сохраняем обновленный список резервных копий
      this.saveBackupsList();
      
      // Вызываем callback
      this.triggerBackupCreated(backup);
      
      return backup;
    } catch (error) {
      console.error('Ошибка при создании резервной копии:', error);
      this.triggerBackupError('Ошибка при создании резервной копии: ' + error.message);
      
      return null;
    }
  }
  
  /**
   * Восстановление из резервной копии
   * @param {string} backupId - ID резервной копии
   * @returns {Object|null} Восстановленные данные или null в случае ошибки
   */
  restoreBackup(backupId) {
    try {
      // Получаем данные резервной копии
      const backupDataString = localStorage.getItem(`${this.options.storageKeyPrefix}${backupId}`);
      if (!backupDataString) {
        throw new Error('Резервная копия не найдена');
      }
      
      // Разбираем данные
      const backupData = JSON.parse(backupDataString);
      
      // Проверяем версию
      if (backupData.version !== 1) {
        throw new Error(`Неподдерживаемая версия резервной копии: ${backupData.version}`);
      }
      
      // Вызываем callback
      this.triggerBackupRestored(backupData);
      
      return backupData;
    } catch (error) {
      console.error('Ошибка при восстановлении из резервной копии:', error);
      this.triggerBackupError('Ошибка при восстановлении из резервной копии: ' + error.message);
      
      return null;
    }
  }
  
  /**
   * Удаление резервной копии
   * @param {string} backupId - ID резервной копии
   * @returns {boolean} Результат операции
   */
  deleteBackup(backupId) {
    try {
      // Находим индекс резервной копии в списке
      const backupIndex = this.backupsList.findIndex(backup => backup.id === backupId);
      if (backupIndex === -1) {
        throw new Error('Резервная копия не найдена');
      }
      
      // Удаляем резервную копию из списка
      this.backupsList.splice(backupIndex, 1);
      
      // Удаляем данные резервной копии
      localStorage.removeItem(`${this.options.storageKeyPrefix}${backupId}`);
      
      // Сохраняем обновленный список резервных копий
      this.saveBackupsList();
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении резервной копии:', error);
      this.triggerBackupError('Ошибка при удалении резервной копии: ' + error.message);
      
      return false;
    }
  }
  
  /**
   * Получение списка резервных копий
   * @returns {Array} Список резервных копий
   */
  getBackupsList() {
    return [...this.backupsList];
  }
  
  /**
   * Получение данных резервной копии
   * @param {string} backupId - ID резервной копии
   * @returns {Object|null} Данные резервной копии или null в случае ошибки
   */
  getBackupData(backupId) {
    try {
      // Получаем данные резервной копии
      const backupDataString = localStorage.getItem(`${this.options.storageKeyPrefix}${backupId}`);
      if (!backupDataString) {
        throw new Error('Резервная копия не найдена');
      }
      
      // Разбираем данные
      return JSON.parse(backupDataString);
    } catch (error) {
      console.error('Ошибка при получении данных резервной копии:', error);
      return null;
    }
  }
  
  /**
   * Экспорт резервной копии в JSON
   * @param {string} backupId - ID резервной копии
   * @returns {string|null} JSON-строка с данными резервной копии или null в случае ошибки
   */
  exportBackup(backupId) {
    try {
      // Получаем данные резервной копии
      const backupData = this.getBackupData(backupId);
      if (!backupData) {
        throw new Error('Резервная копия не найдена');
      }
      
      // Возвращаем JSON-строку
      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error('Ошибка при экспорте резервной копии:', error);
      this.triggerBackupError('Ошибка при экспорте резервной копии: ' + error.message);
      
      return null;
    }
  }
  
  /**
   * Импорт резервной копии из JSON
   * @param {string} jsonData - JSON-строка с данными резервной копии
   * @param {string} [name] - Название резервной копии (опционально)
   * @returns {Object|null} Информация о созданной резервной копии или null в случае ошибки
   */
  importBackup(jsonData, name = '') {
    try {
      // Разбираем данные
      const backupData = JSON.parse(jsonData);
      
      // Проверяем данные
      if (!backupData.version || !backupData.timestamp) {
        throw new Error('Неверный формат данных резервной копии');
      }
      
      // Создаем резервную копию
      return this.createBackup(backupData, name || `Импортированная копия от ${new Date().toLocaleString()}`);
    } catch (error) {
      console.error('Ошибка при импорте резервной копии:', error);
      this.triggerBackupError('Ошибка при импорте резервной копии: ' + error.message);
      
      return null;
    }
  }
  
  /**
   * Вызов callback при создании резервной копии
   * @param {Object} backup - Информация о созданной резервной копии
   */
  triggerBackupCreated(backup) {
    if (this.options.onBackupCreated && typeof this.options.onBackupCreated === 'function') {
      this.options.onBackupCreated(backup);
    }
  }
  
  /**
   * Вызов callback при восстановлении из резервной копии
   * @param {Object} data - Восстановленные данные
   */
  triggerBackupRestored(data) {
    if (this.options.onBackupRestored && typeof this.options.onBackupRestored === 'function') {
      this.options.onBackupRestored(data);
    }
  }
  
  /**
   * Вызов callback при ошибке резервного копирования
   * @param {string} error - Сообщение об ошибке
   */
  triggerBackupError(error) {
    if (this.options.onBackupError && typeof this.options.onBackupError === 'function') {
      this.options.onBackupError(error);
    }
  }
  
  /**
   * Массовый экспорт всех пользовательских данных (профили, темы, настройки, аннотации, прогресс)
   * @returns {Object} JSON-архив всех данных
   */
  exportAll() {
    try {
      // Профили
      let profiles = [];
      try {
        const ProfileManager = require('../profile/ProfileManager');
        const pm = new ProfileManager();
        profiles = JSON.parse(localStorage.getItem(pm.storageKey) || '[]');
      } catch {}
      // Пользовательские темы
      let userThemes = [];
      try {
        userThemes = JSON.parse(localStorage.getItem('mrcomic-user-themes') || '[]');
      } catch {}
      // Настройки приложения (все ключи mrcomic-*)
      const settings = {};
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('mrcomic-')) settings[k] = localStorage.getItem(k);
      });
      // Прогресс, аннотации, закладки (старый формат)
      let readingProgress = [];
      let bookmarks = [];
      let annotations = [];
      try {
        readingProgress = JSON.parse(localStorage.getItem('mr-comic-progress') || '[]');
        bookmarks = JSON.parse(localStorage.getItem('mr-comic-bookmarks') || '[]');
        annotations = JSON.parse(localStorage.getItem('mr-comic-annotations') || '[]');
      } catch {}
      return {
        version: 2,
        timestamp: new Date().toISOString(),
        profiles,
        userThemes,
        settings,
        readingProgress,
        bookmarks,
        annotations
      };
    } catch (e) {
      console.error('Ошибка экспорта всех данных:', e);
      this.triggerBackupError('Ошибка экспорта всех данных: ' + e.message);
      return null;
    }
  }

  /**
   * Массовый импорт всех пользовательских данных (профили, темы, настройки, аннотации, прогресс)
   * @param {Object} data - JSON-архив
   */
  async importAll(data) {
    try {
      // Профили
      if (data.profiles) {
        const ProfileManager = require('../profile/ProfileManager');
        localStorage.setItem('mrcomic-profiles', JSON.stringify(data.profiles));
        // Можно вызвать pm._saveProfiles() для обновления
      }
      // Пользовательские темы
      if (data.userThemes) {
        localStorage.setItem('mrcomic-user-themes', JSON.stringify(data.userThemes));
      }
      // Настройки
      if (data.settings) {
        Object.entries(data.settings).forEach(([k, v]) => localStorage.setItem(k, v));
      }
      // Прогресс, аннотации, закладки
      if (data.readingProgress) localStorage.setItem('mr-comic-progress', JSON.stringify(data.readingProgress));
      if (data.bookmarks) localStorage.setItem('mr-comic-bookmarks', JSON.stringify(data.bookmarks));
      if (data.annotations) localStorage.setItem('mr-comic-annotations', JSON.stringify(data.annotations));
      this.triggerBackupRestored(data);
    } catch (e) {
      console.error('Ошибка импорта всех данных:', e);
      this.triggerBackupError('Ошибка импорта всех данных: ' + e.message);
    }
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackupManager;
}
