/**
 * ErrorHandler.js
 * 
 * Обработчик ошибок для интеграционных компонентов
 */

class ErrorHandler {
    /**
     * Создает экземпляр обработчика ошибок
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.logger - Логгер для вывода информации об ошибках
     * @param {Object} options.debugUtils - Утилиты отладки
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     */
    constructor(options) {
        this.logger = options.logger;
        this.debugUtils = options.debugUtils;
        this.eventEmitter = options.eventEmitter;
        
        this.isInitialized = false;
        
        // Зарегистрированные обработчики ошибок
        this.errorHandlers = new Map();
        
        // Счетчики ошибок
        this.errorCounts = new Map();
        
        // Максимальное количество повторений ошибки
        this.maxErrorRepeat = 3;
        
        // Период сброса счетчиков ошибок (в миллисекундах)
        this.errorResetPeriod = 60 * 60 * 1000; // 1 час
    }
    
    /**
     * Инициализирует обработчик ошибок
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('ErrorHandler: Already initialized');
            return;
        }
        
        // Регистрация обработчиков событий
        this.eventEmitter.on('error', this.handleError.bind(this));
        
        // Регистрация стандартных обработчиков ошибок
        this.registerStandardErrorHandlers();
        
        // Запуск периодического сброса счетчиков ошибок
        this.errorResetInterval = setInterval(() => {
            this.resetErrorCounts();
        }, this.errorResetPeriod);
        
        this.isInitialized = true;
        this.logger.info('ErrorHandler: Initialized successfully');
    }
    
    /**
     * Регистрирует стандартные обработчики ошибок
     */
    registerStandardErrorHandlers() {
        // Обработчик ошибок сети
        this.registerErrorHandler('network', (error, context) => {
            if (error.name === 'NetworkError' || 
                error.message.includes('network') || 
                error.message.includes('connection')) {
                
                this.logger.warn('ErrorHandler: Network error detected', { 
                    error: error.message,
                    context
                });
                
                // Уведомляем о проблеме с сетью
                this.eventEmitter.emit('ui:showNotification', {
                    type: 'warning',
                    title: 'Network Error',
                    message: 'A network error occurred. Please check your connection and try again.'
                });
                
                return true;
            }
            
            return false;
        });
        
        // Обработчик ошибок доступа к API
        this.registerErrorHandler('api', (error, context) => {
            if (error.name === 'ApiError' || 
                error.message.includes('API') || 
                error.message.includes('status code')) {
                
                this.logger.warn('ErrorHandler: API error detected', { 
                    error: error.message,
                    context
                });
                
                // Уведомляем о проблеме с API
                this.eventEmitter.emit('ui:showNotification', {
                    type: 'warning',
                    title: 'API Error',
                    message: `An API error occurred: ${error.message}`
                });
                
                return true;
            }
            
            return false;
        });
        
        // Обработчик ошибок плагинов
        this.registerErrorHandler('plugin', (error, context) => {
            if (error.name === 'PluginError' || 
                (context && context.source === 'plugin')) {
                
                const pluginId = context && context.pluginId ? context.pluginId : 'unknown';
                
                this.logger.warn('ErrorHandler: Plugin error detected', { 
                    error: error.message,
                    pluginId,
                    context
                });
                
                // Уведомляем о проблеме с плагином
                this.eventEmitter.emit('ui:showNotification', {
                    type: 'warning',
                    title: 'Plugin Error',
                    message: `An error occurred in plugin "${pluginId}": ${error.message}`
                });
                
                // Отключаем проблемный плагин при повторных ошибках
                if (this.incrementErrorCount(`plugin:${pluginId}`) >= this.maxErrorRepeat) {
                    this.logger.error('ErrorHandler: Disabling problematic plugin', { pluginId });
                    
                    this.eventEmitter.emit('pluginManager:disablePlugin', {
                        pluginId,
                        reason: 'Too many errors'
                    });
                    
                    this.eventEmitter.emit('ui:showNotification', {
                        type: 'error',
                        title: 'Plugin Disabled',
                        message: `Plugin "${pluginId}" has been disabled due to repeated errors.`
                    });
                }
                
                return true;
            }
            
            return false;
        });
        
        // Обработчик ошибок OCR
        this.registerErrorHandler('ocr', (error, context) => {
            if (error.name === 'OCRError' || 
                (context && context.component === 'ocr')) {
                
                this.logger.warn('ErrorHandler: OCR error detected', { 
                    error: error.message,
                    context
                });
                
                // Уведомляем о проблеме с OCR
                this.eventEmitter.emit('ui:showNotification', {
                    type: 'warning',
                    title: 'OCR Error',
                    message: 'An error occurred during text recognition. Please try again with a clearer image.'
                });
                
                return true;
            }
            
            return false;
        });
        
        // Обработчик ошибок перевода
        this.registerErrorHandler('translation', (error, context) => {
            if (error.name === 'TranslationError' || 
                (context && context.component === 'translation')) {
                
                this.logger.warn('ErrorHandler: Translation error detected', { 
                    error: error.message,
                    context
                });
                
                // Уведомляем о проблеме с переводом
                this.eventEmitter.emit('ui:showNotification', {
                    type: 'warning',
                    title: 'Translation Error',
                    message: 'An error occurred during translation. Please try again later.'
                });
                
                return true;
            }
            
            return false;
        });
        
        // Обработчик ошибок файловой системы
        this.registerErrorHandler('filesystem', (error, context) => {
            if (error.name === 'FileSystemError' || 
                error.code === 'ENOENT' || 
                error.code === 'EACCES' || 
                error.message.includes('file') || 
                error.message.includes('directory')) {
                
                this.logger.warn('ErrorHandler: File system error detected', { 
                    error: error.message,
                    code: error.code,
                    context
                });
                
                // Уведомляем о проблеме с файловой системой
                this.eventEmitter.emit('ui:showNotification', {
                    type: 'warning',
                    title: 'File System Error',
                    message: `A file system error occurred: ${error.message}`
                });
                
                return true;
            }
            
            return false;
        });
    }
    
