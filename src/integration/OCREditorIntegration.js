/**
 * OCREditorIntegration.js
 * 
 * Интеграционный модуль между инструментами редактирования и системой OCR
 * Обеспечивает двустороннюю связь между компонентами и синхронизацию данных
 */

class OCREditorIntegration {
    /**
     * Создает экземпляр интеграционного модуля
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.ocrProcessor - Экземпляр процессора OCR
     * @param {Object} options.imageEditor - Экземпляр редактора изображений
     * @param {Object} options.textEditor - Экземпляр редактора текста
     * @param {Object} options.layoutEditor - Экземпляр редактора макета
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     * @param {Object} options.logger - Логгер для отладки
     */
    constructor(options) {
        this.ocrProcessor = options.ocrProcessor;
        this.imageEditor = options.imageEditor;
        this.textEditor = options.textEditor;
        this.layoutEditor = options.layoutEditor;
        this.eventEmitter = options.eventEmitter;
        this.logger = options.logger;
        
        this.isInitialized = false;
        this.activeProcessingJob = null;
        
        // Кэш для хранения промежуточных результатов
        this.resultCache = new Map();
    }
    
    /**
     * Инициализирует интеграционный модуль и устанавливает обработчики событий
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('OCREditorIntegration: Already initialized');
            return;
        }
        
        // Регистрация обработчиков событий от редактора изображений
        this.eventEmitter.on('imageEditor:imageUpdated', this.handleImageUpdated.bind(this));
        this.eventEmitter.on('imageEditor:preprocessingApplied', this.handlePreprocessingApplied.bind(this));
        
        // Регистрация обработчиков событий от OCR процессора
        this.eventEmitter.on('ocr:recognitionStarted', this.handleRecognitionStarted.bind(this));
        this.eventEmitter.on('ocr:recognitionProgress', this.handleRecognitionProgress.bind(this));
        this.eventEmitter.on('ocr:recognitionCompleted', this.handleRecognitionCompleted.bind(this));
        this.eventEmitter.on('ocr:recognitionFailed', this.handleRecognitionFailed.bind(this));
        
        // Регистрация обработчиков событий от редактора текста
        this.eventEmitter.on('textEditor:textUpdated', this.handleTextUpdated.bind(this));
        this.eventEmitter.on('textEditor:formatUpdated', this.handleFormatUpdated.bind(this));
        
        // Регистрация обработчиков событий от редактора макета
        this.eventEmitter.on('layoutEditor:bubbleUpdated', this.handleBubbleUpdated.bind(this));
        this.eventEmitter.on('layoutEditor:layoutChanged', this.handleLayoutChanged.bind(this));
        
        this.isInitialized = true;
        this.logger.info('OCREditorIntegration: Initialized successfully');
    }
    
    /**
     * Обработчик события обновления изображения
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Object} data.imageData - Данные изображения
     */
    handleImageUpdated(data) {
        this.logger.debug('OCREditorIntegration: Image updated', { imageId: data.imageId });
        
        // Сбрасываем кэш результатов для этого изображения
        this.resultCache.delete(data.imageId);
        
        // Уведомляем OCR процессор о необходимости повторного распознавания
        this.eventEmitter.emit('integration:ocrRequireUpdate', {
            imageId: data.imageId,
            imageData: data.imageData,
            source: 'imageEditor'
        });
    }
    
    /**
     * Обработчик события применения предобработки изображения
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Object} data.preprocessingParams - Параметры предобработки
     * @param {Object} data.imageData - Данные изображения после предобработки
     */
    handlePreprocessingApplied(data) {
        this.logger.debug('OCREditorIntegration: Preprocessing applied', { 
            imageId: data.imageId,
            params: data.preprocessingParams 
        });
        
        // Сохраняем параметры предобработки для использования в OCR
        if (!this.resultCache.has(data.imageId)) {
            this.resultCache.set(data.imageId, {});
        }
        
        const cacheEntry = this.resultCache.get(data.imageId);
        cacheEntry.preprocessingParams = data.preprocessingParams;
        
        // Уведомляем OCR процессор о применении предобработки
        this.eventEmitter.emit('integration:preprocessingApplied', {
            imageId: data.imageId,
            preprocessingParams: data.preprocessingParams,
            imageData: data.imageData
        });
    }
    
