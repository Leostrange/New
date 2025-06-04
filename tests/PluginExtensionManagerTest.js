/**
 * PluginExtensionManagerTest.js
 * 
 * Модульные тесты для менеджера расширений плагинов
 */

const assert = require('assert');
const EventEmitter = require('events');
const PluginExtensionManager = require('../src/integration/PluginExtensionManager');

// Мок-объекты для тестирования
const createMocks = () => {
    const eventEmitter = new EventEmitter();
    
    const pluginManager = {
        getPluginInfo: jest.fn().mockImplementation((pluginId) => {
            if (pluginId === 'plugin1') {
                return {
                    manifest: {
                        extensions: {
                            imageFilters: [
                                {
                                    id: 'blur',
                                    name: 'Blur Filter',
                                    description: 'Applies blur effect',
                                    category: 'effects',
                                    params: [
                                        { name: 'radius', type: 'number', default: 5 }
                                    ],
                                    process: () => {}
                                }
                            ],
                            exportFormats: [
                                {
                                    id: 'pdf',
                                    name: 'PDF Export',
                                    description: 'Export to PDF format',
                                    extension: 'pdf',
                                    mimeType: 'application/pdf',
                                    export: () => {}
                                }
                            ]
                        }
                    }
                };
            }
            return null;
        })
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
        logger
    };
};

