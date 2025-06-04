/**
 * @file TabletDemo.js
 * @description Демонстрационный компонент для тестирования адаптации интерфейса под планшеты
 * @module ui/TabletDemo
 */

const TabletAdapter = require('./TabletAdapter');
const TabletIntegration = require('./TabletIntegration');

/**
 * Класс для демонстрации и тестирования адаптации интерфейса под планшеты
 */
class TabletDemo {
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
    
    this.tabletIntegration = null;
    this.demoElements = {};
  }
  
  /**
   * Инициализирует демонстрационный компонент
   */
  initialize() {
    this.logger.info('TabletDemo: initializing');
    
    // Создаем интегратор адаптации под планшеты
    this.tabletIntegration = new TabletIntegration({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: {
        createControls: true,
        tabletAdapter: {
          debug: true
        }
      }
    });
    
    this.tabletIntegration.initialize();
    
    // Создаем демонстрационный интерфейс
    this.createDemoInterface();
    
    // Регистрируем компоненты
    this.registerDemoComponents();
    
    // Добавляем обработчики для элементов управления
    this.addControlHandlers();
    
    this.logger.info('TabletDemo: initialized');
  }
  
  /**
   * Создает демонстрационный интерфейс
   * @private
   */
  createDemoInterface() {
    // Создаем контейнер для демонстрации
    this.container.innerHTML = `
      <div class="tablet-demo">
        <div class="tablet-demo-header">
          <h1>Демонстрация адаптации интерфейса под планшеты</h1>
          <div class="tablet-demo-controls">
            <div class="control-group">
              <button id="toggle-sidebar-btn" class="demo-btn">Переключить боковую панель</button>
              <button id="toggle-toolbar-btn" class="demo-btn">Переключить панель инструментов</button>
              <button id="toggle-fab-btn" class="demo-btn">Переключить плавающую кнопку</button>
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
            <p>Ориентация: <span id="orientation">определение...</span></p>
            <p>Текущий макет: <span id="current-layout">определение...</span></p>
          </div>
        </div>
        
        <div class="tablet-demo-content layout-stack" id="demo-layout">
          <div class="tablet-demo-sidebar" id="demo-sidebar">
            <h2>Боковая панель</h2>
            <ul class="sidebar-menu">
              <li class="sidebar-item active">Главная</li>
              <li class="sidebar-item">Библиотека</li>
              <li class="sidebar-item">Избранное</li>
              <li class="sidebar-item">Настройки</li>
              <li class="sidebar-item">Справка</li>
            </ul>
          </div>
          
          <div class="tablet-demo-main">
            <div class="tablet-demo-toolbar" id="demo-toolbar">
              <div class="toolbar-item essential">Файл</div>
              <div class="toolbar-item essential">Правка</div>
              <div class="toolbar-item">Вид</div>
              <div class="toolbar-item">Инструменты</div>
              <div class="toolbar-item toolbar-item-extra">Окно</div>
              <div class="toolbar-item toolbar-item-extra">Справка</div>
              <div class="toolbar-spacer"></div>
              <div class="toolbar-item">
                <button class="demo-btn small">Действие</button>
              </div>
            </div>
            
            <div class="tablet-demo-sections">
              <div class="tablet-demo-section">
                <h2>Компоненты интерфейса</h2>
                
                <div class="component-group">
                  <h3>Карточки</h3>
                  <div class="cards-container" id="demo-cards">
                    <div class="card">
                      <div class="card-header">Карточка 1</div>
                      <div class="card-body">
                        <p>Содержимое карточки. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      </div>
                      <div class="card-footer">
                        <button class="demo-btn small">Действие</button>
                      </div>
                    </div>
                    
                    <div class="card">
                      <div class="card-header">Карточка 2</div>
                      <div class="card-body">
                        <p>Содержимое карточки. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      </div>
                      <div class="card-footer">
                        <button class="demo-btn small">Действие</button>
                      </div>
                    </div>
                    
                    <div class="card">
                      <div class="card-header">Карточка 3</div>
                      <div class="card-body">
                        <p>Содержимое карточки. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      </div>
                      <div class="card-footer">
                        <button class="demo-btn small">Действие</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="component-group">
                  <h3>Формы</h3>
                  <div class="form-container" id="demo-form">
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
                      <label for="textarea-input">Многострочное поле:</label>
                      <textarea id="textarea-input" placeholder="Введите текст"></textarea>
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
                    
                    <div class="form-group">
                      <label>Радиокнопки:</label>
                      <div class="radio-group">
                        <label>
                          <input type="radio" name="radio-group" id="radio-1" checked>
                          Вариант 1
                        </label>
                        <label>
                          <input type="radio" name="radio-group" id="radio-2">
                          Вариант 2
                        </label>
                      </div>
                    </div>
                    
                    <div class="form-actions">
                      <button class="demo-btn">Отправить</button>
                      <button class="demo-btn secondary">Отмена</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="tablet-demo-section">
                <h2>Компоненты комикса</h2>
                
                <div class="component-group">
                  <h3>Панели комикса</h3>
                  <div class="comic-container" id="demo-comic">
                    <div class="comic-panel">
                      <div class="comic-image"></div>
                      <div class="comic-bubble">
                        <p>Это текст в пузыре комикса.</p>
                      </div>
                    </div>
                    
                    <div class="comic-panel">
                      <div class="comic-image"></div>
                      <div class="comic-bubble">
                        <p>Второй пузырь с текстом.</p>
                      </div>
                    </div>
                    
                    <div class="comic-panel">
                      <div class="comic-image"></div>
                      <div class="comic-bubble">
                        <p>Третий пузырь с текстом.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="component-group">
                  <h3>Редактор комикса</h3>
                  <div class="editor-container" id="demo-editor">
                    <div class="editor-toolbar">
                      <div class="editor-toolbar-item essential">Текст</div>
                      <div class="editor-toolbar-item essential">Изображение</div>
                      <div class="editor-toolbar-item">Форма</div>
                      <div class="editor-toolbar-item">Цвет</div>
                      <div class="editor-toolbar-item">Эффекты</div>
                      <div class="editor-toolbar-item">Слои</div>
                    </div>
                    
                    <div class="editor-area">
                      <div class="editor-canvas">
                        <div class="editor-placeholder">Область редактирования</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tablet-demo-footer">
          <p>Демонстрация адаптации интерфейса под планшеты для Mr.Comic</p>
          <p>Измените размер окна или ориентацию устройства, чтобы увидеть адаптацию в действии</p>
        </div>
      </div>
    `;
    
    // Добавляем стили для демонстрации
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .tablet-demo {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .tablet-demo-header {
        margin-bottom: 20px;
      }
      
      .tablet-demo-controls {
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
      
      .demo-btn.secondary {
        background-color: #95a5a6;
      }
      
      .demo-btn.secondary:hover {
        background-color: #7f8c8d;
      }
      
      .demo-btn.small {
        padding: 4px 8px;
        font-size: 0.9em;
      }
      
      .tablet-demo-content {
        display: flex;
        margin-bottom: 20px;
      }
      
      .layout-stack {
        flex-direction: column;
      }
      
      .layout-split {
        flex-direction: row;
      }
      
      .layout-grid {
        display: grid;
        grid-template-columns: 250px 1fr;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          "sidebar toolbar"
          "sidebar main";
        gap: 20px;
      }
      
      .tablet-demo-sidebar {
        background-color: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
      }
      
      .layout-split .tablet-demo-sidebar {
        width: 250px;
        margin-right: 20px;
        margin-bottom: 0;
      }
      
      .layout-grid .tablet-demo-sidebar {
        grid-area: sidebar;
        margin-bottom: 0;
      }
      
      .sidebar-menu {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .sidebar-item {
        padding: 10px;
        cursor: pointer;
        border-radius: 3px;
      }
      
      .sidebar-item:hover {
        background-color: #e0e0e0;
      }
      
      .sidebar-item.active {
        background-color: #3498db;
        color: white;
      }
      
      .tablet-demo-main {
        flex-grow: 1;
      }
      
      .tablet-demo-toolbar {
        display: flex;
        align-items: center;
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 20px;
        overflow-x: auto;
      }
      
      .layout-grid .tablet-demo-toolbar {
        grid-area: toolbar;
        margin-bottom: 0;
      }
      
      .toolbar-item {
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
      }
      
      .toolbar-item:hover {
        background-color: #e0e0e0;
        border-radius: 3px;
      }
      
      .toolbar-spacer {
        flex-grow: 1;
      }
      
      .tablet-demo-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .layout-grid .tablet-demo-sections {
        grid-area: main;
      }
      
      .tablet-demo-section {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
      }
      
      .component-group {
        margin-bottom: 20px;
      }
      
      .component-group h3 {
        margin-top: 0;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 5px;
      }
      
      .cards-container {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .card {
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        width: 100%;
      }
      
      .card-header {
        padding: 10px 15px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
        font-weight: bold;
      }
      
      .card-body {
        padding: 15px;
      }
      
      .card-footer {
        padding: 10px 15px;
        background-color: #f5f5f5;
        border-top: 1px solid #e0e0e0;
        text-align: right;
      }
      
      .form-container {
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
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
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 3px;
      }
      
      .form-group textarea {
        min-height: 100px;
        resize: vertical;
      }
      
      .checkbox-group,
      .radio-group {
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
      
      .comic-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
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
      
      .comic-image {
        height: 150px;
        background-color: #f0f0f0;
        border-radius: 3px;
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
      
      .editor-container {
        display: flex;
        border: 1px solid #ddd;
        border-radius: 5px;
        overflow: hidden;
        height: 300px;
      }
      
      .editor-toolbar {
        display: flex;
        flex-direction: column;
        background-color: #f5f5f5;
        border-right: 1px solid #ddd;
        padding: 10px;
      }
      
      .editor-toolbar-item {
        padding: 8px 12px;
        cursor: pointer;
        white-space: nowrap;
        margin-bottom: 5px;
      }
      
      .editor-toolbar-item:hover {
        background-color: #e0e0e0;
        border-radius: 3px;
      }
      
      .editor-area {
        flex-grow: 1;
        position: relative;
        background-color: white;
      }
      
      .editor-canvas {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .editor-placeholder {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #999;
      }
      
      .tablet-demo-footer {
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
      
      /* Медиа-запросы для адаптивного дизайна */
      @media (min-width: 768px) {
        .cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
      }
      
      @media (max-width: 767px) {
        .tablet-demo-controls {
          flex-direction: column;
        }
        
        .tablet-demo-content {
          flex-direction: column;
        }
        
        .tablet-demo-sidebar {
          width: 100%;
          margin-right: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Сохраняем ссылки на демонстрационные элементы
    this.demoElements = {
      // Элементы управления
      toggleSidebarBtn: this.container.querySelector('#toggle-sidebar-btn'),
      toggleToolbarBtn: this.container.querySelector('#toggle-toolbar-btn'),
      toggleFabBtn: this.container.querySelector('#toggle-fab-btn'),
      debugCheckbox: this.container.querySelector('#debug-checkbox'),
      
      // Информация об устройстве
      deviceType: this.container.querySelector('#device-type'),
      orientation: this.container.querySelector('#orientation'),
      currentLayout: this.container.querySelector('#current-layout'),
      
      // Компоненты интерфейса
      demoLayout: this.container.querySelector('#demo-layout'),
      demoSidebar: this.container.querySelector('#demo-sidebar'),
      demoToolbar: this.container.querySelector('#demo-toolbar'),
      demoCards: this.container.querySelector('#demo-cards'),
      demoForm: this.container.querySelector('#demo-form'),
      demoComic: this.container.querySelector('#demo-comic'),
      demoEditor: this.container.querySelector('#demo-editor')
    };
  }
  
  /**
   * Регистрирует демонстрационные компоненты
   * @private
   */
  registerDemoComponents() {
    // Регистрируем компоненты интерфейса
    this.tabletIntegration.registerComponent('layout', this.demoElements.demoLayout, 'layout');
    this.tabletIntegration.registerComponent('sidebar', this.demoElements.demoSidebar, 'sidebar');
    this.tabletIntegration.registerComponent('toolbar', this.demoElements.demoToolbar, 'toolbar');
    this.tabletIntegration.registerComponent('cards', this.demoElements.demoCards, 'content');
    this.tabletIntegration.registerComponent('form', this.demoElements.demoForm, 'form');
    this.tabletIntegration.registerComponent('comic', this.demoElements.demoComic, 'comic');
    this.tabletIntegration.registerComponent('editor', this.demoElements.demoEditor, 'editor');
  }
  
  /**
   * Добавляет обработчики для элементов управления
   * @private
   */
  addControlHandlers() {
    const tabletAdapter = this.tabletIntegration.getTabletAdapter();
    
    // Обработчик для переключения боковой панели
    this.demoElements.toggleSidebarBtn.addEventListener('click', () => {
      const sidebar = this.demoElements.demoSidebar;
      const isVisible = sidebar.style.display !== 'none';
      
      if (isVisible) {
        sidebar.style.display = 'none';
      } else {
        sidebar.style.display = '';
      }
    });
    
    // Обработчик для переключения панели инструментов
    this.demoElements.toggleToolbarBtn.addEventListener('click', () => {
      const toolbar = this.demoElements.demoToolbar;
      const isVisible = toolbar.style.display !== 'none';
      
      if (isVisible) {
        toolbar.style.display = 'none';
      } else {
        toolbar.style.display = '';
      }
    });
    
    // Обработчик для переключения плавающей кнопки
    this.demoElements.toggleFabBtn.addEventListener('click', () => {
      // Получаем текущее состояние кнопки
      const fabElement = document.getElementById('tablet-adapter-fab');
      const isVisible = fabElement ? fabElement.style.display !== 'none' : false;
      
      if (isVisible) {
        tabletAdapter.toggleFloatingActionButton(false);
      } else {
        tabletAdapter.toggleFloatingActionButton(true, {
          icon: '+',
          backgroundColor: '#e74c3c',
          onClick: () => {
            alert('Нажата плавающая кнопка действия');
          }
        });
      }
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
    
    // Обновляем информацию об устройстве
    this.updateDeviceInfo();
    
    // Добавляем обработчик события изменения типа устройства
    this.eventEmitter.on('tabletAdapter:deviceTypeChanged', () => {
      this.updateDeviceInfo();
    });
    
    // Добавляем обработчик события изменения ориентации экрана
    this.eventEmitter.on('tabletAdapter:orientationChanged', () => {
      this.updateDeviceInfo();
    });
  }
  
  /**
   * Обновляет информацию об устройстве
   * @private
   */
  updateDeviceInfo() {
    const tabletAdapter = this.tabletIntegration.getTabletAdapter();
    
    // Обновляем тип устройства
    if (tabletAdapter.isLargeTabletDevice()) {
      this.demoElements.deviceType.textContent = 'Большой планшет';
    } else if (tabletAdapter.isTabletDevice()) {
      this.demoElements.deviceType.textContent = 'Планшет';
    } else {
      this.demoElements.deviceType.textContent = 'Не планшет';
    }
    
    // Обновляем ориентацию
    this.demoElements.orientation.textContent = tabletAdapter.getOrientation() === 'portrait' ? 'Портретная' : 'Альбомная';
    
    // Обновляем текущий макет
    this.demoElements.currentLayout.textContent = tabletAdapter.getCurrentLayout();
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
    debugElement.id = 'tablet-demo-debug';
    debugElement.className = 'debug-info';
    document.body.appendChild(debugElement);
    
    // Функция обновления отладочной информации
    const updateDebugInfo = () => {
      const tabletAdapter = this.tabletIntegration.getTabletAdapter();
      
      // Получаем информацию о размерах окна
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Получаем информацию об устройстве
      const isTablet = tabletAdapter.isTabletDevice();
      const isLargeTablet = tabletAdapter.isLargeTabletDevice();
      const orientation = tabletAdapter.getOrientation();
      const layout = tabletAdapter.getCurrentLayout();
      
      // Формируем отладочную информацию
      debugElement.innerHTML = `
        <div>Размеры окна: ${windowWidth}x${windowHeight}</div>
        <div>Тип устройства: ${isLargeTablet ? 'Большой планшет' : (isTablet ? 'Планшет' : 'Не планшет')}</div>
        <div>Ориентация: ${orientation}</div>
        <div>Макет: ${layout}</div>
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
    
    // Обновляем отладочную информацию при изменении типа устройства
    this._debugDeviceTypeChangedHandler = () => {
      updateDebugInfo();
    };
    this.eventEmitter.on('tabletAdapter:deviceTypeChanged', this._debugDeviceTypeChangedHandler);
    
    // Обновляем отладочную информацию при изменении ориентации экрана
    this._debugOrientationChangedHandler = () => {
      updateDebugInfo();
    };
    this.eventEmitter.on('tabletAdapter:orientationChanged', this._debugOrientationChangedHandler);
  }
  
  /**
   * Скрывает отладочную информацию
   * @private
   */
  hideDebugInfo() {
    // Удаляем элемент отладочной информации
    const debugElement = document.getElementById('tablet-demo-debug');
    if (debugElement) {
      debugElement.remove();
    }
    
    // Удаляем обработчик изменения размера окна
    if (this._debugResizeHandler) {
      window.removeEventListener('resize', this._debugResizeHandler);
      this._debugResizeHandler = null;
    }
    
    // Удаляем обработчики событий
    if (this._debugDeviceTypeChangedHandler) {
      this.eventEmitter.off('tabletAdapter:deviceTypeChanged', this._debugDeviceTypeChangedHandler);
      this._debugDeviceTypeChangedHandler = null;
    }
    
    if (this._debugOrientationChangedHandler) {
      this.eventEmitter.off('tabletAdapter:orientationChanged', this._debugOrientationChangedHandler);
      this._debugOrientationChangedHandler = null;
    }
  }
  
  /**
   * Запускает демонстрацию
   */
  run() {
    this.logger.info('TabletDemo: running');
    
    // Здесь можно добавить дополнительные действия при запуске демонстрации
  }
  
  /**
   * Уничтожает демонстрационный компонент и освобождает ресурсы
   */
  destroy() {
    this.logger.info('TabletDemo: destroying');
    
    // Скрываем отладочную информацию
    this.hideDebugInfo();
    
    // Удаляем обработчики событий
    this.eventEmitter.off('tabletAdapter:deviceTypeChanged');
    this.eventEmitter.off('tabletAdapter:orientationChanged');
    
    // Уничтожаем интегратор адаптации под планшеты
    if (this.tabletIntegration) {
      this.tabletIntegration.destroy();
      this.tabletIntegration = null;
    }
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    this.demoElements = {};
    
    this.logger.info('TabletDemo: destroyed');
  }
}

module.exports = TabletDemo;
