/**
 * TranslationCacheTest.js
 * 
 * Тестирование механизма кэширования переводов
 */

const assert = require('assert');
const { TranslationCacheManager } = require('../src/cache');

// Мок-объект для логгера
const mockLogger = {
  info: () => {},
  debug: () => {},
  warn: () => {},
  error: () => {}
};

describe('TranslationCacheManager', () => {
  let cacheManager;
  
  beforeEach(() => {
    // Создаем новый экземпляр менеджера кэша перед каждым тестом
    cacheManager = new TranslationCacheManager({
      logger: mockLogger,
      storageType: 'memory',
      maxSize: 1024 * 1024, // 1 МБ
      ttl: 3600000 // 1 час
    });
  });
  
  describe('Базовые операции с кэшем', () => {
    it('должен сохранять и получать значения из кэша', async () => {
      const key = 'test-key';
      const value = { text: 'Hello World', translated: 'Привет, мир' };
      
      // Сохраняем значение в кэше
      const setResult = await cacheManager.set(key, value);
      assert.strictEqual(setResult, true, 'Значение должно быть успешно сохранено');
      
      // Получаем значение из кэша
      const cachedValue = await cacheManager.get(key);
      assert.deepStrictEqual(cachedValue, value, 'Полученное значение должно соответствовать сохраненному');
    });
    
    it('должен возвращать null для отсутствующих ключей', async () => {
      const key = 'non-existent-key';
      
      // Получаем значение из кэша
      const cachedValue = await cacheManager.get(key);
      assert.strictEqual(cachedValue, null, 'Для отсутствующего ключа должен возвращаться null');
    });
    
    it('должен удалять значения из кэша', async () => {
      const key = 'test-key';
      const value = { text: 'Hello World', translated: 'Привет, мир' };
      
      // Сохраняем значение в кэше
      await cacheManager.set(key, value);
      
      // Удаляем значение из кэша
      const deleteResult = await cacheManager.delete(key);
      assert.strictEqual(deleteResult, true, 'Значение должно быть успешно удалено');
      
      // Проверяем, что значение удалено
      const cachedValue = await cacheManager.get(key);
      assert.strictEqual(cachedValue, null, 'После удаления значение должно отсутствовать в кэше');
    });
    
    it('должен очищать весь кэш', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const value = { text: 'Hello World', translated: 'Привет, мир' };
      
      // Сохраняем несколько значений в кэше
      for (const key of keys) {
        await cacheManager.set(key, value);
      }
      
      // Очищаем кэш
      const clearResult = await cacheManager.clear();
      assert.strictEqual(clearResult, true, 'Кэш должен быть успешно очищен');
      
      // Проверяем, что все значения удалены
      for (const key of keys) {
        const cachedValue = await cacheManager.get(key);
        assert.strictEqual(cachedValue, null, `После очистки значение для ключа ${key} должно отсутствовать в кэше`);
      }
    });
  });
  
  describe('Управление временем жизни (TTL)', () => {
    it('должен удалять устаревшие записи', async () => {
      const key = 'test-key';
      const value = { text: 'Hello World', translated: 'Привет, мир' };
      
      // Сохраняем значение в кэше с коротким TTL
      await cacheManager.set(key, value, { ttl: 100 }); // 100 мс
      
      // Проверяем, что значение доступно сразу после сохранения
      let cachedValue = await cacheManager.get(key);
      assert.deepStrictEqual(cachedValue, value, 'Значение должно быть доступно сразу после сохранения');
      
      // Ждем, пока истечет TTL
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Проверяем, что значение удалено после истечения TTL
      cachedValue = await cacheManager.get(key);
      assert.strictEqual(cachedValue, null, 'Значение должно быть удалено после истечения TTL');
    });
  });
  
  describe('Статистика использования кэша', () => {
    it('должен отслеживать статистику использования', async () => {
      const key1 = 'key1';
      const key2 = 'key2';
      const value = { text: 'Hello World', translated: 'Привет, мир' };
      
      // Сохраняем значения в кэше
      await cacheManager.set(key1, value);
      await cacheManager.set(key2, value);
      
      // Получаем значения из кэша
      await cacheManager.get(key1);
      await cacheManager.get(key1); // Повторный запрос
      await cacheManager.get('non-existent-key'); // Промах
      
      // Получаем статистику
      const stats = cacheManager.getStats();
      
      // Проверяем статистику
      assert.strictEqual(stats.hits, 2, 'Должно быть 2 попадания в кэш');
      assert.strictEqual(stats.misses, 1, 'Должен быть 1 промах в кэше');
      assert.strictEqual(stats.sets, 2, 'Должно быть 2 сохранения в кэш');
      assert.strictEqual(stats.evictions, 0, 'Не должно быть вытеснений из кэша');
      assert(stats.size > 0, 'Размер кэша должен быть больше 0');
      assert(stats.hitRate > 0, 'Коэффициент попаданий должен быть больше 0');
    });
  });
});

