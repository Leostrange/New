package com.example.feature.ocr.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.core.data.repository.SettingsRepository
import com.example.core.data.repository.WhisperRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class TranslateOcrViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository,
    private val whisperRepository: WhisperRepository
) : ViewModel() {

    private val _transcription = MutableStateFlow("")
    val transcription = _transcription.asStateFlow()

    private val _isTranscribing = MutableStateFlow(false)
    val isTranscribing = _isTranscribing.asStateFlow()

    val targetLanguage = settingsRepository.targetLanguage.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        "en"
    )

    val ocrEngine = settingsRepository.ocrEngine.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        "Tesseract"
    )

    val translationProvider = settingsRepository.translationProvider.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        "Google"
    )

    val translationApiKey = settingsRepository.translationApiKey.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        ""
    )

    val isWhisperModelAvailable = whisperRepository.isModelDownloaded.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        false
    )

    fun onLanguageSelected(language: String) {
        viewModelScope.launch {
            settingsRepository.setTargetLanguage(language)
        }
    }

    fun onEngineSelected(engine: String) {
        viewModelScope.launch {
            settingsRepository.setOcrEngine(engine)
        }
    }

    fun onProviderSelected(provider: String) {
        viewModelScope.launch {
            settingsRepository.setTranslationProvider(provider)
        }
    }

    fun onApiKeyChanged(key: String) {
        viewModelScope.launch {
            settingsRepository.setTranslationApiKey(key)
        }
    }

    fun downloadWhisperModel() {
        viewModelScope.launch {
            whisperRepository.downloadModel()
        }
    }

    fun transcribeAudio(audioFile: File) {
        viewModelScope.launch {
            try {
                _isTranscribing.value = true
                val result = whisperRepository.transcribeAudio(audioFile)
                _transcription.value = result
            } catch (e: Exception) {
                _transcription.value = "Error transcribing audio: ${e.message}"
            } finally {
                _isTranscribing.value = false
            }
        }
    }
}