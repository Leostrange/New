/**
 * OCREditorIntegrationTest.js
 * 
 * Модульные тесты для интеграции OCR и редактирования
 */

const assert = require('assert');
const EventEmitter = require('events');
const OCREditorIntegration = require('../src/integration/OCREditorIntegration');

// Мок-объекты для тестирования
const createMocks = () => {
    const eventEmitter = new EventEmitter();
    
    const ocrProcessor = {
        recognize: jest.fn().mockImplementation((options) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const results = [
                        {
                            id: 'text1',
                            text: 'Sample text 1',
                            bounds: { x: 10, y: 10, width: 100, height: 30 },
                            confidence: 0.95
                        },
                        {
                            id: 'text2',
                            text: 'Sample text 2',
                            bounds: { x: 10, y: 50, width: 100, height: 30 },
                            confidence: 0.85
                        }
                    ];
                    resolve(results);
                }, 100);
            });
        })
    };
    
    const imageEditor = {
        getImageData: jest.fn().mockReturnValue({ width: 800, height: 600, data: new Uint8Array(100) })
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
        ocrProcessor,
        imageEditor,
        textEditor,
        layoutEditor,
        logger
    };
};

describe('OCREditorIntegration', () => {
    let mocks;
    let integration;
    
    beforeEach(() => {
        mocks = createMocks();
        integration = new OCREditorIntegration({
            ocrProcessor: mocks.ocrProcessor,
            imageEditor: mocks.imageEditor,
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
        expect(mocks.logger.info).toHaveBeenCalledWith('OCREditorIntegration: Initialized successfully');
    });
    
    test('should not initialize twice', () => {
        integration.initialize();
        expect(mocks.logger.warn).toHaveBeenCalledWith('OCREditorIntegration: Already initialized');
    });
    
    test('should handle image updated event', () => {
        const imageData = { width: 800, height: 600, data: new Uint8Array(100) };
        
        mocks.eventEmitter.emit('imageEditor:imageUpdated', {
            imageId: 'image1',
            imageData: imageData
        });
        
        expect(mocks.logger.debug).toHaveBeenCalledWith('OCREditorIntegration: Image updated', { imageId: 'image1' });
    });
    
    test('should handle preprocessing applied event', () => {
        const imageData = { width: 800, height: 600, data: new Uint8Array(100) };
        const preprocessingParams = { contrast: 1.2, brightness: 0.8 };
        
        mocks.eventEmitter.emit('imageEditor:preprocessingApplied', {
            imageId: 'image1',
            preprocessingParams: preprocessingParams,
            imageData: imageData
        });
        
        expect(mocks.logger.debug).toHaveBeenCalledWith('OCREditorIntegration: Preprocessing applied', { 
            imageId: 'image1',
            params: preprocessingParams 
        });
    });
    
    test('should perform OCR and return results', async () => {
        const imageData = { width: 800, height: 600, data: new Uint8Array(100) };
        
        const results = await integration.performOCR({
            imageId: 'image1',
            imageData: imageData,
            language: 'en'
        });
        
        expect(results).toHaveLength(2);
        expect(results[0].id).toBe('text1');
        expect(results[1].id).toBe('text2');
        expect(mocks.ocrProcessor.recognize).toHaveBeenCalledWith({
            imageId: 'image1',
            imageData: imageData,
            preprocessingParams: undefined,
            bubbles: null,
            language: 'en'
        });
    });
    
    test('should use cached OCR results when available', async () => {
        const imageData = { width: 800, height: 600, data: new Uint8Array(100) };
        const cachedResults = [
            {
                id: 'cached1',
                text: 'Cached text 1',
                bounds: { x: 10, y: 10, width: 100, height: 30 },
                confidence: 0.95
            }
        ];
        
        // Manually set cache
        integration.resultCache.set('image1', { ocrResults: cachedResults });
        
        const results = await integration.performOCR({
            imageId: 'image1',
            imageData: imageData,
            language: 'en'
        });
        
        expect(results).toBe(cachedResults);
        expect(mocks.ocrProcessor.recognize).not.toHaveBeenCalled();
    });
    
    test('should force update even when cache is available', async () => {
        const imageData = { width: 800, height: 600, data: new Uint8Array(100) };
        const cachedResults = [
            {
                id: 'cached1',
                text: 'Cached text 1',
                bounds: { x: 10, y: 10, width: 100, height: 30 },
                confidence: 0.95
            }
        ];
        
        // Manually set cache
        integration.resultCache.set('image1', { ocrResults: cachedResults });
        
        const results = await integration.performOCR({
            imageId: 'image1',
            imageData: imageData,
            language: 'en',
            forceUpdate: true
        });
        
        expect(results).not.toBe(cachedResults);
        expect(mocks.ocrProcessor.recognize).toHaveBeenCalled();
    });
    
    test('should apply OCR results to editors', () => {
        const results = [
            {
                id: 'text1',
                text: 'Sample text 1',
                bounds: { x: 10, y: 10, width: 100, height: 30 },
                confidence: 0.95
            },
            {
                id: 'text2',
                text: 'Sample text 2',
                bounds: { x: 10, y: 50, width: 100, height: 30 },
                confidence: 0.85
            }
        ];
        
        integration.applyOCRResults({
            imageId: 'image1',
            results: results
        });
        
        // Check if events were emitted
        expect(mocks.eventEmitter.emit).toHaveBeenCalledWith('integration:applyTextResults', expect.any(Object));
        expect(mocks.eventEmitter.emit).toHaveBeenCalledWith('integration:applyLayoutResults', expect.any(Object));
    });
    
    test('should handle text updated event', () => {
        const results = [
            {
                id: 'text1',
                text: 'Original text',
                bounds: { x: 10, y: 10, width: 100, height: 30 },
                confidence: 0.95
            }
        ];
        
        // Set up cache
        integration.resultCache.set('image1', { ocrResults: results });
        
        // Emit text updated event
        mocks.eventEmitter.emit('textEditor:textUpdated', {
            textBlockId: 'text1',
            imageId: 'image1',
            text: 'Updated text'
        });
        
        // Check if cache was updated
        const cacheEntry = integration.resultCache.get('image1');
        expect(cacheEntry.ocrResults[0].text).toBe('Updated text');
        expect(cacheEntry.ocrResults[0].isEdited).toBe(true);
    });
    
    test('should handle bubble updated event', () => {
        const bubbleId = 'bubble1';
        const textBlockId = 'text1';
        const bounds = { x: 10, y: 10, width: 200, height: 100 };
        
        // Set up cache
        integration.resultCache.set('image1', { 
            ocrResults: [
                {
                    id: textBlockId,
                    text: 'Sample text',
                    bounds: { x: 20, y: 20, width: 100, height: 30 },
                    confidence: 0.95
                }
            ]
        });
        
        // Emit bubble updated event
        mocks.eventEmitter.emit('layoutEditor:bubbleUpdated', {
            bubbleId: bubbleId,
            imageId: 'image1',
            bounds: bounds,
            textBlockId: textBlockId
        });
        
        // Check if cache was updated
        const cacheEntry = integration.resultCache.get('image1');
        expect(cacheEntry.bubbles.get(bubbleId).bounds).toBe(bounds);
        expect(cacheEntry.bubbles.get(bubbleId).textBlockId).toBe(textBlockId);
        expect(cacheEntry.ocrResults[0].bubbleId).toBe(bubbleId);
    });
    
    test('should clear cache for specific image', () => {
        // Set up cache for multiple images
        integration.resultCache.set('image1', { ocrResults: [{ id: 'text1' }] });
        integration.resultCache.set('image2', { ocrResults: [{ id: 'text2' }] });
        
        // Clear cache for one image
        integration.clearCache({ imageId: 'image1' });
        
        // Check if cache was cleared correctly
        expect(integration.resultCache.has('image1')).toBe(false);
        expect(integration.resultCache.has('image2')).toBe(true);
    });
    
    test('should clear all cache', () => {
        // Set up cache for multiple images
        integration.resultCache.set('image1', { ocrResults: [{ id: 'text1' }] });
        integration.resultCache.set('image2', { ocrResults: [{ id: 'text2' }] });
        
        // Clear all cache
        integration.clearCache();
        
        // Check if all cache was cleared
        expect(integration.resultCache.size).toBe(0);
    });
    
    test('should dispose correctly', () => {
        integration.dispose();
        
        expect(integration.isInitialized).toBe(false);
        expect(integration.resultCache.size).toBe(0);
    });
});
