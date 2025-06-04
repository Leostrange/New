/**
 * @file ProgressIntegration.js
 * @description Интеграционный модуль для отображения прогресса OCR и перевода
 * @module ui/ProgressIntegration
 */

const ProgressManager = require('./ProgressManager');

/**
 * Класс для интеграции менеджера прогресса в пользовательский интерфейс
 */
class ProgressIntegration {
  /**
   * Создает экземпляр интеграции менеджера прогресса
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = options.config || {};
    
    // Создаем экземпляр менеджера прогресса
    this.progressManager = new ProgressManager({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config.progress || {}
    });
    
    // Флаги состояния
    this.isInitialized = false;
    this.isRendered = false;
    
    // DOM элементы
    this.container = null;
    this.progressContainer = null;
    this.toggleButton = null;
    
    // Привязка методов к контексту
    this.handleOCRStart = this.handleOCRStart.bind(this);
    this.handleOCRProgress = this.handleOCRProgress.bind(this);
    this.handleOCRComplete = this.handleOCRComplete.bind(this);
    this.handleOCRError = this.handleOCRError.bind(this);
    
    this.handleTranslationStart = this.handleTranslationStart.bind(this);
    this.handleTranslationProgress = this.handleTranslationProgress.bind(this);
    this.handleTranslationComplete = this.handleTranslationComplete.bind(this);
    this.handleTranslationError = this.handleTranslationError.bind(this);
    
    this.handleBatchStart = this.handleBatchStart.bind(this);
    this.handleBatchProgress = this.handleBatchProgress.bind(this);
    this.handleBatchComplete = this.handleBatchComplete.bind(this);
    this.handleBatchError = this.handleBatchError.bind(this);
    
    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handlePauseRequest = this.handlePauseRequest.bind(this);
    this.handleResumeRequest = this.handleResumeRequest.bind(this);
    this.handleCancelRequest = this.handleCancelRequest.bind(this);
  }
  
  /**
   * Инициализирует интеграцию менеджера прогресса
   * @returns {ProgressIntegration} Экземпляр интеграции
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('ProgressIntegration: already initialized');
      return this;
    }
    
    this.logger.info('ProgressIntegration: initializing');
    
    // Инициализируем менеджер прогресса
    this.progressManager.initialize();
    
    // Подписываемся на события OCR
    this.eventEmitter.on('ocr:start', this.handleOCRStart);
    this.eventEmitter.on('ocr:progress', this.handleOCRProgress);
    this.eventEmitter.on('ocr:complete', this.handleOCRComplete);
    this.eventEmitter.on('ocr:error', this.handleOCRError);
    
    // Подписываемся на события перевода
    this.eventEmitter.on('translation:start', this.handleTranslationStart);
    this.eventEmitter.on('translation:progress', this.handleTranslationProgress);
    this.eventEmitter.on('translation:complete', this.handleTranslationComplete);
    this.eventEmitter.on('translation:error', this.handleTranslationError);
    
    // Подписываемся на события пакетной обработки
    this.eventEmitter.on('batch:start', this.handleBatchStart);
    this.eventEmitter.on('batch:progress', this.handleBatchProgress);
    this.eventEmitter.on('batch:complete', this.handleBatchComplete);
    this.eventEmitter.on('batch:error', this.handleBatchError);
    
    // Подписываемся на события управления процессами
    this.eventEmitter.on('progressManager:pauseRequested', this.handlePauseRequest);
    this.eventEmitter.on('progressManager:resumeRequested', this.handleResumeRequest);
    this.eventEmitter.on('progressManager:cancelRequested', this.handleCancelRequest);
    
    this.isInitialized = true;
    this.eventEmitter.emit('progressIntegration:initialized');
    
    return this;
  }
  
  /**
   * Обработчик события начала OCR
   * @param {Object} data - Данные о процессе OCR
   * @private
   */
  handleOCRStart(data) {
    const { id, totalPages, estimatedTime, name } = data;
    
    this.logger.debug('ProgressIntegration: OCR started', data);
    
    // Создаем процесс в менеджере прогресса
    const processId = this.progressManager.createProcess({
      id: id || `ocr-${Date.now()}`,
      type: 'ocr',
      name: name || 'Распознавание текста',
      totalItems: totalPages || 1,
      estimatedTime: estimatedTime || 0
    });
    
    // Сохраняем ID процесса в данных
    data.processId = processId;
  }
  
