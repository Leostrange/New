/**
 * ExceptionHierarchy.js
 * 
 * Иерархия исключений для централизованной системы обработки ошибок Mr.Comic.
 * Этот модуль предоставляет базовые классы исключений и специализированные
 * исключения для различных модулей приложения.
 */

/**
 * Базовый класс для всех исключений в приложении Mr.Comic
 */
class MrComicException extends Error {
  /**
   * Создает новый экземпляр базового исключения
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, context = {}, cause = null) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.cause = cause;
    this.timestamp = new Date();
    this.code = 'MRCOMIC_ERROR';
    
    // Сохраняем стек вызовов
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Возвращает полную информацию об ошибке в виде объекта
   * 
   * @returns {Object} Объект с информацией об ошибке
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      cause: this.cause ? (this.cause.toJSON ? this.cause.toJSON() : this.cause.toString()) : null
    };
  }

  /**
   * Возвращает строковое представление ошибки
   * 
   * @returns {string} Строковое представление ошибки
   */
  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

/**
 * Исключения, связанные с валидацией данных
 */
class ValidationException extends MrComicException {
  /**
   * Создает новый экземпляр исключения валидации
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {Object} [validationErrors={}] - Детали ошибок валидации
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, validationErrors = {}, context = {}, cause = null) {
    super(message, { ...context, validationErrors }, cause);
    this.validationErrors = validationErrors;
    this.code = 'VALIDATION_ERROR';
  }
}

/**
 * Исключения, связанные с операциями ввода-вывода
 */
class IOException extends MrComicException {
  /**
   * Создает новый экземпляр исключения ввода-вывода
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [operation='unknown'] - Тип операции ввода-вывода
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, operation = 'unknown', context = {}, cause = null) {
    super(message, { ...context, operation }, cause);
    this.operation = operation;
    this.code = 'IO_ERROR';
  }
}

/**
 * Исключения, связанные с сетевыми операциями
 */
class NetworkException extends MrComicException {
  /**
   * Создает новый экземпляр исключения сетевых операций
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {number} [statusCode=0] - HTTP-статус код (если применимо)
   * @param {string} [url=''] - URL, с которым связана ошибка
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, statusCode = 0, url = '', context = {}, cause = null) {
    super(message, { ...context, statusCode, url }, cause);
    this.statusCode = statusCode;
    this.url = url;
    this.code = 'NETWORK_ERROR';
  }
}

/**
 * Исключения, связанные с операциями OCR
 */
class OCRException extends MrComicException {
  /**
   * Создает новый экземпляр исключения OCR
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [engine='unknown'] - Используемый движок OCR
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, engine = 'unknown', context = {}, cause = null) {
    super(message, { ...context, engine }, cause);
    this.engine = engine;
    this.code = 'OCR_ERROR';
  }
}

/**
 * Исключения, связанные с операциями перевода
 */
class TranslationException extends MrComicException {
  /**
   * Создает новый экземпляр исключения перевода
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [service='unknown'] - Используемый сервис перевода
   * @param {string} [sourceLanguage='unknown'] - Исходный язык
   * @param {string} [targetLanguage='unknown'] - Целевой язык
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, service = 'unknown', sourceLanguage = 'unknown', targetLanguage = 'unknown', context = {}, cause = null) {
    super(message, { ...context, service, sourceLanguage, targetLanguage }, cause);
    this.service = service;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.code = 'TRANSLATION_ERROR';
  }
}

/**
 * Исключения, связанные с плагинами
 */
class PluginException extends MrComicException {
  /**
   * Создает новый экземпляр исключения плагина
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [pluginId='unknown'] - Идентификатор плагина
   * @param {string} [pluginVersion='unknown'] - Версия плагина
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, pluginId = 'unknown', pluginVersion = 'unknown', context = {}, cause = null) {
    super(message, { ...context, pluginId, pluginVersion }, cause);
    this.pluginId = pluginId;
    this.pluginVersion = pluginVersion;
    this.code = 'PLUGIN_ERROR';
  }
}

/**
 * Исключения, связанные с ресурсами (память, файлы и т.д.)
 */
class ResourceException extends MrComicException {
  /**
   * Создает новый экземпляр исключения ресурсов
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [resourceType='unknown'] - Тип ресурса
   * @param {string} [resourceId='unknown'] - Идентификатор ресурса
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, resourceType = 'unknown', resourceId = 'unknown', context = {}, cause = null) {
    super(message, { ...context, resourceType, resourceId }, cause);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.code = 'RESOURCE_ERROR';
  }
}

/**
 * Исключения, связанные с безопасностью
 */
class SecurityException extends MrComicException {
  /**
   * Создает новый экземпляр исключения безопасности
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [securityType='unknown'] - Тип проблемы безопасности
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, securityType = 'unknown', context = {}, cause = null) {
    super(message, { ...context, securityType }, cause);
    this.securityType = securityType;
    this.code = 'SECURITY_ERROR';
  }
}

/**
 * Исключения, связанные с конфигурацией
 */
class ConfigurationException extends MrComicException {
  /**
   * Создает новый экземпляр исключения конфигурации
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [configKey='unknown'] - Ключ конфигурации
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, configKey = 'unknown', context = {}, cause = null) {
    super(message, { ...context, configKey }, cause);
    this.configKey = configKey;
    this.code = 'CONFIG_ERROR';
  }
}

/**
 * Исключения, связанные с хранилищем данных
 */
class StorageException extends MrComicException {
  /**
   * Создает новый экземпляр исключения хранилища
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [storageType='unknown'] - Тип хранилища (file, database, cache и т.д.)
   * @param {string} [operation='unknown'] - Операция, вызвавшая ошибку (read, write, delete и т.д.)
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, storageType = 'unknown', operation = 'unknown', context = {}, cause = null) {
    super(message, { ...context, storageType, operation }, cause);
    this.storageType = storageType;
    this.operation = operation;
    this.code = 'STORAGE_ERROR';
  }
}

/**
 * Исключения, связанные с пользовательским интерфейсом
 */
class UIException extends MrComicException {
  /**
   * Создает новый экземпляр исключения пользовательского интерфейса
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [componentId='unknown'] - Идентификатор компонента UI
   * @param {string} [eventType='unknown'] - Тип события, вызвавшего ошибку
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, componentId = 'unknown', eventType = 'unknown', context = {}, cause = null) {
    super(message, { ...context, componentId, eventType }, cause);
    this.componentId = componentId;
    this.eventType = eventType;
    this.code = 'UI_ERROR';
  }
}

/**
 * Исключения, связанные с процессом обработки изображений
 */
class ImageProcessingException extends MrComicException {
  /**
   * Создает новый экземпляр исключения обработки изображений
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [processingStage='unknown'] - Этап обработки изображения
   * @param {string} [imageFormat='unknown'] - Формат изображения
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, processingStage = 'unknown', imageFormat = 'unknown', context = {}, cause = null) {
    super(message, { ...context, processingStage, imageFormat }, cause);
    this.processingStage = processingStage;
    this.imageFormat = imageFormat;
    this.code = 'IMAGE_PROCESSING_ERROR';
  }
}

/**
 * Исключения, связанные с конвейером обработки
 */
class PipelineException extends MrComicException {
  /**
   * Создает новый экземпляр исключения конвейера обработки
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [pipelineStage='unknown'] - Этап конвейера
   * @param {string} [pipelineId='unknown'] - Идентификатор конвейера
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, pipelineStage = 'unknown', pipelineId = 'unknown', context = {}, cause = null) {
    super(message, { ...context, pipelineStage, pipelineId }, cause);
    this.pipelineStage = pipelineStage;
    this.pipelineId = pipelineId;
    this.code = 'PIPELINE_ERROR';
  }
}

/**
 * Исключения, связанные с интеграцией внешних сервисов
 */
class IntegrationException extends MrComicException {
  /**
   * Создает новый экземпляр исключения интеграции
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [serviceName='unknown'] - Название внешнего сервиса
   * @param {string} [operationType='unknown'] - Тип операции
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, serviceName = 'unknown', operationType = 'unknown', context = {}, cause = null) {
    super(message, { ...context, serviceName, operationType }, cause);
    this.serviceName = serviceName;
    this.operationType = operationType;
    this.code = 'INTEGRATION_ERROR';
  }
}

/**
 * Исключения, связанные с оптимизацией
 */
class OptimizationException extends MrComicException {
  /**
   * Создает новый экземпляр исключения оптимизации
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [optimizationType='unknown'] - Тип оптимизации
   * @param {Object} [metrics={}] - Метрики производительности
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, optimizationType = 'unknown', metrics = {}, context = {}, cause = null) {
    super(message, { ...context, optimizationType, metrics }, cause);
    this.optimizationType = optimizationType;
    this.metrics = metrics;
    this.code = 'OPTIMIZATION_ERROR';
  }
}

/**
 * Исключения, связанные с инструментами редактирования
 */
class ToolException extends MrComicException {
  /**
   * Создает новый экземпляр исключения инструмента
   * 
   * @param {string} message - Сообщение об ошибке
   * @param {string} [toolId='unknown'] - Идентификатор инструмента
   * @param {string} [toolAction='unknown'] - Действие инструмента
   * @param {Object} [context={}] - Контекстная информация об ошибке
   * @param {Error} [cause=null] - Исходная причина ошибки
   */
  constructor(message, toolId = 'unknown', toolAction = 'unknown', context = {}, cause = null) {
    super(message, { ...context, toolId, toolAction }, cause);
    this.toolId = toolId;
    this.toolAction = toolAction;
    this.code = 'TOOL_ERROR';
  }
}

// Экспортируем все классы исключений
module.exports = {
  MrComicException,
  ValidationException,
  IOException,
  NetworkException,
  OCRException,
  TranslationException,
  PluginException,
  ResourceException,
  SecurityException,
  ConfigurationException,
  StorageException,
  UIException,
  ImageProcessingException,
  PipelineException,
  IntegrationException,
  OptimizationException,
  ToolException
};
