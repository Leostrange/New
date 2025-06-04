/**
 * ResourceAudit.js
 * 
 * Модуль для аудита и оптимизации управления ресурсами
 */

/**
 * Класс для аудита и оптимизации управления ресурсами
 */
class ResourceAudit {
    /**
     * Создает экземпляр аудитора ресурсов
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.resourceManager - Менеджер ресурсов
     * @param {Object} options.logger - Логгер для вывода информации
     * @param {Object} options.performanceOptimizer - Оптимизатор производительности
     */
    constructor(options) {
        this.resourceManager = options.resourceManager;
        this.logger = options.logger;
        this.performanceOptimizer = options.performanceOptimizer;
        
        this.isInitialized = false;
        this.auditResults = [];
        this.auditInterval = 3600000; // 1 час
        this.auditIntervalId = null;
        this.resourceLeakDetectionEnabled = true;
        this.resourceLeakThreshold = 24 * 3600000; // 24 часа
        this.resourceGrowthThreshold = 0.2; // 20% рост за период аудита
        this.lastAuditStats = null;
    }
    
    /**
     * Инициализирует аудитор ресурсов
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('ResourceAudit: Already initialized');
            return;
        }
        
        // Запускаем интервал аудита
        this.auditIntervalId = setInterval(() => {
            this.performAudit();
        }, this.auditInterval);
        
        // Выполняем первичный аудит
        this.performAudit();
        
        this.isInitialized = true;
        this.logger.info('ResourceAudit: Initialized successfully');
    }
    
    /**
     * Выполняет аудит ресурсов
     */
    performAudit() {
        if (!this.resourceManager) {
            this.logger.error('ResourceAudit: Resource manager not available');
            return;
        }
        
        this.logger.info('ResourceAudit: Starting resource audit');
        
        const auditResult = {
            timestamp: Date.now(),
            resourceStats: this.resourceManager.getResourceStats(),
            issues: [],
            recommendations: []
        };
        
        // Проверяем утечки ресурсов
        if (this.resourceLeakDetectionEnabled) {
            this.detectResourceLeaks(auditResult);
        }
        
        // Проверяем рост использования ресурсов
        if (this.lastAuditStats) {
            this.detectResourceGrowth(auditResult);
        }
        
        // Проверяем фрагментацию ресурсов
        this.detectResourceFragmentation(auditResult);
        
        // Проверяем неиспользуемые ресурсы
        this.detectUnusedResources(auditResult);
        
        // Проверяем неэффективные стратегии освобождения
        this.analyzeReleaseStrategies(auditResult);
        
        // Сохраняем результаты аудита
        this.auditResults.push(auditResult);
        
        // Ограничиваем количество сохраненных результатов
        if (this.auditResults.length > 10) {
            this.auditResults.shift();
        }
        
        // Сохраняем текущую статистику для следующего аудита
        this.lastAuditStats = auditResult.resourceStats;
        
        // Логируем результаты аудита
        this.logger.info('ResourceAudit: Audit completed', {
            issuesCount: auditResult.issues.length,
            recommendationsCount: auditResult.recommendations.length
        });
        
        // Применяем автоматические оптимизации
        this.applyAutomaticOptimizations(auditResult);
    }
    
    /**
     * Обнаруживает утечки ресурсов
     * 
     * @param {Object} auditResult - Результат аудита
     */
    detectResourceLeaks(auditResult) {
        const resources = this.resourceManager.getAllResources();
        const now = Date.now();
        
        // Ищем ресурсы, которые не использовались длительное время
        const oldResources = resources.filter(resource => 
            (now - resource.lastUsed > this.resourceLeakThreshold) && 
            (resource.priority < 8) // Исключаем высокоприоритетные ресурсы
        );
        
        if (oldResources.length > 0) {
            auditResult.issues.push({
                type: 'resource_leak',
                severity: 'high',
                description: `Обнаружено ${oldResources.length} ресурсов, которые не использовались более 24 часов`,
                affectedResources: oldResources.map(r => r.id)
            });
            
            auditResult.recommendations.push({
                type: 'release_old_resources',
                description: 'Освободить ресурсы, которые не использовались более 24 часов',
                autoApplicable: true
            });
        }
    }
    