describe('PluginExtensionManager', () => {
    let mocks;
    let manager;
    
    beforeEach(() => {
        mocks = createMocks();
        manager = new PluginExtensionManager({
            pluginManager: mocks.pluginManager,
            eventEmitter: mocks.eventEmitter,
            logger: mocks.logger
        });
        
        manager.initialize();
    });
    
    afterEach(() => {
        manager.dispose();
        jest.clearAllMocks();
    });
    
    test('should initialize correctly', () => {
        expect(manager.isInitialized).toBe(true);
        expect(mocks.logger.info).toHaveBeenCalledWith('PluginExtensionManager: Initialized successfully');
    });
    
    test('should not initialize twice', () => {
        manager.initialize();
        expect(mocks.logger.warn).toHaveBeenCalledWith('PluginExtensionManager: Already initialized');
    });
    
    test('should register standard extension points', () => {
        expect(manager.extensionPoints.size).toBeGreaterThan(0);
        expect(manager.extensionPoints.has('imageFilters')).toBe(true);
        expect(manager.extensionPoints.has('exportFormats')).toBe(true);
        expect(manager.extensionPoints.has('textTools')).toBe(true);
        expect(manager.extensionPoints.has('layoutTools')).toBe(true);
        expect(manager.extensionPoints.has('ocrProcessors')).toBe(true);
        expect(manager.extensionPoints.has('translationProviders')).toBe(true);
    });
    
    test('should register custom extension point', () => {
        const result = manager.registerExtensionPoint('customPoint', {
            description: 'Custom extension point',
            schema: {
                type: 'object',
                required: ['id', 'name'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' }
                }
            }
        });
        
        expect(result).toBe(true);
        expect(manager.extensionPoints.has('customPoint')).toBe(true);
        expect(manager.extensionPoints.get('customPoint').description).toBe('Custom extension point');
    });
    
    test('should not register duplicate extension point', () => {
        // First registration
        manager.registerExtensionPoint('customPoint', {
            description: 'Custom extension point',
            schema: { type: 'object' }
        });
        
        // Second registration (should fail)
        const result = manager.registerExtensionPoint('customPoint', {
            description: 'Another description',
            schema: { type: 'object' }
        });
        
        expect(result).toBe(false);
        expect(mocks.logger.warn).toHaveBeenCalledWith('PluginExtensionManager: Extension point already registered', { pointId: 'customPoint' });
    });
    
    test('should unregister extension point', () => {
        // First register
        manager.registerExtensionPoint('customPoint', {
            description: 'Custom extension point',
            schema: { type: 'object' }
        });
        
        // Then unregister
        const result = manager.unregisterExtensionPoint('customPoint');
        
        expect(result).toBe(true);
        expect(manager.extensionPoints.has('customPoint')).toBe(false);
    });
    
    test('should not unregister non-existent extension point', () => {
        const result = manager.unregisterExtensionPoint('nonExistentPoint');
        
        expect(result).toBe(false);
        expect(mocks.logger.warn).toHaveBeenCalledWith('PluginExtensionManager: Extension point not found', { pointId: 'nonExistentPoint' });
    });
    
    test('should register extension', () => {
        const extension = {
            id: 'grayscale',
            name: 'Grayscale Filter',
            description: 'Converts image to grayscale',
            process: () => {}
        };
        
        const result = manager.registerExtension('imageFilters', 'plugin2', extension);
        
        expect(result).toBe(true);
        expect(manager.extensionPoints.get('imageFilters').extensions.has('grayscale')).toBe(true);
        expect(manager.registeredExtensions.has('plugin2')).toBe(true);
        expect(manager.registeredExtensions.get('plugin2').has('imageFilters')).toBe(true);
        expect(manager.registeredExtensions.get('plugin2').get('imageFilters').has('grayscale')).toBe(true);
    });
    
    test('should not register extension for non-existent point', () => {
        const extension = {
            id: 'test',
            name: 'Test Extension'
        };
        
        const result = manager.registerExtension('nonExistentPoint', 'plugin2', extension);
        
        expect(result).toBe(false);
        expect(mocks.logger.warn).toHaveBeenCalledWith('PluginExtensionManager: Extension point not found', { 
            pointId: 'nonExistentPoint',
            pluginId: 'plugin2' 
        });
    });
    
    test('should validate extension against schema', () => {
        // Valid extension
        const validExtension = {
            id: 'valid',
            name: 'Valid Extension',
            process: () => {}
        };
        
        // Invalid extension (missing required field)
        const invalidExtension = {
            id: 'invalid'
            // Missing 'name' field
        };
        
        const schema = {
            type: 'object',
            required: ['id', 'name'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                process: { type: 'function' }
            }
        };
        
        expect(manager.validateExtension(validExtension, schema)).toBe(true);
        expect(manager.validateExtension(invalidExtension, schema)).toBe(false);
    });
    
    test('should not register invalid extension', () => {
        const invalidExtension = {
            id: 'invalid'
            // Missing required 'name' field
        };
        
        const result = manager.registerExtension('imageFilters', 'plugin2', invalidExtension);
        
        expect(result).toBe(false);
        expect(manager.extensionPoints.get('imageFilters').extensions.has('invalid')).toBe(false);
    });
    
    test('should not register extension with duplicate ID', () => {
        // First register an extension
        const extension1 = {
            id: 'duplicate',
            name: 'First Extension',
            process: () => {}
        };
        
        manager.registerExtension('imageFilters', 'plugin2', extension1);
        
        // Try to register another extension with the same ID
        const extension2 = {
            id: 'duplicate',
            name: 'Second Extension',
            process: () => {}
        };
        
        const result = manager.registerExtension('imageFilters', 'plugin3', extension2);
        
        expect(result).toBe(false);
        expect(mocks.logger.warn).toHaveBeenCalledWith('PluginExtensionManager: Extension ID already exists', expect.any(Object));
    });
    
    test('should unregister extension', () => {
        // First register an extension
        const extension = {
            id: 'test',
            name: 'Test Extension',
            process: () => {}
        };
        
        manager.registerExtension('imageFilters', 'plugin2', extension);
        
        // Then unregister it
        const result = manager.unregisterExtension('imageFilters', 'test');
        
        expect(result).toBe(true);
        expect(manager.extensionPoints.get('imageFilters').extensions.has('test')).toBe(false);
        expect(manager.registeredExtensions.get('plugin2').get('imageFilters').has('test')).toBe(false);
    });
    
    test('should not unregister non-existent extension', () => {
        const result = manager.unregisterExtension('imageFilters', 'nonExistentExtension');
        
        expect(result).toBe(false);
        expect(mocks.logger.warn).toHaveBeenCalledWith('PluginExtensionManager: Extension not found', expect.any(Object));
    });
    
    test('should unregister all plugin extensions', () => {
        // Register multiple extensions for a plugin
        const extension1 = {
            id: 'ext1',
            name: 'Extension 1',
            process: () => {}
        };
        
        const extension2 = {
            id: 'ext2',
            name: 'Extension 2',
            export: () => {}
        };
        
        manager.registerExtension('imageFilters', 'plugin2', extension1);
        manager.registerExtension('exportFormats', 'plugin2', extension2);
        
        // Unregister all extensions for the plugin
        manager.unregisterPluginExtensions('plugin2');
        
        expect(manager.registeredExtensions.has('plugin2')).toBe(false);
        expect(manager.extensionPoints.get('imageFilters').extensions.has('ext1')).toBe(false);
        expect(manager.extensionPoints.get('exportFormats').extensions.has('ext2')).toBe(false);
    });
    
    test('should get all extensions for a point', () => {
        // Register multiple extensions
        const extension1 = {
            id: 'ext1',
            name: 'Extension 1',
            process: () => {}
        };
        
        const extension2 = {
            id: 'ext2',
            name: 'Extension 2',
            process: () => {}
        };
        
        manager.registerExtension('imageFilters', 'plugin2', extension1);
        manager.registerExtension('imageFilters', 'plugin3', extension2);
        
        // Get all extensions
        const extensions = manager.getExtensions('imageFilters');
        
        expect(extensions.length).toBe(2);
        expect(extensions.some(ext => ext.id === 'ext1')).toBe(true);
        expect(extensions.some(ext => ext.id === 'ext2')).toBe(true);
    });
    
    test('should get extension by ID', () => {
        // Register an extension
        const extension = {
            id: 'test',
            name: 'Test Extension',
            process: () => {}
        };
        
        manager.registerExtension('imageFilters', 'plugin2', extension);
        
        // Get the extension
        const result = manager.getExtension('imageFilters', 'test');
        
        expect(result).not.toBeNull();
        expect(result.id).toBe('test');
        expect(result.name).toBe('Test Extension');
        expect(result._pluginId).toBe('plugin2');
    });
    
    test('should return null for non-existent extension', () => {
        const result = manager.getExtension('imageFilters', 'nonExistentExtension');
        
        expect(result).toBeNull();
    });
    
    test('should get all extension points', () => {
        const points = manager.getExtensionPoints();
        
        expect(points.length).toBeGreaterThan(0);
        expect(points.some(point => point.id === 'imageFilters')).toBe(true);
        expect(points.some(point => point.id === 'exportFormats')).toBe(true);
    });
    
    test('should get extension point info', () => {
        const point = manager.getExtensionPoint('imageFilters');
        
        expect(point).not.toBeNull();
        expect(point.id).toBe('imageFilters');
        expect(point.description).toBe('Фильтры для обработки изображений');
        expect(point.schema).toBeDefined();
    });
    
    test('should return null for non-existent extension point', () => {
        const point = manager.getExtensionPoint('nonExistentPoint');
        
        expect(point).toBeNull();
    });
    
    test('should handle plugin loaded event', () => {
        // Spy on registerPluginExtensions method
        const registerSpy = jest.spyOn(manager, 'registerPluginExtensions');
        
        // Emit plugin loaded event
        mocks.eventEmitter.emit('pluginManager:pluginLoaded', {
            pluginId: 'plugin1',
            pluginInfo: mocks.pluginManager.getPluginInfo('plugin1')
        });
        
        // Check if method was called
        expect(registerSpy).toHaveBeenCalledWith('plugin1', expect.any(Object));
    });
    
    test('should handle plugin unloaded event', () => {
        // Spy on unregisterPluginExtensions method
        const unregisterSpy = jest.spyOn(manager, 'unregisterPluginExtensions');
        
        // Emit plugin unloaded event
        mocks.eventEmitter.emit('pluginManager:pluginUnloaded', {
            pluginId: 'plugin1'
        });
        
        // Check if method was called
        expect(unregisterSpy).toHaveBeenCalledWith('plugin1');
    });
    
    test('should register plugin extensions from manifest', () => {
        const pluginId = 'plugin1';
        const pluginInfo = mocks.pluginManager.getPluginInfo(pluginId);
        
        manager.registerPluginExtensions(pluginId, pluginInfo);
        
        // Check if extensions were registered
        expect(manager.extensionPoints.get('imageFilters').extensions.has('blur')).toBe(true);
        expect(manager.extensionPoints.get('exportFormats').extensions.has('pdf')).toBe(true);
    });
    
    test('should dispose correctly', () => {
        manager.dispose();
        
        expect(manager.isInitialized).toBe(false);
        expect(manager.extensionPoints.size).toBe(0);
        expect(manager.registeredExtensions.size).toBe(0);
    });
});
