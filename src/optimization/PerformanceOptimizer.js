/**
 * PerformanceOptimizer.js
 * 
 * Оптимизатор производительности для интеграционных компонентов
 */

class PerformanceOptimizer {
    /**
     * Создает экземпляр оптимизатора производительности
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.logger - Логгер для вывода информации
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     */
    constructor(options) {
        this.logger = options.logger;
        this.eventEmitter = options.eventEmitter;
        
        this.isInitialized = false;
        
        // Метрики производительности
        this.metrics = new Map();
        
        // Пороговые значения для метрик
        this.thresholds = new Map();
        
        // Кэш оптимизаций
        this.optimizationCache = new Map();
        
        // Стратегии оптимизации
        this.optimizationStrategies = new Map();
        
        // Интервал сбора метрик (в миллисекундах)
        this.metricsInterval = 5000;
    }
    
    /**
     * Инициализирует оптимизатор производительности
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('PerformanceOptimizer: Already initialized');
            return;
        }
        
        // Регистрация обработчиков событий
        this.eventEmitter.on('performance:measure', this.handlePerformanceMeasure.bind(this));
        this.eventEmitter.on('performance:threshold', this.handlePerformanceThreshold.bind(this));
        
        // Регистрация стандартных стратегий оптимизации
        this.registerStandardOptimizationStrategies();
        
        // Запуск интервала сбора метрик
        this.metricsIntervalId = setInterval(() => {
            this.collectMetrics();
        }, this.metricsInterval);
        
        this.isInitialized = true;
        this.logger.info('PerformanceOptimizer: Initialized successfully');
    }
    
    /**
     * Регистрирует стандартные стратегии оптимизации
     */
    registerStandardOptimizationStrategies() {
        // Стратегия кэширования
        this.registerOptimizationStrategy('caching', {
            name: 'Caching Strategy',
            description: 'Improves performance by caching results of expensive operations',
            apply: (context) => {
                const { component, operation } = context;
                
                this.logger.debug('PerformanceOptimizer: Applying caching strategy', { 
                    component, 
                    operation 
                });
                
                // Проверяем, есть ли уже кэш для этого компонента
                if (!this.optimizationCache.has(component)) {
                    this.optimizationCache.set(component, new Map());
                }
                
                const componentCache = this.optimizationCache.get(component);
                
                // Проверяем, есть ли уже кэш для этой операции
                if (!componentCache.has(operation)) {
                    componentCache.set(operation, {
                        enabled: true,
                        hits: 0,
                        misses: 0,
                        lastCleared: Date.now()
                    });
                }
                
                return true;
            },
            
            revert: (context) => {
                const { component, operation } = context;
                
                this.logger.debug('PerformanceOptimizer: Reverting caching strategy', { 
                    component, 
                    operation 
                });
                
                if (this.optimizationCache.has(component)) {
                    const componentCache = this.optimizationCache.get(component);
                    
                    if (componentCache.has(operation)) {
                        componentCache.get(operation).enabled = false;
                    }
                }
                
                return true;
            }
        });
        
        // Стратегия отложенной загрузки
        this.registerOptimizationStrategy('lazy-loading', {
            name: 'Lazy Loading Strategy',
            description: 'Improves performance by loading resources only when needed',
            apply: (context) => {
                const { component, resources } = context;
                
                this.logger.debug('PerformanceOptimizer: Applying lazy loading strategy', { 
                    component, 
                    resources 
                });
                
                // Уведомляем компонент о необходимости использовать отложенную загрузку
                this.eventEmitter.emit('optimization:apply-lazy-loading', {
                    component,
                    resources
                });
                
                return true;
            },
            
            revert: (context) => {
                const { component } = context;
                
                this.logger.debug('PerformanceOptimizer: Reverting lazy loading strategy', { 
                    component 
                });
                
                // Уведомляем компонент о необходимости отключить отложенную загрузку
                this.eventEmitter.emit('optimization:revert-lazy-loading', {
                    component
                });
                
                return true;
            }
        });
        
        // Стратегия пакетной обработки
        this.registerOptimizationStrategy('batching', {
            name: 'Batching Strategy',
            description: 'Improves performance by processing operations in batches',
            apply: (context) => {
                const { component, operations } = context;
                
                this.logger.debug('PerformanceOptimizer: Applying batching strategy', { 
                    component, 
                    operations 
                });
                
                // Уведомляем компонент о необходимости использовать пакетную обработку
                this.eventEmitter.emit('optimization:apply-batching', {
                    component,
                    operations
                });
                
                return true;
            },
            
            revert: (context) => {
                const { component } = context;
                
                this.logger.debug('PerformanceOptimizer: Reverting batching strategy', { 
                    component 
                });
                
                // Уведомляем компонент о необходимости отключить пакетную обработку
                this.eventEmitter.emit('optimization:revert-batching', {
                    component
                });
                
                return true;
            }
        });
        
        // Стратегия предварительной загрузки
        this.registerOptimizationStrategy('preloading', {
            name: 'Preloading Strategy',
            description: 'Improves performance by preloading resources that will be needed soon',
            apply: (context) => {
                const { component, resources } = context;
                
                this.logger.debug('PerformanceOptimizer: Applying preloading strategy', { 
                    component, 
                    resources 
                });
                
                // Уведомляем компонент о необходимости использовать предварительную загрузку
                this.eventEmitter.emit('optimization:apply-preloading', {
                    component,
                    resources
                });
                
                return true;
            },
            
            revert: (context) => {
                const { component } = context;
                
                this.logger.debug('PerformanceOptimizer: Reverting preloading strategy', { 
                    component 
                });
                
                // Уведомляем компонент о необходимости отключить предварительную загрузку
                this.eventEmitter.emit('optimization:revert-preloading', {
                    component
                });
                
                return true;
            }
        });
        
        // Стратегия дросселирования
        this.registerOptimizationStrategy('throttling', {
            name: 'Throttling Strategy',
            description: 'Improves performance by limiting the rate of operations',
            apply: (context) => {
                const { component, operations, limit } = context;
                
                this.logger.debug('PerformanceOptimizer: Applying throttling strategy', { 
                    component, 
                    operations,
                    limit
                });
                
                // Уведомляем компонент о необходимости использовать дросселирование
                this.eventEmitter.emit('optimization:apply-throttling', {
                    component,
                    operations,
                    limit
                });
                
                return true;
            },
            
            revert: (context) => {
                const { component } = context;
                
                this.logger.debug('PerformanceOptimizer: Reverting throttling strategy', { 
                    component 
                });
                
                // Уведомляем компонент о необходимости отключить дросселирование
                this.eventEmitter.emit('optimization:revert-throttling', {
                    component
                });
                
                return true;
            }
        });
    }
    
