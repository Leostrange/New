/**
 * Тестирование модуля ImageEditorTool - Фаза 2
 * 
 * Этот файл содержит тесты для проверки функциональности оптимизированного
 * модуля обработки изображений ImageEditorTool.
 */

// Импорт необходимых модулей
const ImageEditorTool = require('../core/tools/ImageEditorTool');
const { createMockCanvas, createMockImageData } = require('./mocks/mock-classes');

/**
 * Класс для тестирования модуля ImageEditorTool
 */
class ImageEditorToolTester {
  constructor() {
    this.tests = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    // Инициализация компонентов для тестирования
    this.imageEditor = null;
  }
  
  /**
   * Инициализация тестового окружения
   */
  async setup() {
    console.log('Инициализация тестового окружения для ImageEditorTool...');
    
    // Создание экземпляра ImageEditorTool
    this.imageEditor = new ImageEditorTool();
    await this.imageEditor.initialize();
    
    console.log('Тестовое окружение инициализировано');
  }
  
  /**
   * Очистка тестового окружения
   */
  async teardown() {
    console.log('Очистка тестового окружения...');
    
    // Очистка ссылок на компоненты
    this.imageEditor = null;
    
    console.log('Тестовое окружение очищено');
  }
  
  /**
   * Регистрация теста
   * @param {string} name - Название теста
   * @param {Function} testFn - Функция теста
   */
  registerTest(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  /**
   * Запуск всех зарегистрированных тестов
   */
  async runTests() {
    console.log('Запуск тестов ImageEditorTool...');
    
    this.results = {
      total: this.tests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    for (const test of this.tests) {
      console.log(`\nТест: ${test.name}`);
      
      try {
        // Инициализация тестового окружения
        await this.setup();
        
        // Запуск теста
        const startTime = Date.now();
        await test.testFn.call(this);
        const endTime = Date.now();
        
        console.log(`✅ Тест пройден (${endTime - startTime}ms)`);
        
        this.results.passed++;
        this.results.details.push({
          name: test.name,
          status: 'passed',
          duration: endTime - startTime
        });
      } catch (error) {
        if (error.message === 'SKIP') {
          console.log('⚠️ Тест пропущен');
          
          this.results.skipped++;
          this.results.details.push({
            name: test.name,
            status: 'skipped'
          });
        } else {
          console.error(`❌ Тест не пройден: ${error.message}`);
          console.error(error.stack);
          
          this.results.failed++;
          this.results.details.push({
            name: test.name,
            status: 'failed',
            error: error.message
          });
        }
      } finally {
        // Очистка тестового окружения
        await this.teardown();
      }
    }
    
    console.log('\nРезультаты тестирования ImageEditorTool:');
    console.log(`Всего тестов: ${this.results.total}`);
    console.log(`Пройдено: ${this.results.passed}`);
    console.log(`Не пройдено: ${this.results.failed}`);
    console.log(`Пропущено: ${this.results.skipped}`);
    
    return this.results;
  }
  
  /**
   * Проверка условия
   * @param {boolean} condition - Проверяемое условие
   * @param {string} message - Сообщение об ошибке
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  /**
   * Пропуск теста
   */
  skip() {
    throw new Error('SKIP');
  }
  
  /**
   * Ожидание указанного времени
   * @param {number} ms - Время ожидания в миллисекундах
   * @returns {Promise<void>}
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Создание экземпляра тестера
const tester = new ImageEditorToolTester();

// Регистрация тестов для ImageEditorTool

// Тест 1: Проверка инициализации и регистрации фильтров
tester.registerTest('Инициализация и регистрация фильтров', async function() {
  // Проверка инициализации
  this.assert(this.imageEditor !== null, 'ImageEditorTool не инициализирован');
  
  // Проверка регистрации базовых фильтров
  this.assert(this.imageEditor.hasFilter('grayscale'), 'Фильтр grayscale не зарегистрирован');
  this.assert(this.imageEditor.hasFilter('invert'), 'Фильтр invert не зарегистрирован');
  this.assert(this.imageEditor.hasFilter('blur'), 'Фильтр blur не зарегистрирован');
  this.assert(this.imageEditor.hasFilter('sharpen'), 'Фильтр sharpen не зарегистрирован');
  this.assert(this.imageEditor.hasFilter('sepia'), 'Фильтр sepia не зарегистрирован');
  
  // Проверка регистрации пользовательского фильтра
  this.imageEditor.registerFilter('custom', (imageData) => imageData);
  this.assert(this.imageEditor.hasFilter('custom'), 'Пользовательский фильтр не зарегистрирован');
});

// Тест 2: Проверка применения фильтра grayscale
tester.registerTest('Применение фильтра grayscale', async function() {
  // Создание тестового изображения
  const width = 10;
  const height = 10;
  const imageData = createMockImageData(width, height);
  
  // Установка тестовых данных
  for (let i = 0; i < width * height * 4; i += 4) {
    imageData.data[i] = 255;    // R
    imageData.data[i + 1] = 0;  // G
    imageData.data[i + 2] = 0;  // B
    imageData.data[i + 3] = 255;// A
  }
  
  // Применение фильтра grayscale
  const result = this.imageEditor._applyGrayscaleFilter(imageData);
  
  // Проверка результата
  // Для красного цвета (255, 0, 0) значение серого должно быть около 76
  const grayValue = result.data[0];
  this.assert(grayValue > 70 && grayValue < 80, `Неверное значение серого: ${grayValue}`);
  
  // Проверка, что все каналы RGB имеют одинаковое значение
  this.assert(result.data[0] === result.data[1] && result.data[1] === result.data[2], 
    'Каналы RGB имеют разные значения после применения grayscale');
});

// Тест 3: Проверка оптимизированного фильтра размытия
tester.registerTest('Оптимизированный фильтр размытия (blur)', async function() {
  // Создание тестового изображения
  const width = 20;
  const height = 20;
  const imageData = createMockImageData(width, height);
  
  // Установка тестовых данных - центральный пиксель яркий, остальные темные
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (x === width / 2 && y === height / 2) {
        imageData.data[i] = 255;     // R
        imageData.data[i + 1] = 255; // G
        imageData.data[i + 2] = 255; // B
      } else {
        imageData.data[i] = 0;       // R
        imageData.data[i + 1] = 0;   // G
        imageData.data[i + 2] = 0;   // B
      }
      imageData.data[i + 3] = 255;   // A
    }
  }
  
  // Применение оптимизированного фильтра размытия
  const result = this.imageEditor._applyOptimizedBlurFilter(imageData, { radius: 3 });
  
  // Проверка результата - центральный пиксель должен стать менее ярким
  const centerIndex = (Math.floor(height / 2) * width + Math.floor(width / 2)) * 4;
  this.assert(result.data[centerIndex] < 255, 'Центральный пиксель не размыт');
  
  // Проверка, что соседние пиксели стали ярче
  const neighborIndex = ((Math.floor(height / 2) - 1) * width + Math.floor(width / 2)) * 4;
  this.assert(result.data[neighborIndex] > 0, 'Соседние пиксели не затронуты размытием');
  
  // Проверка сохранения размеров изображения
  this.assert(result.width === width && result.height === height, 'Размеры изображения изменились');
});

// Тест 4: Проверка оптимизированного фильтра повышения резкости
tester.registerTest('Оптимизированный фильтр повышения резкости (sharpen)', async function() {
  // Создание тестового изображения
  const width = 20;
  const height = 20;
  const imageData = createMockImageData(width, height);
  
  // Установка тестовых данных - градиент от темного к светлому
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const value = Math.floor((x + y) * 255 / (width + height));
      imageData.data[i] = value;     // R
      imageData.data[i + 1] = value; // G
      imageData.data[i + 2] = value; // B
      imageData.data[i + 3] = 255;   // A
    }
  }
  
  // Сохранение копии исходных данных
  const originalData = new Uint8ClampedArray(imageData.data);
  
  // Применение оптимизированного фильтра повышения резкости
  const result = this.imageEditor._applyOptimizedSharpenFilter(imageData, { amount: 1.5, radius: 1 });
  
  // Проверка результата - контраст должен увеличиться
  let originalContrast = 0;
  let resultContrast = 0;
  
  for (let i = 4; i < width * height * 4; i += 4) {
    originalContrast += Math.abs(originalData[i] - originalData[i - 4]);
    resultContrast += Math.abs(result.data[i] - result.data[i - 4]);
  }
  
  this.assert(resultContrast > originalContrast, 'Контраст не увеличился после применения фильтра');
  
  // Проверка сохранения размеров изображения
  this.assert(result.width === width && result.height === height, 'Размеры изображения изменились');
});

// Тест 5: Проверка управления историей изменений
tester.registerTest('Управление историей изменений', async function() {
  // Создание тестового изображения
  const width = 10;
  const height = 10;
  const imageData = createMockImageData(width, height);
  
  // Загрузка изображения
  this.imageEditor.loadImageData(imageData);
  
  // Проверка начального состояния истории
  this.assert(this.imageEditor.canUndo() === false, 'История не должна содержать действий для отмены');
  this.assert(this.imageEditor.canRedo() === false, 'История не должна содержать действий для повтора');
  
  // Применение фильтра и сохранение в историю
  this.imageEditor.applyFilter('grayscale');
  
  // Проверка состояния истории после применения фильтра
  this.assert(this.imageEditor.canUndo() === true, 'История должна содержать действие для отмены');
  this.assert(this.imageEditor.canRedo() === false, 'История не должна содержать действий для повтора');
  
  // Отмена действия
  this.imageEditor.undo();
  
  // Проверка состояния истории после отмены
  this.assert(this.imageEditor.canUndo() === false, 'История не должна содержать действий для отмены');
  this.assert(this.imageEditor.canRedo() === true, 'История должна содержать действие для повтора');
  
  // Повтор действия
  this.imageEditor.redo();
  
  // Проверка состояния истории после повтора
  this.assert(this.imageEditor.canUndo() === true, 'История должна содержать действие для отмены');
  this.assert(this.imageEditor.canRedo() === false, 'История не должна содержать действий для повтора');
  
  // Сброс истории
  this.imageEditor._resetHistory();
  
  // Проверка состояния истории после сброса
  this.assert(this.imageEditor.canUndo() === false, 'История не должна содержать действий для отмены после сброса');
  this.assert(this.imageEditor.canRedo() === false, 'История не должна содержать действий для повтора после сброса');
});

// Тест 6: Проверка трансформаций изображения
tester.registerTest('Трансформации изображения', async function() {
  // Создание тестового изображения
  const width = 20;
  const height = 10;
  const imageData = createMockImageData(width, height);
  
  // Загрузка изображения
  this.imageEditor.loadImageData(imageData);
  
  // Изменение размера
  const resizedData = this.imageEditor.resize(10, 5);
  
  // Проверка размеров после изменения
  this.assert(resizedData.width === 10 && resizedData.height === 5, 'Неверные размеры после изменения');
  
  // Обрезка
  const croppedData = this.imageEditor.crop(2, 1, 6, 3);
  
  // Проверка размеров после обрезки
  this.assert(croppedData.width === 6 && croppedData.height === 3, 'Неверные размеры после обрезки');
  
  // Поворот на 90 градусов
  const rotatedData = this.imageEditor.rotate(90);
  
  // Проверка размеров после поворота
  this.assert(rotatedData.width === 3 && rotatedData.height === 6, 'Неверные размеры после поворота');
  
  // Отражение по горизонтали
  const flippedData = this.imageEditor.flip('horizontal');
  
  // Проверка размеров после отражения
  this.assert(flippedData.width === 3 && flippedData.height === 6, 'Неверные размеры после отражения');
});

// Тест 7: Проверка обработки ошибок
tester.registerTest('Обработка ошибок', async function() {
  // Проверка обработки null изображения
  try {
    this.imageEditor.loadImageData(null);
    this.assert(false, 'Должно быть выброшено исключение при загрузке null изображения');
  } catch (error) {
    this.assert(error.message.includes('Invalid'), 'Неверное сообщение об ошибке');
  }
  
  // Проверка обработки некорректных размеров при изменении размера
  try {
    this.imageEditor.loadImageData(createMockImageData(10, 10));
    this.imageEditor.resize(-5, 10);
    this.assert(false, 'Должно быть выброшено исключение при отрицательной ширине');
  } catch (error) {
    this.assert(error.message.includes('Invalid'), 'Неверное сообщение об ошибке');
  }
  
  // Проверка обработки некорректных параметров при обрезке
  try {
    this.imageEditor.loadImageData(createMockImageData(10, 10));
    this.imageEditor.crop(5, 5, 10, 10);
    this.assert(false, 'Должно быть выброшено исключение при выходе за границы изображения');
  } catch (error) {
    this.assert(error.message.includes('Invalid') || error.message.includes('bounds'), 'Неверное сообщение об ошибке');
  }
  
  // Проверка обработки некорректного угла поворота
  try {
    this.imageEditor.loadImageData(createMockImageData(10, 10));
    this.imageEditor.rotate(45);
    this.assert(false, 'Должно быть выброшено исключение при некорректном угле поворота');
  } catch (error) {
    this.assert(error.message.includes('angle') || error.message.includes('Invalid'), 'Неверное сообщение об ошибке');
  }
});

// Тест 8: Проверка поддержки OffscreenCanvas
tester.registerTest('Поддержка OffscreenCanvas', async function() {
  // Проверка наличия метода для определения поддержки OffscreenCanvas
  this.assert(typeof this.imageEditor._isOffscreenCanvasSupported === 'function', 
    'Метод _isOffscreenCanvasSupported не реализован');
  
  // Проверка создания canvas
  this.assert(this.imageEditor.canvas !== null, 'Canvas не создан');
  this.assert(this.imageEditor.context !== null, 'Context не создан');
});

// Тест 9: Проверка производительности оптимизированных фильтров
tester.registerTest('Производительность оптимизированных фильтров', async function() {
  // Создание большого тестового изображения
  const width = 200;
  const height = 200;
  const imageData = createMockImageData(width, height);
  
  // Замер времени выполнения оптимизированного фильтра размытия
  const startTimeBlur = Date.now();
  this.imageEditor._applyOptimizedBlurFilter(imageData, { radius: 5 });
  const endTimeBlur = Date.now();
  const blurTime = endTimeBlur - startTimeBlur;
  
  console.log(`Время выполнения оптимизированного фильтра размытия: ${blurTime}ms`);
  
  // Замер времени выполнения оптимизированного фильтра повышения резкости
  const startTimeSharpen = Date.now();
  this.imageEditor._applyOptimizedSharpenFilter(imageData, { amount: 1.5, radius: 3 });
  const endTimeSharpen = Date.now();
  const sharpenTime = endTimeSharpen - startTimeSharpen;
  
  console.log(`Время выполнения оптимизированного фильтра повышения резкости: ${sharpenTime}ms`);
  
  // Проверка, что время выполнения не превышает разумные пределы
  // Это условный тест, так как время выполнения зависит от среды выполнения
  this.assert(blurTime < 1000, `Время выполнения фильтра размытия слишком велико: ${blurTime}ms`);
  this.assert(sharpenTime < 1000, `Время выполнения фильтра повышения резкости слишком велико: ${sharpenTime}ms`);
});

// Экспорт функции для запуска тестов
module.exports = {
  runTests: async () => {
    return await tester.runTests();
  }
};
