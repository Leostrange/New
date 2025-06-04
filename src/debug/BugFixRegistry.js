/**
 * BugFixRegistry.js
 * 
 * Реестр исправлений ошибок для отслеживания и управления исправлениями
 */

class BugFixRegistry {
    /**
     * Создает экземпляр реестра исправлений ошибок
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.logger - Логгер для вывода информации
     */
    constructor(options) {
        this.logger = options.logger;
        
        // Реестр исправлений
        this.fixes = new Map();
        
        // Статистика исправлений
        this.stats = {
            total: 0,
            applied: 0,
            failed: 0,
            pending: 0
        };
    }
    
    /**
     * Регистрирует исправление ошибки
     * 
     * @param {String} id - Идентификатор исправления
     * @param {Object} fix - Информация об исправлении
     * @param {String} fix.description - Описание исправления
     * @param {String} fix.component - Компонент, к которому относится исправление
     * @param {String} fix.severity - Серьезность ошибки (critical, major, minor, cosmetic)
     * @param {Function} fix.check - Функция проверки необходимости исправления
     * @param {Function} fix.apply - Функция применения исправления
     * @param {Function} fix.rollback - Функция отката исправления
     * @returns {Boolean} - Результат регистрации
     */
    registerFix(id, fix) {
        if (this.fixes.has(id)) {
            this.logger.warn('BugFixRegistry: Fix already registered', { id });
            return false;
        }
        
        this.fixes.set(id, {
            ...fix,
            status: 'pending',
            appliedAt: null,
            error: null
        });
        
        this.stats.total++;
        this.stats.pending++;
        
        this.logger.debug('BugFixRegistry: Fix registered', { 
            id, 
            description: fix.description,
            component: fix.component,
            severity: fix.severity
        });
        
        return true;
    }
    
    /**
     * Применяет исправление ошибки
     * 
     * @param {String} id - Идентификатор исправления
     * @returns {Promise<Boolean>} - Результат применения
     */
    async applyFix(id) {
        if (!this.fixes.has(id)) {
            this.logger.warn('BugFixRegistry: Fix not found', { id });
            return false;
        }
        
        const fix = this.fixes.get(id);
        
        if (fix.status === 'applied') {
            this.logger.info('BugFixRegistry: Fix already applied', { id });
            return true;
        }
        
        try {
            // Проверяем необходимость исправления
            const needsFix = await fix.check();
            
            if (!needsFix) {
                this.logger.info('BugFixRegistry: Fix not needed', { id });
                
                // Обновляем статус
                fix.status = 'skipped';
                this.stats.pending--;
                
                return true;
            }
            
            // Применяем исправление
            await fix.apply();
            
            // Обновляем статус
            fix.status = 'applied';
            fix.appliedAt = new Date();
            this.stats.applied++;
            this.stats.pending--;
            
            this.logger.info('BugFixRegistry: Fix applied', { 
                id, 
                description: fix.description,
                component: fix.component
            });
            
            return true;
        } catch (error) {
            // Обновляем статус
            fix.status = 'failed';
            fix.error = error.message;
            this.stats.failed++;
            this.stats.pending--;
            
            this.logger.error('BugFixRegistry: Fix failed', { 
                id, 
                error: error.message,
                stack: error.stack
            });
            
            return false;
        }
    }
    
    /**
     * Откатывает исправление ошибки
     * 
     * @param {String} id - Идентификатор исправления
     * @returns {Promise<Boolean>} - Результат отката
     */
    async rollbackFix(id) {
        if (!this.fixes.has(id)) {
            this.logger.warn('BugFixRegistry: Fix not found', { id });
            return false;
        }
        
        const fix = this.fixes.get(id);
        
        if (fix.status !== 'applied') {
            this.logger.info('BugFixRegistry: Fix not applied, cannot rollback', { id });
            return false;
        }
        
        try {
            // Откатываем исправление
            await fix.rollback();
            
            // Обновляем статус
            fix.status = 'pending';
            fix.appliedAt = null;
            this.stats.applied--;
            this.stats.pending++;
            
            this.logger.info('BugFixRegistry: Fix rolled back', { id });
            
            return true;
        } catch (error) {
            this.logger.error('BugFixRegistry: Rollback failed', { 
                id, 
                error: error.message,
                stack: error.stack
            });
            
            return false;
        }
    }
    