    /**
     * Обработчик события начала распознавания OCR
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {String} data.imageId - Идентификатор изображения
     */
    handleRecognitionStarted(data) {
        this.logger.debug('OCREditorIntegration: Recognition started', { 
            jobId: data.jobId,
            imageId: data.imageId 
        });
        
        this.activeProcessingJob = data.jobId;
        
        // Уведомляем редакторы о начале распознавания
        this.eventEmitter.emit('integration:processingStarted', {
            jobId: data.jobId,
            imageId: data.imageId,
            type: 'ocr'
        });
    }
    
    /**
     * Обработчик события прогресса распознавания OCR
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {Number} data.progress - Прогресс распознавания (0-100)
     */
    handleRecognitionProgress(data) {
        this.logger.debug('OCREditorIntegration: Recognition progress', { 
            jobId: data.jobId,
            progress: data.progress 
        });
        
        // Уведомляем редакторы о прогрессе распознавания
        this.eventEmitter.emit('integration:processingProgress', {
            jobId: data.jobId,
            progress: data.progress,
            type: 'ocr'
        });
    }
    
    /**
     * Обработчик события завершения распознавания OCR
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Array} data.results - Результаты распознавания
     */
    handleRecognitionCompleted(data) {
        this.logger.debug('OCREditorIntegration: Recognition completed', { 
            jobId: data.jobId,
            imageId: data.imageId,
            resultsCount: data.results.length 
        });
        
        this.activeProcessingJob = null;
        
        // Сохраняем результаты распознавания в кэше
        if (!this.resultCache.has(data.imageId)) {
            this.resultCache.set(data.imageId, {});
        }
        
        const cacheEntry = this.resultCache.get(data.imageId);
        cacheEntry.ocrResults = data.results;
        
        // Уведомляем редактор текста о новых результатах распознавания
        this.eventEmitter.emit('integration:ocrResultsAvailable', {
            imageId: data.imageId,
            results: data.results
        });
        
        // Уведомляем редактор макета о новых результатах распознавания
        this.eventEmitter.emit('integration:layoutUpdateRequired', {
            imageId: data.imageId,
            textBlocks: data.results.map(result => ({
                id: result.id,
                text: result.text,
                bounds: result.bounds,
                confidence: result.confidence
            }))
        });
    }
    
    /**
     * Обработчик события ошибки распознавания OCR
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Error} data.error - Объект ошибки
     */
    handleRecognitionFailed(data) {
        this.logger.error('OCREditorIntegration: Recognition failed', { 
            jobId: data.jobId,
            imageId: data.imageId,
            error: data.error.message 
        });
        
        this.activeProcessingJob = null;
        
        // Уведомляем редакторы об ошибке распознавания
        this.eventEmitter.emit('integration:processingFailed', {
            jobId: data.jobId,
            imageId: data.imageId,
            error: data.error,
            type: 'ocr'
        });
    }
    
    /**
     * Обработчик события обновления текста в редакторе
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.imageId - Идентификатор изображения
     * @param {String} data.text - Обновленный текст
     */
    handleTextUpdated(data) {
        this.logger.debug('OCREditorIntegration: Text updated', { 
            textBlockId: data.textBlockId,
            imageId: data.imageId 
        });
        
        // Обновляем текст в кэше результатов
        if (this.resultCache.has(data.imageId)) {
            const cacheEntry = this.resultCache.get(data.imageId);
            if (cacheEntry.ocrResults) {
                const textBlock = cacheEntry.ocrResults.find(result => result.id === data.textBlockId);
                if (textBlock) {
                    textBlock.text = data.text;
                    textBlock.isEdited = true;
                }
            }
        }
        
        // Уведомляем редактор макета об обновлении текста
        this.eventEmitter.emit('integration:textBlockUpdated', {
            textBlockId: data.textBlockId,
            imageId: data.imageId,
            text: data.text
        });
    }
    
