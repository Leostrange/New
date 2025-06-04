/**
 * DebugUtils.js
 * 
 * Утилиты для отладки и диагностики интеграционных компонентов
 */

class DebugUtils {
    /**
     * Создает экземпляр утилит отладки
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.logger - Логгер для вывода отладочной информации
     */
    constructor(options) {
        this.logger = options.logger;
        this.debugMode = false;
        this.traceEnabled = false;
        this.breakpoints = new Map();
        this.watchedVariables = new Map();
        this.errorHandlers = new Map();
        this.performanceMarks = new Map();
    }
    
    /**
     * Включает или выключает режим отладки
     * 
     * @param {Boolean} enabled - Флаг включения режима отладки
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.logger.info(`DebugUtils: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Включает или выключает трассировку вызовов
     * 
     * @param {Boolean} enabled - Флаг включения трассировки
     */
    setTraceEnabled(enabled) {
        this.traceEnabled = enabled;
        this.logger.info(`DebugUtils: Trace ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Устанавливает точку останова
     * 
     * @param {String} id - Идентификатор точки останова
     * @param {Function} condition - Условие срабатывания
     * @param {Function} callback - Функция обратного вызова
     */
    setBreakpoint(id, condition, callback) {
        this.breakpoints.set(id, { condition, callback });
        this.logger.debug(`DebugUtils: Breakpoint set`, { id });
    }
    
    /**
     * Удаляет точку останова
     * 
     * @param {String} id - Идентификатор точки останова
     */
    removeBreakpoint(id) {
        if (this.breakpoints.has(id)) {
            this.breakpoints.delete(id);
            this.logger.debug(`DebugUtils: Breakpoint removed`, { id });
        }
    }
    
    /**
     * Проверяет точку останова
     * 
     * @param {String} id - Идентификатор точки останова
     * @param {Object} context - Контекст выполнения
     * @returns {Boolean} - Результат проверки
     */
    checkBreakpoint(id, context) {
        if (!this.debugMode || !this.breakpoints.has(id)) {
            return false;
        }
        
        const breakpoint = this.breakpoints.get(id);
        
        try {
            if (breakpoint.condition(context)) {
                this.logger.debug(`DebugUtils: Breakpoint hit`, { id, context });
                breakpoint.callback(context);
                return true;
            }
        } catch (error) {
            this.logger.error(`DebugUtils: Error in breakpoint`, { id, error: error.message });
        }
        
        return false;
    }
    
    /**
     * Добавляет наблюдение за переменной
     * 
     * @param {String} id - Идентификатор наблюдения
     * @param {Function} getter - Функция получения значения
     * @param {Function} onChange - Функция обратного вызова при изменении
     */
    watchVariable(id, getter, onChange) {
        this.watchedVariables.set(id, { 
            getter, 
            onChange, 
            lastValue: undefined,
            lastChecked: Date.now()
        });
        this.logger.debug(`DebugUtils: Variable watch added`, { id });
    }
    
    /**
     * Удаляет наблюдение за переменной
     * 
     * @param {String} id - Идентификатор наблюдения
     */
    unwatchVariable(id) {
        if (this.watchedVariables.has(id)) {
            this.watchedVariables.delete(id);
            this.logger.debug(`DebugUtils: Variable watch removed`, { id });
        }
    }
    
    /**
     * Проверяет наблюдаемые переменные
     */
    checkWatchedVariables() {
        if (!this.debugMode) {
            return;
        }
        
        for (const [id, watch] of this.watchedVariables.entries()) {
            try {
                const currentValue = watch.getter();
                
                // Проверяем, изменилось ли значение
                if (JSON.stringify(currentValue) !== JSON.stringify(watch.lastValue)) {
                    this.logger.debug(`DebugUtils: Watched variable changed`, { 
                        id, 
                        oldValue: watch.lastValue, 
                        newValue: currentValue 
                    });
                    
                    watch.onChange(currentValue, watch.lastValue);
                    watch.lastValue = currentValue;
                }
                
                watch.lastChecked = Date.now();
            } catch (error) {
                this.logger.error(`DebugUtils: Error checking watched variable`, { 
                    id, 
                    error: error.message 
                });
            }
        }
    }
    
    /**
     * Регистрирует обработчик ошибок
     * 
     * @param {String} id - Идентификатор обработчика
     * @param {Function} handler - Функция обработки ошибок
     */
    registerErrorHandler(id, handler) {
        this.errorHandlers.set(id, handler);
        this.logger.debug(`DebugUtils: Error handler registered`, { id });
    }
    
    /**
     * Удаляет обработчик ошибок
     * 
     * @param {String} id - Идентификатор обработчика
     */
    unregisterErrorHandler(id) {
        if (this.errorHandlers.has(id)) {
            this.errorHandlers.delete(id);
            this.logger.debug(`DebugUtils: Error handler unregistered`, { id });
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
        if (!this.debugMode) {
            return false;
        }
        
        let handled = false;
        
        for (const [id, handler] of this.errorHandlers.entries()) {
            try {
                if (handler(error, context)) {
                    this.logger.debug(`DebugUtils: Error handled`, { 
                        id, 
                        error: error.message, 
                        context 
                    });
                    handled = true;
                }
            } catch (handlerError) {
                this.logger.error(`DebugUtils: Error in error handler`, { 
                    id, 
                    error: handlerError.message 
                });
            }
        }
        
        return handled;
    }
    
    /**
     * Начинает измерение производительности
     * 
     * @param {String} id - Идентификатор измерения
     */
    startPerformanceMark(id) {
        this.performanceMarks.set(id, {
            startTime: performance.now(),
            endTime: null
        });
    }
    
    /**
     * Завершает измерение производительности
     * 
     * @param {String} id - Идентификатор измерения
     * @returns {Number|null} - Длительность в миллисекундах или null, если измерение не найдено
     */
    endPerformanceMark(id) {
        if (!this.performanceMarks.has(id)) {
            this.logger.warn(`DebugUtils: Performance mark not found`, { id });
            return null;
        }
        
        const mark = this.performanceMarks.get(id);
        mark.endTime = performance.now();
        
        const duration = mark.endTime - mark.startTime;
        
        this.logger.debug(`DebugUtils: Performance measurement`, { 
            id, 
            duration: `${duration.toFixed(2)}ms` 
        });
        
        return duration;
    }
    
    /**
     * Создает обертку для функции с трассировкой
     * 
     * @param {Function} fn - Исходная функция
     * @param {String} name - Имя функции
     * @returns {Function} - Функция с трассировкой
     */
    traceFunction(fn, name) {
        return (...args) => {
            if (!this.debugMode || !this.traceEnabled) {
                return fn(...args);
            }
            
            const traceId = `${name}:${Date.now()}`;
            
            this.logger.debug(`DebugUtils: Function call`, { 
                name, 
                args: this.sanitizeArgs(args),
                traceId
            });
            
            this.startPerformanceMark(traceId);
            
            try {
                const result = fn(...args);
                
                // Проверяем, является ли результат промисом
                if (result instanceof Promise) {
                    return result.then(
                        (value) => {
                            const duration = this.endPerformanceMark(traceId);
                            this.logger.debug(`DebugUtils: Function returned (async)`, { 
                                name, 
                                result: this.sanitizeResult(value),
                                duration: `${duration.toFixed(2)}ms`,
                                traceId
                            });
                            return value;
                        },
                        (error) => {
                            const duration = this.endPerformanceMark(traceId);
                            this.logger.error(`DebugUtils: Function error (async)`, { 
                                name, 
                                error: error.message,
                                duration: `${duration.toFixed(2)}ms`,
                                traceId
                            });
                            throw error;
                        }
                    );
                } else {
                    const duration = this.endPerformanceMark(traceId);
                    this.logger.debug(`DebugUtils: Function returned`, { 
                        name, 
                        result: this.sanitizeResult(result),
                        duration: `${duration.toFixed(2)}ms`,
                        traceId
                    });
                    return result;
                }
            } catch (error) {
                const duration = this.endPerformanceMark(traceId);
                this.logger.error(`DebugUtils: Function error`, { 
                    name, 
                    error: error.message,
                    duration: `${duration.toFixed(2)}ms`,
                    traceId
                });
                throw error;
            }
        };
    }
    
    /**
     * Обрабатывает аргументы для логирования
     * 
     * @param {Array} args - Аргументы функции
     * @returns {Array} - Обработанные аргументы
     */
    sanitizeArgs(args) {
        return args.map(arg => {
            if (arg === null) {
                return null;
            }
            
            if (arg === undefined) {
                return undefined;
            }
            
            if (typeof arg === 'function') {
                return '[Function]';
            }
            
            if (arg instanceof Error) {
                return {
                    name: arg.name,
                    message: arg.message
                };
            }
            
            if (typeof arg === 'object') {
                try {
                    // Проверяем, можно ли сериализовать объект
                    JSON.stringify(arg);
                    return arg;
                } catch (error) {
                    return '[Complex Object]';
                }
            }
            
            return arg;
        });
    }
    
    /**
     * Обрабатывает результат для логирования
     * 
     * @param {*} result - Результат функции
     * @returns {*} - Обработанный результат
     */
    sanitizeResult(result) {
        if (result === null) {
            return null;
        }
        
        if (result === undefined) {
            return undefined;
        }
        
        if (typeof result === 'function') {
            return '[Function]';
        }
        
        if (result instanceof Error) {
            return {
                name: result.name,
                message: result.message
            };
        }
        
        if (typeof result === 'object') {
            try {
                // Проверяем, можно ли сериализовать объект
                JSON.stringify(result);
                return result;
            } catch (error) {
                return '[Complex Object]';
            }
        }
        
        return result;
    }
    
    /**
     * Создает прокси для объекта с трассировкой методов
     * 
     * @param {Object} obj - Исходный объект
     * @param {String} name - Имя объекта
     * @returns {Object} - Прокси-объект
     */
    traceObject(obj, name) {
        const self = this;
        
        return new Proxy(obj, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                
                if (typeof value === 'function' && prop !== 'constructor') {
                    return self.traceFunction(value.bind(target), `${name}.${prop.toString()}`);
                }
                
                return value;
            }
        });
    }
    
    /**
     * Создает отладочную версию класса
     * 
     * @param {Class} cls - Исходный класс
     * @param {String} name - Имя класса
     * @returns {Class} - Отладочная версия класса
     */
    debugClass(cls, name) {
        const self = this;
        
        return class DebugClass extends cls {
            constructor(...args) {
                if (self.debugMode && self.traceEnabled) {
                    self.logger.debug(`DebugUtils: Class instantiated`, { 
                        name, 
                        args: self.sanitizeArgs(args) 
                    });
                }
                
                super(...args);
                
                // Оборачиваем методы для трассировки
                if (self.debugMode && self.traceEnabled) {
                    for (const prop of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
                        if (prop !== 'constructor' && typeof this[prop] === 'function') {
                            this[prop] = self.traceFunction(this[prop].bind(this), `${name}#${prop}`);
                        }
                    }
                }
            }
        };
    }
    
    /**
     * Создает отладочную версию функции
     * 
     * @param {Function} fn - Исходная функция
     * @param {String} name - Имя функции
     * @returns {Function} - Отладочная версия функции
     */
    debugFunction(fn, name) {
        return this.traceFunction(fn, name);
    }
    
    /**
     * Создает отладочную версию объекта
     * 
     * @param {Object} obj - Исходный объект
     * @param {String} name - Имя объекта
     * @returns {Object} - Отладочная версия объекта
     */
    debugObject(obj, name) {
        return this.traceObject(obj, name);
    }
}

module.exports = DebugUtils;