  /**
   * Обработчик события прогресса OCR
   * @param {Object} data - Данные о прогрессе OCR
   * @private
   */
  handleOCRProgress(data) {
    const { processId, progress, currentPage, totalPages, remainingTime, message } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: OCR progress without processId', data);
      return;
    }
    
    // Обновляем прогресс в менеджере
    this.progressManager.updateProgress(processId, {
      progress,
      processedItems: currentPage,
      totalItems: totalPages,
      remainingTime,
      currentItem: `Страница ${currentPage}/${totalPages}`,
      message
    });
  }
  
  /**
   * Обработчик события завершения OCR
   * @param {Object} data - Данные о завершении OCR
   * @private
   */
  handleOCRComplete(data) {
    const { processId, results } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: OCR complete without processId', data);
      return;
    }
    
    // Завершаем процесс в менеджере
    this.progressManager.completeProcess(processId, results);
  }
  
  /**
   * Обработчик события ошибки OCR
   * @param {Object} data - Данные об ошибке OCR
   * @private
   */
  handleOCRError(data) {
    const { processId, error, isFatal } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: OCR error without processId', data);
      return;
    }
    
    // Отмечаем ошибку в менеджере
    this.progressManager.markError(processId, error, isFatal);
  }
  
  /**
   * Обработчик события начала перевода
   * @param {Object} data - Данные о процессе перевода
   * @private
   */
  handleTranslationStart(data) {
    const { id, totalItems, estimatedTime, name } = data;
    
    this.logger.debug('ProgressIntegration: Translation started', data);
    
    // Создаем процесс в менеджере прогресса
    const processId = this.progressManager.createProcess({
      id: id || `translation-${Date.now()}`,
      type: 'translation',
      name: name || 'Перевод текста',
      totalItems: totalItems || 1,
      estimatedTime: estimatedTime || 0
    });
    
    // Сохраняем ID процесса в данных
    data.processId = processId;
  }
  
  /**
   * Обработчик события прогресса перевода
   * @param {Object} data - Данные о прогрессе перевода
   * @private
   */
  handleTranslationProgress(data) {
    const { processId, progress, currentItem, totalItems, remainingTime, message } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: Translation progress without processId', data);
      return;
    }
    
    // Обновляем прогресс в менеджере
    this.progressManager.updateProgress(processId, {
      progress,
      processedItems: currentItem,
      totalItems,
      remainingTime,
      currentItem: `Элемент ${currentItem}/${totalItems}`,
      message
    });
  }
  
  /**
   * Обработчик события завершения перевода
   * @param {Object} data - Данные о завершении перевода
   * @private
   */
  handleTranslationComplete(data) {
    const { processId, results } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: Translation complete without processId', data);
      return;
    }
    
    // Завершаем процесс в менеджере
    this.progressManager.completeProcess(processId, results);
  }
  
  /**
   * Обработчик события ошибки перевода
   * @param {Object} data - Данные об ошибке перевода
   * @private
   */
  handleTranslationError(data) {
    const { processId, error, isFatal } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: Translation error without processId', data);
      return;
    }
    
    // Отмечаем ошибку в менеджере
    this.progressManager.markError(processId, error, isFatal);
  }
  
  /**
   * Обработчик события начала пакетной обработки
   * @param {Object} data - Данные о процессе пакетной обработки
   * @private
   */
  handleBatchStart(data) {
    const { id, totalItems, estimatedTime, name } = data;
    
    this.logger.debug('ProgressIntegration: Batch processing started', data);
    
    // Создаем процесс в менеджере прогресса
    const processId = this.progressManager.createProcess({
      id: id || `batch-${Date.now()}`,
      type: 'batch',
      name: name || 'Пакетная обработка',
      totalItems: totalItems || 1,
      estimatedTime: estimatedTime || 0
    });
    
    // Сохраняем ID процесса в данных
    data.processId = processId;
  }
  
  /**
   * Обработчик события прогресса пакетной обработки
   * @param {Object} data - Данные о прогрессе пакетной обработки
   * @private
   */
  handleBatchProgress(data) {
    const { processId, progress, currentItem, totalItems, remainingTime, message } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: Batch progress without processId', data);
      return;
    }
    
    // Обновляем прогресс в менеджере
    this.progressManager.updateProgress(processId, {
      progress,
      processedItems: currentItem,
      totalItems,
      remainingTime,
      currentItem: `Элемент ${currentItem}/${totalItems}`,
      message
    });
  }
  
  /**
   * Обработчик события завершения пакетной обработки
   * @param {Object} data - Данные о завершении пакетной обработки
   * @private
   */
  handleBatchComplete(data) {
    const { processId, results } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: Batch complete without processId', data);
      return;
    }
    
    // Завершаем процесс в менеджере
    this.progressManager.completeProcess(processId, results);
  }
  
  /**
   * Обработчик события ошибки пакетной обработки
   * @param {Object} data - Данные об ошибке пакетной обработки
   * @private
   */
  handleBatchError(data) {
    const { processId, error, isFatal } = data;
    
    if (!processId) {
      this.logger.warn('ProgressIntegration: Batch error without processId', data);
      return;
    }
    
    // Отмечаем ошибку в менеджере
    this.progressManager.markError(processId, error, isFatal);
  }
  
  /**
   * Обработчик запроса на приостановку процесса
   * @param {Object} data - Данные о запросе
   * @private
   */
  handlePauseRequest(data) {
    const { processId } = data;
    
    this.logger.debug(`ProgressIntegration: pause requested for process ${processId}`);
    
    // Определяем тип процесса
    const process = this.progressManager.getProcessInfo(processId);
    
    if (!process) {
      return;
    }
    
    // Отправляем событие в зависимости от типа процесса
    switch (process.type) {
      case 'ocr':
        this.eventEmitter.emit('ocr:pause', { processId });
        break;
      case 'translation':
        this.eventEmitter.emit('translation:pause', { processId });
        break;
      case 'batch':
        this.eventEmitter.emit('batch:pause', { processId });
        break;
      default:
        this.logger.warn(`ProgressIntegration: unknown process type ${process.type}`);
    }
  }
  
  /**
   * Обработчик запроса на возобновление процесса
   * @param {Object} data - Данные о запросе
   * @private
   */
  handleResumeRequest(data) {
    const { processId } = data;
    
    this.logger.debug(`ProgressIntegration: resume requested for process ${processId}`);
    
    // Определяем тип процесса
    const process = this.progressManager.getProcessInfo(processId);
    
    if (!process) {
      return;
    }
    
    // Отправляем событие в зависимости от типа процесса
    switch (process.type) {
      case 'ocr':
        this.eventEmitter.emit('ocr:resume', { processId });
        break;
      case 'translation':
        this.eventEmitter.emit('translation:resume', { processId });
        break;
      case 'batch':
        this.eventEmitter.emit('batch:resume', { processId });
        break;
      default:
        this.logger.warn(`ProgressIntegration: unknown process type ${process.type}`);
    }
  }
  
  /**
   * Обработчик запроса на отмену процесса
   * @param {Object} data - Данные о запросе
   * @private
   */
  handleCancelRequest(data) {
    const { processId } = data;
    
    this.logger.debug(`ProgressIntegration: cancel requested for process ${processId}`);
    
    // Определяем тип процесса
    const process = this.progressManager.getProcessInfo(processId);
    
    if (!process) {
      return;
    }
    
    // Отправляем событие в зависимости от типа процесса
    switch (process.type) {
      case 'ocr':
        this.eventEmitter.emit('ocr:cancel', { processId });
        break;
      case 'translation':
        this.eventEmitter.emit('translation:cancel', { processId });
        break;
      case 'batch':
        this.eventEmitter.emit('batch:cancel', { processId });
        break;
      default:
        this.logger.warn(`ProgressIntegration: unknown process type ${process.type}`);
    }
  }
  
  /**
   * Обработчик нажатия на кнопку переключения видимости панели прогресса
   * @private
   */
  handleToggleClick() {
    if (!this.progressContainer) {
      return;
    }
    
    const isVisible = this.progressContainer.style.display !== 'none';
    
    if (isVisible) {
      this.progressContainer.style.display = 'none';
      this.toggleButton.textContent = 'Показать прогресс';
      this.toggleButton.classList.remove('active');
    } else {
      this.progressContainer.style.display = 'block';
      this.toggleButton.textContent = 'Скрыть прогресс';
      this.toggleButton.classList.add('active');
    }
  }
  
  /**
   * Рендерит интеграцию менеджера прогресса в указанный контейнер
   * @param {HTMLElement} container - Контейнер для рендеринга
   * @returns {ProgressIntegration} Экземпляр интеграции
   */
  render(container) {
    if (!this.isInitialized) {
      this.logger.warn('ProgressIntegration: not initialized');
      return this;
    }
    
    if (!container) {
      this.logger.error('ProgressIntegration: container is required');
      return this;
    }
    
    this.container = container;
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    // Создаем основной контейнер
    const integrationContainer = document.createElement('div');
    integrationContainer.className = 'progress-integration';
    
    // Создаем кнопку переключения видимости
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'toggle-button active';
    this.toggleButton.textContent = 'Скрыть прогресс';
    this.toggleButton.addEventListener('click', this.handleToggleClick);
    
    integrationContainer.appendChild(this.toggleButton);
    
    // Создаем контейнер для прогресса
    this.progressContainer = document.createElement('div');
    this.progressContainer.className = 'progress-container';
    
    integrationContainer.appendChild(this.progressContainer);
    
    // Добавляем созданный контейнер в основной контейнер
    this.container.appendChild(integrationContainer);
    
    // Рендерим менеджер прогресса в контейнер
    this.progressManager.render(this.progressContainer);
    
    this.isRendered = true;
    
    return this;
  }
  
  /**
   * Симулирует процесс OCR для демонстрации
   * @param {Object} options - Параметры симуляции
   * @param {number} options.totalPages - Общее количество страниц
   * @param {number} options.duration - Длительность симуляции в миллисекундах
   * @param {boolean} options.withError - Симулировать ошибку
   * @returns {string} ID созданного процесса
   */
  simulateOCRProcess(options = {}) {
    const totalPages = options.totalPages || 10;
    const duration = options.duration || 10000;
    const withError = options.withError || false;
    
    const processId = `ocr-demo-${Date.now()}`;
    
    // Запускаем процесс
    this.eventEmitter.emit('ocr:start', {
      id: processId,
      totalPages,
      estimatedTime: duration,
      name: 'Демонстрация OCR'
    });
    
    // Симулируем прогресс
    const interval = duration / totalPages;
    let currentPage = 0;
    
    const progressInterval = setInterval(() => {
      currentPage++;
      
      // Если нужно симулировать ошибку и достигли середины
      if (withError && currentPage === Math.floor(totalPages / 2)) {
        clearInterval(progressInterval);
        
        this.eventEmitter.emit('ocr:error', {
          processId,
          error: new Error('Демонстрационная ошибка OCR'),
          isFatal: true
        });
        
        return;
      }
      
      // Отправляем событие прогресса
      this.eventEmitter.emit('ocr:progress', {
        processId,
        progress: (currentPage / totalPages) * 100,
        currentPage,
        totalPages,
        remainingTime: interval * (totalPages - currentPage),
        message: `Обработка страницы ${currentPage}`
      });
      
      // Если достигли конца, завершаем процесс
      if (currentPage === totalPages) {
        clearInterval(progressInterval);
        
        this.eventEmitter.emit('ocr:complete', {
          processId,
          results: {
            pages: totalPages,
            characters: totalPages * 1000,
            words: totalPages * 200
          }
        });
      }
    }, interval);
    
    return processId;
  }
  
  /**
   * Симулирует процесс перевода для демонстрации
   * @param {Object} options - Параметры симуляции
   * @param {number} options.totalItems - Общее количество элементов
   * @param {number} options.duration - Длительность симуляции в миллисекундах
   * @param {boolean} options.withError - Симулировать ошибку
   * @returns {string} ID созданного процесса
   */
  simulateTranslationProcess(options = {}) {
    const totalItems = options.totalItems || 20;
    const duration = options.duration || 15000;
    const withError = options.withError || false;
    
    const processId = `translation-demo-${Date.now()}`;
    
    // Запускаем процесс
    this.eventEmitter.emit('translation:start', {
      id: processId,
      totalItems,
      estimatedTime: duration,
      name: 'Демонстрация перевода'
    });
    
    // Симулируем прогресс
    const interval = duration / totalItems;
    let currentItem = 0;
    
    const progressInterval = setInterval(() => {
      currentItem++;
      
      // Если нужно симулировать ошибку и достигли середины
      if (withError && currentItem === Math.floor(totalItems / 2)) {
        clearInterval(progressInterval);
        
        this.eventEmitter.emit('translation:error', {
          processId,
          error: new Error('Демонстрационная ошибка перевода'),
          isFatal: true
        });
        
        return;
      }
      
      // Отправляем событие прогресса
      this.eventEmitter.emit('translation:progress', {
        processId,
        progress: (currentItem / totalItems) * 100,
        currentItem,
        totalItems,
        remainingTime: interval * (totalItems - currentItem),
        message: `Перевод элемента ${currentItem}`
      });
      
      // Если достигли конца, завершаем процесс
      if (currentItem === totalItems) {
        clearInterval(progressInterval);
        
        this.eventEmitter.emit('translation:complete', {
          processId,
          results: {
            items: totalItems,
            characters: totalItems * 500,
            words: totalItems * 100
          }
        });
      }
    }, interval);
    
    return processId;
  }
  
  /**
   * Симулирует процесс пакетной обработки для демонстрации
   * @param {Object} options - Параметры симуляции
   * @param {number} options.totalItems - Общее количество элементов
   * @param {number} options.duration - Длительность симуляции в миллисекундах
   * @param {boolean} options.withError - Симулировать ошибку
   * @returns {string} ID созданного процесса
   */
  simulateBatchProcess(options = {}) {
    const totalItems = options.totalItems || 30;
    const duration = options.duration || 20000;
    const withError = options.withError || false;
    
    const processId = `batch-demo-${Date.now()}`;
    
    // Запускаем процесс
    this.eventEmitter.emit('batch:start', {
      id: processId,
      totalItems,
      estimatedTime: duration,
      name: 'Демонстрация пакетной обработки'
    });
    
    // Симулируем прогресс
    const interval = duration / totalItems;
    let currentItem = 0;
    
    const progressInterval = setInterval(() => {
      currentItem++;
      
      // Если нужно симулировать ошибку и достигли середины
      if (withError && currentItem === Math.floor(totalItems / 2)) {
        clearInterval(progressInterval);
        
        this.eventEmitter.emit('batch:error', {
          processId,
          error: new Error('Демонстрационная ошибка пакетной обработки'),
          isFatal: true
        });
        
        return;
      }
      
      // Отправляем событие прогресса
      this.eventEmitter.emit('batch:progress', {
        processId,
        progress: (currentItem / totalItems) * 100,
        currentItem,
        totalItems,
        remainingTime: interval * (totalItems - currentItem),
        message: `Обработка элемента ${currentItem}`
      });
      
      // Если достигли конца, завершаем процесс
      if (currentItem === totalItems) {
        clearInterval(progressInterval);
        
        this.eventEmitter.emit('batch:complete', {
          processId,
          results: {
            items: totalItems,
            pages: totalItems * 2,
            characters: totalItems * 2000,
            words: totalItems * 400
          }
        });
      }
    }, interval);
    
    return processId;
  }
  
  /**
   * Уничтожает интеграцию менеджера прогресса и освобождает ресурсы
   */
  destroy() {
    this.logger.info('ProgressIntegration: destroying');
    
    // Отписываемся от событий OCR
    this.eventEmitter.off('ocr:start', this.handleOCRStart);
    this.eventEmitter.off('ocr:progress', this.handleOCRProgress);
    this.eventEmitter.off('ocr:complete', this.handleOCRComplete);
    this.eventEmitter.off('ocr:error', this.handleOCRError);
    
    // Отписываемся от событий перевода
    this.eventEmitter.off('translation:start', this.handleTranslationStart);
    this.eventEmitter.off('translation:progress', this.handleTranslationProgress);
    this.eventEmitter.off('translation:complete', this.handleTranslationComplete);
    this.eventEmitter.off('translation:error', this.handleTranslationError);
    
    // Отписываемся от событий пакетной обработки
    this.eventEmitter.off('batch:start', this.handleBatchStart);
    this.eventEmitter.off('batch:progress', this.handleBatchProgress);
    this.eventEmitter.off('batch:complete', this.handleBatchComplete);
    this.eventEmitter.off('batch:error', this.handleBatchError);
    
    // Отписываемся от событий управления процессами
    this.eventEmitter.off('progressManager:pauseRequested', this.handlePauseRequest);
    this.eventEmitter.off('progressManager:resumeRequested', this.handleResumeRequest);
    this.eventEmitter.off('progressManager:cancelRequested', this.handleCancelRequest);
    
    // Удаляем обработчики событий
    if (this.isRendered && this.toggleButton) {
      this.toggleButton.removeEventListener('click', this.handleToggleClick);
    }
    
    // Уничтожаем менеджер прогресса
    this.progressManager.destroy();
    
    // Очищаем контейнер
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.isInitialized = false;
    this.isRendered = false;
    
    this.logger.info('ProgressIntegration: destroyed');
  }
}

module.exports = ProgressIntegration;
