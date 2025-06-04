/**
 * MOBIParserWithFallback.js
 * 
 * Расширенная версия парсера MOBI с поддержкой fallback-обработчиков.
 * Обеспечивает надежность работы при обработке поврежденных или нестандартных MOBI файлов.
 */

const MOBIParser = require('./MOBIParser');
const FormatParserFallbackManager = require('./FormatParserFallbackManager');
const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class MOBIParserWithFallback extends MOBIParser {
    /**
     * Создает экземпляр парсера MOBI с поддержкой fallback-обработчиков.
     * @param {Object} options - Опции конфигурации парсера.
     */
    constructor(options = {}) {
        super(options);
        
        this.fallbackOptions = {
            enableFallbacks: true,
            maxRecoveryAttempts: 3,
            logFailedAttempts: true,
            ...options.fallbackOptions
        };
        
        this.fallbackManager = options.fallbackManager || new FormatParserFallbackManager(this.fallbackOptions);
        this.logger = new Logger('MOBIParserWithFallback');
    }

    /**
     * Инициализирует парсер с указанным файлом MOBI.
     * @param {string|Buffer} file - Путь к файлу или буфер с содержимым MOBI.
     * @returns {Promise<boolean>} - Результат инициализации.
     */
    async initialize(file) {
        try {
            // Пытаемся выполнить стандартную инициализацию
            return await super.initialize(file);
        } catch (error) {
            this.logger.warn(`Ошибка при инициализации MOBI парсера: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для определения формата
                const formatResult = await this.fallbackManager.applyFallbackStrategy('format_detection', {
                    filePath: typeof file === 'string' ? file : null,
                    fileBuffer: typeof file !== 'string' ? file : null,
                    error: error
                });
                
                if (formatResult.detectedFormat !== 'mobi' && formatResult.confidence > 0.7) {
                    // Если с высокой уверенностью определен другой формат, выбрасываем исключение
                    throw new ExceptionHierarchy.FormatException(
                        `Файл определен как ${formatResult.detectedFormat}, а не MOBI (уверенность: ${formatResult.confidence})`
                    );
                }
                
                // Устанавливаем флаг инициализации и отмечаем, что используется fallback
                this.isInitialized = true;
                this.usingFallback = true;
                
                return true;
            } catch (fallbackError) {
                this.logger.error(`Не удалось применить fallback-стратегию для инициализации: ${fallbackError.message}`);
                this.isInitialized = false;
                throw fallbackError;
            }
        }
    }

    /**
     * Парсит метаданные из файла MOBI.
     * @returns {Promise<Object>} - Объект с метаданными.
     */
    async parseMetadata() {
        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.parseMetadata();
            }
            
            // Применяем fallback-стратегию для извлечения метаданных
            this.metadata = await this.fallbackManager.applyFallbackStrategy('metadata_extraction', {
                filePath: this.filePath,
                format: 'mobi'
            });
            
            return this.metadata;
        } catch (error) {
            this.logger.warn(`Ошибка при парсинге метаданных MOBI: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения метаданных
                this.metadata = await this.fallbackManager.applyFallbackStrategy('metadata_extraction', {
                    filePath: this.filePath,
                    format: 'mobi',
                    error: error
                });
                
                return this.metadata;
            } catch (fallbackError) {
                this.logger.error(`Не удалось применить fallback-стратегию для метаданных: ${fallbackError.message}`);
                throw fallbackError;
            }
        }
    }

    /**
     * Извлекает оглавление из файла MOBI.
     * @returns {Promise<Array>} - Массив с элементами оглавления.
     */
    async extractTOC() {
        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractTOC();
            }
            
            // Применяем fallback-стратегию для извлечения оглавления
            this.toc = await this.fallbackManager.applyFallbackStrategy('toc_extraction', {
                filePath: this.filePath,
                format: 'mobi'
            });
            
            return this.toc;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении оглавления MOBI: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения оглавления
                this.toc = await this.fallbackManager.applyFallbackStrategy('toc_extraction', {
                    filePath: this.filePath,
                    format: 'mobi',
                    error: error
                });
                
                return this.toc;
            } catch (fallbackError) {
                this.logger.error(`Не удалось применить fallback-стратегию для оглавления: ${fallbackError.message}`);
                throw fallbackError;
            }
        }
    }

    /**
     * Извлекает содержимое из файла MOBI.
     * @returns {Promise<string>} - HTML-содержимое.
     */
    async extractContent() {
        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractContent();
            }
            
            // Применяем fallback-стратегию для извлечения содержимого
            this.content = await this.fallbackManager.applyFallbackStrategy('content_extraction', {
                filePath: this.filePath,
                format: 'mobi'
            });
            
            return this.content;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении содержимого MOBI: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения содержимого
                this.content = await this.fallbackManager.applyFallbackStrategy('content_extraction', {
                    filePath: this.filePath,
                    format: 'mobi',
                    error: error
                });
                
                return this.content;
            } catch (fallbackError) {
                this.logger.error(`Не удалось применить fallback-стратегию для содержимого: ${fallbackError.message}`);
                throw fallbackError;
            }
        }
    }

    /**
     * Извлекает изображения из файла MOBI.
     * @returns {Promise<Array>} - Массив с объектами изображений.
     */
    async extractImages() {
        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractImages();
            }
            
            // Применяем fallback-стратегию для извлечения изображений
            this.images = await this.fallbackManager.applyFallbackStrategy('image_extraction', {
                filePath: this.filePath,
                format: 'mobi'
            });
            
            return this.images;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении изображений MOBI: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения изображений
                this.images = await this.fallbackManager.applyFallbackStrategy('image_extraction', {
                    filePath: this.filePath,
                    format: 'mobi',
                    error: error
                });
                
                return this.images;
            } catch (fallbackError) {
                this.logger.error(`Не удалось применить fallback-стратегию для изображений: ${fallbackError.message}`);
                // Возвращаем пустой массив вместо выбрасывания исключения
                return [];
            }
        }
    }

    /**
     * Проверяет, является ли файл валидным MOBI.
     * @param {string|Buffer} file - Путь к файлу или буфер с содержимым.
     * @returns {Promise<boolean>} - Результат проверки.
     */
    static async isValidMOBI(file) {
        try {
            // Пытаемся выполнить стандартную проверку
            return await MOBIParser.isValidMOBI(file);
        } catch (error) {
            // В случае ошибки при проверке, пытаемся применить fallback
            const fallbackManager = new FormatParserFallbackManager();
            
            try {
                const formatResult = await fallbackManager.applyFallbackStrategy('format_detection', {
                    filePath: typeof file === 'string' ? file : null,
                    fileBuffer: typeof file !== 'string' ? file : null,
                    error: error
                });
                
                // Возвращаем true только если формат опред��лен как MOBI с достаточной уверенностью
                return formatResult.detectedFormat === 'mobi' && formatResult.confidence > 0.7;
            } catch (fallbackError) {
                // В случае ошибки при применении fallback, возвращаем false
                return false;
            }
        }
    }

    /**
     * Освобождает ресурсы, занятые парсером.
     */
    dispose() {
        super.dispose();
        this.usingFallback = false;
        
        // Сбрасываем счетчики попыток восстановления
        if (this.fallbackManager && this.filePath) {
            this.fallbackManager.resetRecoveryAttempts('format_detection', this.filePath);
            this.fallbackManager.resetRecoveryAttempts('metadata_extraction', this.filePath);
            this.fallbackManager.resetRecoveryAttempts('toc_extraction', this.filePath);
            this.fallbackManager.resetRecoveryAttempts('content_extraction', this.filePath);
            this.fallbackManager.resetRecoveryAttempts('image_extraction', this.filePath);
        }
    }
}

module.exports = MOBIParserWithFallback;
