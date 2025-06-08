/**
 * CBZFormatHandler.js
 * 
 * Обработчик формата CBZ для интеграции с основным приложением.
 */

const CBZParser = require('./CBZParser');
const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class CBZFormatHandler {
    /**
     * Создает экземпляр обработчика формата CBZ.
     * @param {Object} options - Опции конфигурации обработчика.
     */
    constructor(options = {}) {
        this.options = {
            cacheEnabled: true,
            ...options
        };
        this.parser = null;
        this.currentFile = null;
        this.logger = new Logger('CBZFormatHandler');
        this.currentPageIndex = 0;
    }

    /**
     * Открывает файл CBZ для обработки.
     * @param {string} filePath - Путь к файлу CBZ.
     * @returns {Promise<boolean>} - Результат открытия файла.
     */
    async openFile(filePath) {
        try {
            this.logger.info(`Открытие файла CBZ: ${filePath}`);
            this.parser = new CBZParser({ cacheResults: this.options.cacheEnabled });
            const initialized = await this.parser.initialize(filePath);
            if (!initialized) {
                this.logger.error(`Не удалось инициализировать парсер CBZ для файла: ${filePath}`);
                throw new ExceptionHierarchy.ParserException('Ошибка инициализации парсера CBZ');
            }
            this.currentFile = filePath;
            this.logger.info(`Файл CBZ успешно открыт: ${filePath}`);
            return true;
        } catch (error) {
            this.logger.error(`Ошибка при открытии файла CBZ: ${error.message}`, error);
            if (this.parser) {
                this.parser.dispose();
                this.parser = null;
            }
            this.currentFile = null;
            throw error;
        }
    }

    /**
     * Получает количество страниц (изображений) в архиве.
     * @returns {number}
     */
    getPageCount() {
        this._ensureFileOpen();
        return this.parser.images.length;
    }

    /**
     * Получает изображение по индексу.
     * @param {number} pageIndex - Индекс страницы.
     * @returns {Promise<Buffer>} - Буфер с изображением.
     */
    async getPageImage(pageIndex) {
        this._ensureFileOpen();
        return await this.parser.extractImage(pageIndex);
    }

    /**
     * Навигация: следующая страница.
     * @returns {Promise<Buffer>} - Буфер с изображением.
     */
    async nextPage() {
        this._ensureFileOpen();
        if (this.currentPageIndex < this.getPageCount() - 1) {
            this.currentPageIndex++;
        }
        return await this.getPageImage(this.currentPageIndex);
    }

    /**
     * Навигация: предыдущая страница.
     * @returns {Promise<Buffer>} - Буфер с изображением.
     */
    async previousPage() {
        this._ensureFileOpen();
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
        }
        return await this.getPageImage(this.currentPageIndex);
    }

    /**
     * Переход к определённой странице.
     * @param {number} pageIndex
     * @returns {Promise<Buffer>} - Буфер с изображением.
     */
    async goToPage(pageIndex) {
        this._ensureFileOpen();
        if (pageIndex < 0 || pageIndex >= this.getPageCount()) {
            throw new ExceptionHierarchy.StateException('Индекс страницы вне диапазона.');
        }
        this.currentPageIndex = pageIndex;
        return await this.getPageImage(pageIndex);
    }

    /**
     * Проверка, что файл открыт.
     * @private
     */
    _ensureFileOpen() {
        if (!this.parser || !this.parser.isInitialized) {
            throw new ExceptionHierarchy.StateException('Файл CBZ не открыт. Вызовите openFile() перед использованием других методов.');
        }
    }

    /**
     * Освобождает ресурсы.
     */
    close() {
        if (this.parser) {
            this.parser.dispose();
            this.parser = null;
        }
        this.currentFile = null;
        this.currentPageIndex = 0;
    }

    /**
     * Проверяет, является ли файл CBZ (ZIP-архивом с изображениями)
     * @param {ArrayBuffer|Uint8Array|Buffer} data
     * @returns {Promise<boolean>}
     */
    static async canHandle(data) {
        // ZIP-архивы начинаются с сигнатуры PK\x03\x04
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }
        if (!(data instanceof Uint8Array)) {
            return false;
        }
        const signature = [0x50, 0x4B, 0x03, 0x04]; // PK\x03\x04
        if (data.length < signature.length) {
            return false;
        }
        for (let i = 0; i < signature.length; i++) {
            if (data[i] !== signature[i]) {
                return false;
            }
        }
        // Дополнительно: можно проверить наличие хотя бы одного изображения внутри архива (опционально)
        return true;
    }
}

module.exports = CBZFormatHandler; 