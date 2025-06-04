/**
 * @file UserDataTrainingIntegration.js
 * @description Модуль для интеграции системы обучения на пользовательских данных
 * @module ocr/UserDataTrainingIntegration
 */

/**
 * Класс для интеграции системы обучения на пользовательских данных
 */
class UserDataTrainingIntegration {
  /**
   * Создает экземпляр интегратора системы обучения
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация
   * @param {Object} options.userDataTrainer - Тренер на пользовательских данных
   * @param {Object} options.userDataManager - Менеджер пользовательских данных
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
    this.userDataTrainer = options.userDataTrainer;
    this.userDataManager = options.userDataManager;
    this.ocrEngine = options.ocrEngine;
    this.translationEngine = options.translationEngine;
    this.uiManager = options.uiManager;
    
    // Состояние интегратора
    this.isInitialized = false;
    
    // Привязка методов к контексту
    this.handleDatasetCreated = this.handleDatasetCreated.bind(this);
    this.handleDatasetDeleted = this.handleDatasetDeleted.bind(this);
    this.handleSamplesAdded = this.handleSamplesAdded.bind(this);
    this.handleSamplesRemoved = this.handleSamplesRemoved.bind(this);
    this.handleTrainingStart = this.handleTrainingStart.bind(this);
    this.handleTrainingProgress = this.handleTrainingProgress.bind(this);
    this.handleTrainingComplete = this.handleTrainingComplete.bind(this);
    this.handleTrainingError = this.handleTrainingError.bind(this);
    this.handleTrainingPaused = this.handleTrainingPaused.bind(this);
    this.handleTrainingResumed = this.handleTrainingResumed.bind(this);
    this.handleTrainingCancelled = this.handleTrainingCancelled.bind(this);
    this.handleModelSaved = this.handleModelSaved.bind(this);
    this.handleModelDeleted = this.handleModelDeleted.bind(this);
    this.handleUICreateDatasetRequest = this.handleUICreateDatasetRequest.bind(this);
    this.handleUIDeleteDatasetRequest = this.handleUIDeleteDatasetRequest.bind(this);
    this.handleUIAddSamplesRequest = this.handleUIAddSamplesRequest.bind(this);
    this.handleUIRemoveSamplesRequest = this.handleUIRemoveSamplesRequest.bind(this);
    this.handleUITrainModelRequest = this.handleUITrainModelRequest.bind(this);
    this.handleUIPauseTrainingRequest = this.handleUIPauseTrainingRequest.bind(this);
    this.handleUIResumeTrainingRequest = this.handleUIResumeTrainingRequest.bind(this);
    this.handleUICancelTrainingRequest = this.handleUICancelTrainingRequest.bind(this);
    this.handleUIExportModelRequest = this.handleUIExportModelRequest.bind(this);
    this.handleUIImportModelRequest = this.handleUIImportModelRequest.bind(this);
    this.handleUIDeleteModelRequest = this.handleUIDeleteModelRequest.bind(this);
  }
  
  /**
   * Инициализирует интегратор системы обучения
   * @returns {UserDataTrainingIntegration} Экземпляр интегратора
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('UserDataTrainingIntegration: already initialized');
      return this;
    }
    
    this.logger.info('UserDataTrainingIntegration: initializing');
    
    // Проверяем наличие необходимых компонентов
    if (!this.userDataTrainer) {
      this.logger.error('UserDataTrainingIntegration: userDataTrainer is required');
      throw new Error('userDataTrainer is required');
    }
    
    if (!this.userDataManager) {
      this.logger.error('UserDataTrainingIntegration: userDataManager is required');
      throw new Error('userDataManager is required');
    }
    
    if (!this.ocrEngine) {
      this.logger.error('UserDataTrainingIntegration: ocrEngine is required');
      throw new Error('ocrEngine is required');
    }
    
    if (!this.translationEngine) {
      this.logger.error('UserDataTrainingIntegration: translationEngine is required');
      throw new Error('translationEngine is required');
    }
    
    if (!this.uiManager) {
      this.logger.error('UserDataTrainingIntegration: uiManager is required');
      throw new Error('uiManager is required');
    }
    
    // Подписываемся на события от UserDataTrainer и UserDataManager
    this.eventEmitter.on('dataset:created', this.handleDatasetCreated);
    this.eventEmitter.on('dataset:deleted', this.handleDatasetDeleted);
    this.eventEmitter.on('dataset:samplesAdded', this.handleSamplesAdded);
    this.eventEmitter.on('dataset:samplesRemoved', this.handleSamplesRemoved);
    this.eventEmitter.on('training:start', this.handleTrainingStart);
    this.eventEmitter.on('training:progress', this.handleTrainingProgress);
    this.eventEmitter.on('training:complete', this.handleTrainingComplete);
    this.eventEmitter.on('training:error', this.handleTrainingError);
    this.eventEmitter.on('training:paused', this.handleTrainingPaused);
    this.eventEmitter.on('training:resumed', this.handleTrainingResumed);
    this.eventEmitter.on('training:cancelled', this.handleTrainingCancelled);
    this.eventEmitter.on('model:saved', this.handleModelSaved);
    this.eventEmitter.on('model:deleted', this.handleModelDeleted);
    
    // Подписываемся на события от UI
    this.eventEmitter.on('ui:createDataset', this.handleUICreateDatasetRequest);
    this.eventEmitter.on('ui:deleteDataset', this.handleUIDeleteDatasetRequest);
    this.eventEmitter.on('ui:addSamples', this.handleUIAddSamplesRequest);
    this.eventEmitter.on('ui:removeSamples', this.handleUIRemoveSamplesRequest);
    this.eventEmitter.on('ui:trainModel', this.handleUITrainModelRequest);
    this.eventEmitter.on('ui:pauseTraining', this.handleUIPauseTrainingRequest);
    this.eventEmitter.on('ui:resumeTraining', this.handleUIResumeTrainingRequest);
    this.eventEmitter.on('ui:cancelTraining', this.handleUICancelTrainingRequest);
    this.eventEmitter.on('ui:exportModel', this.handleUIExportModelRequest);
    this.eventEmitter.on('ui:importModel', this.handleUIImportModelRequest);
    this.eventEmitter.on('ui:deleteModel', this.handleUIDeleteModelRequest);
    
    // Создаем элементы пользовательского интерфейса
    this.createUIComponents();
    
    this.isInitialized = true;
    this.eventEmitter.emit('userDataTrainingIntegration:initialized');
    
    return this;
  }
  
  /**
   * Создает компоненты пользовательского интерфейса
   * @private
   */
  createUIComponents() {
    // Создаем вкладку "Обучение" в пользовательском интерфейсе
    this.uiManager.createTab({
      id: 'training-tab',
      title: 'Обучение',
      icon: 'school',
      order: 5
    });
    
    // Создаем секцию "Наборы данных"
    this.uiManager.createSection({
      tabId: 'training-tab',
      id: 'datasets-section',
      title: 'Наборы данных',
      order: 1
    });
    
    // Создаем секцию "Обучение моделей"
    this.uiManager.createSection({
      tabId: 'training-tab',
      id: 'training-section',
      title: 'Обучение моделей',
      order: 2
    });
    
    // Создаем секцию "Модели"
    this.uiManager.createSection({
      tabId: 'training-tab',
      id: 'models-section',
      title: 'Модели',
      order: 3
    });
    
    // Создаем секцию "Статистика"
    this.uiManager.createSection({
      tabId: 'training-tab',
      id: 'stats-section',
      title: 'Статистика',
      order: 4
    });
    
    // Создаем компоненты для секции "Наборы данных"
    this.uiManager.createComponent({
      sectionId: 'datasets-section',
      id: 'datasets-list',
      type: 'list',
      title: 'Список наборов данных',
      data: this.userDataManager.getAllDatasets(),
      actions: [
        {
          id: 'create-dataset',
          label: 'Создать набор данных',
          icon: 'add',
          handler: () => {
            this.uiManager.showDialog({
              id: 'create-dataset-dialog',
              title: 'Создание набора данных',
              fields: [
                {
                  id: 'name',
                  label: 'Название',
                  type: 'text',
                  required: true
                },
                {
                  id: 'type',
                  label: 'Тип',
                  type: 'select',
                  options: [
                    { value: 'ocr', label: 'OCR' },
                    { value: 'translation', label: 'Перевод' }
                  ],
                  required: true
                }
              ],
              buttons: [
                {
                  id: 'cancel',
                  label: 'Отмена',
                  action: 'close'
                },
                {
                  id: 'create',
                  label: 'Создать',
                  action: 'submit',
                  primary: true
                }
              ],
              onSubmit: (data) => {
                this.eventEmitter.emit('ui:createDataset', data);
              }
            });
          }
        }
      ],
      itemActions: [
        {
          id: 'view-dataset',
          label: 'Просмотр',
          icon: 'visibility',
          handler: (item) => {
            this.showDatasetDetails(item.id);
          }
        },
        {
          id: 'add-samples',
          label: 'Добавить образцы',
          icon: 'add_photo_alternate',
          handler: (item) => {
            this.showAddSamplesDialog(item.id, item.type);
          }
        },
        {
          id: 'delete-dataset',
          label: 'Удалить',
          icon: 'delete',
          handler: (item) => {
            this.uiManager.showConfirmDialog({
              title: 'Удаление набора данных',
              message: `Вы уверены, что хотите удалить набор данных "${item.name}"?`,
              onConfirm: () => {
                this.eventEmitter.emit('ui:deleteDataset', { datasetId: item.id });
              }
            });
          }
        }
      ]
    });
    
    // Создаем компоненты для секции "Обучение моделей"
    this.uiManager.createComponent({
      sectionId: 'training-section',
      id: 'training-form',
      type: 'form',
      title: 'Параметры обучения',
      fields: [
        {
          id: 'modelType',
          label: 'Тип модели',
          type: 'select',
          options: [
            { value: 'ocr', label: 'OCR' },
            { value: 'translation', label: 'Перевод' }
          ],
          required: true
        },
        {
          id: 'datasetId',
          label: 'Набор данных',
          type: 'select',
          options: this.userDataManager.getAllDatasets().map(dataset => ({
            value: dataset.id,
            label: dataset.name,
            group: dataset.type === 'ocr' ? 'OCR' : 'Перевод'
          })),
          required: true,
          dependsOn: 'modelType',
          updateOptions: (value) => {
            return this.userDataManager.getAllDatasets()
              .filter(dataset => dataset.type === value)
              .map(dataset => ({
                value: dataset.id,
                label: dataset.name
              }));
          }
        },
        {
          id: 'modelName',
          label: 'Название модели',
          type: 'text',
          required: true
        },
        {
          id: 'epochs',
          label: 'Количество эпох',
          type: 'number',
          min: 1,
          max: 100,
          default: 10
        },
        {
          id: 'batchSize',
          label: 'Размер батча',
          type: 'number',
          min: 1,
          max: 128,
          default: 32
        },
        {
          id: 'learningRate',
          label: 'Скорость обучения',
          type: 'number',
          min: 0.0001,
          max: 0.1,
          step: 0.0001,
          default: 0.001
        }
      ],
      buttons: [
        {
          id: 'train',
          label: 'Начать обучение',
          primary: true,
          handler: (data) => {
            this.eventEmitter.emit('ui:trainModel', {
              modelType: data.modelType,
              datasetId: data.datasetId,
              modelName: data.modelName,
              trainingOptions: {
                epochs: data.epochs,
                batchSize: data.batchSize,
                learningRate: data.learningRate
              }
            });
          }
        }
      ]
    });
    
    this.uiManager.createComponent({
      sectionId: 'training-section',
      id: 'training-progress',
      type: 'progress',
      title: 'Прогресс обучения',
      visible: false,
      progress: 0,
      status: '',
      actions: [
        {
          id: 'pause-training',
          label: 'Приостановить',
          icon: 'pause',
          handler: () => {
            this.eventEmitter.emit('ui:pauseTraining');
          }
        },
        {
          id: 'resume-training',
          label: 'Возобновить',
          icon: 'play_arrow',
          visible: false,
          handler: () => {
            this.eventEmitter.emit('ui:resumeTraining');
          }
        },
        {
          id: 'cancel-training',
          label: 'Отменить',
          icon: 'cancel',
          handler: () => {
            this.eventEmitter.emit('ui:cancelTraining');
          }
        }
      ]
    });
    
    // Создаем компоненты для секции "Модели"
    this.uiManager.createComponent({
      sectionId: 'models-section',
      id: 'models-list',
      type: 'list',
      title: 'Список моделей',
      data: this.userDataManager.getAllModels(),
      actions: [
        {
          id: 'import-model',
          label: 'Импортировать модель',
          icon: 'upload',
          handler: () => {
            this.uiManager.showDialog({
              id: 'import-model-dialog',
              title: 'Импорт модели',
              fields: [
                {
                  id: 'name',
                  label: 'Название',
                  type: 'text',
                  required: true
                },
                {
                  id: 'type',
                  label: 'Тип',
                  type: 'select',
                  options: [
                    { value: 'ocr', label: 'OCR' },
                    { value: 'translation', label: 'Перевод' }
                  ],
                  required: true
                },
                {
                  id: 'file',
                  label: 'Файл модели',
                  type: 'file',
                  accept: '.json,.bin',
                  required: true
                }
              ],
              buttons: [
                {
                  id: 'cancel',
                  label: 'Отмена',
                  action: 'close'
                },
                {
                  id: 'import',
                  label: 'Импортировать',
                  action: 'submit',
                  primary: true
                }
              ],
              onSubmit: (data) => {
                this.eventEmitter.emit('ui:importModel', data);
              }
            });
          }
        }
      ],
      itemActions: [
        {
          id: 'export-model',
          label: 'Экспортировать',
          icon: 'download',
          handler: (item) => {
            this.uiManager.showDialog({
              id: 'export-model-dialog',
              title: 'Экспорт модели',
              fields: [
                {
                  id: 'format',
                  label: 'Формат',
                  type: 'select',
                  options: [
                    { value: 'json', label: 'JSON' },
                    { value: 'binary', label: 'Бинарный' }
                  ],
                  required: true
                }
              ],
              buttons: [
                {
                  id: 'cancel',
                  label: 'Отмена',
                  action: 'close'
                },
                {
                  id: 'export',
                  label: 'Экспортировать',
                  action: 'submit',
                  primary: true
                }
              ],
              onSubmit: (data) => {
                this.eventEmitter.emit('ui:exportModel', {
                  modelId: item.id,
                  format: data.format
                });
              }
            });
          }
        },
        {
          id: 'delete-model',
          label: 'Удалить',
          icon: 'delete',
          handler: (item) => {
            this.uiManager.showConfirmDialog({
              title: 'Удаление модели',
              message: `Вы уверены, что хотите удалить модель "${item.name}"?`,
              onConfirm: () => {
                this.eventEmitter.emit('ui:deleteModel', { modelId: item.id });
              }
            });
          }
        }
      ]
    });
    
    // Создаем компоненты для секции "Статистика"
    this.uiManager.createComponent({
      sectionId: 'stats-section',
      id: 'training-stats',
      type: 'stats',
      title: 'Статистика обучения',
      data: this.userDataTrainer.getStats()
    });
  }
  
