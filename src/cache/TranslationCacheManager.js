/**
 * TranslationCacheManager - Менеджер кэширования переводов
 * 
 * Особенности:
 * - Эффективное кэширование результатов перевода
 * - Поддержка различных стратегий хранения (память, IndexedDB, файловая система)
 * - Настраиваемые политики инвалидации кэша
 * - Статистика и мониторинг использования кэша
 * - Оптимизация производительности для частых запросов
 */
class TranslationCacheManager {
  /**
   * @param {Object} options - Опции менеджера кэша
   * @param {Logger} options.logger - Экземпляр логгера
   * @param {string} options.storageType - Тип хранилища ('memory', 'indexeddb', 'filesystem')
   * @param {number} options.maxSize - Максимальный размер кэша в байтах
   * @param {number} options.ttl - Время жизни записей в кэше в миллисекундах
   * @param {boolean} options.compression - Использовать сжатие данных
   * @param {Object} options.storage - Настройки хранилища
   */
  constructor(options = {}) {
    this.logger = options.logger;
    this.storageType = options.storageType || 'memory';
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100 МБ по умолчанию
    this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // 7 дней по умолчанию
    this.compression = options.compression !== undefined ? options.compression : true;
    this.storageOptions = options.storage || {};
    
    // Статистика использования кэша
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      size: 0,
      lastCleanup: Date.now()
    };
    
    // Инициализация хранилища
    this._initStorage();
    
    this.logger?.info(`TranslationCacheManager initialized with ${this.storageType} storage`);
  }

  /**
   * Получение значения из кэша
   * @param {string} key - Ключ кэша
   * @returns {Promise<Object|null>} - Значение из кэша или null, если не найдено
   */
  async get(key) {
    try {
      const entry = await this.storage.get(key);
      
      if (!entry) {
        this.stats.misses++;
        this.logger?.debug(`Cache miss for key: ${key}`);
        return null;
      }
      
      // Проверяем срок действия
      if (entry.expires && entry.expires < Date.now()) {
        this.logger?.debug(`Cache entry expired for key: ${key}`);
        await this.storage.delete(key);
        this.stats.evictions++;
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      this.logger?.debug(`Cache hit for key: ${key}`);
      
      // Обновляем время последнего доступа
      entry.lastAccessed = Date.now();
      await this.storage.set(key, entry);
      
      return entry.value;
    } catch (error) {
      this.logger?.error(`Error getting cache entry for key: ${key}`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Сохранение значения в кэше
   * @param {string} key - Ключ кэша
   * @param {Object} value - Значение для сохранения
   * @param {Object} options - Опции сохранения
   * @param {number} options.ttl - Время жизни записи в миллисекундах
   * @returns {Promise<boolean>} - true, если значение успешно сохранено
   */
  async set(key, value, options = {}) {
    try {
      const ttl = options.ttl || this.ttl;
      const now = Date.now();
      
      const entry = {
        key,
        value,
        created: now,
        lastAccessed: now,
        expires: ttl > 0 ? now + ttl : null,
        size: this._estimateSize(value)
      };
      
      // Проверяем, не превышен ли максимальный размер кэша
      if (this.stats.size + entry.size > this.maxSize) {
        await this._cleanup();
      }
      
      // Если после очистки всё ещё не хватает места, не сохраняем значение
      if (this.stats.size + entry.size > this.maxSize) {
        this.logger?.warn(`Cannot cache value for key ${key}: exceeds maximum cache size`);
        return false;
      }
      
      // Сохраняем значение
      await this.storage.set(key, entry);
      
      // Обновляем статистику
      this.stats.sets++;
      this.stats.size += entry.size;
      
      this.logger?.debug(`Cached value for key: ${key}, size: ${entry.size} bytes`);
      
      return true;
    } catch (error) {
      this.logger?.error(`Error setting cache entry for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Удаление значения из кэша
   * @param {string} key - Ключ кэша
   * @returns {Promise<boolean>} - true, если значение успешно удалено
   */
  async delete(key) {
    try {
      const entry = await this.storage.get(key);
      
      if (!entry) {
        return false;
      }
      
      await this.storage.delete(key);
      
      // Обновляем статистику
      this.stats.size -= entry.size || 0;
      this.stats.evictions++;
      
      this.logger?.debug(`Deleted cache entry for key: ${key}`);
      
      return true;
    } catch (error) {
      this.logger?.error(`Error deleting cache entry for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Очистка всего кэша
   * @returns {Promise<boolean>} - true, если кэш успешно очищен
   */
  async clear() {
    try {
      await this.storage.clear();
      
      // Сбрасываем статистику
      this.stats.size = 0;
      this.stats.evictions += this.stats.sets;
      
      this.logger?.info('Cache cleared');
      
      return true;
    } catch (error) {
      this.logger?.error('Error clearing cache', error);
      return false;
    }
  }

  /**
   * Получение статистики использования кэша
   * @returns {Object} - Статистика кэша
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? this.stats.hits / (this.stats.hits + this.stats.misses) 
      : 0;
    
    return {
      ...this.stats,
      hitRate,
      usedPercentage: this.maxSize > 0 ? (this.stats.size / this.maxSize) * 100 : 0
    };
  }

  /**
   * Инициализация хранилища
   * @private
   */
  _initStorage() {
    switch (this.storageType) {
      case 'memory':
        this.storage = new MemoryStorage();
        break;
      case 'indexeddb':
        this.storage = new IndexedDBStorage(this.storageOptions);
        break;
      case 'filesystem':
        this.storage = new FileSystemStorage(this.storageOptions);
        break;
      default:
        this.logger?.warn(`Unknown storage type: ${this.storageType}, using memory storage`);
        this.storage = new MemoryStorage();
    }
  }

  /**
   * Очистка устаревших и редко используемых записей
   * @private
   * @returns {Promise<number>} - Количество удаленных записей
   */
  async _cleanup() {
    try {
      this.logger?.debug('Starting cache cleanup');
      
      const now = Date.now();
      let removedCount = 0;
      let freedSpace = 0;
      
      // Получаем все записи
      const entries = await this.storage.getAll();
      
      // Сортируем записи по времени последнего доступа (сначала самые старые)
      entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      // Удаляем устаревшие записи
      for (const entry of entries) {
        // Если запись устарела или нужно освободить место
        if ((entry.expires && entry.expires < now) || 
            (this.stats.size > this.maxSize * 0.9)) {
          await this.storage.delete(entry.key);
          freedSpace += entry.size || 0;
          removedCount++;
        } else {
          // Если размер кэша в пределах нормы, прекращаем очистку
          if (this.stats.size - freedSpace <= this.maxSize * 0.7) {
            break;
          }
        }
      }
      
      // Обновляем статистику
      this.stats.size -= freedSpace;
      this.stats.evictions += removedCount;
      this.stats.lastCleanup = now;
      
      this.logger?.info(`Cache cleanup completed: removed ${removedCount} entries, freed ${freedSpace} bytes`);
      
      return removedCount;
    } catch (error) {
      this.logger?.error('Error during cache cleanup', error);
      return 0;
    }
  }

  /**
   * Оценка размера значения в байтах
   * @private
   * @param {*} value - Значение для оценки размера
   * @returns {number} - Размер в байтах
   */
  _estimateSize(value) {
    try {
      const json = JSON.stringify(value);
      return json.length * 2; // Приблизительный размер в байтах (UTF-16)
    } catch (error) {
      this.logger?.warn('Error estimating value size', error);
      return 1024; // Возвращаем значение по умолчанию
    }
  }
}

/**
 * MemoryStorage - Хранилище в памяти
 * @private
 */
class MemoryStorage {
  constructor() {
    this.data = new Map();
  }

  async get(key) {
    return this.data.get(key);
  }

  async set(key, value) {
    this.data.set(key, value);
    return true;
  }

  async delete(key) {
    return this.data.delete(key);
  }

  async clear() {
    this.data.clear();
    return true;
  }

  async getAll() {
    return Array.from(this.data.values());
  }
}

/**
 * IndexedDBStorage - Хранилище в IndexedDB
 * @private
 */
class IndexedDBStorage {
  constructor(options = {}) {
    this.dbName = options.dbName || 'translation-cache';
    this.storeName = options.storeName || 'translations';
    this.db = null;
    this._initPromise = this._init();
  }

  async _init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to open IndexedDB: ${event.target.errorCode}`));
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async get(key) {
    await this._initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get value for key: ${key}`));
      };
    });
  }

  async set(key, value) {
    await this._initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to set value for key: ${key}`));
      };
    });
  }

  async delete(key) {
    await this._initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to delete value for key: ${key}`));
      };
    });
  }

  async clear() {
    await this._initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to clear store'));
      };
    });
  }

  async getAll() {
    await this._initPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get all values'));
      };
    });
  }
}

