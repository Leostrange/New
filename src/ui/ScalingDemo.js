/**
 * @file ScalingDemo.js
 * @description Демонстрационный компонент для тестирования функциональности масштабирования
 * @module ui/ScalingDemo
 */

const ScalingManager = require('./ScalingManager');
const UIScalingIntegration = require('./UIScalingIntegration');

/**
 * Класс для демонстрации и тестирования функциональности масштабирования
 */
class ScalingDemo {
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
    
    this.scalingIntegration = null;
    this.demoElements = [];
  }
  
  /**
   * Инициализирует демонстрационный компонент
   */
  initialize() {
    this.logger.info('ScalingDemo: initializing');
    
    // Создаем интегратор масштабирования
    this.scalingIntegration = new UIScalingIntegration({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: {
        defaultScale: 1.0,
        minScale: 0.5,
        maxScale: 3.0,
        stepScale: 0.1
      }
    });
    
    this.scalingIntegration.initialize();
    
    // Создаем демонстрационный интерфейс
    this.createDemoInterface();
    
    // Создаем глобальный менеджер масштабирования
    this.globalScalingManager = this.scalingIntegration.createGlobalScalingManager(
      this.container.querySelector('.scaling-demo-content')
    );
    
    // Создаем менеджер масштабирования для отдельного компонента
    this.componentScalingManager = this.scalingIntegration.createScalingManager(
      'component1',
      this.container.querySelector('.scaling-demo-component'),
      { defaultScale: 1.0 }
    );
    
    // Регистрируем элементы для специальной обработки масштабирования
    this.registerSpecialElements();
    
    // Добавляем обработчики для элементов управления
    this.addControlHandlers();
    
    this.logger.info('ScalingDemo: initialized');
  }
  
  /**
   * Создает демонстрационный интерфейс
   * @private
   */
  createDemoInterface() {
    // Создаем контейнер для демонстрации
    this.container.innerHTML = `
      <div class="scaling-demo">
        <div class="scaling-demo-header">
          <h1>Демонстрация масштабирования интерфейса</h1>
          <div class="scaling-demo-controls">
            <button id="zoom-in-btn">Увеличить</button>
            <button id="zoom-out-btn">Уменьшить</button>
            <button id="zoom-reset-btn">Сбросить</button>
            <span id="zoom-level">100%</span>
          </div>
        </div>
        
        <div class="scaling-demo-content">
          <div class="scaling-demo-main">
            <h2>Основной контент</h2>
            <p>Этот текст будет масштабироваться вместе с интерфейсом.</p>
            <div class="scaling-demo-component">
              <h3>Отдельный компонент</h3>
              <p>Этот компонент имеет свой собственный менеджер масштабирования.</p>
              <div class="scaling-demo-component-controls">
                <button id="component-zoom-in-btn">+</button>
                <button id="component-zoom-out-btn">-</button>
                <button id="component-zoom-reset-btn">Сбросить</button>
                <span id="component-zoom-level">100%</span>
              </div>
            </div>
            
            <div class="scaling-demo-special">
              <h3>Специальные элементы</h3>
              <div class="scaling-demo-inverse" id="inverse-element">
                Этот элемент имеет инверсное масштабирование
              </div>
              <div class="scaling-demo-custom" id="custom-element">
                Этот элемент имеет пользовательский коэффициент масштабирования
              </div>
            </div>
          </div>
          
          <div class="scaling-demo-sidebar">
            <h3>Настройки масштабирования</h3>
            <div class="scaling-demo-settings">
              <label>
                Минимальный масштаб:
                <input type="range" id="min-scale-input" min="0.1" max="1" step="0.1" value="0.5">
                <span id="min-scale-value">0.5</span>
              </label>
              <label>
                Максимальный масштаб:
                <input type="range" id="max-scale-input" min="1" max="5" step="0.1" value="3.0">
                <span id="max-scale-value">3.0</span>
              </label>
              <label>
                Шаг масштабирования:
                <input type="range" id="step-scale-input" min="0.01" max="0.5" step="0.01" value="0.1">
                <span id="step-scale-value">0.1</span>
              </label>
              <label>
                <input type="checkbox" id="animation-checkbox" checked>
                Анимация масштабирования
              </label>
            </div>
          </div>
        </div>
        
        <div class="scaling-demo-footer">
          <p>Используйте колесико мыши + Ctrl для масштабирования или сенсорные жесты.</p>
          <p>Клавиатурные сочетания: Ctrl+Plus, Ctrl+Minus, Ctrl+0</p>
        </div>
      </div>
    `;
    
    // Добавляем стили для демонстрации
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .scaling-demo {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .scaling-demo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .scaling-demo-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .scaling-demo-content {
        display: flex;
        gap: 20px;
      }
      
      .scaling-demo-main {
        flex: 3;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      
      .scaling-demo-sidebar {
        flex: 1;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      
      .scaling-demo-component {
        margin-top: 20px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      
      .scaling-demo-component-controls {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-top: 10px;
      }
      
      .scaling-demo-special {
        margin-top: 20px;
      }
      
      .scaling-demo-inverse {
        padding: 10px;
        margin-top: 10px;
        background-color: #e0f7fa;
        border-radius: 5px;
      }
      
      .scaling-demo-custom {
        padding: 10px;
        margin-top: 10px;
        background-color: #f3e5f5;
        border-radius: 5px;
      }
      
      .scaling-demo-settings {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .scaling-demo-settings label {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .scaling-demo-footer {
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #eee;
        font-size: 0.9em;
        color: #666;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Сохраняем ссылки на демонстрационные элементы
    this.demoElements = {
      zoomInBtn: this.container.querySelector('#zoom-in-btn'),
      zoomOutBtn: this.container.querySelector('#zoom-out-btn'),
      zoomResetBtn: this.container.querySelector('#zoom-reset-btn'),
      zoomLevel: this.container.querySelector('#zoom-level'),
      
      componentZoomInBtn: this.container.querySelector('#component-zoom-in-btn'),
      componentZoomOutBtn: this.container.querySelector('#component-zoom-out-btn'),
      componentZoomResetBtn: this.container.querySelector('#component-zoom-reset-btn'),
      componentZoomLevel: this.container.querySelector('#component-zoom-level'),
      
      minScaleInput: this.container.querySelector('#min-scale-input'),
      maxScaleInput: this.container.querySelector('#max-scale-input'),
      stepScaleInput: this.container.querySelector('#step-scale-input'),
      minScaleValue: this.container.querySelector('#min-scale-value'),
      maxScaleValue: this.container.querySelector('#max-scale-value'),
      stepScaleValue: this.container.querySelector('#step-scale-value'),
      
      animationCheckbox: this.container.querySelector('#animation-checkbox'),
      
      inverseElement: this.container.querySelector('#inverse-element'),
      customElement: this.container.querySelector('#custom-element')
    };
  }
  
  /**
   * Регистрирует элементы для специальной обработки масштабирования
   * @private
   */
  registerSpecialElements() {
    // Регистрируем элемент с инверсным масштабированием
    this.scalingIntegration.registerElementForScaling('global', this.demoElements.inverseElement, {
      scaleMode: 'inverse'
    });
    
    // Регистрируем элемент с пользовательским коэффициентом масштабирования
    this.scalingIntegration.registerElementForScaling('global', this.demoElements.customElement, {
      scaleMode: 'custom',
      scaleFactor: 1.5
    });
  }
  
  /**
   * Добавляет обработчики для элементов управления
   * @private
   */
  addControlHandlers() {
    // Обработчики для глобального масштабирования
    this.demoElements.zoomInBtn.addEventListener('click', () => {
      this.globalScalingManager.zoomIn();
    });
    
    this.demoElements.zoomOutBtn.addEventListener('click', () => {
      this.globalScalingManager.zoomOut();
    });
    
    this.demoElements.zoomResetBtn.addEventListener('click', () => {
      this.globalScalingManager.resetScale();
    });
    
    // Обработчики для масштабирования компонента
    this.demoElements.componentZoomInBtn.addEventListener('click', () => {
      this.componentScalingManager.zoomIn();
    });
    
    this.demoElements.componentZoomOutBtn.addEventListener('click', () => {
      this.componentScalingManager.zoomOut();
    });
    
    this.demoElements.componentZoomResetBtn.addEventListener('click', () => {
      this.componentScalingManager.resetScale();
    });
    
    // Обработчики для настроек масштабирования
    this.demoElements.minScaleInput.addEventListener('input', () => {
      const minScale = parseFloat(this.demoElements.minScaleInput.value);
      const maxScale = parseFloat(this.demoElements.maxScaleInput.value);
      
      this.demoElements.minScaleValue.textContent = minScale.toFixed(1);
      
      if (minScale < maxScale) {
        this.scalingIntegration.updateScalingSettings({ minScale });
      }
    });
    
    this.demoElements.maxScaleInput.addEventListener('input', () => {
      const minScale = parseFloat(this.demoElements.minScaleInput.value);
      const maxScale = parseFloat(this.demoElements.maxScaleInput.value);
      
      this.demoElements.maxScaleValue.textContent = maxScale.toFixed(1);
      
      if (maxScale > minScale) {
        this.scalingIntegration.updateScalingSettings({ maxScale });
      }
    });
    
    this.demoElements.stepScaleInput.addEventListener('input', () => {
      const stepScale = parseFloat(this.demoElements.stepScaleInput.value);
      
      this.demoElements.stepScaleValue.textContent = stepScale.toFixed(2);
      this.scalingIntegration.updateScalingSettings({ stepScale });
    });
    
    this.demoElements.animationCheckbox.addEventListener('change', () => {
      const enabled = this.demoElements.animationCheckbox.checked;
      
      this.globalScalingManager.setAnimationEnabled(enabled);
      this.componentScalingManager.setAnimationEnabled(enabled);
    });
    
    // Обработчики для обновления отображения текущего масштаба
    this.scalingIntegration.setOnScaleChangeCallback = (componentId, scale) => {
      if (componentId === 'global') {
        this.demoElements.zoomLevel.textContent = `${Math.round(scale * 100)}%`;
      } else if (componentId === 'component1') {
        this.demoElements.componentZoomLevel.textContent = `${Math.round(scale * 100)}%`;
      }
    };
    
    // Регистрируем обработчики событий
    this.eventEmitter.on('uiScaling:scaleChanged', ({ componentId, scale }) => {
      if (componentId === 'global') {
        this.demoElements.zoomLevel.textContent = `${Math.round(scale * 100)}%`;
      } else if (componentId === 'component1') {
        this.demoElements.componentZoomLevel.textContent = `${Math.round(scale * 100)}%`;
      }
    });
  }
  
  /**
   * Запускает демонстрацию
   */
  run() {
    this.logger.info('ScalingDemo: running');
    
    // Здесь можно добавить дополнительные действия при запуске демонстрации
    
    // Отображаем начальные значения
    this.demoElements.zoomLevel.textContent = `${Math.round(this.globalScalingManager.getCurrentScale() * 100)}%`;
    this.demoElements.componentZoomLevel.textContent = `${Math.round(this.componentScalingManager.getCurrentScale() * 100)}%`;
  }
  
  /**
   * Уничтожает демонстрационный компонент и освобождает ресурсы
   */
  destroy() {
    this.logger.info('ScalingDemo: destroying');
    
    // Уничтожаем интегратор масштабирования
    if (this.scalingIntegration) {
      this.scalingIntegration.destroy();
      this.scalingIntegration = null;
    }
    
    // Удаляем обработчики событий
    this.eventEmitter.removeAllListeners('uiScaling:scaleChanged');
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    this.demoElements = [];
    
    this.logger.info('ScalingDemo: destroyed');
  }
}

module.exports = ScalingDemo;
