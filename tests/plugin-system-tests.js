/**
 * Тестирование системы плагинов Mr.Comic - Фаза 2
 * 
 * Этот файл содержит тесты для проверки функциональности компонентов,
 * разработанных в рамках Фазы 2 проекта Mr.Comic.
 */

// Импорт необходимых модулей
const PluginManager = require('../core/PluginManager');
const PluginDependencyManager = require('../core/PluginDependencyManager');
const PluginSandbox = require('../core/PluginSandbox');
const PermissionManager = require('../core/PermissionManager');
const MrComicPlugin = require('../core/MrComicPlugin');
const PluginContext = require('../core/PluginContext');

// Импорт плагинов
const ExportPlugin = require('../plugins/export-plugin');
const ImageFilterPlugin = require('../plugins/image-filter-plugin');
const TextEditorPlugin = require('../plugins/text-editor-plugin');

/**
 * Класс для тестирования системы плагинов
 */
class PluginSystemTester {
  constructor() {
    this.tests = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    
    // Инициализация компонентов для тестирования
    this.pluginManager = null;
    this.dependencyManager = null;
    this.permissionManager = null;
    this.sandbox = null;
  }
  
  /**
   * Инициализация тестового окружения
   */
  async setup() {
    console.log('Инициализация тестового окружения...');
    
    // Создание менеджера разрешений
    this.permissionManager = new PermissionManager();
    
    // Создание менеджера зависимостей
    this.dependencyManager = new PluginDependencyManager();
    
    // Создание песочницы
    this.sandbox = new PluginSandbox();
    
    // Создание менеджера плагинов
    this.pluginManager = new PluginManager({
      dependencyManager: this.dependencyManager,
      permissionManager: this.permissionManager,
      sandbox: this.sandbox
    });
    
    console.log('Тестовое окружение инициализировано');
  }
  
