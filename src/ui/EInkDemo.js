/**
 * @file EInkDemo.js
 * @description Демонстрационный компонент для тестирования адаптации интерфейса под E-Ink устройства
 * @module ui/EInkDemo
 */

const EInkAdapter = require('./EInkAdapter');
const EInkIntegration = require('./EInkIntegration');

/**
 * Класс для демонстрации и тестирования адаптации интерфейса под E-Ink устройства
 */
class EInkDemo {
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
    
    this.einkIntegration = null;
    this.demoElements = {};
  }
  
  /**
   * Инициализирует демонстрационный компонент
   */
  initialize() {
    this.logger.info('EInkDemo: initializing');
    
    // Создаем интегратор адаптации под E-Ink устройства
    this.einkIntegration = new EInkIntegration({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: {
        createControls: true,
        einkAdapter: {
          debug: true,
          refreshInterval: 1000
        }
      }
    });
    
    this.einkIntegration.initialize();
    
    // Создаем демонстрационный интерфейс
    this.createDemoInterface();
    
    // Регистрируем компоненты
    this.registerDemoComponents();
    
    // Добавляем обработчики для элементов управления
    this.addControlHandlers();
    
    this.logger.info('EInkDemo: initialized');
  }
  
  /**
   * Создает демонстрационный интерфейс
   * @private
   */
  createDemoInterface() {
    // Создаем контейнер для демонстрации
    this.container.innerHTML = `
      <div class="eink-demo">
        <div class="eink-demo-header">
          <h1>Демонстрация адаптации интерфейса под E-Ink устройства</h1>
          <div class="eink-demo-controls">
            <div class="control-group">
              <button id="toggle-eink-btn" class="demo-btn">Переключить режим E-Ink</button>
              <button id="force-refresh-btn" class="demo-btn">Полное обновление</button>
            </div>
            <div class="control-group">
              <label>Режим обновления:</label>
              <select id="refresh-mode-select">
                <option value="normal">Нормальный</option>
                <option value="fast">Быстрый</option>
                <option value="quality">Качественный</option>
              </select>
            </div>
            <div class="control-group">
              <label>
                <input type="checkbox" id="debug-checkbox">
                Показать отладочную информацию
              </label>
            </div>
          </div>
          <div id="device-info" class="device-info">
            <p>Тип устройства: <span id="device-type">определение...</span></p>
            <p>Режим E-Ink: <span id="eink-mode">определение...</span></p>
            <p>Режим обновления: <span id="refresh-mode">определение...</span></p>
          </div>
        </div>
        
        <div class="eink-demo-content">
          <div class="eink-demo-section">
            <h2>Текстовый контент</h2>
            <div class="text-samples" id="text-samples">
              <div class="text-sample">
                <h3>Заголовок первого уровня</h3>
                <p>Это обычный текстовый абзац. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
                <h4>Заголовок второго уровня</h4>
                <p>Еще один абзац с <strong>жирным текстом</strong> и <em>курсивом</em>. Также есть <a href="#">ссылка</a> для проверки стилей.</p>
                <ul>
                  <li>Первый элемент списка</li>
                  <li>Второй элемент списка</li>
                  <li>Третий элемент списка</li>
                </ul>
              </div>
              
              <div class="text-sample">
                <h3>Пример кода</h3>
                <pre><code>
function helloWorld() {
  console.log("Hello, E-Ink world!");
}

// Вызов функции
helloWorld();
                </code></pre>
              </div>
            </div>
          </div>
          
          <div class="eink-demo-section">
            <h2>Изображения и графика</h2>
            <div class="image-samples" id="image-samples">
              <div class="image-sample">
                <div class="image-placeholder">
                  <div class="image-placeholder-text">Фотография (имитация)</div>
                </div>
                <p class="image-caption">Фотография с высоким уровнем детализации</p>
              </div>
              
              <div class="image-sample">
                <div class="image-placeholder icon">
                  <div class="image-placeholder-text">Иконка</div>
                </div>
                <p class="image-caption">Простая иконка с высоким контрастом</p>
              </div>
              
              <div class="image-sample">
                <div class="image-placeholder chart">
                  <div class="image-placeholder-text">График</div>
                </div>
                <p class="image-caption">График с данными</p>
              </div>
            </div>
          </div>
          
          <div class="eink-demo-section">
            <h2>Интерактивные элементы</h2>
            <div class="interactive-samples" id="interactive-samples">
              <div class="form-sample">
                <h3>Форма ввода</h3>
                <div class="form-group">
                  <label for="text-input">Текстовое поле:</label>
                  <input type="text" id="text-input" placeholder="Введите текст">
                </div>
                
                <div class="form-group">
                  <label for="select-input">Выпадающий список:</label>
                  <select id="select-input">
                    <option>Вариант 1</option>
                    <option>Вариант 2</option>
                    <option>Вариант 3</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Флажки:</label>
                  <div class="checkbox-group">
                    <label>
                      <input type="checkbox" id="checkbox-1">
                      Вариант 1
                    </label>
                    <label>
                      <input type="checkbox" id="checkbox-2">
                      Вариант 2
                    </label>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button class="demo-btn">Отправить</button>
                  <button class="demo-btn secondary">Отмена</button>
                </div>
              </div>
              
              <div class="button-sample">
                <h3>Кнопки и элементы управления</h3>
                <div class="button-group">
                  <button class="demo-btn">Стандартная кнопка</button>
                  <button class="demo-btn primary">Основная кнопка</button>
                  <button class="demo-btn secondary">Вторичная кнопка</button>
                </div>
                
                <div class="button-group">
                  <button class="demo-btn icon">
                    <span class="icon-placeholder">+</span>
                  </button>
                  <button class="demo-btn icon">
                    <span class="icon-placeholder">-</span>
                  </button>
                  <button class="demo-btn icon">
                    <span class="icon-placeholder">✓</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="eink-demo-section">
            <h2>Компоненты комикса</h2>
            <div class="comic-samples" id="comic-samples">
              <div class="comic-panel">
                <div class="comic-image-placeholder">
                  <div class="image-placeholder-text">Панель комикса</div>
                </div>
                <div class="comic-bubble">
                  <p>Это текст в пузыре комикса.</p>
                </div>
              </div>
              
              <div class="comic-panel">
                <div class="comic-image-placeholder">
                  <div class="image-placeholder-text">Панель комикса</div>
                </div>
                <div class="comic-bubble">
                  <p>Второй пузырь с текстом.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="eink-demo-footer">
          <p>Демонстрация адаптации интерфейса под E-Ink устройства для Mr.Comic</p>
          <p>Переключите режим E-Ink, чтобы увидеть адаптацию в действии</p>
        </div>
      </div>
    `;
    
    // Добавляем стили для демонстрации
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .eink-demo {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .eink-demo-header {
        margin-bottom: 20px;
      }
      
      .eink-demo-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 20px;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 5px;
      }
      
      .control-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
      }
      
      .device-info {
        margin-top: 20px;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 5px;
      }
      
      .device-info p {
        margin: 5px 0;
      }
      
      .demo-btn {
        padding: 8px 16px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }
      
      .demo-btn:hover {
        background-color: #2980b9;
      }
      
      .demo-btn.primary {
        background-color: #2ecc71;
      }
      
      .demo-btn.primary:hover {
        background-color: #27ae60;
      }
      
      .demo-btn.secondary {
        background-color: #95a5a6;
      }
      
      .demo-btn.secondary:hover {
        background-color: #7f8c8d;
      }
      
      .demo-btn.icon {
        width: 40px;
        height: 40px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .icon-placeholder {
        font-size: 18px;
        font-weight: bold;
      }
      
      .eink-demo-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .eink-demo-section {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
      }
      
      .eink-demo-section h2 {
        margin-top: 0;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 5px;
      }
      
      .text-samples {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .text-sample {
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      
      .text-sample h3 {
        margin-top: 0;
      }
      
      .text-sample pre {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 3px;
        overflow-x: auto;
      }
      
      .image-samples {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .image-sample {
        flex: 1;
        min-width: 200px;
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        text-align: center;
      }
      
      .image-placeholder {
        height: 150px;
        background-color: #f0f0f0;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }
      
      .image-placeholder.icon {
        height: 100px;
      }
      
      .image-placeholder.chart {
        height: 120px;
      }
      
      .image-placeholder-text {
        color: #777;
      }
      
      .image-caption {
        margin: 5px 0 0;
        font-size: 0.9em;
        color: #555;
      }
      
      .interactive-samples {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .form-sample, .button-sample {
        flex: 1;
        min-width: 300px;
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      
      .form-sample h3, .button-sample h3 {
        margin-top: 0;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      .form-group input[type="text"],
      .form-group select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 3px;
      }
      
      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      
      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .comic-samples {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .comic-panel {
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .comic-image-placeholder {
        height: 150px;
        background-color: #f0f0f0;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .comic-bubble {
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 10px;
        position: relative;
      }
      
      .comic-bubble:before {
        content: '';
        position: absolute;
        top: -10px;
        left: 20px;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid white;
        z-index: 1;
      }
      
      .comic-bubble:after {
        content: '';
        position: absolute;
        top: -11px;
        left: 20px;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid #ddd;
        z-index: 0;
      }
      
      .eink-demo-footer {
        text-align: center;
        margin-top: 20px;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 5px;
      }
      
      /* Стили для отладочной информации */
      .debug-info {
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        max-height: 200px;
        overflow: auto;
      }
      
      /* Стили для E-Ink режима */
      body.eink-mode .eink-demo {
        /* Эти стили будут применены автоматически через EInkAdapter */
      }
    `;
    document.head.appendChild(styleElement);
    
    // Сохраняем ссылки на демонстрационные элементы
    this.demoElements = {
      // Элементы управления
      toggleEInkBtn: this.container.querySelector('#toggle-eink-btn'),
      forceRefreshBtn: this.container.querySelector('#force-refresh-btn'),
      refreshModeSelect: this.container.querySelector('#refresh-mode-select'),
      debugCheckbox: this.container.querySelector('#debug-checkbox'),
      
      // Информация об устройстве
      deviceType: this.container.querySelector('#device-type'),
      einkMode: this.container.querySelector('#eink-mode'),
      refreshMode: this.container.querySelector('#refresh-mode'),
      
      // Компоненты интерфейса
      textSamples: this.container.querySelector('#text-samples'),
      imageSamples: this.container.querySelector('#image-samples'),
      interactiveSamples: this.container.querySelector('#interactive-samples'),
      comicSamples: this.container.querySelector('#comic-samples')
    };
  }
  
  /**
   * Регистрирует демонстрационные компоненты
   * @private
   */
  registerDemoComponents() {
    // Регистрируем компоненты интерфейса
    this.einkIntegration.registerComponent('textSamples', this.demoElements.textSamples, 'text');
    this.einkIntegration.registerComponent('imageSamples', this.demoElements.imageSamples, 'image');
    this.einkIntegration.registerComponent('interactiveSamples', this.demoElements.interactiveSamples, 'interactive');
    this.einkIntegration.registerComponent('comicSamples', this.demoElements.comicSamples, 'comic');
  }
  
  /**
   * Добавляет обработчики для элементов управления
   * @private
   */
  addControlHandlers() {
    const einkAdapter = this.einkIntegration.getEInkAdapter();
    
    // Обработчик для переключения режима E-Ink
    this.demoElements.toggleEInkBtn.addEventListener('click', () => {
      const isEnabled = einkAdapter.isEInkModeActive();
      einkAdapter.toggleEInkMode(!isEnabled);
      this.updateDeviceInfo();
    });
    
    // Обработчик для полного обновления экрана
    this.demoElements.forceRefreshBtn.addEventListener('click', () => {
      einkAdapter.forceFullRefresh();
    });
    
    // Обработчик для изменения режима обновления
    this.demoElements.refreshModeSelect.addEventListener('change', () => {
      const selectedMode = this.demoElements.refreshModeSelect.value;
      einkAdapter.setRefreshMode(selectedMode);
      this.updateDeviceInfo();
    });
    
    // Обработчик для отображения отладочной информации
    this.demoElements.debugCheckbox.addEventListener('change', () => {
      const isChecked = this.demoElements.debugCheckbox.checked;
      
      if (isChecked) {
        this.showDebugInfo();
      } else {
        this.hideDebugInfo();
      }
    });
    
    // Устанавливаем начальное значение выпадающего списка
    this.demoElements.refreshModeSelect.value = einkAdapter.getCurrentRefreshMode();
    
    // Обновляем информацию об устройстве
    this.updateDeviceInfo();
    
    // Добавляем обработчик события изменения режима E-Ink
    this.eventEmitter.on('einkAdapter:modeChanged', () => {
      this.updateDeviceInfo();
    });
    
    // Добавляем обработчик события изменения режима обновления
    this.eventEmitter.on('einkAdapter:refreshModeChanged', () => {
      this.updateDeviceInfo();
    });
  }
  
  /**
   * Обновляет информацию об устройстве
   * @private
   */
  updateDeviceInfo() {
    const einkAdapter = this.einkIntegration.getEInkAdapter();
    
    // Обновляем тип устройства
    this.demoElements.deviceType.textContent = einkAdapter.isEInkDeviceDetected() ? 'E-Ink устройство' : 'Не E-Ink устройство';
    
    // Обновляем режим E-Ink
    this.demoElements.einkMode.textContent = einkAdapter.isEInkModeActive() ? 'Включен' : 'Выключен';
    
    // Обновляем режим обновления
    this.demoElements.refreshMode.textContent = (() => {
      switch (einkAdapter.getCurrentRefreshMode()) {
        case 'fast': return 'Быстрый';
        case 'quality': return 'Качественный';
        default: return 'Нормальный';
      }
    })();
  }
  
  /**
   * Показывает отладочную информацию
   * @private
   */
  showDebugInfo() {
    // Удаляем существующий элемент отладочной информации
    this.hideDebugInfo();
    
    // Создаем новый элемент отладочной информации
    const debugElement = document.createElement('div');
    debugElement.id = 'eink-demo-debug';
    debugElement.className = 'debug-info';
    document.body.appendChild(debugElement);
    
    // Функция обновления отладочной информации
    const updateDebugInfo = () => {
      const einkAdapter = this.einkIntegration.getEInkAdapter();
      
      // Получаем информацию о размерах окна
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Получаем информацию об устройстве
      const isEInkDevice = einkAdapter.isEInkDeviceDetected();
      const isEInkModeActive = einkAdapter.isEInkModeActive();
      const refreshMode = einkAdapter.getCurrentRefreshMode();
      
      // Формируем отладочную информацию
      debugElement.innerHTML = `
        <div>Размеры окна: ${windowWidth}x${windowHeight}</div>
        <div>E-Ink устройство: ${isEInkDevice ? 'Да' : 'Нет'}</div>
        <div>Режим E-Ink: ${isEInkModeActive ? 'Включен' : 'Выключен'}</div>
        <div>Режим обновления: ${refreshMode}</div>
        <div>User Agent: ${navigator.userAgent}</div>
      `;
    };
    
    // Обновляем отладочную информацию сразу
    updateDebugInfo();
    
    // Обновляем отладочную информацию при изменении размера окна
    this._debugResizeHandler = () => {
      updateDebugInfo();
    };
    window.addEventListener('resize', this._debugResizeHandler);
    
    // Обновляем отладочную информацию при изменении режима E-Ink
    this._debugModeChangedHandler = () => {
      updateDebugInfo();
    };
    this.eventEmitter.on('einkAdapter:modeChanged', this._debugModeChangedHandler);
    
    // Обновляем отладочную информацию при изменении режима обновления
    this._debugRefreshModeChangedHandler = () => {
      updateDebugInfo();
    };
    this.eventEmitter.on('einkAdapter:refreshModeChanged', this._debugRefreshModeChangedHandler);
  }
  
  /**
   * Скрывает отладочную информацию
   * @private
   */
  hideDebugInfo() {
    // Удаляем элемент отладочной информации
    const debugElement = document.getElementById('eink-demo-debug');
    if (debugElement) {
      debugElement.remove();
    }
    
    // Удаляем обработчик изменения размера окна
    if (this._debugResizeHandler) {
      window.removeEventListener('resize', this._debugResizeHandler);
      this._debugResizeHandler = null;
    }
    
    // Удаляем обработчики событий
    if (this._debugModeChangedHandler) {
      this.eventEmitter.off('einkAdapter:modeChanged', this._debugModeChangedHandler);
      this._debugModeChangedHandler = null;
    }
    
    if (this._debugRefreshModeChangedHandler) {
      this.eventEmitter.off('einkAdapter:refreshModeChanged', this._debugRefreshModeChangedHandler);
      this._debugRefreshModeChangedHandler = null;
    }
  }
  
  /**
   * Запускает демонстрацию
   */
  run() {
    this.logger.info('EInkDemo: running');
    
    // Здесь можно добавить дополнительные действия при запуске демонстрации
  }
  
  /**
   * Уничтожает демонстрационный компонент и освобождает ресурсы
   */
  destroy() {
    this.logger.info('EInkDemo: destroying');
    
    // Скрываем отладочную информацию
    this.hideDebugInfo();
    
    // Удаляем обработчики событий
    this.eventEmitter.off('einkAdapter:modeChanged');
    this.eventEmitter.off('einkAdapter:refreshModeChanged');
    
    // Уничтожаем интегратор адаптации по�� E-Ink устройства
    if (this.einkIntegration) {
      this.einkIntegration.destroy();
      this.einkIntegration = null;
    }
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    this.demoElements = {};
    
    this.logger.info('EInkDemo: destroyed');
  }
}

module.exports = EInkDemo;
