/**
 * ResourceManager.js
 * 
 * Менеджер ресурсов для оптимизации использования памяти и ресурсов
 */

class ResourceManager {
    /**
     * Создает экземпляр менеджера ресурсов
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.logger - Логгер для вывода информации
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     * @param {Object} options.performanceOptimizer - Оптимизатор производительности
     */
    constructor(options) {
        this.logger = options.logger;
        this.eventEmitter = options.eventEmitter;
        this.performanceOptimizer = options.performanceOptimizer;
        
        this.isInitialized = false;
        
        // Зарегистрированные ресурсы
        this.resources = new Map();
        
        // Лимиты ресурсов
        this.resourceLimits = new Map();
        
        // Стратегии освобождения ресурсов
        this.releaseStrategies = new Map();
        
        // Интервал проверки ресурсов (в миллисекундах)
        this.checkInterval = 10000;
    }
    
    /**
     * Инициализирует менеджер ресурсов
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('ResourceManager: Already initialized');
            return;
        }
        
        // Регистрация обработчиков событий
        this.eventEmitter.on('resource:register', this.handleResourceRegister.bind(this));
        this.eventEmitter.on('resource:release', this.handleResourceRelease.bind(this));
        this.eventEmitter.on('resource:update', this.handleResourceUpdate.bind(this));
        
        // Регистрация стандартных стратегий освобождения ресурсов
        this.registerStandardReleaseStrategies();
        
        // Регистрация метрик производительности
        this.registerPerformanceMetrics();
        
        // Запуск интервала проверки ресурсов
        this.checkIntervalId = setInterval(() => {
            this.checkResources();
        }, this.checkInterval);
        
        this.isInitialized = true;
        this.logger.info('ResourceManager: Initialized successfully');
    }
    
    /**
     * Регистрирует стандартные стратегии освобождения ресурсов
     */
    registerStandardReleaseStrategies() {
        // Стратегия LRU (Least Recently Used)
        this.registerReleaseStrategy('lru', {
            name: 'Least Recently Used',
            description: 'Releases resources that have not been used for the longest time',
            select: (resources, limit) => {
                // Сортируем ресурсы по времени последнего использования
                const sorted = [...resources].sort((a, b) => a.lastUsed - b.lastUsed);
                
                // Возвращаем ресурсы, которые нужно освободить
                return sorted.slice(0, Math.max(1, Math.ceil(resources.length * limit)));
            }
        });
        
        // Стратегия LFU (Least Frequently Used)
        this.registerReleaseStrategy('lfu', {
            name: 'Least Frequently Used',
            description: 'Releases resources that are used least frequently',
            select: (resources, limit) => {
                // Сортируем ресурсы по частоте использования
                const sorted = [...resources].sort((a, b) => a.useCount - b.useCount);
                
                // Возвращаем ресурсы, которые нужно освободить
                return sorted.slice(0, Math.max(1, Math.ceil(resources.length * limit)));
            }
        });
        
        // Стратегия Size-based
        this.registerReleaseStrategy('size', {
            name: 'Size-based',
            description: 'Releases largest resources first',
            select: (resources, limit) => {
                // Сортируем ресурсы по размеру (от большего к меньшему)
                const sorted = [...resources].sort((a, b) => b.size - a.size);
                
                // Возвращаем ресурсы, которые нужно освободить
                return sorted.slice(0, Math.max(1, Math.ceil(resources.length * limit)));
            }
        });
        
        // Стратегия Priority-based
        this.registerReleaseStrategy('priority', {
            name: 'Priority-based',
            description: 'Releases resources with lowest priority first',
            select: (resources, limit) => {
                // Сортируем ресурсы по приоритету (от низкого к высокому)
                const sorted = [...resources].sort((a, b) => a.priority - b.priority);
                
                // Возвращаем ресурсы, которые нужно освободить
                return sorted.slice(0, Math.max(1, Math.ceil(resources.length * limit)));
            }
        });
        
        // Стратегия Composite
        this.registerReleaseStrategy('composite', {
            name: 'Composite',
            description: 'Uses a combination of strategies',
            select: (resources, limit) => {
                // Вычисляем композитный рейтинг для каждого ресурса
                const rated = resources.map(resource => {
                    // Нормализуем значения от 0 до 1
                    const recencyScore = (Date.now() - resource.lastUsed) / (24 * 60 * 60 * 1000); // Нормализуем по дням
                    const frequencyScore = 1 / (resource.useCount + 1);
                    const sizeScore = resource.size / (10 * 1024 * 1024); // Нормализуем по 10 МБ
                    const priorityScore = 1 - (resource.priority / 10); // Приоритет от 0 до 10
                    
                    // Вычисляем композитный рейтинг (больше - выше вероятность освобождения)
                    const rating = (recencyScore * 0.4) + (frequencyScore * 0.3) + (sizeScore * 0.2) + (priorityScore * 0.1);
                    
                    return { resource, rating };
                });
                
                // Сортируем по рейтингу (от большего к меньшему)
                rated.sort((a, b) => b.rating - a.rating);
                
                // Возвращаем ресурсы, которые нужно освободить
                return rated.slice(0, Math.max(1, Math.ceil(resources.length * limit))).map(item => item.resource);
            }
        });
    }
    
