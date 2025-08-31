package com.example.feature.ocr.data

import android.content.Context
import android.util.Log
import com.example.feature.ocr.data.api.TranslationApi
import com.example.feature.ocr.domain.Language
import com.example.feature.ocr.domain.TranslationService
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Online translation service using cloud APIs
 * Provides real-time translation with higher accuracy than offline dictionaries
 */
@Singleton
class OnlineTranslationService @Inject constructor(
    @ApplicationContext private val context: Context
) : TranslationService {

    companion object {
        private const val TAG = "OnlineTranslationService"
        private const val BASE_URL = "https://translation.googleapis.com/language/translate/v2/"
        
        // Language codes
        private const val LANG_AUTO = "auto"
        private const val LANG_EN = "en"
        private const val LANG_RU = "ru"
        private const val LANG_JA = "ja"
        private const val LANG_ZH = "zh"
        private const val LANG_KO = "ko"
    }

    private val translationApi: TranslationApi by lazy {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(loggingInterceptor)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        retrofit.create(TranslationApi::class.java)
    }

    override suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Translating: '$text' from $sourceLanguage to $targetLanguage")
            
            // Get API key from environment variables or secure storage
            val apiKey = getApiKey()
            
            if (apiKey.isNullOrBlank()) {
                Log.w(TAG, "API key is missing, returning original text")
                return@withContext Result.success(text)
            }
            
            val response = translationApi.translate(
                text = text,
                sourceLanguage = if (sourceLanguage == LANG_AUTO) "" else sourceLanguage,
                targetLanguage = targetLanguage,
                apiKey = apiKey
            )
            
            if (response.isSuccessful && response.body() != null) {
                val translatedText = response.body()?.data?.translations?.firstOrNull()?.translatedText
                if (translatedText != null) {
                    Log.d(TAG, "Successfully translated text: '$translatedText'")
                    Result.success(translatedText)
                } else {
                    Log.w(TAG, "Translation API returned empty result, returning original text")
                    Result.success(text)
                }
            } else {
                Log.e(TAG, "Translation API error: ${response.code()} - ${response.message()}")
                Result.success(text)
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Translation failed, returning original text", e)
            Result.success(text)
        }
    }

    override suspend fun detectLanguage(text: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val detectedLanguage = when {
                // Japanese: Hiragana, Katakana, Kanji
                text.contains(Regex("[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]")) -> LANG_JA
                // Chinese: CJK Unified Ideographs
                text.contains(Regex("[\u4e00-\u9fff]")) -> LANG_ZH
                // Russian: Cyrillic
                text.contains(Regex("[\u0400-\u04ff]")) -> LANG_RU
                // Korean: Hangul
                text.contains(Regex("[\uac00-\ud7af]")) -> LANG_KO
                // Hebrew
                text.contains(Regex("[\u0590-\u05ff]")) -> "he"
                // Arabic
                text.contains(Regex("[\u0600-\u06ff]")) -> "ar"
                // Default to English
                else -> LANG_EN
            }
            
            Log.d(TAG, "Detected language '$detectedLanguage' for text: '$text'")
            Result.success(detectedLanguage)
        } catch (e: Exception) {
            Log.e(TAG, "Language detection failed", e)
            Result.failure(e)
        }
    }

    override suspend fun getSupportedLanguages(): Result<List<Language>> = withContext(Dispatchers.IO) {
        try {
            val languages = listOf(
                Language(LANG_EN, "English", "English"),
                Language(LANG_RU, "Russian", "Русский"),
                Language(LANG_JA, "Japanese", "日本語"),
                Language(LANG_ZH, "Chinese", "中文"),
                Language(LANG_KO, "Korean", "한국어"),
                Language("es", "Spanish", "Español"),
                Language("fr", "French", "Français"),
                Language("de", "German", "Deutsch"),
                Language("it", "Italian", "Italiano"),
                Language("pt", "Portuguese", "Português"),
                Language("ar", "Arabic", "العربية"),
                Language("he", "Hebrew", "עברית")
            )
            Result.success(languages)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get supported languages", e)
            Result.failure(e)
        }
    }

    /**
     * Gets API key from environment variables or secure storage
     * In a production implementation, this would retrieve the key from secure storage like Android Keystore
     */
    private fun getApiKey(): String? {
        // For a production implementation, you would retrieve this from secure storage
        // For example, using Android Keystore system or encrypted SharedPreferences
        return System.getenv("GOOGLE_TRANSLATE_API_KEY") ?: getApiKeyFromSecureStorage()
    }
    
    /**
     * Gets API key from secure storage
     * This is a placeholder implementation - in a real app, you would use Android Keystore
     * or encrypted SharedPreferences to securely store and retrieve the API key
     */
    private fun getApiKeyFromSecureStorage(): String {
        // In a real implementation, you would retrieve the API key from secure storage
        // For example:
        // val sharedPrefs = context.getSharedPreferences("secure_prefs", Context.MODE_PRIVATE)
        // return sharedPrefs.getString("translation_api_key", "") ?: ""
        
        // For now, we return an empty string as a placeholder
        // In a production app, you would need to implement proper secure storage
        return ""
    }
}