/**
 * TranslationEditorIntegration.js
 * 
 * Интеграционный модуль между инструментами редактирования и системой перевода
 * Обеспечивает двустороннюю связь между компонентами и синхронизацию данных
 */

class TranslationEditorIntegration {
    /**
     * Создает экземпляр интеграционного модуля
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.translationProcessor - Экземпляр процессора перевода
     * @param {Object} options.textEditor - Экземпляр редактора текста
     * @param {Object} options.layoutEditor - Экземпляр редактора макета
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     * @param {Object} options.logger - Логгер для отладки
     */
    constructor(options) {
        this.translationProcessor = options.translationProcessor;
        this.textEditor = options.textEditor;
        this.layoutEditor = options.layoutEditor;
        this.eventEmitter = options.eventEmitter;
        this.logger = options.logger;
        
        this.isInitialized = false;
        this.activeTranslationJob = null;
        
        // Кэш для хранения промежуточных результатов
        this.translationCache = new Map();
        
        // Словарь для специфических терминов комиксов
        this.comicTermsDictionary = new Map();
    }
    
    /**
     * Инициализирует интеграционный модуль и устанавливает обработчики событий
     */
    initialize() {
        if (this.isInitialized) {
            this.logger.warn('TranslationEditorIntegration: Already initialized');
            return;
        }
        
        // Регистрация обработчиков событий от редактора текста
        this.eventEmitter.on('textEditor:textUpdated', this.handleTextUpdated.bind(this));
        this.eventEmitter.on('textEditor:translationRequested', this.handleTranslationRequested.bind(this));
        this.eventEmitter.on('textEditor:termAdded', this.handleTermAdded.bind(this));
        
        // Регистрация обработчиков событий от процессора перевода
        this.eventEmitter.on('translation:started', this.handleTranslationStarted.bind(this));
        this.eventEmitter.on('translation:progress', this.handleTranslationProgress.bind(this));
        this.eventEmitter.on('translation:completed', this.handleTranslationCompleted.bind(this));
        this.eventEmitter.on('translation:failed', this.handleTranslationFailed.bind(this));
        
        // Регистрация обработчиков событий от редактора макета
        this.eventEmitter.on('layoutEditor:textBlockResized', this.handleTextBlockResized.bind(this));
        
        // Регистрация обработчиков событий от интеграции OCR
        this.eventEmitter.on('integration:ocrResultsAvailable', this.handleOCRResultsAvailable.bind(this));
        
        this.isInitialized = true;
        this.logger.info('TranslationEditorIntegration: Initialized successfully');
        
        // Загружаем словарь специфических терминов
        this.loadComicTermsDictionary();
    }
    
    /**
     * Загружает словарь специфических терминов комиксов
     */
    async loadComicTermsDictionary() {
        try {
            // В реальном приложении здесь будет загрузка из файла или API
            const defaultTerms = [
                { source: 'POW', target: 'БАХ', language: 'ru' },
                { source: 'BOOM', target: 'БУМ', language: 'ru' },
                { source: 'CRASH', target: 'ТРЕСК', language: 'ru' },
                { source: 'BANG', target: 'БАБАХ', language: 'ru' },
                { source: 'WHAM', target: 'БДЫЩ', language: 'ru' },
                { source: 'SLAM', target: 'ХЛОП', language: 'ru' },
                { source: 'WHOOSH', target: 'ВЖУХ', language: 'ru' },
                { source: 'ZAP', target: 'ВЖИК', language: 'ru' }
            ];
            
            defaultTerms.forEach(term => {
                const key = `${term.source.toLowerCase()}:${term.language}`;
                this.comicTermsDictionary.set(key, term.target);
            });
            
            this.logger.info('TranslationEditorIntegration: Comic terms dictionary loaded', {
                termsCount: this.comicTermsDictionary.size
            });
        } catch (error) {
            this.logger.error('TranslationEditorIntegration: Failed to load comic terms dictionary', {
                error: error.message
            });
        }
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
        this.logger.debug('TranslationEditorIntegration: Text updated', { 
            textBlockId: data.textBlockId,
            imageId: data.imageId 
        });
        
        // Если текст был изменен вручную, удаляем кэшированный перевод
        if (this.translationCache.has(data.textBlockId)) {
            this.translationCache.delete(data.textBlockId);
            
            this.logger.debug('TranslationEditorIntegration: Translation cache cleared for text block', {
                textBlockId: data.textBlockId
            });
        }
    }
    
