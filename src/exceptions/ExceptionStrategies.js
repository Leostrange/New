/**
 * ExceptionStrategies.js
 * 
 * Стратегии обработки для различных типов исключений в приложении Mr.Comic.
 * Этот модуль определяет специфические стратегии обработки для каждого типа исключения.
 */

const { 
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
} = require('./ExceptionHierarchy');

const { globalErrorHandler } = require('./ErrorHandler');
const Logger = require('./Logger');

/**
 * Базовая стратегия обработки исключений
 * @param {MrComicException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function baseExceptionStrategy(error, context) {
  Logger.error(`[Base Exception] ${error.toString()}`, {
    error: error.toJSON(),
    additionalContext: context
  });
  
  return {
    success: false,
    handled: true,
    errorType: 'base',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений валидации
 * @param {ValidationException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function validationExceptionStrategy(error, context) {
  Logger.warn(`[Validation Error] ${error.toString()}`, {
    validationErrors: error.validationErrors,
    additionalContext: context
  });
  
  // Для ошибок валидации возвращаем детальную информацию о проблемах
  return {
    success: false,
    handled: true,
    errorType: 'validation',
    validationErrors: error.validationErrors,
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений ввода-вывода
 * @param {IOException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function ioExceptionStrategy(error, context) {
  Logger.error(`[IO Error] ${error.toString()}`, {
    operation: error.operation,
    additionalContext: context
  });
  
  // Для IO ошибок можно попытаться выполнить повторную операцию
  return {
    success: false,
    handled: true,
    errorType: 'io',
    retryRecommended: true,
    operation: error.operation,
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки сетевых исключений
 * @param {NetworkException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function networkExceptionStrategy(error, context) {
  Logger.error(`[Network Error] ${error.toString()}`, {
    statusCode: error.statusCode,
    url: error.url,
    additionalContext: context
  });
  
  // Для сетевых ошибок определяем стратегию в зависимости от статус-кода
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  const isRetryable = retryableStatusCodes.includes(error.statusCode);
  
  return {
    success: false,
    handled: true,
    errorType: 'network',
    retryRecommended: isRetryable,
    statusCode: error.statusCode,
    url: error.url,
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений OCR
 * @param {OCRException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function ocrExceptionStrategy(error, context) {
  Logger.error(`[OCR Error] ${error.toString()}`, {
    engine: error.engine,
    additionalContext: context
  });
  
  // Для OCR ошибок можно предложить альтернативный движок
  const alternativeEngines = ['tesseract', 'google-vision', 'azure-ocr', 'aws-textract'];
  const currentEngine = error.engine || 'unknown';
  const alternatives = alternativeEngines.filter(engine => engine !== currentEngine);
  
  return {
    success: false,
    handled: true,
    errorType: 'ocr',
    engine: currentEngine,
    alternativeEngines: alternatives,
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений перевода
 * @param {TranslationException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function translationExceptionStrategy(error, context) {
  Logger.error(`[Translation Error] ${error.toString()}`, {
    service: error.service,
    sourceLanguage: error.sourceLanguage,
    targetLanguage: error.targetLanguage,
    additionalContext: context
  });
  
  // Для ошибок перевода можно предложить альтернативный сервис
  const alternativeServices = ['google-translate', 'deepl', 'microsoft-translator', 'libre-translate'];
  const currentService = error.service || 'unknown';
  const alternatives = alternativeServices.filter(service => service !== currentService);
  
  return {
    success: false,
    handled: true,
    errorType: 'translation',
    service: currentService,
    alternativeServices: alternatives,
    sourceLanguage: error.sourceLanguage,
    targetLanguage: error.targetLanguage,
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений плагинов
 * @param {PluginException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function pluginExceptionStrategy(error, context) {
  Logger.error(`[Plugin Error] ${error.toString()}`, {
    pluginId: error.pluginId,
    pluginVersion: error.pluginVersion,
    additionalContext: context
  });
  
  // Для ошибок плагинов можно предложить отключение проблемного плагина
  return {
    success: false,
    handled: true,
    errorType: 'plugin',
    pluginId: error.pluginId,
    pluginVersion: error.pluginVersion,
    recommendedAction: 'disable_plugin',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений ресурсов
 * @param {ResourceException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function resourceExceptionStrategy(error, context) {
  Logger.error(`[Resource Error] ${error.toString()}`, {
    resourceType: error.resourceType,
    resourceId: error.resourceId,
    additionalContext: context
  });
  
  // Для ресурсных ошибок можно предложить освобождение ресурсов
  return {
    success: false,
    handled: true,
    errorType: 'resource',
    resourceType: error.resourceType,
    resourceId: error.resourceId,
    recommendedAction: 'free_resources',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений безопасности
 * @param {SecurityException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function securityExceptionStrategy(error, context) {
  // Для ошибок безопасности логируем с высоким приоритетом
  Logger.critical(`[Security Error] ${error.toString()}`, {
    securityType: error.securityType,
    additionalContext: context
  });
  
  // Для ошибок безопасности рекомендуем блокировку операции
  return {
    success: false,
    handled: true,
    errorType: 'security',
    securityType: error.securityType,
    recommendedAction: 'block_operation',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений конфигурации
 * @param {ConfigurationException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function configurationExceptionStrategy(error, context) {
  Logger.error(`[Configuration Error] ${error.toString()}`, {
    configKey: error.configKey,
    additionalContext: context
  });
  
  // Для ошибок конфигурации можно предложить использование значений по умолчанию
  return {
    success: false,
    handled: true,
    errorType: 'configuration',
    configKey: error.configKey,
    recommendedAction: 'use_defaults',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений хранилища
 * @param {StorageException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function storageExceptionStrategy(error, context) {
  Logger.error(`[Storage Error] ${error.toString()}`, {
    storageType: error.storageType,
    operation: error.operation,
    additionalContext: context
  });
  
  // Для ошибок хранилища определяем стратегию в зависимости от типа операции
  const retryableOperations = ['read', 'write', 'connect'];
  const isRetryable = retryableOperations.includes(error.operation);
  
  return {
    success: false,
    handled: true,
    errorType: 'storage',
    storageType: error.storageType,
    operation: error.operation,
    retryRecommended: isRetryable,
    recommendedAction: isRetryable ? 'retry' : 'fallback_storage',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений пользовательского интерфейса
 * @param {UIException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function uiExceptionStrategy(error, context) {
  Logger.warn(`[UI Error] ${error.toString()}`, {
    componentId: error.componentId,
    eventType: error.eventType,
    additionalContext: context
  });
  
  // Для UI ошибок можно предложить перезагрузку компонента
  return {
    success: false,
    handled: true,
    errorType: 'ui',
    componentId: error.componentId,
    eventType: error.eventType,
    recommendedAction: 'reload_component',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений обработки изображений
 * @param {ImageProcessingException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function imageProcessingExceptionStrategy(error, context) {
  Logger.error(`[Image Processing Error] ${error.toString()}`, {
    processingStage: error.processingStage,
    imageFormat: error.imageFormat,
    additionalContext: context
  });
  
  // Для ошибок обработки изображений можно предложить альтернативный алгоритм
  return {
    success: false,
    handled: true,
    errorType: 'image_processing',
    processingStage: error.processingStage,
    imageFormat: error.imageFormat,
    recommendedAction: 'use_alternative_algorithm',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений конвейера обработки
 * @param {PipelineException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function pipelineExceptionStrategy(error, context) {
  Logger.error(`[Pipeline Error] ${error.toString()}`, {
    pipelineStage: error.pipelineStage,
    pipelineId: error.pipelineId,
    additionalContext: context
  });
  
  // Для ошибок конвейера можно предложить пропуск проблемного этапа
  return {
    success: false,
    handled: true,
    errorType: 'pipeline',
    pipelineStage: error.pipelineStage,
    pipelineId: error.pipelineId,
    recommendedAction: 'skip_stage',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений интеграции
 * @param {IntegrationException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function integrationExceptionStrategy(error, context) {
  Logger.error(`[Integration Error] ${error.toString()}`, {
    serviceName: error.serviceName,
    operationType: error.operationType,
    additionalContext: context
  });
  
  // Для ошибок интеграции можно предложить использование локальной версии
  return {
    success: false,
    handled: true,
    errorType: 'integration',
    serviceName: error.serviceName,
    operationType: error.operationType,
    recommendedAction: 'use_local_fallback',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений оптимизации
 * @param {OptimizationException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function optimizationExceptionStrategy(error, context) {
  Logger.warn(`[Optimization Error] ${error.toString()}`, {
    optimizationType: error.optimizationType,
    metrics: error.metrics,
    additionalContext: context
  });
  
  // Для ошибок оптимизации можно предложить использование неоптимизированной версии
  return {
    success: false,
    handled: true,
    errorType: 'optimization',
    optimizationType: error.optimizationType,
    metrics: error.metrics,
    recommendedAction: 'use_unoptimized',
    error: error.toJSON()
  };
}

/**
 * Стратегия обработки исключений инструментов
 * @param {ToolException} error - Исключение для обработки
 * @param {Object} context - Дополнительный контекст
 * @returns {Object} Результат обработки исключения
 */
