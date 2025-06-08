// SpeechBubbleDetector.js
// Модуль для детекции "облачков" (speech bubbles) на страницах комикса с помощью OpenCV.js
// Версия 1.0: простая детекция по контурам и фильтрация по размеру/форме

class SpeechBubbleDetector {
    /**
     * Детектирует "облачки" на изображении
     * @param {HTMLImageElement|HTMLCanvasElement} image - Изображение страницы
     * @param {Object} [options] - Опции детекции
     * @returns {Array<{x: number, y: number, width: number, height: number}>} Массив bounding boxes
     */
    static detectBubbles(image, options = {}) {
        // Проверка наличия OpenCV.js
        if (typeof cv === 'undefined') {
            throw new Error('OpenCV.js не загружен!');
        }
        // Преобразуем изображение в матрицу OpenCV
        let src = cv.imread(image);
        let gray = new cv.Mat();
        let thresh = new cv.Mat();
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let boundingBoxes = [];
        try {
            // Переводим в оттенки серого
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
            // Бинаризация (адаптивный порог)
            cv.adaptiveThreshold(gray, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 15, 10);
            // Поиск контуров
            cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            // Фильтрация контуров по размеру и форме
            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);
                let rect = cv.boundingRect(cnt);
                // Фильтрация по минимальному/максимальному размеру
                if (rect.width < 40 || rect.height < 20) continue;
                if (rect.width > src.cols * 0.9 || rect.height > src.rows * 0.9) continue;
                // Фильтрация по соотношению сторон (облачки обычно шире, чем выше)
                let aspect = rect.width / rect.height;
                if (aspect < 0.7 || aspect > 3.5) continue;
                // (Можно добавить фильтрацию по площади, эллиптичности и т.д.)
                boundingBoxes.push({
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                });
                cnt.delete();
            }
        } finally {
            src.delete();
            gray.delete();
            thresh.delete();
            contours.delete();
            hierarchy.delete();
        }
        return boundingBoxes;
    }
}

module.exports = SpeechBubbleDetector; 