    /**
     * Регистрирует стратегию оптимизации
     * 
     * @param {String} id - Идентификатор стратегии
     * @param {Object} strategy - Стратегия оптимизации
     * @param {String} strategy.name - Название стратегии
     * @param {String} strategy.description - Описание стратегии
     * @param {Function} strategy.apply - Функция применения стратегии
     * @param {Function} strategy.revert - Функция отката стратегии
     * @returns {Boolean} - Результат регистрации
     */
    registerOptimizationStrategy(id, strategy) {
        if (this.optimizationStrategies.has(id)) {
            this.logger.warn('PerformanceOptimizer: Strategy already registered', { id });
            return false;
        }
        
        this.optimizationStrategies.set(id, strategy);
        
        this.logger.debug('PerformanceOptimizer: Strategy registered', { 
            id, 
            name: strategy.name 
        });
        
        return true;
    }
    
    /**
     * Удаляет стратегию оптимизации
     * 
     * @param {String} id - Идентификатор стратегии
     * @returns {Boolean} - Результат удаления
     */
    unregisterOptimizationStrategy(id) {
        if (!this.optimizationStrategies.has(id)) {
            this.logger.warn('PerformanceOptimizer: Strategy not found', { id });
            return false;
        }
        
        this.optimizationStrategies.delete(id);
        
        this.logger.debug('PerformanceOptimizer: Strategy unregistered', { id });
        
        return true;
    }
    
