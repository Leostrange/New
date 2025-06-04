/**
 * index.js
 * 
 * Точка входа для модуля обработки исключений Mr.Comic.
 * Этот файл экспортирует все необходимые классы и функции для работы с исключениями.
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

const { 
  ErrorHandler,
  globalErrorHandler 
} = require('./ErrorHandler');

const {
  LogLevel,
  LogLevelNames,
  LogAppender,
  ConsoleAppender,
  FileAppender,
  Logger,
  LoggerFactory,
  globalLoggerFactory
} = require('./Logger');

const {
  registerAllExceptionStrategies,
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
  toolExceptionStrategy
} = require('./ExceptionStrategies');

const {
  RecoveryStrategy,
  RecoveryState,
  RecoveryManager,
  globalRecoveryManager,
  withRetry,
  withCircuitBreaker,
  withTimeout,
  withFallback,
  withSnapshot
} = require('./RecoveryManager');

// Инициализация: регистрируем все стратегии обработки исключений
registerAllExceptionStrategies();

// Экспортируем все классы и функции
module.exports = {
  // Классы исключений
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
  ToolException,
  
  // Обработчик ошибок
  ErrorHandler,
  globalErrorHandler,
  
  // Логирование
  LogLevel,
  LogLevelNames,
  LogAppender,
  ConsoleAppender,
  FileAppender,
  Logger,
  LoggerFactory,
  globalLoggerFactory,
  
  // Стратегии обработки исключений
  registerAllExceptionStrategies,
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
  
  // Механизм восстановления после сбоев
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
