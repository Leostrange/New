/**
 * UnifiedEditorInterface.js
 * 
 * Единый пользовательский интерфейс для интеграции OCR, перевода и редактирования
 * Обеспечивает централизованное управление всеми компонентами системы
 */

class UnifiedEditorInterface {
    /**
     * Создает экземпляр единого интерфейса
     * 
     * @param {Object} options - Параметры инициализации
     * @param {Object} options.ocrEditorIntegration - Интеграция OCR и редактирования
     * @param {Object} options.translationEditorIntegration - Интеграция перевода и редактирования
     * @param {Object} options.imageEditor - Редактор изображений
     * @param {Object} options.textEditor - Редактор текста
     * @param {Object} options.layoutEditor - Редактор макета
     * @param {Object} options.eventEmitter - Система событий для коммуникации
     * @param {Object} options.logger - Логгер для отладки
     */
    constructor(options) {
        this.ocrEditorIntegration = options.ocrEditorIntegration;
        this.translationEditorIntegration = options.translationEditorIntegration;
        this.imageEditor = options.imageEditor;
        this.textEditor = options.textEditor;
        this.layoutEditor = options.layoutEditor;
        this.eventEmitter = options.eventEmitter;
        this.logger = options.logger;
        
        this.isInitialized = false;
        this.currentMode = null; // 'ocr', 'translation', 'editing'
        this.currentImageId = null;
        this.currentLanguage = {
            source: 'auto',
            target: 'en'
        };
        
        // Состояние UI элементов
        this.uiState = {
            isProcessing: false,
            processingProgress: 0,
            activeTab: 'ocr',
            showOriginal: true,
            showTranslated: true
        };
        
        // Ссылки на DOM элементы
        this.uiElements = {
            container: null,
            toolbar: null,
            statusBar: null,
            tabs: null,
            progressBar: null,
            imageContainer: null,
            textContainer: null
        };
    }
    
    /**
     * Инициализирует единый интерфейс и устанавливает обработчики событий
     * 
     * @param {Object} options - Параметры инициализации
     * @param {HTMLElement} options.container - Контейнер для интерфейса
     * @param {HTMLElement} options.toolbar - Элемент панели инструментов
     * @param {HTMLElement} options.statusBar - Элемент строки состояния
     * @param {HTMLElement} options.tabs - Элемент вкладок
     * @param {HTMLElement} options.progressBar - Элемент индикатора прогресса
     * @param {HTMLElement} options.imageContainer - Контейнер для изображения
     * @param {HTMLElement} options.textContainer - Контейнер для текста
     */
    initialize(options) {
        if (this.isInitialized) {
            this.logger.warn('UnifiedEditorInterface: Already initialized');
            return;
        }
        
        // Сохраняем ссылки на DOM элементы
        this.uiElements = {
            container: options.container,
            toolbar: options.toolbar,
            statusBar: options.statusBar,
            tabs: options.tabs,
            progressBar: options.progressBar,
            imageContainer: options.imageContainer,
            textContainer: options.textContainer
        };
        
        // Регистрация обработчиков событий от интеграционных модулей
        this.eventEmitter.on('integration:processingStarted', this.handleProcessingStarted.bind(this));
        this.eventEmitter.on('integration:processingProgress', this.handleProcessingProgress.bind(this));
        this.eventEmitter.on('integration:processingFailed', this.handleProcessingFailed.bind(this));
        this.eventEmitter.on('integration:ocrResultsAvailable', this.handleOCRResultsAvailable.bind(this));
        this.eventEmitter.on('integration:translationReady', this.handleTranslationReady.bind(this));
        this.eventEmitter.on('integration:batchTranslationReady', this.handleBatchTranslationReady.bind(this));
        
        // Регистрация обработчиков событий от редакторов
        this.eventEmitter.on('imageEditor:imageLoaded', this.handleImageLoaded.bind(this));
        this.eventEmitter.on('textEditor:textUpdated', this.handleTextUpdated.bind(this));
        this.eventEmitter.on('layoutEditor:layoutChanged', this.handleLayoutChanged.bind(this));
        
        // Инициализация UI
        this.initializeUI();
        
        this.isInitialized = true;
        this.logger.info('UnifiedEditorInterface: Initialized successfully');
    }
    