    /**
     * Обнаруживает аномальный рост использования ресурсов
     * 
     * @param {Object} auditResult - Результат аудита
     */
    detectResourceGrowth(auditResult) {
        const currentStats = auditResult.resourceStats;
        const previousStats = this.lastAuditStats;
        
        // Проверяем общий рост количества ресурсов
        if (previousStats.totalCount > 0) {
            const countGrowth = (currentStats.totalCount - previousStats.totalCount) / previousStats.totalCount;
            
            if (countGrowth > this.resourceGrowthThreshold) {
                auditResult.issues.push({
                    type: 'resource_growth',
                    severity: 'medium',
                    description: `Обнаружен аномальный рост количества ресурсов на ${(countGrowth * 100).toFixed(1)}%`,
                    details: {
                        previousCount: previousStats.totalCount,
                        currentCount: currentStats.totalCount,
                        growthRate: countGrowth
                    }
                });
                
                auditResult.recommendations.push({
                    type: 'optimize_resource_creation',
                    description: 'Оптимизировать создание ресурсов и увеличить агрессивность стратегий освобождения',
                    autoApplicable: false
                });
            }
        }
        
        // Проверяем рост размера ресурсов
        if (previousStats.totalSize > 0) {
            const sizeGrowth = (currentStats.totalSize - previousStats.totalSize) / previousStats.totalSize;
            
            if (sizeGrowth > this.resourceGrowthThreshold) {
                auditResult.issues.push({
                    type: 'memory_growth',
                    severity: 'high',
                    description: `Обнаружен аномальный рост размера ресурсов на ${(sizeGrowth * 100).toFixed(1)}%`,
                    details: {
                        previousSize: previousStats.totalSize,
                        currentSize: currentStats.totalSize,
                        growthRate: sizeGrowth
                    }
                });
                
                auditResult.recommendations.push({
                    type: 'release_large_resources',
                    description: 'Освободить крупные неиспользуемые ресурсы',
                    autoApplicable: true
                });
            }
        }
        
        // Проверяем рост по типам ресурсов
        for (const [type, typeStats] of currentStats.byType.entries()) {
            const previousTypeStats = previousStats.byType.get(type);
            
            if (previousTypeStats && previousTypeStats.count > 0) {
                const typeCountGrowth = (typeStats.count - previousTypeStats.count) / previousTypeStats.count;
                
                if (typeCountGrowth > this.resourceGrowthThreshold) {
                    auditResult.issues.push({
                        type: 'type_resource_growth',
                        severity: 'medium',
                        description: `Обнаружен аномальный рост количества ресурсов типа "${type}" на ${(typeCountGrowth * 100).toFixed(1)}%`,
                        details: {
                            resourceType: type,
                            previousCount: previousTypeStats.count,
                            currentCount: typeStats.count,
                            growthRate: typeCountGrowth
                        }
                    });
                    
                    auditResult.recommendations.push({
                        type: 'set_type_limit',
                        description: `Установить более строгие лимиты для ресурсов типа "${type}"`,
                        autoApplicable: true,
                        params: {
                            type,
                            recommendedLimit: {
                                count: Math.max(5, Math.floor(previousTypeStats.count * 1.2)),
                                size: Math.max(1024 * 1024, Math.floor(previousTypeStats.size * 1.2)),
                                strategy: 'composite'
                            }
                        }
                    });
                }
            }
        }
    }
    
