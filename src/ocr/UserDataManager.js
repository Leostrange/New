/**
 * @file UserDataManager.js
 * @description Модуль для управления пользовательскими данными для обучения
 * @module ocr/UserDataManager
 */

/**
 * Класс для управления пользовательскими данными для обучения
 */
class UserDataManager {
  /**
   * Создает экземпляр менеджера пользовательских данных
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.storage - Система хранения данных
   * @param {Object} options.config - Конфигурация
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.storage = options.storage;
    this.config = options.config || {};
    
    // Состояние менеджера
    this.isInitialized = false;
    
    // Данные
    this.datasets = new Map();
    this.models = new Map();
    
    // Привязка методов к контексту
    this.createDataset = this.createDataset.bind(this);
    this.getDataset = this.getDataset.bind(this);
    this.getAllDatasets = this.getAllDatasets.bind(this);
    this.updateDataset = this.updateDataset.bind(this);
    this.deleteDataset = this.deleteDataset.bind(this);
    this.addSamplesToDataset = this.addSamplesToDataset.bind(this);
    this.removeSamplesFromDataset = this.removeSamplesFromDataset.bind(this);
    this.saveModel = this.saveModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.getAllModels = this.getAllModels.bind(this);
    this.deleteModel = this.deleteModel.bind(this);
  }
  
  /**
   * Инициализирует менеджер пользовательских данных
   * @returns {UserDataManager} Экземпляр менеджера
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('UserDataManager: already initialized');
      return this;
    }
    
    this.logger.info('UserDataManager: initializing');
    
    // Проверяем наличие необходимых компонентов
    if (!this.storage) {
      this.logger.error('UserDataManager: storage is required');
      throw new Error('Storage is required');
    }
    
    // Загружаем данные из хранилища
    try {
      this.loadDataFromStorage();
    } catch (error) {
      this.logger.error('UserDataManager: error loading data from storage', error);
      throw error;
    }
    
    this.isInitialized = true;
    this.eventEmitter.emit('userDataManager:initialized');
    
    return this;
  }
  
  /**
   * Загружает данные из хранилища
   * @private
   */
  loadDataFromStorage() {
    // Загружаем наборы данных
    const datasetsData = this.storage.get('datasets') || [];
    
    for (const datasetData of datasetsData) {
      this.datasets.set(datasetData.id, datasetData);
    }
    
    this.logger.info(`UserDataManager: loaded ${this.datasets.size} datasets from storage`);
    
    // Загружаем модели
    const modelsData = this.storage.get('models') || [];
    
    for (const modelData of modelsData) {
      this.models.set(modelData.id, modelData);
    }
    
    this.logger.info(`UserDataManager: loaded ${this.models.size} models from storage`);
  }
  
  /**
   * Сохраняет данные в хранилище
   * @private
   */
  saveDataToStorage() {
    // Сохраняем наборы данных
    const datasetsData = Array.from(this.datasets.values());
    this.storage.set('datasets', datasetsData);
    
    // Сохраняем модели
    const modelsData = Array.from(this.models.values());
    this.storage.set('models', modelsData);
    
    this.logger.info('UserDataManager: saved data to storage');
  }
  
  /**
   * Создает новый набор данных
   * @param {Object} datasetData - Данные набора данных
   * @returns {string} ID созданного набора данных
   */
  createDataset(datasetData) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    const { name, type, samples } = datasetData;
    
    if (!name) {
      this.logger.error('UserDataManager: dataset name is required');
      throw new Error('Dataset name is required');
    }
    
    if (!type || (type !== 'ocr' && type !== 'translation')) {
      this.logger.error('UserDataManager: dataset type must be "ocr" or "translation"');
      throw new Error('Dataset type must be "ocr" or "translation"');
    }
    
    if (!Array.isArray(samples)) {
      this.logger.error('UserDataManager: samples must be an array');
      throw new Error('Samples must be an array');
    }
    
