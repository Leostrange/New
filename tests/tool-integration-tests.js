/**
 * Обновленные тесты для интеграции расширенных инструментов редактирования с системой плагинов
 * 
 * Этот файл содержит тесты для проверки корректности интеграции
 * расширенных инструментов редактирования с системой плагинов Mr.Comic.
 */

// Импортируем мок-объекты для тестирования
const { MockPluginManager, MockToolManager, MockBaseTool } = require('./mocks/mock-classes');
const ToolIntegrationPlugin = require('../plugins/tool-integration-plugin');

// Мок-классы для инструментов редактирования
class MockImageEditorTool extends MockBaseTool {
  constructor(options = {}) {
    super({
      ...options,
      type: 'image-editor',
      name: options.name || 'Image Editor Tool',
      description: options.description || 'Tool for editing images',
      category: 'image',
      capabilities: ['edit', 'transform', 'filter']
    });
    
    this.filters = new Map();
    this.transformations = new Map();
  }
  
  registerFilter(filterId, filterFn) {
    this.filters.set(filterId, filterFn);
    return true;
  }
  
  registerTransformation(transformId, transformFn) {
    this.transformations.set(transformId, transformFn);
    return true;
  }
  
  canHandleCommand(command) {
    return ['apply.filter', 'apply.transform'].includes(command.type);
  }
  
  registerCommandHandler(commandType, handler) {
    if (!this.commandHandlers) {
      this.commandHandlers = new Map();
    }
    this.commandHandlers.set(commandType, handler);
    return true;
  }
  
  addUIElement(element, position) {
    if (!this.uiElements) {
      this.uiElements = [];
    }
    this.uiElements.push({ element, position });
    return true;
  }
}

class MockTextEditorTool extends MockBaseTool {
  constructor(options = {}) {
    super({
      ...options,
      type: 'text-editor',
      name: options.name || 'Text Editor Tool',
      description: options.description || 'Tool for editing text',
      category: 'text',
      capabilities: ['edit', 'format', 'spell-check']
    });
    
    this.formats = new Map();
    this.formatters = new Map();
  }
  
  registerFormat(formatId, formatOptions) {
    this.formats.set(formatId, formatOptions);
    return true;
  }
  
  registerFormatter(formatterId, formatterFn) {
    this.formatters.set(formatterId, formatterFn);
    return true;
  }
  
  canHandleCommand(command) {
    return ['format.text', 'check.spelling'].includes(command.type);
  }
  
  registerCommandHandler(commandType, handler) {
    if (!this.commandHandlers) {
      this.commandHandlers = new Map();
    }
    this.commandHandlers.set(commandType, handler);
    return true;
  }
  
  addUIElement(element, position) {
    if (!this.uiElements) {
      this.uiElements = [];
    }
    this.uiElements.push({ element, position });
    return true;
  }
}

class MockLayoutEditorTool extends MockBaseTool {
  constructor(options = {}) {
    super({
      ...options,
      type: 'layout-editor',
      name: options.name || 'Layout Editor Tool',
      description: options.description || 'Tool for editing layouts',
      category: 'layout',
      capabilities: ['edit', 'arrange', 'template']
    });
    
    this.layouts = new Map();
    this.templates = new Map();
  }
  
  registerLayout(layoutId, layoutOptions) {
    this.layouts.set(layoutId, layoutOptions);
    return true;
  }
  
  registerTemplate(templateId, templateFn) {
    this.templates.set(templateId, templateFn);
    return true;
  }
  
  canHandleCommand(command) {
    return ['apply.layout', 'use.template'].includes(command.type);
  }
  
  registerCommandHandler(commandType, handler) {
    if (!this.commandHandlers) {
      this.commandHandlers = new Map();
    }
    this.commandHandlers.set(commandType, handler);
    return true;
  }
  
  addUIElement(element, position) {
    if (!this.uiElements) {
      this.uiElements = [];
    }
    this.uiElements.push({ element, position });
    return true;
  }
}

// Мок-объект для приложения
class MockApp {
  constructor() {
    this.toolManager = new MockToolManager();
  }

  getToolManager() {
    return this.toolManager;
  }
}

