/**
 * @file ScalingManager.js
 * @description Менеджер масштабирования интерфейса для приложения Mr.Comic
 * @module ui/ScalingManager
 */

/**
 * Класс для управления масштабированием интерфейса приложения
 * Обеспечивает полноценную поддержку масштабирования для всех компонентов UI
 */
class ScalingManager {
  /**
   * Создает экземпляр менеджера масштабирования
   * @param {Object} options - Параметры инициализации
   * @param {number} options.defaultScale - Масштаб по умолчанию (1.0 = 100%)
   * @param {number} options.minScale - Минимально допустимый масштаб
   * @param {number} options.maxScale - Максимально допустимый масштаб
   * @param {number} options.stepScale - Шаг изменения масштаба
   * @param {Function} options.onScaleChange - Колбэк при изменении масштаба
   * @param {HTMLElement} options.rootElement - Корневой элемент для масштабирования
   */
  constructor(options = {}) {
    this.defaultScale = options.defaultScale || 1.0;
    this.minScale = options.minScale || 0.5;
    this.maxScale = options.maxScale || 3.0;
    this.stepScale = options.stepScale || 0.1;
    this.onScaleChange = options.onScaleChange || (() => {});
    this.rootElement = options.rootElement || document.body;
    
    this.currentScale = this.defaultScale;
    this.scaleOrigin = { x: 0.5, y: 0.5 }; // По умолчанию масштабирование от центра
    this.transformOrigin = 'center center';
    
    this.touchStartDistance = 0;
    this.touchStartScale = 1;
    
    this.isScaling = false;
    this.lastPinchTime = 0;
    this.pinchDelay = 50; // мс между обработками жестов масштабирования
    
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.isHighDensityDisplay = this.devicePixelRatio > 1;
    
    this.scaleElements = new Map(); // Карта элементов с их настройками масштабирования
    
    this.init();
  }
  
  /**
   * Инициализирует менеджер масштабирования
   * @private
   */
  init() {
    // Применяем начальный масштаб
    this.applyScale(this.currentScale);
    
    // Инициализируем обработчики событий
    this.initEventListeners();
    
    // Инициализируем настройки для различных типов устройств
    this.initDeviceSpecificSettings();
    
    // Создаем стили для анимации масштабирования
    this.createScalingStyles();
    
    console.log(`ScalingManager initialized with default scale: ${this.defaultScale}`);
  }
  
  /**
   * Инициализирует обработчики событий для масштабирования
   * @private
   */
  initEventListeners() {
    // Обработчик колесика мыши для масштабирования
    this.rootElement.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Обработчики для сенсорных жестов масштабирования
    this.rootElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.rootElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.rootElement.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Обработчики для клавиатурных сочетаний
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Обработчик изменения ориентации устройства
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  /**
   * Инициализирует настройки для различных типов устройств
   * @private
   */
  initDeviceSpecificSettings() {
    // Определяем тип устройства
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    
    // Настройки для мобильных устройств
    if (isMobile && !isTablet) {
      this.stepScale = 0.05; // Меньший шаг для мобильных устройств
      this.minScale = 0.8; // Ограничение минимального масштаба
      
      // Добавляем мета-тег для корректного масштабирования на мобильных устройствах
      this.updateViewportMetaTag();
    }
    
    // Настройки для планшетов
    if (isTablet) {
      this.defaultScale = 1.2; // Увеличенный масштаб по умолчанию для планшетов
      this.currentScale = this.defaultScale;
      this.applyScale(this.currentScale);
    }
    
    // Настройки для дисплеев с высокой плотностью пикселей
    if (this.isHighDensityDisplay) {
      console.log(`High density display detected (pixel ratio: ${this.devicePixelRatio})`);
      // Корректируем масштаб для высокой плотности пикселей, если необходимо
    }
  }
  
  /**
   * Создает стили для анимации масштабирования
   * @private
   */
  createScalingStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .scaling-transition {
        transition: transform 0.3s ease-out;
      }
      
      .scaling-no-transition {
        transition: none !important;
      }
      
      .scaling-content {
        transform-origin: var(--scaling-origin, center center);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .scaling-transition {
          transition: none;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  /**
   * Обновляет мета-тег viewport для корректного масштабирования на мобильных устройствах
   * @private
   */
  updateViewportMetaTag() {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes';
  }
  
  /**
   * Обработчик события колесика мыши
   * @param {WheelEvent} event - Событие колесика мыши
   * @private
   */
  handleWheel(event) {
    // Проверяем, нажата ли клавиша Ctrl для масштабирования
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      
      const delta = -Math.sign(event.deltaY) * this.stepScale;
      const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.currentScale + delta));
      
      // Определяем позицию курсора относительно элемента для масштабирования от этой точки
      const rect = this.rootElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      
      this.scaleOrigin = { x, y };
      this.updateTransformOrigin();
      
      this.setScale(newScale);
    }
  }
  