    /**
     * Регистрирует обработчик ошибок
     * 
     * @param {String} id - Идентификатор обработчика
     * @param {Function} handler - Функция обработки ошибок
     */
    registerErrorHandler(id, handler) {
        this.errorHandlers.set(id, handler);
        this.logger.debug('ErrorHandler: Handler registered', { id });
    }
    
    /**
     * Удаляет обработчик ошибок
     * 
     * @param {String} id - Идентификатор обработчика
     */
    unregisterErrorHandler(id) {
        if (this.errorHandlers.has(id)) {
            this.errorHandlers.delete(id);
            this.logger.debug('ErrorHandler: Handler unregistered', { id });
        }
    }
    
    /**
     * Обрабатывает ошибку
     * 
     * @param {Error} error - Объект ошибки
     * @param {Object} context - Контекст выполнения
     * @returns {Boolean} - Флаг обработки ошибки
     */
    handleError(error, context) {
        this.logger.error('ErrorHandler: Error received', { 
            error: error.message,
            stack: error.stack,
            context
        });
        
        // Проверяем, обработана ли ошибка отладочными утилитами
        if (this.debugUtils && this.debugUtils.handleError(error, context)) {
            return true;
        }
        
        let handled = false;
        
        // Применяем зарегистрированные обработчики
        for (const [id, handler] of this.errorHandlers.entries()) {
            try {
                if (handler(error, context)) {
                    this.logger.debug('ErrorHandler: Error handled', { 
                        id, 
                        error: error.message
                    });
                    handled = true;
                    break;
                }
            } catch (handlerError) {
                this.logger.error('ErrorHandler: Error in handler', { 
                    id, 
                    error: handlerError.message 
                });
            }
        }
        
        // Если ошибка не обработана, показываем общее уведомление
        if (!handled) {
            this.logger.warn('ErrorHandler: Unhandled error', { 
                error: error.message,
                context
            });
            
            this.eventEmitter.emit('ui:showNotification', {
                type: 'error',
                title: 'Error',
                message: `An unexpected error occurred: ${error.message}`
            });
        }
        
        return handled;
    }
    
    /**
     * Увеличивает счетчик ошибок
     * 
     * @param {String} key - Ключ ошибки
     * @returns {Number} - Новое значение счетчика
     */
    incrementErrorCount(key) {
        const count = (this.errorCounts.get(key) || 0) + 1;
        this.errorCounts.set(key, count);
        return count;
    }
    
    /**
     * Сбрасывает счетчик ошибок
     * 
     * @param {String} key - Ключ ошибки
     */
    resetErrorCount(key) {
        if (this.errorCounts.has(key)) {
            this.errorCounts.delete(key);
        }
    }
    
    /**
     * Сбрасывает все счетчики ошибок
     */
    resetErrorCounts() {
        this.errorCounts.clear();
        this.logger.debug('ErrorHandler: Error counts reset');
    }
    
    /**
     * Создает обертку для функции с обработкой ошибок
     * 
     * @param {Function} fn - Исходная функция
     * @param {Object} context - Контекст выполнения
     * @returns {Function} - Функция с обработкой ошибок
     */
    wrapWithErrorHandling(fn, context) {
        return (...args) => {
            try {
                const result = fn(...args);
                
                // Проверяем, является ли результат промисом
                if (result instanceof Promise) {
                    return result.catch(error => {
                        this.handleError(error, context);
                        throw error;
                    });
                }
                
                return result;
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }
    
    /**
     * Создает прокси для объекта с обработкой ошибок
     * 
     * @param {Object} obj - Исходный объект
     * @param {Object} context - Контекст выполнения
     * @returns {Object} - Прокси-объект
     */
    wrapObjectWithErrorHandling(obj, context) {
        const self = this;
        
        return new Proxy(obj, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                
                if (typeof value === 'function' && prop !== 'constructor') {
                    return self.wrapWithErrorHandling(
                        value.bind(target), 
                        { ...context, method: prop.toString() }
                    );
                }
                
                return value;
            }
        });
    }
    
    /**
     * Освобождает ресурсы и отписывается от событий
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        // Отписываемся от событий
        this.eventEmitter.off('error', this.handleError);
        
        // Останавливаем интервал сброса счетчиков
        if (this.errorResetInterval) {
            clearInterval(this.errorResetInterval);
            this.errorResetInterval = null;
        }
        
        // Очищаем коллекции
        this.errorHandlers.clear();
        this.errorCounts.clear();
        
        this.isInitialized = false;
        this.logger.info('ErrorHandler: Disposed');
    }
}

module.exports = ErrorHandler;
