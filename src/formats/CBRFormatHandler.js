/**
 * CBRFormatHandler.js
 * 
 * Обработчик формата CBR для интеграции с основным приложением.
 */

const CBRParser = require('./CBRParser');
const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class CBRFormatHandler {
    /**
     * Создает экземпляр обработчика формата CBR.
     * @param {Object} options - Опции конфигурации обработчика.
     */
    constructor(options = {}) {
        this.options = {
            cacheEnabled: true,
            ...options
        };
        this.parser = null;
        this.currentFile = null;
        this.logger = new Logger('CBRFormatHandler');
        this.currentPageIndex = 0;
    }

    /**
     * Открывает файл CBR для обработки.
     * @param {string} filePath - Путь к файлу CBR.
     * @returns {Promise<boolean>} - Результат открытия файла.
     */
    async openFile(filePath) {
        try {
            this.logger.info(`Открытие файла CBR: ${filePath}`);
            this.parser = new CBRParser({ cacheResults: this.options.cacheEnabled });
            const initialized = await this.parser.initialize(filePath);
            if (!initialized) {
                this.logger.error(`Не удалось инициализировать парсер CBR для файла: ${filePath}`);
                throw new ExceptionHierarchy.ParserException('Ошибка инициализации парсера CBR');
            }
            this.currentFile = filePath;
            this.logger.info(`Файл CBR успешно открыт: ${filePath}`);
            return true;
        } catch (error) {
            this.logger.error(`Ошибка при открытии файла CBR: ${error.message}`, error);
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
            throw new ExceptionHierarchy.StateException('Файл CBR не открыт. Вызовите openFile() перед использованием других методов.');
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
     * Проверяет, является ли файл CBR (RAR-архивом с изображениями)
     * @param {ArrayBuffer|Uint8Array|Buffer} data
     * @returns {Promise<boolean>}
     */
    static async canHandle(data) {
        // RAR-архивы начинаются с сигнатуры Rar! (0x52 0x61 0x72 0x21)
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }
        if (!(data instanceof Uint8Array)) {
            return false;
        }
        const signature = [0x52, 0x61, 0x72, 0x21]; // Rar!
        if (data.length < signature.length) {
            return false;
        }
        for (let i = 0; i < signature.length; i++) {
            if (data[i] !== signature[i]) {
                return false;
            }
        }
        return true;
    }
}

module.exports = CBRFormatHandler; 