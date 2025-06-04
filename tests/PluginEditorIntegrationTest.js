/**
 * PluginEditorIntegrationTest.js
 * 
 * Модульные тесты для интеграции системы плагинов с инструментами редактирования
 */

const assert = require('assert');
const EventEmitter = require('events');
const PluginEditorIntegration = require('../src/integration/PluginEditorIntegration');

// Мок-объекты для тестирования
const createMocks = () => {
    const eventEmitter = new EventEmitter();
    
    const pluginManager = {
        exposeAPI: jest.fn(),
        handleEvent: jest.fn(),
        getLoadedPlugins: jest.fn().mockReturnValue(['plugin1', 'plugin2']),
        getPluginInfo: jest.fn().mockImplementation((pluginId) => {
            if (pluginId === 'plugin1') {
                return {
                    manifest: {
                        requiredAPIs: ['imageEditor', 'textEditor'],
                        eventSubscriptions: ['imageLoaded', 'textUpdated'],
                        allowedEvents: ['applyImageFilter', 'updateTextBlock'],
                        uiExtensions: {
                            toolbar: [
                                { type: 'button', id: 'btn1', label: 'Button 1' }
                            ]
                        }
                    }
                };
            }
            return null;
        })
    };
    
    const imageEditor = {
        getImageData: jest.fn().mockReturnValue({ width: 800, height: 600, data: new Uint8Array(100) }),
        applyFilter: jest.fn().mockResolvedValue(true)
    };
    
    const textEditor = {
        getTextBlocks: jest.fn().mockReturnValue([
            { id: 'text1', text: 'Sample text 1' },
            { id: 'text2', text: 'Sample text 2' }
        ]),
        updateTextBlock: jest.fn().mockResolvedValue(true)
    };
    
    const layoutEditor = {
        getBubbles: jest.fn().mockReturnValue([
            { id: 'bubble1', textBlockId: 'text1', bounds: { x: 10, y: 10, width: 100, height: 50 } }
        ])
    };
    
    const ocrEditorIntegration = {
        performOCR: jest.fn().mockResolvedValue([
            { id: 'text1', text: 'OCR text 1' }
        ]),
        resultCache: new Map()
    };
    
    const translationEditorIntegration = {
        performTranslation: jest.fn().mockResolvedValue({
            textBlockId: 'text1',
            sourceText: 'Source text',
            translatedText: 'Translated text',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        }),
        translationCache: new Map()
    };
    
    const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };
    
    return {
        eventEmitter,
        pluginManager,
        imageEditor,
        textEditor,
        layoutEditor,
        ocrEditorIntegration,
        translationEditorIntegration,
        logger
    };
};

