package com.example.feature.reader.data.cache

import android.graphics.Bitmap
import androidx.collection.LruCache
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BitmapCache @Inject constructor() {
    // Get max available VM memory, exceeding this amount will throw an
    // OutOfMemoryError exception. Stored in kilobytes as LruCache takes an
    // int in its constructor.
    private val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()

    // Use 1/8th of the available memory for this memory cache, but cap at 64MB for large file support
    private val cacheSize = kotlin.math.min(maxMemory / 8, 64 * 1024) // 64MB max

    private val memoryCache = object : LruCache<String, Bitmap>(cacheSize) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            // The cache size will be measured in kilobytes rather than number of items.
            return bitmap.byteCount / 1024
        }
        
        override fun entryRemoved(
            evicted: Boolean,
            key: String,
            oldValue: Bitmap,
            newValue: Bitmap?
        ) {
            // Log cache evictions for debugging large file issues
            if (evicted && oldValue.byteCount > 5 * 1024 * 1024) { // Log evictions of images > 5MB
                android.util.Log.d("BitmapCache", "Evicted large bitmap: $key (${oldValue.byteCount / 1024 / 1024}MB)")
            }
        }
    }
    
    // Track cache statistics for optimization
    private var hitCount = 0
    private var missCount = 0

    fun getBitmap(key: String): Bitmap? {
        val bitmap = memoryCache.get(key)
        if (bitmap != null) {
            hitCount++
        } else {
            missCount++
        }
        return bitmap
    }

    fun putBitmap(key: String, bitmap: Bitmap) {
        if (getBitmap(key) == null) {
            // Check if bitmap is too large for efficient caching
            val bitmapSize = bitmap.byteCount
            val maxSingleItemSize = cacheSize * 1024 / 4 // Max 1/4 of cache for single item
            
            if (bitmapSize > maxSingleItemSize) {
                android.util.Log.w("BitmapCache", "Bitmap too large for cache: $key (${bitmapSize / 1024 / 1024}MB)")
                return // Don't cache very large bitmaps
            }
            
            memoryCache.put(key, bitmap)
        }
    }
    
    /**
     * Clear cache when memory is low
     */
    fun trimCache() {
        memoryCache.trimToSize(cacheSize / 2)
        android.util.Log.d("BitmapCache", "Cache trimmed due to memory pressure")
    }
    
    /**
     * Get cache statistics for monitoring
     */
    fun getCacheStats(): String {
        val total = hitCount + missCount
        val hitRate = if (total > 0) (hitCount * 100f / total) else 0f
        return "Cache hits: $hitCount, misses: $missCount, hit rate: ${hitRate.toInt()}%, size: ${memoryCache.size()}/${memoryCache.maxSize()}"
    }
    
    /**
     * Force garbage collection of unused bitmaps
     */
    fun cleanup() {
        memoryCache.evictAll()
        hitCount = 0
        missCount = 0
        System.gc() // Suggest garbage collection
        android.util.Log.d("BitmapCache", "Cache cleaned up")
    }
}