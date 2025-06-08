/**
 * CBRParser.js
 * 
 * Класс для обработки и парсинга файлов в формате CBR (RAR-архив с изображениями).
 */

const { Archive } = require('unrar-js');
const path = require('path');

class CBRParser {
    /**
     * Создает экземпляр парсера CBR.
     * @param {Object} options - Опции конфигурации парсера.
     */
    constructor(options = {}) {
        this.options = {
            cacheResults: true,
            ...options
        };
        this.archive = null;
        this.images = [];
        this.isInitialized = false;
    }

    /**
     * Инициализирует парсер с указанным файлом CBR.
     * @param {string|Buffer|Uint8Array} file - Путь к файлу или буфер с содержимым CBR.
     * @returns {Promise<boolean>} - Результат инициализации.
     */
    async initialize(file) {
        try {
            let data;
            if (typeof file === 'string') {
                const fs = require('fs').promises;
                data = await fs.readFile(file);
            } else {
                data = file;
            }
            // unrar-js требует Uint8Array
            if (!(data instanceof Uint8Array)) {
                data = new Uint8Array(data);
            }
            this.archive = Archive.open(data);
            // Фильтруем только изображения (jpg, png, webp, jpeg, gif)
            this.images = this.archive.getFileHeaders()
                .filter(h => /\.(jpe?g|png|webp|gif)$/i.test(h.name))
                .sort((a, b) => a.name.localeCompare(b.name));
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Ошибка инициализации CBR парсера:', error);
            return false;
        }
    }

    /**
     * Получает список изображений (страниц) в архиве.
     * @returns {Array<string>} - Список путей к изображениям.
     */
    getPages() {
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован. Вызовите initialize() перед использованием.');
        }
        return this.images.map(h => h.name);
    }

    /**
     * Извлекает изображение по индексу.
     * @param {number} index - Индекс изображения.
     * @returns {Promise<Buffer>} - Буфер с изображением.
     */
    async extractImage(index) {
        if (!this.isInitialized) {
            throw new Error('Парсер не инициализирован. Вызовите initialize() перед использованием.');
        }
        if (index < 0 || index >= this.images.length) {
            throw new Error('Индекс изображения вне диапазона.');
        }
        const header = this.images[index];
        const fileData = this.archive.extractFiles([header.name])[0];
        if (!fileData || !fileData.extraction) {
            throw new Error('Файл изображения не найден в архиве.');
        }
        return Buffer.from(fileData.extraction);
    }

    /**
     * Освобождает ресурсы.
     */
    dispose() {
        this.archive = null;
        this.images = [];
        this.isInitialized = false;
    }
}

module.exports = CBRParser; 