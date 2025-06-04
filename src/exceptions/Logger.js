/**
 * Logger.js
 * 
 * Система логирования для приложения Mr.Comic.
 * Этот модуль предоставляет гибкую и настраиваемую систему логирования
 * с поддержкой различных уровней логирования, форматирования и вывода.
 */

const fs = require('fs');
const path = require('path');
const { MrComicException } = require('./ExceptionHierarchy');

/**
 * Уровни логирования
 * @enum {number}
 */
const LogLevel = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5,
  NONE: 6
};

/**
 * Имена уровней логирования
 * @type {Object.<number, string>}
 */
const LogLevelNames = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
  [LogLevel.NONE]: 'NONE'
};

/**
 * Цвета для различных уровней логирования (для консоли)
 * @type {Object.<number, string>}
 */
const LogLevelColors = {
  [LogLevel.TRACE]: '\x1b[90m', // Серый
  [LogLevel.DEBUG]: '\x1b[36m', // Голубой
  [LogLevel.INFO]: '\x1b[32m',  // Зеленый
  [LogLevel.WARN]: '\x1b[33m',  // Желтый
  [LogLevel.ERROR]: '\x1b[31m', // Красный
  [LogLevel.FATAL]: '\x1b[35m', // Пурпурный
  [LogLevel.NONE]: '\x1b[0m'    // Сброс
};

/**
 * Интерфейс для вывода логов
 * @interface
 */
class LogAppender {
  /**
   * Выводит сообщение лога
   * 
   * @param {number} level - Уровень логирования
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  append(level, message, context = {}, error = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Закрывает аппендер и освобождает ресурсы
   */
  close() {
    // По умолчанию ничего не делает
  }
}

/**
 * Аппендер для вывода логов в консоль
 */
class ConsoleAppender extends LogAppender {
  /**
   * Создает новый экземпляр консольного аппендера
   * 
   * @param {boolean} [useColors=true] - Использовать ли цвета в консоли
   */
  constructor(useColors = true) {
    super();
    this.useColors = useColors;
  }

  /**
   * Выводит сообщение лога в консоль
   * 
   * @param {number} level - Уровень логирования
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  append(level, message, context = {}, error = null) {
    const timestamp = new Date().toISOString();
    const levelName = LogLevelNames[level];
    
    let formattedMessage = `[${timestamp}] [${levelName}] ${message}`;
    
    if (Object.keys(context).length > 0) {
      formattedMessage += ` ${JSON.stringify(context)}`;
    }
    
    if (this.useColors) {
      const color = LogLevelColors[level] || '';
      const reset = '\x1b[0m';
      formattedMessage = `${color}${formattedMessage}${reset}`;
    }
    
    // Выбираем соответствующий метод консоли в зависимости от уровня
    let consoleMethod = 'log';
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      consoleMethod = 'error';
    } else if (level === LogLevel.WARN) {
      consoleMethod = 'warn';
    } else if (level === LogLevel.INFO) {
      consoleMethod = 'info';
    } else if (level === LogLevel.DEBUG || level === LogLevel.TRACE) {
      consoleMethod = 'debug';
    }
    
    console[consoleMethod](formattedMessage);
    
    // Если есть ошибка, выводим ее отдельно
    if (error) {
      if (error instanceof MrComicException) {
        console.error(error.toString());
        console.error(JSON.stringify(error.toJSON(), null, 2));
      } else {
        console.error(error);
      }
    }
  }
}

/**
 * Аппендер для вывода логов в файл
 */
class FileAppender extends LogAppender {
  /**
   * Создает новый экземпляр файлового аппендера
   * 
   * @param {string} filePath - Путь к файлу лога
   * @param {Object} [options={}] - Дополнительные опции
   * @param {boolean} [options.append=true] - Добавлять ли в существующий файл
   * @param {number} [options.maxSize=10485760] - Максимальный размер файла (10MB)
   * @param {number} [options.maxFiles=5] - Максимальное количество файлов для ротации
   */
  constructor(filePath, options = {}) {
    super();
    this.filePath = filePath;
    this.options = {
      append: true,
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...options
    };
    
    this.fileStream = null;
    this._openStream();
  }

