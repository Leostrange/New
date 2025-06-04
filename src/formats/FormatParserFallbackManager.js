/**
 * FormatParserFallbackManager.js
 * 
 * Менеджер для обработки ошибок парсинга форматов и предоставления fallback-механизмов.
 * Обеспечивает надежность работы приложения при обработке поврежденных или нестандартных файлов.
 */

const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class FormatParserFallbackManager {
    /**
     * Создает экземпляр менеджера fallback-обработчиков.
     * @param {Object} options - Опции конфигурации.
     */
    constructor(options = {}) {
        this.options = {
            enableFallbacks: true,
            maxRecoveryAttempts: 3,
            logFailedAttempts: true,
            ...options
        };
        
        this.logger = new Logger('FormatParserFallbackManager');
        this.fallbackStrategies = new Map();
        this.recoveryAttempts = new Map();
        
        // Регистрация стандартных fallback-стратегий
        this._registerDefaultFallbacks();
    }

    /**
     * Регистрирует стандартные fallback-стратегии для различных типов ошибок.
     * @private
     */
    _registerDefaultFallbacks() {
        // Общие стратегии для всех форматов
        this.registerFallbackStrategy('format_detection', async (context) => {
            this.logger.info('Применение fallback-стратегии для определения формата');
            
            // Пытаемся определить формат по содержимому файла, а не только по расширению
            const buffer = context.fileBuffer || await this._readFileBuffer(context.filePath);
            
            if (!buffer || buffer.length === 0) {
                throw new ExceptionHierarchy.FormatException('Невозможно прочитать содержимое файла');
            }
            
            // Проверка сигнатур различных форматов
            if (this._hasMOBISignature(buffer)) {
                return { detectedFormat: 'mobi', confidence: 0.9 };
            } else if (this._hasEPUBSignature(buffer)) {
                return { detectedFormat: 'epub', confidence: 0.9 };
            } else if (this._hasPDFSignature(buffer)) {
                return { detectedFormat: 'pdf', confidence: 0.95 };
            }
            
            // Если не удалось определить формат, возвращаем наиболее вероятный на основе эвристики
            return { detectedFormat: this._guessFormatByContent(buffer), confidence: 0.5 };
        });
        
        // Стратегии для обработки метаданных
        this.registerFallbackStrategy('metadata_extraction', async (context) => {
            this.logger.info('Применение fallback-стратегии для извлечения метаданных');
            
            // Создаем базовые метаданные на основе имени файла
            const fileName = context.filePath ? context.filePath.split('/').pop() : 'Unknown';
            const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
            
            return {
                title: fileNameWithoutExt,
                author: 'Unknown Author',
                publisher: 'Unknown Publisher',
                publicationDate: new Date(),
                language: 'unknown',
                generatedByFallback: true
            };
        });
        
        // Стратегии для обработки содержимого
        this.registerFallbackStrategy('content_extraction', async (context) => {
            this.logger.info('Применение fallback-стратегии для извлечения содержимого');
            
            // Возвращаем простую HTML-страницу с сообщением об ошибке
            return `<html>
                <head>
                    <title>Ошибка извлечения содержимого</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                        .error-container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
                        .error-title { color: #d32f2f; }
                        .file-info { margin-top: 20px; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <h1 class="error-title">Не удалось извлечь содержимое файла</h1>
                        <p>Произошла ошибка при попытке извлечь содержимое из файла. Возможно, файл поврежден или имеет нестандартный формат.</p>
                        <p>Вы можете попробовать открыть файл в другом приложении или проверить его целостность.</p>
                        
                        <div class="file-info">
                            <h2>Информация о файле:</h2>
                            <p><strong>Имя файла:</strong> ${context.filePath ? context.filePath.split('/').pop() : 'Unknown'}</p>
                            <p><strong>Формат:</strong> ${context.format || 'Неизвестен'}</p>
                            <p><strong>Ошибка:</strong> ${context.error ? context.error.message : 'Неизвестная ошибка'}</p>
                        </div>
                    </div>
                </body>
            </html>`;
        });
        
        // Стратегии для обработки оглавления
        this.registerFallbackStrategy('toc_extraction', async (context) => {
            this.logger.info('Применение fallback-стратегии для извлечения оглавления');
            
            // Возвращаем пустое оглавление
            return [
                { title: 'Содержимое недоступно', href: '#', level: 1 }
            ];
        });
        
        // Стратегии для обработки изображений
        this.registerFallbackStrategy('image_extraction', async (context) => {
            this.logger.info('Применение fallback-стратегии для извлечения изображений');
            
            // Возвращаем пустой массив изображений
            return [];
        });
    }

    /**
     * Проверяет наличие сигнатуры MOBI в буфере.
     * @param {Buffer} buffer - Буфер с содержимым файла.
     * @returns {boolean} - Результат проверки.
     * @private
     */
    _hasMOBISignature(buffer) {
        // MOBI файлы начинаются с сигнатуры "BOOKMOBI" на определенном смещении
        if (buffer.length < 60) return false;
        
        // Проверяем наличие сигнатуры "BOOKMOBI" на смещении 0x3C (60)
        const signature = buffer.slice(0x3C, 0x3C + 8).toString('ascii');
        return signature === 'BOOKMOBI';
    }

    /**
     * Проверяет наличие сигнатуры EPUB в буфере.
     * @param {Buffer} buffer - Буфер с содержимым файла.
     * @returns {boolean} - Результат проверки.
     * @private
     */
    _hasEPUBSignature(buffer) {
        // EPUB файлы - это ZIP-архивы, которые начинаются с сигнатуры PK\x03\x04
        if (buffer.length < 4) return false;
        
        // Проверяем наличие сигнатуры ZIP
        return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
    }

    /**
     * Проверяет наличие сигнатуры PDF в буфере.
     * @param {Buffer} buffer - Буфер с содержимым файла.
     * @returns {boolean} - Результат проверки.
     * @private
     */
    _hasPDFSignature(buffer) {
        // PDF файлы начинаются с сигнатуры "%PDF-"
        if (buffer.length < 5) return false;
        
        // Проверяем наличие сигнатуры PDF
        const signature = buffer.slice(0, 5).toString('ascii');
        return signature === '%PDF-';
    }

    /**
     * Пытается угадать формат файла по его содержимому с помощью эвристики.
     * @param {Buffer} buffer - Буфер с содержимым файла.
     * @returns {string} - Предполагаемый формат файла.
     * @private
     */
    _guessFormatByContent(buffer) {
        // Простая эвристика для определения формата
        // В реальном приложении здесь может быть более сложная логика
        
        // Проверяем наличие HTML-тегов
        const sample = buffer.slice(0, Math.min(buffer.length, 1000)).toString('utf8', 0, Math.min(buffer.length, 1000));
        
        if (sample.includes('<html') || sample.includes('<!DOCTYPE html')) {
            return 'html';
        }
        
        // Проверяем наличие XML-заголовка
        if (sample.includes('<?xml')) {
            return 'xml';
        }
        
        // По умолчанию считаем, что это текстовый файл
        return 'txt';
    }

    /**
     * Читает содержимое файла в буфер.
     * @param {string} filePath - Путь к файлу.
     * @returns {Promise<Buffer>} - Буфер с содержимым файла.
     * @private
     */
    async _readFileBuffer(filePath) {
        try {
            const fs = require('fs').promises;
            return await fs.readFile(filePath);
        } catch (error) {
            this.logger.error(`Ошибка при чтении файла ${filePath}: ${error.message}`, error);
            return Buffer.alloc(0);
        }
    }

    /**
     * Регистрирует новую fallback-стратегию.
     * @param {string} errorType - Тип ошибки, для которой применяется стратегия.
     * @param {Function} strategy - Функция-стратегия для обработки ошибки.
     */
    registerFallbackStrategy(errorType, strategy) {
        if (typeof strategy !== 'function') {
            throw new Error('Fallback-стратегия должна быть функцией');
        }
        
        this.fallbackStrategies.set(errorType, strategy);
        this.logger.info(`Зарегистрирована fallback-стратегия для типа ошибки: ${errorType}`);
    }

    /**
     * Применяет fallback-стратегию для обработки ошибки.
     * @param {string} errorType - Тип ошибки.
     * @param {Object} context - Контекст ошибки, содержащий информацию для fallback-стратегии.
     * @returns {Promise<any>} - Результат применения fallback-стратегии.
     */
    async applyFallbackStrategy(errorType, context = {}) {
        if (!this.options.enableFallbacks) {
            this.logger.warn('Fallback-обработчики отключены в настройках');
            throw context.error || new Error('Fallback-обработчики отключены');
        }
        
        // Проверяем количество попыток восстановления
        const attemptKey = `${errorType}:${context.filePath || 'unknown'}`;
        const attempts = this.recoveryAttempts.get(attemptKey) || 0;
        
        if (attempts >= this.options.maxRecoveryAttempts) {
            this.logger.error(`Превышено максимальное количество попыток восстановления для ${attemptKey}`);
            throw new ExceptionHierarchy.RecoveryException('Превышено максимальное количество попыток восстановления');
        }
        
        // Увеличиваем счетчик попыток
        this.recoveryAttempts.set(attemptKey, attempts + 1);
        
        // Получаем стратегию для данного типа ошибки
        const strategy = this.fallbackStrategies.get(errorType);
        
        if (!strategy) {
            this.logger.warn(`Fallback-стратегия для типа ошибки ${errorType} не найдена`);
            throw context.error || new Error(`Fallback-стратегия для типа ошибки ${errorType} не найдена`);
        }
        
        try {
            // Применяем стратегию
            this.logger.info(`Применение fallback-стратегии для типа ошибки ${errorType}, попытка ${attempts + 1}/${this.options.maxRecoveryAttempts}`);
            const result = await strategy(context);
            
            // Логируем успешное применение стратегии
            this.logger.info(`Успешно применена fallback-стратегия для типа ошибки ${errorType}`);
            
            return result;
        } catch (error) {
            // Логируем ошибку при применении стратегии
            this.logger.error(`Ошибка при применении fallback-стратегии для типа ошибки ${errorType}: ${error.message}`, error);
            
            // Если это была последняя попытка, выбрасываем исключение
            if (attempts + 1 >= this.options.maxRecoveryAttempts) {
                throw new ExceptionHierarchy.RecoveryException(`Не удалось восстановиться после ошибки типа ${errorType}`, error);
            }
            
            // Иначе пробуем еще раз с увеличенным счетчиком попыток
            return this.applyFallbackStrategy(errorType, context);
        }
    }

    /**
     * Сбрасывает счетчик попыток восстановления для указанного контекста.
     * @param {string} errorType - Тип ошибки.
     * @param {string} filePath - Путь к файлу.
     */
    resetRecoveryAttempts(errorType, filePath) {
        const attemptKey = `${errorType}:${filePath || 'unknown'}`;
        this.recoveryAttempts.delete(attemptKey);
    }

    /**
     * Сбрасывает все счетчики попыток восстановления.
     */
    resetAllRecoveryAttempts() {
        this.recoveryAttempts.clear();
    }
}

module.exports = FormatParserFallbackManager;
