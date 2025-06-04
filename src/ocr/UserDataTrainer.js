/**
 * @file UserDataTrainer.js
 * @description Модуль для обучения на пользовательских данных
 * @module ocr/UserDataTrainer
 */

/**
 * Класс для обучения моделей OCR и перевода на пользовательских данных
 */
class UserDataTrainer {
  /**
   * Создает экземпляр тренера на пользовательских данных
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация
   * @param {Object} options.ocrEngine - Движок OCR
   * @param {Object} options.translationEngine - Движок перевода
   * @param {Object} options.dataManager - Менеджер данных
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
    this.dataManager = options.dataManager;
    
    // Состояние тренера
    this.isInitialized = false;
    this.isTraining = false;
    this.isPaused = false;
    this.isCancelled = false;
    
    // Текущая тренировочная сессия
    this.currentSessionId = null;
    this.currentDatasetId = null;
    this.currentModelType = null; // 'ocr' или 'translation'
    
    // Статистика
    this.stats = {
      totalSessions: 0,
      completedSessions: 0,
      failedSessions: 0,
      totalOCRSessions: 0,
      totalTranslationSessions: 0,
      totalTrainingTime: 0,
      averageAccuracy: 0,
      lastSessionAccuracy: 0
    };
    
    // Привязка методов к контексту
    this.trainOCRModel = this.trainOCRModel.bind(this);
    this.trainTranslationModel = this.trainTranslationModel.bind(this);
    this.handleTrainingProgress = this.handleTrainingProgress.bind(this);
    this.handleTrainingComplete = this.handleTrainingComplete.bind(this);
    this.handleTrainingError = this.handleTrainingError.bind(this);
    this.handlePauseRequest = this.handlePauseRequest.bind(this);
    this.handleResumeRequest = this.handleResumeRequest.bind(this);
    this.handleCancelRequest = this.handleCancelRequest.bind(this);
  }
  
  /**
   * Инициализирует тренера на пользовательских данных
   * @returns {UserDataTrainer} Экземпляр тренера
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('UserDataTrainer: already initialized');
      return this;
    }
    
    this.logger.info('UserDataTrainer: initializing');
    
    // Проверяем наличие необходимых компонентов
    if (!this.ocrEngine) {
      this.logger.error('UserDataTrainer: OCR engine is required');
      throw new Error('OCR engine is required');
    }
    
    if (!this.translationEngine) {
      this.logger.error('UserDataTrainer: Translation engine is required');
      throw new Error('Translation engine is required');
    }
    
    if (!this.dataManager) {
      this.logger.error('UserDataTrainer: Data manager is required');
      throw new Error('Data manager is required');
    }
    
    // Проверяем поддержку обучения
    if (!this.ocrEngine.supportsTraining) {
      this.logger.warn('UserDataTrainer: OCR engine does not support training');
    }
    
    if (!this.translationEngine.supportsTraining) {
      this.logger.warn('UserDataTrainer: Translation engine does not support training');
    }
    
    // Подписываемся на события
    this.eventEmitter.on('training:pause', this.handlePauseRequest);
    this.eventEmitter.on('training:resume', this.handleResumeRequest);
    this.eventEmitter.on('training:cancel', this.handleCancelRequest);
    
    this.isInitialized = true;
    this.eventEmitter.emit('userDataTrainer:initialized');
    
    return this;
  }
  
  /**
   * Создает новый набор данных для обучения
   * @param {Object} options - Параметры набора данных
   * @param {string} options.name - Название набора данных
   * @param {string} options.type - Тип набора данных ('ocr' или 'translation')
   * @param {Array<Object>} options.samples - Образцы данных
   * @returns {string} ID созданного набора данных
   */
  createDataset(options = {}) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    const { name, type, samples } = options;
    
    if (!name) {
      this.logger.error('UserDataTrainer: dataset name is required');
      throw new Error('Dataset name is required');
    }
    
    if (!type || (type !== 'ocr' && type !== 'translation')) {
      this.logger.error('UserDataTrainer: dataset type must be "ocr" or "translation"');
      throw new Error('Dataset type must be "ocr" or "translation"');
    }
    
    if (!Array.isArray(samples) || samples.length === 0) {
      this.logger.error('UserDataTrainer: samples array is required and must not be empty');
      throw new Error('Samples array is required and must not be empty');
    }
    
