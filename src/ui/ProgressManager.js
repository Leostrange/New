/**
 * @file ProgressManager.js
 * @description Менеджер для отображения прогресса OCR и перевода
 * @module ocr/ProgressManager
 */

/**
 * Класс для управления отображением прогресса OCR и перевода
 */
class ProgressManager {
  /**
   * Создает экземпляр менеджера прогресса
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
    
    // Состояние прогресса
    this.processes = new Map();
    
    // Флаги состояния
    this.isInitialized = false;
    this.isRendered = false;
    
    // DOM элементы
    this.container = null;
    this.progressBars = new Map();
    
    // Привязка методов к контексту
    this.handleProcessStart = this.handleProcessStart.bind(this);
    this.handleProcessProgress = this.handleProcessProgress.bind(this);
    this.handleProcessComplete = this.handleProcessComplete.bind(this);
    this.handleProcessError = this.handleProcessError.bind(this);
    this.handleProcessCancel = this.handleProcessCancel.bind(this);
    this.handleProcessPause = this.handleProcessPause.bind(this);
    this.handleProcessResume = this.handleProcessResume.bind(this);
  }
  
  /**
   * Инициализирует менеджер прогресса
   * @returns {ProgressManager} Экземпляр менеджера прогресса
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('ProgressManager: already initialized');
      return this;
    }
    
    this.logger.info('ProgressManager: initializing');
    
    // Подписываемся на события процессов
    this.eventEmitter.on('process:start', this.handleProcessStart);
    this.eventEmitter.on('process:progress', this.handleProcessProgress);
    this.eventEmitter.on('process:complete', this.handleProcessComplete);
    this.eventEmitter.on('process:error', this.handleProcessError);
    this.eventEmitter.on('process:cancel', this.handleProcessCancel);
    this.eventEmitter.on('process:pause', this.handleProcessPause);
    this.eventEmitter.on('process:resume', this.handleProcessResume);
    
    this.isInitialized = true;
    this.eventEmitter.emit('progressManager:initialized');
    
    return this;
  }
  
  /**
   * Обработчик события начала процесса
   * @param {Object} data - Данные о процессе
   * @private
   */
  handleProcessStart(data) {
    const { processId, processType, totalItems, processName, estimatedTime } = data;
    
    this.logger.debug(`ProgressManager: process ${processId} started`, data);
    
    // Создаем запись о процессе
    this.processes.set(processId, {
      id: processId,
      type: processType,
      name: processName || `Process ${processId}`,
      status: 'running',
      progress: 0,
      totalItems: totalItems || 0,
      processedItems: 0,
      startTime: Date.now(),
      estimatedTime: estimatedTime || 0,
      remainingTime: estimatedTime || 0,
      errors: [],
      warnings: []
    });
    
    // Обновляем UI
    this.updateUI(processId);
    
    // Отправляем событие
    this.eventEmitter.emit('progressManager:processStarted', { processId });
  }
  
  /**
   * Обработчик события прогресса процесса
   * @param {Object} data - Данные о прогрессе
   * @private
   */
  handleProcessProgress(data) {
    const { processId, progress, processedItems, remainingTime, currentItem, message } = data;
    
    // Проверяем, существует ли процесс
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return;
    }
    
    const process = this.processes.get(processId);
    
    // Обновляем данные о процессе
    process.progress = progress || (processedItems / process.totalItems) * 100 || 0;
    process.processedItems = processedItems || process.processedItems;
    process.remainingTime = remainingTime || this.calculateRemainingTime(process);
    process.currentItem = currentItem;
    process.message = message;
    
    // Обновляем UI
    this.updateUI(processId);
    
