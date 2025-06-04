/**
 * PluginEditorIntegration.js
 * 
 * Интеграционный модуль между системой плагинов и инструментами редактирования
 * Обеспечивает взаимодействие плагинов с редакторами и другими компонентами системы
 */

class PluginEditorIntegration {
    /**
     * Создает экземпляр интеграционного модуля
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.pluginManager - Менеджер плагинов
     * @param {Object} options.imageEditor - Экземпляр редактора изображений
     * @param {Object} options.textEditor - Экземпляр редактора текста
     * @param {Object} options.layoutEditor - Экземпляр редактора макета
     * @param {Object} options.ocrEditorIntegration - Интеграция OCR и редактирования
     * @param {Object} options.translationEditorIntegration - Интеграция перевода и редактирования
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     * @param {Object} options.logger - Логгер для отладки
     */
    constructor(options) {
        this.pluginManager = options.pluginManager;
        this.imageEditor = options.imageEditor;
        this.textEditor = options.textEditor;
        this.layoutEditor = options.layoutEditor;
        this.ocrEditorIntegration = options.ocrEditorIntegration;
        this.translationEditorIntegration = options.translationEditorIntegration;
        this.eventEmitter = options.eventEmitter;
        this.logger = options.logger;
        
        this.isInitialized = false;
        
        // Зарегистрированные расширения API для плагинов
        this.apiExtensions = new Map();
        
        // Зарегистрированные обработчики событий от плагинов
        this.pluginEventHandlers = new Map();
        
        // Зарегистрированные точки расширения UI
        this.uiExtensionPoints = new Map();
    }
    
