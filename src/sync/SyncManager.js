/**
 * SyncManager.js
 * 
 * Менеджер синхронизации для закладок и аннотаций в приложении Mr.Comic.
 * Обеспечивает двустороннюю синхронизацию данных между локальным хранилищем и JSON-файлами.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

class SyncManager {
  /**
   * Создает экземпляр менеджера синхронизации
   * @param {Object} options - Параметры инициализации
   * @param {string} options.storageKeyBookmarks - Ключ для хранения закладок в localStorage
   * @param {string} options.storageKeyAnnotations - Ключ для хранения аннотаций в localStorage
   * @param {Function} options.onSyncStart - Callback при начале синхронизации
   * @param {Function} options.onSyncComplete - Callback при завершении синхронизации
   * @param {Function} options.onSyncError - Callback при ошибке синхронизации
   */
  constructor(options = {}) {
    this.options = Object.assign({
      storageKeyBookmarks: 'mr-comic-bookmarks',
      storageKeyAnnotations: 'mr-comic-annotations',
      onSyncStart: null,
      onSyncComplete: null,
      onSyncError: null
    }, options);
    
    this.bookmarks = [];
    this.annotations = [];
    this.syncInProgress = false;
    this.lastSyncTime = null;
    
    this.loadLocalData();
  }
  
  /**
   * Загрузка локальных данных из хранилища
   */
  loadLocalData() {
    try {
      // Загрузка закладок
      const storedBookmarks = localStorage.getItem(this.options.storageKeyBookmarks);
      if (storedBookmarks) {
        this.bookmarks = JSON.parse(storedBookmarks);
      }
      
      // Загрузка аннотаций
      const storedAnnotations = localStorage.getItem(this.options.storageKeyAnnotations);
      if (storedAnnotations) {
        this.annotations = JSON.parse(storedAnnotations);
      }
    } catch (error) {
      console.error('Ошибка при загрузке локальных данных:', error);
      this.bookmarks = [];
      this.annotations = [];
    }
  }
  
  /**
   * Сохранение локальных данных в хранилище
   */
  saveLocalData() {
    try {
      // Сохранение закладок
      localStorage.setItem(this.options.storageKeyBookmarks, JSON.stringify(this.bookmarks));
      
      // Сохранение аннотаций
      localStorage.setItem(this.options.storageKeyAnnotations, JSON.stringify(this.annotations));
    } catch (error) {
      console.error('Ошибка при сохранении локальных данных:', error);
      this.triggerSyncError('Ошибка при сохранении локальных данных: ' + error.message);
    }
  }
  
  /**
   * Синхронизация данных с JSON-файлом
   * @param {string} jsonData - JSON-строка с данными для синхронизации
   * @param {Object} options - Параметры синхронизации
   * @param {string} options.conflictResolution - Стратегия разрешения конфликтов ('newest', 'local', 'remote')
   * @returns {Promise<Object>} Результат синхронизации
   */
  async syncWithJSON(jsonData, options = {}) {
    const defaultOptions = {
      conflictResolution: 'newest' // 'newest', 'local', 'remote'
    };
    
    const syncOptions = { ...defaultOptions, ...options };
    
    if (this.syncInProgress) {
      return {
        success: false,
        message: 'Синхронизация уже выполняется'
      };
    }
    
    this.syncInProgress = true;
    this.triggerSyncStart();
    
    try {
      const remoteData = JSON.parse(jsonData);
      
      if (!remoteData.bookmarks || !remoteData.annotations) {
        throw new Error('Неверный формат данных для синхронизации');
      }
      
      // Синхронизация закладок
      const syncedBookmarks = this.syncData(
        this.bookmarks,
        remoteData.bookmarks,
        syncOptions.conflictResolution
      );
      
      // Синхронизация аннотаций
      const syncedAnnotations = this.syncData(
        this.annotations,
        remoteData.annotations,
        syncOptions.conflictResolution
      );
      
      // Обновляем локальные данные
      this.bookmarks = syncedBookmarks;
      this.annotations = syncedAnnotations;
      
      // Сохраняем обновленные данные
      this.saveLocalData();
      
      // Обновляем время последней синхронизации
      this.lastSyncTime = new Date();
      
      this.syncInProgress = false;
      this.triggerSyncComplete({
        bookmarksCount: this.bookmarks.length,
        annotationsCount: this.annotations.length,
        timestamp: this.lastSyncTime
      });
      
      return {
        success: true,
        message: 'Синхронизация успешно завершена',
        timestamp: this.lastSyncTime,
        bookmarksCount: this.bookmarks.length,
        annotationsCount: this.annotations.length
      };
    } catch (error) {
      console.error('Ошибка при синхронизации:', error);
      
      this.syncInProgress = false;
      this.triggerSyncError('Ошибка при синхронизации: ' + error.message);
      
      return {
        success: false,
        message: 'Ошибка при синхронизации: ' + error.message
      };
    }
  }
  
  /**
   * Синхронизация массивов данных с учетом стратегии разрешения конфликтов
   * @param {Array} localData - Локальные данные
   * @param {Array} remoteData - Удаленные данные
   * @param {string} conflictResolution - Стратегия разрешения конфликтов
   * @returns {Array} Синхронизированные данные
   */
  syncData(localData, remoteData, conflictResolution) {
    // Создаем карты для быстрого доступа по ID
    const localMap = new Map();
    localData.forEach(item => {
      localMap.set(item.id, item);
    });
    
    const remoteMap = new Map();
    remoteData.forEach(item => {
      remoteMap.set(item.id, item);
    });
    
    // Результирующий массив
    const result = [];
    
    // Обрабатываем все локальные элементы
    localData.forEach(localItem => {
      const remoteItem = remoteMap.get(localItem.id);
      
      if (!remoteItem) {
        // Элемент есть только локально - добавляем его
        result.push(localItem);
      } else {
        // Элемент есть и локально, и удаленно - разрешаем конфликт
        const resolvedItem = this.resolveConflict(localItem, remoteItem, conflictResolution);
        result.push(resolvedItem);
        
        // Удаляем обработанный элемент из удаленной карты
        remoteMap.delete(localItem.id);
      }
    });
    
    // Добавляем оставшиеся удаленные элементы
    remoteMap.forEach(remoteItem => {
      result.push(remoteItem);
    });
    
    return result;
  }
  
  /**
   * Разрешение конфликта между локальным и удаленным элементами
   * @param {Object} localItem - Локальный элемент
   * @param {Object} remoteItem - Удаленный элемент
   * @param {string} strategy - Стратегия разрешения конфликтов
   * @returns {Object} Разрешенный элемент
   */
  resolveConflict(localItem, remoteItem, strategy) {
    switch (strategy) {
      case 'local':
        return localItem;
        
      case 'remote':
        return remoteItem;
        
      case 'newest':
      default:
        // Определяем, какой элемент новее
        const localDate = localItem.updatedAt || localItem.date;
        const remoteDate = remoteItem.updatedAt || remoteItem.date;
        
        if (!localDate) return remoteItem;
        if (!remoteDate) return localItem;
        
        return new Date(localDate) >= new Date(remoteDate) ? localItem : remoteItem;
    }
  }
  
  /**
   * Экспорт данных в формате JSON для синхронизации
   * @returns {string} JSON-строка с данными
   */
  exportToJSON() {
    const exportData = {
      format: 'mr-comic-sync',
      version: '1.0',
      timestamp: new Date().toISOString(),
      bookmarks: this.bookmarks,
      annotations: this.annotations
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Получение закладок
   * @returns {Array} Массив закладок
   */
  getBookmarks() {
    return [...this.bookmarks];
  }
  
  /**
   * Получение аннотаций
   * @returns {Array} Массив аннотаций
   */
  getAnnotations() {
    return [...this.annotations];
  }
  
  /**
   * Обновление закладок
   * @param {Array} bookmarks - Новый массив закладок
   */
  updateBookmarks(bookmarks) {
    this.bookmarks = bookmarks || [];
    this.saveLocalData();
  }
  
  /**
   * Обновление аннотаций
   * @param {Array} annotations - Новый массив аннотаций
   */
  updateAnnotations(annotations) {
    this.annotations = annotations || [];
    this.saveLocalData();
  }
  
  /**
   * Получение времени последней синхронизации
   * @returns {Date|null} Время последней синхронизации или null, если синхронизация не выполнялась
   */
  getLastSyncTime() {
    return this.lastSyncTime;
  }
  
  /**
   * Проверка, выполняется ли синхронизация в данный момент
   * @returns {boolean} Флаг выполнения синхронизации
   */
  isSyncInProgress() {
    return this.syncInProgress;
  }
  
  /**
   * Вызов callback при начале синхронизации
   */
  triggerSyncStart() {
    if (this.options.onSyncStart && typeof this.options.onSyncStart === 'function') {
      this.options.onSyncStart();
    }
  }
  
  /**
   * Вызов callback при завершении синхронизации
   * @param {Object} result - Результат синхронизации
   */
  triggerSyncComplete(result) {
    if (this.options.onSyncComplete && typeof this.options.onSyncComplete === 'function') {
      this.options.onSyncComplete(result);
    }
  }
  
  /**
   * Вызов callback при ошибке синхронизации
   * @param {string} error - Сообщение об ошибке
   */
  triggerSyncError(error) {
    if (this.options.onSyncError && typeof this.options.onSyncError === 'function') {
      this.options.onSyncError(error);
    }
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SyncManager;
}
