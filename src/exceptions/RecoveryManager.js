/**
 * RecoveryManager.js
 * 
 * Механизм восстановления после сбоев для приложения Mr.Comic.
 * Этот модуль предоставляет инструменты для автоматического восстановления
 * после различных типов сбоев и ошибок.
 */

const { MrComicException } = require('./ExceptionHierarchy');
const { globalErrorHandler } = require('./ErrorHandler');
const { LogLevel, globalLoggerFactory } = require('./Logger');

// Создаем логгер для модуля восстановления
const logger = globalLoggerFactory.getLogger('RecoveryManager');

/**
 * Типы стратегий восстановления
 * @enum {string}
 */
const RecoveryStrategy = {
  RETRY: 'retry',              // Повторная попытка операции
  FALLBACK: 'fallback',        // Использование запасного варианта
  CIRCUIT_BREAKER: 'circuit_breaker', // Размыкание цепи для предотвращения каскадных сбоев
  TIMEOUT: 'timeout',          // Ограничение времени выполнения
  BULKHEAD: 'bulkhead',        // Изоляция компонентов
  CACHE: 'cache',              // Использование кэшированных данных
  SNAPSHOT: 'snapshot',        // Восстановление из снимка состояния
  COMPENSATING_ACTION: 'compensating_action', // Компенсирующее действие
  IGNORE: 'ignore'             // Игнорирование ошибки
};

/**
 * Состояния восстановления
 * @enum {string}
 */
const RecoveryState = {
  IDLE: 'idle',                // Ожидание
  ATTEMPTING: 'attempting',    // Попытка восстановления
  SUCCEEDED: 'succeeded',      // Успешное восстановление
  FAILED: 'failed'             // Неудачное восстановление
};

/**
 * Класс для управления восстановлением после сбоев
 */
class RecoveryManager {
  /**
   * Создает новый экземпляр менеджера восстановления
   */
  constructor() {
    this.strategies = new Map();
    this.defaultStrategy = this._defaultRecoveryStrategy.bind(this);
    this.recoveryHistory = [];
    this.maxHistorySize = 100;
    this.circuitBreakers = new Map();
    this.snapshots = new Map();
  }

  /**
   * Регистрирует стратегию восстановления для определенного типа исключений
   * 
   * @param {Function} exceptionClass - Класс исключения
   * @param {Function} strategy - Функция-стратегия восстановления
   * @returns {RecoveryManager} Текущий экземпляр для цепочки вызовов
   */
  registerStrategy(exceptionClass, strategy) {
    if (typeof strategy !== 'function') {
      throw new TypeError('Recovery strategy must be a function');
    }
    
    this.strategies.set(exceptionClass, strategy);
    return this;
  }

  /**
   * Удаляет стратегию восстановления для определенного типа исключений
   * 
   * @param {Function} exceptionClass - Класс исключения
   * @returns {boolean} true, если стратегия была удалена, false в противном случае
   */
  unregisterStrategy(exceptionClass) {
    return this.strategies.delete(exceptionClass);
  }

  /**
   * Выполняет операцию с автоматическим восстановлением в случае сбоя
   * 
   * @param {Function} operation - Операция для выполнения
   * @param {Object} [options={}] - Опции восстановления
   * @param {number} [options.maxRetries=3] - Максимальное количество повторных попыток
   * @param {number} [options.retryDelay=1000] - Задержка между повторными попытками (мс)
   * @param {Function} [options.fallbackFn=null] - Функция запасного варианта
   * @param {number} [options.timeout=30000] - Таймаут операции (мс)
   * @param {boolean} [options.useCircuitBreaker=false] - Использовать размыкатель цепи
   * @param {string} [options.circuitBreakerKey='default'] - Ключ размыкателя цепи
   * @param {Object} [context={}] - Контекст выполнения
   * @returns {Promise<*>} Результат операции или восстановления
   */
  async executeWithRecovery(operation, options = {}, context = {}) {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      fallbackFn = null,
      timeout = 30000,
      useCircuitBreaker = false,
      circuitBreakerKey = 'default'
    } = options;
    
    // Проверяем состояние размыкателя цепи, если он используется
    if (useCircuitBreaker) {
      const circuitBreaker = this._getCircuitBreaker(circuitBreakerKey);
      if (circuitBreaker.isOpen) {
        logger.warn(`Circuit breaker ${circuitBreakerKey} is open, skipping operation`, { context });
        return this._executeFallback(fallbackFn, context);
      }
    }
    