    /**
     * Инициализирует интеграционный модуль и устанавливает обработчики событий
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('PluginEditorIntegration: Already initialized');
            return;
        }
        
        // Регистрация обработчиков событий от менеджера плагинов
        this.eventEmitter.on('pluginManager:pluginLoaded', this.handlePluginLoaded.bind(this));
        this.eventEmitter.on('pluginManager:pluginUnloaded', this.handlePluginUnloaded.bind(this));
        this.eventEmitter.on('pluginManager:pluginError', this.handlePluginError.bind(this));
        
        // Регистрация обработчиков событий от редакторов для передачи плагинам
        this.eventEmitter.on('imageEditor:imageLoaded', this.handleImageLoaded.bind(this));
        this.eventEmitter.on('imageEditor:imageUpdated', this.handleImageUpdated.bind(this));
        this.eventEmitter.on('textEditor:textUpdated', this.handleTextUpdated.bind(this));
        this.eventEmitter.on('layoutEditor:layoutChanged', this.handleLayoutChanged.bind(this));
        
        // Регистрация обработчиков событий от интеграционных модулей
        this.eventEmitter.on('integration:ocrResultsAvailable', this.handleOCRResultsAvailable.bind(this));
        this.eventEmitter.on('integration:translationReady', this.handleTranslationReady.bind(this));
        
        // Регистрация API для плагинов
        this.registerPluginAPIs();
        
        // Регистрация точек расширения UI
        this.registerUIExtensionPoints();
        
        this.isInitialized = true;
        this.logger.info('PluginEditorIntegration: Initialized successfully');
    }
    
    /**
     * Регистрирует API для плагинов
     */
    registerPluginAPIs() {
        // API для работы с изображениями
        this.apiExtensions.set('imageEditor', {
            getImageData: (imageId) => this.imageEditor.getImageData(imageId),
            applyFilter: (imageId, filterName, params) => this.imageEditor.applyFilter(imageId, filterName, params),
            crop: (imageId, bounds) => this.imageEditor.crop(imageId, bounds),
            resize: (imageId, width, height) => this.imageEditor.resize(imageId, width, height),
            rotate: (imageId, angle) => this.imageEditor.rotate(imageId, angle),
            undo: (imageId) => this.imageEditor.undo(imageId),
            redo: (imageId) => this.imageEditor.redo(imageId)
        });
        
        // API для работы с текстом
        this.apiExtensions.set('textEditor', {
            getTextBlocks: (imageId) => this.textEditor.getTextBlocks(imageId),
            updateTextBlock: (textBlockId, text) => this.textEditor.updateTextBlock(textBlockId, text),
            formatTextBlock: (textBlockId, formatting) => this.textEditor.formatTextBlock(textBlockId, formatting),
            addTextBlock: (imageId, text, bounds) => this.textEditor.addTextBlock(imageId, text, bounds),
            removeTextBlock: (textBlockId) => this.textEditor.removeTextBlock(textBlockId)
        });
        
        // API для работы с макетом
        this.apiExtensions.set('layoutEditor', {
            getBubbles: (imageId) => this.layoutEditor.getBubbles(imageId),
            updateBubble: (bubbleId, bounds) => this.layoutEditor.updateBubble(bubbleId, bounds),
            addBubble: (imageId, bounds, textBlockId) => this.layoutEditor.addBubble(imageId, bounds, textBlockId),
            removeBubble: (bubbleId) => this.layoutEditor.removeBubble(bubbleId),
            getLayout: (imageId) => this.layoutEditor.getLayout(imageId)
        });
        
        // API для работы с OCR
        this.apiExtensions.set('ocr', {
            performOCR: (imageId, options) => this.ocrEditorIntegration.performOCR({
                imageId: imageId,
                ...options
            }),
            getOCRResults: (imageId) => {
                const cache = this.ocrEditorIntegration.resultCache.get(imageId);
                return cache ? cache.ocrResults : null;
            }
        });
        
        // API для работы с переводом
        this.apiExtensions.set('translation', {
            translateText: (textBlockId, text, sourceLanguage, targetLanguage) => 
                this.translationEditorIntegration.performTranslation({
                    textBlockId: textBlockId,
                    text: text,
                    sourceLanguage: sourceLanguage,
                    targetLanguage: targetLanguage
                }),
            batchTranslate: (imageId, textBlocks, sourceLanguage, targetLanguage) => 
                this.translationEditorIntegration.performBatchTranslation({
                    imageId: imageId,
                    textBlocks: textBlocks,
                    sourceLanguage: sourceLanguage,
                    targetLanguage: targetLanguage
                }),
            getTranslation: (textBlockId, sourceLanguage, targetLanguage) => {
                const cacheKey = `${textBlockId}:${sourceLanguage}:${targetLanguage}`;
                return this.translationEditorIntegration.translationCache.has(cacheKey) 
                    ? this.translationEditorIntegration.translationCache.get(cacheKey) 
                    : null;
            }
        });
        
        // API для работы с файловой системой (ограниченный доступ)
        this.apiExtensions.set('fileSystem', {
            readFile: (path, options) => this.pluginManager.readFile(path, options),
            writeFile: (path, content, options) => this.pluginManager.writeFile(path, content, options),
            listFiles: (directory) => this.pluginManager.listFiles(directory),
            fileExists: (path) => this.pluginManager.fileExists(path)
        });
        
        // API для экспорта
        this.apiExtensions.set('export', {
            exportImage: (imageId, format, options) => this.pluginManager.exportImage(imageId, format, options),
            exportProject: (projectId, format, options) => this.pluginManager.exportProject(projectId, format, options)
        });
        
        this.logger.debug('PluginEditorIntegration: Plugin APIs registered', {
            apiCount: this.apiExtensions.size
        });
    }
    