    /**
     * Применяет стратегию оптимизации
     * 
     * @param {String} id - Идентификатор стратегии
     * @param {Object} context - Контекст применения
     * @returns {Boolean} - Результат применения
     */
    applyOptimizationStrategy(id, context) {
        if (!this.optimizationStrategies.has(id)) {
            this.logger.warn('PerformanceOptimizer: Strategy not found', { id });
            return false;
        }
        
        const strategy = this.optimizationStrategies.get(id);
        
        try {
            const result = strategy.apply(context);
            
            this.logger.info('PerformanceOptimizer: Strategy applied', { 
                id, 
                name: strategy.name,
                context
            });
            
            return result;
        } catch (error) {
            this.logger.error('PerformanceOptimizer: Error applying strategy', { 
                id, 
                error: error.message,
                stack: error.stack
            });
            
            return false;
        }
    }
    
    /**
     * Откатывает стратегию оптимизации
     * 
     * @param {String} id - Идентификатор стратегии
     * @param {Object} context - Контекст отката
     * @returns {Boolean} - Результат отката
     */
    revertOptimizationStrategy(id, context) {
        if (!this.optimizationStrategies.has(id)) {
            this.logger.warn('PerformanceOptimizer: Strategy not found', { id });
            return false;
        }
        
        const strategy = this.optimizationStrategies.get(id);
        
        try {
            const result = strategy.revert(context);
            
            this.logger.info('PerformanceOptimizer: Strategy reverted', { 
                id, 
                name: strategy.name,
                context
            });
            
            return result;
        } catch (error) {
            this.logger.error('PerformanceOptimizer: Error reverting strategy', { 
                id, 
                error: error.message,
                stack: error.stack
            });
            
            return false;
        }
    }
    
    /**
     * Регистрирует метрику производительности
     * 
     * @param {String} id - Идентификатор метрики
     * @param {Object} options - Параметры метрики
     * @param {String} options.name - Название метрики
     * @param {String} options.description - Описание метрики
     * @param {String} options.unit - Единица измерения
     * @param {Function} options.measure - Функция измерения
     * @returns {Boolean} - Результат регистрации
     */
    registerMetric(id, options) {
        if (this.metrics.has(id)) {
            this.logger.warn('PerformanceOptimizer: Metric already registered', { id });
            return false;
        }
        
        this.metrics.set(id, {
            ...options,
            values: [],
            lastMeasured: null
        });
        
        this.logger.debug('PerformanceOptimizer: Metric registered', { 
            id, 
            name: options.name 
        });
        
        return true;
    }
    
    /**
     * Удаляет метрику производительности
     * 
     * @param {String} id - Идентификатор метрики
     * @returns {Boolean} - Результат удаления
     */
    unregisterMetric(id) {
        if (!this.metrics.has(id)) {
            this.logger.warn('PerformanceOptimizer: Metric not found', { id });
            return false;
        }
        
        this.metrics.delete(id);
        
        this.logger.debug('PerformanceOptimizer: Metric unregistered', { id });
        
        return true;
    }
    
    /**
     * Устанавливает пороговое значение для метрики
     * 
     * @param {String} metricId - Идентификатор метрики
     * @param {Object} threshold - Пороговое значение
     * @param {Number} threshold.warning - Пороговое значение для предупреждения
     * @param {Number} threshold.critical - Пороговое значение для критической ситуации
     * @param {Function} threshold.callback - Функция обратного вызова при превышении порога
     * @returns {Boolean} - Результат установки
     */
    setThreshold(metricId, threshold) {
        if (!this.metrics.has(metricId)) {
            this.logger.warn('PerformanceOptimizer: Metric not found', { metricId });
            return false;
        }
        
        this.thresholds.set(metricId, threshold);
        
        this.logger.debug('PerformanceOptimizer: Threshold set', { 
            metricId, 
            warning: threshold.warning,
            critical: threshold.critical
        });
        
        return true;
    }
    