  /**
   * Открывает поток для записи в файл
   * 
   * @private
   */
  _openStream() {
    const flags = this.options.append ? 'a' : 'w';
    this.fileStream = fs.createWriteStream(this.filePath, { flags });
    
    this.fileStream.on('error', (err) => {
      console.error(`Error writing to log file: ${err.message}`);
    });
  }

  /**
   * Проверяет необходимость ротации файла лога
   * 
   * @private
   * @returns {boolean} true, если ротация выполнена
   */
  _checkRotation() {
    try {
      const stats = fs.statSync(this.filePath);
      
      if (stats.size >= this.options.maxSize) {
        this.fileStream.end();
        
        // Ротация файлов
        for (let i = this.options.maxFiles - 1; i > 0; i--) {
          const oldPath = `${this.filePath}.${i}`;
          const newPath = `${this.filePath}.${i + 1}`;
          
          if (fs.existsSync(oldPath)) {
            if (i === this.options.maxFiles - 1 && fs.existsSync(newPath)) {
              fs.unlinkSync(newPath);
            }
            fs.renameSync(oldPath, newPath);
          }
        }
        
        const newPath = `${this.filePath}.1`;
        if (fs.existsSync(newPath)) {
          fs.unlinkSync(newPath);
        }
        fs.renameSync(this.filePath, newPath);
        
        this._openStream();
        return true;
      }
    } catch (err) {
      console.error(`Error during log rotation: ${err.message}`);
    }
    
    return false;
  }

  /**
   * Выводит сообщение лога в файл
   * 
   * @param {number} level - Уровень логирования
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  append(level, message, context = {}, error = null) {
    if (!this.fileStream) {
      return;
    }
    
    this._checkRotation();
    
    const timestamp = new Date().toISOString();
    const levelName = LogLevelNames[level];
    
    let logEntry = `[${timestamp}] [${levelName}] ${message}`;
    
    if (Object.keys(context).length > 0) {
      logEntry += ` ${JSON.stringify(context)}`;
    }
    
    logEntry += '\n';
    
    this.fileStream.write(logEntry);
    
    // Если есть ошибка, выводим ее отдельно
    if (error) {
      if (error instanceof MrComicException) {
        this.fileStream.write(`Error: ${error.toString()}\n`);
        this.fileStream.write(`${JSON.stringify(error.toJSON(), null, 2)}\n`);
      } else {
        this.fileStream.write(`Error: ${error.message}\n`);
        if (error.stack) {
          this.fileStream.write(`${error.stack}\n`);
        }
      }
    }
  }

  /**
   * Закрывает файловый поток
   */
  close() {
    if (this.fileStream) {
      this.fileStream.end();
      this.fileStream = null;
    }
  }
}

/**
 * Основной класс логгера
 */
class Logger {
  /**
   * Создает новый экземпляр логгера
   * 
   * @param {string} name - Имя логгера
   * @param {number} [level=LogLevel.INFO] - Минимальный уровень логирования
   */
  constructor(name, level = LogLevel.INFO) {
    this.name = name;
    this.level = level;
    this.appenders = [];
  }

  /**
   * Добавляет аппендер к логгеру
   * 
   * @param {LogAppender} appender - Аппендер для добавления
   * @returns {Logger} Текущий экземпляр для цепочки вызовов
   */
  addAppender(appender) {
    if (!(appender instanceof LogAppender)) {
      throw new TypeError('Appender must be an instance of LogAppender');
    }
    
    this.appenders.push(appender);
    return this;
  }