    // Создаем ID набора данных
    const datasetId = `dataset-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Создаем набор данных
    const dataset = {
      id: datasetId,
      name,
      type,
      samples: [...samples],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    // Добавляем набор данных
    this.datasets.set(datasetId, dataset);
    
    // Сохраняем данные
    this.saveDataToStorage();
    
    this.logger.info(`UserDataManager: created dataset ${datasetId} with ${samples.length} samples`);
    
    // Отправляем событие о создании набора данных
    this.eventEmitter.emit('dataset:created', {
      datasetId,
      name,
      type,
      samplesCount: samples.length
    });
    
    return datasetId;
  }
  
  /**
   * Получает набор данных по ID
   * @param {string} datasetId - ID набора данных
   * @returns {Object|null} Набор данных или null, если набор не найден
   */
  getDataset(datasetId) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataManager: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    const dataset = this.datasets.get(datasetId);
    
    if (!dataset) {
      return null;
    }
    
    return { ...dataset };
  }
  
  /**
   * Получает список всех наборов данных
   * @returns {Array<Object>} Список наборов данных
   */
  getAllDatasets() {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    return Array.from(this.datasets.values()).map(dataset => ({ ...dataset }));
  }
  
  /**
   * Обновляет набор данных
   * @param {string} datasetId - ID набора данных
   * @param {Object} datasetData - Новые данные набора данных
   * @returns {boolean} Успешность обновления
   */
  updateDataset(datasetId, datasetData) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataManager: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    const dataset = this.datasets.get(datasetId);
    
    if (!dataset) {
      this.logger.error(`UserDataManager: dataset ${datasetId} not found`);
      return false;
    }
    
    // Обновляем набор данных
    const updatedDataset = {
      ...dataset,
      ...datasetData,
      id: datasetId, // Не позволяем изменить ID
      lastModified: Date.now()
    };
    
    this.datasets.set(datasetId, updatedDataset);
    
    // Сохраняем данные
    this.saveDataToStorage();
    
    this.logger.info(`UserDataManager: updated dataset ${datasetId}`);
    
    // Отправляем событие об обновлении набора данных
    this.eventEmitter.emit('dataset:updated', {
      datasetId,
      name: updatedDataset.name,
      type: updatedDataset.type,
      samplesCount: updatedDataset.samples.length
    });
    
    return true;
  }
  
  /**
   * Удаляет набор данных
   * @param {string} datasetId - ID набора данных
   * @returns {boolean} Успешность удаления
   */
  deleteDataset(datasetId) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataManager: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    if (!this.datasets.has(datasetId)) {
      this.logger.error(`UserDataManager: dataset ${datasetId} not found`);
      return false;
    }
    
    // Удаляем набор данных
    this.datasets.delete(datasetId);
    
    // Сохраняем данные
    this.saveDataToStorage();
    
    this.logger.info(`UserDataManager: deleted dataset ${datasetId}`);
    
    // Отправляем событие об удалении набора данных
    this.eventEmitter.emit('dataset:deleted', {
      datasetId
    });
    
    return true;
  }
  
  /**
   * Добавляет образцы в набор данных
   * @param {string} datasetId - ID набора данных
   * @param {Array<Object>} samples - Образцы для добавления
   * @returns {number} Новое количество образцов в наборе данных
   */
  addSamplesToDataset(datasetId, samples) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataManager: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    if (!Array.isArray(samples) || samples.length === 0) {
      this.logger.error('UserDataManager: samples must be a non-empty array');
      throw new Error('Samples must be a non-empty array');
    }
    
    const dataset = this.datasets.get(datasetId);
    
    if (!dataset) {
      this.logger.error(`UserDataManager: dataset ${datasetId} not found`);
      throw new Error(`Dataset ${datasetId} not found`);
    }
    
    // Добавляем образцы
    dataset.samples = [...dataset.samples, ...samples];
    dataset.lastModified = Date.now();
    
    // Сохраняем данные
    this.saveDataToStorage();
    
    this.logger.info(`UserDataManager: added ${samples.length} samples to dataset ${datasetId}, new count: ${dataset.samples.length}`);
    
    // Отправляем событие о добавлении образцов
    this.eventEmitter.emit('dataset:samplesAdded', {
      datasetId,
      addedCount: samples.length,
      totalCount: dataset.samples.length
    });
    
    return dataset.samples.length;
  }
  
  /**
   * Удаляет образцы из набора данных
   * @param {string} datasetId - ID набора данных
   * @param {Array<string>} sampleIds - ID образцов для удаления
   * @returns {number} Новое количество образцов в наборе данных
   */
  removeSamplesFromDataset(datasetId, sampleIds) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    if (!datasetId) {
      this.logger.error('UserDataManager: datasetId is required');
      throw new Error('datasetId is required');
    }
    
    if (!Array.isArray(sampleIds) || sampleIds.length === 0) {
      this.logger.error('UserDataManager: sampleIds must be a non-empty array');
      throw new Error('sampleIds must be a non-empty array');
    }
    
    const dataset = this.datasets.get(datasetId);
    
    if (!dataset) {
      this.logger.error(`UserDataManager: dataset ${datasetId} not found`);
      throw new Error(`Dataset ${datasetId} not found`);
    }
    
    // Создаем множество ID образцов для удаления
    const sampleIdsSet = new Set(sampleIds);
    
    // Фильтруем образцы
    dataset.samples = dataset.samples.filter(sample => !sampleIdsSet.has(sample.id));
    dataset.lastModified = Date.now();
    
    // Сохраняем данные
    this.saveDataToStorage();
    
    this.logger.info(`UserDataManager: removed ${sampleIds.length} samples from dataset ${datasetId}, new count: ${dataset.samples.length}`);
    
    // Отправляем событие об удалении образцов
    this.eventEmitter.emit('dataset:samplesRemoved', {
      datasetId,
      removedCount: sampleIds.length,
      totalCount: dataset.samples.length
    });
    
    return dataset.samples.length;
  }
  
  /**
   * Сохраняет модель
   * @param {Object} modelData - Данные модели
   * @returns {string} ID сохраненной модели
   */
  saveModel(modelData) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    const { name, type, data, metadata } = modelData;
    
    if (!name) {
      this.logger.error('UserDataManager: model name is required');
      throw new Error('Model name is required');
    }
    
    if (!type || (type !== 'ocr' && type !== 'translation')) {
      this.logger.error('UserDataManager: model type must be "ocr" or "translation"');
      throw new Error('Model type must be "ocr" or "translation"');
    }
    
    if (!data) {
      this.logger.error('UserDataManager: model data is required');
      throw new Error('Model data is required');
    }
    
    // Создаем ID модели
    const modelId = `model-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Создаем модель
    const model = {
      id: modelId,
      name,
      type,
      data,
      metadata: metadata || {},
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    // Добавляем модель
    this.models.set(modelId, model);
    
    // Сохраняем данные
    this.saveDataToStorage();
    
    this.logger.info(`UserDataManager: saved model ${modelId} (${name})`);
    
    // Отправляем событие о сохранении модели
    this.eventEmitter.emit('model:saved', {
      modelId,
      name,
      type
    });
    
    return modelId;
  }
  