describe('PluginEditorIntegration', () => {
    let mocks;
    let integration;
    
    beforeEach(() => {
        mocks = createMocks();
        integration = new PluginEditorIntegration({
            pluginManager: mocks.pluginManager,
            imageEditor: mocks.imageEditor,
            textEditor: mocks.textEditor,
            layoutEditor: mocks.layoutEditor,
            ocrEditorIntegration: mocks.ocrEditorIntegration,
            translationEditorIntegration: mocks.translationEditorIntegration,
            eventEmitter: mocks.eventEmitter,
            logger: mocks.logger
        });
        
        integration.initialize();
    });
    
    afterEach(() => {
        integration.dispose();
        jest.clearAllMocks();
    });
    
    test('should initialize correctly', () => {
        expect(integration.isInitialized).toBe(true);
        expect(mocks.logger.info).toHaveBeenCalledWith('PluginEditorIntegration: Initialized successfully');
    });
    
    test('should not initialize twice', () => {
        integration.initialize();
        expect(mocks.logger.warn).toHaveBeenCalledWith('PluginEditorIntegration: Already initialized');
    });
    
    test('should register plugin APIs', () => {
        expect(integration.apiExtensions.size).toBeGreaterThan(0);
        expect(integration.apiExtensions.has('imageEditor')).toBe(true);
        expect(integration.apiExtensions.has('textEditor')).toBe(true);
        expect(integration.apiExtensions.has('ocr')).toBe(true);
        expect(integration.apiExtensions.has('translation')).toBe(true);
    });
    
    test('should register UI extension points', () => {
        expect(integration.uiExtensionPoints.size).toBeGreaterThan(0);
        expect(integration.uiExtensionPoints.has('toolbar')).toBe(true);
        expect(integration.uiExtensionPoints.has('sidebar')).toBe(true);
        expect(integration.uiExtensionPoints.has('contextMenu')).toBe(true);
        expect(integration.uiExtensionPoints.has('modal')).toBe(true);
    });
    
    test('should handle plugin loaded event', () => {
        // Spy on methods
        const exposeAPISpy = jest.spyOn(integration, 'exposeAPIsToPlugin');
        const registerHandlersSpy = jest.spyOn(integration, 'registerPluginEventHandlers');
        const initUISpy = jest.spyOn(integration, 'initializePluginUI');
        
        // Emit plugin loaded event
        mocks.eventEmitter.emit('pluginManager:pluginLoaded', {
            pluginId: 'plugin1',
            pluginInfo: mocks.pluginManager.getPluginInfo('plugin1')
        });
        
        // Check if methods were called
        expect(exposeAPISpy).toHaveBeenCalledWith('plugin1', expect.any(Object));
        expect(registerHandlersSpy).toHaveBeenCalledWith('plugin1', expect.any(Object));
        expect(initUISpy).toHaveBeenCalledWith('plugin1', expect.any(Object));
    });
    
    test('should handle plugin unloaded event', () => {
        // Spy on methods
        const unregisterHandlersSpy = jest.spyOn(integration, 'unregisterPluginEventHandlers');
        const cleanupUISpy = jest.spyOn(integration, 'cleanupPluginUI');
        
        // Emit plugin unloaded event
        mocks.eventEmitter.emit('pluginManager:pluginUnloaded', {
            pluginId: 'plugin1'
        });
        
        // Check if methods were called
        expect(unregisterHandlersSpy).toHaveBeenCalledWith('plugin1');
        expect(cleanupUISpy).toHaveBeenCalledWith('plugin1');
    });
    
    test('should handle plugin error event', () => {
        // Spy on event emitter
        const emitSpy = jest.spyOn(mocks.eventEmitter, 'emit');
        
        // Emit plugin error event
        mocks.eventEmitter.emit('pluginManager:pluginError', {
            pluginId: 'plugin1',
            error: new Error('Test error')
        });
        
        // Check if notification was shown
        expect(emitSpy).toHaveBeenCalledWith('ui:showNotification', expect.objectContaining({
            type: 'error',
            title: 'Plugin Error: plugin1'
        }));
    });
    
    test('should expose APIs to plugin', () => {
        const pluginId = 'plugin1';
        const pluginInfo = mocks.pluginManager.getPluginInfo(pluginId);
        
        integration.exposeAPIsToPlugin(pluginId, pluginInfo);
        
        expect(mocks.pluginManager.exposeAPI).toHaveBeenCalledWith(
            pluginId,
            expect.objectContaining({
                imageEditor: expect.any(Object),
                textEditor: expect.any(Object),
                core: expect.any(Object)
            })
        );
    });
    
    test('should register plugin event handlers', () => {
        const pluginId = 'plugin1';
        const pluginInfo = mocks.pluginManager.getPluginInfo(pluginId);
        
        integration.registerPluginEventHandlers(pluginId, pluginInfo);
        
        expect(integration.pluginEventHandlers.has(pluginId)).toBe(true);
        const handlers = integration.pluginEventHandlers.get(pluginId);
        expect(handlers.has('imageLoaded')).toBe(true);
        expect(handlers.has('textUpdated')).toBe(true);
    });
    
    test('should unregister plugin event handlers', () => {
        const pluginId = 'plugin1';
        const pluginInfo = mocks.pluginManager.getPluginInfo(pluginId);
        
        // First register handlers
        integration.registerPluginEventHandlers(pluginId, pluginInfo);
        expect(integration.pluginEventHandlers.has(pluginId)).toBe(true);
        
        // Then unregister them
        integration.unregisterPluginEventHandlers(pluginId);
        expect(integration.pluginEventHandlers.has(pluginId)).toBe(false);
    });
    
    test('should initialize plugin UI', () => {
        const pluginId = 'plugin1';
        const pluginInfo = mocks.pluginManager.getPluginInfo(pluginId);
        
        // Spy on UI methods
        const addButtonSpy = jest.spyOn(integration, 'addToolbarButton');
        
        integration.initializePluginUI(pluginId, pluginInfo);
        
        expect(addButtonSpy).toHaveBeenCalledWith(pluginId, expect.objectContaining({
            id: 'btn1',
            label: 'Button 1'
        }));
    });
    
    test('should clean up plugin UI', () => {
        const pluginId = 'plugin1';
        
        // Spy on event emitter
        const emitSpy = jest.spyOn(mocks.eventEmitter, 'emit');
        
        integration.cleanupPluginUI(pluginId);
        
        expect(emitSpy).toHaveBeenCalledWith('ui:removeToolbarItems', { pluginId });
        expect(emitSpy).toHaveBeenCalledWith('ui:removeSidebarItems', { pluginId });
        expect(emitSpy).toHaveBeenCalledWith('ui:removeContextMenuItems', { pluginId });
        expect(emitSpy).toHaveBeenCalledWith('ui:removeModals', { pluginId });
    });
    
    test('should handle plugin event', () => {
        const pluginId = 'plugin1';
        const eventName = 'applyImageFilter';
        const data = {
            imageId: 'image1',
            filterName: 'blur',
            params: { radius: 5 }
        };
        
        // Spy on validation method
        const validateSpy = jest.spyOn(integration, 'validatePluginEvent').mockReturnValue(true);
        
        // Spy on specific handler
        const handleFilterSpy = jest.spyOn(integration, 'handleApplyImageFilter');
        
        integration.handlePluginEvent(pluginId, eventName, data);
        
        expect(validateSpy).toHaveBeenCalledWith(pluginId, eventName, data);
        expect(handleFilterSpy).toHaveBeenCalledWith(pluginId, data);
    });
    
    test('should validate plugin event', () => {
        const pluginId = 'plugin1';
        const eventName = 'applyImageFilter';
        const data = { imageId: 'image1' };
        
        const result = integration.validatePluginEvent(pluginId, eventName, data);
        
        expect(result).toBe(true);
    });
    
    test('should handle apply image filter event', () => {
        const pluginId = 'plugin1';
        const data = {
            imageId: 'image1',
            filterName: 'blur',
            params: { radius: 5 }
        };
        
        integration.handleApplyImageFilter(pluginId, data);
        
        expect(mocks.imageEditor.applyFilter).toHaveBeenCalledWith(
            data.imageId,
            data.filterName,
            data.params
        );
    });
    
    test('should handle update text block event', () => {
        const pluginId = 'plugin1';
        const data = {
            textBlockId: 'text1',
            text: 'Updated text'
        };
        
        integration.handleUpdateTextBlock(pluginId, data);
        
        expect(mocks.textEditor.updateTextBlock).toHaveBeenCalledWith(
            data.textBlockId,
            data.text
        );
    });
    
    test('should emit event to plugins', () => {
        const eventName = 'imageLoaded';
        const data = {
            imageId: 'image1',
            width: 800,
            height: 600
        };
        
        // Set up plugin handlers
        integration.pluginEventHandlers.set('plugin1', new Map([
            [eventName, jest.fn()]
        ]));
        integration.pluginEventHandlers.set('plugin2', new Map([
            [eventName, jest.fn()]
        ]));
        
        integration.emitEventToPlugins(eventName, data);
        
        // Check if handlers were called
        expect(integration.pluginEventHandlers.get('plugin1').get(eventName)).toHaveBeenCalledWith(data);
        expect(integration.pluginEventHandlers.get('plugin2').get(eventName)).toHaveBeenCalledWith(data);
    });
    
    test('should add toolbar button', () => {
        const pluginId = 'plugin1';
        const buttonConfig = {
            id: 'btn1',
            label: 'Button 1',
            icon: 'icon1',
            tooltip: 'Tooltip 1'
        };
        
        // Spy on event emitter
        const emitSpy = jest.spyOn(mocks.eventEmitter, 'emit');
        
        integration.addToolbarButton(pluginId, buttonConfig);
        
        expect(emitSpy).toHaveBeenCalledWith('ui:addToolbarButton', expect.objectContaining({
            pluginId: pluginId,
            id: buttonConfig.id,
            label: buttonConfig.label,
            icon: buttonConfig.icon,
            tooltip: buttonConfig.tooltip,
            onClick: expect.any(Function)
        }));
    });
    
    test('should add toolbar dropdown', () => {
        const pluginId = 'plugin1';
        const dropdownConfig = {
            id: 'dropdown1',
            label: 'Dropdown 1',
            icon: 'icon1',
            tooltip: 'Tooltip 1',
            items: [
                { id: 'item1', label: 'Item 1' },
                { id: 'item2', label: 'Item 2' }
            ]
        };
        
        // Spy on event emitter
        const emitSpy = jest.spyOn(mocks.eventEmitter, 'emit');
        
        integration.addToolbarDropdown(pluginId, dropdownConfig);
        
        expect(emitSpy).toHaveBeenCalledWith('ui:addToolbarDropdown', expect.objectContaining({
            pluginId: pluginId,
            id: dropdownConfig.id,
            label: dropdownConfig.label,
            icon: dropdownConfig.icon,
            tooltip: dropdownConfig.tooltip,
            items: expect.arrayContaining([
                expect.objectContaining({
                    id: 'item1',
                    label: 'Item 1',
                    onClick: expect.any(Function)
                })
            ])
        }));
    });
    
    test('should dispose correctly', () => {
        integration.dispose();
        
        expect(integration.isInitialized).toBe(false);
        expect(integration.apiExtensions.size).toBe(0);
        expect(integration.pluginEventHandlers.size).toBe(0);
        expect(integration.uiExtensionPoints.size).toBe(0);
    });
});