  /**
   * Показывает детали набора данных
   * @param {string} datasetId - ID набора данных
   * @private
   */
  showDatasetDetails(datasetId) {
    const dataset = this.userDataManager.getDataset(datasetId);
    
    if (!dataset) {
      this.logger.error(`UserDataTrainingIntegration: dataset ${datasetId} not found`);
      return;
    }
    
    this.uiManager.showDialog({
      id: 'dataset-details-dialog',
      title: `Набор данных: ${dataset.name}`,
      content: {
        type: 'dataset-viewer',
        data: dataset
      },
      size: 'large',
      buttons: [
        {
          id: 'close',
          label: 'Закрыть',
          action: 'close'
        },
        {
          id: 'add-samples',
          label: 'Добавить образцы',
          action: 'custom',
          handler: () => {
            this.showAddSamplesDialog(datasetId, dataset.type);
          }
        }
      ]
    });
  }
  
  /**
   * Показывает диалог добавления образцов
   * @param {string} datasetId - ID набора данных
   * @param {string} datasetType - Тип набора данных
   * @private
   */
  showAddSamplesDialog(datasetId, datasetType) {
    const fields = datasetType === 'ocr' ? [
      {
        id: 'images',
        label: 'Изображения',
        type: 'file',
        accept: 'image/*',
        multiple: true,
        required: true
      },
      {
        id: 'autoDetect',
        label: 'Автоматически распознать текст',
        type: 'checkbox',
        default: true
      }
    ] : [
      {
        id: 'sourceTexts',
        label: 'Исходные тексты',
        type: 'textarea',
        required: true,
        placeholder: 'Введите исходные тексты, каждый с новой строки'
      },
      {
        id: 'targetTexts',
        label: 'Переведенные тексты',
        type: 'textarea',
        required: true,
        placeholder: 'Введите переведенные тексты, каждый с новой строки'
      }
    ];
    
    this.uiManager.showDialog({
      id: 'add-samples-dialog',
      title: 'Добавление образцов',
      fields,
      buttons: [
        {
          id: 'cancel',
          label: 'Отмена',
          action: 'close'
        },
        {
          id: 'add',
          label: 'Добавить',
          action: 'submit',
          primary: true
        }
      ],
      onSubmit: (data) => {
        this.eventEmitter.emit('ui:addSamples', {
          datasetId,
          datasetType,
          ...data
        });
      }
    });
  }
  