    /**
     * Инициализирует пользовательский интерфейс
     */
    initializeUI() {
        // Создаем вкладки для переключения режимов
        this.createTabs();
        
        // Создаем панель инструментов
        this.createToolbar();
        
        // Создаем строку состояния
        this.createStatusBar();
        
        // Создаем индикатор прогресса
        this.createProgressBar();
        
        // Настраиваем контейнеры для изображения и текста
        this.setupContainers();
        
        this.logger.debug('UnifiedEditorInterface: UI initialized');
    }
    
    /**
     * Создает вкладки для переключения режимов
     */
    createTabs() {
        if (!this.uiElements.tabs) {
            this.logger.warn('UnifiedEditorInterface: Tabs element not provided');
            return;
        }
        
        // В реальном приложении здесь будет создание DOM элементов
        // Для примера используем упрощенный подход
        
        const tabs = [
            { id: 'ocr', label: 'OCR' },
            { id: 'translation', label: 'Translation' },
            { id: 'editing', label: 'Editing' }
        ];
        
        // Создаем HTML для вкладок
        const tabsHTML = tabs.map(tab => {
            const isActive = tab.id === this.uiState.activeTab;
            return `
                <div class="tab ${isActive ? 'active' : ''}" data-tab-id="${tab.id}">
                    ${tab.label}
                </div>
            `;
        }).join('');
        
        this.uiElements.tabs.innerHTML = tabsHTML;
        
        // Добавляем обработчики событий для вкладок
        const tabElements = this.uiElements.tabs.querySelectorAll('.tab');
        tabElements.forEach(tabElement => {
            tabElement.addEventListener('click', () => {
                const tabId = tabElement.getAttribute('data-tab-id');
                this.switchTab(tabId);
            });
        });
    }
    
    /**
     * Создает панель инструментов
     */
    createToolbar() {
        if (!this.uiElements.toolbar) {
            this.logger.warn('UnifiedEditorInterface: Toolbar element not provided');
            return;
        }
        
        // В реальном приложении здесь будет создание DOM элементов
        // Для примера используем упрощенный подход
        
        const toolbarHTML = `
            <div class="toolbar-group">
                <button id="btn-perform-ocr" class="toolbar-button">Perform OCR</button>
                <button id="btn-translate" class="toolbar-button">Translate</button>
                <button id="btn-ocr-translate" class="toolbar-button">OCR & Translate</button>
            </div>
            <div class="toolbar-group">
                <select id="source-language" class="toolbar-select">
                    <option value="auto">Auto detect</option>
                    <option value="en">English</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="es">Spanish</option>
                    <option value="ru">Russian</option>
                </select>
                <span class="toolbar-separator">→</span>
                <select id="target-language" class="toolbar-select">
                    <option value="en">English</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="es">Spanish</option>
                    <option value="ru">Russian</option>
                </select>
            </div>
            <div class="toolbar-group">
                <button id="btn-toggle-original" class="toolbar-button toggle-button active">Show Original</button>
                <button id="btn-toggle-translated" class="toolbar-button toggle-button active">Show Translated</button>
            </div>
        `;
        
        this.uiElements.toolbar.innerHTML = toolbarHTML;
        
        // Добавляем обработчики событий для кнопок
        document.getElementById('btn-perform-ocr').addEventListener('click', () => {
            this.performOCR();
        });
        
        document.getElementById('btn-translate').addEventListener('click', () => {
            this.performTranslation();
        });
        
        document.getElementById('btn-ocr-translate').addEventListener('click', () => {
            this.performOCRAndTranslation();
        });
        
        document.getElementById('source-language').addEventListener('change', (event) => {
            this.currentLanguage.source = event.target.value;
        });
        
        document.getElementById('target-language').addEventListener('change', (event) => {
            this.currentLanguage.target = event.target.value;
        });
        
        document.getElementById('btn-toggle-original').addEventListener('click', () => {
            this.toggleOriginal();
        });
        
        document.getElementById('btn-toggle-translated').addEventListener('click', () => {
            this.toggleTranslated();
        });
    }
    
