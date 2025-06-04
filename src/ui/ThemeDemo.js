/**
 * @file ThemeDemo.js
 * @description Демонстрационный компонент для тестирования функциональности тем и ночного режима
 * @module ui/ThemeDemo
 */

const ThemeManager = require('./ThemeManager');
const ThemeIntegration = require('./ThemeIntegration');

/**
 * Класс для демонстрации и тестирования функциональности тем
 */
class ThemeDemo {
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
    
    this.themeIntegration = null;
    this.demoElements = {};
  }
  
  /**
   * Инициализирует демонстрационный компонент
   */
  initialize() {
    this.logger.info('ThemeDemo: initializing');
    
    // Создаем интегратор тем
    this.themeIntegration = new ThemeIntegration({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: {
        createControls: false,
        themeManager: {
          debug: true,
          autoMode: {
            enabled: true,
            startDarkTime: '20:00',
            startLightTime: '07:00',
            checkInterval: 10000, // 10 секунд для демонстрации
            respectSystemPreference: true
          }
        }
      },
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key)
      }
    });
    
    this.themeIntegration.initialize();
    
    // Создаем демонстрационный интерфейс
    this.createDemoInterface();
    
    // Регистрируем компоненты
    this.registerDemoComponents();
    
    // Добавляем обработчики для элементов управления
    this.addControlHandlers();
    
    this.logger.info('ThemeDemo: initialized');
  }
  
  /**
   * Создает демонстрационный интерфейс
   * @private
   */
  createDemoInterface() {
    // Создаем контейнер для демонстрации
    this.container.innerHTML = `
      <div class="theme-demo">
        <div class="theme-demo-header">
          <h1>Демонстрация тем и ночного режима</h1>
          <div class="theme-demo-controls">
            <div class="theme-control-group">
              <button id="toggle-theme-btn" class="theme-btn">Переключить тему</button>
              <div class="theme-select-container">
                <label for="theme-select">Выбрать тему:</label>
                <select id="theme-select" class="theme-select">
                  <option value="light">Светлая</option>
                  <option value="dark">Темная</option>
                  <option value="sepia">Сепия</option>
                  <option value="high-contrast">Высокий контраст</option>
                  <option value="e-ink">E-Ink</option>
                </select>
              </div>
            </div>
            <div class="theme-control-group">
              <label class="auto-mode-label">
                <input type="checkbox" id="auto-mode-checkbox">
                Автоматический режим
              </label>
              <div class="time-settings">
                <div class="time-setting">
                  <label for="dark-time">Начало темной темы:</label>
                  <input type="time" id="dark-time" value="20:00">
                </div>
                <div class="time-setting">
                  <label for="light-time">Начало светлой темы:</label>
                  <input type="time" id="light-time" value="07:00">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="theme-demo-content">
          <div class="theme-demo-main">
            <h2>Компоненты интерфейса</h2>
            
            <div class="theme-demo-section">
              <h3>Текст и типография</h3>
              <div class="typography-demo">
                <h1>Заголовок первого уровня</h1>
                <h2>Заголовок второго уровня</h2>
                <h3>Заголовок третьего уровня</h3>
                <p>Обычный текст параграфа. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis eget urna mattis placerat.</p>
                <p><strong>Жирный текст</strong> и <em>курсив</em> для выделения важной информации.</p>
                <p><a href="#" class="link">Это ссылка</a> на другую страницу или раздел.</p>
                <blockquote>Это блок цитаты. Он может содержать важную информацию или цитату из другого источника.</blockquote>
                <pre><code>// Это блок кода
function helloWorld() {
  console.log("Hello, World!");
}</code></pre>
              </div>
            </div>
            
            <div class="theme-demo-section">
              <h3>Кнопки и элементы управления</h3>
              <div class="buttons-demo">
                <button class="btn primary">Основная кнопка</button>
                <button class="btn secondary">Вторичная кнопка</button>
                <button class="btn success">Кнопка успеха</button>
                <button class="btn danger">Кнопка опасности</button>
                <button class="btn" disabled>Отключенная кнопка</button>
                
                <div class="form-controls">
                  <div class="form-group">
                    <label for="text-input">Текстовое поле:</label>
                    <input type="text" id="text-input" placeholder="Введите текст">
                  </div>
                  
                  <div class="form-group">
                    <label for="checkbox-input">Флажок:</label>
                    <input type="checkbox" id="checkbox-input">
                  </div>
                  
                  <div class="form-group">
                    <label for="radio-input-1">Радиокнопки:</label>
                    <div class="radio-group">
                      <label>
                        <input type="radio" name="radio-group" id="radio-input-1" checked>
                        Вариант 1
                      </label>
                      <label>
                        <input type="radio" name="radio-group" id="radio-input-2">
                        Вариант 2
                      </label>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="select-input">Выпадающий список:</label>
                    <select id="select-input">
                      <option>Вариант 1</option>
                      <option>Вариант 2</option>
                      <option>Вариант 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="theme-demo-section">
              <h3>Карточки и контейнеры</h3>
              <div class="cards-demo">
                <div class="card">
                  <div class="card-header">Заголовок карточки</div>
                  <div class="card-body">
                    <p>Содержимое карточки. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  </div>
                  <div class="card-footer">
                    <button class="btn primary">Действие</button>
                  </div>
                </div>
                
                <div class="card">
                  <div class="card-header">Информационная карточка</div>
                  <div class="card-body">
                    <p>Эта карточка содержит важную информацию.</p>
                    <div class="alert info">
                      <strong>Информация!</strong> Это информационное сообщение.
                    </div>
                  </div>
                </div>
                
                <div class="card">
                  <div class="card-header">Карточка с предупреждением</div>
                  <div class="card-body">
                    <div class="alert warning">
                      <strong>Внимание!</strong> Это предупреждающее сообщение.
                    </div>
                    <div class="alert error">
                      <strong>Ошибка!</strong> Это сообщение об ошибке.
                    </div>
                    <div class="alert success">
                      <strong>Успех!</strong> Это сообщение об успешном выполнении.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="theme-demo-sidebar">
            <h2>Компоненты приложения</h2>
            
            <div class="theme-demo-section">
              <h3>Панель инструментов</h3>
              <div class="toolbar-demo" id="demo-toolbar">
                <div class="toolbar-item">Файл</div>
                <div class="toolbar-item">Правка</div>
                <div class="toolbar-item">Вид</div>
                <div class="toolbar-item">Справка</div>
                <div class="toolbar-spacer"></div>
                <div class="toolbar-item">
                  <button class="btn small">Действие</button>
                </div>
              </div>
            </div>
            
            <div class="theme-demo-section">
              <h3>Боковая панель</h3>
              <div class="sidebar-demo-container">
                <div class="sidebar-demo" id="demo-sidebar">
                  <div class="sidebar-item active">Главная</div>
                  <div class="sidebar-item">Библиотека</div>
                  <div class="sidebar-item">Избранное</div>
                  <div class="sidebar-item">Настройки</div>
                </div>
                <div class="sidebar-content">
                  <p>Основное содержимое</p>
                </div>
              </div>
            </div>
            
            <div class="theme-demo-section">
              <h3>Модальное окно</h3>
              <button id="show-modal-btn" class="btn primary">Показать модальное окно</button>
              <div class="modal-container" id="modal-container" style="display: none;">
                <div class="modal-overlay" id="modal-overlay"></div>
                <div class="modal" id="demo-modal">
                  <div class="modal-header">
                    <h3>Заголовок модального окна</h3>
                    <button class="modal-close-btn" id="close-modal-btn">&times;</button>
                  </div>
                  <div class="modal-body">
                    <p>Содержимое модального окна. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    <div class="form-group">
                      <label for="modal-input">Введите данные:</label>
                      <input type="text" id="modal-input" placeholder="Данные">
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button class="btn secondary" id="cancel-modal-btn">Отмена</button>
                    <button class="btn primary">Подтвердить</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="theme-demo-footer">
          <h2>Компоненты комикса</h2>
          
          <div class="theme-demo-section">
            <h3>Панель комикса</h3>
            <div class="comic-demo" id="demo-comic">
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
          
          <div class="theme-demo-section">
            <h3>Редактор комикса</h3>
            <div class="editor-demo" id="demo-editor">
              <div class="editor-toolbar">
                <div class="toolbar-item">Текст</div>
                <div class="toolbar-item">Изображение</div>
                <div class="toolbar-item">Форма</div>
                <div class="toolbar-item">Цвет</div>
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
    `;
    
    // Добавляем стили для демонстрации
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .theme-demo {
        font-family: var(--font-primary, Arial, sans-serif);
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        color: var(--color-text, #333333);
        background-color: var(--color-background, #ffffff);
      }
      
      .theme-demo-header {
        margin-bottom: 30px;
      }
      
      .theme-demo-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 20px;
        padding: 15px;
        background-color: var(--color-backgroundAlt, #f5f5f5);
        border-radius: var(--border-radius-medium, 5px);
      }
      
      .theme-control-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .theme-btn {
        padding: 8px 16px;
        background-color: var(--color-primary, #3498db);
        color: var(--color-textInverse, #ffffff);
        border: none;
        border-radius: var(--border-radius-small, 3px);
        cursor: pointer;
        transition: background-color var(--transition-fast, 0.15s ease);
      }
      
      .theme-btn:hover {
        background-color: var(--color-primary, #2980b9);
      }
      
      .theme-select-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .theme-select {
        padding: 6px;
        border: 1px solid var(--color-border, #dddddd);
        border-radius: var(--border-radius-small, 3px);
        background-color: var(--color-background, #ffffff);
        color: var(--color-text, #333333);
      }
      
      .auto-mode-label {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .time-settings {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .time-setting {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .time-setting input {
        padding: 5px;
        border: 1px solid var(--color-border, #dddddd);
        border-radius: var(--border-radius-small, 3px);
        background-color: var(--color-background, #ffffff);
        color: var(--color-text, #333333);
      }
      
      .theme-demo-content {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .theme-demo-main {
        flex: 3;
        min-width: 300px;
      }
      
      .theme-demo-sidebar {
        flex: 2;
        min-width: 250px;
      }
      
      .theme-demo-section {
        margin-bottom: 30px;
        padding: 15px;
        background-color: var(--color-backgroundAlt, #f5f5f5);
        border-radius: var(--border-radius-medium, 5px);
      }
      
      .typography-demo {
        background-color: var(--color-background, #ffffff);
        padding: 15px;
        border-radius: var(--border-radius-small, 3px);
      }
      
      .typography-demo h1, .typography-demo h2, .typography-demo h3 {
        color: var(--color-text, #333333);
        margin-top: 0;
      }
      
      .typography-demo p {
        color: var(--color-text, #333333);
        line-height: 1.6;
      }
      
      .typography-demo .link {
        color: var(--color-primary, #3498db);
        text-decoration: none;
      }
      
      .typography-demo .link:hover {
        text-decoration: underline;
      }
      
      .typography-demo blockquote {
        border-left: 4px solid var(--color-primary, #3498db);
        margin-left: 0;
        padding-left: 15px;
        color: var(--color-textSecondary, #666666);
      }
      
      .typography-demo pre {
        background-color: var(--color-backgroundElevated, #f8f8f8);
        padding: 15px;
        border-radius: var(--border-radius-small, 3px);
        overflow-x: auto;
      }
      
      .typography-demo code {
        font-family: var(--font-monospace, Consolas, monospace);
        color: var(--color-textSecondary, #666666);
      }
      
      .buttons-demo {
        display: flex;
        flex-direction: column;
        gap: 20px;
        background-color: var(--color-background, #ffffff);
        padding: 15px;
        border-radius: var(--border-radius-small, 3px);
      }
      
      .buttons-demo .btn {
        padding: 8px 16px;
        border: none;
        border-radius: var(--border-radius-small, 3px);
        cursor: pointer;
        transition: background-color var(--transition-fast, 0.15s ease);
        margin-right: 10px;
        margin-bottom: 10px;
      }
      
      .buttons-demo .btn.primary {
        background-color: var(--color-buttonPrimary, #3498db);
        color: var(--color-textInverse, #ffffff);
      }
      
      .buttons-demo .btn.secondary {
        background-color: var(--color-buttonSecondary, #95a5a6);
        color: var(--color-textInverse, #ffffff);
      }
      
      .buttons-demo .btn.success {
        background-color: var(--color-buttonSuccess, #2ecc71);
        color: var(--color-textInverse, #ffffff);
      }
      
      .buttons-demo .btn.danger {
        background-color: var(--color-buttonDanger, #e74c3c);
        color: var(--color-textInverse, #ffffff);
      }
      
      .buttons-demo .btn:disabled {
        background-color: var(--color-borderLight, #eeeeee);
        color: var(--color-textMuted, #999999);
        cursor: not-allowed;
      }
      
      .buttons-demo .btn.small {
        padding: 4px 8px;
        font-size: 0.9em;
      }
      
      .form-controls {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 20px;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .form-group label {
        color: var(--color-textSecondary, #666666);
      }
      
      .form-group input[type="text"], .form-group select {
        padding: 8px;
        border: 1px solid var(--color-border, #dddddd);
        border-radius: var(--border-radius-small, 3px);
        background-color: var(--color-background, #ffffff);
        color: var(--color-text, #333333);
      }
      
      .radio-group {
        display: flex;
        gap: 15px;
      }
      
      .cards-demo {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .card {
        background-color: var(--color-card, #ffffff);
        border-radius: var(--border-radius-medium, 5px);
        box-shadow: var(--shadow-small, 0 1px 3px rgba(0, 0, 0, 0.12));
        overflow: hidden;
        width: calc(50% - 10px);
        min-width: 250px;
      }
      
      .card-header {
        padding: 15px;
        background-color: var(--color-backgroundAlt, #f5f5f5);
        border-bottom: 1px solid var(--color-border, #dddddd);
        font-weight: bold;
      }
      
      .card-body {
        padding: 15px;
      }
      
      .card-footer {
        padding: 15px;
        background-color: var(--color-backgroundAlt, #f5f5f5);
        border-top: 1px solid var(--color-border, #dddddd);
        text-align: right;
      }
      
      .alert {
        padding: 10px 15px;
        border-radius: var(--border-radius-small, 3px);
        margin-bottom: 10px;
      }
      
      .alert.info {
        background-color: rgba(52, 152, 219, 0.1);
        border-left: 4px solid var(--color-info, #3498db);
        color: var(--color-info, #3498db);
      }
      
      .alert.warning {
        background-color: rgba(243, 156, 18, 0.1);
        border-left: 4px solid var(--color-warning, #f39c12);
        color: var(--color-warning, #f39c12);
      }
      
      .alert.error {
        background-color: rgba(231, 76, 60, 0.1);
        border-left: 4px solid var(--color-error, #e74c3c);
        color: var(--color-error, #e74c3c);
      }
      
      .alert.success {
        background-color: rgba(46, 204, 113, 0.1);
        border-left: 4px solid var(--color-success, #2ecc71);
        color: var(--color-success, #2ecc71);
      }
      
      .toolbar-demo {
        display: flex;
        align-items: center;
        background-color: var(--color-toolbar, #ffffff);
        border: 1px solid var(--color-border, #dddddd);
        border-radius: var(--border-radius-small, 3px);
        overflow: hidden;
      }
      
      .toolbar-item {
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color var(--transition-fast, 0.15s ease);
      }
      
      .toolbar-item:hover {
        background-color: var(--color-backgroundAlt, #f5f5f5);
      }
      
      .toolbar-spacer {
        flex-grow: 1;
      }
      
      .sidebar-demo-container {
        display: flex;
        height: 200px;
        border: 1px solid var(--color-border, #dddddd);
        border-radius: var(--border-radius-small, 3px);
        overflow: hidden;
      }
      
      .sidebar-demo {
        width: 150px;
        background-color: var(--color-sidebar, #f5f5f5);
        border-right: 1px solid var(--color-border, #dddddd);
      }
      
      .sidebar-item {
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color var(--transition-fast, 0.15s ease);
      }
      
      .sidebar-item:hover {
        background-color: var(--color-backgroundAlt, #e0e0e0);
      }
      
      .sidebar-item.active {
        background-color: var(--color-primary, #3498db);
        color: var(--color-textInverse, #ffffff);
      }
      
      .sidebar-content {
        flex-grow: 1;
        padding: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-background, #ffffff);
      }
      
      .modal-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .modal {
        position: relative;
        width: 90%;
        max-width: 500px;
        background-color: var(--color-modal, #ffffff);
        border-radius: var(--border-radius-medium, 5px);
        box-shadow: var(--shadow-large, 0 10px 20px rgba(0, 0, 0, 0.08));
        overflow: hidden;
        z-index: 1001;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background-color: var(--color-backgroundAlt, #f5f5f5);
        border-bottom: 1px solid var(--color-border, #dddddd);
      }
      
      .modal-header h3 {
        margin: 0;
      }
      
      .modal-close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--color-textSecondary, #666666);
      }
      
      .modal-body {
        padding: 15px;
      }
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 15px;
        background-color: var(--color-backgroundAlt, #f5f5f5);
        border-top: 1px solid var(--color-border, #dddddd);
      }
      
      .comic-demo {
        display: flex;
        gap: 15px;
        background-color: var(--color-comicBackground, #ffffff);
        padding: 15px;
        border-radius: var(--border-radius-small, 3px);
      }
      
      .comic-panel {
        flex: 1;
        min-width: 150px;
        background-color: var(--color-comicPanel, #f9f9f9);
        border: 1px solid var(--color-comicBorder, #dddddd);
        border-radius: var(--border-radius-small, 3px);
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .comic-image {
        height: 100px;
        background-color: var(--color-backgroundAlt, #f5f5f5);
        border-radius: var(--border-radius-small, 3px);
      }
      
      .comic-bubble {
        background-color: var(--color-comicBubble, #ffffff);
        border: 1px solid var(--color-comicBorder, #dddddd);
        border-radius: var(--border-radius-medium, 5px);
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
        border-bottom: 10px solid var(--color-comicBubble, #ffffff);
        z-index: 1;
      }
      
      .comic-bubble:after {
        content: '';
        position: absolute;
        top: -11px;
        left: 20px;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid var(--color-comicBorder, #dddddd);
        z-index: 0;
      }
      
      .comic-bubble p {
        margin: 0;
        font-family: var(--font-comic, 'Comic Sans MS', cursive);
        color: var(--color-comicText, #333333);
      }
      
      .editor-demo {
        border: 1px solid var(--color-border, #dddddd);
        border-radius: var(--border-radius-small, 3px);
        overflow: hidden;
      }
      
      .editor-toolbar {
        display: flex;
        background-color: var(--color-editorToolbar, #f5f5f5);
        border-bottom: 1px solid var(--color-border, #dddddd);
      }
      
      .editor-area {
        height: 200px;
        background-color: var(--color-editorBackground, #ffffff);
        position: relative;
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
        color: var(--color-textMuted, #999999);
      }
      
      @media (max-width: 768px) {
        .theme-demo-controls {
          flex-direction: column;
        }
        
        .cards-demo .card {
          width: 100%;
        }
        
        .comic-demo {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Сохраняем ссылки на демонстрационные элементы
    this.demoElements = {
      // Элементы управления темами
      toggleThemeBtn: this.container.querySelector('#toggle-theme-btn'),
      themeSelect: this.container.querySelector('#theme-select'),
      autoModeCheckbox: this.container.querySelector('#auto-mode-checkbox'),
      darkTimeInput: this.container.querySelector('#dark-time'),
      lightTimeInput: this.container.querySelector('#light-time'),
      
      // Компоненты интерфейса
      demoToolbar: this.container.querySelector('#demo-toolbar'),
      demoSidebar: this.container.querySelector('#demo-sidebar'),
      showModalBtn: this.container.querySelector('#show-modal-btn'),
      modalContainer: this.container.querySelector('#modal-container'),
      modalOverlay: this.container.querySelector('#modal-overlay'),
      demoModal: this.container.querySelector('#demo-modal'),
      closeModalBtn: this.container.querySelector('#close-modal-btn'),
      cancelModalBtn: this.container.querySelector('#cancel-modal-btn'),
      
      // Компоненты комикса
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
    this.themeIntegration.registerComponent('toolbar', this.demoElements.demoToolbar, 'toolbar');
    this.themeIntegration.registerComponent('sidebar', this.demoElements.demoSidebar, 'sidebar');
    this.themeIntegration.registerComponent('modal', this.demoElements.demoModal, 'modal');
    this.themeIntegration.registerComponent('modal-overlay', this.demoElements.modalOverlay, 'modal');
    
    // Регистрируем компоненты комикса
    this.themeIntegration.registerComponent('comic', this.demoElements.demoComic, 'comic');
    this.themeIntegration.registerComponent('editor', this.demoElements.demoEditor, 'editor');
    
    // Регистрируем кнопки
    const buttons = this.container.querySelectorAll('.btn');
    buttons.forEach((button, index) => {
      this.themeIntegration.registerComponent(`button-${index}`, button, 'button');
    });
    
    // Регистрируем поля ввода
    const inputs = this.container.querySelectorAll('input[type="text"]');
    inputs.forEach((input, index) => {
      this.themeIntegration.registerComponent(`input-${index}`, input, 'input');
    });
    
    // Регистрируем карточки
    const cards = this.container.querySelectorAll('.card');
    cards.forEach((card, index) => {
      this.themeIntegration.registerComponent(`card-${index}`, card, 'card');
    });
  }
  
  /**
   * Добавляет обработчики для элементов управления
   * @private
   */
  addControlHandlers() {
    const themeManager = this.themeIntegration.getThemeManager();
    
    // Обработчик для переключения темы
    this.demoElements.toggleThemeBtn.addEventListener('click', () => {
      themeManager.toggleTheme();
    });
    
    // Обработчик для выбора темы
    this.demoElements.themeSelect.addEventListener('change', () => {
      themeManager.setTheme(this.demoElements.themeSelect.value);
    });
    
    // Обработчик для автоматического режима
    this.demoElements.autoModeCheckbox.addEventListener('change', () => {
      themeManager.setAutoMode(this.demoElements.autoModeCheckbox.checked);
    });
    
    // Обработчики для времени начала темной и светлой тем
    this.demoElements.darkTimeInput.addEventListener('change', () => {
      const config = themeManager.getConfig();
      config.autoMode.startDarkTime = this.demoElements.darkTimeInput.value;
      themeManager.updateConfig(config);
    });
    
    this.demoElements.lightTimeInput.addEventListener('change', () => {
      const config = themeManager.getConfig();
      config.autoMode.startLightTime = this.demoElements.lightTimeInput.value;
      themeManager.updateConfig(config);
    });
    
    // Обработчики для модального окна
    this.demoElements.showModalBtn.addEventListener('click', () => {
      this.demoElements.modalContainer.style.display = 'flex';
    });
    
    this.demoElements.closeModalBtn.addEventListener('click', () => {
      this.demoElements.modalContainer.style.display = 'none';
    });
    
    this.demoElements.cancelModalBtn.addEventListener('click', () => {
      this.demoElements.modalContainer.style.display = 'none';
    });
    
    this.demoElements.modalOverlay.addEventListener('click', () => {
      this.demoElements.modalContainer.style.display = 'none';
    });
    
    // Обновляем состояние элементов управления
    this.updateControlState();
    
    // Добавляем обработчик события изменения темы
    this.eventEmitter.on('themeManager:themeChanged', () => {
      this.updateControlState();
    });
    
    // Добавляем обработчик события изменения автоматического режима
    this.eventEmitter.on('themeManager:autoModeChanged', () => {
      this.updateControlState();
    });
  }
  
  /**
   * Обновляет состояние элементов управления
   * @private
   */
  updateControlState() {
    const themeManager = this.themeIntegration.getThemeManager();
    
    // Обновляем выбор темы
    this.demoElements.themeSelect.value = themeManager.getCurrentThemeId();
    
    // Обновляем состояние автоматического режима
    this.demoElements.autoModeCheckbox.checked = themeManager.isAutoMode();
    
    // Обновляем время начала темной и светлой тем
    const config = themeManager.getConfig();
    this.demoElements.darkTimeInput.value = config.autoMode.startDarkTime;
    this.demoElements.lightTimeInput.value = config.autoMode.startLightTime;
    
    // Обновляем доступность элементов управления временем
    this.demoElements.darkTimeInput.disabled = !themeManager.isAutoMode();
    this.demoElements.lightTimeInput.disabled = !themeManager.isAutoMode();
  }
  
  /**
   * Запускает демонстрацию
   */
  run() {
    this.logger.info('ThemeDemo: running');
    
    // Здесь можно добавить дополнительные действия при запуске демонстрации
  }
  
  /**
   * Уничтожает демонстрационный компонент и освобождает ресурсы
   */
  destroy() {
    this.logger.info('ThemeDemo: destroying');
    
    // Удаляем обработчики событий
    this.eventEmitter.off('themeManager:themeChanged');
    this.eventEmitter.off('themeManager:autoModeChanged');
    
    // Уничтожаем интегратор тем
    if (this.themeIntegration) {
      this.themeIntegration.destroy();
      this.themeIntegration = null;
    }
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    this.demoElements = {};
    
    this.logger.info('ThemeDemo: destroyed');
  }
}

module.exports = ThemeDemo;
