/**
 * GoogleDriveManager.js
 * 
 * Менеджер для работы с Google Drive API в приложении Mr.Comic.
 * Обеспечивает авторизацию, загрузку и скачивание файлов.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

class GoogleDriveManager {
  /**
   * Создает экземпляр менеджера Google Drive
   * @param {Object} options - Параметры инициализации
   * @param {string} options.clientId - ID клиента OAuth 2.0
   * @param {string} options.apiKey - API ключ для Google Drive API
   * @param {Array} options.scopes - Запрашиваемые разрешения
   * @param {Function} options.onAuthSuccess - Callback при успешной авторизации
   * @param {Function} options.onAuthFailure - Callback при ошибке авторизации
   * @param {Function} options.onUploadProgress - Callback для отслеживания прогресса загрузки
   * @param {Function} options.onDownloadProgress - Callback для отслеживания прогресса скачивания
   */
  constructor(options = {}) {
    this.options = Object.assign({
      clientId: '',
      apiKey: '',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata'
      ],
      onAuthSuccess: null,
      onAuthFailure: null,
      onUploadProgress: null,
      onDownloadProgress: null
    }, options);
    
    this.isApiLoaded = false;
    this.isAuthorized = false;
    this.tokenClient = null;
    this.accessToken = null;
    
    // Загружаем Google API
    this.loadGoogleApi();
  }
  
  /**
   * Загрузка Google API
   */
  loadGoogleApi() {
    // Проверяем, загружен ли уже API
    if (window.gapi) {
      this.onGapiLoaded();
      return;
    }
    
    // Загружаем Google API
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => this.onGapiLoaded();
    script.onerror = () => this.handleApiError('Не удалось загрузить Google API');
    
    document.head.appendChild(script);
  }
  
  /**
   * Обработчик загрузки Google API
   */
  onGapiLoaded() {
    // Загружаем библиотеку клиента
    window.gapi.load('client', () => {
      // Инициализируем клиент
      window.gapi.client.init({
        apiKey: this.options.apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
      }).then(() => {
        // Загружаем библиотеку авторизации
        this.loadGisScript();
      }).catch(error => {
        this.handleApiError('Ошибка инициализации Google API: ' + error.message);
      });
    });
  }
  
  /**
   * Загрузка Google Identity Services
   */
  loadGisScript() {
    // Проверяем, загружен ли уже GIS
    if (window.google && window.google.accounts) {
      this.onGisLoaded();
      return;
    }
    
    // Загружаем Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => this.onGisLoaded();
    script.onerror = () => this.handleApiError('Не удалось загрузить Google Identity Services');
    
    document.head.appendChild(script);
  }
  
  /**
   * Обработчик загрузки Google Identity Services
   */
  onGisLoaded() {
    // Создаем клиент токенов
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.options.clientId,
      scope: this.options.scopes.join(' '),
      callback: (response) => {
        if (response.error) {
          this.handleAuthError(response.error);
        } else {
          this.handleAuthSuccess(response);
        }
      }
    });
    
    this.isApiLoaded = true;
    
    // Проверяем, авторизован ли пользователь
    this.checkAuth();
  }
  
  /**
   * Проверка авторизации
   */
  checkAuth() {
    if (!this.isApiLoaded) {
      return;
    }
    
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('mr-comic-gdrive-token');
    if (token) {
      try {
        const tokenData = JSON.parse(token);
        const expiresAt = tokenData.expires_at;
        
        // Проверяем, не истек ли токен
        if (expiresAt && expiresAt > Date.now()) {
          this.accessToken = tokenData.access_token;
          this.isAuthorized = true;
          
          // Устанавливаем токен для API
          window.gapi.client.setToken({ access_token: this.accessToken });
          
          // Вызываем callback
          this.triggerAuthSuccess();
          
          return;
        }
      } catch (error) {
        console.error('Ошибка при проверке токена:', error);
      }
    }
    
    // Если токен отсутствует или истек, сбрасываем авторизацию
    this.resetAuth();
  }
  
  /**
   * Авторизация пользователя
   */
  authorize() {
    if (!this.isApiLoaded) {
      this.handleAuthError('Google API не загружен');
      return;
    }
    
    // Запрашиваем токен
    this.tokenClient.requestAccessToken();
  }
  
  /**
   * Выход из аккаунта
   */
  signOut() {
    if (!this.isApiLoaded || !this.isAuthorized) {
      return;
    }
    
    // Отзываем токен
    window.google.accounts.oauth2.revoke(this.accessToken, () => {
      this.resetAuth();
    });
  }
  
  /**
   * Сброс авторизации
   */
  resetAuth() {
    this.isAuthorized = false;
    this.accessToken = null;
    
    // Удаляем токен из localStorage
    localStorage.removeItem('mr-comic-gdrive-token');
    
    // Сбрасываем токен для API
    window.gapi.client.setToken(null);
  }
  
  /**
   * Обработчик успешной авторизации
   * @param {Object} response - Ответ авторизации
   */
  handleAuthSuccess(response) {
    this.accessToken = response.access_token;
    this.isAuthorized = true;
    
    // Сохраняем токен в localStorage
    const expiresAt = Date.now() + (response.expires_in * 1000);
    localStorage.setItem('mr-comic-gdrive-token', JSON.stringify({
      access_token: this.accessToken,
      expires_at: expiresAt
    }));
    
    // Вызываем callback
    this.triggerAuthSuccess();
  }
  
  /**
   * Обработчик ошибки авторизации
   * @param {string} error - Сообщение об ошибке
   */
  handleAuthError(error) {
    console.error('Ошибка авторизации Google Drive:', error);
    
    // Сбрасываем авторизацию
    this.resetAuth();
    
    // Вызываем callback
    this.triggerAuthFailure(error);
  }
  
  /**
   * Обработчик ошибки API
   * @param {string} error - Сообщение об ошибке
   */
  handleApiError(error) {
    console.error('Ошибка Google Drive API:', error);
    
    // Вызываем callback
    this.triggerAuthFailure(error);
  }
  
  /**
   * Вызов callback при успешной авторизации
   */
  triggerAuthSuccess() {
    if (this.options.onAuthSuccess && typeof this.options.onAuthSuccess === 'function') {
      this.options.onAuthSuccess();
    }
  }
  
  /**
   * Вызов callback при ошибке авторизации
   * @param {string} error - Сообщение об ошибке
   */
  triggerAuthFailure(error) {
    if (this.options.onAuthFailure && typeof this.options.onAuthFailure === 'function') {
      this.options.onAuthFailure(error);
    }
  }
  
  /**
   * Загрузка файла в Google Drive
   * @param {File|Blob} file - Файл для загрузки
   * @param {Object} metadata - Метаданные файла
   * @param {string} metadata.name - Имя файла
   * @param {string} metadata.mimeType - MIME-тип файла
   * @param {string} metadata.description - Описание файла
   * @param {string} metadata.parents - Родительские папки
   * @returns {Promise<Object>} Информация о загруженном файле
   */
  async uploadFile(file, metadata = {}) {
    if (!this.isApiLoaded || !this.isAuthorized) {
      throw new Error('Необходима авторизация для загрузки файла');
    }
    
    // Проверяем файл
    if (!file) {
      throw new Error('Файл не указан');
    }
    
    // Подготавливаем метаданные
    const fileMetadata = {
      name: metadata.name || file.name,
      mimeType: metadata.mimeType || file.type,
      description: metadata.description || ''
    };
    
    // Добавляем родительские папки, если указаны
    if (metadata.parents) {
      fileMetadata.parents = Array.isArray(metadata.parents) ? metadata.parents : [metadata.parents];
    }
    
    try {
      // Создаем запрос на загрузку
      const accessToken = window.gapi.client.getToken().access_token;
      
      // Создаем FormData
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', file);
      
      // Отправляем запрос
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
        // Отслеживаем прогресс загрузки
        onUploadProgress: (progressEvent) => {
          if (this.options.onUploadProgress && typeof this.options.onUploadProgress === 'function') {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            this.options.onUploadProgress(progress);
          }
        }
      });
      
      // Проверяем ответ
      if (!response.ok) {
        throw new Error(`Ошибка загрузки файла: ${response.status} ${response.statusText}`);
      }
      
      // Разбираем ответ
      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error('Ошибка при загрузке файла в Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Скачивание файла из Google Drive
   * @param {string} fileId - ID файла
   * @returns {Promise<Blob>} Содержимое файла
   */
  async downloadFile(fileId) {
    if (!this.isApiLoaded || !this.isAuthorized) {
      throw new Error('Необходима авторизация для скачивания файла');
    }
    
    // Проверяем ID файла
    if (!fileId) {
      throw new Error('ID файла не указан');
    }
    
    try {
      // Получаем информацию о файле
      const fileResponse = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'name,mimeType,size'
      });
      
      const fileInfo = fileResponse.result;
      
      // Скачиваем файл
      const accessToken = window.gapi.client.getToken().access_token;
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        // Отслеживаем прогресс скачивания
        onDownloadProgress: (progressEvent) => {
          if (this.options.onDownloadProgress && typeof this.options.onDownloadProgress === 'function') {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            this.options.onDownloadProgress(progress);
          }
        }
      });
      
      // Проверяем ответ
      if (!response.ok) {
        throw new Error(`Ошибка скачивания файла: ${response.status} ${response.statusText}`);
      }
      
      // Получаем содержимое файла
      const blob = await response.blob();
      
      // Добавляем информацию о файле
      blob.name = fileInfo.name;
      blob.type = fileInfo.mimeType;
      
      return blob;
    } catch (error) {
      console.error('Ошибка при скачивании файла из Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Получение списка файлов из Google Drive
   * @param {Object} options - Параметры запроса
   * @param {string} options.query - Запрос для поиска файлов
   * @param {number} options.pageSize - Размер страницы
   * @param {string} options.pageToken - Токен страницы
   * @param {string} options.fields - Запрашиваемые поля
   * @param {string} options.orderBy - Сортировка
   * @returns {Promise<Object>} Список файлов
   */
  async listFiles(options = {}) {
    if (!this.isApiLoaded || !this.isAuthorized) {
      throw new Error('Необходима авторизация для получения списка файлов');
    }
    
    try {
      // Подготавливаем параметры запроса
      const params = {
        pageSize: options.pageSize || 100,
        fields: options.fields || 'nextPageToken, files(id, name, mimeType, modifiedTime, size, thumbnailLink)',
        orderBy: options.orderBy || 'modifiedTime desc'
      };
      
      // Добавляем запрос, если указан
      if (options.query) {
        params.q = options.query;
      }
      
      // Добавляем токен страницы, если указан
      if (options.pageToken) {
        params.pageToken = options.pageToken;
      }
      
      // Отправляем запрос
      const response = await window.gapi.client.drive.files.list(params);
      
      return response.result;
    } catch (error) {
      console.error('Ошибка при получении списка файлов из Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Создание папки в Google Drive
   * @param {string} name - Имя папки
   * @param {string} parentId - ID родительской папки
   * @returns {Promise<Object>} Информация о созданной папке
   */
  async createFolder(name, parentId = null) {
    if (!this.isApiLoaded || !this.isAuthorized) {
      throw new Error('Необходима авторизация для создания папки');
    }
    
    // Проверяем имя папки
    if (!name) {
      throw new Error('Имя папки не указано');
    }
    
    try {
      // Подготавливаем метаданные
      const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder'
      };
      
      // Добавляем родительскую папку, если указана
      if (parentId) {
        metadata.parents = [parentId];
      }
      
      // Отправляем запрос
      const response = await window.gapi.client.drive.files.create({
        resource: metadata,
        fields: 'id, name, mimeType, webViewLink'
      });
      
      return response.result;
    } catch (error) {
      console.error('Ошибка при создании папки в Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Удаление файла из Google Drive
   * @param {string} fileId - ID файла
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    if (!this.isApiLoaded || !this.isAuthorized) {
      throw new Error('Необходима авторизация для удаления файла');
    }
    
    // Проверяем ID файла
    if (!fileId) {
      throw new Error('ID файла не указан');
    }
    
    try {
      // Отправляем запрос
      await window.gapi.client.drive.files.delete({
        fileId: fileId
      });
    } catch (error) {
      console.error('Ошибка при удалении файла из Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Получение информации о файле
   * @param {string} fileId - ID файла
   * @param {string} fields - Запрашиваемые поля
   * @returns {Promise<Object>} Информация о файле
   */
  async getFileInfo(fileId, fields = 'id, name, mimeType, size, modifiedTime, webViewLink') {
    if (!this.isApiLoaded || !this.isAuthorized) {
      throw new Error('Необходима авторизация для получения информации о файле');
    }
    
    // Проверяем ID файла
    if (!fileId) {
      throw new Error('ID файла не указан');
    }
    
    try {
      // Отправляем запрос
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: fields
      });
      
      return response.result;
    } catch (error) {
      console.error('Ошибка при получении информации о файле из Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Обновление файла в Google Drive
   * @param {string} fileId - ID файла
   * @param {File|Blob} file - Новое содержимое файла
   * @param {Object} metadata - Новые метаданные файла
   * @returns {Promise<Object>} Информация об обновленном файле
   */
  async updateFile(fileId, file, metadata = {}) {
    if (!this.isApiLoaded || !this.isAuthorized) {
      throw new Error('Необходима авторизация для обновления файла');
    }
    
    // Проверяем ID файла
    if (!fileId) {
      throw new Error('ID файла не указан');
    }
    
    // Проверяем файл
    if (!file) {
      throw new Error('Файл не указан');
    }
    
    try {
      // Подготавливаем метаданные
      const fileMetadata = {};
      
      // Добавляем имя файла, если указано
      if (metadata.name) {
        fileMetadata.name = metadata.name;
      }
      
      // Добавляем описание, если указано
      if (metadata.description) {
        fileMetadata.description = metadata.description;
      }
      
      // Создаем запрос на обновление
      const accessToken = window.gapi.client.getToken().access_token;
      
      // Создаем FormData
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', file);
      
      // Отправляем запрос
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
        // Отслеживаем прогресс загрузки
        onUploadProgress: (progressEvent) => {
          if (this.options.onUploadProgress && typeof this.options.onUploadProgress === 'function') {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            this.options.onUploadProgress(progress);
          }
        }
      });
      
      // Проверяем ответ
      if (!response.ok) {
        throw new Error(`Ошибка обновления файла: ${response.status} ${response.statusText}`);
      }
      
      // Разбираем ответ
      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error('Ошибка при обновлении файла в Google Drive:', error);
      throw error;
    }
  }
  
  /**
   * Проверка, авторизован ли пользователь
   * @returns {boolean} Флаг авторизации
   */
  isUserAuthorized() {
    return this.isAuthorized;
  }
  
  /**
   * Проверка, загружен ли API
   * @returns {boolean} Флаг загрузки API
   */
  isGoogleApiLoaded() {
    return this.isApiLoaded;
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleDriveManager;
}
