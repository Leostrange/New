package com.mrcomic.feature.translations

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TranslationsViewModel @Inject constructor(
    private val translationRepository: TranslationRepository,
    private val ocrRepository: OCRRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TranslationsUiState())
    val uiState: StateFlow<TranslationsUiState> = _uiState.asStateFlow()

    fun translateText(text: String, sourceLanguage: String, targetLanguage: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isTranslating = true, translationError = null)
            
            try {
                val result = translationRepository.translate(text, sourceLanguage, targetLanguage)
                _uiState.value = _uiState.value.copy(
                    translatedText = result,
                    isTranslating = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isTranslating = false,
                    translationError = e.message ?: "Translation failed"
                )
            }
        }
    }

    fun performOCR(imagePath: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isPerformingOCR = true, ocrError = null)
            
            try {
                val result = ocrRepository.extractText(imagePath)
                _uiState.value = _uiState.value.copy(
                    ocrResult = result,
                    isPerformingOCR = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isPerformingOCR = false,
                    ocrError = e.message ?: "OCR failed"
                )
            }
        }
    }

    fun updateSourceLanguage(language: String) {
        _uiState.value = _uiState.value.copy(sourceLanguage = language)
    }

    fun updateTargetLanguage(language: String) {
        _uiState.value = _uiState.value.copy(targetLanguage = language)
    }

    fun swapLanguages() {
        val current = _uiState.value
        _uiState.value = current.copy(
            sourceLanguage = current.targetLanguage,
            targetLanguage = current.sourceLanguage
        )
    }

    fun updateOCREngine(engine: String) {
        viewModelScope.launch {
            ocrRepository.setEngine(engine)
            _uiState.value = _uiState.value.copy(selectedOCREngine = engine)
        }
    }

    fun addTranslationProvider(provider: String, apiKey: String) {
        viewModelScope.launch {
            translationRepository.addProvider(provider, apiKey)
        }
    }

    fun downloadOfflineModel(modelName: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isDownloadingModel = true)
            
            try {
                translationRepository.downloadOfflineModel(modelName)
                _uiState.value = _uiState.value.copy(isDownloadingModel = false)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isDownloadingModel = false,
                    modelDownloadError = e.message ?: "Model download failed"
                )
            }
        }
    }
}

data class TranslationsUiState(
    val sourceLanguage: String = "English",
    val targetLanguage: String = "Russian",
    val translatedText: String = "",
    val ocrResult: String = "",
    val selectedOCREngine: String = "Tesseract",
    val isTranslating: Boolean = false,
    val isPerformingOCR: Boolean = false,
    val isDownloadingModel: Boolean = false,
    val translationError: String? = null,
    val ocrError: String? = null,
    val modelDownloadError: String? = null
)

interface TranslationRepository {
    suspend fun translate(text: String, sourceLanguage: String, targetLanguage: String): String
    suspend fun addProvider(provider: String, apiKey: String)
    suspend fun downloadOfflineModel(modelName: String)
}

interface OCRRepository {
    suspend fun extractText(imagePath: String): String
    suspend fun setEngine(engine: String)
}
