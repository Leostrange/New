package com.example.feature.ocr.ui

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.feature.ocr.domain.TranslationService
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

/**
 * ViewModel for OCR functionality
 * Manages text recognition using MLKit
 */
@HiltViewModel
class OcrViewModel @Inject constructor(
    private val translationService: TranslationService
) : ViewModel() {

    private val _uiState = MutableStateFlow(OcrUiState())
    val uiState = _uiState.asStateFlow()

    private val textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    /**
     * Recognizes text from the given bitmap
     */
    fun recognizeText(bitmap: Bitmap) {
        viewModelScope.launch(Dispatchers.IO) {
            _uiState.update { it.copy(isProcessing = true, error = null) }
            
            try {
                val inputImage = InputImage.fromBitmap(bitmap, 0)
                val result = textRecognizer.process(inputImage).await()
                
                val recognizedText = result.text
                val textBlocks = result.textBlocks.map { block ->
                    OcrTextBlock(
                        text = block.text,
                        boundingBox = block.boundingBox,
                        confidence = block.confidence ?: 0f
                    )
                }
                
                _uiState.update {
                    it.copy(
                        isProcessing = false,
                        recognizedText = recognizedText,
                        textBlocks = textBlocks,
                        processedBitmap = bitmap
                    )
                }
                
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isProcessing = false,
                        error = "Text recognition failed: ${e.message}"
                    )
                }
            }
        }
    }

    /**
     * Clears the recognition results
     */
    fun clearResults() {
        _uiState.update {
            it.copy(
                recognizedText = "",
                textBlocks = emptyList(),
                processedBitmap = null,
                error = null,
                translatedText = "",
                detectedLanguage = null,
                translationError = null
            )
        }
    }

    /**
     * Updates the selected text block for translation
     */
    fun selectTextBlock(textBlock: OcrTextBlock) {
        _uiState.update {
            it.copy(selectedTextBlock = textBlock)
        }
    }

    /**
     * Translates the given text
     */
    fun translateText(text: String, targetLanguage: String = "en") {
        viewModelScope.launch(Dispatchers.IO) {
            _uiState.update { it.copy(isTranslating = true, translationError = null) }
            
            try {
                // First detect the language
                val detectionResult = translationService.detectLanguage(text)
                val sourceLanguage = detectionResult.getOrElse { "auto" }
                
                // Then translate
                val translationResult = translationService.translate(
                    text = text,
                    sourceLanguage = sourceLanguage,
                    targetLanguage = targetLanguage
                )
                
                translationResult.fold(
                    onSuccess = { translatedText ->
                        _uiState.update {
                            it.copy(
                                isTranslating = false,
                                translatedText = translatedText,
                                detectedLanguage = sourceLanguage
                            )
                        }
                    },
                    onFailure = { exception ->
                        _uiState.update {
                            it.copy(
                                isTranslating = false,
                                translationError = "Translation failed: ${exception.message}"
                            )
                        }
                    }
                )
                
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isTranslating = false,
                        translationError = "Translation error: ${e.message}"
                    )
                }
            }
        }
    }

    /**
     * Clears translation results
     */
    fun clearTranslation() {
        _uiState.update {
            it.copy(
                translatedText = "",
                detectedLanguage = null,
                translationError = null
            )
        }
    }

    override fun onCleared() {
        super.onCleared()
        textRecognizer.close()
    }
}

/**
 * UI state for OCR screen
 */
data class OcrUiState(
    val isProcessing: Boolean = false,
    val recognizedText: String = "",
    val textBlocks: List<OcrTextBlock> = emptyList(),
    val selectedTextBlock: OcrTextBlock? = null,
    val processedBitmap: Bitmap? = null,
    val error: String? = null,
    val isTranslating: Boolean = false,
    val translatedText: String = "",
    val detectedLanguage: String? = null,
    val translationError: String? = null
)

/**
 * Represents a text block detected by OCR
 */
data class OcrTextBlock(
    val text: String,
    val boundingBox: android.graphics.Rect?,
    val confidence: Float
)