    /**
     * Обнаруживает фрагментацию ресурсов
     * 
     * @param {Object} auditResult - Результат аудита
     */
    detectResourceFragmentation(auditResult) {
        const resources = this.resourceManager.getAllResources();
        const resourcesByType = new Map();
        
        // Группируем ресурсы по типу
        for (const resource of resources) {
            if (!resourcesByType.has(resource.type)) {
                resourcesByType.set(resource.type, []);
            }
            
            resourcesByType.get(resource.type).push(resource);
        }
        
        // Проверяем фрагментацию для каждого типа
        for (const [type, typeResources] of resourcesByType.entries()) {
            if (typeResources.length < 5) {
                continue; // Пропускаем типы с малым количеством ресурсов
            }
            
            // Сортируем ресурсы по размеру
            typeResources.sort((a, b) => a.size - b.size);
            
            // Вычисляем медианный размер
            const medianSize = typeResources[Math.floor(typeResources.length / 2)].size;
            
            // Считаем количество ресурсов, размер которых сильно отличается от медианы
            const outliers = typeResources.filter(r => 
                r.size < medianSize * 0.1 || r.size > medianSize * 10
            );
            
            if (outliers.length > typeResources.length * 0.2) {
                auditResult.issues.push({
                    type: 'resource_fragmentation',
                    severity: 'low',
                    description: `Обнаружена фрагментация ресурсов типа "${type}" (${outliers.length} ресурсов с аномальным размером)`,
                    details: {
                        resourceType: type,
                        totalResources: typeResources.length,
                        outlierResources: outliers.length,
                        medianSize
                    }
                });
                
                auditResult.recommendations.push({
                    type: 'consolidate_resources',
                    description: `Консолидировать фрагментированные ресурсы типа "${type}"`,
                    autoApplicable: false
                });
            }
        }
    }
    
    /**
     * Обнаруживает неиспользуемые ресурсы
     * 
     * @param {Object} auditResult - Результат аудита
     */
    detectUnusedResources(auditResult) {
        const resources = this.resourceManager.getAllResources();
        const now = Date.now();
        
        // Ищем ресурсы с низким счетчиком использования
        const unusedResources = resources.filter(resource => 
            resource.useCount < 3 && 
            (now - resource.registered > 3600000) && // Зарегистрирован более часа назад
            (resource.priority < 5) // Не высокоприоритетный
        );
        
        if (unusedResources.length > 0) {
            auditResult.issues.push({
                type: 'unused_resources',
                severity: 'medium',
                description: `Обнаружено ${unusedResources.length} редко используемых ресурсов`,
                affectedResources: unusedResources.map(r => r.id)
            });
            
            auditResult.recommendations.push({
                type: 'release_unused_resources',
                description: 'Освободить редко используемые ресурсы',
                autoApplicable: true
            });
        }
    }
    
    /**
     * Анализирует эффективность стратегий освобождения ресурсов
     * 
     * @param {Object} auditResult - Результат аудита
     */
    analyzeReleaseStrategies(auditResult) {
        // Получаем типы ресурсов с установленными лимитами
        const resourceLimits = this.resourceManager.getResourceLimits();
        
        for (const [type, limit] of resourceLimits) {
            const resources = this.resourceManager.getAllResources(type);
            
            if (resources.length === 0) {
                continue;
            }
            
            // Проверяем, подходит ли текущая стратегия для данного типа ресурсов
            let recommendedStrategy = limit.strategy;
            let strategyChanged = false;
            
            // Анализируем характеристики ресурсов
            const avgSize = resources.reduce((sum, r) => sum + r.size, 0) / resources.length;
            const avgUseCount = resources.reduce((sum, r) => sum + r.useCount, 0) / resources.length;
            const avgPriority = resources.reduce((sum, r) => sum + r.priority, 0) / resources.length;
            
            // Определяем рекомендуемую стратегию на основе характеристик
            if (avgSize > 1024 * 1024) { // Средний размер > 1MB
                if (recommendedStrategy !== 'size') {
                    recommendedStrategy = 'size';
                    strategyChanged = true;
                }
            } else if (avgUseCount > 100) { // Высокая частота использования
                if (recommendedStrategy !== 'lfu') {
                    recommendedStrategy = 'lfu';
                    strategyChanged = true;
                }
            } else if (avgPriority > 7) { // Высокий приоритет
                if (recommendedStrategy !== 'priority') {
                    recommendedStrategy = 'priority';
                    strategyChanged = true;
                }
            } else {
                if (recommendedStrategy !== 'composite') {
                    recommendedStrategy = 'composite';
                    strategyChanged = true;
                }
            }
            
            if (strategyChanged) {
                auditResult.recommendations.push({
                    type: 'optimize_release_strategy',
                    description: `Оптимизировать стратегию освобождения для ресурсов типа "${type}"`,
                    autoApplicable: true,
                    params: {
                        type,
                        currentStrategy: limit.strategy,
                        recommendedStrategy,
                        reason: `Средний размер: ${(avgSize / 1024).toFixed(1)} KB, Среднее использование: ${avgUseCount.toFixed(1)}, Средний приоритет: ${avgPriority.toFixed(1)}`
                    }
                });
            }
        }
    }
    