    /**
     * Обработчик события запроса перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.imageId - Идентификатор изображения
     * @param {String} data.text - Текст для перевода
     * @param {String} data.sourceLanguage - Исходный язык
     * @param {String} data.targetLanguage - Целевой язык
     */
    handleTranslationRequested(data) {
        this.logger.debug('TranslationEditorIntegration: Translation requested', { 
            textBlockId: data.textBlockId,
            imageId: data.imageId,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage
        });
        
        // Проверяем, есть ли кэшированный перевод
        const cacheKey = `${data.textBlockId}:${data.sourceLanguage}:${data.targetLanguage}`;
        if (this.translationCache.has(cacheKey) && !data.forceUpdate) {
            const cachedTranslation = this.translationCache.get(cacheKey);
            
            this.logger.debug('TranslationEditorIntegration: Using cached translation', {
                textBlockId: data.textBlockId
            });
            
            // Уведомляем редактор текста о готовом переводе
            this.eventEmitter.emit('integration:translationReady', {
                textBlockId: data.textBlockId,
                imageId: data.imageId,
                sourceText: data.text,
                translatedText: cachedTranslation.translatedText,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage,
                fromCache: true
            });
            
            return;
        }
        
        // Проверяем, есть ли термин в словаре специфических терминов
        const isSpecialTerm = this.checkAndApplySpecialTerm(data);
        if (isSpecialTerm) {
            return;
        }
        
        // Запускаем процесс перевода
        this.performTranslation(data);
    }
    
