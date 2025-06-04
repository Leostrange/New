/**
 * Тестирование системы обработки исключений - Фаза 2
 * 
 * Этот файл содержит тесты для проверки функциональности компонентов
 * обработки исключений, разработанных в рамках Фазы 1 проекта Mr.Comic.
 */

// Импорт необходимых модулей
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
} = require('../src/exceptions/ExceptionHierarchy');

const { ExceptionStrategies } = require('../src/exceptions/ExceptionStrategies');
const { RecoveryManager } = require('../src/exceptions/RecoveryManager');
const ErrorHandler = require('../src/exceptions/ErrorHandler');
const Logger = require('../src/exceptions/Logger');

/**
 * Класс для тестирования системы обработки исключений
 */
class ExceptionManagerTester {
  constructor() {
    this.tests = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    // Инициализация компонентов для тестирования
    this.errorHandler = null;
    this.logger = null;
    this.recoveryManager = null;
    this.exceptionStrategies = null;
  }
  
  /**
   * Инициализация тестового окружения
   */
  async setup() {
    console.log('Инициализация тестового окружения для системы исключений...');
    
    // Создание логгера
    this.logger = new Logger({
      logLevel: 'debug',
      logToConsole: false,
      logToFile: false
    });
    
    // Создание обработчика ошибок
    this.errorHandler = new ErrorHandler({
      logger: this.logger
    });
    
    // Создание стратегий обработки исключений
    this.exceptionStrategies = new ExceptionStrategies({
      logger: this.logger,
      errorHandler: this.errorHandler
    });
    
    // Создание менеджера восстановления
    this.recoveryManager = new RecoveryManager({
      logger: this.logger,
      errorHandler: this.errorHandler
    });
    
    console.log('Тестовое окружение инициализировано');
  }
  
  /**
   * Очистка тестового окружения
   */
  async teardown() {
    console.log('Очистка тестового окружения...');
    
    // Очистка ссылок на компоненты
    this.errorHandler = null;
    this.logger = null;
    this.recoveryManager = null;
    this.exceptionStrategies = null;
    
    console.log('Тестовое окружение очищено');
  }
  