    /**
     * Удаляет пороговое значение для метрики
     * 
     * @param {String} metricId - Идентификатор метрики
     * @returns {Boolean} - Результат удаления
     */
    removeThreshold(metricId) {
        if (!this.thresholds.has(metricId)) {
            this.logger.warn('PerformanceOptimizer: Threshold not found', { metricId });
            return false;
        }
        
        this.thresholds.delete(metricId);
        
        this.logger.debug('PerformanceOptimizer: Threshold removed', { metricId });
        
        return true;
    }
    
    /**
     * Собирает метрики производительности
     */
    collectMetrics() {
        if (!this.isInitialized) {
            return;
        }
        
        this.logger.debug('PerformanceOptimizer: Collecting metrics');
        
        for (const [id, metric] of this.metrics.entries()) {
            try {
                const value = metric.measure();
                
                // Добавляем значение в историю
                metric.values.push({
                    timestamp: Date.now(),
                    value
                });
                
                // Ограничиваем размер истории
                if (metric.values.length > 100) {
                    metric.values.shift();
                }
                
                metric.lastMeasured = Date.now();
                
                this.logger.debug('PerformanceOptimizer: Metric measured', { 
                    id, 
                    value,
                    unit: metric.unit
                });
                
                // Проверяем пороговые значения
                this.checkThreshold(id, value);
            } catch (error) {
                this.logger.error('PerformanceOptimizer: Error measuring metric', { 
                    id, 
                    error: error.message,
                    stack: error.stack
                });
            }
        }
    }
    
    /**
     * Проверяет пороговое значение для метрики
     * 
     * @param {String} metricId - Идентификатор метрики
     * @param {Number} value - Значение метрики
     */
    checkThreshold(metricId, value) {
        if (!this.thresholds.has(metricId)) {
            return;
        }
        
        const threshold = this.thresholds.get(metricId);
        const metric = this.metrics.get(metricId);
        
        if (value >= threshold.critical) {
            this.logger.warn('PerformanceOptimizer: Critical threshold exceeded', { 
                metricId, 
                value,
                threshold: threshold.critical,
                unit: metric.unit
            });
            
            // Уведомляем о превышении порога
            this.eventEmitter.emit('performance:threshold-exceeded', {
                metricId,
                name: metric.name,
                value,
                threshold: threshold.critical,
                level: 'critical',
                unit: metric.unit
            });
            
            // Вызываем функцию обратного вызова
            if (threshold.callback) {
                threshold.callback(metricId, value, 'critical');
            }
        } else if (value >= threshold.warning) {
            this.logger.info('PerformanceOptimizer: Warning threshold exceeded', { 
                metricId, 
                value,
                threshold: threshold.warning,
                unit: metric.unit
            });
            
            // Уведомляем о превышении порога
            this.eventEmitter.emit('performance:threshold-exceeded', {
                metricId,
                name: metric.name,
                value,
                threshold: threshold.warning,
                level: 'warning',
                unit: metric.unit
            });
            
            // Вызываем функцию обратного вызова
            if (threshold.callback) {
                threshold.callback(metricId, value, 'warning');
            }
        }
    }
    
    /**
     * Обрабатывает событие измерения производительности
     * 
     * @param {Object} data - Данные события
     * @param {String} data.metricId - Идентификатор метрики
     * @param {Number} data.value - Значение метрики
     */
    handlePerformanceMeasure(data) {
        const { metricId, value } = data;
        
        if (!this.metrics.has(metricId)) {
            this.logger.warn('PerformanceOptimizer: Metric not found', { metricId });
            return;
        }
        
        const metric = this.metrics.get(metricId);
        
        // Добавляем значение в историю
        metric.values.push({
            timestamp: Date.now(),
            value
        });
        
        // Ограничиваем размер истории
        if (metric.values.length > 100) {
            metric.values.shift();
        }
        
        metric.lastMeasured = Date.now();
        
        this.logger.debug('PerformanceOptimizer: External metric measured', { 
            metricId, 
            value,
            unit: metric.unit
        });
        
        // Проверяем пороговые значения
        this.checkThreshold(metricId, value);
    }
    