    /**
     * Применяет автоматические оптимизации
     * 
     * @param {Object} auditResult - Результат аудита
     */
    applyAutomaticOptimizations(auditResult) {
        for (const recommendation of auditResult.recommendations) {
            if (!recommendation.autoApplicable) {
                continue;
            }
            
            switch (recommendation.type) {
                case 'release_old_resources':
                    this.releaseOldResources();
                    break;
                    
                case 'release_large_resources':
                    this.releaseLargeResources();
                    break;
                    
                case 'release_unused_resources':
                    this.releaseUnusedResources();
                    break;
                    
                case 'set_type_limit':
                    if (recommendation.params) {
                        this.resourceManager.setResourceLimit(
                            recommendation.params.type,
                            recommendation.params.recommendedLimit
                        );
                    }
                    break;
                    
                case 'optimize_release_strategy':
                    if (recommendation.params) {
                        const limit = this.resourceManager.getResourceLimit(recommendation.params.type);
                        if (limit) {
                            limit.strategy = recommendation.params.recommendedStrategy;
                            this.resourceManager.setResourceLimit(recommendation.params.type, limit);
                        }
                    }
                    break;
            }
        }
    }
    
    /**
     * Освобождает старые ресурсы
     */
    releaseOldResources() {
        const resources = this.resourceManager.getAllResources();
        const now = Date.now();
        
        // Ищем ресурсы, которые не использовались длительное время
        const oldResources = resources.filter(resource => 
            (now - resource.lastUsed > this.resourceLeakThreshold) && 
            (resource.priority < 8) // Исключаем высокоприоритетные ресурсы
        );
        
        this.logger.info('ResourceAudit: Releasing old resources', {
            count: oldResources.length
        });
        
        // Освобождаем старые ресурсы
        for (const resource of oldResources) {
            this.resourceManager.releaseResource(resource.id);
        }
    }
    
    /**
     * Освобождает крупные ресурсы
     */
    releaseLargeResources() {
        const resources = this.resourceManager.getAllResources();
        
        // Сортируем ресурсы по размеру (от большего к меньшему)
        resources.sort((a, b) => b.size - a.size);
        
        // Берем 10% самых крупных ресурсов
        const largeResources = resources.slice(0, Math.max(1, Math.ceil(resources.length * 0.1)));
        
        // Фильтруем только те, которые не использовались недавно и не имеют высокого приоритета
        const now = Date.now();
        const unusedLargeResources = largeResources.filter(resource => 
            (now - resource.lastUsed > 3600000) && // Не использовался более часа
            (resource.priority < 7) // Не высокоприоритетный
        );
        
        this.logger.info('ResourceAudit: Releasing large unused resources', {
            count: unusedLargeResources.length
        });
        
        // Освобождаем крупные неиспользуемые ресурсы
        for (const resource of unusedLargeResources) {
            this.resourceManager.releaseResource(resource.id);
        }
    }
    
