/**
 * @file BatchProcessingIntegration.js
 * @description Интеграционный модуль для пакетной обработки страниц
 * @module ocr/BatchProcessingIntegration
 */

const BatchProcessor = require('./BatchProcessor');

/**
 * Класс для интеграции процессора пакетной обработки в приложение
 */
class BatchProcessingIntegration {
  /**
   * Создает экземпляр интеграции процессора пакетной обработки
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация
   * @param {Object} options.ocrEngine - Движок OCR
   * @param {Object} options.translationEngine - Движок перевода
   * @param {Object} options.uiManager - Менеджер пользовательского интерфейса
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = options.config || {};
    this.ocrEngine = options.ocrEngine;
    this.translationEngine = options.translationEngine;
    this.uiManager = options.uiManager;
    
    // Создаем экземпляр процессора пакетной обработки
    this.batchProcessor = new BatchProcessor({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config.batchProcessor || {},
      ocrEngine: this.ocrEngine,
      translationEngine: this.translationEngine
    });
    
    // Флаги состояния
    this.isInitialized = false;
    this.isRendered = false;
    
    // DOM элементы
    this.container = null;
    this.batchContainer = null;
    this.createBatchButton = null;
    this.batchListContainer = null;
    this.batchFormContainer = null;
    
    // Привязка методов к контексту
    this.handleCreateBatchClick = this.handleCreateBatchClick.bind(this);
    this.handleBatchFormSubmit = this.handleBatchFormSubmit.bind(this);
    this.handleBatchFormCancel = this.handleBatchFormCancel.bind(this);
    this.handleBatchCreated = this.handleBatchCreated.bind(this);
    this.handleBatchStart = this.handleBatchStart.bind(this);
    this.handleBatchProgress = this.handleBatchProgress.bind(this);
    this.handleBatchComplete = this.handleBatchComplete.bind(this);
    this.handleBatchError = this.handleBatchError.bind(this);
    this.handleBatchPaused = this.handleBatchPaused.bind(this);
    this.handleBatchResumed = this.handleBatchResumed.bind(this);
    this.handleBatchCancelled = this.handleBatchCancelled.bind(this);
    this.handleTaskComplete = this.handleTaskComplete.bind(this);
  }
  
  /**
   * Инициализирует интеграцию процессора пакетной обработки
   * @returns {BatchProcessingIntegration} Экземпляр интеграции
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('BatchProcessingIntegration: already initialized');
      return this;
    }
    
    this.logger.info('BatchProcessingIntegration: initializing');
    
    // Проверяем наличие необходимых компонентов
    if (!this.ocrEngine) {
      this.logger.error('BatchProcessingIntegration: OCR engine is required');
      throw new Error('OCR engine is required');
    }
    
    if (!this.translationEngine) {
      this.logger.error('BatchProcessingIntegration: Translation engine is required');
      throw new Error('Translation engine is required');
    }
    
    // Инициализируем процессор пакетной обработки
    this.batchProcessor.initialize();
    
    // Подписываемся на события
    this.eventEmitter.on('batch:created', this.handleBatchCreated);
    this.eventEmitter.on('batch:start', this.handleBatchStart);
    this.eventEmitter.on('batch:progress', this.handleBatchProgress);
    this.eventEmitter.on('batch:complete', this.handleBatchComplete);
    this.eventEmitter.on('batch:error', this.handleBatchError);
    this.eventEmitter.on('batch:paused', this.handleBatchPaused);
    this.eventEmitter.on('batch:resumed', this.handleBatchResumed);
    this.eventEmitter.on('batch:cancelled', this.handleBatchCancelled);
    this.eventEmitter.on('task:complete', this.handleTaskComplete);
    
    this.isInitialized = true;
    this.eventEmitter.emit('batchProcessingIntegration:initialized');
    
    return this;
  }
  
  /**
   * Рендерит интеграцию процессора пакетной обработки в указанный контейнер
   * @param {HTMLElement} container - Контейнер для рендеринга
   * @returns {BatchProcessingIntegration} Экземпляр интеграции
   */
  render(container) {
    if (!this.isInitialized) {
      this.logger.warn('BatchProcessingIntegration: not initialized');
      return this;
    }
    
    if (!container) {
      this.logger.error('BatchProcessingIntegration: container is required');
      return this;
    }
    
    this.container = container;
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    // Создаем основной контейнер
    this.batchContainer = document.createElement('div');
    this.batchContainer.className = 'batch-processing-container';
    
    // Создаем заголовок
    const header = document.createElement('h2');
    header.textContent = 'Пакетная обработка страниц';
    this.batchContainer.appendChild(header);
    
    // Создаем кнопку создания пакетной задачи
    this.createBatchButton = document.createElement('button');
    this.createBatchButton.className = 'create-batch-button';
    this.createBatchButton.textContent = 'Создать пакетную задачу';
    this.createBatchButton.addEventListener('click', this.handleCreateBatchClick);
    this.batchContainer.appendChild(this.createBatchButton);
    
    // Создаем контейнер для формы создания пакетной задачи
    this.batchFormContainer = document.createElement('div');
    this.batchFormContainer.className = 'batch-form-container';
    this.batchFormContainer.style.display = 'none';
    this.batchContainer.appendChild(this.batchFormContainer);
    
    // Создаем контейнер для списка пакетных задач
    this.batchListContainer = document.createElement('div');
    this.batchListContainer.className = 'batch-list-container';
    this.batchContainer.appendChild(this.batchListContainer);
    
    // Добавляем созданный контейнер в основной контейнер
    this.container.appendChild(this.batchContainer);
    
    // Обновляем список пакетных задач
    this.updateBatchList();
    
    this.isRendered = true;
    
    return this;
  }
  