    /**
     * Регистрирует метрики производительности
     */
    registerPerformanceMetrics() {
        if (!this.performanceOptimizer) {
            return;
        }
        
        // Метрика общего использования памяти
        this.performanceOptimizer.registerMetric('resource-memory-usage', {
            name: 'Resource Memory Usage',
            description: 'Total memory usage of managed resources',
            unit: 'MB',
            measure: () => {
                let totalSize = 0;
                
                for (const resource of this.resources.values()) {
                    totalSize += resource.size;
                }
                
                return totalSize / (1024 * 1024); // Конвертируем в МБ
            }
        });
        
        // Устанавливаем пороговые значения
        this.performanceOptimizer.setThreshold('resource-memory-usage', {
            warning: 100, // 100 МБ
            critical: 200, // 200 МБ
            callback: (metricId, value, level) => {
                if (level === 'critical') {
                    // Освобождаем 30% ресурсов при критическом уровне
                    this.releaseResources('memory', 0.3);
                } else if (level === 'warning') {
                    // Освобождаем 10% ресурсов при предупреждении
                    this.releaseResources('memory', 0.1);
                }
            }
        });
        
        // Метрика количества ресурсов
        this.performanceOptimizer.registerMetric('resource-count', {
            name: 'Resource Count',
            description: 'Number of managed resources',
            unit: 'count',
            measure: () => {
                return this.resources.size;
            }
        });
        
        // Устанавливаем пороговые значения
        this.performanceOptimizer.setThreshold('resource-count', {
            warning: 1000, // 1000 ресурсов
            critical: 2000, // 2000 ресурсов
            callback: (metricId, value, level) => {
                if (level === 'critical') {
                    // Освобождаем 30% ресурсов при критическом уровне
                    this.releaseResources('count', 0.3);
                } else if (level === 'warning') {
                    // Освобождаем 10% ресурсов при предупреждении
                    this.releaseResources('count', 0.1);
                }
            }
        });
    }
    
    /**
     * Регистрирует стратегию освобождения ресурсов
     * 
     * @param {String} id - Идентификатор стратегии
     * @param {Object} strategy - Стратегия освобождения ресурсов
     * @param {String} strategy.name - Название стратегии
     * @param {String} strategy.description - Описание стратегии
     * @param {Function} strategy.select - Функция выбора ресурсов для освобождения
     * @returns {Boolean} - Результат регистрации
     */
    registerReleaseStrategy(id, strategy) {
        if (this.releaseStrategies.has(id)) {
            this.logger.warn('ResourceManager: Strategy already registered', { id });
            return false;
        }
        
        this.releaseStrategies.set(id, strategy);
        
        this.logger.debug('ResourceManager: Release strategy registered', { 
            id, 
            name: strategy.name 
        });
        
        return true;
    }
    
    /**
     * Удаляет стратегию освобождения ресурсов
     * 
     * @param {String} id - Идентификатор стратегии
     * @returns {Boolean} - Результат удаления
     */
    unregisterReleaseStrategy(id) {
        if (!this.releaseStrategies.has(id)) {
            this.logger.warn('ResourceManager: Strategy not found', { id });
            return false;
        }
        
        this.releaseStrategies.delete(id);
        
        this.logger.debug('ResourceManager: Release strategy unregistered', { id });
        
        return true;
    }
    
    /**
     * Регистрирует ресурс
     * 
     * @param {String} id - Идентификатор ресурса
     * @param {Object} resource - Информация о ресурсе
     * @param {String} resource.type - Тип ресурса
     * @param {Number} resource.size - Размер ресурса в байтах
     * @param {Number} resource.priority - Приоритет ресурса (от 0 до 10)
     * @param {Function} resource.release - Функция освобождения ресурса
     * @returns {Boolean} - Результат регистрации
     */
    registerResource(id, resource) {
        if (this.resources.has(id)) {
            this.logger.warn('ResourceManager: Resource already registered', { id });
            return false;
        }
        
        this.resources.set(id, {
            ...resource,
            registered: Date.now(),
            lastUsed: Date.now(),
            useCount: 0
        });
        
        this.logger.debug('ResourceManager: Resource registered', { 
            id, 
            type: resource.type,
            size: resource.size
        });
        
        // Проверяем лимиты ресурсов
        this.checkResourceLimits(resource.type);
        
        return true;
    }
    
