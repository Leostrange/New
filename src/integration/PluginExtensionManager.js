/**
 * PluginExtensionManager.js
 * 
 * Менеджер расширений для плагинов, обеспечивающий регистрацию и управление
 * точками расширения для различных компонентов системы
 */

class PluginExtensionManager {
    /**
     * Создает экземпляр менеджера расширений
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.pluginManager - Менеджер плагинов
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     * @param {Object} options.logger - Логгер для отладки
     */
    constructor(options) {
        this.pluginManager = options.pluginManager;
        this.eventEmitter = options.eventEmitter;
        this.logger = options.logger;
        
        this.isInitialized = false;
        
        // Зарегистрированные точки расширения
        this.extensionPoints = new Map();
        
        // Зарегистрированные расширения от плагинов
        this.registeredExtensions = new Map();
    }
    
    /**
     * Инициализирует менеджер расширений и устанавливает обработчики событий
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('PluginExtensionManager: Already initialized');
            return;
        }
        
        // Регистрация обработчиков событий от менеджера плагинов
        this.eventEmitter.on('pluginManager:pluginLoaded', this.handlePluginLoaded.bind(this));
        this.eventEmitter.on('pluginManager:pluginUnloaded', this.handlePluginUnloaded.bind(this));
        
        // Регистрация стандартных точек расширения
        this.registerStandardExtensionPoints();
        
        this.isInitialized = true;
        this.logger.info('PluginExtensionManager: Initialized successfully');
    }
    
    /**
     * Регистрирует стандартные точки расширения
     */
    registerStandardExtensionPoints() {
        // Точки расширения для фильтров изображений
        this.registerExtensionPoint('imageFilters', {
            description: 'Фильтры для обработки изображений',
            schema: {
                type: 'object',
                required: ['id', 'name', 'process'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    params: { type: 'array' },
                    process: { type: 'function' }
                }
            }
        });
        
        // Точки расширения для форматов экспорта
        this.registerExtensionPoint('exportFormats', {
            description: 'Форматы экспорта проекта',
            schema: {
                type: 'object',
                required: ['id', 'name', 'extension', 'export'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    extension: { type: 'string' },
                    mimeType: { type: 'string' },
                    options: { type: 'array' },
                    export: { type: 'function' }
                }
            }
        });
        
        // Точки расширения для инструментов редактирования текста
        this.registerExtensionPoint('textTools', {
            description: 'Инструменты для редактирования текста',
            schema: {
                type: 'object',
                required: ['id', 'name', 'apply'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    icon: { type: 'string' },
                    shortcut: { type: 'string' },
                    apply: { type: 'function' }
                }
            }
        });
        
        // Точки расширения для инструментов редактирования макета
        this.registerExtensionPoint('layoutTools', {
            description: 'Инструменты для редактирования макета',
            schema: {
                type: 'object',
                required: ['id', 'name', 'apply'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    icon: { type: 'string' },
                    shortcut: { type: 'string' },
                    apply: { type: 'function' }
                }
            }
        });
        
        // Точки расширения для обработчиков OCR
        this.registerExtensionPoint('ocrProcessors', {
            description: 'Обработчики OCR',
            schema: {
                type: 'object',
                required: ['id', 'name', 'recognize'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    languages: { type: 'array' },
                    recognize: { type: 'function' }
                }
            }
        });
        
        // Точки расширения для обработчиков перевода
        this.registerExtensionPoint('translationProviders', {
            description: 'Провайдеры перевода',
            schema: {
                type: 'object',
                required: ['id', 'name', 'translate'],
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    languages: { type: 'array' },
                    translate: { type: 'function' }
                }
            }
        });
        
