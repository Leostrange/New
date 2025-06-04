/**
 * @file AnimationDemo.js
 * @description Демонстрационный компонент для тестирования функциональности анимаций
 * @module ui/AnimationDemo
 */

const AnimationManager = require('./AnimationManager');
const AnimationIntegration = require('./AnimationIntegration');

/**
 * Класс для демонстрации и тестирования функциональности анимаций
 */
class AnimationDemo {
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
    
    this.animationIntegration = null;
    this.demoElements = {};
  }
  
  /**
   * Инициализирует демонстрационный компонент
   */
  initialize() {
    this.logger.info('AnimationDemo: initializing');
    
    // Создаем интегратор анимаций
    this.animationIntegration = new AnimationIntegration({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: {
        debug: true,
        visualFeedback: true
      }
    });
    
    this.animationIntegration.initialize();
    
    // Создаем демонстрационный интерфейс
    this.createDemoInterface();
    
    // Регистрируем компоненты
    this.registerDemoComponents();
    
    // Добавляем обработчики для элементов управления
    this.addControlHandlers();
    
    this.logger.info('AnimationDemo: initialized');
  }
  
  /**
   * Создает демонстрационный интерфейс
   * @private
   */
  createDemoInterface() {
    // Создаем контейнер для демонстрации
    this.container.innerHTML = `
      <div class="animation-demo">
        <div class="animation-demo-header">
          <h1>Демонстрация анимаций</h1>
          <div class="animation-demo-controls">
            <label>
              <input type="checkbox" id="animations-enabled-checkbox" checked>
              Анимации включены
            </label>
            <label>
              <input type="checkbox" id="reduced-motion-checkbox">
              Уменьшенное движение
            </label>
          </div>
        </div>
        
        <div class="animation-demo-content">
          <div class="animation-demo-main">
            <h2>Основные анимации</h2>
            
            <div class="animation-demo-section">
              <h3>Анимации появления и исчезновения</h3>
              <div class="animation-demo-buttons">
                <button id="fade-in-btn">Появление (Fade In)</button>
                <button id="fade-out-btn">Исчезновение (Fade Out)</button>
                <button id="slide-in-btn">Выдвижение (Slide In)</button>
                <button id="slide-out-btn">Задвижение (Slide Out)</button>
                <button id="zoom-in-btn">Увеличение (Zoom In)</button>
                <button id="zoom-out-btn">Уменьшение (Zoom Out)</button>
              </div>
              <div class="animation-demo-target" id="basic-animation-target">
                <div class="animation-demo-target-content">Целевой элемент</div>
              </div>
            </div>
            
            <div class="animation-demo-section">
              <h3>Анимации внимания</h3>
              <div class="animation-demo-buttons">
                <button id="pulse-btn">Пульсация (Pulse)</button>
                <button id="shake-btn">Тряска (Shake)</button>
                <button id="bounce-btn">Отскок (Bounce)</button>
              </div>
              <div class="animation-demo-target" id="attention-animation-target">
                <div class="animation-demo-target-content">Целевой элемент</div>
              </div>
            </div>
            
            <div class="animation-demo-section">
              <h3>Анимации переходов</h3>
              <div class="animation-demo-buttons">
                <button id="transition-fade-btn">Переход с затуханием</button>
                <button id="transition-slide-btn">Переход со сдвигом</button>
                <button id="transition-zoom-btn">Переход с масштабированием</button>
              </div>
              <div class="animation-demo-transition-container">
                <div class="animation-demo-transition-target" id="transition-source">
                  <div class="animation-demo-target-content">Исходный элемент</div>
                </div>
                <div class="animation-demo-transition-target" id="transition-destination" style="display: none;">
                  <div class="animation-demo-target-content">Целевой элемент</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="animation-demo-sidebar">
            <h2>Компоненты интерфейса</h2>
            
            <div class="animation-demo-section">
              <h3>Панель инструментов</h3>
              <div class="animation-demo-buttons">
                <button id="toolbar-show-btn">Показать</button>
                <button id="toolbar-hide-btn">Скрыть</button>
              </div>
              <div class="animation-demo-toolbar" id="demo-toolbar">
                <div class="toolbar-item">Файл</div>
                <div class="toolbar-item">Правка</div>
                <div class="toolbar-item">Вид</div>
                <div class="toolbar-item">Справка</div>
              </div>
            </div>
            
            <div class="animation-demo-section">
              <h3>Боковая панель</h3>
              <div class="animation-demo-buttons">
                <button id="sidebar-show-btn">Показать</button>
                <button id="sidebar-hide-btn">Скрыть</button>
              </div>
              <div class="animation-demo-sidebar-container">
                <div class="animation-demo-sidebar-panel" id="demo-sidebar">
                  <div class="sidebar-item">Элемент 1</div>
                  <div class="sidebar-item">Элемент 2</div>
                  <div class="sidebar-item">Элемент 3</div>
                  <div class="sidebar-item">Элемент 4</div>
                </div>
                <div class="animation-demo-sidebar-content">
                  Основное содержимое
                </div>
              </div>
            </div>
            
            <div class="animation-demo-section">
              <h3>Модальное окно</h3>
              <div class="animation-demo-buttons">
                <button id="modal-show-btn">Показать</button>
                <button id="modal-hide-btn">Скрыть</button>
              </div>
              <div class="animation-demo-modal-container">
                <div class="animation-demo-modal-overlay" id="demo-modal-overlay" style="display: none;"></div>
                <div class="animation-demo-modal" id="demo-modal" style="display: none;">
                  <div class="modal-header">Заголовок модального окна</div>
                  <div class="modal-content">Содержимое модального окна</div>
                  <div class="modal-footer">
                    <button id="modal-close-btn">Закрыть</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="animation-demo-footer">
          <h2>Интерактивные эффекты</h2>
          
          <div class="animation-demo-section">
            <h3>Эффект волны (Ripple)</h3>
            <div class="animation-demo-ripple-container" id="ripple-container">
              <div class="animation-demo-ripple-text">Нажмите в любом месте для создания эффекта волны</div>
            </div>
          </div>
          
          <div class="animation-demo-section">
            <h3>Анимации загрузки</h3>
            <div class="animation-demo-buttons">
              <button id="loading-spinner-btn">Спиннер</button>
              <button id="loading-pulse-btn">Пульсация</button>
              <button id="loading-dots-btn">Точки</button>
              <button id="loading-stop-btn">Остановить</button>
            </div>
            <div class="animation-demo-loading-container" id="loading-container">
              <div class="animation-demo-loading-text">Область для анимации загрузки</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Добавляем стили для демонстрации
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .animation-demo {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .animation-demo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .animation-demo-controls {
        display: flex;
        gap: 20px;
      }
      
      .animation-demo-content {
        display: flex;
        gap: 20px;
      }
      
      .animation-demo-main {
        flex: 3;
      }
      
      .animation-demo-sidebar {
        flex: 2;
      }
      
      .animation-demo-section {
        margin-bottom: 30px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      
      .animation-demo-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .animation-demo-buttons button {
        padding: 8px 12px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .animation-demo-buttons button:hover {
        background-color: #e0e0e0;
      }
      
      .animation-demo-target {
        width: 100%;
        height: 150px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .animation-demo-target-content {
        padding: 20px;
        background-color: #3498db;
        color: white;
        border-radius: 5px;
      }
      
      .animation-demo-transition-container {
        position: relative;
        width: 100%;
        height: 150px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
        overflow: hidden;
      }
      
      .animation-demo-transition-target {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .animation-demo-toolbar {
        display: flex;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .toolbar-item {
        padding: 10px 15px;
        cursor: pointer;
      }
      
      .toolbar-item:hover {
        background-color: #e0e0e0;
      }
      
      .animation-demo-sidebar-container {
        display: flex;
        height: 200px;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .animation-demo-sidebar-panel {
        width: 150px;
        background-color: #f0f0f0;
        border-right: 1px solid #ddd;
      }
      
      .sidebar-item {
        padding: 10px 15px;
        cursor: pointer;
      }
      
      .sidebar-item:hover {
        background-color: #e0e0e0;
      }
      
      .animation-demo-sidebar-content {
        flex: 1;
        padding: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .animation-demo-modal-container {
        position: relative;
        height: 200px;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .animation-demo-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .animation-demo-modal {
        width: 80%;
        max-width: 400px;
        background-color: white;
        border-radius: 5px;
        overflow: hidden;
      }
      
      .modal-header {
        padding: 10px 15px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
      }
      
      .modal-content {
        padding: 15px;
        min-height: 100px;
      }
      
      .modal-footer {
        padding: 10px 15px;
        background-color: #f0f0f0;
        border-top: 1px solid #ddd;
        text-align: right;
      }
      
      .animation-demo-ripple-container {
        height: 150px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }
      
      .animation-demo-loading-container {
        height: 150px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Сохраняем ссылки на демонстрационные элементы
    this.demoElements = {
      // Элементы управления
      animationsEnabledCheckbox: this.container.querySelector('#animations-enabled-checkbox'),
      reducedMotionCheckbox: this.container.querySelector('#reduced-motion-checkbox'),
      
      // Основные анимации
      fadeInBtn: this.container.querySelector('#fade-in-btn'),
      fadeOutBtn: this.container.querySelector('#fade-out-btn'),
      slideInBtn: this.container.querySelector('#slide-in-btn'),
      slideOutBtn: this.container.querySelector('#slide-out-btn'),
      zoomInBtn: this.container.querySelector('#zoom-in-btn'),
      zoomOutBtn: this.container.querySelector('#zoom-out-btn'),
      basicAnimationTarget: this.container.querySelector('#basic-animation-target'),
      
      // Анимации внимания
      pulseBtn: this.container.querySelector('#pulse-btn'),
      shakeBtn: this.container.querySelector('#shake-btn'),
      bounceBtn: this.container.querySelector('#bounce-btn'),
      attentionAnimationTarget: this.container.querySelector('#attention-animation-target'),
      
      // Анимации переходов
      transitionFadeBtn: this.container.querySelector('#transition-fade-btn'),
      transitionSlideBtn: this.container.querySelector('#transition-slide-btn'),
      transitionZoomBtn: this.container.querySelector('#transition-zoom-btn'),
      transitionSource: this.container.querySelector('#transition-source'),
      transitionDestination: this.container.querySelector('#transition-destination'),
      
      // Панель инструментов
      toolbarShowBtn: this.container.querySelector('#toolbar-show-btn'),
      toolbarHideBtn: this.container.querySelector('#toolbar-hide-btn'),
      demoToolbar: this.container.querySelector('#demo-toolbar'),
      
      // Боковая панель
      sidebarShowBtn: this.container.querySelector('#sidebar-show-btn'),
      sidebarHideBtn: this.container.querySelector('#sidebar-hide-btn'),
      demoSidebar: this.container.querySelector('#demo-sidebar'),
      
      // Модальное окно
      modalShowBtn: this.container.querySelector('#modal-show-btn'),
      modalHideBtn: this.container.querySelector('#modal-hide-btn'),
      demoModalOverlay: this.container.querySelector('#demo-modal-overlay'),
      demoModal: this.container.querySelector('#demo-modal'),
      modalCloseBtn: this.container.querySelector('#modal-close-btn'),
      
      // Эффект волны
      rippleContainer: this.container.querySelector('#ripple-container'),
      
      // Анимации загрузки
      loadingSpinnerBtn: this.container.querySelector('#loading-spinner-btn'),
      loadingPulseBtn: this.container.querySelector('#loading-pulse-btn'),
      loadingDotsBtn: this.container.querySelector('#loading-dots-btn'),
      loadingStopBtn: this.container.querySelector('#loading-stop-btn'),
      loadingContainer: this.container.querySelector('#loading-container')
    };
  }
  
  /**
   * Регистрирует демонстрационные компоненты
   * @private
   */
  registerDemoComponents() {
    // Регистрируем основные компоненты
    this.animationIntegration.registerComponent('basic-target', this.demoElements.basicAnimationTarget, 'content');
    this.animationIntegration.registerComponent('attention-target', this.demoElements.attentionAnimationTarget, 'content');
    this.animationIntegration.registerComponent('transition-source', this.demoElements.transitionSource, 'content');
    this.animationIntegration.registerComponent('transition-destination', this.demoElements.transitionDestination, 'content');
    
    // Регистрируем компоненты интерфейса
    this.animationIntegration.registerComponent('toolbar', this.demoElements.demoToolbar, 'toolbar');
    this.animationIntegration.registerComponent('sidebar', this.demoElements.demoSidebar, 'sidebar');
    this.animationIntegration.registerComponent('modal-overlay', this.demoElements.demoModalOverlay, 'modal');
    this.animationIntegration.registerComponent('modal', this.demoElements.demoModal, 'modal');
    
    // Регистрируем компоненты для эффектов
    this.animationIntegration.registerComponent('ripple-container', this.demoElements.rippleContainer, 'content');
    this.animationIntegration.registerComponent('loading-container', this.demoElements.loadingContainer, 'content');
  }
  
  /**
   * Добавляет обработчики для элементов управления
   * @private
   */
  addControlHandlers() {
    // Обработчики для элементов управления
    this.demoElements.animationsEnabledCheckbox.addEventListener('change', () => {
      const enabled = this.demoElements.animationsEnabledCheckbox.checked;
      this.animationIntegration.setEnabled(enabled);
    });
    
    this.demoElements.reducedMotionCheckbox.addEventListener('change', () => {
      const reducedMotion = this.demoElements.reducedMotionCheckbox.checked;
      this.eventEmitter.emit('accessibility:changed', { reducedMotion });
    });
    
    // Обработчики для основных анимаций
    this.demoElements.fadeInBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('basic-target', 'fadeIn');
    });
    
    this.demoElements.fadeOutBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('basic-target', 'fadeOut');
    });
    
    this.demoElements.slideInBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('basic-target', 'slideInRight');
    });
    
    this.demoElements.slideOutBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('basic-target', 'slideOutRight');
    });
    
    this.demoElements.zoomInBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('basic-target', 'zoomIn');
    });
    
    this.demoElements.zoomOutBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('basic-target', 'zoomOut');
    });
    
    // Обработчики для анимаций внимания
    this.demoElements.pulseBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('attention-target', 'pulse');
    });
    
    this.demoElements.shakeBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('attention-target', 'shake');
    });
    
    this.demoElements.bounceBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('attention-target', 'bounce');
    });
    
    // Обработчики для анимаций переходов
    this.demoElements.transitionFadeBtn.addEventListener('click', () => {
      this.handleTransition('crossFade');
    });
    
    this.demoElements.transitionSlideBtn.addEventListener('click', () => {
      this.handleTransition('slide');
    });
    
    this.demoElements.transitionZoomBtn.addEventListener('click', () => {
      this.handleTransition('zoom');
    });
    
    // Обработчики для панели инструментов
    this.demoElements.toolbarShowBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('toolbar', 'show');
    });
    
    this.demoElements.toolbarHideBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('toolbar', 'hide');
    });
    
    // Обработчики для боковой панели
    this.demoElements.sidebarShowBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('sidebar', 'show');
    });
    
    this.demoElements.sidebarHideBtn.addEventListener('click', () => {
      this.animationIntegration.animateComponent('sidebar', 'hide');
    });
    
    // Обработчики для модального окна
    this.demoElements.modalShowBtn.addEventListener('click', () => {
      this.showModal();
    });
    
    this.demoElements.modalHideBtn.addEventListener('click', () => {
      this.hideModal();
    });
    
    this.demoElements.modalCloseBtn.addEventListener('click', () => {
      this.hideModal();
    });
    
    // Обработчик для эффекта волны
    this.demoElements.rippleContainer.addEventListener('click', (event) => {
      const rect = this.demoElements.rippleContainer.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      this.animationIntegration.ripple('ripple-container', x, y);
    });
    
    // Обработчики для анимаций загрузки
    this.demoElements.loadingSpinnerBtn.addEventListener('click', () => {
      this.showLoading('spinner');
    });
    
    this.demoElements.loadingPulseBtn.addEventListener('click', () => {
      this.showLoading('pulse');
    });
    
    this.demoElements.loadingDotsBtn.addEventListener('click', () => {
      this.showLoading('dots');
    });
    
    this.demoElements.loadingStopBtn.addEventListener('click', () => {
      this.stopLoading();
    });
  }
  
  /**
   * Обрабатывает переход между элементами
   * @param {string} type - Тип перехода
   * @private
   */
  handleTransition(type) {
    // Показываем оба элемента
    this.demoElements.transitionSource.style.display = 'flex';
    this.demoElements.transitionDestination.style.display = 'flex';
    
    // Выполняем переход
    this.animationIntegration.transition('transition-source', 'transition-destination', type, {
      onComplete: () => {
        // После завершения перехода меняем местами элементы
        setTimeout(() => {
          this.demoElements.transitionSource.style.display = 'flex';
          this.demoElements.transitionDestination.style.display = 'none';
        }, 500);
      }
    });
  }
  
  /**
   * Показывает модальное окно
   * @private
   */
  showModal() {
    // Показываем оверлей и модальное окно
    this.demoElements.demoModalOverlay.style.display = 'flex';
    this.demoElements.demoModal.style.display = 'block';
    
    // Анимируем появление оверлея
    this.animationIntegration.animateComponent('modal-overlay', 'fadeIn', {
      duration: 200
    });
    
    // Анимируем появление модального окна
    this.animationIntegration.animateComponent('modal', 'show');
  }
  
  /**
   * Скрывает модальное окно
   * @private
   */
  hideModal() {
    // Анимируем исчезновение модального окна
    this.animationIntegration.animateComponent('modal', 'hide', {
      onComplete: () => {
        // Анимируем исчезновение оверлея
        this.animationIntegration.animateComponent('modal-overlay', 'fadeOut', {
          duration: 200,
          onComplete: () => {
            // Скрываем оверлей и модальное окно
            this.demoElements.demoModalOverlay.style.display = 'none';
            this.demoElements.demoModal.style.display = 'none';
          }
        });
      }
    });
  }
  
  /**
   * Показывает анимацию загрузки
   * @param {string} type - Тип анимации загрузки
   * @private
   */
  showLoading(type) {
    // Останавливаем предыдущую анимацию загрузки
    this.stopLoading();
    
    // Создаем новую анимацию загрузки
    this.loadingController = this.animationIntegration.loading('loading-container', type);
  }
  
  /**
   * Останавливает анимацию загрузки
   * @private
   */
  stopLoading() {
    if (this.loadingController) {
      this.loadingController.stop();
      this.loadingController = null;
    }
  }
  
  /**
   * Запускает демонстрацию
   */
  run() {
    this.logger.info('AnimationDemo: running');
    
    // Здесь можно добавить дополнительные действия при запуске демонстрации
  }
  
  /**
   * Уничтожает демонстрационный компонент и освобождает ресурсы
   */
  destroy() {
    this.logger.info('AnimationDemo: destroying');
    
    // Останавливаем анимацию загрузки
    this.stopLoading();
    
    // Уничтожаем интегратор анимаций
    if (this.animationIntegration) {
      this.animationIntegration.destroy();
      this.animationIntegration = null;
    }
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    this.demoElements = {};
    
    this.logger.info('AnimationDemo: destroyed');
  }
}

module.exports = AnimationDemo;