describe('TranslationProcessor с кэшированием', () => {
  // Мок-класс для TranslationProcessor
  class MockTranslationProcessor {
    constructor(options = {}) {
      this.cacheManager = options.cacheManager;
      this.cacheEnabled = true;
      this.cacheTtl = 3600000; // 1 час
      this.logger = mockLogger;
      
      // Счетчик вызовов _performTranslation
      this.translationCount = 0;
    }
    
    async translate(text, sourceLanguage, targetLanguage, options = {}) {
      // Проверяем, включено ли кэширование и доступен ли менеджер кэша
      if (this.cacheEnabled && this.cacheManager && !options.skipCache) {
        try {
          // Генерируем ключ кэша
          const cacheKey = await this._generateCacheKey(text, sourceLanguage, targetLanguage, options);
          
          // Пытаемся получить результат из кэша
          const cachedResult = await this.cacheManager.get(cacheKey);
          
          if (cachedResult) {
            return cachedResult;
          }
          
          // Выполняем перевод
          const result = await this._performTranslation(text, sourceLanguage, targetLanguage, options);
          
          // Сохраняем результат в кэше
          if (result) {
            await this.cacheManager.set(cacheKey, result, { 
              ttl: options.cacheTtl || this.cacheTtl 
            });
          }
          
          return result;
        } catch (error) {
          // В случае ошибки кэширования, продолжаем с обычным переводом
          return await this._performTranslation(text, sourceLanguage, targetLanguage, options);
        }
      } else {
        // Если кэширование отключено или недоступно, выполняем обычный перевод
        return await this._performTranslation(text, sourceLanguage, targetLanguage, options);
      }
    }
    
    async _performTranslation(text, sourceLanguage, targetLanguage, options = {}) {
      // Увеличиваем счетчик вызовов
      this.translationCount++;
      
      // Имитируем задержку перевода
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Возвращаем результат перевода
      return {
        originalText: text,
        translatedText: `Translated: ${text}`,
        sourceLanguage,
        targetLanguage,
        confidence: 0.95,
        translationId: `trans-${Date.now()}`
      };
    }
    
    async _generateCacheKey(text, sourceLanguage, targetLanguage, options = {}) {
      // Простая реализация для тестов
      return `translation:${sourceLanguage}:${targetLanguage}:${text}`;
    }
  }
  
  let processor;
  let cacheManager;
  
  beforeEach(() => {
    // Создаем новый экземпляр менеджера кэша
    cacheManager = new TranslationCacheManager({
      logger: mockLogger,
      storageType: 'memory',
      maxSize: 1024 * 1024, // 1 МБ
      ttl: 3600000 // 1 час
    });
    
    // Создаем новый экземпляр процессора перевода
    processor = new MockTranslationProcessor({
      cacheManager
    });
  });
  
  it('должен использовать кэш для повторных переводов', async () => {
    const text = 'Hello World';
    const sourceLanguage = 'en';
    const targetLanguage = 'ru';
    
    // Первый перевод (должен выполниться реально)
    const result1 = await processor.translate(text, sourceLanguage, targetLanguage);
    assert.strictEqual(processor.translationCount, 1, 'Первый перевод должен выполниться реально');
    
    // Второй перевод того же текста (должен взяться из кэша)
    const result2 = await processor.translate(text, sourceLanguage, targetLanguage);
    assert.strictEqual(processor.translationCount, 1, 'Второй перевод должен взяться из кэша');
    
    // Проверяем, что результаты идентичны
    assert.deepStrictEqual(result1, result2, 'Результаты должны быть идентичны');
    
    // Проверяем статистику кэша
    const stats = cacheManager.getStats();
    assert.strictEqual(stats.hits, 1, 'Должно быть 1 попадание в кэш');
    assert.strictEqual(stats.misses, 1, 'Должен быть 1 промах в кэше');
    assert.strictEqual(stats.sets, 1, 'Должно быть 1 сохранение в кэш');
  });
  
  it('должен пропускать кэш при указании skipCache', async () => {
    const text = 'Hello World';
    const sourceLanguage = 'en';
    const targetLanguage = 'ru';
    
    // Первый перевод (должен выполниться реально)
    await processor.translate(text, sourceLanguage, targetLanguage);
    assert.strictEqual(processor.translationCount, 1, 'Первый перевод должен выполниться реально');
    
    // Второй перевод того же текста с skipCache (должен выполниться реально)
    await processor.translate(text, sourceLanguage, targetLanguage, { skipCache: true });
    assert.strictEqual(processor.translationCount, 2, 'Второй перевод с skipCache должен выполниться реально');
  });
  
  it('должен использовать разные ключи кэша для разных языков', async () => {
    const text = 'Hello World';
    
    // Перевод на русский
    await processor.translate(text, 'en', 'ru');
    assert.strictEqual(processor.translationCount, 1, 'Первый перевод должен выполниться реально');
    
    // Перевод на французский (должен выполниться реально)
    await processor.translate(text, 'en', 'fr');
    assert.strictEqual(processor.translationCount, 2, 'Перевод на другой язык должен выполниться реально');
    
    // Повторный перевод на русский (должен взяться из кэша)
    await processor.translate(text, 'en', 'ru');
    assert.strictEqual(processor.translationCount, 2, 'Повторный перевод на русский должен взяться из кэша');
    
    // Повторный перевод на французский (должен взяться из кэша)
    await processor.translate(text, 'en', 'fr');
    assert.strictEqual(processor.translationCount, 2, 'Повторный перевод на французский должен взяться из кэша');
  });
});