    // Создаем таймер для контроля таймаута
    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });
    
    let retries = 0;
    let lastError = null;
    
    // Начинаем попытки выполнения операции
    while (retries <= maxRetries) {
      try {
        // Выполняем операцию с ограничением по времени
        const result = await Promise.race([
          operation(),
          timeoutPromise
        ]);
        
        // Если успешно, очищаем таймер и возвращаем результат
        clearTimeout(timeoutId);
        
        // Если используется размыкатель цепи, отмечаем успешное выполнение
        if (useCircuitBreaker) {
          this._recordCircuitBreakerSuccess(circuitBreakerKey);
        }
        
        // Записываем успешное восстановление в историю
        if (retries > 0) {
          this._recordRecovery({
            timestamp: new Date(),
            strategy: RecoveryStrategy.RETRY,
            state: RecoveryState.SUCCEEDED,
            retries,
            context
          });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Если это последняя попытка или ошибка не подлежит повторной попытке
        if (retries >= maxRetries || !this._isRetryable(error)) {
          // Если используется размыкатель цепи, отмечаем сбой
          if (useCircuitBreaker) {
            this._recordCircuitBreakerFailure(circuitBreakerKey);
          }
          
          break;
        }
        
        // Увеличиваем счетчик попыток
        retries++;
        
        // Логируем информацию о повторной попытке
        logger.info(`Retry ${retries}/${maxRetries} after error: ${error.message}`, { 
          error: error instanceof MrComicException ? error.toJSON() : error,
          context 
        });
        
        // Ждем перед следующей попыткой (экспоненциальная задержка)
        const delay = retryDelay * Math.pow(2, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Очищаем таймер, если он еще активен
    clearTimeout(timeoutId);
    
    // Записываем неудачное восстановление в историю
    this._recordRecovery({
      timestamp: new Date(),
      strategy: RecoveryStrategy.RETRY,
      state: RecoveryState.FAILED,
      error: lastError instanceof MrComicException ? lastError.toJSON() : {
        name: lastError.name,
        message: lastError.message,
        stack: lastError.stack
      },
      retries,
      context
    });
    
    // Если есть запасной вариант, используем его
    if (typeof fallbackFn === 'function') {
      logger.info(`Using fallback after ${retries} failed retries`, { context });
      return this._executeFallback(fallbackFn, context);
    }
    
    // Если нет запасного варианта, применяем стратегию восстановления
    return this.recoverFromError(lastError, context);
  }

  /**
   * Восстанавливается после ошибки, используя соответствующую стратегию
   * 
   * @param {Error} error - Ошибка для восстановления
   * @param {Object} [context={}] - Контекст восстановления
   * @returns {*} Результат восстановления
   */
  recoverFromError(error, context = {}) {
    // Преобразуем обычную ошибку в MrComicException, если необходимо
    const mrComicError = error instanceof MrComicException 
      ? error 
      : new MrComicException(error.message, context, error);
    
    // Находим подходящую стратегию восстановления
    let strategy = this.defaultStrategy;
    
    // Ищем стратегию для данного класса или его родителей
    for (const [exceptionClass, registeredStrategy] of this.strategies.entries()) {
      if (mrComicError instanceof exceptionClass) {
        strategy = registeredStrategy;
        break;
      }
    }
    
    // Логируем информацию о восстановлении
    logger.info(`Applying recovery strategy for error: ${mrComicError.toString()}`, {
      error: mrComicError.toJSON(),
      context
    });
    
    // Применяем стратегию восстановления
    return strategy(mrComicError, context);
  }

  /**
   * Создает снимок состояния для возможного восстановления
   * 
   * @param {string} key - Ключ снимка
   * @param {*} state - Состояние для сохранения
   * @returns {RecoveryManager} Текущий экземпляр для цепочки вызовов
   */
  createSnapshot(key, state) {
    this.snapshots.set(key, {
      timestamp: new Date(),
      state: JSON.parse(JSON.stringify(state)) // Глубокое копирование
    });
    
    logger.debug(`Created snapshot for key: ${key}`, { snapshotSize: JSON.stringify(state).length });
    return this;
  }

  /**
   * Восстанавливает состояние из снимка
   * 
   * @param {string} key - Ключ снимка
   * @returns {*|null} Восстановленное состояние или null, если снимок не найден
   */
  restoreFromSnapshot(key) {
    if (!this.snapshots.has(key)) {
      logger.warn(`Snapshot not found for key: ${key}`);
      return null;
    }
    
    const snapshot = this.snapshots.get(key);
    logger.info(`Restored from snapshot for key: ${key}`, { 
      snapshotAge: new Date() - snapshot.timestamp 
    });
    
    return JSON.parse(JSON.stringify(snapshot.state)); // Глубокое копирование
  }

  /**
   * Удаляет снимок состояния
   * 
   * @param {string} key - Ключ снимка
   * @returns {boolean} true, если снимок был удален, false в противном случае
   */
  removeSnapshot(key) {
    return this.snapshots.delete(key);
  }

  /**
   * Устанавливает максимальный размер истории восстановления
   * 
   * @param {number} size - Максимальный размер
   * @returns {RecoveryManager} Текущий экземпляр для цепочки вызовов
   */
  setMaxHistorySize(size) {
    if (typeof size !== 'number' || size <= 0) {
      throw new TypeError('Max history size must be a positive number');
    }
    
    this.maxHistorySize = size;
    
    // Обрезаем историю, если она превышает новый размер
    if (this.recoveryHistory.length > this.maxHistorySize) {
      this.recoveryHistory = this.recoveryHistory.slice(-this.maxHistorySize);
    }
    
    return this;
  }

  /**
   * Очищает историю восстановления
   * 
   * @returns {RecoveryManager} Текущий экземпляр для цепочки вызовов
   */
  clearRecoveryHistory() {
    this.recoveryHistory = [];
    return this;
  }

  /**
   * Возвращает историю восстановления
   * 
   * @returns {Array} Массив записей истории восстановления
   */
  getRecoveryHistory() {
    return [...this.recoveryHistory];
  }

  /**
   * Сбрасывает состояние размыкателя цепи
   * 
   * @param {string} key - Ключ размыкателя цепи
   * @returns {RecoveryManager} Текущий экземпляр для цепочки вызовов
   */
  resetCircuitBreaker(key) {
    if (this.circuitBreakers.has(key)) {
      const circuitBreaker = this.circuitBreakers.get(key);
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
      circuitBreaker.lastFailure = null;
      circuitBreaker.openTime = null;
      
      logger.info(`Circuit breaker ${key} has been reset`);
    }
    
    return this;
  }

  /**
   * Проверяет, подлежит ли ошибка повторной попытке
   * 
   * @private
   * @param {Error} error - Ошибка для проверки
   * @returns {boolean} true, если ошибка подлежит повторной попытке
   */
  _isRetryable(error) {
    // По умолчанию считаем, что большинство ошибок подлежат повторной попытке
    // Но можно добавить более сложную логику в зависимости от типа ошибки
    
    // Некоторые ошибки не имеет смысла повторять
    const nonRetryableErrors = [
      'ValidationException',
      'SecurityException',
      'ConfigurationException'
    ];
    
    if (error instanceof MrComicException) {
      return !nonRetryableErrors.includes(error.constructor.name);
    }
    
    return true;
  }

  /**
   * Выполняет запасной вариант операции
   * 
   * @private
   * @param {Function} fallbackFn - Функция запасного варианта
   * @param {Object} context - Контекст выполнения
   * @returns {*} Результат запасного варианта
   */
  async _executeFallback(fallbackFn, context) {
    try {
      const result = await fallbackFn(context);
      
      // Записываем успешное восстановление в историю
      this._recordRecovery({
        timestamp: new Date(),
        strategy: RecoveryStrategy.FALLBACK,
        state: RecoveryState.SUCCEEDED,
        context
      });
      
      return result;
    } catch (error) {
      // Записываем неудачное восстановление в историю
      this._recordRecovery({
        timestamp: new Date(),
        strategy: RecoveryStrategy.FALLBACK,
        state: RecoveryState.FAILED,
        error: error instanceof MrComicException ? error.toJSON() : {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        context
      });
      
      // Если запасной вариант не сработал, пробрасываем ошибку
      throw error;
    }
  }

  /**
   * Получает или создает размыкатель цепи
   * 
   * @private
   * @param {string} key - Ключ размыкателя цепи
   * @returns {Object} Объект размыкателя цепи
   */
  _getCircuitBreaker(key) {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        isOpen: false,
        failureCount: 0,
        failureThreshold: 5,
        resetTimeout: 60000, // 1 минута
        lastFailure: null,
        openTime: null
      });
    }
    
    const circuitBreaker = this.circuitBreakers.get(key);
    
    // Проверяем, не пора ли закрыть размыкатель
    if (circuitBreaker.isOpen && circuitBreaker.openTime) {
      const now = new Date();
      if (now - circuitBreaker.openTime >= circuitBreaker.resetTimeout) {
        // Переводим в полузакрытое состояние для следующей попытки
        circuitBreaker.isOpen = false;
        logger.info(`Circuit breaker ${key} reset timeout elapsed, allowing next attempt`);
      }
    }
    
    return circuitBreaker;
  }

  /**
   * Записывает успешное выполнение для размыкателя цепи
   * 
   * @private
   * @param {string} key - Ключ размыкателя цепи
   */
  _recordCircuitBreakerSuccess(key) {
    const circuitBreaker = this._getCircuitBreaker(key);
    
    // Сбрасываем счетчик сбоев при успешном выполнении
    circuitBreaker.failureCount = 0;
  }

  /**
   * Записывает сбой для размыкателя цепи
   * 
   * @private
   * @param {string} key - Ключ размыкателя цепи
   */
  _recordCircuitBreakerFailure(key) {
    const circuitBreaker = this._getCircuitBreaker(key);
    const now = new Date();
    
    // Увеличиваем счетчик сбоев
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailure = now;
    
    // Если превышен порог сбоев, размыкаем цепь
    if (circuitBreaker.failureCount >= circuitBreaker.failureThreshold) {
      circuitBreaker.isOpen = true;
      circuitBreaker.openTime = now;
      
      logger.warn(`Circuit breaker ${key} opened after ${circuitBreaker.failureCount} failures`);
    }
  }

  /**
   * Записывает информацию о восстановлении в историю
   * 
   * @private
   * @param {Object} entry - Запись истории
   */
  _recordRecovery(entry) {
    this.recoveryHistory.push(entry);
    
    // Обрезаем историю, если она превышает максимальный размер
    if (this.recoveryHistory.length > this.maxHistorySize) {
      this.recoveryHistory.shift();
    }
  }

  /**
   * Стратегия восстановления по умолчанию
   * 
   * @private
   * @param {MrComicException} error - Исключение для восстановления
   * @param {Object} context - Контекст восстановления
   * @returns {Object} Результат восстановления
   */
  _defaultRecoveryStrategy(error, context) {
    logger.error(`No specific recovery strategy found for error: ${error.toString()}`, {
      error: error.toJSON(),
      context
    });
    
    // По умолчанию просто пробрасываем ошибку дальше
    throw error;
  }
}