    /**
     * Обработчик события обновления форматирования текста
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Object} data.formatting - Параметры форматирования
     */
    handleFormatUpdated(data) {
        this.logger.debug('OCREditorIntegration: Format updated', { 
            textBlockId: data.textBlockId,
            imageId: data.imageId 
        });
        
        // Обновляем форматирование в кэше результатов
        if (this.resultCache.has(data.imageId)) {
            const cacheEntry = this.resultCache.get(data.imageId);
            if (cacheEntry.ocrResults) {
                const textBlock = cacheEntry.ocrResults.find(result => result.id === data.textBlockId);
                if (textBlock) {
                    textBlock.formatting = data.formatting;
                    textBlock.isFormatted = true;
                }
            }
        }
        
        // Уведомляем редактор макета об обновлении форматирования
        this.eventEmitter.emit('integration:formatUpdated', {
            textBlockId: data.textBlockId,
            imageId: data.imageId,
            formatting: data.formatting
        });
    }
    
    /**
     * Обработчик события обновления пузыря диалога
     * 
     * @param {Object} data - Данные события
     * @param {String} data.bubbleId - Идентификатор пузыря
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Object} data.bounds - Границы пузыря
     * @param {String} data.textBlockId - Идентификатор связанного текстового блока
     */
    handleBubbleUpdated(data) {
        this.logger.debug('OCREditorIntegration: Bubble updated', { 
            bubbleId: data.bubbleId,
            imageId: data.imageId 
        });
        
        // Обновляем информацию о пузыре в кэше результатов
        if (this.resultCache.has(data.imageId)) {
            const cacheEntry = this.resultCache.get(data.imageId);
            if (!cacheEntry.bubbles) {
                cacheEntry.bubbles = new Map();
            }
            
            cacheEntry.bubbles.set(data.bubbleId, {
                bounds: data.bounds,
                textBlockId: data.textBlockId
            });
            
            // Если есть связанный текстовый блок, обновляем его привязку к пузырю
            if (cacheEntry.ocrResults && data.textBlockId) {
                const textBlock = cacheEntry.ocrResults.find(result => result.id === data.textBlockId);
                if (textBlock) {
                    textBlock.bubbleId = data.bubbleId;
                }
            }
        }
        
        // Уведомляем OCR процессор об обновлении пузыря для улучшения распознавания
        this.eventEmitter.emit('integration:bubbleUpdated', {
            bubbleId: data.bubbleId,
            imageId: data.imageId,
            bounds: data.bounds,
            textBlockId: data.textBlockId
        });
    }
    
    /**
     * Обработчик события изменения макета
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Array} data.layout - Данные макета
     */
    handleLayoutChanged(data) {
        this.logger.debug('OCREditorIntegration: Layout changed', { 
            imageId: data.imageId,
            elementsCount: data.layout.length 
        });
        
        // Обновляем информацию о макете в кэше результатов
        if (this.resultCache.has(data.imageId)) {
            const cacheEntry = this.resultCache.get(data.imageId);
            cacheEntry.layout = data.layout;
        }
        
        // Уведомляем OCR процессор об изменении макета для улучшения распознавания
        this.eventEmitter.emit('integration:layoutChanged', {
            imageId: data.imageId,
            layout: data.layout
        });
    }
    
    /**
     * Запускает процесс распознавания OCR для изображения
     * 
     * @param {Object} options - Параметры распознавания
     * @param {String} options.imageId - Идентификатор изображения
     * @param {Object} options.imageData - Данные изображения
     * @param {Object} options.preprocessingParams - Параметры предобработки (опционально)
     * @returns {Promise<Object>} - Промис с результатами распознавания
     */
    performOCR(options) {
        if (!this.isInitialized) {
            return Promise.reject(new Error('OCREditorIntegration not initialized'));
        }
        
        this.logger.info('OCREditorIntegration: Performing OCR', { imageId: options.imageId });
        
        // Если есть кэшированные результаты и изображение не изменилось, возвращаем их
        if (this.resultCache.has(options.imageId) && 
            this.resultCache.get(options.imageId).ocrResults &&
            !options.forceUpdate) {
            
            const cachedResults = this.resultCache.get(options.imageId).ocrResults;
            this.logger.debug('OCREditorIntegration: Using cached OCR results', { 
                imageId: options.imageId,
                resultsCount: cachedResults.length 
            });
            
            return Promise.resolve(cachedResults);
        }
        
        // Получаем параметры предобработки из кэша или из переданных параметров
        let preprocessingParams = options.preprocessingParams;
        if (!preprocessingParams && 
            this.resultCache.has(options.imageId) && 
            this.resultCache.get(options.imageId).preprocessingParams) {
            
            preprocessingParams = this.resultCache.get(options.imageId).preprocessingParams;
        }
        
        // Получаем информацию о пузырях из кэша
        let bubbles = null;
        if (this.resultCache.has(options.imageId) && 
            this.resultCache.get(options.imageId).bubbles) {
            
            bubbles = Array.from(this.resultCache.get(options.imageId).bubbles.values());
        }
        
        // Запускаем распознавание через OCR процессор
        return this.ocrProcessor.recognize({
            imageId: options.imageId,
            imageData: options.imageData,
            preprocessingParams: preprocessingParams,
            bubbles: bubbles,
            language: options.language || 'auto'
        });
    }
    
