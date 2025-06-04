/**
 * @file GestureManager.js
 * @description Менеджер жестов для приложения Mr.Comic
 * @module ui/GestureManager
 */

/**
 * Класс для управления и обработки жестов пользовательского интерфейса
 */
class GestureManager {
  /**
   * Создает экземпляр менеджера жестов
   * @param {Object} options - Параметры инициализации
   * @param {HTMLElement} options.rootElement - Корневой элемент для обработки жестов
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация жестов
   */
  constructor(options = {}) {
    this.rootElement = options.rootElement || document.body;
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = this.mergeConfig(options.config || {});
    
    // Состояние жестов
    this.gestureState = {
      active: false,
      type: null,
      startTime: 0,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      distance: 0,
      angle: 0,
      scale: 1,
      rotation: 0,
      touches: [],
      pointerIds: new Set(),
      lastMoveTime: 0,
      lastTapTime: 0,
      tapCount: 0
    };
    
    // Карта зарегистрированных обработчиков жестов
    this.gestureHandlers = new Map();
    
    // Карта элементов с их настройками жестов
    this.gestureElements = new Map();
    
    // Флаги состояния
    this.isInitialized = false;
    this.isDestroyed = false;
    
    // Привязка методов к контексту
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
  }
  
  /**
   * Объединяет пользовательскую конфигурацию с конфигурацией по умолчанию
   * @param {Object} userConfig - Пользовательская конфигурация
   * @returns {Object} Объединенная конфигурация
   * @private
   */
  mergeConfig(userConfig) {
    const defaultConfig = {
      // Общие настройки
      enabled: true,
      preventDefaultEvents: true,
      passiveEvents: false,
      
      // Пороговые значения для жестов
      tapMaxDistance: 10, // максимальное смещение для распознавания тапа
      tapMaxDuration: 300, // максимальная длительность для распознавания тапа
      doubleTapDelay: 300, // максимальная задержка между тапами для двойного тапа
      longPressDelay: 500, // задержка для распознавания долгого нажатия
      swipeMinDistance: 30, // минимальное расстояние для распознавания свайпа
      swipeMinVelocity: 0.3, // минимальная скорость для распознавания свайпа (px/ms)
      swipeMaxTime: 300, // максимальное время для распознавания свайпа
      
      // Настройки для мультитач-жестов
      pinchMinScale: 0.1, // минимальное изменение масштаба для распознавания пинча
      rotateMinAngle: 5, // минимальный угол для распознавания вращения
      
      // Настройки для специфичных устройств
      touchSensitivity: 1.0, // чувствительность для сенсорных устройств
      mouseSensitivity: 1.0, // чувствительность для мыши
      
      // Настройки для инерции
      inertiaEnabled: true, // включение инерции
      inertiaDecay: 0.95, // коэффициент затухания инерции
      inertiaMinVelocity: 0.05, // минимальная скорость для продолжения инерции
      
      // Настройки для дебаггинга
      debug: false, // включение режима отладки
      visualFeedback: false // включение визуальной обратной связи
    };
    
    return { ...defaultConfig, ...userConfig };
  }
  
