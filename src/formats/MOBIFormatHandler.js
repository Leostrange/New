/**
 * MOBIFormatHandler.js
 * 
 * Обработчик формата MOBI для интеграции с основным приложением.
 * Предоставляет интерфейс для работы с файлами MOBI в контексте приложения.
 */

const MOBIParser = require('./MOBIParser');
const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class MOBIFormatHandler {
    /**
     * Создает экземпляр обработчика формата MOBI.
     * @param {Object} options - Опции конфигурации обработчика.
     */
    constructor(options = {}) {
        this.options = {
            cacheEnabled: true,
            renderOptions: {
                fontScale: 1.0,
                lineHeight: 1.5,
                margins: { top: 10, right: 10, bottom: 10, left: 10 }
            },
            ...options
        };
        
        this.parser = null;
        this.currentFile = null;
        this.logger = new Logger('MOBIFormatHandler');
    }

    /**
     * Открывает файл MOBI для обработки.
     * @param {string} filePath - Путь к файлу MOBI.
     * @returns {Promise<boolean>} - Результат открытия файла.
     */
    async openFile(filePath) {
        try {
            this.logger.info(`Открытие файла MOBI: ${filePath}`);
            
            // Проверка валидности файла
            const isValid = await MOBIParser.isValidMOBI(filePath);
            if (!isValid) {
                this.logger.error(`Файл не является валидным MOBI: ${filePath}`);
                throw new ExceptionHierarchy.FormatException('Недействительный формат файла MOBI');
            }
            
            // Создание и инициализация парсера
            this.parser = new MOBIParser({
                extractImages: true,
                cacheResults: this.options.cacheEnabled
            });
            
            const initialized = await this.parser.initialize(filePath);
            if (!initialized) {
                this.logger.error(`Не удалось инициализировать парсер MOBI для файла: ${filePath}`);
                throw new ExceptionHierarchy.ParserException('Ошибка инициализации парсера MOBI');
            }
            
            this.currentFile = filePath;
            this.logger.info(`Файл MOBI успешно открыт: ${filePath}`);
            return true;
        } catch (error) {
            this.logger.error(`Ошибка при открытии файла MOBI: ${error.message}`, error);
            
            // Очистка ресурсов в случае ошибки
            if (this.parser) {
                this.parser.dispose();
                this.parser = null;
            }
            this.currentFile = null;
            
            throw error;
        }
    }

    /**
     * Получает метаданные из открытого файла MOBI.
     * @returns {Promise<Object>} - Объект с метаданными.
     */
    async getMetadata() {
        this._ensureFileOpen();
        
        try {
            return await this.parser.parseMetadata();
        } catch (error) {
            this.logger.error(`Ошибка при получении метаданных MOBI: ${error.message}`, error);
            throw new ExceptionHierarchy.DataExtractionException('Не удалось извлечь метаданные из файла MOBI');
        }
    }

    /**
     * Получает содержимое из открытого файла MOBI.
     * @returns {Promise<string>} - HTML-содержимое книги.
     */
    async getContent() {
        this._ensureFileOpen();
        
        try {
            return await this.parser.extractContent();
        } catch (error) {
            this.logger.error(`Ошибка при получении содержимого MOBI: ${error.message}`, error);
            throw new ExceptionHierarchy.DataExtractionException('Не удалось извлечь содержимое из файла MOBI');
        }
    }

    /**
     * Получает оглавление из открытого файла MOBI.
     * @returns {Promise<Array>} - Массив с элементами оглавления.
     */
    async getTOC() {
        this._ensureFileOpen();
        
        try {
            return await this.parser.extractTOC();
        } catch (error) {
            this.logger.error(`Ошибка при получении оглавления MOBI: ${error.message}`, error);
            throw new ExceptionHierarchy.DataExtractionException('Не удалось извлечь оглавление из файла MOBI');
        }
    }

    /**
     * Получает изображения из открытого файла MOBI.
     * @returns {Promise<Array>} - Массив с объектами изображений.
     */
    async getImages() {
        this._ensureFileOpen();
        
        try {
            return await this.parser.extractImages();
        } catch (error) {
            this.logger.error(`Ошибка при получении изображений MOBI: ${error.message}`, error);
            throw new ExceptionHierarchy.DataExtractionException('Не удалось извлечь изображения из файла MOBI');
        }
    }

    /**
     * Проверяет, открыт ли файл, и выбрасывает исключение, если нет.
     * @private
     */
    _ensureFileOpen() {
        if (!this.parser || !this.currentFile) {
            throw new ExceptionHierarchy.StateException('Файл MOBI не открыт. Вызовите openFile() перед использованием других методов.');
        }
    }

    /**
     * Закрывает текущий файл и освобождает ресурсы.
     */
    close() {
        if (this.parser) {
            this.parser.dispose();
            this.parser = null;
        }
        this.currentFile = null;
        this.logger.info('Файл MOBI закрыт');
    }
}

module.exports = MOBIFormatHandler;
