/**
 * @file GestureDemo.js
 * @description Демонстрационный компонент для тестирования функциональности жестов
 * @module ui/GestureDemo
 */

const GestureManager = require('./GestureManager');
const GestureIntegration = require('./GestureIntegration');

/**
 * Класс для демонстрации и тестирования функциональности жестов
 */
class GestureDemo {
  /**
   * Создает экземпляр демонстрационного компонента
   * @param {Object} options - Параметры инициализации
   * @param {HTMLElement} options.container - Контейнер для демонстрации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   */
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.eventEmitter = options.eventEmitter || {
      on: () => {},
      emit: () => {},
      removeAllListeners: () => {}
    };
    this.logger = options.logger || console;
    
    this.gestureIntegration = null;
    this.demoElements = {};
    this.gestureLog = [];
    this.maxLogEntries = 10;
  }
  
  /**
   * Инициализирует демонстрационный компонент
   */
  initialize() {
    this.logger.info('GestureDemo: initializing');
    
    // Создаем интегратор жестов
    this.gestureIntegration = new GestureIntegration({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: {
        debug: true
      }
    });
    
    this.gestureIntegration.initialize();
    
    // Создаем демонстрационный интерфейс
    this.createDemoInterface();
    
    // Создаем глобальный менеджер жестов
    this.globalGestureManager = this.gestureIntegration.createGlobalGestureManager(
      this.container.querySelector('.gesture-demo-content')
    );
    
    // Создаем менеджер жестов для отдельной области
    this.areaGestureManager = this.gestureIntegration.createGestureManager(
      'area1',
      this.container.querySelector('.gesture-demo-area'),
      { visualFeedback: true }
    );
    
    // Регистрируем обработчики жестов
    this.registerGestureHandlers();
    
    // Добавляем обработчики для элементов управления
    this.addControlHandlers();
    
    this.logger.info('GestureDemo: initialized');
  }
  
  /**
   * Создает демонстрационный интерфейс
   * @private
   */
  createDemoInterface() {
    // Создаем контейнер для демонстрации
    this.container.innerHTML = `
      <div class="gesture-demo">
        <div class="gesture-demo-header">
          <h1>Демонстрация поддержки жестов</h1>
          <div class="gesture-demo-controls">
            <label>
              <input type="checkbox" id="visual-feedback-checkbox" checked>
              Визуальная обратная связь
            </label>
            <label>
              <input type="checkbox" id="prevent-default-checkbox" checked>
              Предотвращать стандартное поведение
            </label>
          </div>
        </div>
        
        <div class="gesture-demo-content">
          <div class="gesture-demo-main">
            <h2>Основная область</h2>
            <p>Используйте эту область для тестирования различных жестов:</p>
            <ul>
              <li>Тап (быстрое нажатие)</li>
              <li>Двойной тап (два быстрых нажатия)</li>
              <li>Долгое нажатие (удержание)</li>
              <li>Свайп (быстрое смахивание)</li>
              <li>Пинч (масштабирование двумя пальцами)</li>
              <li>Вращение (поворот двумя пальцами)</li>
              <li>Панорамирование (перемещение)</li>
            </ul>
            
            <div class="gesture-demo-area">
              <h3>Тестовая область жестов</h3>
              <p>Эта область имеет свой собственный менеджер жестов.</p>
              <div class="gesture-demo-object" id="demo-object">
                <div class="gesture-demo-object-content">Объект</div>
              </div>
            </div>
            
            <div class="gesture-demo-log">
              <h3>Журнал жестов</h3>
              <div class="gesture-log-entries" id="gesture-log"></div>
              <button id="clear-log-btn">Очистить журнал</button>
            </div>
          </div>
          
          <div class="gesture-demo-sidebar">
            <h3>Настройки жестов</h3>
            <div class="gesture-demo-settings">
              <h4>Тап</h4>
              <label>
                Макс. расстояние:
                <input type="range" id="tap-max-distance" min="5" max="30" step="1" value="10">
                <span id="tap-max-distance-value">10</span>px
              </label>
              <label>
                Макс. длительность:
                <input type="range" id="tap-max-duration" min="100" max="500" step="10" value="300">
                <span id="tap-max-duration-value">300</span>мс
              </label>
              
              <h4>Свайп</h4>
              <label>
                Мин. расстояние:
                <input type="range" id="swipe-min-distance" min="10" max="100" step="5" value="30">
                <span id="swipe-min-distance-value">30</span>px
              </label>
              <label>
                Мин. скорость:
                <input type="range" id="swipe-min-velocity" min="0.1" max="1" step="0.05" value="0.3">
                <span id="swipe-min-velocity-value">0.3</span>px/мс
              </label>
              
              <h4>Долгое нажатие</h4>
              <label>
                Задержка:
                <input type="range" id="long-press-delay" min="200" max="1000" step="50" value="500">
                <span id="long-press-delay-value">500</span>мс
              </label>
              
              <h4>Инерция</h4>
              <label>
                <input type="checkbox" id="inertia-checkbox" checked>
                Включить инерцию
              </label>
              <label>
                Затухание:
                <input type="range" id="inertia-decay" min="0.8" max="0.99" step="0.01" value="0.95">
                <span id="inertia-decay-value">0.95</span>
              </label>
            </div>
            
            <div class="gesture-demo-device-simulation">
              <h4>Симуляция устройства</h4>
              <div class="device-buttons">
                <button id="simulate-touch-btn">Сенсорный экран</button>
                <button id="simulate-pen-btn">Перо</button>
                <button id="simulate-mouse-btn">Мышь</button>
              </div>
              <div class="accessibility-options">
                <h4>Доступность</h4>
                <label>
                  <input type="checkbox" id="reduced-motion-checkbox">
                  Уменьшенное движение
                </label>
                <label>
                  <input type="checkbox" id="high-contrast-checkbox">
                  Высокий контраст
                </label>
                <label>
                  <input type="checkbox" id="large-text-checkbox">
                  Крупный текст
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="gesture-demo-footer">
          <p>Текущее состояние объекта:</p>
          <div class="object-state">
            <div>Позиция: <span id="object-position">0, 0</span></div>
            <div>Масштаб: <span id="object-scale">1.0</span></div>
            <div>Поворот: <span id="object-rotation">0°</span></div>
          </div>
        </div>
      </div>
    `;
    
    // Добавляем стили для демонстрации
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .gesture-demo {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .gesture-demo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .gesture-demo-controls {
        display: flex;
        gap: 20px;
      }
      
      .gesture-demo-content {
        display: flex;
        gap: 20px;
      }
      
      .gesture-demo-main {
        flex: 3;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      
      .gesture-demo-sidebar {
        flex: 1;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      
      .gesture-demo-area {
        margin-top: 20px;
        padding: 20px;
        border: 2px dashed #999;
        border-radius: 5px;
        background-color: #f9f9f9;
        height: 300px;
        position: relative;
        overflow: hidden;
        touch-action: none;
      }
      
      .gesture-demo-object {
        position: absolute;
        width: 100px;
        height: 100px;
        background-color: #3498db;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        cursor: pointer;
        user-select: none;
        touch-action: none;
        transform-origin: center center;
        left: calc(50% - 50px);
        top: calc(50% - 50px);
      }
      
      .gesture-demo-log {
        margin-top: 20px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f5f5f5;
      }
      
      .gesture-log-entries {
        height: 150px;
        overflow-y: auto;
        margin-bottom: 10px;
        font-family: monospace;
        font-size: 12px;
        line-height: 1.4;
        padding: 5px;
        background-color: #fff;
        border: 1px solid #eee;
      }
      
      .gesture-log-entry {
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid #eee;
      }
      
      .gesture-log-entry.tap { color: #3498db; }
      .gesture-log-entry.doubletap { color: #2ecc71; }
      .gesture-log-entry.longpress { color: #e67e22; }
      .gesture-log-entry.swipe { color: #e74c3c; }
      .gesture-log-entry.pinch { color: #9b59b6; }
      .gesture-log-entry.rotate { color: #f1c40f; }
      .gesture-log-entry.pan { color: #34495e; }
      
      .gesture-demo-settings {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .gesture-demo-settings h4 {
        margin: 10px 0 5px;
      }
      
      .gesture-demo-settings label {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 5px;
      }
      
      .gesture-demo-device-simulation {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #eee;
      }
      
      .device-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .device-buttons button {
        flex: 1;
        padding: 8px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .device-buttons button:hover {
        background-color: #e0e0e0;
      }
      
      .accessibility-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .gesture-demo-footer {
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #eee;
      }
      
      .object-state {
        display: flex;
        gap: 20px;
        font-family: monospace;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Сохраняем ссылки на демонстрационные элементы
    this.demoElements = {
      visualFeedbackCheckbox: this.container.querySelector('#visual-feedback-checkbox'),
      preventDefaultCheckbox: this.container.querySelector('#prevent-default-checkbox'),
      
      tapMaxDistance: this.container.querySelector('#tap-max-distance'),
      tapMaxDistanceValue: this.container.querySelector('#tap-max-distance-value'),
      tapMaxDuration: this.container.querySelector('#tap-max-duration'),
      tapMaxDurationValue: this.container.querySelector('#tap-max-duration-value'),
      
      swipeMinDistance: this.container.querySelector('#swipe-min-distance'),
      swipeMinDistanceValue: this.container.querySelector('#swipe-min-distance-value'),
      swipeMinVelocity: this.container.querySelector('#swipe-min-velocity'),
      swipeMinVelocityValue: this.container.querySelector('#swipe-min-velocity-value'),
      
      longPressDelay: this.container.querySelector('#long-press-delay'),
      longPressDelayValue: this.container.querySelector('#long-press-delay-value'),
      
      inertiaCheckbox: this.container.querySelector('#inertia-checkbox'),
      inertiaDecay: this.container.querySelector('#inertia-decay'),
      inertiaDecayValue: this.container.querySelector('#inertia-decay-value'),
      
      simulateTouchBtn: this.container.querySelector('#simulate-touch-btn'),
      simulatePenBtn: this.container.querySelector('#simulate-pen-btn'),
      simulateMouseBtn: this.container.querySelector('#simulate-mouse-btn'),
      
      reducedMotionCheckbox: this.container.querySelector('#reduced-motion-checkbox'),
      highContrastCheckbox: this.container.querySelector('#high-contrast-checkbox'),
      largeTextCheckbox: this.container.querySelector('#large-text-checkbox'),
      
      gestureLog: this.container.querySelector('#gesture-log'),
      clearLogBtn: this.container.querySelector('#clear-log-btn'),
      
      demoObject: this.container.querySelector('#demo-object'),
      objectPosition: this.container.querySelector('#object-position'),
      objectScale: this.container.querySelector('#object-scale'),
      objectRotation: this.container.querySelector('#object-rotation')
    };
    
    // Инициализируем состояние объекта
    this.objectState = {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    };
  }
  
  /**
   * Регистрирует обработчики жестов
   * @private
   */
  registerGestureHandlers() {
    // Регистрируем обработчики для тестовой области
    this.gestureIntegration.registerStandardGestureHandlers('area1', {
      tap: this.handleTap.bind(this),
      doubletap: this.handleDoubleTap.bind(this),
      longpress: this.handleLongPress.bind(this),
      swipe: this.handleSwipe.bind(this),
      pinch: this.handlePinch.bind(this),
      rotate: this.handleRotate.bind(this),
      pan: this.handlePan.bind(this),
      wheel: this.handleWheel.bind(this)
    });
    
    // Регистрируем обработчики для глобальной области
    this.eventEmitter.on('gesture:start', this.logGestureEvent.bind(this));
    this.eventEmitter.on('gesture:end', this.logGestureEvent.bind(this));
    this.eventEmitter.on('gesture:inertia', this.handleInertia.bind(this));
  }
  
  /**
   * Добавляет обработчики для элементов управления
   * @private
   */
  addControlHandlers() {
    // Обработчики для настроек визуальной обратной связи
    this.demoElements.visualFeedbackCheckbox.addEventListener('change', () => {
      const enabled = this.demoElements.visualFeedbackCheckbox.checked;
      this.gestureIntegration.setVisualFeedback(enabled);
    });
    
    // Обработчики для настроек предотвращения стандартного поведения
    this.demoElements.preventDefaultCheckbox.addEventListener('change', () => {
      const prevent = this.demoElements.preventDefaultCheckbox.checked;
      this.gestureIntegration.updateGestureSettings({ preventDefaultEvents: prevent });
    });
    
    // Обработчики для настроек тапа
    this.demoElements.tapMaxDistance.addEventListener('input', () => {
      const value = parseInt(this.demoElements.tapMaxDistance.value);
      this.demoElements.tapMaxDistanceValue.textContent = value;
      this.gestureIntegration.updateGestureSettings({ tapMaxDistance: value });
    });
    
    this.demoElements.tapMaxDuration.addEventListener('input', () => {
      const value = parseInt(this.demoElements.tapMaxDuration.value);
      this.demoElements.tapMaxDurationValue.textContent = value;
      this.gestureIntegration.updateGestureSettings({ tapMaxDuration: value });
    });
    
    // Обработчики для настроек свайпа
    this.demoElements.swipeMinDistance.addEventListener('input', () => {
      const value = parseInt(this.demoElements.swipeMinDistance.value);
      this.demoElements.swipeMinDistanceValue.textContent = value;
      this.gestureIntegration.updateGestureSettings({ swipeMinDistance: value });
    });
    
    this.demoElements.swipeMinVelocity.addEventListener('input', () => {
      const value = parseFloat(this.demoElements.swipeMinVelocity.value);
      this.demoElements.swipeMinVelocityValue.textContent = value.toFixed(2);
      this.gestureIntegration.updateGestureSettings({ swipeMinVelocity: value });
    });
    
    // Обработчики для настроек долгого нажатия
    this.demoElements.longPressDelay.addEventListener('input', () => {
      const value = parseInt(this.demoElements.longPressDelay.value);
      this.demoElements.longPressDelayValue.textContent = value;
      this.gestureIntegration.updateGestureSettings({ longPressDelay: value });
    });
    
    // Обработчики для настроек инерции
    this.demoElements.inertiaCheckbox.addEventListener('change', () => {
      const enabled = this.demoElements.inertiaCheckbox.checked;
      this.gestureIntegration.updateGestureSettings({ inertiaEnabled: enabled });
    });
    
    this.demoElements.inertiaDecay.addEventListener('input', () => {
      const value = parseFloat(this.demoElements.inertiaDecay.value);
      this.demoElements.inertiaDecayValue.textContent = value.toFixed(2);
      this.gestureIntegration.updateGestureSettings({ inertiaDecay: value });
    });
    
    // Обработчики для симуляции устройств
    this.demoElements.simulateTouchBtn.addEventListener('click', () => {
      this.simulateDevice('touch');
    });
    
    this.demoElements.simulatePenBtn.addEventListener('click', () => {
      this.simulateDevice('pen');
    });
    
    this.demoElements.simulateMouseBtn.addEventListener('click', () => {
      this.simulateDevice('mouse');
    });
    
    // Обработчики для настроек доступности
    this.demoElements.reducedMotionCheckbox.addEventListener('change', () => {
      this.updateAccessibilitySettings();
    });
    
    this.demoElements.highContrastCheckbox.addEventListener('change', () => {
      this.updateAccessibilitySettings();
    });
    
    this.demoElements.largeTextCheckbox.addEventListener('change', () => {
      this.updateAccessibilitySettings();
    });
    
    // Обработчик для очистки журнала
    this.demoElements.clearLogBtn.addEventListener('click', () => {
      this.clearGestureLog();
    });
  }
  
  /**
   * Обработчик жеста тап
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handleTap(gestureState, originalEvent, target) {
    this.logGesture('tap', `Тап в точке (${Math.round(gestureState.currentX)}, ${Math.round(gestureState.currentY)})`);
    
    // Если тап был по демонстрационному объекту, меняем его цвет
    if (target === this.demoElements.demoObject || target.parentElement === this.demoElements.demoObject) {
      const randomColor = this.getRandomColor();
      this.demoElements.demoObject.style.backgroundColor = randomColor;
    }
  }
  
  /**
   * Обработчик жеста двойной тап
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handleDoubleTap(gestureState, originalEvent, target) {
    this.logGesture('doubletap', `Двойной тап в точке (${Math.round(gestureState.currentX)}, ${Math.round(gestureState.currentY)})`);
    
    // Если двойной тап был по демонстрационному объекту, сбрасываем его состояние
    if (target === this.demoElements.demoObject || target.parentElement === this.demoElements.demoObject) {
      this.resetObjectState();
    }
  }
  
  /**
   * Обработчик жеста долгое нажатие
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handleLongPress(gestureState, originalEvent, target) {
    this.logGesture('longpress', `Долгое нажатие в точке (${Math.round(gestureState.currentX)}, ${Math.round(gestureState.currentY)})`);
    
    // Если долгое нажатие было по демонстрационному объекту, меняем его форму
    if (target === this.demoElements.demoObject || target.parentElement === this.demoElements.demoObject) {
      const currentBorderRadius = parseInt(getComputedStyle(this.demoElements.demoObject).borderRadius);
      const newBorderRadius = currentBorderRadius === 8 ? '50%' : '8px';
      this.demoElements.demoObject.style.borderRadius = newBorderRadius;
    }
  }
  
  /**
   * Обработчик жеста свайп
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handleSwipe(gestureState, originalEvent, target) {
    const direction = gestureState.direction || this.getSwipeDirection(gestureState.angle);
    this.logGesture('swipe', `Свайп в направлении ${direction} (угол: ${Math.round(gestureState.angle)}°, расстояние: ${Math.round(gestureState.distance)}px)`);
    
    // Если свайп был по демонстрационному объекту, перемещаем его в направлении свайпа
    if (target === this.demoElements.demoObject || target.parentElement === this.demoElements.demoObject) {
      const distance = Math.min(gestureState.distance, 100); // Ограничиваем расстояние
      
      switch (direction) {
        case 'right':
          this.updateObjectPosition(distance, 0);
          break;
        case 'left':
          this.updateObjectPosition(-distance, 0);
          break;
        case 'down':
          this.updateObjectPosition(0, distance);
          break;
        case 'up':
          this.updateObjectPosition(0, -distance);
          break;
      }
    }
  }
  
  /**
   * Обработчик жеста пинч (масштабирование)
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handlePinch(gestureState, originalEvent, target) {
    this.logGesture('pinch', `Пинч с масштабом ${gestureState.scale.toFixed(2)}`);
    
    // Обновляем масштаб объекта
    this.updateObjectScale(gestureState.scale);
  }
  
  /**
   * Обработчик жеста вращение
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handleRotate(gestureState, originalEvent, target) {
    this.logGesture('rotate', `Вращение на ${Math.round(gestureState.rotation)}°`);
    
    // Обновляем поворот объекта
    this.updateObjectRotation(gestureState.rotation);
  }
  
  /**
   * Обработчик жеста панорамирование
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handlePan(gestureState, originalEvent, target) {
    // Для панорамирования логируем только начало и конец, чтобы не перегружать журнал
    if (originalEvent.type === 'pointerdown' || originalEvent.type === 'pointerup') {
      this.logGesture('pan', `Панорамирование (dx: ${Math.round(gestureState.deltaX)}px, dy: ${Math.round(gestureState.deltaY)}px)`);
    }
    
    // Если панорамирование было по демонстрационному объекту, перемещаем его
    if (target === this.demoElements.demoObject || target.parentElement === this.demoElements.demoObject) {
      this.updateObjectPosition(gestureState.deltaX, gestureState.deltaY);
    }
  }
  
  /**
   * Обработчик события колесика мыши
   * @param {Object} gestureState - Состояние жеста
   * @param {Event} originalEvent - Оригинальное событие
   * @param {HTMLElement} target - Целевой элемент
   */
  handleWheel(gestureState, originalEvent, target) {
    // Для колесика мыши логируем только значительные изменения
    if (Math.abs(gestureState.deltaY) > 10) {
      this.logGesture('wheel', `Колесико мыши (deltaY: ${Math.round(gestureState.deltaY)})`);
    }
    
    // Если колесико было над демонстрационным объектом, масштабируем его
    if (target === this.demoElements.demoObject || target.parentElement === this.demoElements.demoObject) {
      const scaleFactor = gestureState.deltaY > 0 ? 0.9 : 1.1;
      this.updateObjectScale(scaleFactor, true);
    }
  }
  
  /**
   * Обработчик инерции
   * @param {Object} event - Событие инерции
   */
  handleInertia(event) {
    const { gestureState } = event;
    
    // Применяем инерцию к объекту
    if (this.objectState.lastTarget === this.demoElements.demoObject) {
      this.updateObjectPosition(gestureState.deltaX, gestureState.deltaY, true);
    }
  }
  
  /**
   * Логирует событие жеста
   * @param {Object} event - Событие жеста
   */
  logGestureEvent(event) {
    const { gestureState, target } = event;
    
    // Сохраняем последний целевой элемент для инерции
    if (target === this.demoElements.demoObject || target?.parentElement === this.demoElements.demoObject) {
      this.objectState.lastTarget = this.demoElements.demoObject;
    } else {
      this.objectState.lastTarget = null;
    }
    
    // Логируем только начало и конец жестов
    if (event.type === 'gesture:start') {
      this.logGesture('info', `Начало жеста в точке (${Math.round(gestureState.startX)}, ${Math.round(gestureState.startY)})`);
    } else if (event.type === 'gesture:end' && gestureState.type) {
      // Конец жеста логируется в специфичных обработчиках
    }
  }
  
  /**
   * Логирует жест в журнал
   * @param {string} type - Тип жеста
   * @param {string} message - Сообщение
   */
  logGesture(type, message) {
    // Создаем запись в журнале
    const entry = document.createElement('div');
    entry.className = `gesture-log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    // Добавляем запись в начало журнала
    this.demoElements.gestureLog.insertBefore(entry, this.demoElements.gestureLog.firstChild);
    
    // Ограничиваем количество записей
    this.gestureLog.push({ type, message, time: Date.now() });
    if (this.gestureLog.length > this.maxLogEntries) {
      this.gestureLog.shift();
      
      // Удаляем лишние элементы из DOM
      if (this.demoElements.gestureLog.children.length > this.maxLogEntries) {
        this.demoElements.gestureLog.removeChild(this.demoElements.gestureLog.lastChild);
      }
    }
  }
  
  /**
   * Очищает журнал жестов
   */
  clearGestureLog() {
    this.demoElements.gestureLog.innerHTML = '';
    this.gestureLog = [];
  }
  
  /**
   * Обновляет позицию объекта
   * @param {number} deltaX - Изменение по оси X
   * @param {number} deltaY - Изменение по оси Y
   * @param {boolean} isInertia - Флаг инерции
   */
  updateObjectPosition(deltaX, deltaY, isInertia = false) {
    // Если это инерция, применяем меньшее изменение
    const factor = isInertia ? 1 : 1;
    
    // Обновляем состояние объекта
    if (isInertia) {
      this.objectState.x += deltaX;
      this.objectState.y += deltaY;
    } else {
      this.objectState.x = deltaX;
      this.objectState.y = deltaY;
    }
    
    // Ограничиваем позицию объекта в пределах контейнера
    const container = this.demoElements.demoObject.parentElement;
    const containerRect = container.getBoundingClientRect();
    const objectRect = this.demoElements.demoObject.getBoundingClientRect();
    
    const maxX = containerRect.width / 2 - objectRect.width / 2;
    const maxY = containerRect.height / 2 - objectRect.height / 2;
    
    this.objectState.x = Math.max(-maxX, Math.min(maxX, this.objectState.x));
    this.objectState.y = Math.max(-maxY, Math.min(maxY, this.objectState.y));
    
    // Применяем трансформацию
    this.applyObjectTransform();
    
    // Обновляем отображение состояния
    this.demoElements.objectPosition.textContent = `${Math.round(this.objectState.x)}, ${Math.round(this.objectState.y)}`;
  }
  
  /**
   * Обновляет масштаб объекта
   * @param {number} scale - Масштаб
   * @param {boolean} isRelative - Флаг относительного масштабирования
   */
  updateObjectScale(scale, isRelative = false) {
    // Обновляем состояние объекта
    if (isRelative) {
      this.objectState.scale *= scale;
    } else {
      this.objectState.scale = scale;
    }
    
    // Ограничиваем масштаб
    this.objectState.scale = Math.max(0.5, Math.min(3.0, this.objectState.scale));
    
    // Применяем трансформацию
    this.applyObjectTransform();
    
    // Обновляем отображение состояния
    this.demoElements.objectScale.textContent = this.objectState.scale.toFixed(2);
  }
  
  /**
   * Обновляет поворот объекта
   * @param {number} rotation - Угол поворота
   * @param {boolean} isRelative - Флаг относительного поворота
   */
  updateObjectRotation(rotation, isRelative = false) {
    // Обновляем состояние объекта
    if (isRelative) {
      this.objectState.rotation += rotation;
    } else {
      this.objectState.rotation = rotation;
    }
    
    // Нормализуем угол поворота
    this.objectState.rotation = this.objectState.rotation % 360;
    
    // Применяем трансформацию
    this.applyObjectTransform();
    
    // Обновляем отображение состояния
    this.demoElements.objectRotation.textContent = `${Math.round(this.objectState.rotation)}°`;
  }
  
  /**
   * Применяет трансформацию к объекту
   */
  applyObjectTransform() {
    this.demoElements.demoObject.style.transform = `
      translate(${this.objectState.x}px, ${this.objectState.y}px)
      scale(${this.objectState.scale})
      rotate(${this.objectState.rotation}deg)
    `;
  }
  
  /**
   * Сбрасывает состояние объекта
   */
  resetObjectState() {
    this.objectState = {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    };
    
    // Применяем трансформацию
    this.applyObjectTransform();
    
    // Обновляем отображение состояния
    this.demoElements.objectPosition.textContent = '0, 0';
    this.demoElements.objectScale.textContent = '1.0';
    this.demoElements.objectRotation.textContent = '0°';
    
    // Сбрасываем стили объекта
    this.demoElements.demoObject.style.backgroundColor = '#3498db';
    this.demoElements.demoObject.style.borderRadius = '8px';
  }
  
  /**
   * Симулирует устройство ввода
   * @param {string} deviceType - Тип устройства
   */
  simulateDevice(deviceType) {
    // Отправляем событие изменения устройства ввода
    this.eventEmitter.emit('input:device:changed', { type: deviceType });
    
    // Логируем изменение устройства
    this.logGesture('info', `Симуляция устройства: ${deviceType}`);
  }
  
  /**
   * Обновляет настройки доступности
   */
  updateAccessibilitySettings() {
    const reducedMotion = this.demoElements.reducedMotionCheckbox.checked;
    const highContrast = this.demoElements.highContrastCheckbox.checked;
    const largeText = this.demoElements.largeTextCheckbox.checked;
    
    // Отправляем событие изменения настроек доступности
    this.eventEmitter.emit('accessibility:changed', {
      reducedMotion,
      highContrast,
      largeText
    });
    
    // Логируем изменение настроек доступности
    this.logGesture('info', `Настройки доступности: ${reducedMotion ? 'уменьшенное движение, ' : ''}${highContrast ? 'высокий контраст, ' : ''}${largeText ? 'крупный текст' : ''}`);
  }
  
  /**
   * Получает направление свайпа по углу
   * @param {number} angle - Угол в градусах
   * @returns {string} Направление свайпа
   */
  getSwipeDirection(angle) {
    if (angle >= -45 && angle < 45) {
      return 'right';
    } else if (angle >= 45 && angle < 135) {
      return 'down';
    } else if (angle >= 135 || angle < -135) {
      return 'left';
    } else {
      return 'up';
    }
  }
  
  /**
   * Генерирует случайный цвет
   * @returns {string} Случайный цвет в формате HEX
   */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  /**
   * Запускает демонстрацию
   */
  run() {
    this.logger.info('GestureDemo: running');
    
    // Здесь можно добавить дополнительные действия при запуске демонстрации
    
    // Логируем запуск демонстрации
    this.logGesture('info', 'Демонстрация запущена. Используйте жесты для взаимодействия с объектом.');
  }
  
  /**
   * Уничтожает демонстрационный компонент и освобождает ресурсы
   */
  destroy() {
    this.logger.info('GestureDemo: destroying');
    
    // Уничтожаем интегратор жестов
    if (this.gestureIntegration) {
      this.gestureIntegration.destroy();
      this.gestureIntegration = null;
    }
    
    // Удаляем обработчики событий
    this.eventEmitter.removeAllListeners('gesture:start');
    this.eventEmitter.removeAllListeners('gesture:end');
    this.eventEmitter.removeAllListeners('gesture:inertia');
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    this.demoElements = {};
    this.gestureLog = [];
    
    this.logger.info('GestureDemo: destroyed');
  }
}

module.exports = GestureDemo;
