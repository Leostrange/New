/**
 * @file BatchProcessor.js
 * @description Модуль для пакетной обработки страниц комиксов
 * @module ocr/BatchProcessor
 */

/**
 * Класс для пакетной обработки страниц комиксов
 */
class BatchProcessor {
  /**
   * Создает экземпляр процессора пакетной обработки
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация
   * @param {Object} options.ocrEngine - Движок OCR
   * @param {Object} options.translationEngine - Движок перевода
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
    
    // Состояние процессора
    this.isInitialized = false;
    this.isProcessing = false;
    this.isPaused = false;
    this.isCancelled = false;
    
    // Очередь задач
    this.queue = [];
    this.currentBatchId = null;
    this.currentTaskIndex = -1;
    this.totalTasks = 0;
    
    // Статистика
    this.stats = {
      totalBatches: 0,
      completedBatches: 0,
      failedBatches: 0,
      totalPages: 0,
      completedPages: 0,
      failedPages: 0,
      totalOCRTime: 0,
      totalTranslationTime: 0,
      averageOCRTimePerPage: 0,
      averageTranslationTimePerPage: 0
    };
    
    // Привязка методов к контексту
    this.processBatch = this.processBatch.bind(this);
    this.processNextTask = this.processNextTask.bind(this);
    this.handleOCRComplete = this.handleOCRComplete.bind(this);
    this.handleOCRError = this.handleOCRError.bind(this);
    this.handleTranslationComplete = this.handleTranslationComplete.bind(this);
    this.handleTranslationError = this.handleTranslationError.bind(this);
    this.handlePauseRequest = this.handlePauseRequest.bind(this);
    this.handleResumeRequest = this.handleResumeRequest.bind(this);
    this.handleCancelRequest = this.handleCancelRequest.bind(this);
  }
  
  /**
   * Инициализирует процессор пакетной обработки
   * @returns {BatchProcessor} Экземпляр процессора
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('BatchProcessor: already initialized');
      return this;
    }
    
    this.logger.info('BatchProcessor: initializing');
    
    // Проверяем наличие необходимых компонентов
    if (!this.ocrEngine) {
      this.logger.error('BatchProcessor: OCR engine is required');
      throw new Error('OCR engine is required');
    }
    
    if (!this.translationEngine) {
      this.logger.error('BatchProcessor: Translation engine is required');
      throw new Error('Translation engine is required');
    }
    
    // Подписываемся на события
    this.eventEmitter.on('batch:pause', this.handlePauseRequest);
    this.eventEmitter.on('batch:resume', this.handleResumeRequest);
    this.eventEmitter.on('batch:cancel', this.handleCancelRequest);
    
    this.isInitialized = true;
    this.eventEmitter.emit('batchProcessor:initialized');
    
    return this;
  }
  
  /**
   * Создает новую пакетную задачу
   * @param {Object} options - Параметры пакетной задачи
   * @param {string} options.name - Название пакетной задачи
   * @param {Array<Object>} options.pages - Массив страниц для обработки
   * @param {Object} options.ocrOptions - Параметры OCR
   * @param {Object} options.translationOptions - Параметры перевода
   * @param {boolean} options.autoStart - Автоматически запустить обработку
   * @returns {string} ID созданной пакетной задачи
   */
  createBatch(options = {}) {
    if (!this.isInitialized) {
      this.logger.error('BatchProcessor: not initialized');
      throw new Error('BatchProcessor not initialized');
    }
    
    const { name, pages, ocrOptions, translationOptions, autoStart } = options;
    
    if (!Array.isArray(pages) || pages.length === 0) {
      this.logger.error('BatchProcessor: pages array is required and must not be empty');
      throw new Error('Pages array is required and must not be empty');
    }
    
    // Создаем ID для пакетной задачи
    const batchId = `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Создаем задачи для каждой страницы
    const tasks = pages.map((page, index) => ({
      id: `task-${batchId}-${index}`,
      page,
      ocrOptions: { ...this.config.defaultOCROptions, ...ocrOptions },
      translationOptions: { ...this.config.defaultTranslationOptions, ...translationOptions },
      status: 'pending',
      ocrResult: null,
      translationResult: null,
      error: null,
      startTime: null,
      endTime: null,
      ocrTime: null,
      translationTime: null
    }));
    
    // Создаем пакетную задачу
    const batch = {
      id: batchId,
      name: name || `Batch ${this.stats.totalBatches + 1}`,
      tasks,
      status: 'pending',
      progress: 0,
      startTime: null,
      endTime: null,
      totalTime: null,
      totalOCRTime: 0,
      totalTranslationTime: 0,
      createdAt: Date.now()
    };
    
    // Добавляем задачу в очередь
    this.queue.push(batch);
    
    // Обновляем статистику
    this.stats.totalBatches++;
    this.stats.totalPages += tasks.length;
    
    this.logger.info(`BatchProcessor: created batch ${batchId} with ${tasks.length} pages`);
    
    // Отправляем событие о создании пакетной задачи
    this.eventEmitter.emit('batch:created', {
      batchId,
      name: batch.name,
      totalPages: tasks.length
    });
    
    // Если указан автозапуск, запускаем обработку
    if (autoStart && !this.isProcessing) {
      this.processBatch(batchId);
    }
    
    return batchId;
  }
  
  /**
   * Запускает обработку указанной пакетной задачи
   * @param {string} batchId - ID пакетной задачи
   * @returns {boolean} Успешность запуска
   */
  processBatch(batchId) {
    if (!this.isInitialized) {
      this.logger.error('BatchProcessor: not initialized');
      throw new Error('BatchProcessor not initialized');
    }
    
    // Если уже идет обработка, возвращаем false
    if (this.isProcessing) {
      this.logger.warn(`BatchProcessor: already processing batch ${this.currentBatchId}`);
      return false;
    }
    
    // Находим пакетную задачу в очереди
    const batchIndex = this.queue.findIndex(batch => batch.id === batchId);
    
    if (batchIndex === -1) {
      this.logger.error(`BatchProcessor: batch ${batchId} not found`);
      throw new Error(`Batch ${batchId} not found`);
    }
    
    const batch = this.queue[batchIndex];
    
    // Если задача уже завершена или отменена, возвращаем false
    if (batch.status === 'completed' || batch.status === 'cancelled') {
      this.logger.warn(`BatchProcessor: batch ${batchId} is already ${batch.status}`);
      return false;
    }
    
    // Устанавливаем текущую задачу
    this.currentBatchId = batchId;
    this.currentTaskIndex = -1;
    this.totalTasks = batch.tasks.length;
    
    // Обновляем статус и время начала
    batch.status = 'processing';
    batch.startTime = Date.now();
    
    // Сбрасываем флаги
    this.isProcessing = true;
    this.isPaused = false;
    this.isCancelled = false;
    
    this.logger.info(`BatchProcessor: starting batch ${batchId} with ${batch.tasks.length} pages`);
    
    // Отправляем событие о начале обработки
    this.eventEmitter.emit('batch:start', {
      id: batchId,
      name: batch.name,
      totalItems: batch.tasks.length,
      estimatedTime: this.estimateBatchTime(batch)
    });
    
    // Запускаем обработку первой задачи
    this.processNextTask();
    
    return true;
  }
  
  /**
   * Обрабатывает следующую задачу в текущей пакетной задаче
   * @private
   */
  processNextTask() {
    if (!this.isProcessing || this.isPaused || this.isCancelled) {
      return;
    }
    
    // Находим текущую пакетную задачу
    const batch = this.queue.find(batch => batch.id === this.currentBatchId);
    
    if (!batch) {
      this.logger.error(`BatchProcessor: current batch ${this.currentBatchId} not found`);
      this.isProcessing = false;
      return;
    }
    
    // Увеличиваем индекс текущей задачи
    this.currentTaskIndex++;
    
    // Если все задачи обработаны, завершаем пакетную задачу
    if (this.currentTaskIndex >= batch.tasks.length) {
      this.completeBatch();
      return;
    }
    
    const task = batch.tasks[this.currentTaskIndex];
    
    // Обновляем статус задачи
    task.status = 'processing';
    task.startTime = Date.now();
    
    // Обновляем прогресс пакетной задачи
    batch.progress = (this.currentTaskIndex / batch.tasks.length) * 100;
    
    this.logger.debug(`BatchProcessor: processing task ${task.id} (${this.currentTaskIndex + 1}/${batch.tasks.length})`);
    
    // Отправляем событие о прогрессе
    this.eventEmitter.emit('batch:progress', {
      processId: this.currentBatchId,
      progress: batch.progress,
      currentItem: this.currentTaskIndex + 1,
      totalItems: batch.tasks.length,
      remainingTime: this.estimateRemainingTime(batch),
      message: `Обработка страницы ${this.currentTaskIndex + 1} из ${batch.tasks.length}`
    });
    
    // Запускаем OCR для текущей страницы
    const ocrStartTime = Date.now();
    
    try {
      this.ocrEngine.processPage(task.page, task.ocrOptions)
        .then(result => {
          const ocrEndTime = Date.now();
          task.ocrTime = ocrEndTime - ocrStartTime;
          batch.totalOCRTime += task.ocrTime;
          
          this.handleOCRComplete(task, result);
        })
        .catch(error => {
          const ocrEndTime = Date.now();
          task.ocrTime = ocrEndTime - ocrStartTime;
          batch.totalOCRTime += task.ocrTime;
          
          this.handleOCRError(task, error);
        });
    } catch (error) {
      const ocrEndTime = Date.now();
      task.ocrTime = ocrEndTime - ocrStartTime;
      batch.totalOCRTime += task.ocrTime;
      
      this.handleOCRError(task, error);
    }
  }
  
  /**
   * Обработчик успешного завершения OCR
   * @param {Object} task - Задача
   * @param {Object} result - Результат OCR
   * @private
   */
  handleOCRComplete(task, result) {
    if (!this.isProcessing || this.isCancelled) {
      return;
    }
    
    this.logger.debug(`BatchProcessor: OCR completed for task ${task.id}`);
    
    // Сохраняем результат OCR
    task.ocrResult = result;
    
    // Если задача приостановлена, не запускаем перевод
    if (this.isPaused) {
      return;
    }
    
    // Запускаем перевод для результата OCR
    const translationStartTime = Date.now();
    
    try {
      this.translationEngine.translateText(result.text, task.translationOptions)
        .then(translationResult => {
          const translationEndTime = Date.now();
          task.translationTime = translationEndTime - translationStartTime;
          
          // Находим текущую пакетную задачу
          const batch = this.queue.find(batch => batch.id === this.currentBatchId);
          
          if (batch) {
            batch.totalTranslationTime += task.translationTime;
          }
          
          this.handleTranslationComplete(task, translationResult);
        })
        .catch(error => {
          const translationEndTime = Date.now();
          task.translationTime = translationEndTime - translationStartTime;
          
          // Находим текущую пакетную задачу
          const batch = this.queue.find(batch => batch.id === this.currentBatchId);
          
          if (batch) {
            batch.totalTranslationTime += task.translationTime;
          }
          
          this.handleTranslationError(task, error);
        });
    } catch (error) {
      const translationEndTime = Date.now();
      task.translationTime = translationEndTime - translationStartTime;
      
      // Находим текущую пакетную задачу
      const batch = this.queue.find(batch => batch.id === this.currentBatchId);
      
      if (batch) {
        batch.totalTranslationTime += task.translationTime;
      }
      
      this.handleTranslationError(task, error);
    }
  }
  
  /**
   * Обработчик ошибки OCR
   * @param {Object} task - Задача
   * @param {Error} error - Ошибка
   * @private
   */
  handleOCRError(task, error) {
    if (!this.isProcessing || this.isCancelled) {
      return;
    }
    
    this.logger.error(`BatchProcessor: OCR error for task ${task.id}`, error);
    
    // Обновляем статус задачи
    task.status = 'error';
    task.error = error;
    task.endTime = Date.now();
    
    // Обновляем статистику
    this.stats.failedPages++;
    
    // Находим текущую пакетную задачу
    const batch = this.queue.find(batch => batch.id === this.currentBatchId);
    
    if (batch) {
      // Отправляем событие об ошибке
      this.eventEmitter.emit('batch:error', {
        processId: this.currentBatchId,
        error: error.message,
        isFatal: false
      });
    }
    
    // Переходим к следующей задаче
    this.processNextTask();
  }
  
  /**
   * Обработчик успешного завершения перевода
   * @param {Object} task - Задача
   * @param {Object} result - Результат перевода
   * @private
   */
  handleTranslationComplete(task, result) {
    if (!this.isProcessing || this.isCancelled) {
      return;
    }
    
    this.logger.debug(`BatchProcessor: Translation completed for task ${task.id}`);
    
    // Сохраняем результат перевода
    task.translationResult = result;
    
    // Обновляем статус задачи
    task.status = 'completed';
    task.endTime = Date.now();
    
    // Обновляем статистику
    this.stats.completedPages++;
    
    // Находим текущую пакетную задачу
    const batch = this.queue.find(batch => batch.id === this.currentBatchId);
    
    if (batch) {
      // Создаем итоговый результат задачи
      const taskResult = {
        id: task.id,
        page: task.page,
        ocrResult: task.ocrResult,
        translationResult: task.translationResult,
        ocrTime: task.ocrTime,
        translationTime: task.translationTime,
        totalTime: task.endTime - task.startTime
      };
      
      // Отправляем событие о завершении задачи
      this.eventEmitter.emit('task:complete', {
        batchId: this.currentBatchId,
        taskId: task.id,
        result: taskResult
      });
    }
    
    // Переходим к следующей задаче
    this.processNextTask();
  }
  
  /**
   * Обработчик ошибки перевода
   * @param {Object} task - Задача
   * @param {Error} error - Ошибка
   * @private
   */
  handleTranslationError(task, error) {
    if (!this.isProcessing || this.isCancelled) {
      return;
    }
    
    this.logger.error(`BatchProcessor: Translation error for task ${task.id}`, error);
    
    // Обновляем статус задачи
    task.status = 'error';
    task.error = error;
    task.endTime = Date.now();
    
    // Обновляем статистику
    this.stats.failedPages++;
    
    // Находим текущую пакетную задачу
    const batch = this.queue.find(batch => batch.id === this.currentBatchId);
    
    if (batch) {
      // Отправляем событие об ошибке
      this.eventEmitter.emit('batch:error', {
        processId: this.currentBatchId,
        error: error.message,
        isFatal: false
      });
    }
    
    // Переходим к следующей задаче
    this.processNextTask();
  }
  
  /**
   * Завершает текущую пакетную задачу
   * @private
   */
  completeBatch() {
    // Находим текущую пакетную задачу
    const batch = this.queue.find(batch => batch.id === this.currentBatchId);
    
    if (!batch) {
      this.logger.error(`BatchProcessor: current batch ${this.currentBatchId} not found`);
      this.isProcessing = false;
      return;
    }
    
    // Обновляем статус и время завершения
    batch.status = 'completed';
    batch.endTime = Date.now();
    batch.totalTime = batch.endTime - batch.startTime;
    batch.progress = 100;
    
    // Обновляем статистику
    this.stats.completedBatches++;
    this.stats.totalOCRTime += batch.totalOCRTime;
    this.stats.totalTranslationTime += batch.totalTranslationTime;
    
    // Обновляем средние значения
    const completedPages = this.stats.completedPages + this.stats.failedPages;
    if (completedPages > 0) {
      this.stats.averageOCRTimePerPage = this.stats.totalOCRTime / completedPages;
      this.stats.averageTranslationTimePerPage = this.stats.totalTranslationTime / completedPages;
    }
    
    this.logger.info(`BatchProcessor: completed batch ${this.currentBatchId} in ${batch.totalTime}ms`);
    
    // Создаем итоговый результат
    const results = {
      batchId: batch.id,
      name: batch.name,
      totalPages: batch.tasks.length,
      completedPages: batch.tasks.filter(task => task.status === 'completed').length,
      failedPages: batch.tasks.filter(task => task.status === 'error').length,
      totalTime: batch.totalTime,
      totalOCRTime: batch.totalOCRTime,
      totalTranslationTime: batch.totalTranslationTime,
      tasks: batch.tasks.map(task => ({
        id: task.id,
        status: task.status,
        ocrTime: task.ocrTime,
        translationTime: task.translationTime,
        totalTime: task.endTime ? task.endTime - task.startTime : null,
        error: task.error ? task.error.message : null
      }))
    };
    
    // Отправляем событие о завершении пакетной задачи
    this.eventEmitter.emit('batch:complete', {
      processId: this.currentBatchId,
      results
    });
    
    // Сбрасываем текущую задачу
    this.currentBatchId = null;
    this.currentTaskIndex = -1;
    this.totalTasks = 0;
    this.isProcessing = false;
    
    // Проверяем, есть ли еще задачи в очереди
    const pendingBatch = this.queue.find(batch => batch.status === 'pending');
    
    if (pendingBatch && this.config.autoProcessQueue) {
      this.processBatch(pendingBatch.id);
    }
  }
  
  /**
   * Отменяет текущую пакетную задачу
   * @returns {boolean} Успешность отмены
   */
  cancelCurrentBatch() {
    if (!this.isProcessing) {
      this.logger.warn('BatchProcessor: no batch is currently processing');
      return false;
    }
    
    // Находим текущую пакетную задачу
    const batch = this.queue.find(batch => batch.id === this.currentBatchId);
    
    if (!batch) {
      this.logger.error(`BatchProcessor: current batch ${this.currentBatchId} not found`);
      this.isProcessing = false;
      return false;
    }
    
    // Устанавливаем флаг отмены
    this.isCancelled = true;
    
    // Обновляем статус и время завершения
    batch.status = 'cancelled';
    batch.endTime = Date.now();
    batch.totalTime = batch.endTime - batch.startTime;
    
    // Обновляем статистику
    this.stats.failedBatches++;
    
    this.logger.info(`BatchProcessor: cancelled batch ${this.currentBatchId}`);
    
    // Отправляем событие об отмене пакетной задачи
    this.eventEmitter.emit('batch:cancelled', {
      batchId: this.currentBatchId,
      reason: 'User cancelled'
    });
    
    // Сбрасываем текущую задачу
    this.currentBatchId = null;
    this.currentTaskIndex = -1;
    this.totalTasks = 0;
    this.isProcessing = false;
    this.isPaused = false;
    this.isCancelled = false;
    
    return true;
  }
  
  /**
   * Приостанавливает текущую пакетную задачу
   * @returns {boolean} Успешность приостановки
   */
  pauseCurrentBatch() {
    if (!this.isProcessing) {
      this.logger.warn('BatchProcessor: no batch is currently processing');
      return false;
    }
    
    if (this.isPaused) {
      this.logger.warn('BatchProcessor: already paused');
      return false;
    }
    
    // Устанавливаем флаг приостановки
    this.isPaused = true;
    
    this.logger.info(`BatchProcessor: paused batch ${this.currentBatchId}`);
    
    // Отправляем событие о приостановке пакетной задачи
    this.eventEmitter.emit('batch:paused', {
      batchId: this.currentBatchId
    });
    
    return true;
  }
  
  /**
   * Возобновляет текущую пакетную задачу
   * @returns {boolean} Успешность возобновления
   */
  resumeCurrentBatch() {
    if (!this.isProcessing) {
      this.logger.warn('BatchProcessor: no batch is currently processing');
      return false;
    }
    
    if (!this.isPaused) {
      this.logger.warn('BatchProcessor: not paused');
      return false;
    }
    
    // Сбрасываем флаг приостановки
    this.isPaused = false;
    
    this.logger.info(`BatchProcessor: resumed batch ${this.currentBatchId}`);
    
    // Отправляем событие о возобновлении пакетной задачи
    this.eventEmitter.emit('batch:resumed', {
      batchId: this.currentBatchId
    });
    
    // Продолжаем обработку
    this.processNextTask();
    
    return true;
  }
  
  /**
   * Обработчик запроса на приостановку пакетной задачи
   * @param {Object} data - Данные запроса
   * @private
   */
  handlePauseRequest(data) {
    const { processId } = data;
    
    if (processId !== this.currentBatchId) {
      return;
    }
    
    this.pauseCurrentBatch();
  }
  
  /**
   * Обработчик запроса на возобновление пакетной задачи
   * @param {Object} data - Данные запроса
   * @private
   */
  handleResumeRequest(data) {
    const { processId } = data;
    
    if (processId !== this.currentBatchId) {
      return;
    }
    
    this.resumeCurrentBatch();
  }
  
  /**
   * Обработчик запроса на отмену пакетной задачи
   * @param {Object} data - Данные запроса
   * @private
   */
  handleCancelRequest(data) {
    const { processId } = data;
    
    if (processId !== this.currentBatchId) {
      return;
    }
    
    this.cancelCurrentBatch();
  }
  
  /**
   * Оценивает время выполнения пакетной задачи
   * @param {Object} batch - Пакетная задача
   * @returns {number} Оценка времени в миллисекундах
   * @private
   */
  estimateBatchTime(batch) {
    // Если нет статистики, используем приблизительные значения
    if (this.stats.completedPages === 0) {
      // Предполагаем, что OCR занимает 2 секунды на страницу, а перевод - 1 секунду
      return batch.tasks.length * 3000;
    }
    
    // Используем средние значения из статистики
    const averageTimePerPage = this.stats.averageOCRTimePerPage + this.stats.averageTranslationTimePerPage;
    return batch.tasks.length * averageTimePerPage;
  }
  
  /**
   * Оценивает оставшееся время выполнения текущей пакетной задачи
   * @param {Object} batch - Пакетная задача
   * @returns {number} Оценка оставшегося времени в миллисекундах
   * @private
   */
  estimateRemainingTime(batch) {
    // Если нет статистики или обработано менее 2 задач, используем приблизительные значения
    if (this.stats.completedPages === 0 || this.currentTaskIndex < 2) {
      // Предполагаем, что OCR занимает 2 секунды на страницу, а перевод - 1 секунду
      return (batch.tasks.length - this.currentTaskIndex - 1) * 3000;
    }
    
    // Вычисляем среднее время на задачу в текущей пакетной задаче
    const elapsedTime = Date.now() - batch.startTime;
    const averageTimePerTask = elapsedTime / (this.currentTaskIndex + 1);
    
    // Оцениваем оставшееся время
    return (batch.tasks.length - this.currentTaskIndex - 1) * averageTimePerTask;
  }
  
  /**
   * Получает информацию о пакетной задаче
   * @param {string} batchId - ID пакетной задачи
   * @returns {Object|null} Информация о пакетной задаче или null, если задача не найдена
   */
  getBatchInfo(batchId) {
    const batch = this.queue.find(batch => batch.id === batchId);
    
    if (!batch) {
      return null;
    }
    
    return {
      id: batch.id,
      name: batch.name,
      status: batch.status,
      progress: batch.progress,
      totalTasks: batch.tasks.length,
      completedTasks: batch.tasks.filter(task => task.status === 'completed').length,
      failedTasks: batch.tasks.filter(task => task.status === 'error').length,
      pendingTasks: batch.tasks.filter(task => task.status === 'pending').length,
      processingTasks: batch.tasks.filter(task => task.status === 'processing').length,
      startTime: batch.startTime,
      endTime: batch.endTime,
      totalTime: batch.totalTime,
      createdAt: batch.createdAt
    };
  }
  
  /**
   * Получает список всех пакетных задач
   * @returns {Array<Object>} Список информации о пакетных задачах
   */
  getAllBatches() {
    return this.queue.map(batch => ({
      id: batch.id,
      name: batch.name,
      status: batch.status,
      progress: batch.progress,
      totalTasks: batch.tasks.length,
      completedTasks: batch.tasks.filter(task => task.status === 'completed').length,
      failedTasks: batch.tasks.filter(task => task.status === 'error').length,
      pendingTasks: batch.tasks.filter(task => task.status === 'pending').length,
      processingTasks: batch.tasks.filter(task => task.status === 'processing').length,
      startTime: batch.startTime,
      endTime: batch.endTime,
      totalTime: batch.totalTime,
      createdAt: batch.createdAt
    }));
  }
  
  /**
   * Получает статистику пакетной обработки
   * @returns {Object} Статистика
   */
  getStats() {
    return { ...this.stats };
  }
  
  /**
   * Очищает очередь задач
   * @param {boolean} includeActive - Включая активные задачи
   * @returns {number} Количество удаленных задач
   */
  clearQueue(includeActive = false) {
    if (this.isProcessing && !includeActive) {
      // Удаляем все задачи, кроме текущей
      const initialLength = this.queue.length;
      this.queue = this.queue.filter(batch => batch.id === this.currentBatchId);
      return initialLength - this.queue.length;
    } else if (this.isProcessing && includeActive) {
      // Отменяем текущую задачу и очищаем очередь
      this.cancelCurrentBatch();
      const initialLength = this.queue.length;
      this.queue = [];
      return initialLength;
    } else {
      // Очищаем всю очередь
      const initialLength = this.queue.length;
      this.queue = [];
      return initialLength;
    }
  }
  
  /**
   * Уничтожает процессор пакетной обработки и освобождает ресурсы
   */
  destroy() {
    this.logger.info('BatchProcessor: destroying');
    
    // Отменяем текущую задачу, если она есть
    if (this.isProcessing) {
      this.cancelCurrentBatch();
    }
    
    // Отписываемся от событий
    this.eventEmitter.off('batch:pause', this.handlePauseRequest);
    this.eventEmitter.off('batch:resume', this.handleResumeRequest);
    this.eventEmitter.off('batch:cancel', this.handleCancelRequest);
    
    // Очищаем очередь
    this.queue = [];
    
    // Сбрасываем состояние
    this.isInitialized = false;
    this.isProcessing = false;
    this.isPaused = false;
    this.isCancelled = false;
    this.currentBatchId = null;
    this.currentTaskIndex = -1;
    this.totalTasks = 0;
    
    this.logger.info('BatchProcessor: destroyed');
  }
}

module.exports = BatchProcessor;