    /**
     * Регистрирует точки расширения UI
     */
    registerUIExtensionPoints() {
        // Точки расширения для панели инструментов
        this.uiExtensionPoints.set('toolbar', {
            addButton: (pluginId, buttonConfig) => this.addToolbarButton(pluginId, buttonConfig),
            addDropdown: (pluginId, dropdownConfig) => this.addToolbarDropdown(pluginId, dropdownConfig),
            addSeparator: (pluginId) => this.addToolbarSeparator(pluginId)
        });
        
        // Точки расширения для боковой панели
        this.uiExtensionPoints.set('sidebar', {
            addPanel: (pluginId, panelConfig) => this.addSidebarPanel(pluginId, panelConfig),
            addTab: (pluginId, tabConfig) => this.addSidebarTab(pluginId, tabConfig)
        });
        
        // Точки расширения для контекстного меню
        this.uiExtensionPoints.set('contextMenu', {
            addMenuItem: (pluginId, menuItemConfig) => this.addContextMenuItem(pluginId, menuItemConfig),
            addSubmenu: (pluginId, submenuConfig) => this.addContextSubmenu(pluginId, submenuConfig),
            addSeparator: (pluginId) => this.addContextMenuSeparator(pluginId)
        });
        
        // Точки расширения для модальных окон
        this.uiExtensionPoints.set('modal', {
            registerModal: (pluginId, modalConfig) => this.registerModal(pluginId, modalConfig),
            showModal: (modalId, params) => this.showModal(modalId, params)
        });
        
        this.logger.debug('PluginEditorIntegration: UI extension points registered', {
            pointsCount: this.uiExtensionPoints.size
        });
    }
    
    /**
     * Обработчик события загрузки плагина
     * 
     * @param {Object} data - Данные события
     * @param {String} data.pluginId - Идентификатор плагина
     * @param {Object} data.pluginInfo - Информация о плагине
     */
    handlePluginLoaded(data) {
        this.logger.debug('PluginEditorIntegration: Plugin loaded', { 
            pluginId: data.pluginId 
        });
        
        // Предоставляем плагину доступ к API
        this.exposeAPIsToPlugin(data.pluginId, data.pluginInfo);
        
        // Регистрируем обработчики событий от плагина
        this.registerPluginEventHandlers(data.pluginId, data.pluginInfo);
        
        // Инициализируем UI расширения плагина
        this.initializePluginUI(data.pluginId, data.pluginInfo);
    }
    
    /**
     * Обработчик события выгрузки плагина
     * 
     * @param {Object} data - Данные события
     * @param {String} data.pluginId - Идентификатор плагина
     */
    handlePluginUnloaded(data) {
        this.logger.debug('PluginEditorIntegration: Plugin unloaded', { 
            pluginId: data.pluginId 
        });
        
        // Удаляем обработчики событий плагина
        this.unregisterPluginEventHandlers(data.pluginId);
        
        // Удаляем UI расширения плагина
        this.cleanupPluginUI(data.pluginId);
    }
    
    /**
     * Обработчик события ошибки плагина
     * 
     * @param {Object} data - Данные события
     * @param {String} data.pluginId - Идентификатор плагина
     * @param {Error} data.error - Объект ошибки
     */
    handlePluginError(data) {
        this.logger.error('PluginEditorIntegration: Plugin error', { 
            pluginId: data.pluginId,
            error: data.error.message 
        });
        
        // Уведомляем пользователя об ошибке плагина
        this.eventEmitter.emit('ui:showNotification', {
            type: 'error',
            title: `Plugin Error: ${data.pluginId}`,
            message: data.error.message
        });
    }
    
    /**
     * Обработчик события загрузки изображения
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Object} data.imageInfo - Информация об изображении
     */
    handleImageLoaded(data) {
        // Передаем событие плагинам
        this.emitEventToPlugins('imageLoaded', {
            imageId: data.imageId,
            width: data.imageInfo.width,
            height: data.imageInfo.height,
            format: data.imageInfo.format
        });
    }
    
    /**
     * Обработчик события обновления изображения
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     */
    handleImageUpdated(data) {
        // Передаем событие плагинам
        this.emitEventToPlugins('imageUpdated', {
            imageId: data.imageId
        });
    }
    
    /**
     * Обработчик события обновления текста
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.imageId - Идентификатор изображения
     * @param {String} data.text - Обновленный текст
     */
    handleTextUpdated(data) {
        // Передаем событие плагинам
        this.emitEventToPlugins('textUpdated', {
            textBlockId: data.textBlockId,
            imageId: data.imageId,
            text: data.text
        });
    }
    