/**
 * Создает функцию повторных попыток
 * 
 * @param {Function} operation - Операция для выполнения
 * @param {Object} [options={}] - Опции повторных попыток
 * @returns {Function} Функция с повторными попытками
 */
function withRetry(operation, options = {}) {
  return async function(...args) {
    return globalRecoveryManager.executeWithRecovery(
      () => operation(...args),
      options,
      { args }
    );
  };
}

/**
 * Создает функцию с размыкателем цепи
 * 
 * @param {Function} operation - Операция для выполнения
 * @param {string} [key='default'] - Ключ размыкателя цепи
 * @returns {Function} Функция с размыкателем цепи
 */
function withCircuitBreaker(operation, key = 'default') {
  return async function(...args) {
    return globalRecoveryManager.executeWithRecovery(
      () => operation(...args),
      { useCircuitBreaker: true, circuitBreakerKey: key },
      { args }
    );
  };
}

/**
 * Создает функцию с таймаутом
 * 
 * @param {Function} operation - Операция для выполнения
 * @param {number} [timeout=30000] - Таймаут в миллисекундах
 * @returns {Function} Функция с таймаутом
 */
function withTimeout(operation, timeout = 30000) {
  return async function(...args) {
    return globalRecoveryManager.executeWithRecovery(
      () => operation(...args),
      { timeout },
      { args }
    );
  };
}