  /**
   * Обработчик события создания набора данных
   * @param {Object} data - Данные события
   * @private
   */
  handleDatasetCreated(data) {
    const { datasetId, name, type, samplesCount } = data;
    
    // Обновляем список наборов данных в UI
    this.uiManager.updateComponent('datasets-list', {
      data: this.userDataManager.getAllDatasets()
    });
    
    // Обновляем список наборов данных в форме обучения
    this.uiManager.updateComponentField('training-form', 'datasetId', {
      options: this.userDataManager.getAllDatasets().map(dataset => ({
        value: dataset.id,
        label: dataset.name,
        group: dataset.type === 'ocr' ? 'OCR' : 'Перевод'
      }))
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'success',
      message: `Набор данных "${name}" успешно создан`,
      duration: 3000
    });
  }
  
  /**
   * Обработчик события удаления набора данных
   * @param {Object} data - Данные события
   * @private
   */
  handleDatasetDeleted(data) {
    const { datasetId } = data;
    
    // Обновляем список наборов данных в UI
    this.uiManager.updateComponent('datasets-list', {
      data: this.userDataManager.getAllDatasets()
    });
    
    // Обновляем список наборов данных в форме обучения
    this.uiManager.updateComponentField('training-form', 'datasetId', {
      options: this.userDataManager.getAllDatasets().map(dataset => ({
        value: dataset.id,
        label: dataset.name,
        group: dataset.type === 'ocr' ? 'OCR' : 'Перевод'
      }))
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'info',
      message: 'Набор данных успешно удален',
      duration: 3000
    });
  }
  