    /**
     * Обработчик события изменения макета
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Array} data.layout - Данные макета
     */
    handleLayoutChanged(data) {
        // Передаем событие плагинам
        this.emitEventToPlugins('layoutChanged', {
            imageId: data.imageId,
            layout: data.layout
        });
    }
    
    /**
     * Обработчик события доступности результатов OCR
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Array} data.results - Результаты распознавания
     */
    handleOCRResultsAvailable(data) {
        // Передаем событие плагинам
        this.emitEventToPlugins('ocrResultsAvailable', {
            imageId: data.imageId,
            results: data.results
        });
    }
    
    /**
     * Обработчик события готовности перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.sourceText - Исходный текст
     * @param {String} data.translatedText - Переведенный текст
     * @param {String} data.sourceLanguage - Исходный язык
     * @param {String} data.targetLanguage - Целевой язык
     */
    handleTranslationReady(data) {
        // Передаем событие плагинам
        this.emitEventToPlugins('translationReady', {
            textBlockId: data.textBlockId,
            sourceText: data.sourceText,
            translatedText: data.translatedText,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage
        });
    }
    
    /**
     * Предоставляет плагину доступ к API
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} pluginInfo - Информация о плагине
     */
    exposeAPIsToPlugin(pluginId, pluginInfo) {
        // Получаем запрошенные API из манифеста плагина
        const requestedAPIs = pluginInfo.manifest.requiredAPIs || [];
        
        // Создаем объект с API для плагина
        const pluginAPI = {};
        
        // Добавляем запрошенные API
        requestedAPIs.forEach(apiName => {
            if (this.apiExtensions.has(apiName)) {
                pluginAPI[apiName] = this.apiExtensions.get(apiName);
            } else {
                this.logger.warn('PluginEditorIntegration: Requested API not found', { 
                    pluginId: pluginId,
                    apiName: apiName 
                });
            }
        });
        
        // Добавляем базовый API для всех плагинов
        pluginAPI.core = {
            getPluginId: () => pluginId,
            getPluginInfo: () => ({ ...pluginInfo }),
            emitEvent: (eventName, data) => this.handlePluginEvent(pluginId, eventName, data),
            showNotification: (type, title, message) => this.eventEmitter.emit('ui:showNotification', {
                type: type,
                title: title,
                message: message,
                source: pluginId
            })
        };
        
        // Предоставляем API плагину
        this.pluginManager.exposeAPI(pluginId, pluginAPI);
        
        this.logger.debug('PluginEditorIntegration: APIs exposed to plugin', { 
            pluginId: pluginId,
            exposedAPIs: Object.keys(pluginAPI)
        });
    }
    
    /**
     * Регистрирует обработчики событий от плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} pluginInfo - Информация о плагине
     */
    registerPluginEventHandlers(pluginId, pluginInfo) {
        // Получаем подписки на события из манифеста плагина
        const eventSubscriptions = pluginInfo.manifest.eventSubscriptions || [];
        
        // Создаем запись для обработчиков событий плагина
        if (!this.pluginEventHandlers.has(pluginId)) {
            this.pluginEventHandlers.set(pluginId, new Map());
        }
        
        const pluginHandlers = this.pluginEventHandlers.get(pluginId);
        
        // Регистрируем обработчики для каждого события
        eventSubscriptions.forEach(eventName => {
            // Создаем обработчик события
            const handler = (data) => {
                // Вызываем обработчик события в плагине
                this.pluginManager.handleEvent(pluginId, eventName, data);
            };
            
            // Сохраняем обработчик
            pluginHandlers.set(eventName, handler);
        });
        
        this.logger.debug('PluginEditorIntegration: Plugin event handlers registered', { 
            pluginId: pluginId,
            eventCount: eventSubscriptions.length
        });
    }
    
    /**
     * Удаляет обработчики событий плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     */
    unregisterPluginEventHandlers(pluginId) {
        if (!this.pluginEventHandlers.has(pluginId)) {
            return;
        }
        
        // Удаляем все обработчики событий плагина
        this.pluginEventHandlers.delete(pluginId);
        
        this.logger.debug('PluginEditorIntegration: Plugin event handlers unregistered', { 
            pluginId: pluginId
        });
    }
    
