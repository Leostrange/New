// OcrManager.js
// Модуль для интеграции детектора облачков и OCR (Tesseract)

const SpeechBubbleDetector = require('./SpeechBubbleDetector');
const TesseractOCRProcessor = require('../../mrcomic-processing-pipeline/src/ocr/TesseractOCRProcessor');

class OcrManager {
    /**
     * @param {Object} options
     * @param {Object} options.ocrConfig - Конфиг для TesseractOCRProcessor
     * @param {Object} options.logger - Логгер (опционально)
     */
    constructor(options = {}) {
        this.ocrConfig = options.ocrConfig || {};
        this.logger = options.logger || console;
        this.ocrProcessor = new TesseractOCRProcessor({ config: this.ocrConfig, logger: this.logger });
    }

    /**
     * Распознаёт текст в "облачках" на странице
     * @param {HTMLImageElement|HTMLCanvasElement} image - Изображение страницы
     * @param {Object} [options]
     * @returns {Promise<Array<{bbox: Object, text: string}>>}
     */
    async recognizeBubbles(image, options = {}) {
        // 1. Детектируем "облачки"
        const bubbles = SpeechBubbleDetector.detectBubbles(image, options.bubbleDetection);
        if (!bubbles.length) {
            this.logger.warn('Облачки не найдены');
            return [];
        }
        // 2. Для каждого bbox вызываем OCR
        const results = [];
        for (const bbox of bubbles) {
            // Вырезаем область (canvas)
            const canvas = document.createElement('canvas');
            canvas.width = bbox.width;
            canvas.height = bbox.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, bbox.x, bbox.y, bbox.width, bbox.height, 0, 0, bbox.width, bbox.height);
            // Распознаём текст
            const ocrResult = await this.ocrProcessor.recognize(canvas, { ...options.ocr, language: options.language });
            results.push({ bbox, text: ocrResult.text });
        }
        return results;
    }
}

module.exports = OcrManager; 