        this.logger.debug('PluginExtensionManager: Standard extension points registered', {
            count: this.extensionPoints.size
        });
    }
    
    /**
     * Регистрирует новую точку расширения
     * 
     * @param {String} pointId - Идентификатор точки расширения
     * @param {Object} options - Параметры точки расширения
     * @param {String} options.description - Описание точки расширения
     * @param {Object} options.schema - Схема для валидации расширений
     * @returns {Boolean} - Результат регистрации
     */
    registerExtensionPoint(pointId, options) {
        if (this.extensionPoints.has(pointId)) {
            this.logger.warn('PluginExtensionManager: Extension point already registered', { pointId });
            return false;
        }
        
        this.extensionPoints.set(pointId, {
            id: pointId,
            description: options.description,
            schema: options.schema,
            extensions: new Map()
        });
        
        this.logger.debug('PluginExtensionManager: Extension point registered', { pointId });
        return true;
    }
    
    /**
     * Удаляет точку расширения
     * 
     * @param {String} pointId - Идентификатор точки расширения
     * @returns {Boolean} - Результат удаления
     */
    unregisterExtensionPoint(pointId) {
        if (!this.extensionPoints.has(pointId)) {
            this.logger.warn('PluginExtensionManager: Extension point not found', { pointId });
            return false;
        }
        
        this.extensionPoints.delete(pointId);
        
        this.logger.debug('PluginExtensionManager: Extension point unregistered', { pointId });
        return true;
    }
    
    /**
     * Регистрирует расширение для указанной точки расширения
     * 
     * @param {String} pointId - Идентификатор точки расширения
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} extension - Объект расширения
     * @returns {Boolean} - Результат регистрации
     */
    registerExtension(pointId, pluginId, extension) {
        if (!this.extensionPoints.has(pointId)) {
            this.logger.warn('PluginExtensionManager: Extension point not found', { 
                pointId,
                pluginId 
            });
            return false;
        }
        
        const extensionPoint = this.extensionPoints.get(pointId);
        
        // Валидация расширения по схеме
        if (!this.validateExtension(extension, extensionPoint.schema)) {
            this.logger.warn('PluginExtensionManager: Invalid extension', { 
                pointId,
                pluginId,
                extension 
            });
            return false;
        }
        
        // Проверка на дублирование идентификатора расширения
        if (extensionPoint.extensions.has(extension.id)) {
            this.logger.warn('PluginExtensionManager: Extension ID already exists', { 
                pointId,
                pluginId,
                extensionId: extension.id 
            });
            return false;
        }
        
        // Добавляем информацию о плагине к расширению
        const extendedExtension = {
            ...extension,
            _pluginId: pluginId
        };
        
        // Регистрируем расширение
        extensionPoint.extensions.set(extension.id, extendedExtension);
        
        // Добавляем запись в реестр расширений плагина
        if (!this.registeredExtensions.has(pluginId)) {
            this.registeredExtensions.set(pluginId, new Map());
        }
        
        const pluginExtensions = this.registeredExtensions.get(pluginId);
        if (!pluginExtensions.has(pointId)) {
            pluginExtensions.set(pointId, new Set());
        }
        
        pluginExtensions.get(pointId).add(extension.id);
        
        // Уведомляем о регистрации расширения
        this.eventEmitter.emit('extensionManager:extensionRegistered', {
            pointId: pointId,
            pluginId: pluginId,
            extensionId: extension.id
        });
        
        this.logger.debug('PluginExtensionManager: Extension registered', { 
            pointId,
            pluginId,
            extensionId: extension.id 
        });
        
        return true;
    }
    
    /**
     * Удаляет расширение
     * 
     * @param {String} pointId - Идентификатор точки расширения
     * @param {String} extensionId - Идентификатор расширения
     * @returns {Boolean} - Результат удаления
     */
    unregisterExtension(pointId, extensionId) {
        if (!this.extensionPoints.has(pointId)) {
            this.logger.warn('PluginExtensionManager: Extension point not found', { pointId });
            return false;
        }
        
        const extensionPoint = this.extensionPoints.get(pointId);
        
        if (!extensionPoint.extensions.has(extensionId)) {
            this.logger.warn('PluginExtensionManager: Extension not found', { 
                pointId,
                extensionId 
            });
            return false;
        }
        
        // Получаем информацию о плагине
        const extension = extensionPoint.extensions.get(extensionId);
        const pluginId = extension._pluginId;
        
        // Удаляем расширение
        extensionPoint.extensions.delete(extensionId);
        
        // Удаляем запись из реестра расширений плагина
        if (this.registeredExtensions.has(pluginId)) {
            const pluginExtensions = this.registeredExtensions.get(pluginId);
            if (pluginExtensions.has(pointId)) {
                pluginExtensions.get(pointId).delete(extensionId);
                
                // Если больше нет расширений для этой точки, удаляем запись
                if (pluginExtensions.get(pointId).size === 0) {
                    pluginExtensions.delete(pointId);
                }
                
                // Если больше нет расширений для этого плагина, удаляем запись
                if (pluginExtensions.size === 0) {
                    this.registeredExtensions.delete(pluginId);
                }
            }
        }
        
        // Уведомляем об удалении расширения
        this.eventEmitter.emit('extensionManager:extensionUnregistered', {
            pointId: pointId,
            pluginId: pluginId,
            extensionId: extensionId
        });
        
        this.logger.debug('PluginExtensionManager: Extension unregistered', { 
            pointId,
            extensionId 
        });
        
        return true;
    }
    
    /**
     * Удаляет все расширения плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     */
    unregisterPluginExtensions(pluginId) {
        if (!this.registeredExtensions.has(pluginId)) {
            return;
        }
        
        const pluginExtensions = this.registeredExtensions.get(pluginId);
        
        // Для каждой точки расширения
        for (const [pointId, extensionIds] of pluginExtensions.entries()) {
            // Для каждого расширения
            for (const extensionId of extensionIds) {
                // Удаляем расширение
                this.unregisterExtension(pointId, extensionId);
            }
        }
        
        // Удаляем запись о плагине
        this.registeredExtensions.delete(pluginId);
        
        this.logger.debug('PluginExtensionManager: All plugin extensions unregistered', { pluginId });
    }
    
    /**
     * Получает все расширения для указанной точки расширения
     * 
     * @param {String} pointId - Идентификатор точки расширения
     * @returns {Array} - Массив расширений
     */
    getExtensions(pointId) {
        if (!this.extensionPoints.has(pointId)) {
            this.logger.warn('PluginExtensionManager: Extension point not found', { pointId });
            return [];
        }
        
        const extensionPoint = this.extensionPoints.get(pointId);
        
        // Преобразуем Map в массив
        return Array.from(extensionPoint.extensions.values());
    }
    
    /**
     * Получает расширение по идентификатору
     * 
     * @param {String} pointId - Идентификатор точки расширения
     * @param {String} extensionId - Идентификатор расширения
     * @returns {Object|null} - Объект расширения или null, если не найдено
     */
    getExtension(pointId, extensionId) {
        if (!this.extensionPoints.has(pointId)) {
            this.logger.warn('PluginExtensionManager: Extension point not found', { pointId });
            return null;
        }
        
        const extensionPoint = this.extensionPoints.get(pointId);
        
        if (!extensionPoint.extensions.has(extensionId)) {
            this.logger.warn('PluginExtensionManager: Extension not found', { 
                pointId,
                extensionId 
            });
            return null;
        }
        
        return extensionPoint.extensions.get(extensionId);
    }
    
    /**
     * Получает все точки расширения
     * 
     * @returns {Array} - Массив точек расширения
     */
    getExtensionPoints() {
        // Преобразуем Map в массив
        return Array.from(this.extensionPoints.keys()).map(pointId => ({
            id: pointId,
            description: this.extensionPoints.get(pointId).description,
            extensionsCount: this.extensionPoints.get(pointId).extensions.size
        }));
    }
    
    /**
     * Получает информацию о точке расширения
     * 
     * @param {String} pointId - Идентификатор точки расширения
     * @returns {Object|null} - Информация о точке расширения или null, если не найдена
     */
    getExtensionPoint(pointId) {
        if (!this.extensionPoints.has(pointId)) {
            this.logger.warn('PluginExtensionManager: Extension point not found', { pointId });
            return null;
        }
        
        const extensionPoint = this.extensionPoints.get(pointId);
        
        return {
            id: extensionPoint.id,
            description: extensionPoint.description,
            schema: extensionPoint.schema,
            extensionsCount: extensionPoint.extensions.size
        };
    }
    
    /**
     * Обработчик события загрузки плагина
     * 
     * @param {Object} data - Данные события
     * @param {String} data.pluginId - Идентификатор плагина
     * @param {Object} data.pluginInfo - Информация о плагине
     */
    handlePluginLoaded(data) {
        this.logger.debug('PluginExtensionManager: Plugin loaded', { 
            pluginId: data.pluginId 
        });
        
        // Регистрируем расширения плагина
        this.registerPluginExtensions(data.pluginId, data.pluginInfo);
    }
    
    /**
     * Обработчик события выгрузки плагина
     * 
     * @param {Object} data - Данные события
     * @param {String} data.pluginId - Идентификатор плагина
     */
    handlePluginUnloaded(data) {
        this.logger.debug('PluginExtensionManager: Plugin unloaded', { 
            pluginId: data.pluginId 
        });
        
        // Удаляем все расширения плагина
        this.unregisterPluginExtensions(data.pluginId);
    }
    
    /**
     * Регистрирует расширения плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} pluginInfo - Информация о плагине
     */
    registerPluginExtensions(pluginId, pluginInfo) {
        // Получаем расширения из манифеста плагина
        const extensions = pluginInfo.manifest.extensions || {};
        
        // Для каждой точки расширения
        Object.entries(extensions).forEach(([pointId, pointExtensions]) => {
            // Проверяем, что точка расширения существует
            if (!this.extensionPoints.has(pointId)) {
                this.logger.warn('PluginExtensionManager: Extension point not found', { 
                    pointId,
                    pluginId 
                });
                return;
            }
            
            // Регистрируем каждое расширение
            pointExtensions.forEach(extension => {
                this.registerExtension(pointId, pluginId, extension);
            });
        });
    }
    
    /**
     * Валидирует расширение по схеме
     * 
     * @param {Object} extension - Объект расширения
     * @param {Object} schema - Схема для валидации
     * @returns {Boolean} - Результат валидации
     */
    validateExtension(extension, schema) {
        // Проверяем обязательные поля
        for (const field of schema.required) {
            if (!(field in extension)) {
                this.logger.warn('PluginExtensionManager: Missing required field', { 
                    field,
                    extension 
                });
                return false;
            }
        }
        
        // Проверяем типы полей
        for (const [field, value] of Object.entries(extension)) {
            if (field in schema.properties) {
                const expectedType = schema.properties[field].type;
                
                // Проверка типа
                if (expectedType === 'function') {
                    if (typeof value !== 'function') {
                        this.logger.warn('PluginExtensionManager: Invalid field type', { 
                            field,
                            expectedType,
                            actualType: typeof value 
                        });
                        return false;
                    }
                } else if (expectedType === 'array') {
                    if (!Array.isArray(value)) {
                        this.logger.warn('PluginExtensionManager: Invalid field type', { 
                            field,
                            expectedType,
                            actualType: typeof value 
                        });
                        return false;
                    }
                } else if (typeof value !== expectedType) {
                    this.logger.warn('PluginExtensionManager: Invalid field type', { 
                        field,
                        expectedType,
                        actualType: typeof value 
                    });
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Освобождает ресурсы и отписывается от событий
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        this.logger.info('PluginExtensionManager: Disposing');
        
        // Отписываемся от всех событий
        this.eventEmitter.off('pluginManager:pluginLoaded', this.handlePluginLoaded);
        this.eventEmitter.off('pluginManager:pluginUnloaded', this.handlePluginUnloaded);
        
        // Очищаем все коллекции
        this.extensionPoints.clear();
        this.registeredExtensions.clear();
        
        this.isInitialized = false;
    }
}

module.exports = PluginExtensionManager;