    // Отправляем событие
    this.eventEmitter.emit('progressManager:processUpdated', { 
      processId,
      progress: process.progress,
      processedItems: process.processedItems,
      remainingTime: process.remainingTime,
      currentItem: process.currentItem,
      message: process.message
    });
  }
  
  /**
   * Обработчик события завершения процесса
   * @param {Object} data - Данные о завершении
   * @private
   */
  handleProcessComplete(data) {
    const { processId, results } = data;
    
    // Проверяем, существует ли процесс
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return;
    }
    
    const process = this.processes.get(processId);
    
    // Обновляем данные о процессе
    process.status = 'completed';
    process.progress = 100;
    process.processedItems = process.totalItems;
    process.remainingTime = 0;
    process.endTime = Date.now();
    process.results = results;
    
    // Обновляем UI
    this.updateUI(processId);
    
    // Отправляем событие
    this.eventEmitter.emit('progressManager:processCompleted', { 
      processId,
      results: process.results,
      duration: process.endTime - process.startTime
    });
    
    // Удаляем процесс через некоторое время
    setTimeout(() => {
      this.removeProcess(processId);
    }, this.config.completedProcessDisplayTime || 5000);
  }
  
  /**
   * Обработчик события ошибки процесса
   * @param {Object} data - Данные об ошибке
   * @private
   */
  handleProcessError(data) {
    const { processId, error, isFatal } = data;
    
    // Проверяем, существует ли процесс
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return;
    }
    
    const process = this.processes.get(processId);
    
    // Добавляем ошибку
    process.errors.push({
      time: Date.now(),
      message: error.message || String(error),
      stack: error.stack,
      isFatal: !!isFatal
    });
    
    // Если ошибка фатальная, меняем статус процесса
    if (isFatal) {
      process.status = 'error';
      process.endTime = Date.now();
    }
    
    // Обновляем UI
    this.updateUI(processId);
    
    // Отправляем событие
    this.eventEmitter.emit('progressManager:processError', { 
      processId,
      error: process.errors[process.errors.length - 1],
      isFatal
    });
  }
  
  /**
   * Обработчик события отмены процесса
   * @param {Object} data - Данные об отмене
   * @private
   */
  handleProcessCancel(data) {
    const { processId, reason } = data;
    
    // Проверяем, существует ли процесс
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return;
    }
    
    const process = this.processes.get(processId);
    
    // Обновляем данные о процессе
    process.status = 'cancelled';
    process.endTime = Date.now();
    process.cancelReason = reason;
    
    // Обновляем UI
    this.updateUI(processId);
    
    // Отправляем событие
    this.eventEmitter.emit('progressManager:processCancelled', { 
      processId,
      reason: process.cancelReason,
      duration: process.endTime - process.startTime
    });
    
    // Удаляем процесс через некоторое время
    setTimeout(() => {
      this.removeProcess(processId);
    }, this.config.cancelledProcessDisplayTime || 5000);
  }
  
  /**
   * Обработчик события приостановки процесса
   * @param {Object} data - Данные о приостановке
   * @private
   */
  handleProcessPause(data) {
    const { processId, reason } = data;
    
    // Проверяем, существует ли процесс
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return;
    }
    
    const process = this.processes.get(processId);
    
    // Обновляем данные о процессе
    process.status = 'paused';
    process.pauseTime = Date.now();
    process.pauseReason = reason;
    
    // Обновляем UI
    this.updateUI(processId);
    
    // Отправляем событие
    this.eventEmitter.emit('progressManager:processPaused', { 
      processId,
      reason: process.pauseReason
    });
  }
  
  /**
   * Обработчик события возобновления процесса
   * @param {Object} data - Данные о возобновлении
   * @private
   */
  handleProcessResume(data) {
    const { processId } = data;
    
    // Проверяем, существует ли процесс
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return;
    }
    
    const process = this.processes.get(processId);
    
    // Обновляем данные о процессе
    process.status = 'running';
    
    // Если был на паузе, корректируем время начала
    if (process.pauseTime) {
      const pauseDuration = Date.now() - process.pauseTime;
      process.startTime += pauseDuration;
      delete process.pauseTime;
      delete process.pauseReason;
    }
    
    // Обновляем UI
    this.updateUI(processId);
    
    // Отправляем событие
    this.eventEmitter.emit('progressManager:processResumed', { processId });
  }
  
  /**
   * Рассчитывает оставшееся время процесса
   * @param {Object} process - Данные о процессе
   * @returns {number} Оставшееся время в миллисекундах
   * @private
   */
  calculateRemainingTime(process) {
    if (process.processedItems <= 0 || process.totalItems <= 0) {
      return process.estimatedTime || 0;
    }
    
    const elapsedTime = Date.now() - process.startTime;
    const itemsPerMs = process.processedItems / elapsedTime;
    const remainingItems = process.totalItems - process.processedItems;
    
    return Math.round(remainingItems / itemsPerMs);
  }
  
  /**
   * Форматирует время в человекочитаемый формат
   * @param {number} timeMs - Время в миллисекундах
   * @returns {string} Отформатированное время
   * @private
   */
  formatTime(timeMs) {
    if (timeMs <= 0) {
      return '0 сек';
    }
    
    const seconds = Math.floor(timeMs / 1000) % 60;
    const minutes = Math.floor(timeMs / (1000 * 60)) % 60;
    const hours = Math.floor(timeMs / (1000 * 60 * 60));
    
    let result = '';
    
    if (hours > 0) {
      result += `${hours} ч `;
    }
    
    if (minutes > 0 || hours > 0) {
      result += `${minutes} мин `;
    }
    
    result += `${seconds} сек`;
    
    return result;
  }
  
  /**
   * Обновляет UI для указанного процесса
   * @param {string} processId - ID процесса
   * @private
   */
  updateUI(processId) {
    if (!this.isRendered || !this.container) {
      return;
    }
    
    const process = this.processes.get(processId);
    
    if (!process) {
      return;
    }
    
    // Проверяем, существует ли UI для этого процесса
    if (!this.progressBars.has(processId)) {
      this.createProcessUI(processId);
    }
    
    const ui = this.progressBars.get(processId);
    
    if (!ui) {
      return;
    }
    
    // Обновляем прогресс-бар
    ui.progressBar.style.width = `${process.progress}%`;
    ui.progressText.textContent = `${Math.round(process.progress)}%`;
    
    // Обновляем статус
    ui.statusText.textContent = this.getStatusText(process.status);
    ui.progressContainer.className = `progress-container ${process.status}`;
    
    // Обновляем информацию о процессе
    ui.itemsText.textContent = `${process.processedItems} / ${process.totalItems}`;
    
    if (process.status === 'running') {
      ui.timeText.textContent = `Осталось: ${this.formatTime(process.remainingTime)}`;
    } else if (process.status === 'completed') {
      ui.timeText.textContent = `Завершено за: ${this.formatTime(process.endTime - process.startTime)}`;
    } else if (process.status === 'error') {
      ui.timeText.textContent = `Ошибка после: ${this.formatTime(process.endTime - process.startTime)}`;
    } else if (process.status === 'cancelled') {
      ui.timeText.textContent = `Отменено после: ${this.formatTime(process.endTime - process.startTime)}`;
    } else if (process.status === 'paused') {
      ui.timeText.textContent = `Приостановлено: ${this.formatTime(process.pauseTime - process.startTime)}`;
    }
    
    // Обновляем сообщение
    if (process.message) {
      ui.messageText.textContent = process.message;
      ui.messageText.style.display = 'block';
    } else {
      ui.messageText.style.display = 'none';
    }
    
    // Обновляем кнопки управления
    ui.pauseResumeButton.textContent = process.status === 'paused' ? 'Возобновить' : 'Приостановить';
    ui.pauseResumeButton.disabled = process.status !== 'running' && process.status !== 'paused';
    ui.cancelButton.disabled = process.status !== 'running' && process.status !== 'paused';
  }
  
  /**
   * Создает UI для процесса
   * @param {string} processId - ID процесса
   * @private
   */
  createProcessUI(processId) {
    const process = this.processes.get(processId);
    
    if (!process) {
      return;
    }
    
    // Создаем контейнер для процесса
    const processContainer = document.createElement('div');
    processContainer.className = 'process-container';
    processContainer.dataset.processId = processId;
    
    // Создаем заголовок
    const header = document.createElement('div');
    header.className = 'process-header';
    
    const title = document.createElement('h3');
    title.textContent = process.name;
    
    const type = document.createElement('span');
    type.className = 'process-type';
    type.textContent = this.getProcessTypeText(process.type);
    
    header.appendChild(title);
    header.appendChild(type);
    
    processContainer.appendChild(header);
    
    // Создаем контейнер для прогресс-бара
    const progressContainer = document.createElement('div');
    progressContainer.className = `progress-container ${process.status}`;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = '0%';
    
    const progressText = document.createElement('span');
    progressText.className = 'progress-text';
    progressText.textContent = '0%';
    
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    
    processContainer.appendChild(progressContainer);
    
    // Создаем информационный блок
    const infoContainer = document.createElement('div');
    infoContainer.className = 'process-info';
    
    const statusContainer = document.createElement('div');
    statusContainer.className = 'info-row';
    
    const statusLabel = document.createElement('span');
    statusLabel.className = 'info-label';
    statusLabel.textContent = 'Статус:';
    
    const statusText = document.createElement('span');
    statusText.className = 'info-value status-text';
    statusText.textContent = this.getStatusText(process.status);
    
    statusContainer.appendChild(statusLabel);
    statusContainer.appendChild(statusText);
    
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'info-row';
    
    const itemsLabel = document.createElement('span');
    itemsLabel.className = 'info-label';
    itemsLabel.textContent = 'Элементы:';
    
    const itemsText = document.createElement('span');
    itemsText.className = 'info-value items-text';
    itemsText.textContent = `${process.processedItems} / ${process.totalItems}`;
    
    itemsContainer.appendChild(itemsLabel);
    itemsContainer.appendChild(itemsText);
    
    const timeContainer = document.createElement('div');
    timeContainer.className = 'info-row';
    
    const timeLabel = document.createElement('span');
    timeLabel.className = 'info-label';
    timeLabel.textContent = 'Время:';
    
    const timeText = document.createElement('span');
    timeText.className = 'info-value time-text';
    timeText.textContent = `Осталось: ${this.formatTime(process.remainingTime)}`;
    
    timeContainer.appendChild(timeLabel);
    timeContainer.appendChild(timeText);
    
    infoContainer.appendChild(statusContainer);
    infoContainer.appendChild(itemsContainer);
    infoContainer.appendChild(timeContainer);
    
    processContainer.appendChild(infoContainer);
    
    // Создаем блок для сообщений
    const messageText = document.createElement('div');
    messageText.className = 'process-message';
    messageText.style.display = 'none';
    
    processContainer.appendChild(messageText);
    
    // Создаем блок с кнопками управления
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'process-controls';
    
    const pauseResumeButton = document.createElement('button');
    pauseResumeButton.className = 'control-button pause-resume-button';
    pauseResumeButton.textContent = 'Приостановить';
    pauseResumeButton.addEventListener('click', () => this.handlePauseResumeClick(processId));
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'control-button cancel-button';
    cancelButton.textContent = 'Отменить';
    cancelButton.addEventListener('click', () => this.handleCancelClick(processId));
    
    controlsContainer.appendChild(pauseResumeButton);
    controlsContainer.appendChild(cancelButton);
    
    processContainer.appendChild(controlsContainer);
    
    // Добавляем контейнер процесса в основной контейнер
    this.container.appendChild(processContainer);
    
    // Сохраняем ссылки на элементы UI
    this.progressBars.set(processId, {
      container: processContainer,
      progressContainer,
      progressBar,
      progressText,
      statusText,
      itemsText,
      timeText,
      messageText,
      pauseResumeButton,
      cancelButton
    });
  }
  
  /**
   * Обработчик нажатия на кнопку паузы/возобновления
   * @param {string} processId - ID процесса
   * @private
   */
  handlePauseResumeClick(processId) {
    const process = this.processes.get(processId);
    
    if (!process) {
      return;
    }
    
    if (process.status === 'running') {
      this.eventEmitter.emit('progressManager:pauseRequested', { processId });
    } else if (process.status === 'paused') {
      this.eventEmitter.emit('progressManager:resumeRequested', { processId });
    }
  }
  
  /**
   * Обработчик нажатия на кнопку отмены
   * @param {string} processId - ID процесса
   * @private
   */
  handleCancelClick(processId) {
    this.eventEmitter.emit('progressManager:cancelRequested', { processId });
  }
  
  /**
   * Получает текстовое представление статуса
   * @param {string} status - Статус процесса
   * @returns {string} Текстовое представление статуса
   * @private
   */
  getStatusText(status) {
    switch (status) {
      case 'running':
        return 'Выполняется';
      case 'completed':
        return 'Завершено';
      case 'error':
        return 'Ошибка';
      case 'cancelled':
        return 'Отменено';
      case 'paused':
        return 'Приостановлено';
      default:
        return 'Неизвестно';
    }
  }
  
  /**
   * Получает текстовое представление типа процесса
   * @param {string} type - Тип процесса
   * @returns {string} Текстовое представление типа процесса
   * @private
   */
  getProcessTypeText(type) {
    switch (type) {
      case 'ocr':
        return 'OCR';
      case 'translation':
        return 'Перевод';
      case 'batch':
        return 'Пакетная обработка';
      default:
        return type || 'Процесс';
    }
  }
  
  /**
   * Удаляет процесс из менеджера и UI
   * @param {string} processId - ID процесса
   * @private
   */
  removeProcess(processId) {
    // Удаляем процесс из списка
    this.processes.delete(processId);
    
    // Удаляем UI процесса
    if (this.progressBars.has(processId)) {
      const ui = this.progressBars.get(processId);
      
      if (ui && ui.container && ui.container.parentNode) {
        ui.container.parentNode.removeChild(ui.container);
      }
      
      this.progressBars.delete(processId);
    }
    
    this.logger.debug(`ProgressManager: process ${processId} removed`);
  }
  
  /**
   * Рендерит менеджер прогресса в указанный контейнер
   * @param {HTMLElement} container - Контейнер для рендеринга
   * @returns {ProgressManager} Экземпляр менеджера прогресса
   */
  render(container) {
    if (!this.isInitialized) {
      this.logger.warn('ProgressManager: not initialized');
      return this;
    }
    
    if (!container) {
      this.logger.error('ProgressManager: container is required');
      return this;
    }
    
    this.container = container;
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    // Создаем основной контейнер
    const progressManagerContainer = document.createElement('div');
    progressManagerContainer.className = 'progress-manager';
    
    // Создаем заголовок
    const header = document.createElement('h2');
    header.textContent = 'Прогресс OCR и перевода';
    progressManagerContainer.appendChild(header);
    
    // Добавляем созданный контейнер в основной контейнер
    this.container.appendChild(progressManagerContainer);
    
    // Рендерим существующие процессы
    this.processes.forEach((process, processId) => {
      this.createProcessUI(processId);
    });
    
    this.isRendered = true;
    
    return this;
  }
  
  /**
   * Создает новый процесс
   * @param {Object} processData - Данные о процессе
   * @param {string} processData.id - ID процесса
   * @param {string} processData.type - Тип процесса (ocr, translation, batch)
   * @param {string} processData.name - Название процесса
   * @param {number} processData.totalItems - Общее количество элементов
   * @param {number} processData.estimatedTime - Предполагаемое время выполнения в миллисекундах
   * @returns {string} ID созданного процесса
   */
  createProcess(processData) {
    const processId = processData.id || `process-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.handleProcessStart({
      processId,
      processType: processData.type,
      totalItems: processData.totalItems,
      processName: processData.name,
      estimatedTime: processData.estimatedTime
    });
    
    return processId;
  }
  
  /**
   * Обновляет прогресс процесса
   * @param {string} processId - ID процесса
   * @param {Object} progressData - Данные о прогрессе
   * @param {number} progressData.progress - Процент выполнения (0-100)
   * @param {number} progressData.processedItems - Количество обработанных элементов
   * @param {number} progressData.remainingTime - Оставшееся время в миллисекундах
   * @param {string} progressData.currentItem - Текущий обрабатываемый элемент
   * @param {string} progressData.message - Сообщение о прогрессе
   * @returns {boolean} true, если процесс успешно обновлен
   */
  updateProgress(processId, progressData) {
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return false;
    }
    
    this.handleProcessProgress({
      processId,
      ...progressData
    });
    
    return true;
  }
  
  /**
   * Завершает процесс
   * @param {string} processId - ID процесса
   * @param {Object} results - Результаты процесса
   * @returns {boolean} true, если процесс успешно завершен
   */
  completeProcess(processId, results) {
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return false;
    }
    
    this.handleProcessComplete({
      processId,
      results
    });
    
    return true;
  }
  
  /**
   * Отмечает ошибку в процессе
   * @param {string} processId - ID процесса
   * @param {Error|string} error - Объект ошибки или сообщение об ошибке
   * @param {boolean} isFatal - Является ли ошибка фатальной
   * @returns {boolean} true, если ошибка успешно отмечена
   */
  markError(processId, error, isFatal = false) {
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return false;
    }
    
    this.handleProcessError({
      processId,
      error: typeof error === 'string' ? new Error(error) : error,
      isFatal
    });
    
    return true;
  }
  
  /**
   * Отменяет процесс
   * @param {string} processId - ID процесса
   * @param {string} reason - Причина отмены
   * @returns {boolean} true, если процесс успешно отменен
   */
  cancelProcess(processId, reason) {
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return false;
    }
    
    this.handleProcessCancel({
      processId,
      reason
    });
    
    return true;
  }
  
  /**
   * Приостанавливает процесс
   * @param {string} processId - ID процесса
   * @param {string} reason - Причина приостановки
   * @returns {boolean} true, если процесс успешно приостановлен
   */
  pauseProcess(processId, reason) {
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return false;
    }
    
    this.handleProcessPause({
      processId,
      reason
    });
    
    return true;
  }
  
  /**
   * Возобновляет процесс
   * @param {string} processId - ID процесса
   * @returns {boolean} true, если процесс успешно возобновлен
   */
  resumeProcess(processId) {
    if (!this.processes.has(processId)) {
      this.logger.warn(`ProgressManager: process ${processId} not found`);
      return false;
    }
    
    this.handleProcessResume({
      processId
    });
    
    return true;
  }
  
  /**
   * Получает информацию о процессе
   * @param {string} processId - ID процесса
   * @returns {Object|null} Информация о процессе или null, если процесс не найден
   */
  getProcessInfo(processId) {
    if (!this.processes.has(processId)) {
      return null;
    }
    
    return { ...this.processes.get(processId) };
  }
  
  /**
   * Получает список всех активных процессов
   * @returns {Array} Массив объектов с информацией о процессах
   */
  getActiveProcesses() {
    const activeProcesses = [];
    
    this.processes.forEach(process => {
      if (process.status === 'running' || process.status === 'paused') {
        activeProcesses.push({ ...process });
      }
    });
    
    return activeProcesses;
  }
  
  /**
   * Уничтожает менеджер прогресса и освобождает ресурсы
   */
  destroy() {
    this.logger.info('ProgressManager: destroying');
    
    // Отписываемся от событий
    this.eventEmitter.off('process:start', this.handleProcessStart);
    this.eventEmitter.off('process:progress', this.handleProcessProgress);
    this.eventEmitter.off('process:complete', this.handleProcessComplete);
    this.eventEmitter.off('process:error', this.handleProcessError);
    this.eventEmitter.off('process:cancel', this.handleProcessCancel);
    this.eventEmitter.off('process:pause', this.handleProcessPause);
    this.eventEmitter.off('process:resume', this.handleProcessResume);
    
    // Очищаем контейнер
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Очищаем данные
    this.processes.clear();
    this.progressBars.clear();
    
    this.isInitialized = false;
    this.isRendered = false;
    
    this.logger.info('ProgressManager: destroyed');
  }
}

module.exports = ProgressManager;
