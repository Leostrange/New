package com.example.core.reader

import android.content.Context
import android.graphics.*
import android.util.LruCache
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.min

/**
 * Система оптимизации изображений для улучшения производительности
 */
@Singleton
class ImageOptimizer @Inject constructor(
    private val context: Context
) {
    
    // LRU кэш для битмапов
    private val bitmapCache: LruCache<String, Bitmap> = object : LruCache<String, Bitmap>(
        // Используем 1/8 доступной памяти для кэша
        (Runtime.getRuntime().maxMemory() / 1024 / 8).toInt()
    ) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            return bitmap.allocationByteCount / 1024
        }
    }
    
    // Кэш для миниатюр
    private val thumbnailCache: LruCache<String, Bitmap> = object : LruCache<String, Bitmap>(
        (Runtime.getRuntime().maxMemory() / 1024 / 16).toInt()
    ) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            return bitmap.allocationByteCount / 1024
        }
    }
    
    // Адаптивный кэш для прогрессивной загрузки
    private val progressiveCache: LruCache<String, Bitmap> = object : LruCache<String, Bitmap>(
        (Runtime.getRuntime().maxMemory() / 1024 / 32).toInt()
    ) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            return bitmap.allocationByteCount / 1024
        }
    }
    
    companion object {
        private const val THUMBNAIL_SIZE = 200
        private const val MAX_IMAGE_SIZE = 2048
        private const val COMPRESSION_QUALITY = 85
        
        // Large file handling constants
        private const val LARGE_FILE_THRESHOLD = 10 * 1024 * 1024 // 10MB
        private const val MAX_MEMORY_PER_IMAGE = 50 * 1024 * 1024 // 50MB
        private const val PROGRESSIVE_LOAD_SIZE = 1024 // Start with 1024px max dimension
        private const val PRELOAD_DISTANCE = 2 // Preload 2 pages ahead/behind
        
        // Enhanced memory management constants
        private const val CRITICAL_MEMORY_THRESHOLD = 0.85 // 85% of max memory
        private const val AGGRESSIVE_COMPRESSION_THRESHOLD = 0.75 // 75% of max memory
        private const val MAX_BITMAP_CACHE_SIZE = 100 * 1024 * 1024 // 100MB max cache size
        
        // Adaptive loading strategies
        private const val DEVICE_MEMORY_LOW = 1024 * 1024 * 1024L // 1GB
        private const val DEVICE_MEMORY_MEDIUM = 2048 * 1024 * 1024L // 2GB
        private const val DEVICE_MEMORY_HIGH = 4096 * 1024 * 1024L // 4GB
    }
    
    /**
     * Загружает и оптимизирует изображение с поддержкой больших файлов
     */
    suspend fun loadOptimizedImageForLargeFiles(
        imagePath: String,
        targetWidth: Int = MAX_IMAGE_SIZE,
        targetHeight: Int = MAX_IMAGE_SIZE,
        useCache: Boolean = true,
        isLargeFile: Boolean = false
    ): Bitmap? = withContext(Dispatchers.IO) {
        
        val cacheKey = generateCacheKey(imagePath, targetWidth, targetHeight)
        
        // Проверяем кэш
        if (useCache) {
            bitmapCache.get(cacheKey)?.let { return@withContext it }
        }
        
        try {
            val fileSize = java.io.File(imagePath).length()
            val shouldUseLargeFileOptimization = isLargeFile || fileSize > LARGE_FILE_THRESHOLD
            
            if (shouldUseLargeFileOptimization) {
                return@withContext loadLargeImageOptimized(imagePath, targetWidth, targetHeight, cacheKey, useCache)
            } else {
                return@withContext loadOptimizedImage(imagePath, targetWidth, targetHeight, useCache)
            }
            
        } catch (e: Exception) {
            android.util.Log.e("ImageOptimizer", "Error loading image: ${e.message}", e)
            null
        }
    }
    
    /**
     * Создает миниатюру изображения
     */
    suspend fun createThumbnail(
        imagePath: String,
        size: Int = THUMBNAIL_SIZE
    ): Bitmap? = withContext(Dispatchers.IO) {
        
        val cacheKey = "thumb_${imagePath}_$size"
        
        // Проверяем кэш миниатюр
        thumbnailCache.get(cacheKey)?.let { return@withContext it }
        
        try {
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeFile(imagePath, options)
            
            val scaleFactor = calculateInSampleSize(options, size, size)
            
            val thumbnailOptions = BitmapFactory.Options().apply {
                inSampleSize = scaleFactor
                inPreferredConfig = Bitmap.Config.RGB_565
            }
            
            val bitmap = BitmapFactory.decodeFile(imagePath, thumbnailOptions)
            val thumbnail = bitmap?.let { resizeBitmap(it, size, size) }
            
            if (thumbnail != null) {
                thumbnailCache.put(cacheKey, thumbnail)
            }
            
            thumbnail
            
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Предварительная загрузка изображений
     */
    suspend fun preloadImages(
        imagePaths: List<String>,
        targetWidth: Int = MAX_IMAGE_SIZE,
        targetHeight: Int = MAX_IMAGE_SIZE
    ) = withContext(Dispatchers.IO) {
        
        // Загружаем параллельно с ограничением количества одновременных операций
        val semaphore = Semaphore(3) // Максимум 3 одновременные загрузки
        
        imagePaths.map { imagePath ->
            async {
                semaphore.withPermit {
                    loadOptimizedImage(imagePath, targetWidth, targetHeight, useCache = true)
                }
            }
        }.awaitAll()
    }
    
    /**
     * Сжимает изображение для экономии памяти
     */
    suspend fun compressImage(
        bitmap: Bitmap,
        quality: Int = COMPRESSION_QUALITY
    ): ByteArray? = withContext(Dispatchers.IO) {
        try {
            val outputStream = java.io.ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
            outputStream.toByteArray()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Специализированная загрузка для больших изображений
     */
    private suspend fun loadLargeImageOptimized(
        imagePath: String,
        targetWidth: Int,
        targetHeight: Int,
        cacheKey: String,
        useCache: Boolean
    ): Bitmap? = withContext(Dispatchers.IO) {
        try {
            // Check memory pressure before loading
            val memoryPressure = checkMemoryPressure()
            
            // Get image dimensions
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeFile(imagePath, options)
            
            val originalWidth = options.outWidth
            val originalHeight = options.outHeight
            
            // Calculate memory budget based on current memory pressure
            val memoryBudget = when {
                memoryPressure > CRITICAL_MEMORY_THRESHOLD -> Runtime.getRuntime().maxMemory() / 32 // Very aggressive
                memoryPressure > AGGRESSIVE_COMPRESSION_THRESHOLD -> Runtime.getRuntime().maxMemory() / 16 // Aggressive
                else -> Runtime.getRuntime().maxMemory() / 8 // Normal
            }
            
            val estimatedSize = originalWidth * originalHeight * 4 // ARGB_8888
            
            // Use progressive loading for very large images
            if (estimatedSize > memoryBudget) {
                return@withContext loadProgressiveImage(imagePath, targetWidth, targetHeight, cacheKey, useCache)
            }
            
            // Calculate inSampleSize to fit within memory budget
            val inSampleSize = calculateInSampleSize(options, targetWidth, targetHeight)
            
            val decodeOptions = BitmapFactory.Options().apply {
                this.inSampleSize = inSampleSize
                this.inPreferredConfig = when {
                    memoryPressure > AGGRESSIVE_COMPRESSION_THRESHOLD -> Bitmap.Config.RGB_565
                    else -> Bitmap.Config.ARGB_8888
                }
            }
            
            val bitmap = BitmapFactory.decodeFile(imagePath, decodeOptions)
            
            // Resize if necessary
            val resizedBitmap = bitmap?.let {
                if (it.width > targetWidth || it.height > targetHeight) {
                    resizeBitmap(it, targetWidth, targetHeight)
                } else {
                    it
                }
            }
            
            // Cache the result
            if (useCache && resizedBitmap != null) {
                bitmapCache.put(cacheKey, resizedBitmap)
            }
            
            resizedBitmap
            
        } catch (e: Exception) {
            android.util.Log.e("ImageOptimizer", "Error loading large image: ${e.message}", e)
            null
        }
    }
    
    /**
     * Прогрессивная загрузка изображений
     */
    private suspend fun loadProgressiveImage(
        imagePath: String,
        targetWidth: Int,
        targetHeight: Int,
        cacheKey: String,
        useCache: Boolean
    ): Bitmap? = withContext(Dispatchers.IO) {
        try {
            // Check progressive cache first
            val progressiveCacheKey = "progressive_$cacheKey"
            progressiveCache.get(progressiveCacheKey)?.let { return@withContext it }
            
            // Load lower resolution version first
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeFile(imagePath, options)
            
            val inSampleSize = calculateInSampleSize(options, PROGRESSIVE_LOAD_SIZE, PROGRESSIVE_LOAD_SIZE)
            
            val decodeOptions = BitmapFactory.Options().apply {
                this.inSampleSize = inSampleSize
                this.inPreferredConfig = Bitmap.Config.RGB_565
            }
            
            val bitmap = BitmapFactory.decodeFile(imagePath, decodeOptions)
            
            // Cache the progressive result
            if (useCache && bitmap != null) {
                progressiveCache.put(progressiveCacheKey, bitmap)
            }
            
            bitmap
            
        } catch (e: Exception) {
            android.util.Log.e("ImageOptimizer", "Error loading progressive image: ${e.message}", e)
            null
        }
    }
    
    /**
     * Загружает оптимизированное изображение
     */
    private fun loadOptimizedImage(
        imagePath: String,
        targetWidth: Int,
        targetHeight: Int,
        useCache: Boolean
    ): Bitmap? {
        try {
            val cacheKey = generateCacheKey(imagePath, targetWidth, targetHeight)
            
            // Проверяем кэш
            if (useCache) {
                bitmapCache.get(cacheKey)?.let { return it }
            }
            
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeFile(imagePath, options)
            
            val inSampleSize = calculateInSampleSize(options, targetWidth, targetHeight)
            
            val decodeOptions = BitmapFactory.Options().apply {
                this.inSampleSize = inSampleSize
                this.inPreferredConfig = Bitmap.Config.RGB_565
            }
            
            val bitmap = BitmapFactory.decodeFile(imagePath, decodeOptions)
            
            // Cache the result
            if (useCache && bitmap != null) {
                bitmapCache.put(cacheKey, bitmap)
            }
            
            return bitmap
            
        } catch (e: Exception) {
            android.util.Log.e("ImageOptimizer", "Error loading optimized image: ${e.message}", e)
            return null
        }
    }
    
    /**
     * Изменяет размер битмапа
     */
    private fun resizeBitmap(bitmap: Bitmap, maxWidth: Int, maxHeight: Int): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        
        val scale = min(maxWidth.toFloat() / width, maxHeight.toFloat() / height)
        
        val newWidth = (width * scale).toInt()
        val newHeight = (height * scale).toInt()
        
        return Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
    }
    
    /**
     * Рассчитывает коэффициент уменьшения изображения
     */
    private fun calculateInSampleSize(options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int): Int {
        val height = options.outHeight
        val width = options.outWidth
        var inSampleSize = 1
        
        if (height > reqHeight || width > reqWidth) {
            val halfHeight = height / 2
            val halfWidth = width / 2
            
            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }
        
        return inSampleSize
    }
    
    /**
     * Генерирует ключ для кэширования
     */
    private fun generateCacheKey(imagePath: String, width: Int, height: Int): String {
        return "${imagePath}_$width_$height"
    }
    
    /**
     * Проверяет давление на память
     */
    private fun checkMemoryPressure(): Double {
        val maxMemory = Runtime.getRuntime().maxMemory()
        val allocatedMemory = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()
        return allocatedMemory.toDouble() / maxMemory.toDouble()
    }
    
    /**
     * Определяет стратегию загрузки на основе характеристик устройства
     */
    fun getAdaptiveLoadingStrategy(): LoadingStrategy {
        val memory = Runtime.getRuntime().maxMemory()
        return when {
            memory < DEVICE_MEMORY_LOW -> LoadingStrategy.LOW_MEMORY
            memory < DEVICE_MEMORY_MEDIUM -> LoadingStrategy.MEDIUM_MEMORY
            memory < DEVICE_MEMORY_HIGH -> LoadingStrategy.HIGH_MEMORY
            else -> LoadingStrategy.VERY_HIGH_MEMORY
        }
    }
    
    /**
     * Очищает кэши для освобождения памяти
     */
    fun clearCaches() {
        bitmapCache.evictAll()
        thumbnailCache.evictAll()
        progressiveCache.evictAll()
    }
}

/**
 * Стратегии загрузки в зависимости от памяти устройства
 */
enum class LoadingStrategy {
    LOW_MEMORY,      // Мало памяти - агрессивная оптимизация
    MEDIUM_MEMORY,   // Средняя память - умеренная оптимизация
    HIGH_MEMORY,     // Много памяти - минимальная оптимизация
    VERY_HIGH_MEMORY // Очень много памяти - без оптимизации
}