/**
 * FileSystemStorage - Хранилище в файловой системе
 * @private
 */
class FileSystemStorage {
  constructor(options = {}) {
    this.fs = require('fs');
    this.path = require('path');
    this.util = require('util');
    
    this.readFile = this.util.promisify(this.fs.readFile);
    this.writeFile = this.util.promisify(this.fs.writeFile);
    this.unlink = this.util.promisify(this.fs.unlink);
    this.readdir = this.util.promisify(this.fs.readdir);
    this.mkdir = this.util.promisify(this.fs.mkdir);
    this.stat = this.util.promisify(this.fs.stat);
    
    this.directory = options.directory || './cache';
    this._initPromise = this._init();
  }

  async _init() {
    try {
      await this.stat(this.directory);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.mkdir(this.directory, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  async get(key) {
    await this._initPromise;
    
    try {
      const filePath = this._getFilePath(key);
      const data = await this.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async set(key, value) {
    await this._initPromise;
    
    const filePath = this._getFilePath(key);
    await this.writeFile(filePath, JSON.stringify(value), 'utf8');
    return true;
  }

  async delete(key) {
    await this._initPromise;
    
    try {
      const filePath = this._getFilePath(key);
      await this.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async clear() {
    await this._initPromise;
    
    const files = await this.readdir(this.directory);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        await this.unlink(this.path.join(this.directory, file));
      }
    }
    
    return true;
  }

  async getAll() {
    await this._initPromise;
    
    const files = await this.readdir(this.directory);
    const entries = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = this.path.join(this.directory, file);
          const data = await this.readFile(filePath, 'utf8');
          entries.push(JSON.parse(data));
        } catch (error) {
          // Игнорируем ошибки чтения отдельных файлов
        }
      }
    }
    
    return entries;
  }

  _getFilePath(key) {
    // Преобразуем ключ в безопасное имя файла
    const safeKey = Buffer.from(key).toString('base64').replace(/[/+=]/g, '_');
    return this.path.join(this.directory, `${safeKey}.json`);
  }
}

module.exports = TranslationCacheManager;
