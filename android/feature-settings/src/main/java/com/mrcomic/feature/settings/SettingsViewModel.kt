package com.mrcomic.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mrcomic.core.ui.theme.AppTheme
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        loadSettings()
    }

    private fun loadSettings() {
        viewModelScope.launch {
            settingsRepository.getSettings().collect { settings ->
                _uiState.value = _uiState.value.copy(
                    currentTheme = settings.theme,
                    language = settings.language,
                    performanceMode = settings.performanceMode,
                    reduceAnimations = settings.reduceAnimations,
                    asyncCoverLoading = settings.asyncCoverLoading,
                    compressImages = settings.compressImages,
                    nightModeOptimization = settings.nightModeOptimization,
                    disableOnlineOnSlowInternet = settings.disableOnlineOnSlowInternet
                )
            }
        }
    }

    fun updateTheme(theme: AppTheme) {
        viewModelScope.launch {
            settingsRepository.updateTheme(theme)
        }
    }

    fun updateLanguage(language: String) {
        viewModelScope.launch {
            settingsRepository.updateLanguage(language)
        }
    }

    fun updatePerformanceMode(mode: String) {
        viewModelScope.launch {
            settingsRepository.updatePerformanceMode(mode)
        }
    }

    fun updateReduceAnimations(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateReduceAnimations(enabled)
        }
    }

    fun updateAsyncCoverLoading(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateAsyncCoverLoading(enabled)
        }
    }

    fun updateCompressImages(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateCompressImages(enabled)
        }
    }

    fun updateNightModeOptimization(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateNightModeOptimization(enabled)
        }
    }

    fun updateDisableOnlineOnSlowInternet(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateDisableOnlineOnSlowInternet(enabled)
        }
    }

    fun clearCache() {
        viewModelScope.launch {
            settingsRepository.clearCache()
        }
    }
}

data class SettingsUiState(
    val currentTheme: AppTheme = AppTheme.SYSTEM,
    val language: String = "English",
    val performanceMode: String = "Maximum",
    val reduceAnimations: Boolean = false,
    val asyncCoverLoading: Boolean = true,
    val compressImages: Boolean = true,
    val nightModeOptimization: Boolean = false,
    val disableOnlineOnSlowInternet: Boolean = false,
    val isLoading: Boolean = false
)

interface SettingsRepository {
    suspend fun getSettings(): kotlinx.coroutines.flow.Flow<Settings>
    suspend fun updateTheme(theme: AppTheme)
    suspend fun updateLanguage(language: String)
    suspend fun updatePerformanceMode(mode: String)
    suspend fun updateReduceAnimations(enabled: Boolean)
    suspend fun updateAsyncCoverLoading(enabled: Boolean)
    suspend fun updateCompressImages(enabled: Boolean)
    suspend fun updateNightModeOptimization(enabled: Boolean)
    suspend fun updateDisableOnlineOnSlowInternet(enabled: Boolean)
    suspend fun clearCache()
}

data class Settings(
    val theme: AppTheme = AppTheme.SYSTEM,
    val language: String = "English",
    val performanceMode: String = "Maximum",
    val reduceAnimations: Boolean = false,
    val asyncCoverLoading: Boolean = true,
    val compressImages: Boolean = true,
    val nightModeOptimization: Boolean = false,
    val disableOnlineOnSlowInternet: Boolean = false
)
