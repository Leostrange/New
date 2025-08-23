package com.example.core.reader

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@RunWith(AndroidJUnit4::class)
class ImageOptimizerTest {

    private lateinit var imageOptimizer: ImageOptimizer

    @Mock
    private lateinit var mockBitmap: Bitmap

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        imageOptimizer = ImageOptimizer()
    }

    @Test
    fun `calculateInSampleSize should return correct sample size for large images`() = runTest {
        val options = BitmapFactory.Options().apply {
            outWidth = 2000
            outHeight = 3000
        }
        
        // Используем рефлексию для доступа к приватному методу для тестирования
        val method = ImageOptimizer::class.java.getDeclaredMethod(
            "calculateInSampleSize",
            BitmapFactory.Options::class.java,
            Int::class.java,
            Int::class.java
        )
        method.isAccessible = true
        
        val result = method.invoke(imageOptimizer, options, 500, 500) as Int
        
        // Для изображения 2000x3000 с целевым размером 500x500, ожидаем sample size >= 2
        assert(result >= 2)
    }

    @Test
    fun `loadOptimizedImage should return null for invalid path`() = runTest {
        val result = imageOptimizer.loadOptimizedImage("invalid/path.jpg", 500, 500)
        assertNull(result)
    }

    @Test
    fun `createThumbnail should return null for invalid path`() = runTest {
        val result = imageOptimizer.createThumbnail("invalid/path.jpg", 200)
        assertNull(result)
    }

    @Test
    fun `compressImage should return byte array for valid bitmap`() = runTest {
        // Создаем тестовый bitmap
        val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
        
        val result = imageOptimizer.compressImage(bitmap, 80)
        
        assertNotNull(result)
        assert(result.isNotEmpty())
    }

    @Test
    fun `applyImageFilter brightness should not return null for valid bitmap`() = runTest {
        val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
        
        val result = imageOptimizer.applyImageFilter(bitmap, ImageFilter.BRIGHTNESS)
        
        assertNotNull(result)
    }

    @Test
    fun `applyImageFilter grayscale should not return null for valid bitmap`() = runTest {
        val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
        
        val result = imageOptimizer.applyImageFilter(bitmap, ImageFilter.GRAYSCALE)
        
        assertNotNull(result)
    }

    @Test
    fun `applyImageFilter sharpen should not return null for valid bitmap`() = runTest {
        val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
        
        val result = imageOptimizer.applyImageFilter(bitmap, ImageFilter.SHARPEN)
        
        assertNotNull(result)
    }

    @Test
    fun `clearCache should reset cache stats`() {
        imageOptimizer.clearCache()
        
        val stats = imageOptimizer.getCacheStats()
        
        assertEquals(0, stats.bitmapCacheSize)
        assertEquals(0, stats.thumbnailCacheSize)
    }

    @Test
    fun `getCacheStats should return valid stats structure`() {
        val stats = imageOptimizer.getCacheStats()
        
        assertNotNull(stats)
        assert(stats.bitmapCacheSize >= 0)
        assert(stats.thumbnailCacheSize >= 0)
        assert(stats.bitmapHitRate >= 0f)
        assert(stats.thumbnailHitRate >= 0f)
    }

    @Test
    fun `preloadImages should handle empty list`() = runTest {
        // Не должно выбрасывать исключение для пустого списка
        imageOptimizer.preloadImages(emptyList())
    }

    @Test
    fun `preloadImages should handle invalid paths gracefully`() = runTest {
        val invalidPaths = listOf("invalid1.jpg", "invalid2.jpg", "invalid3.jpg")
        
        // Не должно выбрасывать исключение
        imageOptimizer.preloadImages(invalidPaths)
    }
}