    /**
     * Инициализирует UI расширения плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} pluginInfo - Информация о плагине
     */
    initializePluginUI(pluginId, pluginInfo) {
        // Получаем UI расширения из манифеста плагина
        const uiExtensions = pluginInfo.manifest.uiExtensions || {};
        
        // Инициализируем расширения для панели инструментов
        if (uiExtensions.toolbar) {
            uiExtensions.toolbar.forEach(item => {
                switch (item.type) {
                    case 'button':
                        this.addToolbarButton(pluginId, item);
                        break;
                    case 'dropdown':
                        this.addToolbarDropdown(pluginId, item);
                        break;
                    case 'separator':
                        this.addToolbarSeparator(pluginId);
                        break;
                }
            });
        }
        
        // Инициализируем расширения для боковой панели
        if (uiExtensions.sidebar) {
            uiExtensions.sidebar.forEach(item => {
                switch (item.type) {
                    case 'panel':
                        this.addSidebarPanel(pluginId, item);
                        break;
                    case 'tab':
                        this.addSidebarTab(pluginId, item);
                        break;
                }
            });
        }
        
        // Инициализируем расширения для контекстного меню
        if (uiExtensions.contextMenu) {
            uiExtensions.contextMenu.forEach(item => {
                switch (item.type) {
                    case 'menuItem':
                        this.addContextMenuItem(pluginId, item);
                        break;
                    case 'submenu':
                        this.addContextSubmenu(pluginId, item);
                        break;
                    case 'separator':
                        this.addContextMenuSeparator(pluginId);
                        break;
                }
            });
        }
        
        // Инициализируем модальные окна
        if (uiExtensions.modals) {
            uiExtensions.modals.forEach(modal => {
                this.registerModal(pluginId, modal);
            });
        }
        
        this.logger.debug('PluginEditorIntegration: Plugin UI initialized', { 
            pluginId: pluginId
        });
    }
    
    /**
     * Удаляет UI расширения плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     */
    cleanupPluginUI(pluginId) {
        // Удаляем расширения для панели инструментов
        this.eventEmitter.emit('ui:removeToolbarItems', { pluginId });
        
        // Удаляем расширения для боковой панели
        this.eventEmitter.emit('ui:removeSidebarItems', { pluginId });
        
        // Удаляем расширения для контекстного меню
        this.eventEmitter.emit('ui:removeContextMenuItems', { pluginId });
        
        // Удаляем модальные окна
        this.eventEmitter.emit('ui:removeModals', { pluginId });
        
        this.logger.debug('PluginEditorIntegration: Plugin UI cleaned up', { 
            pluginId: pluginId
        });
    }
    
    /**
     * Обрабатывает событие от плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {String} eventName - Имя события
     * @param {Object} data - Данные события
     */
    handlePluginEvent(pluginId, eventName, data) {
        this.logger.debug('PluginEditorIntegration: Plugin event received', { 
            pluginId: pluginId,
            eventName: eventName
        });
        
        // Проверяем безопасность события
        if (!this.validatePluginEvent(pluginId, eventName, data)) {
            this.logger.warn('PluginEditorIntegration: Plugin event rejected', { 
                pluginId: pluginId,
                eventName: eventName
            });
            return;
        }
        
        // Обрабатываем специальные события
        switch (eventName) {
            case 'applyImageFilter':
                this.handleApplyImageFilter(pluginId, data);
                break;
            case 'updateTextBlock':
                this.handleUpdateTextBlock(pluginId, data);
                break;
            case 'showModal':
                this.handleShowModal(pluginId, data);
                break;
            default:
                // Передаем событие другим плагинам
                this.emitEventToPlugins(`plugin:${eventName}`, {
                    ...data,
                    sourcePluginId: pluginId
                });
                break;
        }
    }
    