    /**
     * Проверяет и применяет специальный термин из словаря
     * 
     * @param {Object} data - Данные для перевода
     * @returns {Boolean} - true, если термин был найден и применен
     */
    checkAndApplySpecialTerm(data) {
        // Проверяем только для коротких текстов (вероятные звуковые эффекты)
        if (data.text.length > 10) {
            return false;
        }
        
        const normalizedText = data.text.trim().toLowerCase();
        const dictionaryKey = `${normalizedText}:${data.targetLanguage}`;
        
        if (this.comicTermsDictionary.has(dictionaryKey)) {
            const translatedTerm = this.comicTermsDictionary.get(dictionaryKey);
            
            this.logger.debug('TranslationEditorIntegration: Applied special term', {
                textBlockId: data.textBlockId,
                term: normalizedText,
                translation: translatedTerm
            });
            
            // Сохраняем в кэше
            const cacheKey = `${data.textBlockId}:${data.sourceLanguage}:${data.targetLanguage}`;
            this.translationCache.set(cacheKey, {
                sourceText: data.text,
                translatedText: translatedTerm,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage,
                isSpecialTerm: true
            });
            
            // Уведомляем редактор текста о готовом переводе
            this.eventEmitter.emit('integration:translationReady', {
                textBlockId: data.textBlockId,
                imageId: data.imageId,
                sourceText: data.text,
                translatedText: translatedTerm,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage,
                isSpecialTerm: true
            });
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Обработчик события добавления термина в словарь
     * 
     * @param {Object} data - Данные события
     * @param {String} data.sourceTerm - Исходный термин
     * @param {String} data.targetTerm - Перевод термина
     * @param {String} data.sourceLanguage - Исходный язык
     * @param {String} data.targetLanguage - Целевой язык
     */
    handleTermAdded(data) {
        this.logger.debug('TranslationEditorIntegration: Term added to dictionary', { 
            sourceTerm: data.sourceTerm,
            targetTerm: data.targetTerm
        });
        
        // Добавляем термин в словарь
        const key = `${data.sourceTerm.toLowerCase()}:${data.targetLanguage}`;
        this.comicTermsDictionary.set(key, data.targetTerm);
        
        // В реальном приложении здесь будет сохранение в постоянное хранилище
    }
    
    /**
     * Обработчик события начала перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {String} data.textBlockId - Идентификатор текстового блока
     */
    handleTranslationStarted(data) {
        this.logger.debug('TranslationEditorIntegration: Translation started', { 
            jobId: data.jobId,
            textBlockId: data.textBlockId 
        });
        
        this.activeTranslationJob = data.jobId;
        
        // Уведомляем редактор текста о начале перевода
        this.eventEmitter.emit('integration:processingStarted', {
            jobId: data.jobId,
            textBlockId: data.textBlockId,
            type: 'translation'
        });
    }
    
    /**
     * Обработчик события прогресса перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {Number} data.progress - Прогресс перевода (0-100)
     */
    handleTranslationProgress(data) {
        this.logger.debug('TranslationEditorIntegration: Translation progress', { 
            jobId: data.jobId,
            progress: data.progress 
        });
        
        // Уведомляем редактор текста о прогрессе перевода
        this.eventEmitter.emit('integration:processingProgress', {
            jobId: data.jobId,
            progress: data.progress,
            type: 'translation'
        });
    }
    
    /**
     * Обработчик события завершения перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.imageId - Идентификатор изображения
     * @param {String} data.sourceText - Исходный текст
     * @param {String} data.translatedText - Переведенный текст
     * @param {String} data.sourceLanguage - Исходный язык
     * @param {String} data.targetLanguage - Целевой язык
     */
    handleTranslationCompleted(data) {
        this.logger.debug('TranslationEditorIntegration: Translation completed', { 
            jobId: data.jobId,
            textBlockId: data.textBlockId 
        });
        
        this.activeTranslationJob = null;
        
        // Сохраняем перевод в кэше
        const cacheKey = `${data.textBlockId}:${data.sourceLanguage}:${data.targetLanguage}`;
        this.translationCache.set(cacheKey, {
            sourceText: data.sourceText,
            translatedText: data.translatedText,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage
        });
        
        // Уведомляем редактор текста о готовом переводе
        this.eventEmitter.emit('integration:translationReady', {
            textBlockId: data.textBlockId,
            imageId: data.imageId,
            sourceText: data.sourceText,
            translatedText: data.translatedText,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage
        });
    }
    
    /**
     * Обработчик события ошибки перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.jobId - Идентификатор задания
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {Error} data.error - Объект ошибки
     */
    handleTranslationFailed(data) {
        this.logger.error('TranslationEditorIntegration: Translation failed', { 
            jobId: data.jobId,
            textBlockId: data.textBlockId,
            error: data.error.message 
        });
        
        this.activeTranslationJob = null;
        
        // Уведомляем редактор текста об ошибке перевода
        this.eventEmitter.emit('integration:processingFailed', {
            jobId: data.jobId,
            textBlockId: data.textBlockId,
            error: data.error,
            type: 'translation'
        });
    }
    
    /**
     * Обработчик события изменения размера текстового блока
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Object} data.newBounds - Новые границы блока
     */
    handleTextBlockResized(data) {
        this.logger.debug('TranslationEditorIntegration: Text block resized', { 
            textBlockId: data.textBlockId,
            imageId: data.imageId 
        });
        
        // Уведомляем редактор текста об изменении размера блока
        this.eventEmitter.emit('integration:textBlockResized', {
            textBlockId: data.textBlockId,
            imageId: data.imageId,
            newBounds: data.newBounds
        });
    }
    
    /**
     * Обработчик события доступности результатов OCR
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Array} data.results - Результаты распознавания
     */
    handleOCRResultsAvailable(data) {
        this.logger.debug('TranslationEditorIntegration: OCR results available', { 
            imageId: data.imageId,
            resultsCount: data.results.length 
        });
        
        // Очищаем кэш переводов для этого изображения
        this.clearCacheForImage(data.imageId);
    }
    
    /**
     * Выполняет перевод текста
     * 
     * @param {Object} data - Данные для перевода
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.imageId - Идентификатор изображения
     * @param {String} data.text - Текст для перевода
     * @param {String} data.sourceLanguage - Исходный язык
     * @param {String} data.targetLanguage - Целевой язык
     * @returns {Promise<Object>} - Промис с результатами перевода
     */
    performTranslation(data) {
        if (!this.isInitialized) {
            return Promise.reject(new Error('TranslationEditorIntegration not initialized'));
        }
        
        this.logger.info('TranslationEditorIntegration: Performing translation', { 
            textBlockId: data.textBlockId,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage
        });
        
        // Запускаем перевод через процессор перевода
        return this.translationProcessor.translate({
            jobId: `translation_${Date.now()}`,
            textBlockId: data.textBlockId,
            imageId: data.imageId,
            text: data.text,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage,
            preserveFormatting: true,
            contextAware: true
        });
    }
    
    /**
     * Выполняет пакетный перевод для всех текстовых блоков изображения
     * 
     * @param {Object} options - Параметры перевода
     * @param {String} options.imageId - Идентификатор изображения
     * @param {Array} options.textBlocks - Массив текстовых блоков
     * @param {String} options.sourceLanguage - Исходный язык
     * @param {String} options.targetLanguage - Целевой язык
     * @returns {Promise<Array>} - Промис с результатами перевода
     */
    performBatchTranslation(options) {
        if (!this.isInitialized) {
            return Promise.reject(new Error('TranslationEditorIntegration not initialized'));
        }
        
        this.logger.info('TranslationEditorIntegration: Performing batch translation', { 
            imageId: options.imageId,
            blocksCount: options.textBlocks.length,
            sourceLanguage: options.sourceLanguage,
            targetLanguage: options.targetLanguage
        });
        
        // Создаем массив промисов для каждого текстового блока
        const translationPromises = options.textBlocks.map(textBlock => {
            // Проверяем кэш
            const cacheKey = `${textBlock.id}:${options.sourceLanguage}:${options.targetLanguage}`;
            if (this.translationCache.has(cacheKey) && !options.forceUpdate) {
                const cachedTranslation = this.translationCache.get(cacheKey);
                
                return Promise.resolve({
                    textBlockId: textBlock.id,
                    sourceText: textBlock.text,
                    translatedText: cachedTranslation.translatedText,
                    sourceLanguage: options.sourceLanguage,
                    targetLanguage: options.targetLanguage,
                    fromCache: true
                });
            }
            
            // Проверяем словарь специфических терминов
            if (textBlock.text.length <= 10) {
                const normalizedText = textBlock.text.trim().toLowerCase();
                const dictionaryKey = `${normalizedText}:${options.targetLanguage}`;
                
                if (this.comicTermsDictionary.has(dictionaryKey)) {
                    const translatedTerm = this.comicTermsDictionary.get(dictionaryKey);
                    
                    // Сохраняем в кэше
                    this.translationCache.set(cacheKey, {
                        sourceText: textBlock.text,
                        translatedText: translatedTerm,
                        sourceLanguage: options.sourceLanguage,
                        targetLanguage: options.targetLanguage,
                        isSpecialTerm: true
                    });
                    
                    return Promise.resolve({
                        textBlockId: textBlock.id,
                        sourceText: textBlock.text,
                        translatedText: translatedTerm,
                        sourceLanguage: options.sourceLanguage,
                        targetLanguage: options.targetLanguage,
                        isSpecialTerm: true
                    });
                }
            }
            
            // Выполняем перевод
            return this.translationProcessor.translate({
                jobId: `batch_translation_${Date.now()}_${textBlock.id}`,
                textBlockId: textBlock.id,
                imageId: options.imageId,
                text: textBlock.text,
                sourceLanguage: options.sourceLanguage,
                targetLanguage: options.targetLanguage,
                preserveFormatting: true,
                contextAware: true,
                silent: true // Не генерировать события для каждого блока
            }).then(result => {
                // Сохраняем в кэше
                this.translationCache.set(cacheKey, {
                    sourceText: textBlock.text,
                    translatedText: result.translatedText,
                    sourceLanguage: options.sourceLanguage,
                    targetLanguage: options.targetLanguage
                });
                
                return {
                    textBlockId: textBlock.id,
                    sourceText: textBlock.text,
                    translatedText: result.translatedText,
                    sourceLanguage: options.sourceLanguage,
                    targetLanguage: options.targetLanguage
                };
            });
        });
        
        // Ждем завершения всех переводов
        return Promise.all(translationPromises)
            .then(results => {
                // Уведомляем редактор текста о готовых переводах
                this.eventEmitter.emit('integration:batchTranslationReady', {
                    imageId: options.imageId,
                    translations: results,
                    sourceLanguage: options.sourceLanguage,
                    targetLanguage: options.targetLanguage
                });
                
                return results;
            });
    }
    
    /**
     * Очищает кэш переводов для указанного изображения
     * 
     * @param {String} imageId - Идентификатор изображения
     */
    clearCacheForImage(imageId) {
        // Находим все ключи кэша, связанные с этим изображением
        const keysToDelete = [];
        
        this.translationCache.forEach((value, key) => {
            if (key.startsWith(`${imageId}:`)) {
                keysToDelete.push(key);
            }
        });
        
        // Удаляем найденные ключи
        keysToDelete.forEach(key => {
            this.translationCache.delete(key);
        });
        
        this.logger.debug('TranslationEditorIntegration: Cache cleared for image', { 
            imageId: imageId,
            entriesRemoved: keysToDelete.length 
        });
    }
    
    /**
     * Очищает весь кэш переводов
     */
    clearAllCache() {
        this.translationCache.clear();
        this.logger.debug('TranslationEditorIntegration: All translation cache cleared');
    }
    
    /**
     * Освобождает ресурсы и отписывается от событий
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        this.logger.info('TranslationEditorIntegration: Disposing');
        
        // Отписываемся от всех событий
        this.eventEmitter.off('textEditor:textUpdated', this.handleTextUpdated);
        this.eventEmitter.off('textEditor:translationRequested', this.handleTranslationRequested);
        this.eventEmitter.off('textEditor:termAdded', this.handleTermAdded);
        this.eventEmitter.off('translation:started', this.handleTranslationStarted);
        this.eventEmitter.off('translation:progress', this.handleTranslationProgress);
        this.eventEmitter.off('translation:completed', this.handleTranslationCompleted);
        this.eventEmitter.off('translation:failed', this.handleTranslationFailed);
        this.eventEmitter.off('layoutEditor:textBlockResized', this.handleTextBlockResized);
        this.eventEmitter.off('integration:ocrResultsAvailable', this.handleOCRResultsAvailable);
        
        // Очищаем кэш
        this.translationCache.clear();
        
        this.isInitialized = false;
    }
}

module.exports = TranslationEditorIntegration;
