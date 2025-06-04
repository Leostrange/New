/**
 * LoggingIntegration.js
 * 
 * Модуль интеграции системы логирования с другими компонентами приложения Mr.Comic.
 * Предоставляет удобные методы для настройки логирования в различных частях приложения.
 */

const path = require('path');
const { LogLevel, ConsoleAppender, FileAppender, globalLoggerFactory } = require('./Logger');
const { globalErrorHandler } = require('./ErrorHandler');
const { MrComicException } = require('./ExceptionHierarchy');

/**
 * Класс для интеграции системы логирования с приложением
 */
class LoggingIntegration {
  /**
   * Создает новый экземпляр интеграции логирования
   * 
   * @param {Object} [options={}] - Опции настройки
   * @param {string} [options.logDir='logs'] - Директория для файлов логов
   * @param {number} [options.defaultLevel=LogLevel.INFO] - Уровень логирования по умолчанию
   * @param {boolean} [options.consoleLogging=true] - Включить логирование в консоль
   * @param {boolean} [options.fileLogging=false] - Включить логирование в файл
   * @param {string} [options.filePrefix='mrcomic'] - Префикс для файлов логов
   */
  constructor(options = {}) {
    this.options = {
      logDir: 'logs',
      defaultLevel: LogLevel.INFO,
      consoleLogging: true,
      fileLogging: false,
      filePrefix: 'mrcomic',
      ...options
    };
    
    this.initialized = false;
    this.mainLogger = null;
  }

  /**
   * Инициализирует систему логирования
   * 
   * @returns {LoggingIntegration} Текущий экземпляр для цепочки вызовов
   */
  initialize() {
    if (this.initialized) {
      return this;
    }
    
    // Настраиваем фабрику логгеров
    globalLoggerFactory.setDefaultLevel(this.options.defaultLevel);
    
    // Очищаем аппендеры по умолчанию
    const defaultLogger = globalLoggerFactory.getLogger('default');
    defaultLogger.appenders = [];
    
    // Добавляем консольный аппендер, если нужно
    if (this.options.consoleLogging) {
      defaultLogger.addAppender(new ConsoleAppender());
    }
    
    // Добавляем файловый аппендер, если нужно
    if (this.options.fileLogging) {
      try {
        const fs = require('fs');
        
        // Создаем директорию для логов, если она не существует
        if (!fs.existsSync(this.options.logDir)) {
          fs.mkdirSync(this.options.logDir, { recursive: true });
        }
        
        const logFilePath = path.join(this.options.logDir, `${this.options.filePrefix}.log`);
        defaultLogger.addAppender(new FileAppender(logFilePath));
      } catch (err) {
        console.error(`Failed to initialize file logging: ${err.message}`);
      }
    }
    
    // Создаем основной логгер приложения
    this.mainLogger = globalLoggerFactory.getLogger('mrcomic');
    
    // Интегрируем с обработчиком ошибок
    this._integrateWithErrorHandler();
    
    this.initialized = true;
    this.mainLogger.info('Logging system initialized');
    
    return this;
  }

  /**
   * Интегрирует систему логирования с обработчиком ошибок
   * 
   * @private
   */
  _integrateWithErrorHandler() {
    // Регистрируем обработчик для всех исключений Mr.Comic
    globalErrorHandler.registerHandler(MrComicException, (error, context) => {
      const logger = this.getLogger('error-handler');
      logger.error(`Handled exception: ${error.message}`, context, error);
      
      return {
        success: false,
        error: error.toJSON()
      };
    });
    
    // Перехватываем необработанные исключения
    process.on('uncaughtException', (error) => {
      const logger = this.getLogger('uncaught-exception');
      logger.fatal('Uncaught exception', {}, error);
      
      // Даем время на запись лога перед завершением процесса
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
    
    // Перехватываем необработанные отклонения промисов
    process.on('unhandledRejection', (reason, promise) => {
      const logger = this.getLogger('unhandled-rejection');
      logger.error('Unhandled promise rejection', { promise }, reason instanceof Error ? reason : new Error(String(reason)));
    });
  }

  /**
   * Получает логгер с указанным именем
   * 
   * @param {string} name - Имя логгера
   * @returns {Logger} Экземпляр логгера
   */
  getLogger(name) {
    if (!this.initialized) {
      this.initialize();
    }
    
    return globalLoggerFactory.getLogger(name);
  }

  /**
   * Получает основной логгер приложения
   * 
   * @returns {Logger} Основной логгер приложения
   */
  getMainLogger() {
    if (!this.initialized) {
      this.initialize();
    }
    
    return this.mainLogger;
  }

  /**
   * Настраивает уровень логирования для указанного логгера
   * 
   * @param {string} name - Имя логгера
   * @param {number} level - Уровень логирования
   * @returns {LoggingIntegration} Текущий экземпляр для цепочки вызовов
   */
  setLoggerLevel(name, level) {
    const logger = this.getLogger(name);
    logger.setLevel(level);
    return this;
  }

  /**
   * Добавляет файловый аппендер для указанного логгера
   * 
   * @param {string} name - Имя логгера
   * @param {string} filePath - Путь к файлу лога
   * @param {Object} [options={}] - Опции файлового аппендера
   * @returns {LoggingIntegration} Текущий экземпляр для цепочки вызовов
   */
  addFileAppender(name, filePath, options = {}) {
    const logger = this.getLogger(name);
    logger.addAppender(new FileAppender(filePath, options));
    return this;
  }

  /**
   * Закрывает все логгеры и освобождает ресурсы
   */
  shutdown() {
    if (this.initialized) {
      this.mainLogger.info('Shutting down logging system');
      globalLoggerFactory.closeAll();
      this.initialized = false;
    }
  }
}

// Создаем глобальный экземпляр интеграции логирования
const globalLoggingIntegration = new LoggingIntegration();

// Экспортируем класс и глобальный экземпляр
module.exports = {
  LoggingIntegration,
  globalLoggingIntegration
};