function toolExceptionStrategy(error, context) {
  Logger.error(`[Tool Error] ${error.toString()}`, {
    toolId: error.toolId,
    toolAction: error.toolAction,
    additionalContext: context
  });
  
  // Для ошибок инструментов можно предложить использование базового инструмента
  return {
    success: false,
    handled: true,
    errorType: 'tool',
    toolId: error.toolId,
    toolAction: error.toolAction,
    recommendedAction: 'use_basic_tool',
    error: error.toJSON()
  };
}

/**
 * Регистрирует все стратегии обработки исключений в глобальном обработчике
 */
function registerAllExceptionStrategies() {
  // Регистрируем стратегии для каждого типа исключений
  globalErrorHandler.registerHandler(MrComicException, baseExceptionStrategy);
  globalErrorHandler.registerHandler(ValidationException, validationExceptionStrategy);
  globalErrorHandler.registerHandler(IOException, ioExceptionStrategy);
  globalErrorHandler.registerHandler(NetworkException, networkExceptionStrategy);
  globalErrorHandler.registerHandler(OCRException, ocrExceptionStrategy);
  globalErrorHandler.registerHandler(TranslationException, translationExceptionStrategy);
  globalErrorHandler.registerHandler(PluginException, pluginExceptionStrategy);
  globalErrorHandler.registerHandler(ResourceException, resourceExceptionStrategy);
  globalErrorHandler.registerHandler(SecurityException, securityExceptionStrategy);
  globalErrorHandler.registerHandler(ConfigurationException, configurationExceptionStrategy);
  globalErrorHandler.registerHandler(StorageException, storageExceptionStrategy);
  globalErrorHandler.registerHandler(UIException, uiExceptionStrategy);
  globalErrorHandler.registerHandler(ImageProcessingException, imageProcessingExceptionStrategy);
  globalErrorHandler.registerHandler(PipelineException, pipelineExceptionStrategy);
  globalErrorHandler.registerHandler(IntegrationException, integrationExceptionStrategy);
  globalErrorHandler.registerHandler(OptimizationException, optimizationExceptionStrategy);
  globalErrorHandler.registerHandler(ToolException, toolExceptionStrategy);
  
  return globalErrorHandler;
}

// Экспортируем все стратегии и функцию регистрации
module.exports = {
  baseExceptionStrategy,
  validationExceptionStrategy,
  ioExceptionStrategy,
  networkExceptionStrategy,
  ocrExceptionStrategy,
  translationExceptionStrategy,
  pluginExceptionStrategy,
  resourceExceptionStrategy,
  securityExceptionStrategy,
  configurationExceptionStrategy,
  storageExceptionStrategy,
  uiExceptionStrategy,
  imageProcessingExceptionStrategy,
  pipelineExceptionStrategy,
  integrationExceptionStrategy,
  optimizationExceptionStrategy,
  toolExceptionStrategy,
  registerAllExceptionStrategies
};