    /**
     * Обрабатывает событие превышения порогового значения
     * 
     * @param {Object} data - Данные события
     * @param {String} data.metricId - Идентификатор метрики
     * @param {Number} data.value - Значение метрики
     * @param {String} data.level - Уровень превышения (warning, critical)
     */
    handlePerformanceThreshold(data) {
        const { metricId, value, level } = data;
        
        this.logger.info('PerformanceOptimizer: External threshold notification', { 
            metricId, 
            value,
            level
        });
        
        // Применяем автоматические оптимизации в зависимости от метрики
        switch (metricId) {
            case 'memory-usage':
                if (level === 'critical') {
                    this.applyOptimizationStrategy('caching', {
                        component: 'global',
                        operation: 'clear-cache'
                    });
                }
                break;
                
            case 'response-time':
                if (level === 'critical') {
                    this.applyOptimizationStrategy('throttling', {
                        component: 'global',
                        operations: ['network', 'rendering'],
                        limit: 5
                    });
                }
                break;
                
            case 'cpu-usage':
                if (level === 'critical') {
                    this.applyOptimizationStrategy('batching', {
                        component: 'global',
                        operations: ['rendering', 'processing']
                    });
                }
                break;
        }
    }
    
    /**
     * Получает значение метрики
     * 
     * @param {String} metricId - Идентификатор метрики
     * @returns {Number|null} - Текущее значение метрики или null, если метрика не найдена
     */
    getMetricValue(metricId) {
        if (!this.metrics.has(metricId)) {
            this.logger.warn('PerformanceOptimizer: Metric not found', { metricId });
            return null;
        }
        
        const metric = this.metrics.get(metricId);
        
        if (metric.values.length === 0) {
            return null;
        }
        
        return metric.values[metric.values.length - 1].value;
    }
    
    /**
     * Получает историю значений метрики
     * 
     * @param {String} metricId - Идентификатор метрики
     * @param {Number} limit - Ограничение количества значений
     * @returns {Array|null} - История значений метрики или null, если метрика не найдена
     */
    getMetricHistory(metricId, limit = 0) {
        if (!this.metrics.has(metricId)) {
            this.logger.warn('PerformanceOptimizer: Metric not found', { metricId });
            return null;
        }
        
        const metric = this.metrics.get(metricId);
        
        if (limit > 0 && limit < metric.values.length) {
            return metric.values.slice(-limit);
        }
        
        return [...metric.values];
    }
    
    /**
     * Получает информацию о метрике
     * 
     * @param {String} metricId - Идентификатор метрики
     * @returns {Object|null} - Информация о метрике или null, если метрика не найдена
     */
    getMetricInfo(metricId) {
        if (!this.metrics.has(metricId)) {
            this.logger.warn('PerformanceOptimizer: Metric not found', { metricId });
            return null;
        }
        
        const metric = this.metrics.get(metricId);
        
        return {
            id: metricId,
            name: metric.name,
            description: metric.description,
            unit: metric.unit,
            lastMeasured: metric.lastMeasured,
            currentValue: metric.values.length > 0 ? metric.values[metric.values.length - 1].value : null
        };
    }
    
    /**
     * Получает список всех метрик
     * 
     * @returns {Array} - Список метрик
     */
    getAllMetrics() {
        const result = [];
        
        for (const [id, metric] of this.metrics.entries()) {
            result.push({
                id,
                name: metric.name,
                description: metric.description,
                unit: metric.unit,
                lastMeasured: metric.lastMeasured,
                currentValue: metric.values.length > 0 ? metric.values[metric.values.length - 1].value : null
            });
        }
        
        return result;
    }
    
    /**
     * Получает информацию о стратегии оптимизации
     * 
     * @param {String} strategyId - Идентификатор стратегии
     * @returns {Object|null} - Информация о стратегии или null, если стратегия не найдена
     */
    getStrategyInfo(strategyId) {
        if (!this.optimizationStrategies.has(strategyId)) {
            this.logger.warn('PerformanceOptimizer: Strategy not found', { strategyId });
            return null;
        }
        
        const strategy = this.optimizationStrategies.get(strategyId);
        
        return {
            id: strategyId,
            name: strategy.name,
            description: strategy.description
        };
    }
    
