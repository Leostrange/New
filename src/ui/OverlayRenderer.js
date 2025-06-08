// OverlayRenderer.js
// Модуль для наложения перевода на страницу комикса (canvas)

class OverlayRenderer {
    /**
     * Рисует перевод поверх оригинального изображения
     * @param {HTMLImageElement|HTMLCanvasElement} image - Оригинальное изображение страницы
     * @param {Array<{bbox: Object, text: string, translatedText: string}>} bubbles - Массив с bbox и переводом
     * @param {Object} [options] - Опции рендера (шрифт, цвет и т.д.)
     * @returns {HTMLCanvasElement} - Canvas с наложенным переводом
     */
    static renderTranslationOverlay(image, bubbles, options = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        // Рисуем оригинал
        ctx.drawImage(image, 0, 0, image.width, image.height);
        // Настройки
        const font = options.font || 'bold 18px Segoe UI, Arial, sans-serif';
        const textColor = options.textColor || '#222';
        const bgColor = options.bgColor || 'rgba(255,255,255,0.92)';
        const padding = options.padding || 6;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.font = font;
        // Для каждого "облачка" — рисуем белый прямоугольник и перевод
        for (const bubble of bubbles) {
            const { x, y, width, height } = bubble.bbox;
            // Белый фон
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, width, height);
            // Текст перевода
            ctx.fillStyle = textColor;
            // Перенос строк по ширине bbox
            const lines = OverlayRenderer._wrapText(ctx, bubble.translatedText, width - 2 * padding);
            let lineY = y + padding;
            for (const line of lines) {
                ctx.fillText(line, x + padding, lineY);
                lineY += 22; // высота строки
            }
        }
        return canvas;
    }

    // Вспомогательная функция для переноса текста по ширине
    static _wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        return lines;
    }
}

module.exports = OverlayRenderer; 