  /**
   * Обработчик начала касания для сенсорных устройств
   * @param {TouchEvent} event - Событие начала касания
   * @private
   */
  handleTouchStart(event) {
    if (event.touches.length === 2) {
      event.preventDefault();
      
      // Запоминаем начальное расстояние между пальцами
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.touchStartDistance = this.getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
      
      // Запоминаем текущий масштаб
      this.touchStartScale = this.currentScale;
      
      // Определяем центр между касаниями для масштабирования от этой точки
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      const rect = this.rootElement.getBoundingClientRect();
      const x = (centerX - rect.left) / rect.width;
      const y = (centerY - rect.top) / rect.height;
      
      this.scaleOrigin = { x, y };
      this.updateTransformOrigin();
      
      this.isScaling = true;
      
      // Убираем анимацию на время масштабирования жестами
      this.rootElement.classList.add('scaling-no-transition');
    }
  }
  
  /**
   * Обработчик движения пальцев для сенсорных устройств
   * @param {TouchEvent} event - Событие движения пальцев
   * @private
   */
  handleTouchMove(event) {
    if (this.isScaling && event.touches.length === 2) {
      event.preventDefault();
      
      // Ограничиваем частоту обработки для повышения производительности
      const now = Date.now();
      if (now - this.lastPinchTime < this.pinchDelay) {
        return;
      }
      this.lastPinchTime = now;
      
      // Вычисляем новое расстояние между пальцами
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
      
      // Вычисляем новый масштаб
      const scaleFactor = currentDistance / this.touchStartDistance;
      let newScale = this.touchStartScale * scaleFactor;
      
      // Ограничиваем масштаб
      newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
      
      // Применяем новый масштаб без анимации
      this.currentScale = newScale;
      this.applyScale(newScale, false);
      
      // Вызываем колбэк
      this.onScaleChange(newScale);
    }
  }
  
  /**
   * Обработчик окончания касания для сенсорных устройств
   * @param {TouchEvent} event - Событие окончания касания
   * @private
   */
  handleTouchEnd(event) {
    if (this.isScaling) {
      // Восстанавливаем анимацию после завершения масштабирования жестами
      this.rootElement.classList.remove('scaling-no-transition');
      this.isScaling = false;
    }
  }
  