    /**
     * Обновляет информацию о ресурсе
     * 
     * @param {String} id - Идентификатор ресурса
     * @param {Object} updates - Обновления ресурса
     * @returns {Boolean} - Результат обновления
     */
    updateResource(id, updates) {
        if (!this.resources.has(id)) {
            this.logger.warn('ResourceManager: Resource not found', { id });
            return false;
        }
        
        const resource = this.resources.get(id);
        
        // Обновляем информацию о ресурсе
        Object.assign(resource, updates);
        
        // Обновляем время последнего использования
        resource.lastUsed = Date.now();
        resource.useCount++;
        
        this.logger.debug('ResourceManager: Resource updated', { id });
        
        return true;
    }
    
    /**
     * Использует ресурс
     * 
     * @param {String} id - Идентификатор ресурса
     * @returns {Boolean} - Результат использования
     */
    useResource(id) {
        if (!this.resources.has(id)) {
            this.logger.warn('ResourceManager: Resource not found', { id });
            return false;
        }
        
        const resource = this.resources.get(id);
        
        // Обновляем время последнего использования и счетчик использований
        resource.lastUsed = Date.now();
        resource.useCount++;
        
        this.logger.debug('ResourceManager: Resource used', { id });
        
        return true;
    }
    
    /**
     * Освобождает ресурс
     * 
     * @param {String} id - Идентификатор ресурса
     * @returns {Boolean} - Результат освобождения
     */
    releaseResource(id) {
        if (!this.resources.has(id)) {
            this.logger.warn('ResourceManager: Resource not found', { id });
            return false;
        }
        
        const resource = this.resources.get(id);
        
        try {
            // Вызываем функцию освобождения ресурса
            if (resource.release) {
                resource.release();
            }
            
            // Удаляем ресурс из реестра
            this.resources.delete(id);
            
            this.logger.debug('ResourceManager: Resource released', { id });
            
            return true;
        } catch (error) {
            this.logger.error('ResourceManager: Error releasing resource', { 
                id, 
                error: error.message,
                stack: error.stack
            });
            
            return false;
        }
    }
    
    /**
     * Устанавливает лимит для типа ресурсов
     * 
     * @param {String} type - Тип ресурса
     * @param {Object} limit - Лимит ресурсов
     * @param {Number} limit.count - Максимальное количество ресурсов
     * @param {Number} limit.size - Максимальный размер ресурсов в байтах
     * @param {String} limit.strategy - Стратегия освобождения ресурсов
     * @returns {Boolean} - Результат установки
     */
    setResourceLimit(type, limit) {
        this.resourceLimits.set(type, limit);
        
        this.logger.debug('ResourceManager: Resource limit set', { 
            type, 
            count: limit.count,
            size: limit.size,
            strategy: limit.strategy
        });
        
        // Проверяем лимиты ресурсов
        this.checkResourceLimits(type);
        
        return true;
    }
    
    /**
     * Удаляет лимит для типа ресурсов
     * 
     * @param {String} type - Тип ресурса
     * @returns {Boolean} - Результат удаления
     */
    removeResourceLimit(type) {
        if (!this.resourceLimits.has(type)) {
            this.logger.warn('ResourceManager: Resource limit not found', { type });
            return false;
        }
        
        this.resourceLimits.delete(type);
        
        this.logger.debug('ResourceManager: Resource limit removed', { type });
        
        return true;
    }
    