    /**
     * Создает строку состояния
     */
    createStatusBar() {
        if (!this.uiElements.statusBar) {
            this.logger.warn('UnifiedEditorInterface: Status bar element not provided');
            return;
        }
        
        // В реальном приложении здесь будет создание DOM элементов
        // Для примера используем упрощенный подход
        
        const statusBarHTML = `
            <div class="status-text">Ready</div>
            <div class="status-info">
                <span id="status-image-info">No image loaded</span>
                <span id="status-ocr-info"></span>
                <span id="status-translation-info"></span>
            </div>
        `;
        
        this.uiElements.statusBar.innerHTML = statusBarHTML;
    }
    
    /**
     * Создает индикатор прогресса
     */
    createProgressBar() {
        if (!this.uiElements.progressBar) {
            this.logger.warn('UnifiedEditorInterface: Progress bar element not provided');
            return;
        }
        
        // В реальном приложении здесь будет создание DOM элементов
        // Для примера используем упрощенный подход
        
        const progressBarHTML = `
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: 0%"></div>
            </div>
        `;
        
        this.uiElements.progressBar.innerHTML = progressBarHTML;
    }
    
    /**
     * Настраивает контейнеры для изображения и текста
     */
    setupContainers() {
        if (!this.uiElements.imageContainer || !this.uiElements.textContainer) {
            this.logger.warn('UnifiedEditorInterface: Container elements not provided');
            return;
        }
        
        // В реальном приложении здесь будет настройка контейнеров
        // Для примера используем упрощенный подход
        
        this.uiElements.imageContainer.innerHTML = `
            <div class="image-editor-container">
                <div class="image-placeholder">No image loaded</div>
            </div>
        `;
        
        this.uiElements.textContainer.innerHTML = `
            <div class="text-editor-container">
                <div class="text-placeholder">No text available</div>
            </div>
        `;
    }
    
    /**
     * Переключает активную вкладку
     * 
     * @param {String} tabId - Идентификатор вкладки
     */
    switchTab(tabId) {
        if (this.uiState.activeTab === tabId) {
            return;
        }
        
        this.uiState.activeTab = tabId;
        
        // Обновляем активную вкладку в UI
        const tabElements = this.uiElements.tabs.querySelectorAll('.tab');
        tabElements.forEach(tabElement => {
            const isActive = tabElement.getAttribute('data-tab-id') === tabId;
            if (isActive) {
                tabElement.classList.add('active');
            } else {
                tabElement.classList.remove('active');
            }
        });
        
        // Переключаем режим работы
        this.currentMode = tabId;
        
        // Уведомляем о смене режима
        this.eventEmitter.emit('ui:modeChanged', {
            mode: tabId
        });
        
        // Обновляем UI в соответствии с выбранным режимом
        this.updateUIForMode(tabId);
        
        this.logger.debug('UnifiedEditorInterface: Switched to tab', { tabId });
    }
    
    /**
     * Обновляет UI в соответствии с выбранным режимом
     * 
     * @param {String} mode - Режим работы
     */
    updateUIForMode(mode) {
        // В реальном приложении здесь будет обновление UI
        // Для примера используем упрощенный подход
        
        switch (mode) {
            case 'ocr':
                // Показываем элементы управления для OCR
                document.getElementById('btn-perform-ocr').style.display = 'inline-block';
                document.getElementById('btn-translate').style.display = 'none';
                document.getElementById('btn-ocr-translate').style.display = 'inline-block';
                document.getElementById('source-language').style.display = 'inline-block';
                document.getElementById('target-language').style.display = 'none';
                break;
                
            case 'translation':
                // Показываем элементы управления для перевода
                document.getElementById('btn-perform-ocr').style.display = 'none';
                document.getElementById('btn-translate').style.display = 'inline-block';
                document.getElementById('btn-ocr-translate').style.display = 'inline-block';
                document.getElementById('source-language').style.display = 'inline-block';
                document.getElementById('target-language').style.display = 'inline-block';
                break;
                
            case 'editing':
                // Показываем элементы управления для редактирования
                document.getElementById('btn-perform-ocr').style.display = 'none';
                document.getElementById('btn-translate').style.display = 'none';
                document.getElementById('btn-ocr-translate').style.display = 'none';
                document.getElementById('source-language').style.display = 'none';
                document.getElementById('target-language').style.display = 'none';
                break;
        }
    }
    