    /**
     * Освобождает неиспользуемые ресурсы
     */
    releaseUnusedResources() {
        const resources = this.resourceManager.getAllResources();
        const now = Date.now();
        
        // Ищем ресурсы с низким счетчиком использования
        const unusedResources = resources.filter(resource => 
            resource.useCount < 3 && 
            (now - resource.registered > 3600000) && // Зарегистрирован более часа назад
            (resource.priority < 5) // Не высокоприоритетный
        );
        
        this.logger.info('ResourceAudit: Releasing unused resources', {
            count: unusedResources.length
        });
        
        // Освобождаем неиспользуемые ресурсы
        for (const resource of unusedResources) {
            this.resourceManager.releaseResource(resource.id);
        }
    }
    
    /**
     * Получает результаты последнего аудита
     * 
     * @returns {Object|null} - Результаты последнего аудита или null, если аудит не проводился
     */
    getLastAuditResults() {
        if (this.auditResults.length === 0) {
            return null;
        }
        
        return this.auditResults[this.auditResults.length - 1];
    }
    
    /**
     * Получает историю результатов аудита
     * 
     * @returns {Array} - История результатов аудита
     */
    getAuditHistory() {
        return [...this.auditResults];
    }
    
    /**
     * Устанавливает интервал аудита
     * 
     * @param {Number} interval - Интервал аудита в миллисекундах
     */
    setAuditInterval(interval) {
        if (typeof interval !== 'number' || interval <= 0) {
            throw new TypeError('Audit interval must be a positive number');
        }
        
        this.auditInterval = interval;
        
        // Перезапускаем интервал аудита
        if (this.auditIntervalId) {
            clearInterval(this.auditIntervalId);
            
            this.auditIntervalId = setInterval(() => {
                this.performAudit();
            }, this.auditInterval);
        }
        
        this.logger.debug('ResourceAudit: Audit interval updated', { interval });
    }
    
    /**
     * Включает или отключает обнаружение утечек ресурсов
     * 
     * @param {Boolean} enabled - Флаг включения/отключения
     */
    setResourceLeakDetectionEnabled(enabled) {
        this.resourceLeakDetectionEnabled = Boolean(enabled);
        
        this.logger.debug('ResourceAudit: Resource leak detection', { 
            enabled: this.resourceLeakDetectionEnabled 
        });
    }
    
    /**
     * Устанавливает порог для обнаружения утечек ресурсов
     * 
     * @param {Number} threshold - Порог в миллисекундах
     */
    setResourceLeakThreshold(threshold) {
        if (typeof threshold !== 'number' || threshold <= 0) {
            throw new TypeError('Resource leak threshold must be a positive number');
        }
        
        this.resourceLeakThreshold = threshold;
        
        this.logger.debug('ResourceAudit: Resource leak threshold updated', { threshold });
    }
    
    /**
     * Устанавливает порог для обнаружения аномального роста ресурсов
     * 
     * @param {Number} threshold - Порог (доля от 0 до 1)
     */
    setResourceGrowthThreshold(threshold) {
        if (typeof threshold !== 'number' || threshold <= 0 || threshold > 1) {
            throw new TypeError('Resource growth threshold must be a number between 0 and 1');
        }
        
        this.resourceGrowthThreshold = threshold;
        
        this.logger.debug('ResourceAudit: Resource growth threshold updated', { threshold });
    }
    
    /**
     * Останавливает аудитор ресурсов
     */
    stop() {
        if (this.auditIntervalId) {
            clearInterval(this.auditIntervalId);
            this.auditIntervalId = null;
        }
        
        this.isInitialized = false;
        this.logger.info('ResourceAudit: Stopped');
    }
}

module.exports = ResourceAudit;