  /**
   * Инициализирует менеджер жестов
   * @returns {GestureManager} Экземпляр менеджера жестов
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('GestureManager: already initialized');
      return this;
    }
    
    if (this.isDestroyed) {
      this.logger.error('GestureManager: cannot initialize destroyed instance');
      return this;
    }
    
    this.logger.info('GestureManager: initializing');
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Создаем визуальную обратную связь, если включена
    if (this.config.visualFeedback) {
      this.createVisualFeedback();
    }
    
    // Регистрируем стандартные обработчики жестов
    this.registerDefaultGestureHandlers();
    
    this.isInitialized = true;
    this.eventEmitter.emit('gestureManager:initialized');
    
    return this;
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    const options = {
      passive: this.config.passiveEvents,
      capture: false
    };
    
    // Добавляем обработчики указателя (pointer events)
    this.rootElement.addEventListener('pointerdown', this.handlePointerDown, options);
    window.addEventListener('pointermove', this.handlePointerMove, options);
    window.addEventListener('pointerup', this.handlePointerUp, options);
    window.addEventListener('pointercancel', this.handlePointerCancel, options);
    
    // Добавляем обработчик колесика мыши
    this.rootElement.addEventListener('wheel', this.handleWheel, options);
    
    // Добавляем обработчик контекстного меню для предотвращения стандартного поведения
    this.rootElement.addEventListener('contextmenu', this.handleContextMenu, options);
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    // Удаляем обработчики указателя
    this.rootElement.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerCancel);
    
    // Удаляем обработчик колесика мыши
    this.rootElement.removeEventListener('wheel', this.handleWheel);
    
    // Удаляем обработчик контекстного меню
    this.rootElement.removeEventListener('contextmenu', this.handleContextMenu);
  }
  
  /**
   * Создает элементы для визуальной обратной связи
   * @private
   */
  createVisualFeedback() {
    // Создаем контейнер для визуальной обратной связи
    this.feedbackContainer = document.createElement('div');
    this.feedbackContainer.className = 'gesture-feedback-container';
    this.feedbackContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
    
    // Создаем элемент для отображения точек касания
    this.touchPoints = document.createElement('div');
    this.touchPoints.className = 'gesture-touch-points';
    this.feedbackContainer.appendChild(this.touchPoints);
    
    // Создаем элемент для отображения информации о жесте
    this.gestureInfo = document.createElement('div');
    this.gestureInfo.className = 'gesture-info';
    this.gestureInfo.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
      z-index: 10000;
    `;
    this.feedbackContainer.appendChild(this.gestureInfo);
    
    // Добавляем контейнер в DOM
    document.body.appendChild(this.feedbackContainer);
  }
  
  /**
   * Обновляет визуальную обратную связь
   * @private
   */
  updateVisualFeedback() {
    if (!this.config.visualFeedback || !this.feedbackContainer) {
      return;
    }
    
    // Очищаем предыдущие точки касания
    this.touchPoints.innerHTML = '';
    
    // Добавляем новые точки касания
    this.gestureState.touches.forEach((touch, index) => {
      const point = document.createElement('div');
      point.className = 'gesture-touch-point';
      point.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(255, 0, 0, 0.5);
        border: 2px solid rgba(255, 0, 0, 0.8);
        transform: translate(-50%, -50%);
        left: ${touch.clientX}px;
        top: ${touch.clientY}px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      `;
      point.textContent = index + 1;
      this.touchPoints.appendChild(point);
    });
    
    // Обновляем информацию о жесте
    if (this.gestureState.active) {
      this.gestureInfo.textContent = `
        Type: ${this.gestureState.type || 'unknown'}
        Delta: ${Math.round(this.gestureState.deltaX)}, ${Math.round(this.gestureState.deltaY)}
        Velocity: ${this.gestureState.velocityX.toFixed(2)}, ${this.gestureState.velocityY.toFixed(2)}
        Distance: ${Math.round(this.gestureState.distance)}
        Angle: ${Math.round(this.gestureState.angle)}°
        Scale: ${this.gestureState.scale.toFixed(2)}
        Rotation: ${Math.round(this.gestureState.rotation)}°
        Touches: ${this.gestureState.touches.length}
      `;
      this.gestureInfo.style.display = 'block';
    } else {
      this.gestureInfo.style.display = 'none';
    }
  }
  
  /**
   * Регистрирует стандартные обработчики жестов
   * @private
   */
  registerDefaultGestureHandlers() {
    // Регистрируем обработчик тапа
    this.registerGestureHandler('tap', (event) => {
      const { startTime, currentX, currentY, startX, startY } = this.gestureState;
      const duration = Date.now() - startTime;
      const distance = this.getDistance(startX, startY, currentX, currentY);
      
      return (
        duration <= this.config.tapMaxDuration &&
        distance <= this.config.tapMaxDistance
      );
    });
    
    // Регистрируем обработчик двойного тапа
    this.registerGestureHandler('doubletap', (event) => {
      const { lastTapTime, tapCount } = this.gestureState;
      const now = Date.now();
      
      // Проверяем, был ли предыдущий тап недавно
      return (
        tapCount === 1 &&
        now - lastTapTime <= this.config.doubleTapDelay
      );
    });
    
    // Регистрируем обработчик долгого нажатия
    this.registerGestureHandler('longpress', (event) => {
      const { startTime, currentX, currentY, startX, startY } = this.gestureState;
      const duration = Date.now() - startTime;
      const distance = this.getDistance(startX, startY, currentX, currentY);
      
      return (
        duration >= this.config.longPressDelay &&
        distance <= this.config.tapMaxDistance
      );
    });
    
    // Регистрируем обработчик свайпа
    this.registerGestureHandler('swipe', (event) => {
      const { startTime, distance, velocityX, velocityY } = this.gestureState;
      const duration = Date.now() - startTime;
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      
      return (
        distance >= this.config.swipeMinDistance &&
        velocity >= this.config.swipeMinVelocity &&
        duration <= this.config.swipeMaxTime
      );
    });
    
    // Регистрируем обработчик пинча (масштабирования)
    this.registerGestureHandler('pinch', (event) => {
      const { scale, touches } = this.gestureState;
      
      return (
        touches.length >= 2 &&
        Math.abs(scale - 1) >= this.config.pinchMinScale
      );
    });
    
    // Регистрируем обработчик вращения
    this.registerGestureHandler('rotate', (event) => {
      const { rotation, touches } = this.gestureState;
      
      return (
        touches.length >= 2 &&
        Math.abs(rotation) >= this.config.rotateMinAngle
      );
    });
    
    // Регистрируем обработчик панорамирования
    this.registerGestureHandler('pan', (event) => {
      const { startX, startY, currentX, currentY } = this.gestureState;
      const distance = this.getDistance(startX, startY, currentX, currentY);
      
      return distance > 0;
    });
  }
  
  /**
   * Обработчик события нажатия указателя
   * @param {PointerEvent} event - Событие указателя
   * @private
   */
  handlePointerDown(event) {
    if (!this.config.enabled) {
      return;
    }
    
    // Предотвращаем стандартное поведение, если настроено
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
    
    // Получаем целевой элемент и его настройки жестов
    const target = event.target;
    const elementSettings = this.getElementGestureSettings(target);
    
    // Если жесты отключены для этого элемента, выходим
    if (elementSettings && elementSettings.enabled === false) {
      return;
    }
    
    // Добавляем идентификатор указателя в набор
    this.gestureState.pointerIds.add(event.pointerId);
    
    // Если это первое касание, инициализируем состояние жеста
    if (this.gestureState.pointerIds.size === 1) {
      this.gestureState.active = true;
      this.gestureState.type = null;
      this.gestureState.startTime = Date.now();
      this.gestureState.startX = event.clientX;
      this.gestureState.startY = event.clientY;
      this.gestureState.currentX = event.clientX;
      this.gestureState.currentY = event.clientY;
      this.gestureState.deltaX = 0;
      this.gestureState.deltaY = 0;
      this.gestureState.velocityX = 0;
      this.gestureState.velocityY = 0;
      this.gestureState.distance = 0;
      this.gestureState.angle = 0;
      this.gestureState.scale = 1;
      this.gestureState.rotation = 0;
      this.gestureState.touches = [];
      this.gestureState.lastMoveTime = Date.now();
    }
    
    // Добавляем касание в список
    this.gestureState.touches.push({
      id: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      target: event.target
    });
    
    // Обновляем визуальную обратную связь
    this.updateVisualFeedback();
    
    // Отправляем событие начала жеста
    this.eventEmitter.emit('gesture:start', {
      originalEvent: event,
      gestureState: { ...this.gestureState },
      target: event.target
    });
    
    // Запускаем таймер для распознавания долгого нажатия
    if (this.gestureState.pointerIds.size === 1) {
      this.longPressTimer = setTimeout(() => {
        if (
          this.gestureState.active &&
          this.gestureState.pointerIds.size === 1 &&
          this.isGestureRecognized('longpress')
        ) {
          this.gestureState.type = 'longpress';
          
          // Отправляем событие долгого нажатия
          this.eventEmitter.emit('gesture:longpress', {
            originalEvent: event,
            gestureState: { ...this.gestureState },
            target: event.target
          });
          
          // Обновляем визуальную обратную связь
          this.updateVisualFeedback();
        }
      }, this.config.longPressDelay);
    }
  }
  
  /**
   * Обработчик события движения указателя
   * @param {PointerEvent} event - Событие указателя
   * @private
   */
  handlePointerMove(event) {
    if (!this.config.enabled || !this.gestureState.active) {
      return;
    }
    
    // Предотвращаем стандартное поведение, если настроено
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
    
    // Если указатель не зарегистрирован, выходим
    if (!this.gestureState.pointerIds.has(event.pointerId)) {
      return;
    }
    
    // Обновляем информацию о касании
    const touchIndex = this.gestureState.touches.findIndex(touch => touch.id === event.pointerId);
    if (touchIndex !== -1) {
      this.gestureState.touches[touchIndex] = {
        id: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        target: event.target
      };
    }
    
    // Вычисляем время с последнего движения
    const now = Date.now();
    const deltaTime = now - this.gestureState.lastMoveTime;
    this.gestureState.lastMoveTime = now;
    
    // Обновляем текущие координаты (для одиночного касания)
    if (this.gestureState.pointerIds.size === 1) {
      this.gestureState.currentX = event.clientX;
      this.gestureState.currentY = event.clientY;
      
      // Вычисляем дельту
      this.gestureState.deltaX = event.clientX - this.gestureState.startX;
      this.gestureState.deltaY = event.clientY - this.gestureState.startY;
      
      // Вычисляем скорость
      if (deltaTime > 0) {
        const instantVelocityX = this.gestureState.deltaX / deltaTime;
        const instantVelocityY = this.gestureState.deltaY / deltaTime;
        
        // Сглаживаем скорость
        this.gestureState.velocityX = 0.7 * this.gestureState.velocityX + 0.3 * instantVelocityX;
        this.gestureState.velocityY = 0.7 * this.gestureState.velocityY + 0.3 * instantVelocityY;
      }
      
      // Вычисляем расстояние
      this.gestureState.distance = this.getDistance(
        this.gestureState.startX,
        this.gestureState.startY,
        this.gestureState.currentX,
        this.gestureState.currentY
      );
      
      // Вычисляем угол
      this.gestureState.angle = this.getAngle(
        this.gestureState.startX,
        this.gestureState.startY,
        this.gestureState.currentX,
        this.gestureState.currentY
      );
      
      // Определяем тип жеста
      if (this.gestureState.distance > this.config.tapMaxDistance) {
        this.gestureState.type = 'pan';
        
        // Отменяем таймер долгого нажатия
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      }
    } else if (this.gestureState.pointerIds.size >= 2) {
      // Для мультитач-жестов
      
      // Вычисляем центр касаний
      const center = this.getTouchesCenter(this.gestureState.touches);
      this.gestureState.currentX = center.x;
      this.gestureState.currentY = center.y;
      
      // Вычисляем дельту от начальной позиции
      this.gestureState.deltaX = center.x - this.gestureState.startX;
      this.gestureState.deltaY = center.y - this.gestureState.startY;
      
      // Вычисляем масштаб и вращение для двух касаний
      if (this.gestureState.touches.length >= 2) {
        const initialDistance = this.getDistance(
          this.gestureState.touches[0].clientX,
          this.gestureState.touches[0].clientY,
          this.gestureState.touches[1].clientX,
          this.gestureState.touches[1].clientY
        );
        
        const currentDistance = this.getDistance(
          this.gestureState.touches[0].clientX,
          this.gestureState.touches[0].clientY,
          this.gestureState.touches[1].clientX,
          this.gestureState.touches[1].clientY
        );
        
        // Вычисляем масштаб
        if (initialDistance > 0) {
          this.gestureState.scale = currentDistance / initialDistance;
        }
        
        // Вычисляем вращение
        const initialAngle = this.getAngle(
          this.gestureState.touches[0].clientX,
          this.gestureState.touches[0].clientY,
          this.gestureState.touches[1].clientX,
          this.gestureState.touches[1].clientY
        );
        
        const currentAngle = this.getAngle(
          this.gestureState.touches[0].clientX,
          this.gestureState.touches[0].clientY,
          this.gestureState.touches[1].clientX,
          this.gestureState.touches[1].clientY
        );
        
        this.gestureState.rotation = currentAngle - initialAngle;
        
        // Определяем тип жеста
        if (Math.abs(this.gestureState.scale - 1) >= this.config.pinchMinScale) {
          this.gestureState.type = 'pinch';
        } else if (Math.abs(this.gestureState.rotation) >= this.config.rotateMinAngle) {
          this.gestureState.type = 'rotate';
        } else {
          this.gestureState.type = 'pan';
        }
      }
    }
    
    // Обновляем визуальную обратную связь
    this.updateVisualFeedback();
    
    // Отправляем событие движения жеста
    this.eventEmitter.emit('gesture:move', {
      originalEvent: event,
      gestureState: { ...this.gestureState },
      target: event.target
    });
    
    // Отправляем специфичные события для типов жестов
    if (this.gestureState.type) {
      this.eventEmitter.emit(`gesture:${this.gestureState.type}`, {
        originalEvent: event,
        gestureState: { ...this.gestureState },
        target: event.target
      });
    }
  }
  
  /**
   * Обработчик события отпускания указателя
   * @param {PointerEvent} event - Событие указателя
   * @private
   */
  handlePointerUp(event) {
    if (!this.config.enabled || !this.gestureState.active) {
      return;
    }
    
    // Предотвращаем стандартное поведение, если настроено
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
    
    // Если указатель не зарегистрирован, выходим
    if (!this.gestureState.pointerIds.has(event.pointerId)) {
      return;
    }
    
    // Удаляем указатель из набора
    this.gestureState.pointerIds.delete(event.pointerId);
    
    // Удаляем касание из списка
    this.gestureState.touches = this.gestureState.touches.filter(touch => touch.id !== event.pointerId);
    
    // Если это последнее касание, завершаем жест
    if (this.gestureState.pointerIds.size === 0) {
      // Отменяем таймер долгого нажатия
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      
      // Определяем тип жеста, если он еще не определен
      if (!this.gestureState.type) {
        // Проверяем, был ли это тап
        if (this.isGestureRecognized('tap')) {
          const now = Date.now();
          
          // Проверяем, был ли это двойной тап
          if (now - this.gestureState.lastTapTime <= this.config.doubleTapDelay) {
            this.gestureState.type = 'doubletap';
            this.gestureState.tapCount = 0;
            this.gestureState.lastTapTime = 0;
          } else {
            this.gestureState.type = 'tap';
            this.gestureState.tapCount = 1;
            this.gestureState.lastTapTime = now;
          }
        }
      } else if (this.gestureState.type === 'pan') {
        // Проверяем, был ли это свайп
        if (this.isGestureRecognized('swipe')) {
          this.gestureState.type = 'swipe';
          
          // Определяем направление свайпа
          const angle = this.gestureState.angle;
          let direction;
          
          if (angle >= -45 && angle < 45) {
            direction = 'right';
          } else if (angle >= 45 && angle < 135) {
            direction = 'down';
          } else if (angle >= 135 || angle < -135) {
            direction = 'left';
          } else {
            direction = 'up';
          }
          
          this.gestureState.direction = direction;
        }
      }
      
      // Отправляем событие завершения жеста
      this.eventEmitter.emit('gesture:end', {
        originalEvent: event,
        gestureState: { ...this.gestureState },
        target: event.target
      });
      
      // Отправляем специфичные события для типов жестов
      if (this.gestureState.type) {
        this.eventEmitter.emit(`gesture:${this.gestureState.type}`, {
          originalEvent: event,
          gestureState: { ...this.gestureState },
          target: event.target
        });
      }
      
      // Запускаем инерцию, если включена и есть скорость
      if (
        this.config.inertiaEnabled &&
        (Math.abs(this.gestureState.velocityX) > this.config.inertiaMinVelocity ||
         Math.abs(this.gestureState.velocityY) > this.config.inertiaMinVelocity)
      ) {
        this.startInertia();
      }
      
      // Сбрасываем активное состояние жеста
      this.gestureState.active = false;
      
      // Обновляем визуальную обратную связь
      this.updateVisualFeedback();
    } else {
      // Если остались другие касания, обновляем состояние
      this.updateVisualFeedback();
    }
  }
  
  /**
   * Обработчик события отмены указателя
   * @param {PointerEvent} event - Событие указателя
   * @private
   */
  handlePointerCancel(event) {
    if (!this.config.enabled || !this.gestureState.active) {
      return;
    }
    
    // Удаляем указатель из набора
    this.gestureState.pointerIds.delete(event.pointerId);
    
    // Удаляем касание из списка
    this.gestureState.touches = this.gestureState.touches.filter(touch => touch.id !== event.pointerId);
    
    // Если это последнее касание, отменяем жест
    if (this.gestureState.pointerIds.size === 0) {
      // Отменяем таймер долгого нажатия
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      
      // Отправляем событие отмены жеста
      this.eventEmitter.emit('gesture:cancel', {
        originalEvent: event,
        gestureState: { ...this.gestureState },
        target: event.target
      });
      
      // Сбрасываем активное состояние жеста
      this.gestureState.active = false;
      this.gestureState.type = null;
      
      // Обновляем визуальную обратную связь
      this.updateVisualFeedback();
    } else {
      // Если остались другие касания, обновляем состояние
      this.updateVisualFeedback();
    }
  }
  
  /**
   * Обработчик события колесика мыши
   * @param {WheelEvent} event - Событие колесика мыши
   * @private
   */
  handleWheel(event) {
    if (!this.config.enabled) {
      return;
    }
    
    // Получаем целевой элемент и его настройки жестов
    const target = event.target;
    const elementSettings = this.getElementGestureSettings(target);
    
    // Если жесты отключены для этого элемента, выходим
    if (elementSettings && elementSettings.enabled === false) {
      return;
    }
    
    // Создаем состояние жеста для колесика
    const wheelGestureState = {
      type: 'wheel',
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ,
      deltaMode: event.deltaMode,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey
    };
    
    // Отправляем событие колесика
    this.eventEmitter.emit('gesture:wheel', {
      originalEvent: event,
      gestureState: wheelGestureState,
      target: event.target
    });
    
    // Предотвращаем стандартное поведение, если настроено
    if (this.config.preventDefaultEvents && !event.ctrlKey) {
      event.preventDefault();
    }
  }
  
  /**
   * Обработчик события контекстного меню
   * @param {MouseEvent} event - Событие контекстного меню
   * @private
   */
  handleContextMenu(event) {
    if (!this.config.enabled) {
      return;
    }
    
    // Получаем целевой элемент и его настройки жестов
    const target = event.target;
    const elementSettings = this.getElementGestureSettings(target);
    
    // Если жесты отключены для этого элемента, выходим
    if (elementSettings && elementSettings.enabled === false) {
      return;
    }
    
    // Предотвращаем стандартное поведение, если настроено
    if (this.config.preventDefaultEvents) {
      event.preventDefault();
    }
  }
  
  /**
   * Запускает инерцию после завершения жеста
   * @private
   */
  startInertia() {
    // Копируем текущую скорость
    let velocityX = this.gestureState.velocityX;
    let velocityY = this.gestureState.velocityY;
    
    // Функция для анимации инерции
    const animateInertia = () => {
      // Если скорость слишком мала, останавливаем инерцию
      if (
        Math.abs(velocityX) < this.config.inertiaMinVelocity &&
        Math.abs(velocityY) < this.config.inertiaMinVelocity
      ) {
        return;
      }
      
      // Вычисляем смещение
      const deltaX = velocityX;
      const deltaY = velocityY;
      
      // Отправляем событие инерции
      this.eventEmitter.emit('gesture:inertia', {
        gestureState: {
          type: 'inertia',
          deltaX,
          deltaY,
          velocityX,
          velocityY
        }
      });
      
      // Уменьшаем скорость
      velocityX *= this.config.inertiaDecay;
      velocityY *= this.config.inertiaDecay;
      
      // Продолжаем анимацию
      requestAnimationFrame(animateInertia);
    };
    
    // Запускаем анимацию
    requestAnimationFrame(animateInertia);
  }
  
  /**
   * Проверяет, распознан ли жест определенного типа
   * @param {string} gestureType - Тип жеста
   * @returns {boolean} true, если жест распознан
   * @private
   */
  isGestureRecognized(gestureType) {
    const handler = this.gestureHandlers.get(gestureType);
    if (!handler) {
      return false;
    }
    
    return handler(this.gestureState);
  }
  
  /**
   * Вычисляет расстояние между двумя точками
   * @param {number} x1 - Координата X первой точки
   * @param {number} y1 - Координата Y первой точки
   * @param {number} x2 - Координата X второй точки
   * @param {number} y2 - Координата Y второй точки
   * @returns {number} Расстояние между точками
   * @private
   */
  getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  /**
   * Вычисляет угол между двумя точками
   * @param {number} x1 - Координата X первой точки
   * @param {number} y1 - Координата Y первой точки
   * @param {number} x2 - Координата X второй точки
   * @param {number} y2 - Координата Y второй точки
   * @returns {number} Угол в градусах
   * @private
   */
  getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  }
  
  /**
   * Вычисляет центр касаний
   * @param {Array} touches - Массив касаний
   * @returns {Object} Координаты центра {x, y}
   * @private
   */
  getTouchesCenter(touches) {
    if (!touches.length) {
      return { x: 0, y: 0 };
    }
    
    const sum = touches.reduce(
      (acc, touch) => {
        acc.x += touch.clientX;
        acc.y += touch.clientY;
        return acc;
      },
      { x: 0, y: 0 }
    );
    
    return {
      x: sum.x / touches.length,
      y: sum.y / touches.length
    };
  }
  
  /**
   * Получает настройки жестов для элемента
   * @param {HTMLElement} element - Элемент
   * @returns {Object|null} Настройки жестов или null, если не найдены
   * @private
   */
  getElementGestureSettings(element) {
    // Проверяем, есть ли настройки для этого элемента
    if (this.gestureElements.has(element)) {
      return this.gestureElements.get(element);
    }
    
    // Проверяем родительские элементы
    let parent = element.parentElement;
    while (parent) {
      if (this.gestureElements.has(parent)) {
        return this.gestureElements.get(parent);
      }
      parent = parent.parentElement;
    }
    
    return null;
  }
  
  /**
   * Регистрирует обработчик жеста
   * @param {string} gestureType - Тип жеста
   * @param {Function} handler - Функция-обработчик
   * @returns {GestureManager} Экземпляр менеджера жестов
   */
  registerGestureHandler(gestureType, handler) {
    if (typeof handler !== 'function') {
      this.logger.error(`GestureManager: handler for "${gestureType}" must be a function`);
      return this;
    }
    
    this.gestureHandlers.set(gestureType, handler);
    this.logger.debug(`GestureManager: registered handler for "${gestureType}"`);
    
    return this;
  }
  
  /**
   * Удаляет обработчик жеста
   * @param {string} gestureType - Тип жеста
   * @returns {boolean} true, если обработчик был удален
   */
  unregisterGestureHandler(gestureType) {
    const result = this.gestureHandlers.delete(gestureType);
    
    if (result) {
      this.logger.debug(`GestureManager: unregistered handler for "${gestureType}"`);
    }
    
    return result;
  }
  
  /**
   * Регистрирует элемент для обработки жестов
   * @param {HTMLElement} element - Элемент
   * @param {Object} settings - Настройки жестов
   * @returns {GestureManager} Экземпляр менеджера жестов
   */
  registerElement(element, settings = {}) {
    if (!(element instanceof HTMLElement)) {
      this.logger.error('GestureManager: element must be an HTMLElement');
      return this;
    }
    
    const defaultSettings = {
      enabled: true,
      preventDefaultEvents: this.config.preventDefaultEvents,
      gestures: {
        tap: true,
        doubletap: true,
        longpress: true,
        swipe: true,
        pinch: true,
        rotate: true,
        pan: true,
        wheel: true
      }
    };
    
    const mergedSettings = { ...defaultSettings, ...settings };
    this.gestureElements.set(element, mergedSettings);
    
    this.logger.debug(`GestureManager: registered element ${element.tagName}${element.id ? '#' + element.id : ''}`);
    
    return this;
  }
  
  /**
   * Удаляет элемент из обработки жестов
   * @param {HTMLElement} element - Элемент
   * @returns {boolean} true, если элемент был удален
   */
  unregisterElement(element) {
    const result = this.gestureElements.delete(element);
    
    if (result) {
      this.logger.debug(`GestureManager: unregistered element ${element.tagName}${element.id ? '#' + element.id : ''}`);
    }
    
    return result;
  }
  
  /**
   * Включает или отключает жесты
   * @param {boolean} enabled - Флаг включения
   * @returns {GestureManager} Экземпляр менеджера жестов
   */
  setEnabled(enabled) {
    this.config.enabled = !!enabled;
    
    this.logger.info(`GestureManager: ${enabled ? 'enabled' : 'disabled'}`);
    this.eventEmitter.emit('gestureManager:enabledChanged', { enabled: this.config.enabled });
    
    return this;
  }
  
  /**
   * Включает или отключает предотвращение стандартного поведения
   * @param {boolean} prevent - Флаг предотвращения
   * @returns {GestureManager} Экземпляр менеджера жестов
   */
  setPreventDefaultEvents(prevent) {
    this.config.preventDefaultEvents = !!prevent;
    
    this.logger.info(`GestureManager: prevent default events ${prevent ? 'enabled' : 'disabled'}`);
    
    return this;
  }
  
  /**
   * Включает или отключает визуальную обратную связь
   * @param {boolean} enabled - Флаг включения
   * @returns {GestureManager} Экземпляр менеджера жестов
   */
  setVisualFeedback(enabled) {
    this.config.visualFeedback = !!enabled;
    
    if (enabled && !this.feedbackContainer) {
      this.createVisualFeedback();
    } else if (!enabled && this.feedbackContainer) {
      document.body.removeChild(this.feedbackContainer);
      this.feedbackContainer = null;
    }
    
    this.logger.info(`GestureManager: visual feedback ${enabled ? 'enabled' : 'disabled'}`);
    
    return this;
  }
  
  /**
   * Обновляет конфигурацию менеджера жестов
   * @param {Object} config - Новая конфигурация
   * @returns {GestureManager} Экземпляр менеджера жестов
   */
  updateConfig(config) {
    this.config = this.mergeConfig(config);
    
    this.logger.info('GestureManager: config updated');
    this.eventEmitter.emit('gestureManager:configUpdated', { config: { ...this.config } });
    
    return this;
  }
  
  /**
   * Получает текущую конфигурацию
   * @returns {Object} Текущая конфигурация
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Получает текущее состояние жеста
   * @returns {Object} Текущее состояние жеста
   */
  getGestureState() {
    return { ...this.gestureState };
  }
  
  /**
   * Уничтожает менеджер жестов и освобождает ресурсы
   */
  destroy() {
    if (this.isDestroyed) {
      return;
    }
    
    this.logger.info('GestureManager: destroying');
    
    // Отменяем таймер долгого нажатия
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Удаляем визуальную обратную связь
    if (this.feedbackContainer && document.body.contains(this.feedbackContainer)) {
      document.body.removeChild(this.feedbackContainer);
      this.feedbackContainer = null;
    }
    
    // Очищаем карты
    this.gestureHandlers.clear();
    this.gestureElements.clear();
    
    // Сбрасываем состояние
    this.gestureState = {
      active: false,
      type: null,
      startTime: 0,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0,
      distance: 0,
      angle: 0,
      scale: 1,
      rotation: 0,
      touches: [],
      pointerIds: new Set(),
      lastMoveTime: 0,
      lastTapTime: 0,
      tapCount: 0
    };
    
    this.isInitialized = false;
    this.isDestroyed = true;
    
    this.eventEmitter.emit('gestureManager:destroyed');
    
    this.logger.info('GestureManager: destroyed');
  }
}

module.exports = GestureManager;
