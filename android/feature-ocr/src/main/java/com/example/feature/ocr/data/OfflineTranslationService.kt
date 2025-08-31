package com.example.feature.ocr.data

import android.content.Context
import android.util.Log
import com.example.core.data.repository.LocalResourcesRepository
import com.example.core.model.LocalDictionary
import com.example.feature.ocr.domain.Language
import com.example.feature.ocr.domain.TranslationService
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Enhanced offline translation service using local dictionaries
 * Supports OCR post-processing, manga sound effects, and multi-language translation
 */
@Singleton
class OfflineTranslationService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gson: Gson,
    private val localResourcesRepository: LocalResourcesRepository
) : TranslationService {

    companion object {
        private const val TAG = "OfflineTranslationService"
        
        // Dictionary types
        private const val DICT_EN_RU = "en-ru"
        private const val DICT_JA_RU = "ja-ru"
        private const val DICT_FR_EN = "fr-en"
        private const val DICT_ES_EN = "es-en"
        private const val DICT_DE_EN = "de-en"
        private const val DICT_PT_EN = "pt-en"
        private const val DICT_KO_EN = "ko-en"
        private const val DICT_IT_EN = "it-en"
        private const val DICT_NL_EN = "nl-en"
        private const val DICT_MANGA_SFX = "manga-sfx"
        private const val DICT_POST_PROCESSING = "post-processing"
        private const val DICT_OCR_CORRECTIONS = "ocr-corrections"
        
        // Language codes
        private const val LANG_AUTO = "auto"
        private const val LANG_EN = "en"
        private const val LANG_RU = "ru"
        private const val LANG_JA = "ja"
        private const val LANG_ZH = "zh"
        private const val LANG_KO = "ko"
    }

    private val dictionaries = mutableMapOf<String, Map<String, String>>()
    private var isInitialized = false

    override suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            if (!isInitialized) {
                loadDictionaries()
            }

            Log.d(TAG, "Translating: '$text' from $sourceLanguage to $targetLanguage")
            
            // Step 1: Pre-processing to prepare text
            var processedText = applyPreProcessing(text)
            Log.d(TAG, "After pre-processing: '$processedText'")
            
            // Step 2: OCR post-processing to fix common errors
            processedText = applyOcrPostProcessing(processedText)
            Log.d(TAG, "After OCR post-processing: '$processedText'")
            
            // Step 3: Confidence-based filtering for low-quality OCR results
            if (isLowQualityText(processedText)) {
                Log.d(TAG, "Low quality text detected, skipping translation")
                return@withContext Result.success(processedText)
            }
            
            // Step 4: Detect source language if needed
            val actualSourceLang = if (sourceLanguage == LANG_AUTO) {
                detectLanguage(processedText).getOrElse { LANG_EN }
            } else {
                sourceLanguage
            }
            
            Log.d(TAG, "Detected/provided source language: $actualSourceLang")
            
            // Step 5: Apply appropriate translation strategy
            val translatedText = when {
                actualSourceLang == LANG_JA && isJapaneseSoundEffect(processedText) -> {
                    // Special handling for Japanese manga sound effects
                    translateMangaSoundEffect(processedText)
                }
                actualSourceLang == LANG_JA && targetLanguage == LANG_RU -> {
                    // Japanese to Russian translation
                    translateWithDictionary(processedText, DICT_JA_RU)
                }
                actualSourceLang == LANG_EN && targetLanguage == LANG_RU -> {
                    // English to Russian translation
                    translateWithDictionary(processedText, DICT_EN_RU)
                }
                actualSourceLang == "fr" && targetLanguage == "en" -> {
                    // French to English translation
                    translateWithDictionary(processedText, DICT_FR_EN)
                }
                actualSourceLang == "es" && targetLanguage == "en" -> {
                    // Spanish to English translation
                    translateWithDictionary(processedText, DICT_ES_EN)
                }
                actualSourceLang == "de" && targetLanguage == "en" -> {
                    // German to English translation
                    translateWithDictionary(processedText, DICT_DE_EN)
                }
                actualSourceLang == "pt" && targetLanguage == "en" -> {
                    // Portuguese to English translation
                    translateWithDictionary(processedText, DICT_PT_EN)
                }
                actualSourceLang == LANG_KO && targetLanguage == "en" -> {
                    // Korean to English translation
                    translateWithDictionary(processedText, DICT_KO_EN)
                }
                actualSourceLang == "it" && targetLanguage == "en" -> {
                    // Italian to English translation
                    translateWithDictionary(processedText, DICT_IT_EN)
                }
                actualSourceLang == "nl" && targetLanguage == "en" -> {
                    // Dutch to English translation
                    translateWithDictionary(processedText, DICT_NL_EN)
                }
                else -> {
                    // Fallback to English-Russian dictionary
                    translateWithDictionary(processedText, DICT_EN_RU)
                }
            }
            
            Log.d(TAG, "Final translation: '$translatedText'")
            Result.success(translatedText)
            
        } catch (e: Exception) {
            Log.e(TAG, "Translation failed", e)
            Result.failure(e)
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
                // French: accented characters
                text.contains(Regex("[àâäéèêëïîôöùûüÿç]")) -> "fr"
                // Spanish: ñ and inverted punctuation
                text.contains(Regex("[ñ¿¡]")) -> "es"
                // German: umlauts and ß
                text.contains(Regex("[äöüß]")) -> "de"
                // Portuguese: accented characters
                text.contains(Regex("[ãõáéíóúàèìòùâêîôû]")) -> "pt"
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
            // Supported languages for OCR detection and translation
            // Translation pairs supported: EN-RU, JA-RU, FR-EN, ES-EN, DE-EN, PT-EN, KO-EN
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
                Language("nl", "Dutch", "Nederlands"),
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
     * Loads all available dictionaries from assets
     */
    private suspend fun loadDictionaries() {
        try {
            Log.d(TAG, "Loading offline dictionaries...")
            
            // Load main translation dictionaries
            loadDictionary("en-ru.json", DICT_EN_RU)
            
            // Load Japanese-Russian dictionary
            loadDictionary("ja-ru.json", DICT_JA_RU)
            
            // Load new language dictionaries
            loadDictionary("fr-en.json", DICT_FR_EN)
            loadDictionary("es-en.json", DICT_ES_EN)
            loadDictionary("de-en.json", DICT_DE_EN)
            loadDictionary("pt-en.json", DICT_PT_EN)
            loadDictionary("ko-en.json", DICT_KO_EN)
            loadDictionary("it-en.json", DICT_IT_EN)
            loadDictionary("nl-en.json", DICT_NL_EN)
            
            // Load manga-specific dictionaries
            loadDictionary("manga-sfx.json", DICT_MANGA_SFX)
            
            // Load OCR post-processing dictionaries
            loadDictionary("post.json", DICT_POST_PROCESSING)
            
            // Load OCR corrections
            loadDictionary("ocr_corrections.json", DICT_OCR_CORRECTIONS)
            
            // Load additional dictionaries if they exist
            loadDictionary("post_processing.json", "post_processing")
            loadDictionary("pre_processing.json", "pre_processing")
            loadDictionary("glossary.json", "glossary")
            
            isInitialized = true
            Log.d(TAG, "Successfully loaded ${dictionaries.size} dictionaries")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to load dictionaries", e)
            isInitialized = true // Don't block the service
        }
    }

    /**
     * Loads a single dictionary from assets
     */
    private fun loadDictionary(fileName: String, key: String) {
        try {
            val inputStream = context.assets.open("dictionaries/$fileName")
            val jsonString = inputStream.bufferedReader().use { it.readText() }
            val type = object : TypeToken<Map<String, String>>() {}.type
            val dictionary: Map<String, String> = gson.fromJson(jsonString, type)
            dictionaries[key] = dictionary
            Log.d(TAG, "Loaded dictionary '$key' with ${dictionary.size} entries")
        } catch (e: Exception) {
            Log.w(TAG, "Could not load dictionary '$fileName': ${e.message}")
            // Create empty dictionary as fallback
            dictionaries[key] = emptyMap()
        }
    }

    /**
     * Applies pre-processing to prepare text for translation with enhanced comic-specific handling
     */
    private fun applyPreProcessing(text: String): String {
        val preProcessingDict = dictionaries["pre_processing"] ?: emptyMap()
        
        var processedText = text
        
        // Apply pre-processing corrections
        preProcessingDict.forEach { (pattern, replacement) ->
            processedText = processedText.replace(Regex("\\b$pattern\\b"), replacement)
        }
        
        // Apply context-aware corrections for comic dialogue
        val contextCorrections = dictionaries["context_corrections"] ?: emptyMap()
        val comicDialogueCorrections = contextCorrections["comic_dialogue"] ?: emptyMap()
        comicDialogueCorrections.forEach { (pattern, replacement) ->
            processedText = processedText.replace(Regex("\\b$pattern\\b", RegexOption.IGNORE_CASE), replacement)
        }
        
        // Additional text cleaning
        processedText = processedText
            .replace(Regex("\\s+"), " ") // Multiple spaces to single space
            .replace(Regex("\\n+"), " ") // Multiple newlines to space
            .trim()
        
        return processedText
    }
    
    /**
     * Checks if the text is of low quality based on various heuristics
     */
    private fun isLowQualityText(text: String): Boolean {
        if (text.isBlank()) return true
        
        // Check for too many unrecognized characters
        val recognizedChars = text.count { it.isLetterOrDigit() || it.isWhitespace() }
        val totalChars = text.length
        if (totalChars > 0 && recognizedChars.toFloat() / totalChars < 0.3) {
            return true
        }
        
        // Check for excessive special characters
        val specialChars = text.count { !it.isLetterOrDigit() && !it.isWhitespace() }
        if (totalChars > 0 && specialChars.toFloat() / totalChars > 0.5) {
            return true
        }
        
        // Check for very short text that's mostly special characters
        if (text.length <= 3 && specialChars >= text.length / 2) {
            return true
        }
        
        return false
    }
    
    /**
     * Applies OCR post-processing to fix common recognition errors with improved logic
     */
    private fun applyOcrPostProcessing(text: String): String {
        val postProcessingDict = dictionaries[DICT_POST_PROCESSING] ?: emptyMap()
        val ocrCorrectionsDict = dictionaries[DICT_OCR_CORRECTIONS] ?: emptyMap()
        
        var processedText = text
        
        // Apply OCR corrections first
        ocrCorrectionsDict.forEach { (error, correction) ->
            processedText = processedText.replace(Regex("\\b$error\\b"), correction)
        }
        
        // Apply post-processing corrections
        postProcessingDict.forEach { (error, correction) ->
            processedText = processedText.replace(Regex("\\b$error\\b"), correction)
        }
        
        // Additional text cleaning
        processedText = processedText
            .replace(Regex("\\s+"), " ") // Multiple spaces to single space
            .replace(Regex("\\n+"), " ") // Multiple newlines to space
            .trim()
        
        return processedText
    }

    /**
     * Checks if the text is likely a Japanese sound effect
     */
    private fun isJapaneseSoundEffect(text: String): Boolean {
        val mangaSfxDict = dictionaries[DICT_MANGA_SFX] ?: emptyMap()
        return mangaSfxDict.containsKey(text.trim()) ||
               text.matches(Regex("^[\u30a0-\u30ff\u3040-\u309f]+$")) // Only hiragana/katakana
    }

    /**
     * Translates Japanese manga sound effects
     */
    private fun translateMangaSoundEffect(text: String): String {
        val mangaSfxDict = dictionaries[DICT_MANGA_SFX] ?: emptyMap()
        return mangaSfxDict[text.trim()] ?: text
    }

    /**
     * Translates text using specified dictionary with improved word handling and context awareness
     */
    private fun translateWithDictionary(text: String, dictionaryKey: String): String {
        val dictionary = dictionaries[dictionaryKey] ?: emptyMap()
        
        if (dictionary.isEmpty()) {
            Log.w(TAG, "Dictionary '$dictionaryKey' is empty or not loaded")
            return text
        }
        
        // Try exact match first
        val exactMatch = dictionary[text.lowercase().trim()]
        if (exactMatch != null) {
            return exactMatch
        }
        
        // For comic-specific text, try context-aware corrections
        if (dictionaryKey == DICT_OCR_CORRECTIONS) {
            val contextCorrections = dictionaries["context_corrections"] ?: emptyMap()
            val comicSpecificCorrections = contextCorrections["comic_specific"] ?: emptyMap()
            
            comicSpecificCorrections.forEach { (pattern, replacement) ->
                if (text.contains(pattern)) {
                    return text.replace(pattern, replacement)
                }
            }
            
            // Apply comic dialogue corrections
            val comicDialogueCorrections = contextCorrections["comic_dialogue"] ?: emptyMap()
            var processedText = text
            comicDialogueCorrections.forEach { (pattern, replacement) ->
                processedText = processedText.replace(Regex("\\b$pattern\\b", RegexOption.IGNORE_CASE), replacement)
            }
            if (processedText != text) {
                return processedText
            }
        }
        
        // Word-by-word translation for phrases
        val words = text.split(Regex("\\s+"))
        val translatedWords = words.map { word ->
            val cleanWord = word.lowercase().trim()
            dictionary[cleanWord] ?: word // Keep original if no translation found
        }
        
        return translatedWords.joinToString(" ")
    }
    
    /**
     * Gets translation quality score based on dictionary coverage
     */
    fun getTranslationQuality(text: String, sourceLanguage: String, targetLanguage: String): Float {
        val dictionaryKey = "$sourceLanguage-$targetLanguage"
        val dictionary = dictionaries[dictionaryKey] ?: dictionaries[DICT_EN_RU] ?: emptyMap()
        
        if (dictionary.isEmpty()) return 0f
        
        val words = text.split(Regex("\\s+"))
        val translatedWords = words.count { word ->
            dictionary.containsKey(word.lowercase().trim())
        }
        
        return if (words.isNotEmpty()) {
            translatedWords.toFloat() / words.size
        } else {
            0f
        }
    }
    
    /**
     * Gets available dictionary information
     */
    fun getAvailableDictionaries(): Map<String, Int> {
        return dictionaries.mapValues { it.value.size }
    }
    
    /**
     * Imports a dictionary file and loads it into the service
     */
    suspend fun importDictionary(sourceUri: android.net.Uri): Result<LocalDictionary> {
        return try {
            // Import the dictionary file using the repository
            val result = localResourcesRepository.importDictionary(sourceUri, context)
            if (result.isSuccess) {
                // Load the imported dictionary
                val dictionary = result.getOrNull()
                if (dictionary != null) {
                    loadCustomDictionary(dictionary)
                    Log.d(TAG, "Successfully imported and loaded dictionary: ${dictionary.name}")
                }
            }
            result
        } catch (e: Exception) {
            Log.e(TAG, "Failed to import dictionary", e)
            Result.failure(e)
        }
    }
    
    /**
     * Exports a dictionary file to the specified destination
     */
    suspend fun exportDictionary(dictionary: LocalDictionary, destinationUri: android.net.Uri): Result<Unit> {
        return try {
            localResourcesRepository.exportDictionary(dictionary, destinationUri, context)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to export dictionary", e)
            Result.failure(e)
        }
    }
    
    /**
     * Deletes a dictionary file
     */
    suspend fun deleteDictionary(dictionary: LocalDictionary): Result<Unit> {
        return try {
            // Remove from memory first
            val key = File(android.net.Uri.parse(dictionary.path).path ?: "").nameWithoutExtension
            dictionaries.remove(key)
            
            // Delete the file
            localResourcesRepository.deleteDictionary(dictionary, context)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to delete dictionary", e)
            Result.failure(e)
        }
    }
    
    /**
     * Refreshes all dictionaries by reloading them
     */
    suspend fun refreshDictionaries(): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                dictionaries.clear()
                loadDictionaries()
                Result.success(Unit)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to refresh dictionaries", e)
                Result.failure(e)
            }
        }
    }
    
    /**
     * Loads a custom dictionary from the local file system
     */
    private suspend fun loadCustomDictionary(dictionary: LocalDictionary) {
        withContext(Dispatchers.IO) {
            try {
                val file = File(android.net.Uri.parse(dictionary.path).path ?: return@withContext)
                if (!file.exists()) return@withContext
                
                val jsonString = file.readText()
                val type = object : TypeToken<Map<String, String>>() {}.type
                val dict: Map<String, String> = gson.fromJson(jsonString, type)
                
                // Use the file name without extension as the dictionary key
                val key = file.nameWithoutExtension
                dictionaries[key] = dict
                Log.d(TAG, "Loaded custom dictionary '$key' with ${dict.size} entries")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to load custom dictionary: ${dictionary.name}", e)
            }
        }
    }
}