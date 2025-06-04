/**
 * Тестирование модуля ResourceAudit - Фаза 2
 * 
 * Этот файл содержит тесты для проверки функциональности модуля
 * аудита ресурсов ResourceAudit.
 */

// Импорт необходимых модулей
const ResourceAudit = require('../src/optimization/ResourceAudit');
const ResourceManager = require('../src/optimization/ResourceManager');
const Logger = require('../src/exceptions/Logger');

/**
 * Класс для тестирования модуля ResourceAudit
 */
class ResourceAuditTester {
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
    this.resourceAudit = null;
    this.resourceManager = null;
    this.logger = null;
  }
  
  /**
   * Инициализация тестового окружения
   */
  async setup() {
    console.log('Инициализация тестового окружения для ResourceAudit...');
    
    // Создание логгера
    this.logger = new Logger({
      logLevel: 'debug',
      logToConsole: false,
      logToFile: false
    });
    
    // Создание менеджера ресурсов
    this.resourceManager = new ResourceManager({
      logger: this.logger
    });
    
    // Создание аудитора ресурсов
    this.resourceAudit = new ResourceAudit({
      logger: this.logger,
      resourceManager: this.resourceManager
    });
    
    console.log('Тестовое окружение инициализировано');
  }
  
  /**
   * Очистка тестового окружения
   */
  async teardown() {
    console.log('Очистка тестового окружения...');
    
    // Очистка ссылок на компоненты
    this.resourceAudit = null;
    this.resourceManager = null;
    this.logger = null;
    
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
    console.log('Запуск тестов ResourceAudit...');
    
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
    
    console.log('\nРезультаты тестирования ResourceAudit:');
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
const tester = new ResourceAuditTester();

// Регистрация тестов для ResourceAudit

// Тест 1: Проверка инициализации и базовых методов
tester.registerTest('Инициализация и базовые методы', async function() {
  // Проверка инициализации
  this.assert(this.resourceAudit !== null, 'ResourceAudit не инициализирован');
  this.assert(this.resourceAudit.resourceManager !== null, 'ResourceManager не инициализирован');
  
  // Проверка базовых методов
  this.assert(typeof this.resourceAudit.startAudit === 'function', 'Метод startAudit не определен');
  this.assert(typeof this.resourceAudit.stopAudit === 'function', 'Метод stopAudit не определен');
  this.assert(typeof this.resourceAudit.getAuditResults === 'function', 'Метод getAuditResults не определен');
  this.assert(typeof this.resourceAudit.detectLeaks === 'function', 'Метод detectLeaks не определен');
  this.assert(typeof this.resourceAudit.detectFragmentation === 'function', 'Метод detectFragmentation не определен');
  this.assert(typeof this.resourceAudit.detectAnomalies === 'function', 'Метод detectAnomalies не определен');
  this.assert(typeof this.resourceAudit.optimizeResources === 'function', 'Метод optimizeResources не определен');
});

// Тест 2: Проверка запуска и остановки аудита
tester.registerTest('Запуск и остановка аудита', async function() {
  // Проверка начального состояния
  this.assert(this.resourceAudit.isRunning() === false, 'Аудит не должен быть запущен изначально');
  
  // Запуск аудита
  await this.resourceAudit.startAudit();
  
  // Проверка состояния после запуска
  this.assert(this.resourceAudit.isRunning() === true, 'Аудит должен быть запущен');
  
  // Остановка аудита
  await this.resourceAudit.stopAudit();
  
  // Проверка состояния после остановки
  this.assert(this.resourceAudit.isRunning() === false, 'Аудит должен быть остановлен');
});

// Тест 3: Проверка обнаружения утечек ресурсов
tester.registerTest('Обнаружение утечек ресурсов', async function() {
  // Создание тестовых ресурсов с утечками
  this.resourceManager.allocateResource('memory', 'test-memory', 1024);
  this.resourceManager.allocateResource('file', 'test-file', 512);
  
  // Имитация утечки - ресурс не освобождается
  
  // Запуск аудита
  await this.resourceAudit.startAudit();
  
  // Ожидание сбора данных
  await this.wait(50);
  
  // Обнаружение утечек
  const leaks = await this.resourceAudit.detectLeaks();
  
  // Проверка результатов
  this.assert(Array.isArray(leaks), 'Результат должен быть массивом');
  this.assert(leaks.length > 0, 'Должны быть обнаружены утечки');
  
  // Проверка структуры данных об утечках
  if (leaks.length > 0) {
    const leak = leaks[0];
    this.assert(typeof leak.resourceId === 'string', 'Утечка должна содержать идентификатор ресурса');
    this.assert(typeof leak.resourceType === 'string', 'Утечка должна содержать тип ресурса');
    this.assert(typeof leak.size === 'number', 'Утечка должна содержать размер');
    this.assert(typeof leak.allocationTime === 'number', 'Утечка должна содержать время выделения');
  }
  
  // Остановка аудита
  await this.resourceAudit.stopAudit();
  
  // Освобождение ресурсов
  this.resourceManager.releaseResource('memory', 'test-memory');
  this.resourceManager.releaseResource('file', 'test-file');
});

// Тест 4: Проверка обнаружения фрагментации
tester.registerTest('Обнаружение фрагментации', async function() {
  // Создание тестовых ресурсов с фрагментацией
  for (let i = 0; i < 10; i++) {
    this.resourceManager.allocateResource('memory', `test-memory-${i}`, 128);
  }
  
  // Освобождение некоторых ресурсов для создания фрагментации
  for (let i = 0; i < 10; i += 2) {
    this.resourceManager.releaseResource('memory', `test-memory-${i}`);
  }
  
  // Запуск аудита
  await this.resourceAudit.startAudit();
  
  // Ожидание сбора данных
  await this.wait(50);
  
  // Обнаружение фрагментации
  const fragmentation = await this.resourceAudit.detectFragmentation();
  
  // Проверка результатов
  this.assert(typeof fragmentation === 'object', 'Результат должен быть объектом');
  this.assert(typeof fragmentation.memory === 'object', 'Должны быть данные о фрагментации памяти');
  this.assert(typeof fragmentation.memory.fragmentationIndex === 'number', 'Должен быть индекс фрагментации');
  this.assert(fragmentation.memory.fragmentationIndex >= 0, 'Индекс фрагментации должен быть неотрицательным');
  
  // Остановка аудита
  await this.resourceAudit.stopAudit();
  
  // Освобождение оставшихся ресурсов
  for (let i = 1; i < 10; i += 2) {
    this.resourceManager.releaseResource('memory', `test-memory-${i}`);
  }
});

// Тест 5: Проверка обнаружения аномалий
tester.registerTest('Обнаружение аномалий', async function() {
  // Запуск аудита
  await this.resourceAudit.startAudit();
  
  // Создание нормального использования ресурсов
  for (let i = 0; i < 5; i++) {
    this.resourceManager.allocateResource('memory', `normal-${i}`, 100);
    await this.wait(10);
  }
  
  // Создание аномального использования ресурсов
  for (let i = 0; i < 10; i++) {
    this.resourceManager.allocateResource('memory', `anomaly-${i}`, 500);
  }
  
  // Ожидание сбора данных
  await this.wait(50);
  
  // Обнаружение аномалий
  const anomalies = await this.resourceAudit.detectAnomalies();
  
  // Проверка результатов
  this.assert(Array.isArray(anomalies), 'Результат должен быть массивом');
  
  // Проверка структуры данных об аномалиях
  if (anomalies.length > 0) {
    const anomaly = anomalies[0];
    this.assert(typeof anomaly.resourceType === 'string', 'Аномалия должна содержать тип ресурса');
    this.assert(typeof anomaly.timestamp === 'number', 'Аномалия должна содержать временную метку');
    this.assert(typeof anomaly.value === 'number', 'Аномалия должна содержать значение');
    this.assert(typeof anomaly.threshold === 'number', 'Аномалия должна содержать пороговое значение');
  }
  
  // Остановка аудита
  await this.resourceAudit.stopAudit();
  
  // Освобождение ресурсов
  for (let i = 0; i < 5; i++) {
    this.resourceManager.releaseResource('memory', `normal-${i}`);
  }
  for (let i = 0; i < 10; i++) {
    this.resourceManager.releaseResource('memory', `anomaly-${i}`);
  }
});

// Тест 6: Проверка оптимизации ресурсов
tester.registerTest('Оптимизация ресурсов', async function() {
  // Создание тестовых ресурсов для оптимизации
  for (let i = 0; i < 20; i++) {
    this.resourceManager.allocateResource('memory', `optimize-${i}`, 100 + i * 10);
  }
  
  // Запуск аудита
  await this.resourceAudit.startAudit();
  
  // Ожидание сбора данных
  await this.wait(50);
  
  // Получение начального состояния
  const initialState = this.resourceManager.getResourceUsage();
  
  // Выполнение оптимизации
  const optimizationResult = await this.resourceAudit.optimizeResources();
  
  // Проверка результатов оптимизации
  this.assert(typeof optimizationResult === 'object', 'Результат должен быть объектом');
  this.assert(typeof optimizationResult.optimizedCount === 'number', 'Должно быть количество оптимизированных ресурсов');
  this.assert(typeof optimizationResult.savedMemory === 'number', 'Должно быть количество сохраненной памяти');
  
  // Получение состояния после оптимизации
  const optimizedState = this.resourceManager.getResourceUsage();
  
  // Проверка эффективности оптимизации
  this.assert(optimizedState.memory.used <= initialState.memory.used, 'Использование памяти должно уменьшиться или остаться прежним');
  
  // Остановка аудита
  await this.resourceAudit.stopAudit();
  
  // Освобождение ресурсов
  for (let i = 0; i < 20; i++) {
    try {
      this.resourceManager.releaseResource('memory', `optimize-${i}`);
    } catch (e) {
      // Игнорируем ошибки, так как некоторые ресурсы могли быть оптимизированы
    }
  }
});

// Тест 7: Проверка получения результатов аудита
tester.registerTest('Получение результатов аудита', async function() {
  // Запуск аудита
  await this.resourceAudit.startAudit();
  
  // Создание тестовых ресурсов
  this.resourceManager.allocateResource('memory', 'audit-memory', 1024);
  this.resourceManager.allocateResource('file', 'audit-file', 512);
  
  // Ожидание сбора данных
  await this.wait(50);
  
  // Получение результатов аудита
  const results = await this.resourceAudit.getAuditResults();
  
  // Проверка структуры результатов
  this.assert(typeof results === 'object', 'Результаты должны быть объектом');
  this.assert(typeof results.timestamp === 'number', 'Результаты должны содержать временную метку');
  this.assert(typeof results.resourceUsage === 'object', 'Результаты должны содержать использование ресурсов');
  this.assert(typeof results.leaks === 'object', 'Результаты должны содержать информацию об утечках');
  this.assert(typeof results.fragmentation === 'object', 'Результаты должны содержать информацию о фрагментации');
  this.assert(typeof results.anomalies === 'object', 'Результаты должны содержать информацию об аномалиях');
  
  // Остановка аудита
  await this.resourceAudit.stopAudit();
  
  // Освобождение ресурсов
  this.resourceManager.releaseResource('memory', 'audit-memory');
  this.resourceManager.releaseResource('file', 'audit-file');
});

// Тест 8: Проверка автоматической оптимизации
tester.registerTest('Автоматическая оптимизация', async function() {
  // Запуск аудита с автоматической оптимизацией
  await this.resourceAudit.startAudit({ autoOptimize: true, optimizationInterval: 50 });
  
  // Создание тестовых ресурсов
  for (let i = 0; i < 10; i++) {
    this.resourceManager.allocateResource('memory', `auto-optimize-${i}`, 200);
  }
  
  // Ожидание автоматической оптимизации
  await this.wait(100);
  
  // Проверка, что оптимизация была выполнена
  const optimizationHistory = this.resourceAudit.getOptimizationHistory();
  
  this.assert(Array.isArray(optimizationHistory), 'История оптимизации должна быть массивом');
  this.assert(optimizationHistory.length > 0, 'История оптимизации должна содержать записи');
  
  // Остановка аудита
  await this.resourceAudit.stopAudit();
  
  // Освобождение ресурсов
  for (let i = 0; i < 10; i++) {
    try {
      this.resourceManager.releaseResource('memory', `auto-optimize-${i}`);
    } catch (e) {
      // Игнорируем ошибки, так как некоторые ресурсы могли быть оптимизированы
    }
  }
});

// Тест 9: Проверка обработки ошибок
tester.registerTest('Обработка ошибок', async function() {
  // Проверка обработки некорректных параметров
  try {
    await this.resourceAudit.startAudit({ optimizationInterval: -1 });
    this.assert(false, 'Должно быть выброшено исключение при отрицательном интервале оптимизации');
  } catch (error) {
    this.assert(error.message.includes('interval') || error.message.includes('Invalid'), 'Неверное сообщение об ошибке');
  }
  
  // Проверка обработки ошибок при оптимизации несуществующего ресурса
  try {
    await this.resourceAudit.optimizeResource('nonexistent', 'nonexistent-id');
    this.assert(false, 'Должно быть выброшено исключение при оптимизации несуществующего ресурса');
  } catch (error) {
    this.assert(error.message.includes('not found') || error.message.includes('exist'), 'Неверное сообщение об ошибке');
  }
  
  // Проверка обработки ошибок при остановке незапущенного аудита
  try {
    // Убедимся, что аудит не запущен
    if (this.resourceAudit.isRunning()) {
      await this.resourceAudit.stopAudit();
    }
    
    // Попытка остановить незапущенный аудит
    await this.resourceAudit.stopAudit();
    
    // Если исключение не выброшено, проверяем, что аудит действительно не запущен
    this.assert(this.resourceAudit.isRunning() === false, 'Аудит не должен быть запущен');
  } catch (error) {
    // Если исключение выброшено, проверяем его сообщение
    this.assert(error.message.includes('not running') || error.message.includes('started'), 'Неверное сообщение об ошибке');
  }
});

// Экспорт функции для запуска тестов
module.exports = {
  runTests: async () => {
    return await tester.runTests();
  }
};