    /**
     * Получает список всех стратегий оптимизации
     * 
     * @returns {Array} - Список стратегий
     */
    getAllStrategies() {
        const result = [];
        
        for (const [id, strategy] of this.optimizationStrategies.entries()) {
            result.push({
                id,
                name: strategy.name,
                description: strategy.description
            });
        }
        
        return result;
    }
    
    /**
     * Генерирует отчет о производительности
     * 
     * @returns {String} - Отчет в формате Markdown
     */
    generatePerformanceReport() {
        let report = '# Performance Report\n\n';
        
        // Добавляем информацию о метриках
        report += '## Metrics\n\n';
        
        for (const [id, metric] of this.metrics.entries()) {
            const currentValue = metric.values.length > 0 ? metric.values[metric.values.length - 1].value : 'N/A';
            
            report += `### ${metric.name} (${id})\n\n`;
            report += `- Description: ${metric.description}\n`;
            report += `- Unit: ${metric.unit}\n`;
            report += `- Current Value: ${currentValue} ${metric.unit}\n`;
            
            if (this.thresholds.has(id)) {
                const threshold = this.thresholds.get(id);
                report += `- Warning Threshold: ${threshold.warning} ${metric.unit}\n`;
                report += `- Critical Threshold: ${threshold.critical} ${metric.unit}\n`;
            }
            
            report += '\n';
            
            // Добавляем график значений метрики
            if (metric.values.length > 0) {
                report += '#### History\n\n';
                report += '```\n';
                
                // Находим минимальное и максимальное значения
                const values = metric.values.map(v => v.value);
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min;
                
                // Создаем простой ASCII график
                const graphHeight = 10;
                const graphWidth = Math.min(50, metric.values.length);
                
                for (let y = 0; y < graphHeight; y++) {
                    const lineValue = max - (y / (graphHeight - 1)) * range;
                    
                    // Добавляем метку оси Y
                    if (y === 0) {
                        report += `${max.toFixed(2).padStart(8)} |`;
                    } else if (y === graphHeight - 1) {
                        report += `${min.toFixed(2).padStart(8)} |`;
                    } else {
                        report += `${' '.repeat(8)}|`;
                    }
                    
                    // Добавляем точки графика
                    for (let x = 0; x < graphWidth; x++) {
                        const index = metric.values.length - graphWidth + x;
                        if (index >= 0) {
                            const value = metric.values[index].value;
                            const normalizedValue = (value - min) / range;
                            const position = (graphHeight - 1) - Math.round(normalizedValue * (graphHeight - 1));
                            
                            report += (position === y) ? '*' : ' ';
                        }
                    }
                    
                    report += '\n';
                }
                
                // Добавляем ось X
                report += `${' '.repeat(8)}+${'-'.repeat(graphWidth)}\n`;
                
                report += '```\n\n';
            }
        }
        
        // Добавляем информацию о стратегиях оптимизации
        report += '## Optimization Strategies\n\n';
        
        for (const [id, strategy] of this.optimizationStrategies.entries()) {
            report += `### ${strategy.name} (${id})\n\n`;
            report += `- Description: ${strategy.description}\n\n`;
        }
        
        return report;
    }
    
    /**
     * Освобождает ресурсы и отписывается от событий
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        // Отписываемся от событий
        this.eventEmitter.off('performance:measure', this.handlePerformanceMeasure);
        this.eventEmitter.off('performance:threshold', this.handlePerformanceThreshold);
        
        // Останавливаем интервал сбора метрик
        if (this.metricsIntervalId) {
            clearInterval(this.metricsIntervalId);
            this.metricsIntervalId = null;
        }
        
        // Очищаем коллекции
        this.metrics.clear();
        this.thresholds.clear();
        this.optimizationCache.clear();
        this.optimizationStrategies.clear();
        
        this.isInitialized = false;
        this.logger.info('PerformanceOptimizer: Disposed');
    }
}

module.exports = PerformanceOptimizer;
