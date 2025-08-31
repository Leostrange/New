package com.example.feature.ocr.domain

/**
 * Interface for text translation services
 */
interface TranslationService {
    
    /**
     * Translates text from source language to target language
     * @param text The text to translate
     * @param sourceLanguage Source language code (e.g., "en", "ja", "zh")
     * @param targetLanguage Target language code (e.g., "en", "ru", "es")
     * @return Translated text or null if translation failed
     */
    suspend fun translate(
        text: String,
        sourceLanguage: String = "auto",
        targetLanguage: String = "en"
    ): Result<String>
    
    /**
     * Detects the language of the given text
     * @param text Text to analyze
     * @return Language code or null if detection failed
     */
    suspend fun detectLanguage(text: String): Result<String>
    
    /**
     * Gets list of supported languages
     * @return List of supported language codes with names
     */
    suspend fun getSupportedLanguages(): Result<List<Language>>
}

/**
 * Represents a supported language
 */
data class Language(
    val code: String,
    val name: String,
    val nativeName: String? = null
)

/**
 * Translation result wrapper
 */
sealed class TranslationResult {
    data class Success(val translatedText: String, val detectedLanguage: String? = null) : TranslationResult()
    data class Error(val message: String, val exception: Throwable? = null) : TranslationResult()
    object Loading : TranslationResult()
}