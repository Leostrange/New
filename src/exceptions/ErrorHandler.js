/**
 * ErrorHandler.js
 * 
 * Централизованный обработчик ошибок для приложения Mr.Comic.
 * Этот модуль предоставляет механизмы для регистрации, обработки и логирования исключений.
 */

const { MrComicException } = require('./ExceptionHierarchy');

/**
 * Класс для централизованной обработки ошибок в приложении
 */
class ErrorHandler {
  /**
   * Создает новый экземпляр обработчика ошибок
   */
  constructor() {
    this.handlers = new Map();
    this.defaultHandler = this._defaultErrorHandler.bind(this);
    this.isLoggingEnabled = true;
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Регистрирует обработчик для определенного типа исключений
   * 
   * @param {Function} exceptionClass - Класс исключения
   * @param {Function} handler - Функция-обработчик
   * @returns {ErrorHandler} Текущий экземпляр для цепочки вызовов
   */
  registerHandler(exceptionClass, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    
    this.handlers.set(exceptionClass, handler);
    return this;
  }

  /**
   * Удаляет обработчик для определенного типа исключений
   * 
   * @param {Function} exceptionClass - Класс исключения
   * @returns {boolean} true, если обработчик был удален, false в противном случае
   */
  unregisterHandler(exceptionClass) {
    return this.handlers.delete(exceptionClass);
  }

  /**
   * Обрабатывает исключение
   * 
   * @param {Error} error - Исключение для обработки
   * @param {Object} [context={}] - Дополнительный контекст
   * @returns {*} Результат обработки исключения
   */
  handleError(error, context = {}) {
    // Логируем ошибку
    if (this.isLoggingEnabled) {
      this._logError(error, context);
    }

    // Преобразуем обычную ошибку в MrComicException, если необходимо
    const mrComicError = error instanceof MrComicException 
      ? error 
      : new MrComicException(error.message, context, error);

    // Находим подходящий обработчик
    const errorClass = mrComicError.constructor;
    let handler = this.defaultHandler;
    
    // Ищем обработчик для данного класса или его родителей
    for (const [exceptionClass, registeredHandler] of this.handlers.entries()) {
      if (mrComicError instanceof exceptionClass) {
        handler = registeredHandler;
        break;
      }
    }

    // Вызываем обработчик
    return handler(mrComicError, context);
  }

  /**
   * Включает или отключает логирование ошибок
   * 
   * @param {boolean} enabled - Флаг включения/отключения
   * @returns {ErrorHandler} Текущий экземпляр для цепочки вызовов
   */
  setLoggingEnabled(enabled) {
    this.isLoggingEnabled = Boolean(enabled);
    return this;
  }

  /**
   * Устанавливает максимальный размер лога ошибок
   * 
   * @param {number} size - Максимальный размер
   * @returns {ErrorHandler} Текущий экземпляр для цепочки вызовов
   */
  setMaxLogSize(size) {
    if (typeof size !== 'number' || size <= 0) {
      throw new TypeError('Max log size must be a positive number');
    }
    
    this.maxLogSize = size;
    
    // Обрезаем лог, если он превышает новый размер
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
    
    return this;
  }

  /**
   * Очищает лог ошибок
   * 
   * @returns {ErrorHandler} Текущий экземпляр для цепочки вызовов
   */
  clearErrorLog() {
    this.errorLog = [];
    return this;
  }

  /**
   * Возвращает лог ошибок
   * 
   * @returns {Array} Массив записей лога ошибок
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Обработчик ошибок по умолчанию
   * 
   * @private
   * @param {MrComicException} error - Исключение для обработки
   * @param {Object} context - Дополнительный контекст
   * @returns {Object} Информация об ошибке
   */
  _defaultErrorHandler(error, context) {
    console.error(`[ERROR] ${error.toString()}`, {
      error: error.toJSON(),
      additionalContext: context
    });
    
    return {
      success: false,
      error: error.toJSON()
    };
  }

  /**
   * Логирует ошибку
   * 
   * @private
   * @param {Error} error - Исключение для логирования
   * @param {Object} context - Дополнительный контекст
   */
  _logError(error, context) {
    // Создаем запись лога
    const logEntry = {
      timestamp: new Date(),
      error: error instanceof MrComicException ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    };
    
    // Добавляем запись в лог
    this.errorLog.push(logEntry);
    
    // Обрезаем лог, если он превышает максимальный размер
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
  }
}

// Создаем глобальный экземпляр обработчика ошибок
const globalErrorHandler = new ErrorHandler();

// Экспортируем класс и глобальный экземпляр
module.exports = {
  ErrorHandler,
  globalErrorHandler
};