    // Проверяем формат образцов
    if (type === 'ocr') {
      for (const sample of samples) {
        if (!sample.image || !sample.text) {
          this.logger.error('UserDataTrainer: OCR samples must have image and text properties');
          throw new Error('OCR samples must have image and text properties');
        }
      }
    } else if (type === 'translation') {
      for (const sample of samples) {
        if (!sample.sourceText || !sample.targetText) {
          this.logger.error('UserDataTrainer: Translation samples must have sourceText and targetText properties');
          throw new Error('Translation samples must have sourceText and targetText properties');
        }
      }
    }
    
    // Создаем набор данных
    try {
      const datasetId = this.dataManager.createDataset({
        name,
        type,
        samples,
        createdAt: Date.now()
      });
      
      this.logger.info(`UserDataTrainer: created dataset ${datasetId} with ${samples.length} samples`);
      
      // Отправляем событие о создании набора данных
      this.eventEmitter.emit('dataset:created', {
        datasetId,
        name,
        type,
        samplesCount: samples.length
      });
      
      return datasetId;
    } catch (error) {
      this.logger.error('UserDataTrainer: error creating dataset', error);
      throw error;
    }
  }
  
  /**
   * Добавляет образцы в существующий набор данных
   * @param {string} datasetId - ID набора данных
   * @param {Array<Object>} samples - Образцы данных
   * @returns {number} Новое количество образцов в наборе данных
   */
  addSamplesToDataset(datasetId, samples) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataTrainer: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    if (!Array.isArray(samples) || samples.length === 0) {
      this.logger.error('UserDataTrainer: samples array is required and must not be empty');
      throw new Error('Samples array is required and must not be empty');
    }
    
    // Получаем набор данных
    const dataset = this.dataManager.getDataset(datasetId);
    
    if (!dataset) {
      this.logger.error(`UserDataTrainer: dataset ${datasetId} not found`);
      throw new Error(`Dataset ${datasetId} not found`);
    }
    
    // Проверяем формат образцов
    if (dataset.type === 'ocr') {
      for (const sample of samples) {
        if (!sample.image || !sample.text) {
          this.logger.error('UserDataTrainer: OCR samples must have image and text properties');
          throw new Error('OCR samples must have image and text properties');
        }
      }
    } else if (dataset.type === 'translation') {
      for (const sample of samples) {
        if (!sample.sourceText || !sample.targetText) {
          this.logger.error('UserDataTrainer: Translation samples must have sourceText and targetText properties');
          throw new Error('Translation samples must have sourceText and targetText properties');
        }
      }
    }
    
    // Добавляем образцы
    try {
      const newCount = this.dataManager.addSamplesToDataset(datasetId, samples);
      
      this.logger.info(`UserDataTrainer: added ${samples.length} samples to dataset ${datasetId}, new count: ${newCount}`);
      
      // Отправляем событие о добавлении образцов
      this.eventEmitter.emit('dataset:samplesAdded', {
        datasetId,
        addedCount: samples.length,
        totalCount: newCount
      });
      
      return newCount;
    } catch (error) {
      this.logger.error(`UserDataTrainer: error adding samples to dataset ${datasetId}`, error);
      throw error;
    }
  }
  
  /**
   * Удаляет образцы из набора данных
   * @param {string} datasetId - ID набора данных
   * @param {Array<string>} sampleIds - ID образцов для удаления
   * @returns {number} Новое количество образцов в наборе данных
   */
  removeSamplesFromDataset(datasetId, sampleIds) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataTrainer: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    if (!Array.isArray(sampleIds) || sampleIds.length === 0) {
      this.logger.error('UserDataTrainer: sampleIds array is required and must not be empty');
      throw new Error('sampleIds array is required and must not be empty');
    }
    
    // Удаляем образцы
    try {
      const newCount = this.dataManager.removeSamplesFromDataset(datasetId, sampleIds);
      
      this.logger.info(`UserDataTrainer: removed ${sampleIds.length} samples from dataset ${datasetId}, new count: ${newCount}`);
      
      // Отправляем событие об удалении образцов
      this.eventEmitter.emit('dataset:samplesRemoved', {
        datasetId,
        removedCount: sampleIds.length,
        totalCount: newCount
      });
      
      return newCount;
    } catch (error) {
      this.logger.error(`UserDataTrainer: error removing samples from dataset ${datasetId}`, error);
      throw error;
    }
  }
  
  /**
   * Удаляет набор данных
   * @param {string} datasetId - ID набора данных
   * @returns {boolean} Успешность удаления
   */
  deleteDataset(datasetId) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataTrainer: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    // Удаляем набор данных
    try {
      const success = this.dataManager.deleteDataset(datasetId);
      
      if (success) {
        this.logger.info(`UserDataTrainer: deleted dataset ${datasetId}`);
        
        // Отправляем событие об удалении набора данных
        this.eventEmitter.emit('dataset:deleted', {
          datasetId
        });
      } else {
        this.logger.warn(`UserDataTrainer: failed to delete dataset ${datasetId}`);
      }
      
      return success;
    } catch (error) {
      this.logger.error(`UserDataTrainer: error deleting dataset ${datasetId}`, error);
      throw error;
    }
  }
  
  /**
   * Получает список всех наборов данных
   * @param {string} [type] - Тип наборов данных для фильтрации ('ocr' или 'translation')
   * @returns {Array<Object>} Список наборов данных
   */
  getAllDatasets(type) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    try {
      const datasets = this.dataManager.getAllDatasets();
      
      if (type) {
        return datasets.filter(dataset => dataset.type === type);
      }
      
      return datasets;
    } catch (error) {
      this.logger.error('UserDataTrainer: error getting datasets', error);
      throw error;
    }
  }
  
  /**
   * Получает информацию о наборе данных
   * @param {string} datasetId - ID набора данных
   * @returns {Object|null} Информация о наборе данных или null, если набор не найден
   */
  getDatasetInfo(datasetId) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataTrainer: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    try {
      const dataset = this.dataManager.getDataset(datasetId);
      
      if (!dataset) {
        return null;
      }
      
      // Возвращаем информацию о наборе данных без образцов
      return {
        id: dataset.id,
        name: dataset.name,
        type: dataset.type,
        samplesCount: dataset.samples.length,
        createdAt: dataset.createdAt,
        lastModified: dataset.lastModified || dataset.createdAt
      };
    } catch (error) {
      this.logger.error(`UserDataTrainer: error getting dataset ${datasetId}`, error);
      throw error;
    }
  }
  
  /**
   * Получает образцы из набора данных
   * @param {string} datasetId - ID набора данных
   * @param {number} [offset=0] - Смещение для пагинации
   * @param {number} [limit=100] - Лимит для пагинации
   * @returns {Array<Object>} Список образцов
   */
  getDatasetSamples(datasetId, offset = 0, limit = 100) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataTrainer: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    try {
      const dataset = this.dataManager.getDataset(datasetId);
      
      if (!dataset) {
        this.logger.error(`UserDataTrainer: dataset ${datasetId} not found`);
        throw new Error(`Dataset ${datasetId} not found`);
      }
      
      // Возвращаем образцы с пагинацией
      return dataset.samples.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error(`UserDataTrainer: error getting samples from dataset ${datasetId}`, error);
      throw error;
    }
  }
  
  /**
   * Обучает модель OCR на пользовательских данных
   * @param {Object} options - Параметры обучения
   * @param {string} options.datasetId - ID набора данных
   * @param {string} options.modelName - Название модели
   * @param {Object} options.trainingOptions - Параметры обучения
   * @returns {string} ID тренировочной сессии
   */
  trainOCRModel(options = {}) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (this.isTraining) {
      this.logger.error('UserDataTrainer: already training');
      throw new Error('Already training');
    }
    
    const { datasetId, modelName, trainingOptions } = options;
    
    if (!datasetId) {
      this.logger.error('UserDataTrainer: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    if (!modelName) {
      this.logger.error('UserDataTrainer: modelName is required');
      throw new Error('modelName is required');
    }
    
    // Проверяем поддержку обучения
    if (!this.ocrEngine.supportsTraining) {
      this.logger.error('UserDataTrainer: OCR engine does not support training');
      throw new Error('OCR engine does not support training');
    }
    
    // Получаем набор данных
    const dataset = this.dataManager.getDataset(datasetId);
    
    if (!dataset) {
      this.logger.error(`UserDataTrainer: dataset ${datasetId} not found`);
      throw new Error(`Dataset ${datasetId} not found`);
    }
    
    if (dataset.type !== 'ocr') {
      this.logger.error(`UserDataTrainer: dataset ${datasetId} is not an OCR dataset`);
      throw new Error(`Dataset ${datasetId} is not an OCR dataset`);
    }
    
    if (dataset.samples.length === 0) {
      this.logger.error(`UserDataTrainer: dataset ${datasetId} has no samples`);
      throw new Error(`Dataset ${datasetId} has no samples`);
    }
    
    // Создаем ID тренировочной сессии
    const sessionId = `ocr-training-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Обновляем состояние
    this.isTraining = true;
    this.isPaused = false;
    this.isCancelled = false;
    this.currentSessionId = sessionId;
    this.currentDatasetId = datasetId;
    this.currentModelType = 'ocr';
    
    // Обновляем статистику
    this.stats.totalSessions++;
    this.stats.totalOCRSessions++;
    
    // Отправляем событие о начале обучения
    this.eventEmitter.emit('training:start', {
      sessionId,
      modelType: 'ocr',
      datasetId,
      modelName,
      samplesCount: dataset.samples.length,
      estimatedTime: this.estimateTrainingTime('ocr', dataset.samples.length)
    });
    
    // Запускаем обучение
    const startTime = Date.now();
    
    try {
      this.ocrEngine.trainModel({
        modelName,
        samples: dataset.samples,
        options: trainingOptions,
        onProgress: (progress) => {
          if (this.isCancelled) {
            return false; // Отменяем обучение
          }
          
          this.handleTrainingProgress(sessionId, progress);
          return !this.isPaused; // Приостанавливаем обучение, если isPaused === true
        }
      })
        .then(result => {
          const endTime = Date.now();
          const trainingTime = endTime - startTime;
          
          this.handleTrainingComplete(sessionId, result, trainingTime);
        })
        .catch(error => {
          this.handleTrainingError(sessionId, error);
        });
      
      return sessionId;
    } catch (error) {
      this.isTraining = false;
      this.currentSessionId = null;
      this.currentDatasetId = null;
      this.currentModelType = null;
      
      this.logger.error(`UserDataTrainer: error starting OCR training session ${sessionId}`, error);
      throw error;
    }
  }
  
  /**
   * Обучает модель перевода на пользовательских данных
   * @param {Object} options - Параметры обучения
   * @param {string} options.datasetId - ID набора данных
   * @param {string} options.modelName - Название модели
   * @param {Object} options.trainingOptions - Параметры обучения
   * @returns {string} ID тренировочной сессии
   */
  trainTranslationModel(options = {}) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (this.isTraining) {
      this.logger.error('UserDataTrainer: already training');
      throw new Error('Already training');
    }
    
    const { datasetId, modelName, trainingOptions } = options;
    
    if (!datasetId) {
      this.logger.error('UserDataTrainer: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    if (!modelName) {
      this.logger.error('UserDataTrainer: modelName is required');
      throw new Error('modelName is required');
    }
    
    // Проверяем поддержку обучения
    if (!this.translationEngine.supportsTraining) {
      this.logger.error('UserDataTrainer: Translation engine does not support training');
      throw new Error('Translation engine does not support training');
    }
    
    // Получаем набор данных
    const dataset = this.dataManager.getDataset(datasetId);
    
    if (!dataset) {
      this.logger.error(`UserDataTrainer: dataset ${datasetId} not found`);
      throw new Error(`Dataset ${datasetId} not found`);
    }
    
    if (dataset.type !== 'translation') {
      this.logger.error(`UserDataTrainer: dataset ${datasetId} is not a translation dataset`);
      throw new Error(`Dataset ${datasetId} is not a translation dataset`);
    }
    
    if (dataset.samples.length === 0) {
      this.logger.error(`UserDataTrainer: dataset ${datasetId} has no samples`);
      throw new Error(`Dataset ${datasetId} has no samples`);
    }
    
    // Создаем ID тренировочной сессии
    const sessionId = `translation-training-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Обновляем состояние
    this.isTraining = true;
    this.isPaused = false;
    this.isCancelled = false;
    this.currentSessionId = sessionId;
    this.currentDatasetId = datasetId;
    this.currentModelType = 'translation';
    
    // Обновляем статистику
    this.stats.totalSessions++;
    this.stats.totalTranslationSessions++;
    
    // Отправляем событие о начале обучения
    this.eventEmitter.emit('training:start', {
      sessionId,
      modelType: 'translation',
      datasetId,
      modelName,
      samplesCount: dataset.samples.length,
      estimatedTime: this.estimateTrainingTime('translation', dataset.samples.length)
    });
    
    // Запускаем обучение
    const startTime = Date.now();
    
    try {
      this.translationEngine.trainModel({
        modelName,
        samples: dataset.samples,
        options: trainingOptions,
        onProgress: (progress) => {
          if (this.isCancelled) {
            return false; // Отменяем обучение
          }
          
          this.handleTrainingProgress(sessionId, progress);
          return !this.isPaused; // Приостанавливаем обучение, если isPaused === true
        }
      })
        .then(result => {
          const endTime = Date.now();
          const trainingTime = endTime - startTime;
          
          this.handleTrainingComplete(sessionId, result, trainingTime);
        })
        .catch(error => {
          this.handleTrainingError(sessionId, error);
        });
      
      return sessionId;
    } catch (error) {
      this.isTraining = false;
      this.currentSessionId = null;
      this.currentDatasetId = null;
      this.currentModelType = null;
      
      this.logger.error(`UserDataTrainer: error starting translation training session ${sessionId}`, error);
      throw error;
    }
  }
  
  /**
   * Обработчик прогресса обучения
   * @param {string} sessionId - ID тренировочной сессии
   * @param {Object} progress - Информация о прогрессе
   * @private
   */
  handleTrainingProgress(sessionId, progress) {
    if (sessionId !== this.currentSessionId) {
      return;
    }
    
    const { epoch, totalEpochs, loss, accuracy, step, totalSteps } = progress;
    
    // Отправляем событие о прогрессе обучения
    this.eventEmitter.emit('training:progress', {
      sessionId,
      modelType: this.currentModelType,
      datasetId: this.currentDatasetId,
      progress: {
        epoch,
        totalEpochs,
        loss,
        accuracy,
        step,
        totalSteps,
        percentage: totalEpochs > 0 ? (epoch / totalEpochs) * 100 : (step / totalSteps) * 100
      }
    });
  }
  
  /**
   * Обработчик завершения обучения
   * @param {string} sessionId - ID тренировочной сессии
   * @param {Object} result - Результат обучения
   * @param {number} trainingTime - Время обучения в миллисекундах
   * @private
   */
  handleTrainingComplete(sessionId, result, trainingTime) {
    if (sessionId !== this.currentSessionId) {
      return;
    }
    
    // Обновляем состояние
    this.isTraining = false;
    this.isPaused = false;
    this.isCancelled = false;
    
    // Обновляем статистику
    this.stats.completedSessions++;
    this.stats.totalTrainingTime += trainingTime;
    this.stats.lastSessionAccuracy = result.accuracy || 0;
    
    // Обновляем среднюю точность
    const totalAccuracy = this.stats.averageAccuracy * (this.stats.completedSessions - 1) + this.stats.lastSessionAccuracy;
    this.stats.averageAccuracy = totalAccuracy / this.stats.completedSessions;
    
    // Отправляем событие о завершении обучения
    this.eventEmitter.emit('training:complete', {
      sessionId,
      modelType: this.currentModelType,
      datasetId: this.currentDatasetId,
      result: {
        modelName: result.modelName,
        accuracy: result.accuracy,
        loss: result.loss,
        epochs: result.epochs,
        trainingTime
      }
    });
    
    // Сбрасываем текущую сессию
    this.currentSessionId = null;
    this.currentDatasetId = null;
    this.currentModelType = null;
    
    this.logger.info(`UserDataTrainer: training session ${sessionId} completed in ${trainingTime}ms with accuracy ${result.accuracy}`);
  }
  
  /**
   * Обработчик ошибки обучения
   * @param {string} sessionId - ID тренировочной сессии
   * @param {Error} error - Ошибка
   * @private
   */
  handleTrainingError(sessionId, error) {
    if (sessionId !== this.currentSessionId) {
      return;
    }
    
    // Обновляем состояние
    this.isTraining = false;
    this.isPaused = false;
    this.isCancelled = false;
    
    // Обновляем статистику
    this.stats.failedSessions++;
    
    // Отправляем событие об ошибке обучения
    this.eventEmitter.emit('training:error', {
      sessionId,
      modelType: this.currentModelType,
      datasetId: this.currentDatasetId,
      error: error.message
    });
    
    // Сбрасываем текущую сессию
    this.currentSessionId = null;
    this.currentDatasetId = null;
    this.currentModelType = null;
    
    this.logger.error(`UserDataTrainer: training session ${sessionId} failed`, error);
  }
  
  /**
   * Приостанавливает текущую тренировочную сессию
   * @returns {boolean} Успешность приостановки
   */
  pauseCurrentSession() {
    if (!this.isTraining) {
      this.logger.warn('UserDataTrainer: no training session is currently running');
      return false;
    }
    
    if (this.isPaused) {
      this.logger.warn('UserDataTrainer: already paused');
      return false;
    }
    
    // Устанавливаем флаг приостановки
    this.isPaused = true;
    
    this.logger.info(`UserDataTrainer: paused training session ${this.currentSessionId}`);
    
    // Отправляем событие о приостановке обучения
    this.eventEmitter.emit('training:paused', {
      sessionId: this.currentSessionId,
      modelType: this.currentModelType,
      datasetId: this.currentDatasetId
    });
    
    return true;
  }
  
  /**
   * Возобновляет текущую тренировочную сессию
   * @returns {boolean} Успешность возобновления
   */
  resumeCurrentSession() {
    if (!this.isTraining) {
      this.logger.warn('UserDataTrainer: no training session is currently running');
      return false;
    }
    
    if (!this.isPaused) {
      this.logger.warn('UserDataTrainer: not paused');
      return false;
    }
    
    // Сбрасываем флаг приостановки
    this.isPaused = false;
    
    this.logger.info(`UserDataTrainer: resumed training session ${this.currentSessionId}`);
    
    // Отправляем событие о возобновлении обучения
    this.eventEmitter.emit('training:resumed', {
      sessionId: this.currentSessionId,
      modelType: this.currentModelType,
      datasetId: this.currentDatasetId
    });
    
    return true;
  }
  
  /**
   * Отменяет текущую тренировочную сессию
   * @returns {boolean} Успешность отмены
   */
  cancelCurrentSession() {
    if (!this.isTraining) {
      this.logger.warn('UserDataTrainer: no training session is currently running');
      return false;
    }
    
    // Устанавливаем флаг отмены
    this.isCancelled = true;
    
    this.logger.info(`UserDataTrainer: cancelling training session ${this.currentSessionId}`);
    
    // Отправляем событие об отмене обучения
    this.eventEmitter.emit('training:cancelled', {
      sessionId: this.currentSessionId,
      modelType: this.currentModelType,
      datasetId: this.currentDatasetId
    });
    
    return true;
  }
  
  /**
   * Обработчик запроса на приостановку обучения
   * @param {Object} data - Данные запроса
   * @private
   */
  handlePauseRequest(data) {
    const { sessionId } = data;
    
    if (sessionId !== this.currentSessionId) {
      return;
    }
    
    this.pauseCurrentSession();
  }
  
  /**
   * Обработчик запроса на возобновление обучения
   * @param {Object} data - Данные запроса
   * @private
   */
  handleResumeRequest(data) {
    const { sessionId } = data;
    
    if (sessionId !== this.currentSessionId) {
      return;
    }
    
    this.resumeCurrentSession();
  }
  
  /**
   * Обработчик запроса на отмену обучения
   * @param {Object} data - Данные запроса
   * @private
   */
  handleCancelRequest(data) {
    const { sessionId } = data;
    
    if (sessionId !== this.currentSessionId) {
      return;
    }
    
    this.cancelCurrentSession();
  }
  
  /**
   * Оценивает время обучения
   * @param {string} modelType - Тип модели ('ocr' или 'translation')
   * @param {number} samplesCount - Количество образцов
   * @returns {number} Оценка времени в миллисекундах
   * @private
   */
  estimateTrainingTime(modelType, samplesCount) {
    // Приблизительные значения времени обучения на один образец
    const timePerSample = {
      ocr: 500, // 0.5 секунды на образец
      translation: 200 // 0.2 секунды на образец
    };
    
    return samplesCount * (timePerSample[modelType] || 300);
  }
  
  /**
   * Получает список доступных моделей
   * @param {string} [modelType] - Тип моделей для фильтрации ('ocr' или 'translation')
   * @returns {Array<Object>} Список моделей
   */
  getAvailableModels(modelType) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    try {
      let models = [];
      
      if (!modelType || modelType === 'ocr') {
        const ocrModels = this.ocrEngine.getAvailableModels();
        models = models.concat(ocrModels.map(model => ({ ...model, type: 'ocr' })));
      }
      
      if (!modelType || modelType === 'translation') {
        const translationModels = this.translationEngine.getAvailableModels();
        models = models.concat(translationModels.map(model => ({ ...model, type: 'translation' })));
      }
      
      return models;
    } catch (error) {
      this.logger.error('UserDataTrainer: error getting available models', error);
      throw error;
    }
  }
  
  /**
   * Экспортирует модель
   * @param {string} modelName - Название модели
   * @param {string} modelType - Тип модели ('ocr' или 'translation')
   * @param {string} format - Формат экспорта
   * @returns {Object} Результат экспорта
   */
  exportModel(modelName, modelType, format) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!modelName) {
      this.logger.error('UserDataTrainer: modelName is required');
      throw new Error('modelName is required');
    }
    
    if (!modelType || (modelType !== 'ocr' && modelType !== 'translation')) {
      this.logger.error('UserDataTrainer: modelType must be "ocr" or "translation"');
      throw new Error('modelType must be "ocr" or "translation"');
    }
    
    try {
      if (modelType === 'ocr') {
        return this.ocrEngine.exportModel(modelName, format);
      } else {
        return this.translationEngine.exportModel(modelName, format);
      }
    } catch (error) {
      this.logger.error(`UserDataTrainer: error exporting model ${modelName}`, error);
      throw error;
    }
  }
  
  /**
   * Импортирует модель
   * @param {string} modelName - Название модели
   * @param {string} modelType - Тип модели ('ocr' или 'translation')
   * @param {Object} modelData - Данные модели
   * @returns {boolean} Успешность импорта
   */
  importModel(modelName, modelType, modelData) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!modelName) {
      this.logger.error('UserDataTrainer: modelName is required');
      throw new Error('modelName is required');
    }
    
    if (!modelType || (modelType !== 'ocr' && modelType !== 'translation')) {
      this.logger.error('UserDataTrainer: modelType must be "ocr" or "translation"');
      throw new Error('modelType must be "ocr" or "translation"');
    }
    
    if (!modelData) {
      this.logger.error('UserDataTrainer: modelData is required');
      throw new Error('modelData is required');
    }
    
    try {
      if (modelType === 'ocr') {
        return this.ocrEngine.importModel(modelName, modelData);
      } else {
        return this.translationEngine.importModel(modelName, modelData);
      }
    } catch (error) {
      this.logger.error(`UserDataTrainer: error importing model ${modelName}`, error);
      throw error;
    }
  }
  
  /**
   * Удаляет модель
   * @param {string} modelName - Название модели
   * @param {string} modelType - Тип модели ('ocr' или 'translation')
   * @returns {boolean} Успешность удаления
   */
  deleteModel(modelName, modelType) {
    if (!this.isInitialized) {
      this.logger.error('UserDataTrainer: not initialized');
      throw new Error('UserDataTrainer not initialized');
    }
    
    if (!modelName) {
      this.logger.error('UserDataTrainer: modelName is required');
      throw new Error('modelName is required');
    }
    
    if (!modelType || (modelType !== 'ocr' && modelType !== 'translation')) {
      this.logger.error('UserDataTrainer: modelType must be "ocr" or "translation"');
      throw new Error('modelType must be "ocr" or "translation"');
    }
    
    try {
      if (modelType === 'ocr') {
        return this.ocrEngine.deleteModel(modelName);
      } else {
        return this.translationEngine.deleteModel(modelName);
      }
    } catch (error) {
      this.logger.error(`UserDataTrainer: error deleting model ${modelName}`, error);
      throw error;
    }
  }
  
  /**
   * Получает статистику обучения
   * @returns {Object} Статистика
   */
  getStats() {
    return { ...this.stats };
  }
  
  /**
   * Уничтожает тренера на пользовательских данных и освобождает ресурсы
   */
  destroy() {
    this.logger.info('UserDataTrainer: destroying');
    
    // Отменяем текущую сессию, если она есть
    if (this.isTraining) {
      this.cancelCurrentSession();
    }
    
    // Отписываемся от событий
    this.eventEmitter.off('training:pause', this.handlePauseRequest);
    this.eventEmitter.off('training:resume', this.handleResumeRequest);
    this.eventEmitter.off('training:cancel', this.handleCancelRequest);
    
    // Сбрасываем состояние
    this.isInitialized = false;
    this.isTraining = false;
    this.isPaused = false;
    this.isCancelled = false;
    this.currentSessionId = null;
    this.currentDatasetId = null;
    this.currentModelType = null;
    
    this.logger.info('UserDataTrainer: destroyed');
  }
}

module.exports = UserDataTrainer;