  /**
   * Получает модель по ID
   * @param {string} modelId - ID модели
   * @returns {Object|null} Модель или null, если модель не найдена
   */
  getModel(modelId) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    if (!modelId) {
      this.logger.error('UserDataManager: modelId is required');
      throw new Error('modelId is required');
    }
    
    const model = this.models.get(modelId);
    
    if (!model) {
      return null;
    }
    
    return { ...model };
  }
  
  /**
   * Получает список всех моделей
   * @param {string} [type] - Тип моделей для фильтрации ('ocr' или 'translation')
   * @returns {Array<Object>} Список моделей
   */
  getAllModels(type) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    const models = Array.from(this.models.values()).map(model => ({ ...model }));
    
    if (type) {
      return models.filter(model => model.type === type);
    }
    
    return models;
  }
  
  /**
   * Удаляет модель
   * @param {string} modelId - ID модели
   * @returns {boolean} Успешность удаления
   */
  deleteModel(modelId) {
    if (!this.isInitialized) {
      this.logger.error('UserDataManager: not initialized');
      throw new Error('UserDataManager not initialized');
    }
    
    if (!modelId) {
      this.logger.error('UserDataManager: modelId is required');
      throw new Error('modelId is required');
    }
    
    if (!this.models.has(modelId)) {
      this.logger.error(`UserDataManager: model ${modelId} not found`);
      return false;
    }
    
    // Удаляем модель
    this.models.delete(modelId);
    
    // Сохраняем данные
    this.saveDataToStorage();
    
    this.logger.info(`UserDataManager: deleted model ${modelId}`);
    
    // Отправляем событие об удалении модели
    this.eventEmitter.emit('model:deleted', {
      modelId
    });
    
    return true;
  }
  
  /**
   * Уничтожает менеджер пользовательских данных и освобождает ресурсы
   */
  destroy() {
    this.logger.info('UserDataManager: destroying');
    
    // Сохраняем данные перед уничтожением
    if (this.isInitialized) {
      this.saveDataToStorage();
    }
    
    // Сбрасываем состояние
    this.isInitialized = false;
    this.datasets.clear();
    this.models.clear();
    
    this.logger.info('UserDataManager: destroyed');
  }
}

module.exports = UserDataManager;
