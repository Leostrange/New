/**
 * EPUBParserWithFallback.js
 * 
 * Расширенная версия парсера EPUB с поддержкой fallback-обработчиков.
 * Обеспечивает надежность работы при обработке поврежденных или нестандартных EPUB файлов.
 */

const EPUBParser = require('./EPUBParser');
const FormatParserFallbackManager = require('./FormatParserFallbackManager');
const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class EPUBParserWithFallback extends EPUBParser {
    /**
     * Создает экземпляр парсера EPUB с поддержкой fallback-обработчиков.
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
        this.logger = new Logger('EPUBParserWithFallback');
        this.usingFallback = false;
        this.filePath = null;
    }

    /**
     * Инициализирует парсер с указанным файлом EPUB.
     * @param {string|Buffer} file - Путь к файлу или буфер с содержимым EPUB.
     * @returns {Promise<boolean>} - Результат инициализации.
     */
    async initialize(file) {
        try {
            // Сохраняем путь к файлу для использования в fallback-стратегиях
            if (typeof file === 'string') {
                this.filePath = file;
            }
            
            // Пытаемся выполнить стандартную инициализацию
            return await super.initialize(file);
        } catch (error) {
            this.logger.warn(`Ошибка при инициализации EPUB парсера: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для определения формата
                const formatResult = await this.fallbackManager.applyFallbackStrategy('format_detection', {
                    filePath: typeof file === 'string' ? file : null,
                    fileBuffer: typeof file !== 'string' ? file : null,
                    error: error
                });
                
                if (formatResult.detectedFormat !== 'epub' && formatResult.confidence > 0.7) {
                    // Если с высокой уверенностью определен другой формат, выбрасываем исключение
                    throw new ExceptionHierarchy.FormatException(
                        `Файл определен как ${formatResult.detectedFormat}, а не EPUB (уверенность: ${formatResult.confidence})`
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
     * Парсит метаданные из файла EPUB.
     * @returns {Promise<Object>} - Объект с метаданными.
     */
    async parseMetadata() {
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован. Вызовите initialize() перед использованием.');
        }

        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.parseMetadata();
            }
            
            // Применяем fallback-стратегию для извлечения метаданных
            this.metadata = await this.fallbackManager.applyFallbackStrategy('metadata_extraction', {
                filePath: this.filePath,
                format: 'epub'
            });
            
            return this.metadata;
        } catch (error) {
            this.logger.warn(`Ошибка при парсинге метаданных EPUB: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения метаданных
                this.metadata = await this.fallbackManager.applyFallbackStrategy('metadata_extraction', {
                    filePath: this.filePath,
                    format: 'epub',
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
     * Извлекает оглавление из файла EPUB.
     * @returns {Promise<Array>} - Массив с элементами оглавления.
     */
    async extractTOC() {
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован. Вызовите initialize() перед использованием.');
        }

        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractTOC();
            }
            
            // Применяем fallback-стратегию для извлечения оглавления
            this.toc = await this.fallbackManager.applyFallbackStrategy('toc_extraction', {
                filePath: this.filePath,
                format: 'epub'
            });
            
            return this.toc;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении оглавления EPUB: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения оглавления
                this.toc = await this.fallbackManager.applyFallbackStrategy('toc_extraction', {
                    filePath: this.filePath,
                    format: 'epub',
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
     * Извлекает список глав из файла EPUB.
     * @returns {Promise<Array>} - Массив с информацией о главах.
     */
    async extractChapters() {
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован. Вызовите initialize() перед использованием.');
        }

        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractChapters();
            }
            
            // Для fallback создаем базовую структуру глав на основе оглавления
            const toc = await this.extractTOC();
            this.chapters = toc.map((item, index) => ({
                id: `chapter${index + 1}`,
                href: item.href || `#chapter${index + 1}`,
                title: item.title || `Глава ${index + 1}`
            }));
            
            return this.chapters;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении глав EPUB: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Создаем базовую структуру глав
                this.chapters = [
                    { id: 'chapter1', href: '#chapter1', title: 'Содержимое' }
                ];
                
                return this.chapters;
            } catch (fallbackError) {
                this.logger.error(`Не удалось создать структуру глав: ${fallbackError.message}`);
                throw fallbackError;
            }
        }
    }

    /**
     * Извлекает содержимое указанной главы.
     * @param {string|number} chapterIdOrIndex - ID главы или её индекс.
     * @returns {Promise<string>} - HTML-содержимое главы.
     */
    async extractChapterContent(chapterIdOrIndex) {
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован. Вызовите initialize() перед использованием.');
        }

        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractChapterContent(chapterIdOrIndex);
            }
            
            // Получаем информацию о главе
            let chapter;
            
            if (typeof chapterIdOrIndex === 'number') {
                // Если передан индекс
                if (chapterIdOrIndex < 0 || chapterIdOrIndex >= this.chapters.length) {
                    throw new Error(`Индекс главы вне диапазона: ${chapterIdOrIndex}`);
                }
                chapter = this.chapters[chapterIdOrIndex];
            } else {
                // Если передан ID
                chapter = this.chapters.find(ch => ch.id === chapterIdOrIndex);
                if (!chapter) {
                    throw new Error(`Глава с ID "${chapterIdOrIndex}" не найдена`);
                }
            }
            
            // Применяем fallback-стратегию для извлечения содержимого
            const content = await this.fallbackManager.applyFallbackStrategy('content_extraction', {
                filePath: this.filePath,
                format: 'epub',
                chapter: chapter
            });
            
            return content;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении содержимого главы EPUB: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения содержимого
                const content = await this.fallbackManager.applyFallbackStrategy('content_extraction', {
                    filePath: this.filePath,
                    format: 'epub',
                    error: error
                });
                
                return content;
            } catch (fallbackError) {
                this.logger.error(`Не удалось применить fallback-стратегию для содержимого главы: ${fallbackError.message}`);
                throw fallbackError;
            }
        }
    }

    /**
     * Извлекает все CSS файлы из EPUB.
     * @returns {Promise<Array>} - Массив с объектами CSS файлов.
     */
    async extractCSSFiles() {
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован. Вызовите initialize() перед использованием.');
        }

        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractCSSFiles();
            }
            
            // Для fallback создаем базовый CSS
            this.cssFiles = [
                { 
                    id: 'default-style', 
                    href: 'default-style.css', 
                    content: `
                        body { 
                            font-family: Arial, sans-serif; 
                            line-height: 1.6;
                            margin: 1em;
                        }
                        h1, h2, h3 { 
                            color: #333;
                            margin-top: 1em;
                        }
                        p { 
                            margin-bottom: 0.8em; 
                        }
                        .error-message {
                            color: #d32f2f;
                            padding: 1em;
                            border: 1px solid #ffcdd2;
                            background-color: #ffebee;
                            border-radius: 4px;
                            margin: 1em 0;
                        }
                    `
                }
            ];
            
            return this.cssFiles;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении CSS файлов EPUB: ${error.message}. Применение fallback-стратегии.`);
            
            // Для CSS создаем базовый стиль даже при ошибке
            this.cssFiles = [
                { 
                    id: 'default-style', 
                    href: 'default-style.css', 
                    content: 'body { font-family: Arial, sans-serif; line-height: 1.5; margin: 1em; }'
                }
            ];
            
            return this.cssFiles;
        }
    }

    /**
     * Извлекает изображения из файла EPUB.
     * @returns {Promise<Array>} - Массив с объектами изображений.
     */
    async extractImages() {
        if (!this.isInitialized || !this.options.extractImages) {
            return [];
        }

        try {
            // Если не используется fallback, вызываем оригинальный метод
            if (!this.usingFallback) {
                return await super.extractImages();
            }
            
            // Применяем fallback-стратегию для извлечения изображений
            this.images = await this.fallbackManager.applyFallbackStrategy('image_extraction', {
                filePath: this.filePath,
                format: 'epub'
            });
            
            return this.images;
        } catch (error) {
            this.logger.warn(`Ошибка при извлечении изображений EPUB: ${error.message}. Применение fallback-стратегии.`);
            
            try {
                // Применяем fallback-стратегию для извлечения изображений
                this.images = await this.fallbackManager.applyFallbackStrategy('image_extraction', {
                    filePath: this.filePath,
                    format: 'epub',
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
     * Проверяет, является ли файл валидным EPUB.
     * @param {string|Buffer} file - Путь к файлу или буфер с содержимым.
     * @returns {Promise<boolean>} - Результат проверки.
     */
    static async isValidEPUB(file) {
        try {
            // Пытаемся выполнить стандартную проверку
            return await EPUBParser.isValidEPUB(file);
        } catch (error) {
            // В случае ошибки при проверке, пытаемся применить fallback
            const fallbackManager = new FormatParserFallbackManager();
            
            try {
                const formatResult = await fallbackManager.applyFallbackStrategy('format_detection', {
                    filePath: typeof file === 'string' ? file : null,
                    fileBuffer: typeof file !== 'string' ? file : null,
                    error: error
                });
                
                // Возвращаем true только если формат определен как EPUB с достаточной уверенностью
                return formatResult.detectedFormat === 'epub' && formatResult.confidence > 0.7;
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
        
        this.filePath = null;
    }
}

module.exports = EPUBParserWithFallback;