    /**
     * Обработчик события начала обработки
     * 
     * @param {Object} data - Данные события
     * @param {String} data.type - Тип обработки ('ocr' или 'translation')
     */
    handleProcessingStarted(data) {
        this.uiState.isProcessing = true;
        this.uiState.processingProgress = 0;
        
        // Обновляем индикатор прогресса
        this.updateProgressBar(0);
        
        // Обновляем строку состояния
        const statusText = data.type === 'ocr' ? 'Performing OCR...' : 'Translating...';
        this.updateStatusText(statusText);
        
        // Блокируем кнопки во время обработки
        this.setButtonsEnabled(false);
        
        this.logger.debug('UnifiedEditorInterface: Processing started', { type: data.type });
    }
    
    /**
     * Обработчик события прогресса обработки
     * 
     * @param {Object} data - Данные события
     * @param {Number} data.progress - Прогресс обработки (0-100)
     * @param {String} data.type - Тип обработки ('ocr' или 'translation')
     */
    handleProcessingProgress(data) {
        this.uiState.processingProgress = data.progress;
        
        // Обновляем индикатор прогресса
        this.updateProgressBar(data.progress);
        
        // Обновляем строку состояния
        const statusText = data.type === 'ocr' 
            ? `Performing OCR: ${data.progress}%` 
            : `Translating: ${data.progress}%`;
        this.updateStatusText(statusText);
        
        this.logger.debug('UnifiedEditorInterface: Processing progress', { 
            type: data.type,
            progress: data.progress 
        });
    }
    