  /**
   * Регистрация теста
   * @param {string} name - Название теста
   * @param {Function} testFn - Функция теста
   */
  registerTest(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  /**
   * Запуск всех зарегистрированных тестов
   */
  async runTests() {
    console.log('Запуск тестов системы исключений...');
    
    this.results = {
      total: this.tests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    for (const test of this.tests) {
      console.log(`\nТест: ${test.name}`);
      
      try {
        // Инициализация тестового окружения
        await this.setup();
        
        // Запуск теста
        const startTime = Date.now();
        await test.testFn.call(this);
        const endTime = Date.now();
        
        console.log(`✅ Тест пройден (${endTime - startTime}ms)`);
        
        this.results.passed++;
        this.results.details.push({
          name: test.name,
          status: 'passed',
          duration: endTime - startTime
        });
      } catch (error) {
        if (error.message === 'SKIP') {
          console.log('⚠️ Тест пропущен');
          
          this.results.skipped++;
          this.results.details.push({
            name: test.name,
            status: 'skipped'
          });
        } else {
          console.error(`❌ Тест не пройден: ${error.message}`);
          console.error(error.stack);
          
          this.results.failed++;
          this.results.details.push({
            name: test.name,
            status: 'failed',
            error: error.message
          });
        }
      } finally {
        // Очистка тестового окружения
        await this.teardown();
      }
    }
    
    console.log('\nРезультаты тестирования системы исключений:');
    console.log(`Всего тестов: ${this.results.total}`);
    console.log(`Пройдено: ${this.results.passed}`);
    console.log(`Не пройдено: ${this.results.failed}`);
    console.log(`Пропущено: ${this.results.skipped}`);
    
    return this.results;
  }
  
  /**
   * Проверка условия
   * @param {boolean} condition - Проверяемое условие
   * @param {string} message - Сообщение об ошибке
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  /**
   * Пропуск теста
   */
  skip() {
    throw new Error('SKIP');
  }
  
  /**
   * Ожидание указанного времени
   * @param {number} ms - Время ожидания в миллисекундах
   * @returns {Promise<void>}
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Создание экземпляра тестера
const tester = new ExceptionManagerTester();

// Регистрация тестов для системы исключений

// Тест 1: Проверка иерархии исключений
tester.registerTest('Иерархия исключений', async function() {
  // Создание базового исключения
  const baseException = new MrComicException('Базовая ошибка');
  
  // Проверка типа исключения
  this.assert(baseException instanceof MrComicException, 'Неверный тип базового исключения');
  this.assert(baseException instanceof Error, 'Базовое исключение не наследуется от Error');
  
  // Создание специализированных исключений
  const validationException = new ValidationException('Ошибка валидации');
  const ioException = new IOException('Ошибка ввода-вывода');
  const networkException = new NetworkException('Ошибка сети');
  const ocrException = new OCRException('Ошибка OCR');
  const translationException = new TranslationException('Ошибка перевода');
  const pluginException = new PluginException('Ошибка плагина');
  const resourceException = new ResourceException('Ошибка ресурса');
  const securityException = new SecurityException('Ошибка безопасности');
  const configurationException = new ConfigurationException('Ошибка конфигурации');
  const storageException = new StorageException('Ошибка хранилища');
  const uiException = new UIException('Ошибка пользовательского интерфейса');
  const imageProcessingException = new ImageProcessingException('Ошибка обработки изображения');
  const pipelineException = new PipelineException('Ошибка конвейера');
  const integrationException = new IntegrationException('Ошибка интеграции');
  const optimizationException = new OptimizationException('Ошибка оптимизации');
  const toolException = new ToolException('Ошибка инструмента');
  
  // Проверка типов специализированных исключений
  this.assert(validationException instanceof ValidationException, 'Неверный тип ValidationException');
  this.assert(validationException instanceof MrComicException, 'ValidationException не наследуется от MrComicException');
  
  this.assert(ioException instanceof IOException, 'Неверный тип IOException');
  this.assert(ioException instanceof MrComicException, 'IOException не наследуется от MrComicException');
  
  this.assert(networkException instanceof NetworkException, 'Неверный тип NetworkException');
  this.assert(networkException instanceof MrComicException, 'NetworkException не наследуется от MrComicException');
  
  this.assert(ocrException instanceof OCRException, 'Неверный тип OCRException');
  this.assert(ocrException instanceof MrComicException, 'OCRException не наследуется от MrComicException');
  
  this.assert(translationException instanceof TranslationException, 'Неверный тип TranslationException');
  this.assert(translationException instanceof MrComicException, 'TranslationException не наследуется от MrComicException');
  
  this.assert(pluginException instanceof PluginException, 'Неверный тип PluginException');
  this.assert(pluginException instanceof MrComicException, 'PluginException не наследуется от MrComicException');
  
  this.assert(resourceException instanceof ResourceException, 'Неверный тип ResourceException');
  this.assert(resourceException instanceof MrComicException, 'ResourceException не наследуется от MrComicException');
  
  this.assert(securityException instanceof SecurityException, 'Неверный тип SecurityException');
  this.assert(securityException instanceof MrComicException, 'SecurityException не наследуется от MrComicException');
  
  this.assert(configurationException instanceof ConfigurationException, 'Неверный тип ConfigurationException');
  this.assert(configurationException instanceof MrComicException, 'ConfigurationException не наследуется от MrComicException');
  
  this.assert(storageException instanceof StorageException, 'Неверный тип StorageException');
  this.assert(storageException instanceof MrComicException, 'StorageException не наследуется от MrComicException');
  
  this.assert(uiException instanceof UIException, 'Неверный тип UIException');
  this.assert(uiException instanceof MrComicException, 'UIException не наследуется от MrComicException');
  
  this.assert(imageProcessingException instanceof ImageProcessingException, 'Неверный тип ImageProcessingException');
  this.assert(imageProcessingException instanceof MrComicException, 'ImageProcessingException не наследуется от MrComicException');
  
  this.assert(pipelineException instanceof PipelineException, 'Неверный тип PipelineException');
  this.assert(pipelineException instanceof MrComicException, 'PipelineException не наследуется от MrComicException');
  
  this.assert(integrationException instanceof IntegrationException, 'Неверный тип IntegrationException');
  this.assert(integrationException instanceof MrComicException, 'IntegrationException не наследуется от MrComicException');
  
  this.assert(optimizationException instanceof OptimizationException, 'Неверный тип OptimizationException');
  this.assert(optimizationException instanceof MrComicException, 'OptimizationException не наследуется от MrComicException');
  
  this.assert(toolException instanceof ToolException, 'Неверный тип ToolException');
  this.assert(toolException instanceof MrComicException, 'ToolException не наследуется от MrComicException');
});

// Тест 2: Проверка методов базового исключения
tester.registerTest('Методы базового исключения', async function() {
  // Создание исключения с контекстом и причиной
  const cause = new Error('Причина ошибки');
  const context = { operation: 'test', params: { id: 123 } };
  const exception = new MrComicException('Тестовая ошибка', context, cause);
  
  // Проверка сообщения
  this.assert(exception.message === 'Тестовая ошибка', 'Неверное сообщение исключения');
  
  // Проверка контекста
  this.assert(exception.context === context, 'Неверный контекст исключения');
  this.assert(exception.context.operation === 'test', 'Неверное значение поля operation в контексте');
  this.assert(exception.context.params.id === 123, 'Неверное значение поля id в контексте');
  
  // Проверка причины
  this.assert(exception.cause === cause, 'Неверная причина исключения');
  this.assert(exception.cause.message === 'Причина ошибки', 'Неверное сообщение причины исключения');
  
  // Проверка метода toJSON
  const json = exception.toJSON();
  this.assert(json.message === 'Тестовая ошибка', 'Неверное сообщение в JSON');
  this.assert(json.context.operation === 'test', 'Неверный контекст в JSON');
  this.assert(json.cause.message === 'Причина ошибки', 'Неверная причина в JSON');
  
  // Проверка метода toString
  const str = exception.toString();
  this.assert(str.includes('Тестовая ошибка'), 'Строковое представление не содержит сообщение');
  this.assert(str.includes('test'), 'Строковое представление не содержит контекст');
  this.assert(str.includes('Причина ошибки'), 'Строковое представление не содержит причину');
});

// Тест 3: Проверка стратегий обработки исключений
tester.registerTest('Стратегии обработки исключений', async function() {
  // Регистрация стратегий
  this.exceptionStrategies.registerStrategy(ValidationException, (exception) => {
    return { handled: true, action: 'validate', message: exception.message };
  });
  
  this.exceptionStrategies.registerStrategy(IOException, (exception) => {
    return { handled: true, action: 'retry', message: exception.message };
  });
  
  // Проверка обработки исключений
  const validationException = new ValidationException('Ошибка валидации');
  const validationResult = this.exceptionStrategies.handleException(validationException);
  
  this.assert(validationResult.handled === true, 'Исключение не обработано');
  this.assert(validationResult.action === 'validate', 'Неверное действие для ValidationException');
  
  const ioException = new IOException('Ошибка ввода-вывода');
  const ioResult = this.exceptionStrategies.handleException(ioException);
  
  this.assert(ioResult.handled === true, 'Исключение не обработано');
  this.assert(ioResult.action === 'retry', 'Неверное действие для IOException');
  
  // Проверка обработки неизвестного исключения
  const unknownException = new Error('Неизвестная ошибка');
  const unknownResult = this.exceptionStrategies.handleException(unknownException);
  
  this.assert(unknownResult.handled === false, 'Неизвестное исключение не должно быть обработано');
});

// Тест 4: Проверка механизма восстановления после сбоев
tester.registerTest('Механизм восстановления после сбоев', async function() {
  // Проверка метода retry
  let attempts = 0;
  const successAfterRetries = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Временная ошибка');
    }
    return 'success';
  };
  
  const retryResult = await this.recoveryManager.withRetry(successAfterRetries, { maxRetries: 5, delay: 10 });
  
  this.assert(retryResult === 'success', 'Неверный результат после повторных попыток');
  this.assert(attempts === 3, 'Неверное количество попыток');
  
  // Проверка метода fallback
  const failingFunction = async () => {
    throw new Error('Критическая ошибка');
  };
  
  const fallbackResult = await this.recoveryManager.withFallback(failingFunction, () => 'fallback');
  
  this.assert(fallbackResult === 'fallback', 'Неверный результат после использования fallback');
  
  // Проверка метода timeout
  const slowFunction = async () => {
    await this.wait(100);
    return 'slow result';
  };
  
  try {
    await this.recoveryManager.withTimeout(slowFunction, 10);
    this.assert(false, 'Должно быть выброшено исключение по таймауту');
  } catch (error) {
    this.assert(error.message.includes('timeout') || error.message.includes('timed out'), 'Неверное сообщение об ошибке таймаута');
  }
  
  // Проверка метода circuitBreaker
  let circuitBreakerCalls = 0;
  const failingCircuitFunction = async () => {
    circuitBreakerCalls++;
    throw new Error('Ошибка сервиса');
  };
  
  // Первый вызов - должен попытаться выполнить функцию
  try {
    await this.recoveryManager.withCircuitBreaker(failingCircuitFunction, { threshold: 2, resetTimeout: 50 });
    this.assert(false, 'Должно быть выброшено исключение');
  } catch (error) {
    this.assert(error.message === 'Ошибка сервиса', 'Неверное сообщение об ошибке');
  }
  
  // Второй вызов - должен попытаться выполнить функцию
  try {
    await this.recoveryManager.withCircuitBreaker(failingCircuitFunction, { threshold: 2, resetTimeout: 50 });
    this.assert(false, 'Должно быть выброшено исключение');
  } catch (error) {
    this.assert(error.message === 'Ошибка сервиса', 'Неверное сообщение об ошибке');
  }
  
  // Третий вызов - должен сразу выбросить исключение CircuitBreakerOpenError
  try {
    await this.recoveryManager.withCircuitBreaker(failingCircuitFunction, { threshold: 2, resetTimeout: 50 });
    this.assert(false, 'Должно быть выброшено исключение CircuitBreakerOpenError');
  } catch (error) {
    this.assert(error.message.includes('Circuit breaker'), 'Неверное сообщение об ошибке circuit breaker');
  }
  
  this.assert(circuitBreakerCalls === 2, 'Неверное количество вызовов функции');
});

// Тест 5: Проверка интеграции с логгером
tester.registerTest('Интеграция с логгером', async function() {
  // Создание логгера с перехватом сообщений
  const logMessages = [];
  const testLogger = new Logger({
    logLevel: 'debug',
    logToConsole: false,
    logToFile: false,
    customHandler: (level, message) => {
      logMessages.push({ level, message });
    }
  });
  
  // Логирование сообщений
  testLogger.debug('Отладочное сообщение');
  testLogger.info('Информационное сообщение');
  testLogger.warn('Предупреждение');
  testLogger.error('Ошибка');
  
  // Проверка количества сообщений
  this.assert(logMessages.length === 4, 'Неверное количество сообщений лога');
  
  // Проверка уровней сообщений
  this.assert(logMessages[0].level === 'debug', 'Неверный уровень для отладочного сообщения');
  this.assert(logMessages[1].level === 'info', 'Неверный уровень для информационного сообщения');
  this.assert(logMessages[2].level === 'warn', 'Неверный уровень для предупреждения');
  this.assert(logMessages[3].level === 'error', 'Неверный уровень для ошибки');
  
  // Проверка содержимого сообщений
  this.assert(logMessages[0].message === 'Отладочное сообщение', 'Неверное отладочное сообщение');
  this.assert(logMessages[1].message === 'Информационное сообщение', 'Неверное информационное сообщение');
  this.assert(logMessages[2].message === 'Предупреждение', 'Неверное предупреждение');
  this.assert(logMessages[3].message === 'Ошибка', 'Неверное сообщение об ошибке');
  
  // Проверка фильтрации по уровню
  const infoLogger = new Logger({
    logLevel: 'info',
    logToConsole: false,
    logToFile: false,
    customHandler: () => {}
  });
  
  this.assert(infoLogger.shouldLog('debug') === false, 'Отладочные сообщения не должны логироваться');
  this.assert(infoLogger.shouldLog('info') === true, 'Информационные сообщения должны логироваться');
  this.assert(infoLogger.shouldLog('warn') === true, 'Предупреждения должны логироваться');
  this.assert(infoLogger.shouldLog('error') === true, 'Ошибки должны логироваться');
});

// Тест 6: Проверка обработки ошибок
tester.registerTest('Обработка ошибок', async function() {
  // Создание обработчика ошибок с перехватом обработанных ошибок
  const handledErrors = [];
  const testErrorHandler = new ErrorHandler({
    logger: this.logger,
    onErrorHandled: (error, result) => {
      handledErrors.push({ error, result });
    }
  });
  
  // Регистрация обработчиков
  testErrorHandler.registerHandler(ValidationException, (error) => {
    return { handled: true, action: 'validate', message: error.message };
  });
  
  testErrorHandler.registerHandler(IOException, (error) => {
    return { handled: true, action: 'retry', message: error.message };
  });
  
  // Обработка исключений
  const validationException = new ValidationException('Ошибка валидации');
  const validationResult = testErrorHandler.handleError(validationException);
  
  this.assert(validationResult.handled === true, 'Исключение не обработано');
  this.assert(validationResult.action === 'validate', 'Неверное действие для ValidationException');
  
  const ioException = new IOException('Ошибка ввода-вывода');
  const ioResult = testErrorHandler.handleError(ioException);
  
  this.assert(ioResult.handled === true, 'Исключение не обработано');
  this.assert(ioResult.action === 'retry', 'Неверное действие для IOException');
  
  // Проверка обработки неизвестного исключения
  const unknownException = new Error('Неизвестная ошибка');
  const unknownResult = testErrorHandler.handleError(unknownException);
  
  this.assert(unknownResult.handled === false, 'Неизвестное исключение не должно быть обработано');
  
  // Проверка количества обработанных ошибок
  this.assert(handledErrors.length === 2, 'Неверное количество обработанных ошибок');
  
  // Проверка типов обработанных ошибок
  this.assert(handledErrors[0].error instanceof ValidationException, 'Первая обработанная ошибка должна быть ValidationException');
  this.assert(handledErrors[1].error instanceof IOException, 'Вторая обработанная ошибка должна быть IOException');
});

// Тест 7: Проверка создания снимков состояния
tester.registerTest('Создание снимков состояния', async function() {
  // Создание состояния
  const state = {
    id: 1,
    name: 'Test',
    data: {
      value: 42,
      items: [1, 2, 3]
    }
  };
  
  // Создание снимка
  const snapshot = this.recoveryManager.createSnapshot(state);
  
  // Проверка идентификатора снимка
  this.assert(typeof snapshot.id === 'string', 'Идентификатор снимка должен быть строкой');
  this.assert(snapshot.id.length > 0, 'Идентификатор снимка не должен быть пустым');
  
  // Проверка времени создания снимка
  this.assert(typeof snapshot.timestamp === 'number', 'Время создания снимка должно быть числом');
  this.assert(snapshot.timestamp > 0, 'Время создания снимка должно быть положительным');
  
  // Проверка данных снимка
  this.assert(snapshot.state.id === 1, 'Неверное значение id в снимке');
  this.assert(snapshot.state.name === 'Test', 'Неверное значение name в снимке');
  this.assert(snapshot.state.data.value === 42, 'Неверное значение data.value в снимке');
  this.assert(Array.isArray(snapshot.state.data.items), 'data.items должен быть массивом');
  this.assert(snapshot.state.data.items.length === 3, 'Неверная длина массива data.items');
  
  // Изменение оригинального состояния
  state.name = 'Modified';
  state.data.value = 100;
  state.data.items.push(4);
  
  // Проверка, что снимок не изменился
  this.assert(snapshot.state.name === 'Test', 'Значение name в снимке не должно измениться');
  this.assert(snapshot.state.data.value === 42, 'Значение data.value в снимке не должно измениться');
  this.assert(snapshot.state.data.items.length === 3, 'Длина массива data.items в снимке не должна измениться');
  
  // Восстановление из снимка
  const restored = this.recoveryManager.restoreFromSnapshot(snapshot);
  
  // Проверка восстановленного состояния
  this.assert(restored.id === 1, 'Неверное значение id в восстановленном состоянии');
  this.assert(restored.name === 'Test', 'Неверное значение name в восстановленном состоянии');
  this.assert(restored.data.value === 42, 'Неверное значение data.value в восстановленном состоянии');
  this.assert(Array.isArray(restored.data.items), 'data.items должен быть массивом в восстановленном состоянии');
  this.assert(restored.data.items.length === 3, 'Неверная длина массива data.items в восстановленном состоянии');
});

// Тест 8: Проверка обработки вложенных исключений
tester.registerTest('Обработка вложенных исключений', async function() {
  // Создание вложенных исключений
  const level3 = new NetworkException('Ошибка сети');
  const level2 = new OCRException('Ошибка OCR', { operation: 'recognize' }, level3);
  const level1 = new PipelineException('Ошибка конвейера', { step: 'ocr' }, level2);
  
  // Проверка структуры вложенных исключений
  this.assert(level1.cause === level2, 'Неверная причина для level1');
  this.assert(level2.cause === level3, 'Неверная причина для level2');
  
  // Проверка контекста
  this.assert(level1.context.step === 'ocr', 'Неверный контекст для level1');
  this.assert(level2.context.operation === 'recognize', 'Неверный контекст для level2');
  
  // Проверка метода toJSON для вложенных исключений
  const json = level1.toJSON();
  
  this.assert(json.message === 'Ошибка конвейера', 'Неверное сообщение в JSON');
  this.assert(json.context.step === 'ocr', 'Неверный контекст в JSON');
  this.assert(json.cause.message === 'Ошибка OCR', 'Неверное сообщение причины в JSON');
  this.assert(json.cause.context.operation === 'recognize', 'Неверный контекст причины в JSON');
  this.assert(json.cause.cause.message === 'Ошибка сети', 'Неверное сообщение причины причины в JSON');
  
  // Проверка метода toString для вложенных исключений
  const str = level1.toString();
  
  this.assert(str.includes('Ошибка конвейера'), 'Строковое представление не содержит сообщение level1');
  this.assert(str.includes('ocr'), 'Строковое представление не содержит контекст level1');
  this.assert(str.includes('Ошибка OCR'), 'Строковое представление не содержит сообщение level2');
  this.assert(str.includes('recognize'), 'Строковое представление не содержит контекст level2');
  this.assert(str.includes('Ошибка сети'), 'Строковое представление не содержит сообщение level3');
});

// Тест 9: Проверка комбинированных стратегий восстановления
tester.registerTest('Комбинированные стратегии восстановления', async function() {
  // Комбинация retry и fallback
  let attempts = 0;
  const failingFunction = async () => {
    attempts++;
    throw new Error('Временная ошибка');
  };
  
  const result = await this.recoveryManager.withFallback(
    async () => {
      return await this.recoveryManager.withRetry(failingFunction, { maxRetries: 3, delay: 10 });
    },
    () => 'fallback result'
  );
  
  this.assert(result === 'fallback result', 'Неверный результат после комбинации retry и fallback');
  this.assert(attempts === 4, 'Неверное количество попыток'); // 3 повторные попытки + 1 исходная
  
  // Комбинация timeout и circuit breaker
  let timeoutCalls = 0;
  const slowFunction = async () => {
    timeoutCalls++;
    await this.wait(50);
    return 'slow result';
  };
  
  try {
    await this.recoveryManager.withCircuitBreaker(
      async () => {
        return await this.recoveryManager.withTimeout(slowFunction, 10);
      },
      { threshold: 2, resetTimeout: 50 }
    );
    this.assert(false, 'Должно быть выброшено исключение');
  } catch (error) {
    this.assert(error.message.includes('timeout') || error.message.includes('timed out'), 'Неверное сообщение об ошибке');
  }
  
  try {
    await this.recoveryManager.withCircuitBreaker(
      async () => {
        return await this.recoveryManager.withTimeout(slowFunction, 10);
      },
      { threshold: 2, resetTimeout: 50 }
    );
    this.assert(false, 'Должно быть выброшено исключение');
  } catch (error) {
    this.assert(error.message.includes('timeout') || error.message.includes('timed out'), 'Неверное сообщение об ошибке');
  }
  
  try {
    await this.recoveryManager.withCircuitBreaker(
      async () => {
        return await this.recoveryManager.withTimeout(slowFunction, 10);
      },
      { threshold: 2, resetTimeout: 50 }
    );
    this.assert(false, 'Должно быть выброшено исключение CircuitBreakerOpenError');
  } catch (error) {
    this.assert(error.message.includes('Circuit breaker'), 'Неверное сообщение об ошибке circuit breaker');
  }
  
  this.assert(timeoutCalls === 2, 'Неверное количество вызовов функции');
});

// Экспорт функции для запуска тестов
module.exports = {
  runTests: async () => {
    return await tester.runTests();
  }
};
