/**
 * GoogleDriveUI.js
 * 
 * Пользовательский интерфейс для работы с Google Drive в приложении Mr.Comic.
 * Предоставляет диалоговые окна и элементы управления для работы с Google Drive.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const GoogleDriveManager = require('./GoogleDriveManager');

class GoogleDriveUI {
  /**
   * Создает экземпляр пользовательского интерфейса для Google Drive
   * @param {Object} driveManager - Экземпляр менеджера Google Drive
   * @param {Object} options - Параметры инициализации
   */
  constructor(driveManager, options = {}) {
    this.driveManager = driveManager || new GoogleDriveManager();
    
    this.options = Object.assign({
      parentElement: document.body,
      theme: { mode: 'light' },
      isEInkMode: false,
      allowedFileTypes: ['application/pdf', 'application/x-cbz', 'application/zip']
    }, options);
    
    this.theme = this.options.theme;
    this.isEInkMode = this.options.isEInkMode;
    
    this.init();
  }
  
  /**
   * Инициализация пользовательского интерфейса
   */
  init() {
    this.createStyles();
  }
  
  /**
   * Создание стилей компонента
   */
  createStyles() {
    const styleId = 'gdrive-ui-styles';
    
    // Проверяем, не добавлены ли уже стили
    if (document.getElementById(styleId)) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    
    const isDarkMode = this.theme.mode === 'dark';
    const isEInkMode = this.isEInkMode;
    
    const bgColor = isDarkMode ? '#222' : (isEInkMode ? '#fff' : '#f5f5f5');
    const textColor = isDarkMode ? '#eee' : (isEInkMode ? '#000' : '#333');
    const borderColor = isDarkMode ? '#444' : (isEInkMode ? '#000' : '#ddd');
    const overlayColor = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
    
    style.textContent = `
      .gdrive-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${overlayColor};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      
      .gdrive-dialog {
        background-color: ${bgColor};
        color: ${textColor};
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: ${isEInkMode ? 'none' : 'all 0.2s ease'};
      }
      
      .gdrive-dialog-header {
        padding: 16px;
        border-bottom: 1px solid ${borderColor};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .gdrive-dialog-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .gdrive-dialog-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: ${textColor};
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .gdrive-dialog-content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }
      
      .gdrive-dialog-footer {
        padding: 16px;
        border-top: 1px solid ${borderColor};
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      
      .gdrive-button {
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid ${borderColor};
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${textColor};
        cursor: pointer;
        font-size: 14px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .gdrive-button:hover {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
      }
      
      .gdrive-button.primary {
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: white;
        border-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .gdrive-button.primary:hover {
        background-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .gdrive-button.danger {
        background-color: ${isDarkMode ? '#bd2130' : '#dc3545'};
        color: white;
        border-color: ${isDarkMode ? '#a71d2a' : '#c82333'};
      }
      
      .gdrive-button.danger:hover {
        background-color: ${isDarkMode ? '#a71d2a' : '#c82333'};
      }
      
      .gdrive-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .gdrive-form-group {
        margin-bottom: 16px;
      }
      
      .gdrive-form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .gdrive-form-input,
      .gdrive-form-select {
        width: 100%;
        padding: 8px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#fff'};
        color: ${textColor};
        font-size: 14px;
      }
      
      .gdrive-form-checkbox {
        margin-right: 8px;
      }
      
      .gdrive-form-help {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
        margin-top: 4px;
      }
      
      .gdrive-message {
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .gdrive-message.success {
        background-color: ${isDarkMode ? '#143d14' : '#d4edda'};
        color: ${isDarkMode ? '#8fd48f' : '#155724'};
        border: 1px solid ${isDarkMode ? '#1e541e' : '#c3e6cb'};
      }
      
      .gdrive-message.error {
        background-color: ${isDarkMode ? '#4d1a1a' : '#f8d7da'};
        color: ${isDarkMode ? '#f5a9a9' : '#721c24'};
        border: 1px solid ${isDarkMode ? '#692424' : '#f5c6cb'};
      }
      
      .gdrive-message.warning {
        background-color: ${isDarkMode ? '#4d3d10' : '#fff3cd'};
        color: ${isDarkMode ? '#f5d88f' : '#856404'};
        border: 1px solid ${isDarkMode ? '#6d5616' : '#ffeeba'};
      }
      
      .gdrive-message.info {
        background-color: ${isDarkMode ? '#1a3c4d' : '#d1ecf1'};
        color: ${isDarkMode ? '#8fc5d4' : '#0c5460'};
        border: 1px solid ${isDarkMode ? '#245669' : '#bee5eb'};
      }
      
      .gdrive-file-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .gdrive-file-item {
        padding: 12px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .gdrive-file-item:hover {
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
      }
      
      .gdrive-file-item-info {
        flex: 1;
        display: flex;
        align-items: center;
      }
      
      .gdrive-file-item-icon {
        margin-right: 12px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .gdrive-file-item-details {
        flex: 1;
      }
      
      .gdrive-file-item-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .gdrive-file-item-meta {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      .gdrive-file-item-actions {
        display: flex;
        gap: 8px;
      }
      
      .gdrive-file-item-button {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid ${borderColor};
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${textColor};
        cursor: pointer;
        font-size: 12px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .gdrive-file-item-button:hover {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
      }
      
      .gdrive-file-item-button.primary {
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: white;
        border-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .gdrive-file-item-button.primary:hover {
        background-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .gdrive-empty {
        text-align: center;
        padding: 24px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      .gdrive-loading {
        text-align: center;
        padding: 24px;
      }
      
      .gdrive-spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 2px solid ${isDarkMode ? '#444' : '#ddd'};
        border-top-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        border-radius: 50%;
        animation: gdrive-spin 1s linear infinite;
      }
      
      .gdrive-auth-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 16px;
        border-radius: 4px;
        border: 1px solid #4285F4;
        background-color: #4285F4;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .gdrive-auth-button:hover {
        background-color: #3367D6;
      }
      
      .gdrive-auth-button-icon {
        margin-right: 12px;
      }
      
      .gdrive-progress {
        width: 100%;
        height: 8px;
        background-color: ${isDarkMode ? '#333' : '#e0e0e0'};
        border-radius: 4px;
        overflow: hidden;
        margin-top: 8px;
      }
      
      .gdrive-progress-bar {
        height: 100%;
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        border-radius: 4px;
        transition: width 0.2s ease;
      }
      
      .gdrive-tabs {
        display: flex;
        border-bottom: 1px solid ${borderColor};
        margin-bottom: 16px;
      }
      
      .gdrive-tab {
        padding: 8px 16px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: ${isEInkMode ? 'none' : 'all 0.2s ease'};
      }
      
      .gdrive-tab.active {
        border-bottom-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: ${isDarkMode ? '#0066cc' : '#007bff'};
      }
      
      .gdrive-tab:hover {
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
      }
      
      .gdrive-search {
        margin-bottom: 16px;
        position: relative;
      }
      
      .gdrive-search-input {
        width: 100%;
        padding: 8px 32px 8px 8px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#fff'};
        color: ${textColor};
        font-size: 14px;
      }
      
      .gdrive-search-icon {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      .gdrive-pagination {
        display: flex;
        justify-content: center;
        margin-top: 16px;
        gap: 8px;
      }
      
      .gdrive-pagination-button {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid ${borderColor};
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${textColor};
        cursor: pointer;
        font-size: 12px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .gdrive-pagination-button:hover {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
      }
      
      .gdrive-pagination-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .gdrive-conflict-options {
        margin-top: 16px;
      }
      
      .gdrive-conflict-option {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .gdrive-conflict-radio {
        margin-right: 8px;
      }
      
      .gdrive-conflict-label {
        font-size: 14px;
      }
      
      @keyframes gdrive-spin {
        to { transform: rotate(360deg); }
      }
      
      @media (max-width: 768px) {
        .gdrive-dialog {
          width: 95%;
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Отображение диалогового окна авторизации
   */
  showAuthDialog() {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'gdrive-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'gdrive-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'gdrive-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'gdrive-dialog-title';
    title.textContent = 'Авторизация Google Drive';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'gdrive-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'gdrive-dialog-content';
    
    const infoMessage = document.createElement('div');
    infoMessage.className = 'gdrive-message info';
    infoMessage.textContent = 'Для работы с Google Drive необходимо авторизоваться. Нажмите кнопку ниже, чтобы войти в свой аккаунт Google.';
    
    const authButton = document.createElement('button');
    authButton.className = 'gdrive-auth-button';
    authButton.innerHTML = '<span class="gdrive-auth-button-icon">G</span> Войти с Google';
    authButton.addEventListener('click', () => {
      // Закрываем диалог
      document.body.removeChild(overlay);
      
      // Запускаем авторизацию
      this.driveManager.authorize();
    });
    
    content.appendChild(infoMessage);
    content.appendChild(document.createElement('br'));
    content.appendChild(authButton);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'gdrive-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'gdrive-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    footer.appendChild(cancelButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Отображение диалогового окна выбора файлов из Google Drive
   * @param {Function} onSelect - Callback при выборе файла
   */
  showFileBrowserDialog(onSelect) {
    // Проверяем авторизацию
    if (!this.driveManager.isUserAuthorized()) {
      this.showAuthDialog();
      return;
    }
    
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'gdrive-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'gdrive-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'gdrive-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'gdrive-dialog-title';
    title.textContent = 'Выбор файла из Google Drive';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'gdrive-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'gdrive-dialog-content';
    
    // Поиск
    const searchContainer = document.createElement('div');
    searchContainer.className = 'gdrive-search';
    
    const searchInput = document.createElement('input');
    searchInput.className = 'gdrive-search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск файлов...';
    
    const searchIcon = document.createElement('span');
    searchIcon.className = 'gdrive-search-icon';
    searchIcon.innerHTML = '🔍';
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchIcon);
    
    // Список файлов
    const fileListContainer = document.createElement('div');
    fileListContainer.className = 'gdrive-file-list-container';
    
    // Загрузка
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'gdrive-loading';
    
    const spinner = document.createElement('div');
    spinner.className = 'gdrive-spinner';
    
    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(document.createElement('br'));
    loadingContainer.appendChild(document.createTextNode('Загрузка файлов...'));
    
    fileListContainer.appendChild(loadingContainer);
    
    // Пагинация
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'gdrive-pagination';
    
    content.appendChild(searchContainer);
    content.appendChild(fileListContainer);
    content.appendChild(paginationContainer);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'gdrive-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'gdrive-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    footer.appendChild(cancelButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Загружаем список файлов
    this.loadFileList(fileListContainer, paginationContainer, searchInput, onSelect);
    
    // Обработчик поиска
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.loadFileList(fileListContainer, paginationContainer, searchInput, onSelect);
      }, 500);
    });
  }
  
  /**
   * Загрузка списка файлов из Google Drive
   * @param {HTMLElement} container - Контейнер для списка файлов
   * @param {HTMLElement} paginationContainer - Контейнер для пагинации
   * @param {HTMLInputElement} searchInput - Поле поиска
   * @param {Function} onSelect - Callback при выборе файла
   * @param {string} pageToken - Токен страницы
   */
  async loadFileList(container, paginationContainer, searchInput, onSelect, pageToken = null) {
    try {
      // Показываем индикатор загрузки
      container.innerHTML = '';
      const loadingContainer = document.createElement('div');
      loadingContainer.className = 'gdrive-loading';
      
      const spinner = document.createElement('div');
      spinner.className = 'gdrive-spinner';
      
      loadingContainer.appendChild(spinner);
      loadingContainer.appendChild(document.createElement('br'));
      loadingContainer.appendChild(document.createTextNode('Загрузка файлов...'));
      
      container.appendChild(loadingContainer);
      
      // Очищаем пагинацию
      paginationContainer.innerHTML = '';
      
      // Формируем запрос
      const query = [];
      
      // Фильтр по типам файлов
      if (this.options.allowedFileTypes && this.options.allowedFileTypes.length > 0) {
        const mimeTypes = this.options.allowedFileTypes.map(type => `mimeType='${type}'`).join(' or ');
        query.push(`(${mimeTypes})`);
      }
      
      // Исключаем папки
      query.push("mimeType!='application/vnd.google-apps.folder'");
      
      // Только файлы, к которым у пользователя есть доступ
      query.push("trashed=false");
      
      // Поиск по имени
      const searchText = searchInput.value.trim();
      if (searchText) {
        query.push(`name contains '${searchText}'`);
      }
      
      // Получаем список файлов
      const result = await this.driveManager.listFiles({
        query: query.join(' and '),
        pageSize: 10,
        pageToken: pageToken
      });
      
      // Очищаем контейнер
      container.innerHTML = '';
      
      if (result.files && result.files.length > 0) {
        // Создаем список файлов
        const fileList = document.createElement('ul');
        fileList.className = 'gdrive-file-list';
        
        result.files.forEach(file => {
          const listItem = document.createElement('li');
          listItem.className = 'gdrive-file-item';
          
          const itemInfo = document.createElement('div');
          itemInfo.className = 'gdrive-file-item-info';
          
          const itemIcon = document.createElement('div');
          itemIcon.className = 'gdrive-file-item-icon';
          
          // Определяем иконку в зависимости от типа файла
          let iconText = '📄';
          if (file.mimeType === 'application/pdf') {
            iconText = '📕';
          } else if (file.mimeType === 'application/x-cbz' || file.mimeType === 'application/zip') {
            iconText = '📚';
          }
          
          itemIcon.textContent = iconText;
          
          const itemDetails = document.createElement('div');
          itemDetails.className = 'gdrive-file-item-details';
          
          const itemName = document.createElement('div');
          itemName.className = 'gdrive-file-item-name';
          itemName.textContent = file.name;
          
          const itemMeta = document.createElement('div');
          itemMeta.className = 'gdrive-file-item-meta';
          
          // Форматируем дату
          const modifiedDate = new Date(file.modifiedTime).toLocaleString();
          
          // Форматируем размер
          const fileSize = this.formatSize(file.size);
          
          itemMeta.textContent = `${modifiedDate} • ${fileSize}`;
          
          itemDetails.appendChild(itemName);
          itemDetails.appendChild(itemMeta);
          
          itemInfo.appendChild(itemIcon);
          itemInfo.appendChild(itemDetails);
          
          const itemActions = document.createElement('div');
          itemActions.className = 'gdrive-file-item-actions';
          
          const selectButton = document.createElement('button');
          selectButton.className = 'gdrive-file-item-button primary';
          selectButton.textContent = 'Выбрать';
          selectButton.addEventListener('click', () => {
            // Вызываем callback
            if (onSelect && typeof onSelect === 'function') {
              onSelect(file);
            }
            
            // Закрываем диалог
            const overlay = document.querySelector('.gdrive-dialog-overlay');
            if (overlay) {
              document.body.removeChild(overlay);
            }
          });
          
          itemActions.appendChild(selectButton);
          
          listItem.appendChild(itemInfo);
          listItem.appendChild(itemActions);
          
          fileList.appendChild(listItem);
        });
        
        container.appendChild(fileList);
        
        // Создаем пагинацию
        if (result.nextPageToken) {
          const nextButton = document.createElement('button');
          nextButton.className = 'gdrive-pagination-button';
          nextButton.textContent = 'Следующая страница';
          nextButton.addEventListener('click', () => {
            this.loadFileList(container, paginationContainer, searchInput, onSelect, result.nextPageToken);
          });
          
          paginationContainer.appendChild(nextButton);
        }
      } else {
        // Показываем сообщение, если нет файлов
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'gdrive-empty';
        emptyMessage.textContent = searchText ? 'Нет файлов, соответствующих запросу' : 'Нет доступных файлов';
        
        container.appendChild(emptyMessage);
      }
    } catch (error) {
      console.error('Ошибка при загрузке списка файлов из Google Drive:', error);
      
      // Показываем сообщение об ошибке
      container.innerHTML = '';
      const errorMessage = document.createElement('div');
      errorMessage.className = 'gdrive-message error';
      errorMessage.textContent = `Ошибка при загрузке списка файлов: ${error.message}`;
      
      container.appendChild(errorMessage);
    }
  }
  
  /**
   * Отображение диалогового окна загрузки файла в Google Drive
   * @param {File|Blob} file - Файл для загрузки
   * @param {Function} onComplete - Callback при завершении загрузки
   */
  showUploadDialog(file, onComplete) {
    // Проверяем авторизацию
    if (!this.driveManager.isUserAuthorized()) {
      this.showAuthDialog();
      return;
    }
    
    // Проверяем файл
    if (!file) {
      console.error('Файл не указан');
      return;
    }
    
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'gdrive-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'gdrive-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'gdrive-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'gdrive-dialog-title';
    title.textContent = 'Загрузка файла в Google Drive';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'gdrive-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'gdrive-dialog-content';
    
    // Форма загрузки файла
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUploadFile(form, file, overlay, onComplete);
    });
    
    // Информация о файле
    const fileInfoGroup = document.createElement('div');
    fileInfoGroup.className = 'gdrive-form-group';
    
    const fileInfoLabel = document.createElement('div');
    fileInfoLabel.className = 'gdrive-form-label';
    fileInfoLabel.textContent = 'Файл:';
    
    const fileInfo = document.createElement('div');
    fileInfo.textContent = `${file.name} (${this.formatSize(file.size)})`;
    
    fileInfoGroup.appendChild(fileInfoLabel);
    fileInfoGroup.appendChild(fileInfo);
    
    // Название файла
    const nameGroup = document.createElement('div');
    nameGroup.className = 'gdrive-form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.className = 'gdrive-form-label';
    nameLabel.textContent = 'Название файла в Google Drive:';
    
    const nameInput = document.createElement('input');
    nameInput.className = 'gdrive-form-input';
    nameInput.name = 'name';
    nameInput.value = file.name;
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Описание файла
    const descriptionGroup = document.createElement('div');
    descriptionGroup.className = 'gdrive-form-group';
    
    const descriptionLabel = document.createElement('label');
    descriptionLabel.className = 'gdrive-form-label';
    descriptionLabel.textContent = 'Описание (опционально):';
    
    const descriptionInput = document.createElement('input');
    descriptionInput.className = 'gdrive-form-input';
    descriptionInput.name = 'description';
    
    descriptionGroup.appendChild(descriptionLabel);
    descriptionGroup.appendChild(descriptionInput);
    
    // Прогресс загрузки
    const progressGroup = document.createElement('div');
    progressGroup.className = 'gdrive-form-group';
    progressGroup.style.display = 'none';
    
    const progressLabel = document.createElement('div');
    progressLabel.className = 'gdrive-form-label';
    progressLabel.textContent = 'Прогресс загрузки:';
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'gdrive-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'gdrive-progress-bar';
    progressBar.style.width = '0%';
    
    const progressText = document.createElement('div');
    progressText.className = 'gdrive-form-help';
    progressText.textContent = '0%';
    
    progressContainer.appendChild(progressBar);
    
    progressGroup.appendChild(progressLabel);
    progressGroup.appendChild(progressContainer);
    progressGroup.appendChild(progressText);
    
    form.appendChild(fileInfoGroup);
    form.appendChild(nameGroup);
    form.appendChild(descriptionGroup);
    form.appendChild(progressGroup);
    
    content.appendChild(form);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'gdrive-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'gdrive-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const uploadButton = document.createElement('button');
    uploadButton.className = 'gdrive-button primary';
    uploadButton.type = 'submit';
    uploadButton.textContent = 'Загрузить';
    uploadButton.addEventListener('click', () => {
      form.dispatchEvent(new Event('submit'));
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(uploadButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Обработка загрузки файла в Google Drive
   * @param {HTMLFormElement} form - Форма загрузки файла
   * @param {File|Blob} file - Файл для загрузки
   * @param {HTMLElement} overlay - Оверлей диалогового окна
   * @param {Function} onComplete - Callback при завершении загрузки
   */
  async handleUploadFile(form, file, overlay, onComplete) {
    try {
      // Получаем данные из формы
      const name = form.name.value;
      const description = form.description.value;
      
      // Проверяем название файла
      if (!name) {
        this.showMessage(form, 'error', 'Название файла не указано');
        return;
      }
      
      // Показываем прогресс загрузки
      const progressGroup = form.querySelector('.gdrive-form-group:last-child');
      progressGroup.style.display = 'block';
      
      const progressBar = progressGroup.querySelector('.gdrive-progress-bar');
      const progressText = progressGroup.querySelector('.gdrive-form-help');
      
      // Отключаем кнопки
      const buttons = overlay.querySelectorAll('.gdrive-button');
      buttons.forEach(button => {
        button.disabled = true;
      });
      
      // Обработчик прогресса загрузки
      const onUploadProgress = (progress) => {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
      };
      
      // Загружаем файл
      const result = await this.driveManager.uploadFile(file, {
        name,
        description,
        onUploadProgress
      });
      
      // Вызываем callback
      if (onComplete && typeof onComplete === 'function') {
        onComplete(result);
      }
      
      // Закрываем диалог
      document.body.removeChild(overlay);
    } catch (error) {
      console.error('Ошибка при загрузке файла в Google Drive:', error);
      
      // Показываем сообщение об ошибке
      this.showMessage(form, 'error', `Ошибка при загрузке файла: ${error.message}`);
      
      // Включаем кнопки
      const buttons = overlay.querySelectorAll('.gdrive-button');
      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  }
  
  /**
   * Отображение диалогового окна скачивания файла из Google Drive
   * @param {string} fileId - ID файла
   * @param {Function} onComplete - Callback при завершении скачивания
   */
  async showDownloadDialog(fileId, onComplete) {
    // Проверяем авторизацию
    if (!this.driveManager.isUserAuthorized()) {
      this.showAuthDialog();
      return;
    }
    
    // Проверяем ID файла
    if (!fileId) {
      console.error('ID файла не указан');
      return;
    }
    
    try {
      // Получаем информацию о файле
      const fileInfo = await this.driveManager.getFileInfo(fileId);
      
      // Создаем оверлей
      const overlay = document.createElement('div');
      overlay.className = 'gdrive-dialog-overlay';
      
      // Создаем диалоговое окно
      const dialog = document.createElement('div');
      dialog.className = 'gdrive-dialog';
      
      // Заголовок
      const header = document.createElement('div');
      header.className = 'gdrive-dialog-header';
      
      const title = document.createElement('h2');
      title.className = 'gdrive-dialog-title';
      title.textContent = 'Скачивание файла из Google Drive';
      
      const closeButton = document.createElement('button');
      closeButton.className = 'gdrive-dialog-close';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });
      
      header.appendChild(title);
      header.appendChild(closeButton);
      
      // Содержимое
      const content = document.createElement('div');
      content.className = 'gdrive-dialog-content';
      
      // Информация о файле
      const fileInfoGroup = document.createElement('div');
      fileInfoGroup.className = 'gdrive-form-group';
      
      const fileInfoLabel = document.createElement('div');
      fileInfoLabel.className = 'gdrive-form-label';
      fileInfoLabel.textContent = 'Файл:';
      
      const fileInfoText = document.createElement('div');
      fileInfoText.textContent = `${fileInfo.name} (${this.formatSize(fileInfo.size)})`;
      
      fileInfoGroup.appendChild(fileInfoLabel);
      fileInfoGroup.appendChild(fileInfoText);
      
      // Прогресс скачивания
      const progressGroup = document.createElement('div');
      progressGroup.className = 'gdrive-form-group';
      progressGroup.style.display = 'none';
      
      const progressLabel = document.createElement('div');
      progressLabel.className = 'gdrive-form-label';
      progressLabel.textContent = 'Прогресс скачивания:';
      
      const progressContainer = document.createElement('div');
      progressContainer.className = 'gdrive-progress';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'gdrive-progress-bar';
      progressBar.style.width = '0%';
      
      const progressText = document.createElement('div');
      progressText.className = 'gdrive-form-help';
      progressText.textContent = '0%';
      
      progressContainer.appendChild(progressBar);
      
      progressGroup.appendChild(progressLabel);
      progressGroup.appendChild(progressContainer);
      progressGroup.appendChild(progressText);
      
      content.appendChild(fileInfoGroup);
      content.appendChild(progressGroup);
      
      // Футер
      const footer = document.createElement('div');
      footer.className = 'gdrive-dialog-footer';
      
      const cancelButton = document.createElement('button');
      cancelButton.className = 'gdrive-button';
      cancelButton.type = 'button';
      cancelButton.textContent = 'Отмена';
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });
      
      const downloadButton = document.createElement('button');
      downloadButton.className = 'gdrive-button primary';
      downloadButton.type = 'button';
      downloadButton.textContent = 'Скачать';
      downloadButton.addEventListener('click', () => {
        this.handleDownloadFile(fileId, progressGroup, overlay, onComplete);
      });
      
      footer.appendChild(cancelButton);
      footer.appendChild(downloadButton);
      
      // Собираем диалог
      dialog.appendChild(header);
      dialog.appendChild(content);
      dialog.appendChild(footer);
      
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    } catch (error) {
      console.error('Ошибка при получении информации о файле из Google Drive:', error);
      alert(`Ошибка при получении информации о файле: ${error.message}`);
    }
  }
  
  /**
   * Обработка скачивания файла из Google Drive
   * @param {string} fileId - ID файла
   * @param {HTMLElement} progressGroup - Группа элементов прогресса
   * @param {HTMLElement} overlay - Оверлей диалогового окна
   * @param {Function} onComplete - Callback при завершении скачивания
   */
  async handleDownloadFile(fileId, progressGroup, overlay, onComplete) {
    try {
      // Показываем прогресс скачивания
      progressGroup.style.display = 'block';
      
      const progressBar = progressGroup.querySelector('.gdrive-progress-bar');
      const progressText = progressGroup.querySelector('.gdrive-form-help');
      
      // Отключаем кнопки
      const buttons = overlay.querySelectorAll('.gdrive-button');
      buttons.forEach(button => {
        button.disabled = true;
      });
      
      // Обработчик прогресса скачивания
      const onDownloadProgress = (progress) => {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
      };
      
      // Скачиваем файл
      const blob = await this.driveManager.downloadFile(fileId, {
        onDownloadProgress
      });
      
      // Вызываем callback
      if (onComplete && typeof onComplete === 'function') {
        onComplete(blob);
      }
      
      // Закрываем диалог
      document.body.removeChild(overlay);
    } catch (error) {
      console.error('Ошибка при скачивании файла из Google Drive:', error);
      
      // Показываем сообщение об ошибке
      alert(`Ошибка при скачивании файла: ${error.message}`);
      
      // Включаем кнопки
      const buttons = overlay.querySelectorAll('.gdrive-button');
      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  }
  
  /**
   * Отображение сообщения в форме
   * @param {HTMLFormElement} form - Форма
   * @param {string} type - Тип сообщения ('success', 'error', 'warning', 'info')
   * @param {string} text - Текст сообщения
   */
  showMessage(form, type, text) {
    // Удаляем предыдущие сообщения
    const previousMessages = form.querySelectorAll('.gdrive-message');
    previousMessages.forEach(message => {
      message.parentNode.removeChild(message);
    });
    
    // Создаем новое сообщение
    const message = document.createElement('div');
    message.className = `gdrive-message ${type}`;
    message.textContent = text;
    
    // Добавляем сообщение в начало формы
    form.insertBefore(message, form.firstChild);
    
    // Удаляем сообщение через 5 секунд, если это не сообщение об успехе
    if (type !== 'success') {
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 5000);
    }
  }
  
  /**
   * Отображение диалогового окна конфликта файлов
   * @param {Object} existingFile - Существующий файл
   * @param {Object} newFile - Новый файл
   * @param {Function} onResolve - Callback при разрешении конфликта
   */
  showConflictDialog(existingFile, newFile, onResolve) {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'gdrive-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'gdrive-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'gdrive-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'gdrive-dialog-title';
    title.textContent = 'Конфликт файлов';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'gdrive-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'gdrive-dialog-content';
    
    const warningMessage = document.createElement('div');
    warningMessage.className = 'gdrive-message warning';
    warningMessage.textContent = `Файл "${existingFile.name}" уже существует. Выберите действие:`;
    
    const conflictOptions = document.createElement('div');
    conflictOptions.className = 'gdrive-conflict-options';
    
    // Опция "Заменить"
    const replaceOption = document.createElement('div');
    replaceOption.className = 'gdrive-conflict-option';
    
    const replaceRadio = document.createElement('input');
    replaceRadio.className = 'gdrive-conflict-radio';
    replaceRadio.type = 'radio';
    replaceRadio.name = 'conflict-action';
    replaceRadio.value = 'replace';
    replaceRadio.id = 'conflict-replace';
    replaceRadio.checked = true;
    
    const replaceLabel = document.createElement('label');
    replaceLabel.className = 'gdrive-conflict-label';
    replaceLabel.htmlFor = 'conflict-replace';
    replaceLabel.textContent = 'Заменить существующий файл';
    
    replaceOption.appendChild(replaceRadio);
    replaceOption.appendChild(replaceLabel);
    
    // Опция "Сохранить как новый"
    const keepBothOption = document.createElement('div');
    keepBothOption.className = 'gdrive-conflict-option';
    
    const keepBothRadio = document.createElement('input');
    keepBothRadio.className = 'gdrive-conflict-radio';
    keepBothRadio.type = 'radio';
    keepBothRadio.name = 'conflict-action';
    keepBothRadio.value = 'keep-both';
    keepBothRadio.id = 'conflict-keep-both';
    
    const keepBothLabel = document.createElement('label');
    keepBothLabel.className = 'gdrive-conflict-label';
    keepBothLabel.htmlFor = 'conflict-keep-both';
    keepBothLabel.textContent = 'Сохранить как новый файл';
    
    keepBothOption.appendChild(keepBothRadio);
    keepBothOption.appendChild(keepBothLabel);
    
    // Опция "Отмена"
    const cancelOption = document.createElement('div');
    cancelOption.className = 'gdrive-conflict-option';
    
    const cancelRadio = document.createElement('input');
    cancelRadio.className = 'gdrive-conflict-radio';
    cancelRadio.type = 'radio';
    cancelRadio.name = 'conflict-action';
    cancelRadio.value = 'cancel';
    cancelRadio.id = 'conflict-cancel';
    
    const cancelLabel = document.createElement('label');
    cancelLabel.className = 'gdrive-conflict-label';
    cancelLabel.htmlFor = 'conflict-cancel';
    cancelLabel.textContent = 'Отменить операцию';
    
    cancelOption.appendChild(cancelRadio);
    cancelOption.appendChild(cancelLabel);
    
    conflictOptions.appendChild(replaceOption);
    conflictOptions.appendChild(keepBothOption);
    conflictOptions.appendChild(cancelOption);
    
    content.appendChild(warningMessage);
    content.appendChild(conflictOptions);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'gdrive-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'gdrive-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
      
      // Вызываем callback с отменой
      if (onResolve && typeof onResolve === 'function') {
        onResolve('cancel');
      }
    });
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'gdrive-button primary';
    confirmButton.type = 'button';
    confirmButton.textContent = 'Применить';
    confirmButton.addEventListener('click', () => {
      // Получаем выбранное действие
      const selectedAction = document.querySelector('input[name="conflict-action"]:checked').value;
      
      // Закрываем диалог
      document.body.removeChild(overlay);
      
      // Вызываем callback с выбранным действием
      if (onResolve && typeof onResolve === 'function') {
        onResolve(selectedAction);
      }
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Форматирование размера в байтах в человекочитаемый формат
   * @param {number} bytes - Размер в байтах
   * @returns {string} Отформатированный размер
   */
  formatSize(bytes) {
    if (bytes === 0 || bytes === undefined) return '0 Байт';
    
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Обновление темы оформления
   * @param {Object} theme - Новые настройки темы
   */
  updateTheme(theme) {
    this.theme = theme || { mode: 'light' };
    this.createStyles();
  }
  
  /**
   * Обновление режима E-Ink
   * @param {boolean} isEInkMode - Флаг режима E-Ink
   */
  updateEInkMode(isEInkMode) {
    this.isEInkMode = isEInkMode;
    this.createStyles();
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleDriveUI;
}