    /**
     * Обработчик события ошибки обработки
     * 
     * @param {Object} data - Данные события
     * @param {Error} data.error - Объект ошибки
     * @param {String} data.type - Тип обработки ('ocr' или 'translation')
     */
    handleProcessingFailed(data) {
        this.uiState.isProcessing = false;
        
        // Обновляем индикатор прогресса
        this.updateProgressBar(0);
        
        // Обновляем строку состояния
        const statusText = data.type === 'ocr' 
            ? `OCR failed: ${data.error.message}` 
            : `Translation failed: ${data.error.message}`;
        this.updateStatusText(statusText, 'error');
        
        // Разблокируем кнопки
        this.setButtonsEnabled(true);
        
        this.logger.error('UnifiedEditorInterface: Processing failed', { 
            type: data.type,
            error: data.error.message 
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
        this.uiState.isProcessing = false;
        
        // Обновляем индикатор прогресса
        this.updateProgressBar(100);
        
        // Обновляем строку состояния
        this.updateStatusText(`OCR completed: ${data.results.length} text blocks found`);
        
        // Обновляем информацию о результатах OCR
        document.getElementById('status-ocr-info').textContent = 
            `OCR: ${data.results.length} text blocks`;
        
        // Разблокируем кнопки
        this.setButtonsEnabled(true);
        
        this.logger.debug('UnifiedEditorInterface: OCR results available', { 
            imageId: data.imageId,
            resultsCount: data.results.length 
        });
    }
    
    /**
     * Обработчик события готовности перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.sourceText - Исходный текст
     * @param {String} data.translatedText - Переведенный текст
     */
    handleTranslationReady(data) {
        // Если это не пакетный перевод, обновляем UI
        if (!this.uiState.batchTranslation) {
            this.uiState.isProcessing = false;
            
            // Обновляем индикатор прогресса
            this.updateProgressBar(100);
            
            // Обновляем строку состояния
            this.updateStatusText('Translation completed');
            
            // Разблокируем кнопки
            this.setButtonsEnabled(true);
        }
        
        this.logger.debug('UnifiedEditorInterface: Translation ready', { 
            textBlockId: data.textBlockId
        });
    }
    
    /**
     * Обработчик события готовности пакетного перевода
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Array} data.translations - Результаты перевода
     */
    handleBatchTranslationReady(data) {
        this.uiState.isProcessing = false;
        this.uiState.batchTranslation = false;
        
        // Обновляем индикатор прогресса
        this.updateProgressBar(100);
        
        // Обновляем строку состояния
        this.updateStatusText(`Translation completed: ${data.translations.length} text blocks translated`);
        
        // Обновляем информацию о результатах перевода
        document.getElementById('status-translation-info').textContent = 
            `Translation: ${data.translations.length} blocks`;
        
        // Разблокируем кнопки
        this.setButtonsEnabled(true);
        
        this.logger.debug('UnifiedEditorInterface: Batch translation ready', { 
            imageId: data.imageId,
            translationsCount: data.translations.length 
        });
    }
    
    /**
     * Обработчик события загрузки изображения
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     * @param {Object} data.imageInfo - Информация об изображении
     */
    handleImageLoaded(data) {
        this.currentImageId = data.imageId;
        
        // Обновляем информацию об изображении
        document.getElementById('status-image-info').textContent = 
            `Image: ${data.imageInfo.width}x${data.imageInfo.height}`;
        
        // Очищаем информацию о результатах OCR и перевода
        document.getElementById('status-ocr-info').textContent = '';
        document.getElementById('status-translation-info').textContent = '';
        
        // Обновляем строку состояния
        this.updateStatusText('Image loaded');
        
        this.logger.debug('UnifiedEditorInterface: Image loaded', { 
            imageId: data.imageId,
            width: data.imageInfo.width,
            height: data.imageInfo.height
        });
    }
    
    /**
     * Обработчик события обновления текста
     * 
     * @param {Object} data - Данные события
     * @param {String} data.textBlockId - Идентификатор текстового блока
     * @param {String} data.text - Обновленный текст
     */
    handleTextUpdated(data) {
        // Обновляем строку состояния
        this.updateStatusText('Text updated');
        
        this.logger.debug('UnifiedEditorInterface: Text updated', { 
            textBlockId: data.textBlockId
        });
    }
    
    /**
     * Обработчик события изменения макета
     * 
     * @param {Object} data - Данные события
     * @param {String} data.imageId - Идентификатор изображения
     */
    handleLayoutChanged(data) {
        // Обновляем строку состояния
        this.updateStatusText('Layout changed');
        
        this.logger.debug('UnifiedEditorInterface: Layout changed', { 
            imageId: data.imageId
        });
    }
    
    /**
     * Обновляет индикатор прогресса
     * 
     * @param {Number} progress - Прогресс (0-100)
     */
    updateProgressBar(progress) {
        if (!this.uiElements.progressBar) {
            return;
        }
        
        const progressBarFill = this.uiElements.progressBar.querySelector('.progress-bar-fill');
        if (progressBarFill) {
            progressBarFill.style.width = `${progress}%`;
        }
    }
    
    /**
     * Обновляет текст строки состояния
     * 
     * @param {String} text - Текст состояния
     * @param {String} type - Тип сообщения ('info', 'error', 'warning')
     */
    updateStatusText(text, type = 'info') {
        if (!this.uiElements.statusBar) {
            return;
        }
        
        const statusText = this.uiElements.statusBar.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = text;
            
            // Удаляем все классы типов
            statusText.classList.remove('info', 'error', 'warning');
            
            // Добавляем класс для текущего типа
            statusText.classList.add(type);
        }
    }
    
    /**
     * Включает или отключает кнопки
     * 
     * @param {Boolean} enabled - Флаг включения кнопок
     */
    setButtonsEnabled(enabled) {
        const buttons = [
            document.getElementById('btn-perform-ocr'),
            document.getElementById('btn-translate'),
            document.getElementById('btn-ocr-translate')
        ];
        
        buttons.forEach(button => {
            if (button) {
                button.disabled = !enabled;
                if (enabled) {
                    button.classList.remove('disabled');
                } else {
                    button.classList.add('disabled');
                }
            }
        });
    }
    
    /**
     * Выполняет OCR для текущего изображения
     */
    performOCR() {
        if (!this.currentImageId || this.uiState.isProcessing) {
            return;
        }
        
        this.logger.info('UnifiedEditorInterface: Performing OCR', { 
            imageId: this.currentImageId,
            language: this.currentLanguage.source
        });
        
        // Получаем данные изображения от редактора изображений
        const imageData = this.imageEditor.getImageData(this.currentImageId);
        
        // Запускаем OCR через интеграционный модуль
        this.ocrEditorIntegration.performOCR({
            imageId: this.currentImageId,
            imageData: imageData,
            language: this.currentLanguage.source
        }).catch(error => {
            this.logger.error('UnifiedEditorInterface: OCR failed', { 
                error: error.message 
            });
            
            // Обновляем строку состояния
            this.updateStatusText(`OCR failed: ${error.message}`, 'error');
        });
    }
    
    /**
     * Выполняет перевод для текущего изображения
     */
    performTranslation() {
        if (!this.currentImageId || this.uiState.isProcessing) {
            return;
        }
        
        this.logger.info('UnifiedEditorInterface: Performing translation', { 
            imageId: this.currentImageId,
            sourceLanguage: this.currentLanguage.source,
            targetLanguage: this.currentLanguage.target
        });
        
        // Получаем текстовые блоки от редактора текста
        const textBlocks = this.textEditor.getTextBlocks(this.currentImageId);
        
        if (!textBlocks || textBlocks.length === 0) {
            this.updateStatusText('No text blocks to translate', 'warning');
            return;
        }
        
        // Устанавливаем флаг пакетного перевода
        this.uiState.batchTranslation = true;
        
        // Запускаем пакетный перевод через интеграционный модуль
        this.translationEditorIntegration.performBatchTranslation({
            imageId: this.currentImageId,
            textBlocks: textBlocks,
            sourceLanguage: this.currentLanguage.source,
            targetLanguage: this.currentLanguage.target
        }).catch(error => {
            this.logger.error('UnifiedEditorInterface: Translation failed', { 
                error: error.message 
            });
            
            // Сбрасываем флаг пакетного перевода
            this.uiState.batchTranslation = false;
            
            // Обновляем строку состояния
            this.updateStatusText(`Translation failed: ${error.message}`, 'error');
        });
    }
    
    /**
     * Выполняет OCR и перевод для текущего изображения
     */
    performOCRAndTranslation() {
        if (!this.currentImageId || this.uiState.isProcessing) {
            return;
        }
        
        this.logger.info('UnifiedEditorInterface: Performing OCR and translation', { 
            imageId: this.currentImageId,
            sourceLanguage: this.currentLanguage.source,
            targetLanguage: this.currentLanguage.target
        });
        
        // Получаем данные изображения от редактора изображений
        const imageData = this.imageEditor.getImageData(this.currentImageId);
        
        // Запускаем OCR через интеграционный модуль
        this.ocrEditorIntegration.performOCR({
            imageId: this.currentImageId,
            imageData: imageData,
            language: this.currentLanguage.source
        }).then(ocrResults => {
            // После успешного OCR запускаем перевод
            
            // Устанавливаем флаг пакетного перевода
            this.uiState.batchTranslation = true;
            
            // Преобразуем результаты OCR в текстовые блоки
            const textBlocks = ocrResults.map(result => ({
                id: result.id,
                text: result.text
            }));
            
            // Запускаем пакетный перевод
            return this.translationEditorIntegration.performBatchTranslation({
                imageId: this.currentImageId,
                textBlocks: textBlocks,
                sourceLanguage: this.currentLanguage.source,
                targetLanguage: this.currentLanguage.target
            });
        }).catch(error => {
            this.logger.error('UnifiedEditorInterface: OCR and translation failed', { 
                error: error.message 
            });
            
            // Сбрасываем флаг пакетного перевода
            this.uiState.batchTranslation = false;
            
            // Обновляем строку состояния
            this.updateStatusText(`OCR and translation failed: ${error.message}`, 'error');
        });
    }
    
    /**
     * Переключает отображение оригинального текста
     */
    toggleOriginal() {
        this.uiState.showOriginal = !this.uiState.showOriginal;
        
        // Обновляем состояние кнопки
        const button = document.getElementById('btn-toggle-original');
        if (button) {
            if (this.uiState.showOriginal) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
        
        // Уведомляем о изменении отображения
        this.eventEmitter.emit('ui:displayChanged', {
            showOriginal: this.uiState.showOriginal,
            showTranslated: this.uiState.showTranslated
        });
        
        this.logger.debug('UnifiedEditorInterface: Toggle original', { 
            showOriginal: this.uiState.showOriginal 
        });
    }
    
    /**
     * Переключает отображение переведенного текста
     */
    toggleTranslated() {
        this.uiState.showTranslated = !this.uiState.showTranslated;
        
        // Обновляем состояние кнопки
        const button = document.getElementById('btn-toggle-translated');
        if (button) {
            if (this.uiState.showTranslated) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
        
        // Уведомляем о изменении отображения
        this.eventEmitter.emit('ui:displayChanged', {
            showOriginal: this.uiState.showOriginal,
            showTranslated: this.uiState.showTranslated
        });
        
        this.logger.debug('UnifiedEditorInterface: Toggle translated', { 
            showTranslated: this.uiState.showTranslated 
        });
    }
    
    /**
     * Загружает изображение
     * 
     * @param {Object} options - Параметры загрузки
     * @param {String} options.imageId - Идентификатор изображения
     * @param {String} options.imagePath - Путь к изображению
     */
    loadImage(options) {
        if (this.uiState.isProcessing) {
            return Promise.reject(new Error('Processing in progress'));
        }
        
        this.logger.info('UnifiedEditorInterface: Loading image', { 
            imageId: options.imageId,
            imagePath: options.imagePath
        });
        
        // Обновляем строку состояния
        this.updateStatusText('Loading image...');
        
        // Загружаем изображение через редактор изображений
        return this.imageEditor.loadImage(options)
            .then(imageInfo => {
                this.currentImageId = options.imageId;
                
                // Обновляем информацию об изображении
                document.getElementById('status-image-info').textContent = 
                    `Image: ${imageInfo.width}x${imageInfo.height}`;
                
                // Очищаем информацию о результатах OCR и перевода
                document.getElementById('status-ocr-info').textContent = '';
                document.getElementById('status-translation-info').textContent = '';
                
                // Обновляем строку состояния
                this.updateStatusText('Image loaded');
                
                return imageInfo;
            })
            .catch(error => {
                this.logger.error('UnifiedEditorInterface: Failed to load image', { 
                    error: error.message 
                });
                
                // Обновляем строку состояния
                this.updateStatusText(`Failed to load image: ${error.message}`, 'error');
                
                throw error;
            });
    }
    
    /**
     * Освобождает ресурсы и отписывается от событий
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }
        
        this.logger.info('UnifiedEditorInterface: Disposing');
        
        // Отписываемся от всех событий
        this.eventEmitter.off('integration:processingStarted', this.handleProcessingStarted);
        this.eventEmitter.off('integration:processingProgress', this.handleProcessingProgress);
        this.eventEmitter.off('integration:processingFailed', this.handleProcessingFailed);
        this.eventEmitter.off('integration:ocrResultsAvailable', this.handleOCRResultsAvailable);
        this.eventEmitter.off('integration:translationReady', this.handleTranslationReady);
        this.eventEmitter.off('integration:batchTranslationReady', this.handleBatchTranslationReady);
        this.eventEmitter.off('imageEditor:imageLoaded', this.handleImageLoaded);
        this.eventEmitter.off('textEditor:textUpdated', this.handleTextUpdated);
        this.eventEmitter.off('layoutEditor:layoutChanged', this.handleLayoutChanged);
        
        this.isInitialized = false;
    }
}

module.exports = UnifiedEditorInterface;