/**
 * Создает функцию с запасным вариантом
 * 
 * @param {Function} operation - Основная операция
 * @param {Function} fallbackFn - Запасной вариант
 * @returns {Function} Функция с запасным вариантом
 */
function withFallback(operation, fallbackFn) {
  return async function(...args) {
    return globalRecoveryManager.executeWithRecovery(
      () => operation(...args),
      { fallbackFn: () => fallbackFn(...args) },
      { args }
    );
  };
}

/**
 * Создает функцию со снимком состояния
 * 
 * @param {Function} operation - Операция для выполнения
 * @param {Function} getStateKey - Функция для получения ключа состояния
 * @param {Function} getState - Функция для получения состояния
 * @param {Function} setState - Функция для установки состояния
 * @returns {Function} Функция со снимком состояния
 */
function withSnapshot(operation, getStateKey, getState, setState) {
  return async function(...args) {
    const key = getStateKey(...args);
    const state = getState(...args);
    
    // Создаем снимок состояния перед операцией
    globalRecoveryManager.createSnapshot(key, state);
    
    try {
      // Выполняем операцию
      return await operation(...args);
    } catch (error) {
      // В случае ошибки восстанавливаем состояние из снимка
      const restoredState = globalRecoveryManager.restoreFromSnapshot(key);
      if (restoredState) {
        setState(restoredState, ...args);
        
        // Записываем успешное восстановление в историю
        globalRecoveryManager._recordRecovery({
          timestamp: new Date(),
          strategy: RecoveryStrategy.SNAPSHOT,
          state: RecoveryState.SUCCEEDED,
          context: { args }
        });
      }
      
      // Пробрасываем ошибку дальше
      throw error;
    }
  };
}

// Создаем глобальный экземпляр менеджера восстановления
const globalRecoveryManager = new RecoveryManager();

// Экспортируем классы, константы и функции
module.exports = {
  RecoveryStrategy,
  RecoveryState,
  RecoveryManager,
  globalRecoveryManager,
  withRetry,
  withCircuitBreaker,
  withTimeout,
  withFallback,
  withSnapshot
};
