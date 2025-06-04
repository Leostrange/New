/**
 * @file AnimationManager.js
 * @description Менеджер анимаций для приложения Mr.Comic
 * @module ui/AnimationManager
 */

/**
 * Класс для управления анимациями пользовательского интерфейса
 */
class AnimationManager {
  /**
   * Создает экземпляр менеджера анимаций
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация анимаций
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = this.mergeConfig(options.config || {});
    
    // Карта активных анимаций
    this.activeAnimations = new Map();
    
    // Карта предопределенных анимаций
    this.predefinedAnimations = new Map();
    
    // Счетчик для генерации уникальных идентификаторов
    this.animationCounter = 0;
    
    // Флаги состояния
    this.isInitialized = false;
    this.isPaused = false;
    
    // Привязка методов к контексту
    this.update = this.update.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleReducedMotionChange = this.handleReducedMotionChange.bind(this);
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
      defaultDuration: 300,
      defaultEasing: 'ease',
      defaultDelay: 0,
      
      // Настройки производительности
      useRequestAnimationFrame: true,
      useTransforms: true,
      useGPU: true,
      throttleRAF: false,
      
      // Настройки для доступности
      respectReducedMotion: true,
      reducedMotionDuration: 100,
      
      // Настройки для отладки
      debug: false,
      visualFeedback: false
    };
    
    return { ...defaultConfig, ...userConfig };
  }
  
  /**
   * Инициализирует менеджер анимаций
   * @returns {AnimationManager} Экземпляр менеджера анимаций
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('AnimationManager: already initialized');
      return this;
    }
    
    this.logger.info('AnimationManager: initializing');
    
    // Регистрируем предопределенные анимации
    this.registerPredefinedAnimations();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Запускаем цикл обновления
    if (this.config.useRequestAnimationFrame) {
      this.rafId = requestAnimationFrame(this.update);
    }
    
    this.isInitialized = true;
    this.eventEmitter.emit('animationManager:initialized');
    
    return this;
  }
  
  /**
   * Регистрирует предопределенные анимации
   * @private
   */
  registerPredefinedAnimations() {
    // Анимации появления
    this.registerAnimation('fadeIn', {
      properties: {
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    this.registerAnimation('slideInRight', {
      properties: {
        transform: { from: 'translateX(100%)', to: 'translateX(0)' }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerAnimation('slideInLeft', {
      properties: {
        transform: { from: 'translateX(-100%)', to: 'translateX(0)' }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerAnimation('slideInUp', {
      properties: {
        transform: { from: 'translateY(100%)', to: 'translateY(0)' }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerAnimation('slideInDown', {
      properties: {
        transform: { from: 'translateY(-100%)', to: 'translateY(0)' }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerAnimation('zoomIn', {
      properties: {
        transform: { from: 'scale(0.5)', to: 'scale(1)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    // Анимации исчезновения
    this.registerAnimation('fadeOut', {
      properties: {
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerAnimation('slideOutRight', {
      properties: {
        transform: { from: 'translateX(0)', to: 'translateX(100%)' }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    this.registerAnimation('slideOutLeft', {
      properties: {
        transform: { from: 'translateX(0)', to: 'translateX(-100%)' }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    this.registerAnimation('slideOutUp', {
      properties: {
        transform: { from: 'translateY(0)', to: 'translateY(-100%)' }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    this.registerAnimation('slideOutDown', {
      properties: {
        transform: { from: 'translateY(0)', to: 'translateY(100%)' }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    this.registerAnimation('zoomOut', {
      properties: {
        transform: { from: 'scale(1)', to: 'scale(0.5)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации внимания
    this.registerAnimation('pulse', {
      properties: {
        transform: [
          { value: 'scale(1)', offset: 0 },
          { value: 'scale(1.05)', offset: 0.5 },
          { value: 'scale(1)', offset: 1 }
        ]
      },
      duration: 500,
      easing: 'ease-in-out',
      iterations: 1
    });
    
    this.registerAnimation('shake', {
      properties: {
        transform: [
          { value: 'translateX(0)', offset: 0 },
          { value: 'translateX(-10px)', offset: 0.1 },
          { value: 'translateX(10px)', offset: 0.3 },
          { value: 'translateX(-10px)', offset: 0.5 },
          { value: 'translateX(10px)', offset: 0.7 },
          { value: 'translateX(-5px)', offset: 0.9 },
          { value: 'translateX(0)', offset: 1 }
        ]
      },
      duration: 500,
      easing: 'ease-in-out',
      iterations: 1
    });
    
    this.registerAnimation('bounce', {
      properties: {
        transform: [
          { value: 'translateY(0)', offset: 0 },
          { value: 'translateY(-20px)', offset: 0.4 },
          { value: 'translateY(0)', offset: 0.5 },
          { value: 'translateY(-10px)', offset: 0.7 },
          { value: 'translateY(0)', offset: 1 }
        ]
      },
      duration: 800,
      easing: 'cubic-bezier(0.280, 0.840, 0.420, 1)',
      iterations: 1
    });
    
    // Анимации переходов
    this.registerAnimation('crossFade', {
      properties: {
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease',
      additionalStyles: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }
    });
    
    // Анимации отклика
    this.registerAnimation('buttonClick', {
      properties: {
        transform: [
          { value: 'scale(1)', offset: 0 },
          { value: 'scale(0.95)', offset: 0.5 },
          { value: 'scale(1)', offset: 1 }
        ]
      },
      duration: 200,
      easing: 'ease-out',
      iterations: 1
    });
    
    this.registerAnimation('ripple', {
      properties: {
        transform: { from: 'scale(0)', to: 'scale(2)' },
        opacity: [
          { value: 0.5, offset: 0 },
          { value: 0.3, offset: 0.5 },
          { value: 0, offset: 1 }
        ]
      },
      duration: 600,
      easing: 'ease-out',
      iterations: 1,
      additionalStyles: {
        position: 'absolute',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        pointerEvents: 'none'
      }
    });
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения видимости страницы
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Обработчик изменения настроек уменьшенного движения
    if (this.config.respectReducedMotion && window.matchMedia) {
      this.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (this.reducedMotionMediaQuery.addEventListener) {
        this.reducedMotionMediaQuery.addEventListener('change', this.handleReducedMotionChange);
      } else if (this.reducedMotionMediaQuery.addListener) {
        // Для старых браузеров
        this.reducedMotionMediaQuery.addListener(this.handleReducedMotionChange);
      }
      
      // Проверяем текущее состояние
      this.handleReducedMotionChange(this.reducedMotionMediaQuery);
    }
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    if (this.reducedMotionMediaQuery) {
      if (this.reducedMotionMediaQuery.removeEventListener) {
        this.reducedMotionMediaQuery.removeEventListener('change', this.handleReducedMotionChange);
      } else if (this.reducedMotionMediaQuery.removeListener) {
        // Для старых браузеров
        this.reducedMotionMediaQuery.removeListener(this.handleReducedMotionChange);
      }
    }
  }
  
  /**
   * Обработчик изменения видимости страницы
   * @private
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }
  
  /**
   * Обработчик изменения настроек уменьшенного движения
   * @param {MediaQueryListEvent|MediaQueryList} event - Событие или объект медиа-запроса
   * @private
   */
  handleReducedMotionChange(event) {
    const reducedMotion = event.matches;
    
    this.logger.info(`AnimationManager: reduced motion ${reducedMotion ? 'enabled' : 'disabled'}`);
    this.eventEmitter.emit('animationManager:reducedMotionChanged', { reducedMotion });
    
    // Обновляем длительность анимаций
    if (reducedMotion) {
      this.config.defaultDuration = this.config.reducedMotionDuration;
    } else {
      // Восстанавливаем значение по умолчанию из конфигурации
      this.config.defaultDuration = this.mergeConfig({}).defaultDuration;
    }
  }
  
  /**
   * Цикл обновления анимаций
   * @param {number} timestamp - Временная метка
   * @private
   */
  update(timestamp) {
    if (!this.isInitialized || this.isPaused) {
      return;
    }
    
    // Обновляем все активные анимации
    this.activeAnimations.forEach((animation, id) => {
      if (!animation.startTime) {
        animation.startTime = timestamp;
      }
      
      const elapsed = timestamp - animation.startTime;
      
      if (elapsed < animation.delay) {
        // Анимация еще в задержке
        return;
      }
      
      const progress = Math.min(1, (elapsed - animation.delay) / animation.duration);
      
      if (progress < 1) {
        // Анимация в процессе
        this.updateAnimation(animation, progress);
      } else {
        // Анимация завершена
        this.completeAnimation(id, animation);
      }
    });
    
    // Планируем следующее обновление
    if (this.config.useRequestAnimationFrame) {
      this.rafId = requestAnimationFrame(this.update);
    }
  }
  
  /**
   * Обновляет состояние анимации
   * @param {Object} animation - Объект анимации
   * @param {number} progress - Прогресс анимации (0-1)
   * @private
   */
  updateAnimation(animation, progress) {
    const { element, properties, easing } = animation;
    
    // Применяем функцию плавности
    const easedProgress = this.applyEasing(progress, easing);
    
    // Обновляем свойства элемента
    for (const [property, value] of Object.entries(properties)) {
      if (Array.isArray(value)) {
        // Для keyframes-анимаций
        const keyframe = this.interpolateKeyframes(value, easedProgress);
        element.style[property] = keyframe;
      } else if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
        // Для анимаций from-to
        const interpolatedValue = this.interpolateValue(value.from, value.to, easedProgress);
        element.style[property] = interpolatedValue;
      }
    }
    
    // Вызываем колбэк обновления
    if (typeof animation.onUpdate === 'function') {
      animation.onUpdate(easedProgress, element);
    }
    
    // Отправляем событие обновления
    this.eventEmitter.emit('animation:update', {
      id: animation.id,
      element,
      progress: easedProgress
    });
  }
  
  /**
   * Завершает анимацию
   * @param {string} id - Идентификатор анимации
   * @param {Object} animation - Объект анимации
   * @private
   */
  completeAnimation(id, animation) {
    const { element, properties, iterations, currentIteration = 0, direction } = animation;
    
    // Проверяем, нужно ли повторить анимацию
    if (iterations === 'infinite' || currentIteration < iterations - 1) {
      // Увеличиваем счетчик итераций
      animation.currentIteration = currentIteration + 1;
      
      // Сбрасываем время начала
      animation.startTime = null;
      
      // Если направление alternate, меняем направление
      if (direction === 'alternate') {
        animation.isReversed = !animation.isReversed;
      }
      
      return;
    }
    
    // Устанавливаем конечные значения свойств
    for (const [property, value] of Object.entries(properties)) {
      if (Array.isArray(value)) {
        // Для keyframes-анимаций
        const lastKeyframe = value[value.length - 1];
        element.style[property] = lastKeyframe.value;
      } else if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
        // Для анимаций from-to
        element.style[property] = value.to;
      }
    }
    
    // Удаляем анимацию из активных
    this.activeAnimations.delete(id);
    
    // Вызываем колбэк завершения
    if (typeof animation.onComplete === 'function') {
      animation.onComplete(element);
    }
    
    // Отправляем событие завершения
    this.eventEmitter.emit('animation:complete', {
      id,
      element
    });
    
    // Если есть следующая анимация, запускаем ее
    if (animation.next) {
      this.animate(element, animation.next);
    }
  }
  
  /**
   * Применяет функцию плавности к прогрессу
   * @param {number} progress - Прогресс анимации (0-1)
   * @param {string|Function} easing - Функция плавности или ее название
   * @returns {number} Прогресс с примененной функцией плавности
   * @private
   */
  applyEasing(progress, easing) {
    if (typeof easing === 'function') {
      return easing(progress);
    }
    
    switch (easing) {
      case 'linear':
        return progress;
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return progress * (2 - progress);
      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
      case 'cubic-bezier(0.280, 0.840, 0.420, 1)':
        // Аппроксимация кубической кривой Безье
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      default:
        return progress;
    }
  }
  
  /**
   * Интерполирует значение между начальным и конечным
   * @param {string|number} from - Начальное значение
   * @param {string|number} to - Конечное значение
   * @param {number} progress - Прогресс (0-1)
   * @returns {string|number} Интерполированное значение
   * @private
   */
  interpolateValue(from, to, progress) {
    // Если значения числовые
    if (typeof from === 'number' && typeof to === 'number') {
      return from + (to - from) * progress;
    }
    
    // Если значения строковые, пытаемся извлечь числа и единицы измерения
    const fromMatch = String(from).match(/^(-?\d+\.?\d*)(.*)$/);
    const toMatch = String(to).match(/^(-?\d+\.?\d*)(.*)$/);
    
    if (fromMatch && toMatch && fromMatch[2] === toMatch[2]) {
      const fromValue = parseFloat(fromMatch[1]);
      const toValue = parseFloat(toMatch[1]);
      const unit = fromMatch[2];
      
      return (fromValue + (toValue - fromValue) * progress) + unit;
    }
    
    // Если не удалось интерполировать, возвращаем конечное значение при прогрессе >= 0.5
    return progress >= 0.5 ? to : from;
  }
  
  /**
   * Интерполирует ключевые кадры
   * @param {Array} keyframes - Массив ключевых кадров
   * @param {number} progress - Прогресс (0-1)
   * @returns {string} Интерполированное значение
   * @private
   */
  interpolateKeyframes(keyframes, progress) {
    // Если только один ключевой кадр, возвращаем его значение
    if (keyframes.length === 1) {
      return keyframes[0].value;
    }
    
    // Находим два ключевых кадра, между которыми находится текущий прогресс
    let startKeyframe = keyframes[0];
    let endKeyframe = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].offset && progress <= keyframes[i + 1].offset) {
        startKeyframe = keyframes[i];
        endKeyframe = keyframes[i + 1];
        break;
      }
    }
    
    // Вычисляем локальный прогресс между двумя ключевыми кадрами
    const localProgress = (progress - startKeyframe.offset) / (endKeyframe.offset - startKeyframe.offset);
    
    // Интерполируем значение
    return this.interpolateValue(startKeyframe.value, endKeyframe.value, localProgress);
  }
  
  /**
   * Регистрирует предопределенную анимацию
   * @param {string} name - Название анимации
   * @param {Object} options - Параметры анимации
   * @returns {AnimationManager} Экземпляр менеджера анимаций
   */
  registerAnimation(name, options) {
    this.predefinedAnimations.set(name, options);
    
    this.logger.debug(`AnimationManager: registered animation "${name}"`);
    
    return this;
  }
  
  /**
   * Получает предопределенную анимацию
   * @param {string} name - Название анимации
   * @returns {Object|null} Параметры анимации или null, если анимация не найдена
   */
  getAnimation(name) {
    return this.predefinedAnimations.get(name) || null;
  }
  
  /**
   * Анимирует элемент
   * @param {HTMLElement} element - Элемент для анимации
   * @param {string|Object} animation - Название предопределенной анимации или объект с параметрами
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string} Идентификатор анимации
   */
  animate(element, animation, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationManager: not initialized');
      return null;
    }
    
    if (!this.config.enabled) {
      this.logger.warn('AnimationManager: animations disabled');
      return null;
    }
    
    if (!(element instanceof HTMLElement)) {
      this.logger.error('AnimationManager: element must be an HTMLElement');
      return null;
    }
    
    // Получаем параметры анимации
    let animationOptions;
    
    if (typeof animation === 'string') {
      // Если передано название предопределенной анимации
      animationOptions = this.getAnimation(animation);
      
      if (!animationOptions) {
        this.logger.error(`AnimationManager: animation "${animation}" not found`);
        return null;
      }
    } else if (typeof animation === 'object') {
      // Если передан объект с параметрами
      animationOptions = animation;
    } else {
      this.logger.error('AnimationManager: animation must be a string or an object');
      return null;
    }
    
    // Объединяем параметры
    const mergedOptions = {
      ...animationOptions,
      ...options,
      element,
      id: `animation_${++this.animationCounter}`,
      startTime: null,
      currentIteration: 0,
      isReversed: false
    };
    
    // Устанавливаем значения по умолчанию
    mergedOptions.duration = mergedOptions.duration || this.config.defaultDuration;
    mergedOptions.easing = mergedOptions.easing || this.config.defaultEasing;
    mergedOptions.delay = mergedOptions.delay || this.config.defaultDelay;
    mergedOptions.iterations = mergedOptions.iterations || 1;
    mergedOptions.direction = mergedOptions.direction || 'normal';
    
    // Если включено уважение к настройке уменьшенного движения
    if (this.config.respectReducedMotion && this.reducedMotionMediaQuery?.matches) {
      mergedOptions.duration = this.config.reducedMotionDuration;
    }
    
    // Применяем дополнительные стили
    if (mergedOptions.additionalStyles) {
      for (const [property, value] of Object.entries(mergedOptions.additionalStyles)) {
        element.style[property] = value;
      }
    }
    
    // Если включено использование GPU
    if (this.config.useGPU && this.config.useTransforms) {
      element.style.willChange = 'transform, opacity';
    }
    
    // Добавляем анимацию в активные
    this.activeAnimations.set(mergedOptions.id, mergedOptions);
    
    // Отправляем событие начала анимации
    this.eventEmitter.emit('animation:start', {
      id: mergedOptions.id,
      element,
      options: mergedOptions
    });
    
    // Если не используется requestAnimationFrame, запускаем обновление через интервал
    if (!this.config.useRequestAnimationFrame && !this.updateInterval) {
      this.updateInterval = setInterval(() => {
        this.update(performance.now());
      }, 16); // ~60fps
    }
    
    return mergedOptions.id;
  }
  
  /**
   * Останавливает анимацию
   * @param {string} id - Идентификатор анимации
   * @param {boolean} [jumpToEnd=false] - Флаг перехода к концу анимации
   * @returns {boolean} true, если анимация была остановлена
   */
  stop(id, jumpToEnd = false) {
    if (!this.activeAnimations.has(id)) {
      return false;
    }
    
    const animation = this.activeAnimations.get(id);
    
    if (jumpToEnd) {
      // Устанавливаем конечные значения свойств
      for (const [property, value] of Object.entries(animation.properties)) {
        if (Array.isArray(value)) {
          // Для keyframes-анимаций
          const lastKeyframe = value[value.length - 1];
          animation.element.style[property] = lastKeyframe.value;
        } else if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
          // Для анимаций from-to
          animation.element.style[property] = value.to;
        }
      }
    }
    
    // Удаляем анимацию из активных
    this.activeAnimations.delete(id);
    
    // Вызываем колбэк остановки
    if (typeof animation.onStop === 'function') {
      animation.onStop(animation.element, jumpToEnd);
    }
    
    // Отправляем событие остановки
    this.eventEmitter.emit('animation:stop', {
      id,
      element: animation.element,
      jumpToEnd
    });
    
    return true;
  }
  
  /**
   * Останавливает все анимации элемента
   * @param {HTMLElement} element - Элемент
   * @param {boolean} [jumpToEnd=false] - Флаг перехода к концу анимации
   * @returns {number} Количество остановленных анимаций
   */
  stopAll(element, jumpToEnd = false) {
    let count = 0;
    
    this.activeAnimations.forEach((animation, id) => {
      if (animation.element === element) {
        this.stop(id, jumpToEnd);
        count++;
      }
    });
    
    return count;
  }
  
  /**
   * Приостанавливает все анимации
   */
  pause() {
    if (this.isPaused) {
      return;
    }
    
    this.isPaused = true;
    
    // Сохраняем время паузы
    this.pauseTime = performance.now();
    
    // Отменяем requestAnimationFrame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Останавливаем интервал обновления
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.logger.info('AnimationManager: paused');
    this.eventEmitter.emit('animationManager:paused');
  }
  
  /**
   * Возобновляет все анимации
   */
  resume() {
    if (!this.isPaused) {
      return;
    }
    
    this.isPaused = false;
    
    // Вычисляем время паузы
    const pauseDuration = performance.now() - this.pauseTime;
    
    // Корректируем время начала всех анимаций
    this.activeAnimations.forEach(animation => {
      if (animation.startTime) {
        animation.startTime += pauseDuration;
      }
    });
    
    // Возобновляем requestAnimationFrame
    if (this.config.useRequestAnimationFrame) {
      this.rafId = requestAnimationFrame(this.update);
    } else {
      // Возобновляем интервал обновления
      this.updateInterval = setInterval(() => {
        this.update(performance.now());
      }, 16); // ~60fps
    }
    
    this.logger.info('AnimationManager: resumed');
    this.eventEmitter.emit('animationManager:resumed');
  }
  
  /**
   * Создает анимацию перехода между экранами
   * @param {HTMLElement} fromElement - Исходный элемент
   * @param {HTMLElement} toElement - Целевой элемент
   * @param {string|Object} animation - Название предопределенной анимации или объект с параметрами
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string} Идентификатор анимации
   */
  transition(fromElement, toElement, animation, options = {}) {
    // Скрываем целевой элемент
    toElement.style.visibility = 'hidden';
    
    // Анимируем исчезновение исходного элемента
    const hideId = this.animate(fromElement, typeof animation === 'string' ? `${animation}Out` : animation, {
      ...options,
      onComplete: () => {
        // Скрываем исходный элемент
        fromElement.style.visibility = 'hidden';
        
        // Показываем целевой элемент
        toElement.style.visibility = 'visible';
        
        // Анимируем появление целевого элемента
        this.animate(toElement, typeof animation === 'string' ? `${animation}In` : animation, {
          ...options,
          onComplete: () => {
            // Вызываем колбэк завершения
            if (typeof options.onComplete === 'function') {
              options.onComplete(fromElement, toElement);
            }
            
            // Отправляем событие завершения перехода
            this.eventEmitter.emit('animation:transitionComplete', {
              fromElement,
              toElement
            });
          }
        });
      }
    });
    
    return hideId;
  }
  
  /**
   * Создает анимацию отклика на действие пользователя
   * @param {HTMLElement} element - Элемент
   * @param {string} type - Тип отклика ('click', 'hover', 'focus')
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string} Идентификатор анимации
   */
  feedback(element, type, options = {}) {
    let animation;
    
    switch (type) {
      case 'click':
        animation = 'buttonClick';
        break;
      case 'hover':
        animation = 'pulse';
        break;
      case 'focus':
        animation = 'pulse';
        break;
      default:
        animation = 'pulse';
    }
    
    return this.animate(element, animation, options);
  }
  
  /**
   * Создает анимацию эффекта волны (ripple)
   * @param {HTMLElement} element - Элемент
   * @param {number} x - Координата X относительно элемента
   * @param {number} y - Координата Y относительно элемента
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string} Идентификатор анимации
   */
  ripple(element, x, y, options = {}) {
    // Создаем элемент для эффекта волны
    const rippleElement = document.createElement('div');
    rippleElement.className = 'animation-ripple';
    
    // Устанавливаем начальную позицию
    rippleElement.style.position = 'absolute';
    rippleElement.style.left = `${x}px`;
    rippleElement.style.top = `${y}px`;
    rippleElement.style.width = '10px';
    rippleElement.style.height = '10px';
    rippleElement.style.borderRadius = '50%';
    rippleElement.style.backgroundColor = options.color || 'rgba(255, 255, 255, 0.7)';
    rippleElement.style.transform = 'translate(-50%, -50%) scale(0)';
    rippleElement.style.pointerEvents = 'none';
    
    // Добавляем элемент в DOM
    element.appendChild(rippleElement);
    
    // Анимируем эффект волны
    return this.animate(rippleElement, 'ripple', {
      ...options,
      onComplete: () => {
        // Удаляем элемент после завершения анимации
        if (element.contains(rippleElement)) {
          element.removeChild(rippleElement);
        }
        
        // Вызываем колбэк завершения
        if (typeof options.onComplete === 'function') {
          options.onComplete(element);
        }
      }
    });
  }
  
  /**
   * Создает анимацию загрузки
   * @param {HTMLElement} element - Элемент
   * @param {string} type - Тип анимации загрузки ('spinner', 'pulse', 'dots')
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Object} Объект с методами управления анимацией
   */
  loading(element, type = 'spinner', options = {}) {
    // Создаем элемент для анимации загрузки
    const loadingElement = document.createElement('div');
    loadingElement.className = `animation-loading animation-loading-${type}`;
    
    // Устанавливаем стили в зависимости от типа
    switch (type) {
      case 'spinner':
        loadingElement.innerHTML = `
          <div class="spinner">
            <div class="spinner-inner"></div>
          </div>
        `;
        loadingElement.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${options.backgroundColor || 'rgba(255, 255, 255, 0.8)'};
        `;
        loadingElement.querySelector('.spinner').style.cssText = `
          width: ${options.size || '40px'};
          height: ${options.size || '40px'};
        `;
        loadingElement.querySelector('.spinner-inner').style.cssText = `
          width: 100%;
          height: 100%;
          border: ${options.thickness || '4px'} solid ${options.color || '#3498db'};
          border-top-color: transparent;
          border-radius: 50%;
          animation: spinner-animation 0.8s linear infinite;
        `;
        
        // Добавляем анимацию в стили
        if (!document.getElementById('animation-loading-styles')) {
          const styleElement = document.createElement('style');
          styleElement.id = 'animation-loading-styles';
          styleElement.textContent = `
            @keyframes spinner-animation {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse-animation {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.5; }
              100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes dots-animation {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
          `;
          document.head.appendChild(styleElement);
        }
        break;
      
      case 'pulse':
        loadingElement.innerHTML = `
          <div class="pulse"></div>
        `;
        loadingElement.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${options.backgroundColor || 'rgba(255, 255, 255, 0.8)'};
        `;
        loadingElement.querySelector('.pulse').style.cssText = `
          width: ${options.size || '40px'};
          height: ${options.size || '40px'};
          background-color: ${options.color || '#3498db'};
          border-radius: 50%;
          animation: pulse-animation 1.2s ease-in-out infinite;
        `;
        break;
      
      case 'dots':
        loadingElement.innerHTML = `
          <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        `;
        loadingElement.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${options.backgroundColor || 'rgba(255, 255, 255, 0.8)'};
        `;
        loadingElement.querySelector('.dots').style.cssText = `
          display: flex;
          gap: 8px;
        `;
        
        const dots = loadingElement.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
          dot.style.cssText = `
            width: ${options.size || '10px'};
            height: ${options.size || '10px'};
            background-color: ${options.color || '#3498db'};
            border-radius: 50%;
            animation: dots-animation 1.4s ease-in-out infinite;
            animation-delay: ${index * 0.16}s;
          `;
        });
        break;
    }
    
    // Добавляем элемент в DOM
    element.appendChild(loadingElement);
    
    // Создаем методы управления
    const controller = {
      // Метод для остановки анимации
      stop: () => {
        if (element.contains(loadingElement)) {
          // Анимируем исчезновение
          this.animate(loadingElement, 'fadeOut', {
            duration: 200,
            onComplete: () => {
              if (element.contains(loadingElement)) {
                element.removeChild(loadingElement);
              }
              
              // Вызываем колбэк остановки
              if (typeof options.onStop === 'function') {
                options.onStop(element);
              }
            }
          });
        }
      },
      
      // Метод для обновления прогресса (для будущих реализаций)
      updateProgress: (progress) => {
        // Пока не реализовано
      }
    };
    
    return controller;
  }
  
  /**
   * Включает или отключает анимации
   * @param {boolean} enabled - Флаг включения
   * @returns {AnimationManager} Экземпляр менеджера анимаций
   */
  setEnabled(enabled) {
    this.config.enabled = !!enabled;
    
    this.logger.info(`AnimationManager: ${enabled ? 'enabled' : 'disabled'}`);
    this.eventEmitter.emit('animationManager:enabledChanged', { enabled: this.config.enabled });
    
    return this;
  }
  
  /**
   * Включает или отключает режим отладки
   * @param {boolean} debug - Флаг включения
   * @returns {AnimationManager} Экземпляр менеджера анимаций
   */
  setDebug(debug) {
    this.config.debug = !!debug;
    
    this.logger.info(`AnimationManager: debug mode ${debug ? 'enabled' : 'disabled'}`);
    
    return this;
  }
  
  /**
   * Обновляет конфигурацию менеджера анимаций
   * @param {Object} config - Новая конфигурация
   * @returns {AnimationManager} Экземпляр менеджера анимаций
   */
  updateConfig(config) {
    this.config = this.mergeConfig(config);
    
    this.logger.info('AnimationManager: config updated');
    this.eventEmitter.emit('animationManager:configUpdated', { config: { ...this.config } });
    
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
   * Получает количество активных анимаций
   * @returns {number} Количество активных анимаций
   */
  getActiveCount() {
    return this.activeAnimations.size;
  }
  
  /**
   * Уничтожает менеджер анимаций и освобождает ресурсы
   */
  destroy() {
    this.logger.info('AnimationManager: destroying');
    
    // Останавливаем все анимации
    this.activeAnimations.forEach((animation, id) => {
      this.stop(id);
    });
    
    // Отменяем requestAnimationFrame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Останавливаем интервал обновления
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Очищаем карты
    this.activeAnimations.clear();
    this.predefinedAnimations.clear();
    
    this.isInitialized = false;
    
    this.eventEmitter.emit('animationManager:destroyed');
    
    this.logger.info('AnimationManager: destroyed');
  }
}

module.exports = AnimationManager;
