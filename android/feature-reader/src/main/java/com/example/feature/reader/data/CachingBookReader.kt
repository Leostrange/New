package com.example.feature.reader.data

import android.graphics.Bitmap
import android.net.Uri
import com.example.feature.reader.data.cache.BitmapCache
import com.example.feature.reader.domain.BookReader
import kotlinx.coroutines.*

/**
 * A decorator for [BookReader] that adds a bitmap caching layer with preloading.
 * Enhanced for large file support.
 *
 * @param delegate The actual book reader to delegate rendering to.
 * @param cache The singleton bitmap cache.
 */
class CachingBookReader(
    private val delegate: BookReader,
    private val cache: BitmapCache
) : BookReader {

    private lateinit var bookId: String
    private val preloadScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    companion object {
        private const val TAG = "CachingBookReader"
        private const val PRELOAD_DISTANCE = 2 // Preload 2 pages ahead and behind
    }

    override suspend fun open(uri: Uri): Int {
        android.util.Log.d(TAG, "Opening book with caching: $uri")
        // Use the URI as a unique identifier for the book
        this.bookId = uri.toString()
        val pageCount = delegate.open(uri)
        android.util.Log.d(TAG, "Book opened, page count: $pageCount")
        return pageCount
    }

    override fun getPageCount(): Int = delegate.getPageCount()

    override fun renderPage(pageIndex: Int): Bitmap? {
        val key = "$bookId:$pageIndex"
        
        // Try to get from cache first
        val cachedBitmap = cache.getBitmap(key)
        if (cachedBitmap != null) {
            android.util.Log.d(TAG, "Cache hit for page $pageIndex")
            // Start preloading adjacent pages in background
            startPreloading(pageIndex)
            return cachedBitmap
        }
        
        // Not in cache, render from delegate
        android.util.Log.d(TAG, "Cache miss for page $pageIndex, rendering...")
        val renderedBitmap = delegate.renderPage(pageIndex)
        
        if (renderedBitmap != null) {
            android.util.Log.d(TAG, "Successfully rendered page $pageIndex, caching...")
            cache.putBitmap(key, renderedBitmap)
            
            // Start preloading adjacent pages in background
            startPreloading(pageIndex)
        } else {
            android.util.Log.w(TAG, "Failed to render page $pageIndex")
        }
        
        return renderedBitmap
    }
    
    /**
     * Starts background preloading of adjacent pages
     */
    private fun startPreloading(currentPageIndex: Int) {
        preloadScope.launch {
            val totalPages = delegate.getPageCount()
            
            // Preload pages ahead and behind current page
            for (offset in 1..PRELOAD_DISTANCE) {
                // Preload next pages
                val nextIndex = currentPageIndex + offset
                if (nextIndex < totalPages) {
                    preloadPage(nextIndex)
                }
                
                // Preload previous pages  
                val prevIndex = currentPageIndex - offset
                if (prevIndex >= 0) {
                    preloadPage(prevIndex)
                }
            }
        }
    }
    
    /**
     * Preloads a single page in background if not already cached
     */
    private suspend fun preloadPage(pageIndex: Int) {
        val key = "$bookId:$pageIndex"
        
        // Skip if already cached
        if (cache.getBitmap(key) != null) {
            return
        }
        
        try {
            android.util.Log.d(TAG, "Preloading page $pageIndex...")
            val bitmap = delegate.renderPage(pageIndex)
            if (bitmap != null) {
                cache.putBitmap(key, bitmap)
                android.util.Log.d(TAG, "Successfully preloaded page $pageIndex")
            }
        } catch (e: Exception) {
            android.util.Log.w(TAG, "Failed to preload page $pageIndex: ${e.message}")
        }
    }

    override fun close() {
        android.util.Log.d(TAG, "Closing caching book reader")
        // Cancel preloading operations
        preloadScope.cancel()
        delegate.close()
    }
}