    /**
     * Проверяет безопасность события от плагина
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {String} eventName - Имя события
     * @param {Object} data - Данные события
     * @returns {Boolean} - Результат проверки
     */
    validatePluginEvent(pluginId, eventName, data) {
        // Проверяем, что плагин имеет право генерировать это событие
        const pluginInfo = this.pluginManager.getPluginInfo(pluginId);
        if (!pluginInfo) {
            return false;
        }
        
        // Проверяем, что событие разрешено для этого плагина
        const allowedEvents = pluginInfo.manifest.allowedEvents || [];
        if (!allowedEvents.includes(eventName) && !allowedEvents.includes('*')) {
            return false;
        }
        
        // Проверяем данные события на наличие вредоносного кода
        // В реальном приложении здесь будет более сложная проверка
        
        return true;
    }
    
    /**
     * Обрабатывает событие применения фильтра к изображению
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} data - Данные события
     */
    handleApplyImageFilter(pluginId, data) {
        if (!data.imageId || !data.filterName) {
            return;
        }
        
        this.logger.debug('PluginEditorIntegration: Applying image filter', { 
            pluginId: pluginId,
            imageId: data.imageId,
            filterName: data.filterName
        });
        
        // Применяем фильтр к изображению
        this.imageEditor.applyFilter(data.imageId, data.filterName, data.params)
            .then(() => {
                // Уведомляем плагин о успешном применении фильтра
                this.pluginManager.handleEvent(pluginId, 'filterApplied', {
                    imageId: data.imageId,
                    filterName: data.filterName,
                    success: true
                });
            })
            .catch(error => {
                // Уведомляем плагин об ошибке
                this.pluginManager.handleEvent(pluginId, 'filterApplied', {
                    imageId: data.imageId,
                    filterName: data.filterName,
                    success: false,
                    error: error.message
                });
            });
    }
    
    /**
     * Обрабатывает событие обновления текстового блока
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} data - Данные события
     */
    handleUpdateTextBlock(pluginId, data) {
        if (!data.textBlockId || !data.text) {
            return;
        }
        
        this.logger.debug('PluginEditorIntegration: Updating text block', { 
            pluginId: pluginId,
            textBlockId: data.textBlockId
        });
        
        // Обновляем текстовый блок
        this.textEditor.updateTextBlock(data.textBlockId, data.text)
            .then(() => {
                // Уведомляем плагин о успешном обновлении
                this.pluginManager.handleEvent(pluginId, 'textBlockUpdated', {
                    textBlockId: data.textBlockId,
                    success: true
                });
            })
            .catch(error => {
                // Уведомляем плагин об ошибке
                this.pluginManager.handleEvent(pluginId, 'textBlockUpdated', {
                    textBlockId: data.textBlockId,
                    success: false,
                    error: error.message
                });
            });
    }
    
    /**
     * Обрабатывает событие отображения модального окна
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} data - Данные события
     */
    handleShowModal(pluginId, data) {
        if (!data.modalId) {
            return;
        }
        
        this.logger.debug('PluginEditorIntegration: Showing modal', { 
            pluginId: pluginId,
            modalId: data.modalId
        });
        
        // Отображаем модальное окно
        this.showModal(data.modalId, data.params);
    }
    
    /**
     * Передает событие всем плагинам
     * 
     * @param {String} eventName - Имя события
     * @param {Object} data - Данные события
     */
    emitEventToPlugins(eventName, data) {
        // Получаем список всех плагинов
        const plugins = this.pluginManager.getLoadedPlugins();
        
        // Передаем событие каждому плагину
        plugins.forEach(pluginId => {
            // Проверяем, подписан ли плагин на это событие
            if (this.pluginEventHandlers.has(pluginId)) {
                const handlers = this.pluginEventHandlers.get(pluginId);
                if (handlers.has(eventName)) {
                    // Вызываем обработчик события
                    handlers.get(eventName)(data);
                }
            }
        });
    }
    