  /**
   * Обработчик нажатия клавиш для масштабирования с клавиатуры
   * @param {KeyboardEvent} event - Событие нажатия клавиши
   * @private
   */
  handleKeyDown(event) {
    // Ctrl/Cmd + Plus для увеличения масштаба
    if ((event.ctrlKey || event.metaKey) && event.key === '+') {
      event.preventDefault();
      this.zoomIn();
    }
    
    // Ctrl/Cmd + Minus для уменьшения масштаба
    if ((event.ctrlKey || event.metaKey) && event.key === '-') {
      event.preventDefault();
      this.zoomOut();
    }
    
    // Ctrl/Cmd + 0 для сброса масштаба
    if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault();
      this.resetScale();
    }
  }
  
  /**
   * Обработчик изменения ориентации устройства
   * @private
   */
  handleOrientationChange() {
    // Небольшая задержка для корректной обработки изменения ориентации
    setTimeout(() => {
      // Пересчитываем масштаб при изменении ориентации
      this.applyScale(this.currentScale);
    }, 300);
  }
  
  /**
   * Обработчик изменения размера окна
   * @private
   */
  handleResize() {
    // Пересчитываем масштаб при изменении размера окна
    this.applyScale(this.currentScale);
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
   * Обновляет точку трансформации для масштабирования
   * @private
   */
  updateTransformOrigin() {
    this.transformOrigin = `${this.scaleOrigin.x * 100}% ${this.scaleOrigin.y * 100}%`;
    this.rootElement.style.setProperty('--scaling-origin', this.transformOrigin);
  }
  
  /**
   * Устанавливает новый масштаб с анимацией
   * @param {number} scale - Новое значение масштаба
   */
  setScale(scale) {
    // Ограничиваем масштаб
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    
    // Если масштаб не изменился, ничего не делаем
    if (newScale === this.currentScale) {
      return;
    }
    
    // Обновляем текущий масштаб
    this.currentScale = newScale;
    
    // Применяем новый масштаб с анимацией
    this.applyScale(newScale, true);
    
    // Вызываем колбэк
    this.onScaleChange(newScale);
  }
  
  /**
   * Применяет масштаб к элементу
   * @param {number} scale - Значение масштаба
   * @param {boolean} animate - Флаг анимации
   * @private
   */
  applyScale(scale, animate = true) {
    // Добавляем или убираем класс для анимации
    if (animate) {
      this.rootElement.classList.add('scaling-transition');
    } else {
      this.rootElement.classList.remove('scaling-transition');
    }
    
    // Добавляем класс для установки точки трансформации
    this.rootElement.classList.add('scaling-content');
    
    // Применяем трансформацию
    this.rootElement.style.transform = `scale(${scale})`;
    
    // Применяем масштаб к зарегистрированным элементам с учетом их настроек
    this.scaleElements.forEach((settings, element) => {
      if (settings.scaleMode === 'inverse') {
        // Инверсное масштабирование (компенсация)
        element.style.transform = `scale(${1 / scale})`;
      } else if (settings.scaleMode === 'custom') {
        // Пользовательский коэффициент масштабирования
        element.style.transform = `scale(${scale * settings.scaleFactor})`;
      }
    });
    
    // Обновляем CSS-переменную для использования в стилях
    document.documentElement.style.setProperty('--current-scale', scale);
    
    // Если анимация включена, убираем класс анимации после завершения
    if (animate) {
      setTimeout(() => {
        this.rootElement.classList.remove('scaling-transition');
      }, 300);
    }
  }
  
  /**
   * Увеличивает масштаб на один шаг
   */
  zoomIn() {
    const newScale = Math.min(this.maxScale, this.currentScale + this.stepScale);
    this.setScale(newScale);
  }
  
  /**
   * Уменьшает масштаб на один шаг
   */
  zoomOut() {
    const newScale = Math.max(this.minScale, this.currentScale - this.stepScale);
    this.setScale(newScale);
  }
  
  /**
   * Сбрасывает масштаб к значению по умолчанию
   */
  resetScale() {
    // Сбрасываем точку трансформации к центру
    this.scaleOrigin = { x: 0.5, y: 0.5 };
    this.updateTransformOrigin();
    
    // Устанавливаем масштаб по умолчанию
    this.setScale(this.defaultScale);
  }
  
  /**
   * Устанавливает масштаб по размеру контейнера (fit to container)
   * @param {HTMLElement} container - Контейнер для масштабирования
   * @param {HTMLElement} content - Содержимое для масштабирования
   * @param {Object} options - Дополнительные параметры
   * @param {number} options.padding - Отступ от краев контейнера (в пикселях)
   * @param {boolean} options.scaleUp - Разрешить увеличение, если содержимое меньше контейнера
   */
  fitToContainer(container, content, options = {}) {
    const padding = options.padding || 0;
    const scaleUp = options.scaleUp || false;
    
    // Получаем размеры контейнера и содержимого
    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    
    // Вычисляем доступное пространство с учетом отступов
    const availableWidth = containerRect.width - padding * 2;
    const availableHeight = containerRect.height - padding * 2;
    
    // Вычисляем коэффициенты масштабирования по ширине и высоте
    const scaleX = availableWidth / contentRect.width;
    const scaleY = availableHeight / contentRect.height;
    
    // Выбираем минимальный коэффициент для сохранения пропорций
    let scale = Math.min(scaleX, scaleY);
    
    // Если запрещено увеличение и содержимое меньше контейнера
    if (!scaleUp && scale > 1) {
      scale = 1;
    }
    
    // Ограничиваем масштаб
    scale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    
    // Устанавливаем новый масштаб
    this.setScale(scale);
    
    // Центрируем содержимое в контейнере
    this.scaleOrigin = { x: 0.5, y: 0.5 };
    this.updateTransformOrigin();
  }
  
  /**
   * Регистрирует элемент для специальной обработки масштабирования
   * @param {HTMLElement} element - Элемент для регистрации
   * @param {Object} settings - Настройки масштабирования
   * @param {string} settings.scaleMode - Режим масштабирования ('normal', 'inverse', 'custom')
   * @param {number} settings.scaleFactor - Пользовательский коэффициент масштабирования (для режима 'custom')
   */
  registerElement(element, settings = {}) {
    const defaultSettings = {
      scaleMode: 'normal', // 'normal', 'inverse', 'custom'
      scaleFactor: 1.0
    };
    
    const mergedSettings = { ...defaultSettings, ...settings };
    this.scaleElements.set(element, mergedSettings);
    
    // Применяем текущий масштаб к новому элементу
    if (mergedSettings.scaleMode === 'inverse') {
      element.style.transform = `scale(${1 / this.currentScale})`;
    } else if (mergedSettings.scaleMode === 'custom') {
      element.style.transform = `scale(${this.currentScale * mergedSettings.scaleFactor})`;
    }
  }
  
  /**
   * Удаляет элемент из списка специальной обработки масштабирования
   * @param {HTMLElement} element - Элемент для удаления
   */
  unregisterElement(element) {
    if (this.scaleElements.has(element)) {
      // Сбрасываем трансформацию
      element.style.transform = '';
      this.scaleElements.delete(element);
    }
  }
  
  /**
   * Получает текущий масштаб
   * @returns {number} Текущий масштаб
   */
  getCurrentScale() {
    return this.currentScale;
  }
  
  /**
   * Проверяет, находится ли текущий масштаб на минимальном значении
   * @returns {boolean} true, если масштаб минимальный
   */
  isMinScale() {
    return this.currentScale <= this.minScale;
  }
  
  /**
   * Проверяет, находится ли текущий масштаб на максимальном значении
   * @returns {boolean} true, если масштаб максимальный
   */
  isMaxScale() {
    return this.currentScale >= this.maxScale;
  }
  
  /**
   * Устанавливает новый диапазон масштабирования
   * @param {number} min - Минимальный масштаб
   * @param {number} max - Максимальный масштаб
   */
  setScaleRange(min, max) {
    this.minScale = min;
    this.maxScale = max;
    
    // Корректируем текущий масштаб, если он вышел за новые границы
    if (this.currentScale < min) {
      this.setScale(min);
    } else if (this.currentScale > max) {
      this.setScale(max);
    }
  }
  
  /**
   * Устанавливает шаг изменения масштаба
   * @param {number} step - Шаг изменения масштаба
   */
  setScaleStep(step) {
    this.stepScale = step;
  }
  
  /**
   * Устанавливает колбэк для события изменения масштаба
   * @param {Function} callback - Функция обратного вызова
   */
  setOnScaleChangeCallback(callback) {
    if (typeof callback === 'function') {
      this.onScaleChange = callback;
    }
  }
  
  /**
   * Включает или отключает анимацию масштабирования
   * @param {boolean} enabled - Флаг включения анимации
   */
  setAnimationEnabled(enabled) {
    if (enabled) {
      this.rootElement.classList.add('scaling-transition');
    } else {
      this.rootElement.classList.remove('scaling-transition');
    }
  }
  
  /**
   * Уничтожает менеджер масштабирования и удаляет все обработчики событий
   */
  destroy() {
    // Удаляем обработчики событий
    this.rootElement.removeEventListener('wheel', this.handleWheel);
    this.rootElement.removeEventListener('touchstart', this.handleTouchStart);
    this.rootElement.removeEventListener('touchmove', this.handleTouchMove);
    this.rootElement.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    window.removeEventListener('resize', this.handleResize);
    
    // Сбрасываем масштаб
    this.rootElement.style.transform = '';
    this.rootElement.classList.remove('scaling-transition', 'scaling-content');
    
    // Сбрасываем трансформацию для всех зарегистрированных элементов
    this.scaleElements.forEach((_, element) => {
      element.style.transform = '';
    });
    
    // Очищаем карту элементов
    this.scaleElements.clear();
    
    console.log('ScalingManager destroyed');
  }
}

module.exports = ScalingManager;
