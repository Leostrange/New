package com.example.feature.ocr.data

import android.content.Context
import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import com.example.core.data.repository.LocalResourcesRepository
import com.google.gson.Gson
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class OfflineTranslationServiceTest {

    @Mock
    private lateinit var localResourcesRepository: LocalResourcesRepository

    private lateinit var offlineTranslationService: OfflineTranslationService
    private lateinit var context: Context

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        context = ApplicationProvider.getApplicationContext()
        offlineTranslationService = OfflineTranslationService(
            context = context,
            gson = Gson(),
            localResourcesRepository = localResourcesRepository
        )
    }

    @Test
    fun `test OCR post-processing with comic specific corrections`() = runBlocking {
        // Test manga sound effects
        val result1 = offlineTranslationService.translate("ドキドキ", "ja", "ru").getOrNull()
        assertEquals("тук-тук", result1)
        
        val result2 = offlineTranslationService.translate("バン", "ja", "ru").getOrNull()
        assertEquals("бах", result2)
        
        val result3 = offlineTranslationService.translate("ガシャガシャ", "ja", "ru").getOrNull()
        assertEquals("бряцание", result3)
    }

    @Test
    fun `test OCR post-processing with context aware corrections`() = runBlocking {
        // Test comic dialogue corrections
        val result1 = offlineTranslationService.translate("H3llo", "en", "ru").getOrNull()
        assertEquals("Hello", result1)
        
        val result2 = offlineTranslationService.translate("Th@nk y0u", "en", "ru").getOrNull()
        assertEquals("Thank you", result2)
        
        val result3 = offlineTranslationService.translate("W3lcome", "en", "ru").getOrNull()
        assertEquals("Welcome", result3)
    }

    @Test
    fun `test confidence based filtering`() = runBlocking {
        // Test low quality text filtering
        val result1 = offlineTranslationService.translate("%%%%%", "en", "ru").getOrNull()
        assertEquals("%%%%%", result1) // Should return original text for low quality
        
        val result2 = offlineTranslationService.translate("@#$%", "en", "ru").getOrNull()
        assertEquals("@#$%", result2) // Should return original text for low quality
    }

    @Test
    fun `test language detection`() = runBlocking {
        // Test Japanese detection
        val result1 = offlineTranslationService.detectLanguage("こんにちは").getOrNull()
        assertEquals("ja", result1)
        
        // Test English detection
        val result2 = offlineTranslationService.detectLanguage("Hello").getOrNull()
        assertEquals("en", result2)
        
        // Test Russian detection
        val result3 = offlineTranslationService.detectLanguage("Привет").getOrNull()
        assertEquals("ru", result3)
    }
}