    /**
     * Добавляет кнопку на панель инструментов
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} buttonConfig - Конфигурация кнопки
     */
    addToolbarButton(pluginId, buttonConfig) {
        this.eventEmitter.emit('ui:addToolbarButton', {
            pluginId: pluginId,
            id: buttonConfig.id,
            label: buttonConfig.label,
            icon: buttonConfig.icon,
            tooltip: buttonConfig.tooltip,
            position: buttonConfig.position,
            onClick: () => {
                // Вызываем обработчик нажатия в плагине
                this.pluginManager.handleEvent(pluginId, 'toolbarButtonClick', {
                    buttonId: buttonConfig.id
                });
            }
        });
    }
    
    /**
     * Добавляет выпадающий список на панель инструментов
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} dropdownConfig - Конфигурация выпадающего списка
     */
    addToolbarDropdown(pluginId, dropdownConfig) {
        // Преобразуем обработчики для элементов выпадающего списка
        const items = dropdownConfig.items.map(item => ({
            ...item,
            onClick: () => {
                // Вызываем обработчик нажатия в плагине
                this.pluginManager.handleEvent(pluginId, 'toolbarDropdownItemClick', {
                    dropdownId: dropdownConfig.id,
                    itemId: item.id
                });
            }
        }));
        
        this.eventEmitter.emit('ui:addToolbarDropdown', {
            pluginId: pluginId,
            id: dropdownConfig.id,
            label: dropdownConfig.label,
            icon: dropdownConfig.icon,
            tooltip: dropdownConfig.tooltip,
            position: dropdownConfig.position,
            items: items
        });
    }
    
    /**
     * Добавляет разделитель на панель инструментов
     * 
     * @param {String} pluginId - Идентификатор плагина
     */
    addToolbarSeparator(pluginId) {
        this.eventEmitter.emit('ui:addToolbarSeparator', {
            pluginId: pluginId
        });
    }
    
    /**
     * Добавляет панель в боковую панель
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} panelConfig - Конфигурация панели
     */
    addSidebarPanel(pluginId, panelConfig) {
        this.eventEmitter.emit('ui:addSidebarPanel', {
            pluginId: pluginId,
            id: panelConfig.id,
            title: panelConfig.title,
            icon: panelConfig.icon,
            content: panelConfig.content,
            position: panelConfig.position,
            onShow: () => {
                // Вызываем обработчик показа панели в плагине
                this.pluginManager.handleEvent(pluginId, 'sidebarPanelShow', {
                    panelId: panelConfig.id
                });
            },
            onHide: () => {
                // Вызываем обработчик скрытия панели в плагине
                this.pluginManager.handleEvent(pluginId, 'sidebarPanelHide', {
                    panelId: panelConfig.id
                });
            }
        });
    }
    
    /**
     * Добавляет вкладку в боковую панель
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} tabConfig - Конфигурация вкладки
     */
    addSidebarTab(pluginId, tabConfig) {
        this.eventEmitter.emit('ui:addSidebarTab', {
            pluginId: pluginId,
            id: tabConfig.id,
            title: tabConfig.title,
            icon: tabConfig.icon,
            content: tabConfig.content,
            onActivate: () => {
                // Вызываем обработчик активации вкладки в плагине
                this.pluginManager.handleEvent(pluginId, 'sidebarTabActivate', {
                    tabId: tabConfig.id
                });
            },
            onDeactivate: () => {
                // Вызываем обработчик деактивации вкладки в плагине
                this.pluginManager.handleEvent(pluginId, 'sidebarTabDeactivate', {
                    tabId: tabConfig.id
                });
            }
        });
    }
    
    /**
     * Добавляет пункт в контекстное меню
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} menuItemConfig - Конфигурация пункта меню
     */
    addContextMenuItem(pluginId, menuItemConfig) {
        this.eventEmitter.emit('ui:addContextMenuItem', {
            pluginId: pluginId,
            id: menuItemConfig.id,
            label: menuItemConfig.label,
            icon: menuItemConfig.icon,
            context: menuItemConfig.context,
            onClick: (context) => {
                // Вызываем обработчик нажатия в плагине
                this.pluginManager.handleEvent(pluginId, 'contextMenuItemClick', {
                    menuItemId: menuItemConfig.id,
                    context: context
                });
            }
        });
    }
    
