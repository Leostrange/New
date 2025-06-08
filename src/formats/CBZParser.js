/**
 * CBZParser.js
 * 
 * Класс для обработки и парсинга файлов в формате CBZ (ZIP-архив с изображениями).
 */

const JSZip = require('jszip');
const path = require('path');

class CBZParser {
    /**
     * Создает экземпляр парсера CBZ.
     * @param {Object} options - Опции конфигурации парсера.
     */
    constructor(options = {}) {
        this.options = {
            cacheResults: true,
            ...options
        };
        this.zip = null;
        this.images = [];
        this.isInitialized = false;
    }

    /**
     * Инициализирует парсер с указанным файлом CBZ.
     * @param {string|Buffer} file - Путь к файлу или буфер с содержимым CBZ.
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
            this.zip = await JSZip.loadAsync(data);
            // Фильтруем только изображения (jpg, png, webp, jpeg, gif)
            this.images = Object.keys(this.zip.files)
                .filter(name => /\.(jpe?g|png|webp|gif)$/i.test(name))
                .sort();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Ошибка инициализации CBZ парсера:', error);
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
        return this.images;
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
        const fileName = this.images[index];
        const file = this.zip.file(fileName);
        if (!file) {
            throw new Error('Файл изображения не найден в архиве.');
        }
        return await file.async('nodebuffer');
    }

    /**
     * Освобождает ресурсы.
     */
    dispose() {
        this.zip = null;
        this.images = [];
        this.isInitialized = false;
    }
}

module.exports = CBZParser; 