    /**
     * Проверяет лимиты ресурсов
     * 
     * @param {String} type - Тип ресурса
     */
    checkResourceLimits(type) {
        if (!this.resourceLimits.has(type)) {
            return;
        }
        
        const limit = this.resourceLimits.get(type);
        
        // Получаем ресурсы указанного типа
        const resources = [...this.resources.entries()]
            .filter(([_, resource]) => resource.type === type)
            .map(([id, resource]) => ({ id, ...resource }));
        
        // Проверяем лимит количества
        if (limit.count && resources.length > limit.count) {
            this.logger.info('ResourceManager: Resource count limit exceeded', { 
                type, 
                count: resources.length,
                limit: limit.count
            });
            
            // Вычисляем, сколько ресурсов нужно освободить
            const releaseCount = resources.length - limit.count;
            const releaseRatio = releaseCount / resources.length;
            
            // Освобождаем ресурсы
            this.releaseResourcesByType(type, releaseRatio, limit.strategy);
        }
        
        // Проверяем лимит размера
        if (limit.size) {
            const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0);
            
            if (totalSize > limit.size) {
                this.logger.info('ResourceManager: Resource size limit exceeded', { 
                    type, 
                    size: totalSize,
                    limit: limit.size
                });
                
                // Вычисляем, какую долю ресурсов нужно освободить
                const releaseRatio = (totalSize - limit.size) / totalSize;
                
                // Освобождаем ресурсы
                this.releaseResourcesByType(type, releaseRatio, limit.strategy);
            }
        }
    }
    
    /**
     * Освобождает ресурсы указанного типа
     * 
     * @param {String} type - Тип ресурса
     * @param {Number} ratio - Доля ресурсов для освобождения (от 0 до 1)
     * @param {String} strategyId - Идентификатор стратегии освобождения
     */
    releaseResourcesByType(type, ratio, strategyId) {
        // Получаем ресурсы указанного типа
        const resources = [...this.resources.entries()]
            .filter(([_, resource]) => resource.type === type)
            .map(([id, resource]) => ({ id, ...resource }));
        
        // Если ресурсов нет, выходим
        if (resources.length === 0) {
            return;
        }
        
        // Получаем стратегию освобождения
        const strategy = this.releaseStrategies.get(strategyId || 'lru');
        
        if (!strategy) {
            this.logger.warn('ResourceManager: Release strategy not found', { strategyId });
            return;
        }
        
        // Выбираем ресурсы для освобождения
        const toRelease = strategy.select(resources, ratio);
        
        this.logger.info('ResourceManager: Releasing resources', { 
            type, 
            count: toRelease.length,
            strategy: strategyId || 'lru'
        });
        
        // Освобождаем выбранные ресурсы
        for (const resource of toRelease) {
            this.releaseResource(resource.id);
        }
    }
    
    /**
     * Освобождает ресурсы по критерию
     * 
     * @param {String} criterion - Критерий освобождения (memory, count)
     * @param {Number} ratio - Доля ресурсов для освобождения (от 0 до 1)
     */
    releaseResources(criterion, ratio) {
        // Получаем все ресурсы
        const resources = [...this.resources.entries()]
            .map(([id, resource]) => ({ id, ...resource }));
        
        // Если ресурсов нет, выходим
        if (resources.length === 0) {
            return;
        }
        
        // Выбираем стратегию в зависимости от критерия
        let strategyId;
        
        switch (criterion) {
            case 'memory':
                strategyId = 'size';
                break;
                
            case 'count':
                strategyId = 'composite';
                break;
                
            default:
                strategyId = 'lru';
        }
        
        // Получаем стратегию освобождения
        const strategy = this.releaseStrategies.get(strategyId);
        
        if (!strategy) {
            this.logger.warn('ResourceManager: Release strategy not found', { strategyId });
            return;
        }
        
        // Выбираем ресурсы для освобождения
        const toRelease = strategy.select(resources, ratio);
        
        this.logger.info('ResourceManager: Releasing resources by criterion', { 
            criterion, 
            count: toRelease.length,
            strategy: strategyId
        });
        
        // Освобождаем выбранные ресурсы
        for (const resource of toRelease) {
            this.releaseResource(resource.id);
        }
    }
    
    /**
     * Проверяет все ресурсы
     */
    checkResources() {
        if (!this.isInitialized) {
            return;
        }
        
        this.logger.debug('ResourceManager: Checking resources');
        
        // Проверяем лимиты для всех типов ресурсов
        for (const type of this.resourceLimits.keys()) {
            this.checkResourceLimits(type);
        }
        
        // Проверяем устаревшие ресурсы
        const now = Date.now();
        const staleThreshold = 30 * 60 * 1000; // 30 минут
        
        for (const [id, resource] of this.resources.entries()) {
            // Если ресурс не использовался более 30 минут и не имеет высокого приоритета
            if ((now - resource.lastUsed > staleThreshold) && (resource.priority < 7)) {
                this.logger.debug('ResourceManager: Releasing stale resource', { id });
                this.releaseResource(id);
            }
        }
    }
    
    /**
     * Обрабатывает событие регистрации ресурса
     * 
     * @param {Object} data - Данные события
     * @param {String} data.id - Идентификатор ресурса
     * @param {Object} data.resource - Информация о ресурсе
     */
    handleResourceRegister(data) {
        const { id, resource } = data;
        
        this.registerResource(id, resource);
    }
    
    /**
     * Обрабатывает событие освобождения ресурса
     * 
     * @param {Object} data - Данные события
     * @param {String} data.id - Идентификатор ресурса
     */
    handleResourceRelease(data) {
        const { id } = data;
        
        this.releaseResource(id);
    }
    
    /**
     * Обрабатывает событие обновления ресурса
     * 
     * @param {Object} data - Данные события
     * @param {String} data.id - Идентификатор ресурса
     * @param {Object} data.updates - Обновления ресурса
     */
    handleResourceUpdate(data) {
        const { id, updates } = data;
        
        this.updateResource(id, updates);
    }
    
    /**
     * Получает информацию о ресурсе
     * 
     * @param {String} id - Идентификатор ресурса
     * @returns {Object|null} - Информация о ресурсе или null, если ресурс не найден
     */
    getResourceInfo(id) {
        if (!this.resources.has(id)) {
            return null;
        }
        
        const resource = this.resources.get(id);
        
        return {
            id,
            type: resource.type,
            size: resource.size,
            priority: resource.priority,
            registered: resource.registered,
            lastUsed: resource.lastUsed,
            useCount: resource.useCount
        };
    }
    
    /**
     * Получает список всех ресурсов
     * 
     * @param {String} type - Опциональный фильтр по типу
     * @returns {Array} - Список ресурсов
     */
    getAllResources(type = null) {
        const result = [];
        
        for (const [id, resource] of this.resources.entries()) {
            if (type && resource.type !== type) {
                continue;
            }
            
            result.push({
                id,
                type: resource.type,
                size: resource.size,
                priority: resource.priority,
                registered: resource.registered,
                lastUsed: resource.lastUsed,
                useCount: resource.useCount
            });
        }
        
        return result;
    }
    
    /**
     * Получает статистику по ресурсам
     * 
     * @returns {Object} - Статистика по ресурсам
     */
    getResourceStats() {
        const stats = {
            totalCount: this.resources.size,
            totalSize: 0,
            byType: new Map()
        };
        
        for (const [_, resource] of this.resources.entries()) {
            stats.totalSize += resource.size;
            
            if (!stats.byType.has(resource.type)) {
                stats.byType.set(resource.type, {
                    count: 0,
                    size: 0
                });
            }
            
            const typeStats = stats.byType.get(resource.type);
            typeStats.count++;
            typeStats.size += resource.size;
        }
        
        return stats;
    }
    
    /**
     * Генерирует отчет о ресурсах
     * 
     * @returns {String} - Отчет в формате Markdown
     */
    generateResourceReport() {
        const stats = this.getResourceStats();
        
        let report = '# Resource Management Report\n\n';
        
        // Добавляем общую статистику
        report += '## Overall Statistics\n\n';
        report += `- Total resources: ${stats.totalCount}\n`;
        report += `- Total size: ${(stats.totalSize / (1024 * 1024)).toFixed(2)} MB\n\n`;
        
        // Добавляем статистику по типам
        report += '## Resources by Type\n\n';
        
        for (const [type, typeStats] of stats.byType.entries()) {
            report += `### ${type}\n\n`;
            report += `- Count: ${typeStats.count}\n`;
            report += `- Size: ${(typeStats.size / (1024 * 1024)).toFixed(2)} MB\n`;
            
            if (this.resourceLimits.has(type)) {
                const limit = this.resourceLimits.get(type);
                report += `- Count limit: ${limit.count || 'N/A'}\n`;
                report += `- Size limit: ${limit.size ? (limit.size / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}\n`;
                report += `- Release strategy: ${limit.strategy || 'lru'}\n`;
            }
            
            report += '\n';
        }
        
        // Добавляем информацию о стратегиях освобождения
        report += '## Release Strategies\n\n';
        
        for (const [id, strategy] of this.releaseStrategies.entries()) {
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
        this.eventEmitter.off('resource:register', this.handleResourceRegister);
        this.eventEmitter.off('resource:release', this.handleResourceRelease);
        this.eventEmitter.off('resource:update', this.handleResourceUpdate);
        
        // Останавливаем интервал проверки ресурсов
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }
        
        // Освобождаем все ресурсы
        for (const [id, _] of this.resources.entries()) {
            this.releaseResource(id);
        }
        
        // Очищаем коллекции
        this.resources.clear();
        this.resourceLimits.clear();
        this.releaseStrategies.clear();
        
        this.isInitialized = false;
        this.logger.info('ResourceManager: Disposed');
    }
}

module.exports = ResourceManager;