    /**
     * Добавляет подменю в контекстное меню
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} submenuConfig - Конфигурация подменю
     */
    addContextSubmenu(pluginId, submenuConfig) {
        // Преобразуем обработчики для элементов подменю
        const items = submenuConfig.items.map(item => ({
            ...item,
            onClick: (context) => {
                // Вызываем обработчик нажатия в плагине
                this.pluginManager.handleEvent(pluginId, 'contextSubmenuItemClick', {
                    submenuId: submenuConfig.id,
                    itemId: item.id,
                    context: context
                });
            }
        }));
        
        this.eventEmitter.emit('ui:addContextSubmenu', {
            pluginId: pluginId,
            id: submenuConfig.id,
            label: submenuConfig.label,
            icon: submenuConfig.icon,
            context: submenuConfig.context,
            items: items
        });
    }
    
    /**
     * Добавляет разделитель в контекстное меню
     * 
     * @param {String} pluginId - Идентификатор плагина
     */
    addContextMenuSeparator(pluginId) {
        this.eventEmitter.emit('ui:addContextMenuSeparator', {
            pluginId: pluginId
        });
    }
    
    /**
     * Регистрирует модальное окно
     * 
     * @param {String} pluginId - Идентификатор плагина
     * @param {Object} modalConfig - Конфигурация модального окна
     */
    registerModal(pluginId, modalConfig) {
        this.eventEmitter.emit('ui:registerModal', {
            pluginId: pluginId,
            id: modalConfig.id,
            title: modalConfig.title,
            content: modalConfig.content,
            width: modalConfig.width,
            height: modalConfig.height,
            buttons: modalConfig.buttons.map(button => ({
                ...button,
                onClick: (result) => {
                    // Вызываем обработчик нажатия кнопки в плагине
                    this.pluginManager.handleEvent(pluginId, 'modalButtonClick', {
                        modalId: modalConfig.id,
                        buttonId: button.id,
                        result: result
                    });
                }
            })),
            onShow: () => {
                // Вызываем обработчик показа модального окна в плагине
                this.pluginManager.handleEvent(pluginId, 'modalShow', {
                    modalId: modalConfig.id
                });
            },
            onHide: (result) => {
                // Вызываем обработчик скрытия модального окна в плагине
                this.pluginManager.handleEvent(pluginId, 'modalHide', {
                    modalId: modalConfig.id,
                    result: result
                });
            }
        });
    }
    
    /**
     * Отображает модальное окно
     * 
     * @param {String} modalId - Идентификатор модального окна
     * @param {Object} params - Параметры для модального окна
     */
    showModal(modalId, params) {
        this.eventEmitter.emit('ui:showModal', {
            modalId: modalId,
            params: params
        });
    }
    
    /**
     * Освобождает ресурсы и отписывается от событий
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        this.logger.info('PluginEditorIntegration: Disposing');
        
        // Отписываемся от всех событий
        this.eventEmitter.off('pluginManager:pluginLoaded', this.handlePluginLoaded);
        this.eventEmitter.off('pluginManager:pluginUnloaded', this.handlePluginUnloaded);
        this.eventEmitter.off('pluginManager:pluginError', this.handlePluginError);
        this.eventEmitter.off('imageEditor:imageLoaded', this.handleImageLoaded);
        this.eventEmitter.off('imageEditor:imageUpdated', this.handleImageUpdated);
        this.eventEmitter.off('textEditor:textUpdated', this.handleTextUpdated);
        this.eventEmitter.off('layoutEditor:layoutChanged', this.handleLayoutChanged);
        this.eventEmitter.off('integration:ocrResultsAvailable', this.handleOCRResultsAvailable);
        this.eventEmitter.off('integration:translationReady', this.handleTranslationReady);
        
        // Очищаем все коллекции
        this.apiExtensions.clear();
        this.pluginEventHandlers.clear();
        this.uiExtensionPoints.clear();
        
        this.isInitialized = false;
    }
}

module.exports = PluginEditorIntegration;