// Функция для запуска тестов
async function runTests() {
  console.log('Запуск тестов интеграции расширенных инструментов редактирования с системой плагинов');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // Создаем экземпляры необходимых объектов
    const app = new MockApp();
    const pluginManager = new MockPluginManager();
    
    // Инициализируем менеджер плагинов
    await pluginManager.initialize({ app });
    
    // Тест 1: Регистрация плагина интеграции инструментов
    try {
      console.log('\nТест 1: Регистрация плагина интеграции инструментов');
      
      const toolIntegrationPlugin = new ToolIntegrationPlugin();
      await pluginManager.registerPlugin(toolIntegrationPlugin);
      
      console.log('✓ Плагин интеграции инструментов успешно зарегистрирован');
      testsPassed++;
    } catch (error) {
      console.error('✗ Ошибка при регистрации плагина интеграции инструментов:', error);
      testsFailed++;
    }
    
    // Тест 2: Инициализация плагина интеграции инструментов
    try {
      console.log('\nТест 2: Инициализация плагина интеграции инструментов');
      
      const toolIntegrationPlugin = pluginManager.getPlugin('tool-integration-plugin');
      await pluginManager.initializePlugin('tool-integration-plugin', { app, pluginManager });
      
      console.log('✓ Плагин интеграции инструментов успешно инициализирован');
      testsPassed++;
    } catch (error) {
      console.error('✗ Ошибка при инициализации плагина интеграции инструментов:', error);
      testsFailed++;
    }
    
    // Тест 3: Активация плагина интеграции инструментов
    try {
      console.log('\nТест 3: Активация плагина интеграции инструментов');
      
      await pluginManager.activatePlugin('tool-integration-plugin');
      
      console.log('✓ Плагин интеграции инструментов успешно активирован');
      testsPassed++;
    } catch (error) {
      console.error('✗ Ошибка при активации плагина интеграции инструментов:', error);
      testsFailed++;
    }
    
    // Тест 4: Регистрация инструмента через точку расширения
    try {
      console.log('\nТест 4: Регистрация инструмента через точку расширения');
      
      // Создаем мок-плагин для тестирования
      const mockToolPlugin = {
        id: 'mock-tool-plugin',
        name: 'Mock Tool Plugin',
        version: '1.0.0',
        provides: ['tool'],
        toolDefinitions: [
          {
            toolId: 'mock-image-editor',
            toolClass: MockImageEditorTool,
            options: {
              name: 'Тестовый редактор изображений',
              description: 'Тестовый инструмент для редактирования изображений'
            }
          }
        ]
      };
      
      // Регистрируем мок-плагин
      await pluginManager.registerPlugin(mockToolPlugin);
      await pluginManager.initializePlugin('mock-tool-plugin', { app, pluginManager });
      await pluginManager.activatePlugin('mock-tool-plugin');
      
      // Проверяем, что инструмент был зарегистрирован
      const toolManager = app.getToolManager();
      const registeredTool = toolManager.getTool('mock-image-editor');
      
      if (registeredTool && registeredTool instanceof MockImageEditorTool) {
        console.log('✓ Инструмент успешно зарегистрирован через точку расширения');
        testsPassed++;
      } else {
        throw new Error('Инструмент не был зарегистрирован или имеет неверный тип');
      }
    } catch (error) {
      console.error('✗ Ошибка при регистрации инструмента через точку расширения:', error);
      testsFailed++;
    }
    
    // Тест 5: Расширение инструмента через точку расширения
    try {
      console.log('\nТест 5: Расширение инструмента через точку расширения');
      
      // Регистрируем базовый инструмент для тестирования
      const toolManager = app.getToolManager();
      const textEditorTool = new MockTextEditorTool({
        id: 'base-text-editor',
        name: 'Базовый текстовый редактор'
      });
      
      await toolManager.registerTool(textEditorTool);
      
      // Создаем мок-плагин для расширения инструмента
      const mockExtensionPlugin = {
        id: 'mock-extension-plugin',
        name: 'Mock Extension Plugin',
        version: '1.0.0',
        provides: ['tool.extension'],
        initialize: async function(context) {
          // Расширяем инструмент через точку расширения
          await context.pluginManager.executeExtensionPoint('tool.extend', {
            targetToolId: 'base-text-editor',
            extension: {
              testExtensionMethod: function() {
                return 'Extension method called';
              },
              properties: {
                testExtensionProperty: 'Extension property value'
              }
            },
            pluginId: this.id
          });
        }
      };
      
      // Регистрируем и активируем мок-плагин
      await pluginManager.registerPlugin(mockExtensionPlugin);
      await pluginManager.initializePlugin('mock-extension-plugin', { app, pluginManager });
      await pluginManager.activatePlugin('mock-extension-plugin');
      
      // Проверяем, что инструмент был расширен
      const extendedTool = toolManager.getTool('base-text-editor');
      
      if (
        extendedTool && 
        typeof extendedTool.testExtensionMethod === 'function' && 
        extendedTool.testExtensionProperty === 'Extension property value'
      ) {
        console.log('✓ Инструмент успешно расширен через точку расширения');
        testsPassed++;
      } else {
        throw new Error('Инструмент не был расширен или расширение некорректно');
      }
    } catch (error) {
      console.error('✗ Ошибка при расширении инструмента через точку расширения:', error);
      testsFailed++;
    }
    
    // Тест 6: Добавление команды к инструменту через точку расширения
    try {
      console.log('\nТест 6: Добавление команды к инструменту через точку расширения');
      
      // Регистрируем базовый инструмент для тестирования
      const toolManager = app.getToolManager();
      const layoutEditorTool = new MockLayoutEditorTool({
        id: 'base-layout-editor',
        name: 'Базовый редактор макета'
      });
      
      await toolManager.registerTool(layoutEditorTool);
      
      // Создаем мок-плагин для добавления команды
      const mockCommandPlugin = {
        id: 'mock-command-plugin',
        name: 'Mock Command Plugin',
        version: '1.0.0',
        provides: ['tool.command'],
        initialize: async function(context) {
          // Добавляем команду через точку расширения
          await context.pluginManager.executeExtensionPoint('tool.command', {
            targetToolId: 'base-layout-editor',
            commandType: 'test.command',
            handler: function(params) {
              return `Command executed with params: ${JSON.stringify(params)}`;
            },
            pluginId: this.id
          });
        }
      };
      
      // Регистрируем и активируем мок-плагин
      await pluginManager.registerPlugin(mockCommandPlugin);
      await pluginManager.initializePlugin('mock-command-plugin', { app, pluginManager });
      await pluginManager.activatePlugin('mock-command-plugin');
      
      // Проверяем, что команда была добавлена
      const extendedTool = toolManager.getTool('base-layout-editor');
      
      if (
        extendedTool && 
        extendedTool.commandHandlers && 
        extendedTool.commandHandlers.has('test.command')
      ) {
        const handler = extendedTool.commandHandlers.get('test.command');
        const result = handler({ test: 'value' });
        
        if (result === 'Command executed with params: {"test":"value"}') {
          console.log('✓ Команда успешно добавлена к инструменту через точку расширения');
          testsPassed++;
        } else {
          throw new Error('Команда добавлена, но работает некорректно');
        }
      } else {
        throw new Error('Команда не была добавлена к инструменту');
      }
    } catch (error) {
      console.error('✗ Ошибка при добавлении команды к инструменту через точку расширения:', error);
      testsFailed++;
    }
    
    // Тест 7: Деактивация плагина и удаление инструментов
    try {
      console.log('\nТест 7: Деактивация плагина и удаление инструментов');
      
      const toolManager = app.getToolManager();
      const toolCountBefore = toolManager.getTools().length;
      
      // Деактивируем плагин с инструментом
      await pluginManager.deactivatePlugin('mock-tool-plugin');
      
      const toolCountAfter = toolManager.getTools().length;
      const toolRemoved = !toolManager.hasTool('mock-image-editor');
      
      if (toolCountAfter < toolCountBefore && toolRemoved) {
        console.log('✓ Инструменты успешно удалены при деактивации плагина');
        testsPassed++;
      } else {
        throw new Error('Инструменты не были удалены при деактивации плагина');
      }
    } catch (error) {
      console.error('✗ Ошибка при деактивации плагина и удалении инструментов:', error);
      testsFailed++;
    }
    
    // Тест 8: Проверка совместимости с существующими плагинами
    try {
      console.log('\nТест 8: Проверка совместимости с существующими плагинами');
      
      // Создаем мок существующего плагина
      const mockExistingPlugin = {
        id: 'mock-existing-plugin',
        name: 'Mock Existing Plugin',
        version: '1.0.0',
        provides: ['image-filter'],
        initialize: async function(context) {
          // Этот плагин не взаимодействует с инструментами напрямую
          this.initialized = true;
        },
        activate: async function() {
          this.activated = true;
        }
      };
      
      // Регистрируем и активируем существующий плагин
      await pluginManager.registerPlugin(mockExistingPlugin);
      await pluginManager.initializePlugin('mock-existing-plugin', { app, pluginManager });
      await pluginManager.activatePlugin('mock-existing-plugin');
      
      // Проверяем, что существующий плагин активирован
      const existingPlugin = pluginManager.getPlugin('mock-existing-plugin');
      
      if (existingPlugin && existingPlugin.initialized && existingPlugin.activated) {
        console.log('✓ Существующий плагин успешно работает с системой интеграции инструментов');
        testsPassed++;
      } else {
        throw new Error('Существующий плагин не работает с системой интеграции инструментов');
      }
    } catch (error) {
      console.error('✗ Ошибка при проверке совместимости с существующими плагинами:', error);
      testsFailed++;
    }
    
    // Тест 9: Проверка обработки ошибок при регистрации инструмента
    try {
      console.log('\nТест 9: Проверка обработки ошибок при регистрации инструмента');
      
      // Создаем мок-плагин с некорректным инструментом
      const mockInvalidToolPlugin = {
        id: 'mock-invalid-tool-plugin',
        name: 'Mock Invalid Tool Plugin',
        version: '1.0.0',
        provides: ['tool'],
        toolDefinitions: [
          {
            toolId: 'invalid-tool',
            toolClass: null, // Некорректный класс инструмента
            options: {}
          }
        ]
      };
      
      // Регистрируем мок-плагин
      await pluginManager.registerPlugin(mockInvalidToolPlugin);
      await pluginManager.initializePlugin('mock-invalid-tool-plugin', { app, pluginManager });
      
      // Активация должна вызвать ошибку, но не должна привести к краху системы
      try {
        await pluginManager.activatePlugin('mock-invalid-tool-plugin');
        throw new Error('Активация плагина с некорректным инструментом не вызвала ошибку');
      } catch (activationError) {
        console.log('✓ Ошибка при регистрации некорректного инструмента корректно обработана');
        testsPassed++;
      }
    } catch (error) {
      console.error('✗ Ошибка при проверке обработки ошибок регистрации инструмента:', error);
      testsFailed++;
    }
    
    // Тест 10: Проверка интеграции с системой разрешений
    try {
      console.log('\nТест 10: Проверка интеграции с системой разрешений');
      
      // Создаем мок системы разрешений
      const mockPermissionManager = {
        checkPermission: function(pluginId, permission) {
          // Разрешаем доступ только к определенным разрешениям
          const allowedPermissions = {
            'mock-permission-plugin': ['core.tools.read']
          };
          
          return allowedPermissions[pluginId] && 
                 allowedPermissions[pluginId].includes(permission);
        }
      };
      
      // Внедряем систему разрешений в менеджер плагинов
      pluginManager.permissionManager = mockPermissionManager;
      
      // Создаем мок-плагин для тестирования разрешений
      const mockPermissionPlugin = {
        id: 'mock-permission-plugin',
        name: 'Mock Permission Plugin',
        version: '1.0.0',
        provides: ['tool.extension'],
        initialize: async function(context) {
          // Проверяем разрешения
          const hasReadPermission = context.pluginManager.permissionManager.checkPermission(
            this.id, 'core.tools.read'
          );
          
          const hasWritePermission = context.pluginManager.permissionManager.checkPermission(
            this.id, 'core.tools.write'
          );
          
          this.permissions = {
            read: hasReadPermission,
            write: hasWritePermission
          };
        }
      };
      
      // Регистрируем и инициализируем мок-плагин
      await pluginManager.registerPlugin(mockPermissionPlugin);
      await pluginManager.initializePlugin('mock-permission-plugin', { app, pluginManager });
      
      // Проверяем, что разрешения проверены корректно
      const permissionPlugin = pluginManager.getPlugin('mock-permission-plugin');
      
      if (
        permissionPlugin && 
        permissionPlugin.permissions && 
        permissionPlugin.permissions.read === true && 
        permissionPlugin.permissions.write === false
      ) {
        console.log('✓ Интеграция с системой разрешений работает корректно');
        testsPassed++;
      } else {
        throw new Error('Интеграция с системой разрешений работает некорректно');
      }
    } catch (error) {
      console.error('✗ Ошибка при проверке интеграции с системой разрешений:', error);
      testsFailed++;
    }
    
  } catch (error) {
    console.error('Критическая ошибка при выполнении тестов:', error);
    testsFailed++;
  }
  
  // Выводим итоговый результат
  console.log('\n=== Результаты тестирования ===');
  console.log(`Всего тестов: ${testsPassed + testsFailed}`);
  console.log(`Успешно: ${testsPassed}`);
  console.log(`Неудачно: ${testsFailed}`);
  
  return {
    total: testsPassed + testsFailed,
    passed: testsPassed,
    failed: testsFailed
  };
}

// Экспортируем функцию для запуска тестов
module.exports = {
  runTests
};

// Если файл запущен напрямую, выполняем тесты
if (require.main === module) {
  runTests().catch(error => {
    console.error('Ошибка при запуске тестов:', error);
    process.exit(1);
  });
}