    /**
     * Применяет результаты OCR к редакторам
     * 
     * @param {Object} options - Параметры применения
     * @param {String} options.imageId - Идентификатор изображения
     * @param {Array} options.results - Результаты распознавания
     */
    applyOCRResults(options) {
        if (!this.isInitialized) {
            throw new Error('OCREditorIntegration not initialized');
        }
        
        this.logger.info('OCREditorIntegration: Applying OCR results', { 
            imageId: options.imageId,
            resultsCount: options.results.length 
        });
        
        // Сохраняем результаты в кэше
        if (!this.resultCache.has(options.imageId)) {
            this.resultCache.set(options.imageId, {});
        }
        
        const cacheEntry = this.resultCache.get(options.imageId);
        cacheEntry.ocrResults = options.results;
        
        // Применяем результаты к редактору текста
        this.eventEmitter.emit('integration:applyTextResults', {
            imageId: options.imageId,
            textBlocks: options.results.map(result => ({
                id: result.id,
                text: result.text,
                confidence: result.confidence
            }))
        });
        
        // Применяем результаты к редактору макета
        this.eventEmitter.emit('integration:applyLayoutResults', {
            imageId: options.imageId,
            textBlocks: options.results.map(result => ({
                id: result.id,
                text: result.text,
                bounds: result.bounds,
                confidence: result.confidence
            }))
        });
    }
    
    /**
     * Очищает кэш результатов для указанного изображения или всех изображений
     * 
     * @param {Object} options - Параметры очистки
     * @param {String} options.imageId - Идентификатор изображения (опционально)
     */
    clearCache(options = {}) {
        if (options.imageId) {
            this.logger.debug('OCREditorIntegration: Clearing cache for image', { imageId: options.imageId });
            this.resultCache.delete(options.imageId);
        } else {
            this.logger.debug('OCREditorIntegration: Clearing all cache');
            this.resultCache.clear();
        }
    }
    
    /**
     * Освобождает ресурсы и отписывается от событий
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        this.logger.info('OCREditorIntegration: Disposing');
        
        // Отписываемся от всех событий
        this.eventEmitter.off('imageEditor:imageUpdated', this.handleImageUpdated);
        this.eventEmitter.off('imageEditor:preprocessingApplied', this.handlePreprocessingApplied);
        this.eventEmitter.off('ocr:recognitionStarted', this.handleRecognitionStarted);
        this.eventEmitter.off('ocr:recognitionProgress', this.handleRecognitionProgress);
        this.eventEmitter.off('ocr:recognitionCompleted', this.handleRecognitionCompleted);
        this.eventEmitter.off('ocr:recognitionFailed', this.handleRecognitionFailed);
        this.eventEmitter.off('textEditor:textUpdated', this.handleTextUpdated);
        this.eventEmitter.off('textEditor:formatUpdated', this.handleFormatUpdated);
        this.eventEmitter.off('layoutEditor:bubbleUpdated', this.handleBubbleUpdated);
        this.eventEmitter.off('layoutEditor:layoutChanged', this.handleLayoutChanged);
        
        // Очищаем кэш
        this.resultCache.clear();
        
        this.isInitialized = false;
    }
}

module.exports = OCREditorIntegration;