  /**
   * Обработчик события добавления образцов
   * @param {Object} data - Данные события
   * @private
   */
  handleSamplesAdded(data) {
    const { datasetId, addedCount, totalCount } = data;
    
    // Обновляем список наборов данных в UI
    this.uiManager.updateComponent('datasets-list', {
      data: this.userDataManager.getAllDatasets()
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'success',
      message: `Добавлено ${addedCount} образцов, всего: ${totalCount}`,
      duration: 3000
    });
  }
  
  /**
   * Обработчик события удаления образцов
   * @param {Object} data - Данные события
   * @private
   */
  handleSamplesRemoved(data) {
    const { datasetId, removedCount, totalCount } = data;
    
    // Обновляем список наборов данных в UI
    this.uiManager.updateComponent('datasets-list', {
      data: this.userDataManager.getAllDatasets()
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'info',
      message: `Удалено ${removedCount} образцов, осталось: ${totalCount}`,
      duration: 3000
    });
  }
  
  /**
   * Обработчик события начала обучения
   * @param {Object} data - Данные события
   * @private
   */
  handleTrainingStart(data) {
    const { sessionId, modelType, datasetId, modelName, samplesCount, estimatedTime } = data;
    
    // Показываем компонент прогресса
    this.uiManager.updateComponent('training-progress', {
      visible: true,
      progress: 0,
      status: `Начало обучения модели "${modelName}" (${samplesCount} образцов)`,
      data: {
        sessionId,
        modelType,
        datasetId,
        modelName,
        samplesCount,
        estimatedTime,
        startTime: Date.now()
      }
    });
    
    // Скрываем кнопку возобновления и показываем кнопку приостановки
    this.uiManager.updateComponentAction('training-progress', 'pause-training', { visible: true });
    this.uiManager.updateComponentAction('training-progress', 'resume-training', { visible: false });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'info',
      message: `Начато обучение модели "${modelName}"`,
      duration: 3000
    });
  }
  
  /**
   * Обработчик события прогресса обучения
   * @param {Object} data - Данные события
   * @private
   */
  handleTrainingProgress(data) {
    const { sessionId, modelType, datasetId, progress } = data;
    
    // Обновляем компонент прогресса
    this.uiManager.updateComponent('training-progress', {
      progress: progress.percentage,
      status: `Обучение: эпоха ${progress.epoch}/${progress.totalEpochs}, точность: ${(progress.accuracy * 100).toFixed(2)}%, потери: ${progress.loss.toFixed(4)}`
    });
  }
  
  /**
   * Обработчик события завершения обучения
   * @param {Object} data - Данные события
   * @private
   */
  handleTrainingComplete(data) {
    const { sessionId, modelType, datasetId, result } = data;
    
    // Скрываем компонент прогресса
    this.uiManager.updateComponent('training-progress', {
      visible: false
    });
    
    // Обновляем список моделей
    this.uiManager.updateComponent('models-list', {
      data: this.userDataManager.getAllModels()
    });
    
    // Обновляем статистику
    this.uiManager.updateComponent('training-stats', {
      data: this.userDataTrainer.getStats()
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'success',
      message: `Обучение модели "${result.modelName}" завершено с точностью ${(result.accuracy * 100).toFixed(2)}%`,
      duration: 5000
    });
    
    // Показываем диалог с результатами
    this.uiManager.showDialog({
      id: 'training-results-dialog',
      title: 'Результаты обучения',
      content: {
        type: 'training-results',
        data: {
          modelName: result.modelName,
          accuracy: result.accuracy,
          loss: result.loss,
          epochs: result.epochs,
          trainingTime: result.trainingTime
        }
      },
      buttons: [
        {
          id: 'close',
          label: 'Закрыть',
          action: 'close'
        }
      ]
    });
  }
  
  /**
   * Обработчик события ошибки обучения
   * @param {Object} data - Данные события
   * @private
   */
  handleTrainingError(data) {
    const { sessionId, modelType, datasetId, error } = data;
    
    // Скрываем компонент прогресса
    this.uiManager.updateComponent('training-progress', {
      visible: false
    });
    
    // Обновляем статистику
    this.uiManager.updateComponent('training-stats', {
      data: this.userDataTrainer.getStats()
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'error',
      message: `Ошибка обучения: ${error}`,
      duration: 5000
    });
  }
  
  /**
   * Обработчик события приостановки обучения
   * @param {Object} data - Данные события
   * @private
   */
  handleTrainingPaused(data) {
    const { sessionId, modelType, datasetId } = data;
    
    // Обновляем статус компонента прогресса
    this.uiManager.updateComponent('training-progress', {
      status: 'Обучение приостановлено'
    });
    
    // Скрываем кнопку приостановки и показываем кнопку возобновления
    this.uiManager.updateComponentAction('training-progress', 'pause-training', { visible: false });
    this.uiManager.updateComponentAction('training-progress', 'resume-training', { visible: true });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'info',
      message: 'Обучение приостановлено',
      duration: 3000
    });
  }
  
  /**
   * Обработчик события возобновления обучения
   * @param {Object} data - Данные события
   * @private
   */
  handleTrainingResumed(data) {
    const { sessionId, modelType, datasetId } = data;
    
    // Обновляем статус компонента прогресса
    this.uiManager.updateComponent('training-progress', {
      status: 'Обучение возобновлено'
    });
    
    // Скрываем кнопку возобновления и показываем кнопку приостановки
    this.uiManager.updateComponentAction('training-progress', 'pause-training', { visible: true });
    this.uiManager.updateComponentAction('training-progress', 'resume-training', { visible: false });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'info',
      message: 'Обучение возобновлено',
      duration: 3000
    });
  }
  
  /**
   * Обработчик события отмены обучения
   * @param {Object} data - Данные события
   * @private
   */
  handleTrainingCancelled(data) {
    const { sessionId, modelType, datasetId } = data;
    
    // Скрываем компонент прогресса
    this.uiManager.updateComponent('training-progress', {
      visible: false
    });
    
    // Обновляем статистику
    this.uiManager.updateComponent('training-stats', {
      data: this.userDataTrainer.getStats()
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'info',
      message: 'Обучение отменено',
      duration: 3000
    });
  }
  
  /**
   * Обработчик события сохранения модели
   * @param {Object} data - Данные события
   * @private
   */
  handleModelSaved(data) {
    const { modelId, name, type } = data;
    
    // Обновляем список моделей
    this.uiManager.updateComponent('models-list', {
      data: this.userDataManager.getAllModels()
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'success',
      message: `Модель "${name}" успешно сохранена`,
      duration: 3000
    });
  }
  
  /**
   * Обработчик события удаления модели
   * @param {Object} data - Данные события
   * @private
   */
  handleModelDeleted(data) {
    const { modelId } = data;
    
    // Обновляем список моделей
    this.uiManager.updateComponent('models-list', {
      data: this.userDataManager.getAllModels()
    });
    
    // Показываем уведомление
    this.uiManager.showNotification({
      type: 'info',
      message: 'Модель успешно удалена',
      duration: 3000
    });
  }
  
  /**
   * Обработчик запроса на создание набора данных
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUICreateDatasetRequest(data) {
    const { name, type } = data;
    
    try {
      this.userDataManager.createDataset({
        name,
        type,
        samples: []
      });
    } catch (error) {
      this.logger.error('UserDataTrainingIntegration: error creating dataset', error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка создания набора данных: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на удаление набора данных
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUIDeleteDatasetRequest(data) {
    const { datasetId } = data;
    
    try {
      this.userDataManager.deleteDataset(datasetId);
    } catch (error) {
      this.logger.error(`UserDataTrainingIntegration: error deleting dataset ${datasetId}`, error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка удаления набора данных: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на добавление образцов
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUIAddSamplesRequest(data) {
    const { datasetId, datasetType } = data;
    
    try {
      let samples = [];
      
      if (datasetType === 'ocr') {
        const { images, autoDetect } = data;
        
        // Обработка изображений
        for (const image of images) {
          let text = '';
          
          if (autoDetect) {
            // Распознаем текст на изображении
            text = this.ocrEngine.recognizeText(image);
          }
          
          samples.push({
            id: `sample-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            image,
            text
          });
        }
      } else {
        const { sourceTexts, targetTexts } = data;
        
        // Разбиваем тексты на строки
        const sourceLines = sourceTexts.split('\n').filter(line => line.trim());
        const targetLines = targetTexts.split('\n').filter(line => line.trim());
        
        // Проверяем, что количество строк совпадает
        if (sourceLines.length !== targetLines.length) {
          throw new Error('Количество исходных и переведенных текстов не совпадает');
        }
        
        // Создаем образцы
        for (let i = 0; i < sourceLines.length; i++) {
          samples.push({
            id: `sample-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`,
            sourceText: sourceLines[i],
            targetText: targetLines[i]
          });
        }
      }
      
      // Добавляем образцы в набор данных
      this.userDataManager.addSamplesToDataset(datasetId, samples);
    } catch (error) {
      this.logger.error(`UserDataTrainingIntegration: error adding samples to dataset ${datasetId}`, error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка добавления образцов: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на удаление образцов
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUIRemoveSamplesRequest(data) {
    const { datasetId, sampleIds } = data;
    
    try {
      this.userDataManager.removeSamplesFromDataset(datasetId, sampleIds);
    } catch (error) {
      this.logger.error(`UserDataTrainingIntegration: error removing samples from dataset ${datasetId}`, error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка удаления образцов: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на обучение модели
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUITrainModelRequest(data) {
    const { modelType, datasetId, modelName, trainingOptions } = data;
    
    try {
      if (modelType === 'ocr') {
        this.userDataTrainer.trainOCRModel({
          datasetId,
          modelName,
          trainingOptions
        });
      } else {
        this.userDataTrainer.trainTranslationModel({
          datasetId,
          modelName,
          trainingOptions
        });
      }
    } catch (error) {
      this.logger.error('UserDataTrainingIntegration: error starting training', error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка запуска обучения: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на приостановку обучения
   * @private
   */
  handleUIPauseTrainingRequest() {
    try {
      this.userDataTrainer.pauseCurrentSession();
    } catch (error) {
      this.logger.error('UserDataTrainingIntegration: error pausing training', error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка приостановки обучения: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на возобновление обучения
   * @private
   */
  handleUIResumeTrainingRequest() {
    try {
      this.userDataTrainer.resumeCurrentSession();
    } catch (error) {
      this.logger.error('UserDataTrainingIntegration: error resuming training', error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка возобновления обучения: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на отмену обучения
   * @private
   */
  handleUICancelTrainingRequest() {
    try {
      this.userDataTrainer.cancelCurrentSession();
    } catch (error) {
      this.logger.error('UserDataTrainingIntegration: error cancelling training', error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка отмены обучения: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на экспорт модели
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUIExportModelRequest(data) {
    const { modelId, format } = data;
    
    try {
      const model = this.userDataManager.getModel(modelId);
      
      if (!model) {
        throw new Error(`Модель ${modelId} не найдена`);
      }
      
      const exportedModel = this.userDataTrainer.exportModel(model.name, model.type, format);
      
      // Скачиваем модель
      this.uiManager.downloadFile({
        data: exportedModel,
        filename: `${model.name}.${format === 'json' ? 'json' : 'bin'}`,
        mimeType: format === 'json' ? 'application/json' : 'application/octet-stream'
      });
    } catch (error) {
      this.logger.error(`UserDataTrainingIntegration: error exporting model ${modelId}`, error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка экспорта модели: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на импорт модели
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUIImportModelRequest(data) {
    const { name, type, file } = data;
    
    try {
      // Читаем файл
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const modelData = event.target.result;
          
          // Импортируем модель
          const success = this.userDataTrainer.importModel(name, type, modelData);
          
          if (success) {
            // Сохраняем модель
            this.userDataManager.saveModel({
              name,
              type,
              data: modelData,
              metadata: {
                imported: true,
                importedAt: Date.now()
              }
            });
            
            this.uiManager.showNotification({
              type: 'success',
              message: `Модель "${name}" успешно импортирована`,
              duration: 3000
            });
          } else {
            this.uiManager.showNotification({
              type: 'error',
              message: 'Ошибка импорта модели',
              duration: 5000
            });
          }
        } catch (error) {
          this.logger.error('UserDataTrainingIntegration: error importing model', error);
          
          this.uiManager.showNotification({
            type: 'error',
            message: `Ошибка импорта модели: ${error.message}`,
            duration: 5000
          });
        }
      };
      
      reader.onerror = () => {
        this.uiManager.showNotification({
          type: 'error',
          message: 'Ошибка чтения файла',
          duration: 5000
        });
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      this.logger.error('UserDataTrainingIntegration: error importing model', error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка импорта модели: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Обработчик запроса на удаление модели
   * @param {Object} data - Данные запроса
   * @private
   */
  handleUIDeleteModelRequest(data) {
    const { modelId } = data;
    
    try {
      const model = this.userDataManager.getModel(modelId);
      
      if (!model) {
        throw new Error(`Модель ${modelId} не найдена`);
      }
      
      // Удаляем модель из движка
      const success = this.userDataTrainer.deleteModel(model.name, model.type);
      
      if (success) {
        // Удаляем модель из хранилища
        this.userDataManager.deleteModel(modelId);
      } else {
        this.uiManager.showNotification({
          type: 'error',
          message: 'Ошибка удаления модели',
          duration: 5000
        });
      }
    } catch (error) {
      this.logger.error(`UserDataTrainingIntegration: error deleting model ${modelId}`, error);
      
      this.uiManager.showNotification({
        type: 'error',
        message: `Ошибка удаления модели: ${error.message}`,
        duration: 5000
      });
    }
  }
  
  /**
   * Уничтожает интегратор системы обучения и освобождает ресурсы
   */
  destroy() {
    this.logger.info('UserDataTrainingIntegration: destroying');
    
    // Отписываемся от событий от UserDataTrainer и UserDataManager
    this.eventEmitter.off('dataset:created', this.handleDatasetCreated);
    this.eventEmitter.off('dataset:deleted', this.handleDatasetDeleted);
    this.eventEmitter.off('dataset:samplesAdded', this.handleSamplesAdded);
    this.eventEmitter.off('dataset:samplesRemoved', this.handleSamplesRemoved);
    this.eventEmitter.off('training:start', this.handleTrainingStart);
    this.eventEmitter.off('training:progress', this.handleTrainingProgress);
    this.eventEmitter.off('training:complete', this.handleTrainingComplete);
    this.eventEmitter.off('training:error', this.handleTrainingError);
    this.eventEmitter.off('training:paused', this.handleTrainingPaused);
    this.eventEmitter.off('training:resumed', this.handleTrainingResumed);
    this.eventEmitter.off('training:cancelled', this.handleTrainingCancelled);
    this.eventEmitter.off('model:saved', this.handleModelSaved);
    this.eventEmitter.off('model:deleted', this.handleModelDeleted);
    
    // Отписываемся от событий от UI
    this.eventEmitter.off('ui:createDataset', this.handleUICreateDatasetRequest);
    this.eventEmitter.off('ui:deleteDataset', this.handleUIDeleteDatasetRequest);
    this.eventEmitter.off('ui:addSamples', this.handleUIAddSamplesRequest);
    this.eventEmitter.off('ui:removeSamples', this.handleUIRemoveSamplesRequest);
    this.eventEmitter.off('ui:trainModel', this.handleUITrainModelRequest);
    this.eventEmitter.off('ui:pauseTraining', this.handleUIPauseTrainingRequest);
    this.eventEmitter.off('ui:resumeTraining', this.handleUIResumeTrainingRequest);
    this.eventEmitter.off('ui:cancelTraining', this.handleUICancelTrainingRequest);
    this.eventEmitter.off('ui:exportModel', this.handleUIExportModelRequest);
    this.eventEmitter.off('ui:importModel', this.handleUIImportModelRequest);
    this.eventEmitter.off('ui:deleteModel', this.handleUIDeleteModelRequest);
    
    // Удаляем компоненты пользовательского интерфейса
    this.uiManager.removeTab('training-tab');
    
    // Сбрасываем состояние
    this.isInitialized = false;
    
    this.logger.info('UserDataTrainingIntegration: destroyed');
  }
}

module.exports = UserDataTrainingIntegration;