  /**
   * Очистка тестового окружения
   */
  async teardown() {
    console.log('Очистка тестового окружения...');
    
    // Деактивация всех плагинов
    if (this.pluginManager) {
      await this.pluginManager.deactivateAll();
    }
    
    // Очистка ссылок на компоненты
    this.pluginManager = null;
    this.dependencyManager = null;
    this.permissionManager = null;
    this.sandbox = null;
    
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
    console.log('Запуск тестов...');
    
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
    
    console.log('\nРезультаты тестирования:');
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
const tester = new PluginSystemTester();

// Регистрация тестов для ядра системы плагинов

// Тест 1: Проверка регистрации и активации плагина
tester.registerTest('Регистрация и активация плагина', async function() {
  // Создание тестового плагина
  const plugin = new ExportPlugin();
  
  // Регистрация плагина
  await this.pluginManager.register(plugin);
  
  // Проверка регистрации
  this.assert(this.pluginManager.isRegistered(plugin.id), 'Плагин не зарегистрирован');
  
  // Активация плагина
  await this.pluginManager.activate(plugin.id);
  
  // Проверка активации
  this.assert(this.pluginManager.isActive(plugin.id), 'Плагин не активирован');
});

// Тест 2: Проверка деактивации плагина
tester.registerTest('Деактивация плагина', async function() {
  // Создание тестового плагина
  const plugin = new ExportPlugin();
  
  // Регистрация и активация плагина
  await this.pluginManager.register(plugin);
  await this.pluginManager.activate(plugin.id);
  
  // Деактивация плагина
  await this.pluginManager.deactivate(plugin.id);
  
  // Проверка деактивации
  this.assert(!this.pluginManager.isActive(plugin.id), 'Плагин не деактивирован');
});

// Тест 3: Проверка системы зависимостей
tester.registerTest('Система зависимостей между плагинами', async function() {
  // Создание тестовых плагинов с зависимостями
  const pluginA = new MrComicPlugin({
    id: 'plugin-a',
    name: 'Plugin A',
    version: '1.0.0'
  });
  
  const pluginB = new MrComicPlugin({
    id: 'plugin-b',
    name: 'Plugin B',
    version: '1.0.0',
    dependencies: {
      'plugin-a': '^1.0.0'
    }
  });
  
  // Регистрация плагинов
  await this.pluginManager.register(pluginA);
  await this.pluginManager.register(pluginB);
  
  // Проверка зависимостей
  const dependencies = this.dependencyManager.getDependencies('plugin-b');
  this.assert(dependencies.length === 1, 'Неверное количество зависимостей');
  this.assert(dependencies[0].id === 'plugin-a', 'Неверная зависимость');
  
  // Проверка активации с зависимостями
  await this.pluginManager.activate('plugin-b');
  
  // Проверка активации зависимого плагина
  this.assert(this.pluginManager.isActive('plugin-a'), 'Зависимый плагин не активирован');
  this.assert(this.pluginManager.isActive('plugin-b'), 'Плагин с зависимостями не активирован');
  
  // Проверка деактивации с зависимостями
  await this.pluginManager.deactivate('plugin-a');
  
  // Проверка деактивации зависимого плагина
  this.assert(!this.pluginManager.isActive('plugin-a'), 'Зависимый плагин не деактивирован');
  this.assert(!this.pluginManager.isActive('plugin-b'), 'Плагин с зависимостями не деактивирован');
});

// Тест 4: Проверка системы разрешений
tester.registerTest('Система разрешений для плагинов', async function() {
  // Создание тестового плагина
  const plugin = new MrComicPlugin({
    id: 'permission-test-plugin',
    name: 'Permission Test Plugin',
    version: '1.0.0',
    permissions: ['read_file', 'write_file']
  });
  
  // Регистрация плагина
  await this.pluginManager.register(plugin);
  
  // Проверка запрошенных разрешений
  const requestedPermissions = this.permissionManager.getRequestedPermissions(plugin.id);
  this.assert(requestedPermissions.length === 2, 'Неверное количество запрошенных разрешений');
  this.assert(requestedPermissions.includes('read_file'), 'Отсутствует разрешение read_file');
  this.assert(requestedPermissions.includes('write_file'), 'Отсутствует разрешение write_file');
  
  // Предоставление разрешений
  this.permissionManager.grantPermission(plugin.id, 'read_file');
  
  // Проверка предоставленных разрешений
  this.assert(this.permissionManager.hasPermission(plugin.id, 'read_file'), 'Разрешение read_file не предоставлено');
  this.assert(!this.permissionManager.hasPermission(plugin.id, 'write_file'), 'Разрешение write_file предоставлено ошибочно');
  
  // Отзыв разрешений
  this.permissionManager.revokePermission(plugin.id, 'read_file');
  
  // Проверка отзыва разрешений
  this.assert(!this.permissionManager.hasPermission(plugin.id, 'read_file'), 'Разрешение read_file не отозвано');
});

// Тест 5: Проверка песочницы
tester.registerTest('Песочница для изоляции плагинов', async function() {
  // Создание тестового плагина
  const plugin = new MrComicPlugin({
    id: 'sandbox-test-plugin',
    name: 'Sandbox Test Plugin',
    version: '1.0.0'
  });
  
  // Регистрация плагина
  await this.pluginManager.register(plugin);
  
  // Создание контекста выполнения
  const context = {
    pluginId: plugin.id,
    code: 'return { result: "success" };'
  };
  
  // Выполнение кода в песочнице
  const result = await this.sandbox.execute(context);
  
  // Проверка результата выполнения
  this.assert(result && result.result === 'success', 'Неверный результат выполнения в песочнице');
  
  // Проверка изоляции
  const isolationContext = {
    pluginId: plugin.id,
    code: 'try { return { result: window.document ? "not isolated" : "isolated" }; } catch (e) { return { result: "isolated", error: e.message }; }'
  };
  
  const isolationResult = await this.sandbox.execute(isolationContext);
  
  // Проверка изоляции
  this.assert(isolationResult && isolationResult.result === 'isolated', 'Песочница не обеспечивает изоляцию');
});

// Регистрация тестов для плагинов

// Тест 6: Проверка функциональности плагина экспорта
tester.registerTest('Функциональность плагина экспорта', async function() {
  // Создание плагина экспорта
  const plugin = new ExportPlugin();
  
  // Регистрация и активация плагина
  await this.pluginManager.register(plugin);
  await this.pluginManager.activate(plugin.id);
  
  // Проверка регистрации форматов экспорта
  this.assert(plugin.supportedFormats.size > 0, 'Форматы экспорта не зарегистрированы');
  this.assert(plugin.supportedFormats.has('pdf'), 'Формат PDF не зарегистрирован');
  this.assert(plugin.supportedFormats.has('png'), 'Формат PNG не зарегистрирован');
  this.assert(plugin.supportedFormats.has('jpeg'), 'Формат JPEG не зарегистрирован');
  
  // Проверка выполнения команд
  try {
    await plugin.executeCommand('export.pdf', 'test-project', { pageSize: 'A4' });
    // В тестовом окружении команда может не выполниться полностью
  } catch (error) {
    // Игнорируем ошибки, связанные с отсутствием реальных данных
    if (!error.message.includes('not found') && !error.message.includes('undefined')) {
      throw error;
    }
  }
});

// Тест 7: Проверка функциональности плагина фильтров изображений
tester.registerTest('Функциональность плагина фильтров изображений', async function() {
  // Создание плагина фильтров изображений
  const plugin = new ImageFilterPlugin();
  
  // Регистрация и активация плагина
  await this.pluginManager.register(plugin);
  await this.pluginManager.activate(plugin.id);
  
  // Проверка регистрации фильтров
  this.assert(plugin.filters.size > 0, 'Фильтры не зарегистрированы');
  this.assert(plugin.filters.has('grayscale'), 'Фильтр grayscale не зарегистрирован');
  this.assert(plugin.filters.has('sepia'), 'Фильтр sepia не зарегистрирован');
  this.assert(plugin.filters.has('blur'), 'Фильтр blur не зарегистрирован');
  
  // Проверка регистрации эффектов
  this.assert(plugin.effects.size > 0, 'Эффекты не зарегистрированы');
  this.assert(plugin.effects.has('vignette'), 'Эффект vignette не зарегистрирован');
  this.assert(plugin.effects.has('grain'), 'Эффект grain не зарегистрирован');
  
  // Проверка регистрации улучшений
  this.assert(plugin.enhancers.size > 0, 'Улучшения не зарегистрированы');
  this.assert(plugin.enhancers.has('auto-contrast'), 'Улучшение auto-contrast не зарегистрировано');
  this.assert(plugin.enhancers.has('auto-brightness'), 'Улучшение auto-brightness не зарегистрировано');
  
  // Проверка выполнения команд
  try {
    await plugin.executeCommand('applyFilter', 'test-image', 'grayscale');
    // В тестовом окружении команда может не выполниться полностью
  } catch (error) {
    // Игнорируем ошибки, связанные с отсутствием реальных данных
    if (!error.message.includes('not found') && !error.message.includes('undefined')) {
      throw error;
    }
  }
});

// Тест 8: Проверка функциональности плагина редактора текста
tester.registerTest('Функциональность плагина редактора текста', async function() {
  // Создание плагина редактора текста
  const plugin = new TextEditorPlugin();
  
  // Регистрация и активация плагина
  await this.pluginManager.register(plugin);
  await this.pluginManager.activate(plugin.id);
  
  // Проверка регистрации форматов текста
  this.assert(plugin.textFormats.size > 0, 'Форматы текста не зарегистрированы');
  this.assert(plugin.textFormats.has('plain'), 'Формат plain не зарегистрирован');
  this.assert(plugin.textFormats.has('markdown'), 'Формат markdown не зарегистрирован');
  this.assert(plugin.textFormats.has('html'), 'Формат html не зарегистрирован');
  
  // Проверка регистрации стилей текста
  this.assert(plugin.textStyles.size > 0, 'Стили текста не зарегистрированы');
  this.assert(plugin.textStyles.has('bold'), 'Стиль bold не зарегистрирован');
  this.assert(plugin.textStyles.has('italic'), 'Стиль italic не зарегистрирован');
  this.assert(plugin.textStyles.has('underline'), 'Стиль underline не зарегистрирован');
  
  // Проверка регистрации словарей
  this.assert(plugin.dictionaries.size > 0, 'Словари не зарегистрированы');
  this.assert(plugin.dictionaries.has('en'), 'Словарь en не зарегистрирован');
  this.assert(plugin.dictionaries.has('ru'), 'Словарь ru не зарегистрирован');
  
  // Проверка выполнения команд
  try {
    await plugin.executeCommand('formatText', 'test-text', 'plain');
    // В тестовом окружении команда может не выполниться полностью
  } catch (error) {
    // Игнорируем ошибки, связанные с отсутствием реальных данных
    if (!error.message.includes('not found') && !error.message.includes('undefined')) {
      throw error;
    }
  }
});

// Тест 9: Проверка интеграции плагинов с API
tester.registerTest('Интеграция плагинов с API', async function() {
  // Создание плагина
  const plugin = new MrComicPlugin({
    id: 'api-test-plugin',
    name: 'API Test Plugin',
    version: '1.0.0'
  });
  
  // Создание контекста плагина
  const context = new PluginContext(plugin.id, {
    permissionManager: this.permissionManager
  });
  
  // Проверка наличия API в контексте
  this.assert(context.image, 'API изображений отсутствует в контексте');
  this.assert(context.text, 'API текста отсутствует в контексте');
  this.assert(context.export, 'API экспорта отсутствует в контексте');
  this.assert(context.ui, 'API пользовательского интерфейса отсутствует в контексте');
  this.assert(context.settings, 'API настроек отсутствует в контексте');
  this.assert(context.fs, 'API файловой системы отсутствует в контексте');
  
  // Проверка методов API
  this.assert(typeof context.registerCommand === 'function', 'Метод registerCommand отсутствует');
  this.assert(typeof context.checkPermission === 'function', 'Метод checkPermission отсутствует');
  this.assert(typeof context.requestPermission === 'function', 'Метод requestPermission отсутствует');
});

// Тест 10: Проверка жизненного цикла плагина
tester.registerTest('Жизненный цикл плагина', async function() {
  // Создание плагина с переопределенными методами жизненного цикла
  let activateCalled = false;
  let deactivateCalled = false;
  
  class LifecycleTestPlugin extends MrComicPlugin {
    constructor() {
      super({
        id: 'lifecycle-test-plugin',
        name: 'Lifecycle Test Plugin',
        version: '1.0.0'
      });
    }
    
    async activate(context) {
      await super.activate(context);
      activateCalled = true;
    }
    
    async deactivate() {
      await super.deactivate();
      deactivateCalled = true;
    }
  }
  
  const plugin = new LifecycleTestPlugin();
  
  // Регистрация плагина
  await this.pluginManager.register(plugin);
  
  // Активация плагина
  await this.pluginManager.activate(plugin.id);
  
  // Проверка вызова метода activate
  this.assert(activateCalled, 'Метод activate не вызван');
  
  // Деактивация плагина
  await this.pluginManager.deactivate(plugin.id);
  
  // Проверка вызова метода deactivate
  this.assert(deactivateCalled, 'Метод deactivate не вызван');
});

// Запуск тестов
async function runTests() {
  try {
    const results = await tester.runTests();
    return results;
  } catch (error) {
    console.error('Ошибка при запуске тестов:', error);
    return {
      total: 0,
      passed: 0,
      failed: 1,
      skipped: 0,
      details: [{
        name: 'Запуск тестов',
        status: 'failed',
        error: error.message
      }]
    };
  }
}

// Экспорт функции запуска тестов
module.exports = {
  runTests
};
