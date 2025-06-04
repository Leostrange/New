/**
 * TranslationEditorIntegrationTest.js
 * 
 * Модульные тесты для интеграции перевода и редактирования
 */

const assert = require('assert');
const EventEmitter = require('events');
const TranslationEditorIntegration = require('../src/integration/TranslationEditorIntegration');

// Мок-объекты для тестирования
const createMocks = () => {
    const eventEmitter = new EventEmitter();
    
    const translationProcessor = {
        translate: jest.fn().mockImplementation((options) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const result = {
                        textBlockId: options.textBlockId,
                        sourceText: options.text,
                        translatedText: `Translated: ${options.text}`,
                        sourceLanguage: options.sourceLanguage,
                        targetLanguage: options.targetLanguage
                    };
                    resolve(result);
                }, 100);
            });
        })
    };
    
    const textEditor = {
        updateTextBlock: jest.fn()
    };
    
    const layoutEditor = {
        updateBubble: jest.fn()
    };
    
    const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };
    
    return {
        eventEmitter,
        translationProcessor,
        textEditor,
        layoutEditor,
        logger
    };
};

describe('TranslationEditorIntegration', () => {
    let mocks;
    let integration;
    
    beforeEach(() => {
        mocks = createMocks();
        integration = new TranslationEditorIntegration({
            translationProcessor: mocks.translationProcessor,
            textEditor: mocks.textEditor,
            layoutEditor: mocks.layoutEditor,
            eventEmitter: mocks.eventEmitter,
            logger: mocks.logger
        });
        
        integration.initialize();
    });
    
    afterEach(() => {
        integration.dispose();
        jest.clearAllMocks();
    });
    
    test('should initialize correctly', () => {
        expect(integration.isInitialized).toBe(true);
        expect(mocks.logger.info).toHaveBeenCalledWith('TranslationEditorIntegration: Initialized successfully');
    });
    
    test('should not initialize twice', () => {
        integration.initialize();
        expect(mocks.logger.warn).toHaveBeenCalledWith('TranslationEditorIntegration: Already initialized');
    });
    
    test('should handle text updated event', () => {
        // Set up cache
        const cacheKey = 'text1:en:ru';
        integration.translationCache.set(cacheKey, {
            sourceText: 'Original text',
            translatedText: 'Переведенный текст',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        // Emit text updated event
        mocks.eventEmitter.emit('textEditor:textUpdated', {
            textBlockId: 'text1',
            imageId: 'image1',
            text: 'Updated text'
        });
        
        // Check if cache was cleared
        expect(integration.translationCache.has(cacheKey)).toBe(false);
    });
    
    test('should handle translation requested event with cache', () => {
        // Set up cache
        const cacheKey = 'text1:en:ru';
        integration.translationCache.set(cacheKey, {
            sourceText: 'Original text',
            translatedText: 'Переведенный текст',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        // Spy on event emitter
        const emitSpy = jest.spyOn(mocks.eventEmitter, 'emit');
        
        // Emit translation requested event
        mocks.eventEmitter.emit('textEditor:translationRequested', {
            textBlockId: 'text1',
            imageId: 'image1',
            text: 'Original text',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        // Check if cached translation was used
        expect(emitSpy).toHaveBeenCalledWith('integration:translationReady', expect.objectContaining({
            textBlockId: 'text1',
            sourceText: 'Original text',
            translatedText: 'Переведенный текст',
            fromCache: true
        }));
        
        // Check that translation processor was not called
        expect(mocks.translationProcessor.translate).not.toHaveBeenCalled();
    });
    
    test('should handle translation requested event without cache', () => {
        // Spy on translation processor
        const translateSpy = jest.spyOn(mocks.translationProcessor, 'translate');
        
        // Emit translation requested event
        mocks.eventEmitter.emit('textEditor:translationRequested', {
            textBlockId: 'text1',
            imageId: 'image1',
            text: 'Original text',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        // Check if translation was requested
        expect(translateSpy).toHaveBeenCalledWith(expect.objectContaining({
            textBlockId: 'text1',
            text: 'Original text',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        }));
    });
    
    test('should handle special comic terms', () => {
        // Add a term to the dictionary
        const key = 'pow:ru';
        integration.comicTermsDictionary.set(key, 'БАХ');
        
        // Spy on event emitter
        const emitSpy = jest.spyOn(mocks.eventEmitter, 'emit');
        
        // Emit translation requested event for a special term
        mocks.eventEmitter.emit('textEditor:translationRequested', {
            textBlockId: 'text1',
            imageId: 'image1',
            text: 'POW',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        // Check if special term was applied
        expect(emitSpy).toHaveBeenCalledWith('integration:translationReady', expect.objectContaining({
            textBlockId: 'text1',
            sourceText: 'POW',
            translatedText: 'БАХ',
            isSpecialTerm: true
        }));
        
        // Check that translation processor was not called
        expect(mocks.translationProcessor.translate).not.toHaveBeenCalled();
        
        // Check if term was cached
        const cacheKey = 'text1:en:ru';
        expect(integration.translationCache.has(cacheKey)).toBe(true);
        expect(integration.translationCache.get(cacheKey).translatedText).toBe('БАХ');
    });
    
    test('should perform translation', async () => {
        const result = await integration.performTranslation({
            textBlockId: 'text1',
            imageId: 'image1',
            text: 'Hello world',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        expect(mocks.translationProcessor.translate).toHaveBeenCalledWith(expect.objectContaining({
            textBlockId: 'text1',
            text: 'Hello world',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        }));
        
        expect(result.translatedText).toBe('Translated: Hello world');
    });
    
    test('should perform batch translation', async () => {
        const textBlocks = [
            { id: 'text1', text: 'Hello' },
            { id: 'text2', text: 'World' }
        ];
        
        const results = await integration.performBatchTranslation({
            imageId: 'image1',
            textBlocks: textBlocks,
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        expect(results).toHaveLength(2);
        expect(results[0].translatedText).toBe('Translated: Hello');
        expect(results[1].translatedText).toBe('Translated: World');
        
        // Check if translations were cached
        const cacheKey1 = 'text1:en:ru';
        const cacheKey2 = 'text2:en:ru';
        expect(integration.translationCache.has(cacheKey1)).toBe(true);
        expect(integration.translationCache.has(cacheKey2)).toBe(true);
    });
    
    test('should handle term added event', () => {
        // Emit term added event
        mocks.eventEmitter.emit('textEditor:termAdded', {
            sourceTerm: 'CRASH',
            targetTerm: 'ТРЕСК',
            sourceLanguage: 'en',
            targetLanguage: 'ru'
        });
        
        // Check if term was added to dictionary
        const key = 'crash:ru';
        expect(integration.comicTermsDictionary.has(key)).toBe(true);
        expect(integration.comicTermsDictionary.get(key)).toBe('ТРЕСК');
    });
    
    test('should clear cache for image', () => {
        // Set up cache for multiple text blocks in the same image
        integration.translationCache.set('text1:en:ru', { translatedText: 'Text 1' });
        integration.translationCache.set('text2:en:ru', { translatedText: 'Text 2' });
        integration.translationCache.set('text3:en:ru', { translatedText: 'Text 3' });
        
        // Clear cache for image
        integration.clearCacheForImage('image1');
        
        // Check if cache was cleared
        expect(integration.translationCache.size).toBe(3); // No change because we didn't set imageId in the keys
        
        // Set up cache with image ID in the key
        integration.translationCache.set('image1:text1:en:ru', { translatedText: 'Text 1' });
        integration.translationCache.set('image1:text2:en:ru', { translatedText: 'Text 2' });
        integration.translationCache.set('image2:text3:en:ru', { translatedText: 'Text 3' });
        
        // Clear cache for image1
        integration.clearCacheForImage('image1');
        
        // Check if cache was cleared correctly
        expect(integration.translationCache.has('image1:text1:en:ru')).toBe(false);
        expect(integration.translationCache.has('image1:text2:en:ru')).toBe(false);
        expect(integration.translationCache.has('image2:text3:en:ru')).toBe(true);
    });
    
    test('should clear all cache', () => {
        // Set up cache
        integration.translationCache.set('text1:en:ru', { translatedText: 'Text 1' });
        integration.translationCache.set('text2:en:ru', { translatedText: 'Text 2' });
        
        // Clear all cache
        integration.clearAllCache();
        
        // Check if all cache was cleared
        expect(integration.translationCache.size).toBe(0);
    });
    
    test('should dispose correctly', () => {
        integration.dispose();
        
        expect(integration.isInitialized).toBe(false);
        expect(integration.translationCache.size).toBe(0);
    });
});