    /**
     * Применяет все исправления ошибок
     * 
     * @param {String} component - Опциональный фильтр по компоненту
     * @param {String} severity - Опциональный фильтр по серьезности
     * @returns {Promise<Object>} - Результаты применения
     */
    async applyAllFixes(component = null, severity = null) {
        const results = {
            total: 0,
            applied: 0,
            skipped: 0,
            failed: 0
        };
        
        for (const [id, fix] of this.fixes.entries()) {
            // Пропускаем уже примененные исправления
            if (fix.status === 'applied') {
                results.skipped++;
                continue;
            }
            
            // Применяем фильтры
            if (component && fix.component !== component) {
                continue;
            }
            
            if (severity && fix.severity !== severity) {
                continue;
            }
            
            results.total++;
            
            // Применяем исправление
            const success = await this.applyFix(id);
            
            if (success) {
                if (this.fixes.get(id).status === 'applied') {
                    results.applied++;
                } else {
                    results.skipped++;
                }
            } else {
                results.failed++;
            }
        }
        
        this.logger.info('BugFixRegistry: Applied all fixes', { results });
        
        return results;
    }
    
    /**
     * Получает информацию об исправлении
     * 
     * @param {String} id - Идентификатор исправления
     * @returns {Object|null} - Информация об исправлении
     */
    getFix(id) {
        if (!this.fixes.has(id)) {
            return null;
        }
        
        const fix = this.fixes.get(id);
        
        return {
            id,
            description: fix.description,
            component: fix.component,
            severity: fix.severity,
            status: fix.status,
            appliedAt: fix.appliedAt,
            error: fix.error
        };
    }
    
    /**
     * Получает список всех исправлений
     * 
     * @param {String} component - Опциональный фильтр по компоненту
     * @param {String} severity - Опциональный фильтр по серьезности
     * @param {String} status - Опциональный фильтр по статусу
     * @returns {Array} - Список исправлений
     */
    getAllFixes(component = null, severity = null, status = null) {
        const result = [];
        
        for (const [id, fix] of this.fixes.entries()) {
            // Применяем фильтры
            if (component && fix.component !== component) {
                continue;
            }
            
            if (severity && fix.severity !== severity) {
                continue;
            }
            
            if (status && fix.status !== status) {
                continue;
            }
            
            result.push({
                id,
                description: fix.description,
                component: fix.component,
                severity: fix.severity,
                status: fix.status,
                appliedAt: fix.appliedAt,
                error: fix.error
            });
        }
        
        return result;
    }
    
    /**
     * Получает статистику исправлений
     * 
     * @returns {Object} - Статистика исправлений
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Генерирует отчет об исправлениях
     * 
     * @returns {String} - Отчет в формате Markdown
     */
    generateReport() {
        let report = '# Bug Fix Report\n\n';
        
        // Добавляем статистику
        report += '## Statistics\n\n';
        report += `- Total fixes: ${this.stats.total}\n`;
        report += `- Applied: ${this.stats.applied}\n`;
        report += `- Failed: ${this.stats.failed}\n`;
        report += `- Pending: ${this.stats.pending}\n\n`;
        
        // Добавляем список исправлений по компонентам
        report += '## Fixes by Component\n\n';
        
        const componentMap = new Map();
        
        for (const [id, fix] of this.fixes.entries()) {
            if (!componentMap.has(fix.component)) {
                componentMap.set(fix.component, []);
            }
            
            componentMap.get(fix.component).push({
                id,
                description: fix.description,
                severity: fix.severity,
                status: fix.status,
                appliedAt: fix.appliedAt,
                error: fix.error
            });
        }
        
        for (const [component, fixes] of componentMap.entries()) {
            report += `### ${component}\n\n`;
            
            for (const fix of fixes) {
                const statusEmoji = fix.status === 'applied' ? '✅' : 
                                   fix.status === 'failed' ? '❌' : 
                                   fix.status === 'skipped' ? '⏭️' : '⏳';
                
                const severityLabel = fix.severity === 'critical' ? '🔴 Critical' : 
                                     fix.severity === 'major' ? '🟠 Major' : 
                                     fix.severity === 'minor' ? '🟡 Minor' : '🔵 Cosmetic';
                
                report += `${statusEmoji} **${fix.id}** (${severityLabel}): ${fix.description}\n`;
                
                if (fix.status === 'applied' && fix.appliedAt) {
                    report += `   - Applied at: ${fix.appliedAt.toISOString()}\n`;
                }
                
                if (fix.status === 'failed' && fix.error) {
                    report += `   - Error: ${fix.error}\n`;
                }
                
                report += '\n';
            }
        }
        
        return report;
    }
}

module.exports = BugFixRegistry;