  /**
   * Обработчик нажатия на кнопку создания пакетной задачи
   * @private
   */
  handleCreateBatchClick() {
    // Показываем форму создания пакетной задачи
    this.showBatchForm();
  }
  
  /**
   * Показывает форму создания пакетной задачи
   * @private
   */
  showBatchForm() {
    if (!this.isRendered || !this.batchFormContainer) {
      return;
    }
    
    // Очищаем контейнер формы
    this.batchFormContainer.innerHTML = '';
    
    // Создаем форму
    const form = document.createElement('form');
    form.className = 'batch-form';
    form.addEventListener('submit', this.handleBatchFormSubmit);
    
    // Создаем поле для названия пакетной задачи
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Название:';
    nameLabel.htmlFor = 'batch-name';
    nameGroup.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'batch-name';
    nameInput.name = 'name';
    nameInput.required = true;
    nameInput.placeholder = 'Введите название пакетной задачи';
    nameGroup.appendChild(nameInput);
    
    form.appendChild(nameGroup);
    
    // Создаем поле для выбора файлов
    const filesGroup = document.createElement('div');
    filesGroup.className = 'form-group';
    
    const filesLabel = document.createElement('label');
    filesLabel.textContent = 'Файлы:';
    filesLabel.htmlFor = 'batch-files';
    filesGroup.appendChild(filesLabel);
    
    const filesInput = document.createElement('input');
    filesInput.type = 'file';
    filesInput.id = 'batch-files';
    filesInput.name = 'files';
    filesInput.multiple = true;
    filesInput.accept = 'image/*';
    filesInput.required = true;
    filesGroup.appendChild(filesInput);
    
    form.appendChild(filesGroup);
    
    // Создаем поле для выбора движка OCR
    const ocrGroup = document.createElement('div');
    ocrGroup.className = 'form-group';
    
    const ocrLabel = document.createElement('label');
    ocrLabel.textContent = 'Движок OCR:';
    ocrLabel.htmlFor = 'batch-ocr-engine';
    ocrGroup.appendChild(ocrLabel);
    
    const ocrSelect = document.createElement('select');
    ocrSelect.id = 'batch-ocr-engine';
    ocrSelect.name = 'ocrEngine';
    ocrSelect.required = true;
    
    // Добавляем доступные движки OCR
    const ocrEngines = this.getAvailableOCREngines();
    ocrEngines.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.id;
      option.textContent = engine.name;
      ocrSelect.appendChild(option);
    });
    
    ocrGroup.appendChild(ocrSelect);
    
    form.appendChild(ocrGroup);
    
    // Создаем поле для выбора движка перевода
    const translationGroup = document.createElement('div');
    translationGroup.className = 'form-group';
    
    const translationLabel = document.createElement('label');
    translationLabel.textContent = 'Движок перевода:';
    translationLabel.htmlFor = 'batch-translation-engine';
    translationGroup.appendChild(translationLabel);
    
    const translationSelect = document.createElement('select');
    translationSelect.id = 'batch-translation-engine';
    translationSelect.name = 'translationEngine';
    translationSelect.required = true;
    
    // Добавляем доступные движки перевода
    const translationEngines = this.getAvailableTranslationEngines();
    translationEngines.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.id;
      option.textContent = engine.name;
      translationSelect.appendChild(option);
    });
    
    translationGroup.appendChild(translationSelect);
    
    form.appendChild(translationGroup);
    
    // Создаем поле для выбора языка исходного текста
    const sourceLanguageGroup = document.createElement('div');
    sourceLanguageGroup.className = 'form-group';
    
    const sourceLanguageLabel = document.createElement('label');
    sourceLanguageLabel.textContent = 'Исходный язык:';
    sourceLanguageLabel.htmlFor = 'batch-source-language';
    sourceLanguageGroup.appendChild(sourceLanguageLabel);
    
    const sourceLanguageSelect = document.createElement('select');
    sourceLanguageSelect.id = 'batch-source-language';
    sourceLanguageSelect.name = 'sourceLanguage';
    sourceLanguageSelect.required = true;
    
    // Добавляем доступные языки
    const languages = this.getAvailableLanguages();
    languages.forEach(language => {
      const option = document.createElement('option');
      option.value = language.code;
      option.textContent = language.name;
      if (language.code === 'ja') {
        option.selected = true;
      }
      sourceLanguageSelect.appendChild(option);
    });
    
    sourceLanguageGroup.appendChild(sourceLanguageSelect);
    
    form.appendChild(sourceLanguageGroup);
    
    // Создаем поле для выбора языка перевода
    const targetLanguageGroup = document.createElement('div');
    targetLanguageGroup.className = 'form-group';
    
    const targetLanguageLabel = document.createElement('label');
    targetLanguageLabel.textContent = 'Язык перевода:';
    targetLanguageLabel.htmlFor = 'batch-target-language';
    targetLanguageGroup.appendChild(targetLanguageLabel);
    
    const targetLanguageSelect = document.createElement('select');
    targetLanguageSelect.id = 'batch-target-language';
    targetLanguageSelect.name = 'targetLanguage';
    targetLanguageSelect.required = true;
    
    // Добавляем доступные языки
    languages.forEach(language => {
      const option = document.createElement('option');
      option.value = language.code;
      option.textContent = language.name;
      if (language.code === 'ru') {
        option.selected = true;
      }
      targetLanguageSelect.appendChild(option);
    });
    
    targetLanguageGroup.appendChild(targetLanguageSelect);
    
    form.appendChild(targetLanguageGroup);
    
    // Создаем поле для выбора автозапуска
    const autoStartGroup = document.createElement('div');
    autoStartGroup.className = 'form-group checkbox-group';
    
    const autoStartInput = document.createElement('input');
    autoStartInput.type = 'checkbox';
    autoStartInput.id = 'batch-auto-start';
    autoStartInput.name = 'autoStart';
    autoStartInput.checked = true;
    autoStartGroup.appendChild(autoStartInput);
    
    const autoStartLabel = document.createElement('label');
    autoStartLabel.textContent = 'Автоматически запустить обработку';
    autoStartLabel.htmlFor = 'batch-auto-start';
    autoStartGroup.appendChild(autoStartLabel);
    
    form.appendChild(autoStartGroup);
    
    // Создаем кнопки управления
    const buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'form-buttons';
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'submit-button';
    submitButton.textContent = 'Создать';
    buttonsGroup.appendChild(submitButton);
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', this.handleBatchFormCancel);
    buttonsGroup.appendChild(cancelButton);
    
    form.appendChild(buttonsGroup);
    
    // Добавляем форму в контейнер
    this.batchFormContainer.appendChild(form);
    
    // Показываем контейнер формы
    this.batchFormContainer.style.display = 'block';
  }
  
  /**
   * Обработчик отправки формы создания пакетной задачи
   * @param {Event} event - Событие отправки формы
   * @private
   */
  handleBatchFormSubmit(event) {
    event.preventDefault();
    
    // Получаем данные формы
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const files = formData.getAll('files');
    const ocrEngineId = formData.get('ocrEngine');
    const translationEngineId = formData.get('translationEngine');
    const sourceLanguage = formData.get('sourceLanguage');
    const targetLanguage = formData.get('targetLanguage');
    const autoStart = formData.has('autoStart');
    
    // Проверяем наличие файлов
    if (files.length === 0) {
      alert('Выберите хотя бы один файл');
      return;
    }
    
    // Создаем массив страниц
    const pages = Array.from(files).map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    }));
    
    // Создаем параметры OCR
    const ocrOptions = {
      engineId: ocrEngineId,
      language: sourceLanguage
    };
    
    // Создаем параметры перевода
    const translationOptions = {
      engineId: translationEngineId,
      sourceLanguage,
      targetLanguage
    };
    
    // Создаем пакетную задачу
    try {
      const batchId = this.batchProcessor.createBatch({
        name,
        pages,
        ocrOptions,
        translationOptions,
        autoStart
      });
      
      this.logger.info(`BatchProcessingIntegration: created batch ${batchId}`);
      
      // Скрываем форму
      this.batchFormContainer.style.display = 'none';
      
      // Обновляем список пакетных задач
      this.updateBatchList();
    } catch (error) {
      this.logger.error('BatchProcessingIntegration: error creating batch', error);
      alert(`Ошибка при создании пакетной задачи: ${error.message}`);
    }
  }
  
  /**
   * Обработчик отмены формы создания пакетной задачи
   * @private
   */
  handleBatchFormCancel() {
    // Скрываем форму
    this.batchFormContainer.style.display = 'none';
  }
  
  /**
   * Обновляет список пакетных задач
   * @private
   */
  updateBatchList() {
    if (!this.isRendered || !this.batchListContainer) {
      return;
    }
    
    // Очищаем контейнер списка
    this.batchListContainer.innerHTML = '';
    
    // Получаем список пакетных задач
    const batches = this.batchProcessor.getAllBatches();
    
    if (batches.length === 0) {
      // Если нет пакетных задач, показываем сообщение
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'Нет пакетных задач';
      this.batchListContainer.appendChild(emptyMessage);
      return;
    }
    
    // Создаем список пакетных задач
    const batchList = document.createElement('ul');
    batchList.className = 'batch-list';
    
    // Добавляем пакетные задачи в список
    batches.forEach(batch => {
      const batchItem = document.createElement('li');
      batchItem.className = `batch-item batch-status-${batch.status}`;
      batchItem.dataset.batchId = batch.id;
      
      // Создаем заголовок пакетной задачи
      const batchHeader = document.createElement('div');
      batchHeader.className = 'batch-header';
      
      const batchName = document.createElement('h3');
      batchName.className = 'batch-name';
      batchName.textContent = batch.name;
      batchHeader.appendChild(batchName);
      
      const batchStatus = document.createElement('span');
      batchStatus.className = 'batch-status';
      batchStatus.textContent = this.getStatusText(batch.status);
      batchHeader.appendChild(batchStatus);
      
      batchItem.appendChild(batchHeader);
      
      // Создаем информацию о пакетной задаче
      const batchInfo = document.createElement('div');
      batchInfo.className = 'batch-info';
      
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressBar.style.width = `${batch.progress}%`;
      progressContainer.appendChild(progressBar);
      
      const progressText = document.createElement('div');
      progressText.className = 'progress-text';
      progressText.textContent = `${Math.round(batch.progress)}%`;
      progressContainer.appendChild(progressText);
      
      batchInfo.appendChild(progressContainer);
      
      const tasksInfo = document.createElement('div');
      tasksInfo.className = 'tasks-info';
      tasksInfo.textContent = `Страниц: ${batch.completedTasks}/${batch.totalTasks}`;
      batchInfo.appendChild(tasksInfo);
      
      const timeInfo = document.createElement('div');
      timeInfo.className = 'time-info';
      
      if (batch.status === 'completed') {
        timeInfo.textContent = `Время выполнения: ${this.formatTime(batch.totalTime)}`;
      } else if (batch.status === 'processing' && batch.startTime) {
        const elapsedTime = Date.now() - batch.startTime;
        timeInfo.textContent = `Прошло времени: ${this.formatTime(elapsedTime)}`;
      }
      
      batchInfo.appendChild(timeInfo);
      
      batchItem.appendChild(batchInfo);
      
      // Создаем кнопки управления
      const batchControls = document.createElement('div');
      batchControls.className = 'batch-controls';
      
      if (batch.status === 'pending') {
        const startButton = document.createElement('button');
        startButton.className = 'start-button';
        startButton.textContent = 'Запустить';
        startButton.addEventListener('click', () => this.startBatch(batch.id));
        batchControls.appendChild(startButton);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => this.deleteBatch(batch.id));
        batchControls.appendChild(deleteButton);
      } else if (batch.status === 'processing') {
        const pauseButton = document.createElement('button');
        pauseButton.className = 'pause-button';
        pauseButton.textContent = 'Приостановить';
        pauseButton.addEventListener('click', () => this.pauseBatch(batch.id));
        batchControls.appendChild(pauseButton);
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Отменить';
        cancelButton.addEventListener('click', () => this.cancelBatch(batch.id));
        batchControls.appendChild(cancelButton);
      } else if (batch.status === 'paused') {
        const resumeButton = document.createElement('button');
        resumeButton.className = 'resume-button';
        resumeButton.textContent = 'Возобновить';
        resumeButton.addEventListener('click', () => this.resumeBatch(batch.id));
        batchControls.appendChild(resumeButton);
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Отменить';
        cancelButton.addEventListener('click', () => this.cancelBatch(batch.id));
        batchControls.appendChild(cancelButton);
      } else if (batch.status === 'completed' || batch.status === 'cancelled') {
        const viewButton = document.createElement('button');
        viewButton.className = 'view-button';
        viewButton.textContent = 'Просмотреть';
        viewButton.addEventListener('click', () => this.viewBatchResults(batch.id));
        batchControls.appendChild(viewButton);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => this.deleteBatch(batch.id));
        batchControls.appendChild(deleteButton);
      }
      
      batchItem.appendChild(batchControls);
      
      batchList.appendChild(batchItem);
    });
    
    this.batchListContainer.appendChild(batchList);
  }
  
  /**
   * Запускает пакетную задачу
   * @param {string} batchId - ID пакетной задачи
   * @private
   */
  startBatch(batchId) {
    try {
      const success = this.batchProcessor.processBatch(batchId);
      
      if (!success) {
        this.logger.warn(`BatchProcessingIntegration: failed to start batch ${batchId}`);
        alert('Не удалось запустить пакетную задачу');
      }
    } catch (error) {
      this.logger.error(`BatchProcessingIntegration: error starting batch ${batchId}`, error);
      alert(`Ошибка при запуске пакетной задачи: ${error.message}`);
    }
  }
  
  /**
   * Приостанавливает пакетную задачу
   * @param {string} batchId - ID пакетной задачи
   * @private
   */
  pauseBatch(batchId) {
    try {
      const success = this.batchProcessor.pauseCurrentBatch();
      
      if (!success) {
        this.logger.warn(`BatchProcessingIntegration: failed to pause batch ${batchId}`);
        alert('Не удалось приостановить пакетную задачу');
      }
    } catch (error) {
      this.logger.error(`BatchProcessingIntegration: error pausing batch ${batchId}`, error);
      alert(`Ошибка при приостановке пакетной задачи: ${error.message}`);
    }
  }
  
  /**
   * Возобновляет пакетную задачу
   * @param {string} batchId - ID пакетной задачи
   * @private
   */
  resumeBatch(batchId) {
    try {
      const success = this.batchProcessor.resumeCurrentBatch();
      
      if (!success) {
        this.logger.warn(`BatchProcessingIntegration: failed to resume batch ${batchId}`);
        alert('Не удалось возобновить пакетную задачу');
      }
    } catch (error) {
      this.logger.error(`BatchProcessingIntegration: error resuming batch ${batchId}`, error);
      alert(`Ошибка при возобновлении пакетной задачи: ${error.message}`);
    }
  }
  
  /**
   * Отменяет пакетную задачу
   * @param {string} batchId - ID пакетной задачи
   * @private
   */
  cancelBatch(batchId) {
    try {
      const success = this.batchProcessor.cancelCurrentBatch();
      
      if (!success) {
        this.logger.warn(`BatchProcessingIntegration: failed to cancel batch ${batchId}`);
        alert('Не удалось отменить пакетную задачу');
      }
    } catch (error) {
      this.logger.error(`BatchProcessingIntegration: error cancelling batch ${batchId}`, error);
      alert(`Ошибка при отмене пакетной задачи: ${error.message}`);
    }
  }
  
  /**
   * Удаляет пакетную задачу
   * @param {string} batchId - ID пакетной задачи
   * @private
   */
  deleteBatch(batchId) {
    // Находим индекс пакетной задачи в очереди
    const batchIndex = this.batchProcessor.queue.findIndex(batch => batch.id === batchId);
    
    if (batchIndex === -1) {
      this.logger.warn(`BatchProcessingIntegration: batch ${batchId} not found`);
      alert('Пакетная задача не найдена');
      return;
    }
    
    // Проверяем, что задача не выполняется
    const batch = this.batchProcessor.queue[batchIndex];
    
    if (batch.status === 'processing') {
      this.logger.warn(`BatchProcessingIntegration: cannot delete processing batch ${batchId}`);
      alert('Нельзя удалить выполняющуюся пакетную задачу');
      return;
    }
    
    // Удаляем задачу из очереди
    this.batchProcessor.queue.splice(batchIndex, 1);
    
    // Обновляем список пакетных задач
    this.updateBatchList();
  }
  
  /**
   * Просматривает результаты пакетной задачи
   * @param {string} batchId - ID пакетной задачи
   * @private
   */
  viewBatchResults(batchId) {
    // Находим пакетную задачу в очереди
    const batch = this.batchProcessor.queue.find(batch => batch.id === batchId);
    
    if (!batch) {
      this.logger.warn(`BatchProcessingIntegration: batch ${batchId} not found`);
      alert('Пакетная задача не найдена');
      return;
    }
    
    // Отправляем событие о просмотре результатов
    this.eventEmitter.emit('batchResults:view', {
      batchId,
      batch
    });
  }
  
  /**
   * Обработчик события создания пакетной задачи
   * @param {Object} data - Данные о созданной пакетной задаче
   * @private
   */
  handleBatchCreated(data) {
    // Обновляем список пакетных задач
    this.updateBatchList();
  }
  
  /**
   * Обработчик события начала пакетной задачи
   * @param {Object} data - Данные о начале пакетной задачи
   * @private
   */
  handleBatchStart(data) {
    // Обновляем список пакетных задач
    this.updateBatchList();
  }
  
  /**
   * Обработчик события прогресса пакетной задачи
   * @param {Object} data - Данные о прогрессе пакетной задачи
   * @private
   */
  handleBatchProgress(data) {
    const { processId, progress } = data;
    
    // Находим элемент пакетной задачи
    const batchItem = this.batchListContainer?.querySelector(`[data-batch-id="${processId}"]`);
    
    if (!batchItem) {
      return;
    }
    
    // Обновляем прогресс-бар
    const progressBar = batchItem.querySelector('.progress-bar');
    const progressText = batchItem.querySelector('.progress-text');
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
    
    // Обновляем информацию о задачах
    const tasksInfo = batchItem.querySelector('.tasks-info');
    
    if (tasksInfo) {
      const batch = this.batchProcessor.getBatchInfo(processId);
      
      if (batch) {
        tasksInfo.textContent = `Страниц: ${batch.completedTasks}/${batch.totalTasks}`;
      }
    }
    
    // Обновляем информацию о времени
    const timeInfo = batchItem.querySelector('.time-info');
    
    if (timeInfo) {
      const batch = this.batchProcessor.getBatchInfo(processId);
      
      if (batch && batch.startTime) {
        const elapsedTime = Date.now() - batch.startTime;
        timeInfo.textContent = `Прошло времени: ${this.formatTime(elapsedTime)}`;
      }
    }
  }
  
  /**
   * Обработчик события завершения пакетной задачи
   * @param {Object} data - Данные о завершении пакетной задачи
   * @private
   */
  handleBatchComplete(data) {
    // Обновляем список пакетных задач
    this.updateBatchList();
  }
  
  /**
   * Обработчик события ошибки пакетной задачи
   * @param {Object} data - Данные об ошибке пакетной задачи
   * @private
   */
  handleBatchError(data) {
    // Если ошибка фатальная, обновляем список пакетных задач
    if (data.isFatal) {
      this.updateBatchList();
    }
  }
  
  /**
   * Обработчик события приостановки пакетной задачи
   * @param {Object} data - Данные о приостановке пакетной задачи
   * @private
   */
  handleBatchPaused(data) {
    // Обновляем список пакетных задач
    this.updateBatchList();
  }
  
  /**
   * Обработчик события возобновления пакетной задачи
   * @param {Object} data - Данные о возобновлении пакетной задачи
   * @private
   */
  handleBatchResumed(data) {
    // Обновляем список пакетных задач
    this.updateBatchList();
  }
  
  /**
   * Обработчик события отмены пакетной задачи
   * @param {Object} data - Данные об отмене пакетной задачи
   * @private
   */
  handleBatchCancelled(data) {
    // Обновляем список пакетных задач
    this.updateBatchList();
  }
  
  /**
   * Обработчик события завершения задачи
   * @param {Object} data - Данные о завершении задачи
   * @private
   */
  handleTaskComplete(data) {
    // Обновляем информацию о задачах
    const batchItem = this.batchListContainer?.querySelector(`[data-batch-id="${data.batchId}"]`);
    
    if (!batchItem) {
      return;
    }
    
    const tasksInfo = batchItem.querySelector('.tasks-info');
    
    if (tasksInfo) {
      const batch = this.batchProcessor.getBatchInfo(data.batchId);
      
      if (batch) {
        tasksInfo.textContent = `Страниц: ${batch.completedTasks}/${batch.totalTasks}`;
      }
    }
  }
  
  /**
   * Возвращает текстовое представление статуса
   * @param {string} status - Статус
   * @returns {string} Текстовое представление статуса
   * @private
   */
  getStatusText(status) {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'processing':
        return 'Выполняется';
      case 'paused':
        return 'Приостановлено';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  }
  
  /**
   * Форматирует время в миллисекундах в читаемый формат
   * @param {number} ms - Время в миллисекундах
   * @returns {string} Отформатированное время
   * @private
   */
  formatTime(ms) {
    if (!ms) {
      return '0:00';
    }
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }
  }
  
  /**
   * Возвращает список доступных движков OCR
   * @returns {Array<Object>} Список движков OCR
   * @private
   */
  getAvailableOCREngines() {
    // В реальном приложении здесь будет запрос к системе OCR
    return [
      { id: 'tesseract', name: 'Tesseract OCR' },
      { id: 'google-vision', name: 'Google Vision API' },
      { id: 'azure-ocr', name: 'Microsoft Azure OCR' },
      { id: 'manga-ocr', name: 'MangaOCR' },
      { id: 'custom', name: 'Пользовательский OCR' }
    ];
  }
  
  /**
   * Возвращает список доступных движков перевода
   * @returns {Array<Object>} Список движков перевода
   * @private
   */
  getAvailableTranslationEngines() {
    // В реальном приложении здесь будет запрос к системе перевода
    return [
      { id: 'google-translate', name: 'Google Translate' },
      { id: 'microsoft-translator', name: 'Microsoft Translator' },
      { id: 'deepl', name: 'DeepL' },
      { id: 'yandex-translate', name: 'Yandex Translate' },
      { id: 'manga-translator', name: 'MangaTranslator' },
      { id: 'custom', name: 'Пользовательский переводчик' }
    ];
  }
  
  /**
   * Возвращает список доступных языков
   * @returns {Array<Object>} Список языков
   * @private
   */
  getAvailableLanguages() {
    return [
      { code: 'ja', name: 'Японский' },
      { code: 'en', name: 'Английский' },
      { code: 'ru', name: 'Русский' },
      { code: 'zh', name: 'Китайский' },
      { code: 'ko', name: 'Корейский' },
      { code: 'fr', name: 'Французский' },
      { code: 'de', name: 'Немецкий' },
      { code: 'es', name: 'Испанский' },
      { code: 'it', name: 'Итальянский' },
      { code: 'pt', name: 'Португальский' }
    ];
  }
  
  /**
   * Уничтожает интеграцию процессора пакетной обработки и освобождает ресурсы
   */
  destroy() {
    this.logger.info('BatchProcessingIntegration: destroying');
    
    // Отписываемся от событий
    this.eventEmitter.off('batch:created', this.handleBatchCreated);
    this.eventEmitter.off('batch:start', this.handleBatchStart);
    this.eventEmitter.off('batch:progress', this.handleBatchProgress);
    this.eventEmitter.off('batch:complete', this.handleBatchComplete);
    this.eventEmitter.off('batch:error', this.handleBatchError);
    this.eventEmitter.off('batch:paused', this.handleBatchPaused);
    this.eventEmitter.off('batch:resumed', this.handleBatchResumed);
    this.eventEmitter.off('batch:cancelled', this.handleBatchCancelled);
    this.eventEmitter.off('task:complete', this.handleTaskComplete);
    
    // Удаляем обработчики событий
    if (this.isRendered) {
      if (this.createBatchButton) {
        this.createBatchButton.removeEventListener('click', this.handleCreateBatchClick);
      }
      
      const form = this.batchFormContainer?.querySelector('form');
      if (form) {
        form.removeEventListener('submit', this.handleBatchFormSubmit);
      }
      
      const cancelButton = this.batchFormContainer?.querySelector('.cancel-button');
      if (cancelButton) {
        cancelButton.removeEventListener('click', this.handleBatchFormCancel);
      }
    }
    
    // Уничтожаем процессор пакетной обработки
    this.batchProcessor.destroy();
    
    // Очищаем контейнер
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.isInitialized = false;
    this.isRendered = false;
    
    this.logger.info('BatchProcessingIntegration: destroyed');
  }
}

module.exports = BatchProcessingIntegration;