  /**
   * Удаляет аппендер из логгера
   * 
   * @param {LogAppender} appender - Аппендер для удаления
   * @returns {boolean} true, если аппендер был удален
   */
  removeAppender(appender) {
    const index = this.appenders.indexOf(appender);
    if (index !== -1) {
      this.appenders.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Устанавливает минимальный уровень логирования
   * 
   * @param {number} level - Уровень логирования
   * @returns {Logger} Текущий экземпляр для цепочки вызовов
   */
  setLevel(level) {
    this.level = level;
    return this;
  }

  /**
   * Проверяет, включен ли указанный уровень логирования
   * 
   * @param {number} level - Уровень логирования для проверки
   * @returns {boolean} true, если уровень включен
   */
  isLevelEnabled(level) {
    return level >= this.level;
  }

  /**
   * Логирует сообщение с указанным уровнем
   * 
   * @param {number} level - Уровень логирования
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  log(level, message, context = {}, error = null) {
    if (!this.isLevelEnabled(level)) {
      return;
    }
    
    // Добавляем имя логгера в контекст
    const extendedContext = {
      logger: this.name,
      ...context
    };
    
    // Отправляем сообщение во все аппендеры
    for (const appender of this.appenders) {
      appender.append(level, message, extendedContext, error);
    }
  }

  /**
   * Логирует сообщение с уровнем TRACE
   * 
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  trace(message, context = {}, error = null) {
    this.log(LogLevel.TRACE, message, context, error);
  }

  /**
   * Логирует сообщение с уровнем DEBUG
   * 
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  debug(message, context = {}, error = null) {
    this.log(LogLevel.DEBUG, message, context, error);
  }

  /**
   * Логирует сообщение с уровнем INFO
   * 
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  info(message, context = {}, error = null) {
    this.log(LogLevel.INFO, message, context, error);
  }

  /**
   * Логирует сообщение с уровнем WARN
   * 
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  warn(message, context = {}, error = null) {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Логирует сообщение с уровнем ERROR
   * 
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  error(message, context = {}, error = null) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Логирует сообщение с уровнем FATAL
   * 
   * @param {string} message - Сообщение
   * @param {Object} [context={}] - Контекст
   * @param {Error} [error=null] - Ошибка
   */
  fatal(message, context = {}, error = null) {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /**
   * Закрывает логгер и освобождает ресурсы
   */
  close() {
    for (const appender of this.appenders) {
      appender.close();
    }
    this.appenders = [];
  }
}

/**
 * Фабрика логгеров
 */
class LoggerFactory {
  /**
   * Создает новый экземпляр фабрики логгеров
   */
  constructor() {
    this.loggers = new Map();
    this.defaultLevel = LogLevel.INFO;
    this.defaultAppenders = [];
  }

  /**
   * Устанавливает уровень логирования по умолчанию
   * 
   * @param {number} level - Уровень логирования
   * @returns {LoggerFactory} Текущий экземпляр для цепочки вызовов
   */
  setDefaultLevel(level) {
    this.defaultLevel = level;
    return this;
  }

  /**
   * Добавляет аппендер по умолчанию
   * 
   * @param {LogAppender} appender - Аппендер для добавления
   * @returns {LoggerFactory} Текущий экземпляр для цепочки вызовов
   */
  addDefaultAppender(appender) {
    if (!(appender instanceof LogAppender)) {
      throw new TypeError('Appender must be an instance of LogAppender');
    }
    
    this.defaultAppenders.push(appender);
    return this;
  }

  /**
   * Получает или создает логгер с указанным именем
   * 
   * @param {string} name - Имя логгера
   * @returns {Logger} Экземпляр логгера
   */
  getLogger(name) {
    if (this.loggers.has(name)) {
      return this.loggers.get(name);
    }
    
    const logger = new Logger(name, this.defaultLevel);
    
    // Добавляем аппендеры по умолчанию
    for (const appender of this.defaultAppenders) {
      logger.addAppender(appender);
    }
    
    this.loggers.set(name, logger);
    return logger;
  }

  /**
   * Закрывает все логгеры и освобождает ресурсы
   */
  closeAll() {
    for (const logger of this.loggers.values()) {
      logger.close();
    }
    this.loggers.clear();
  }
}

// Создаем глобальную фабрику логгеров
const globalLoggerFactory = new LoggerFactory();

// Настраиваем фабрику по умолчанию
globalLoggerFactory
  .setDefaultLevel(LogLevel.INFO)
  .addDefaultAppender(new ConsoleAppender());

// Экспортируем классы и константы
module.exports = {
  LogLevel,
  LogLevelNames,
  LogAppender,
  ConsoleAppender,
  FileAppender,
  Logger,
  LoggerFactory,
  globalLoggerFactory
};
