package com.example.feature.plugins.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.feature.plugins.data.repository.PluginRepository
import com.example.feature.plugins.model.Plugin
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PluginConfigViewModel @Inject constructor(
    private val pluginRepository: PluginRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(PluginConfigUiState())
    val uiState = _uiState.asStateFlow()
    
    fun initializeConfig(plugin: Plugin) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                // In a real implementation, this would fetch the actual configuration
                // For now, we'll generate mock configuration based on the plugin
                val config = generateMockConfig(plugin)
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        configValues = config
                    ) 
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false, 
                        error = "Ошибка загрузки конфигурации: ${e.message}"
                    ) 
                }
            }
        }
    }
    
    fun updateConfigValue(key: String, value: String) {
        _uiState.update { currentState ->
            val updatedConfig = currentState.configValues.toMutableMap().apply {
                this[key] = value
            }
            currentState.copy(configValues = updatedConfig)
        }
    }
    
    fun saveConfig() {
        viewModelScope.launch {
            try {
                // In a real implementation, this would save the configuration
                // For now, we'll just show a message
                _uiState.update { it.copy(error = "Конфигурация сохранена успешно") }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "Ошибка сохранения конфигурации: ${e.message}") }
            }
        }
    }
    
    private fun generateMockConfig(plugin: Plugin): Map<String, String> {
        // Generate mock configuration based on plugin category
        return when (plugin.category) {
            com.example.feature.plugins.model.PluginCategory.READER_ENHANCEMENT -> {
                mapOf(
                    "enabled" to "true",
                    "zoomEnabled" to "true",
                    "autoRotate" to "false",
                    "pageTransition" to "slide",
                    "brightness" to "80"
                )
            }
            com.example.feature.plugins.model.PluginCategory.IMAGE_PROCESSING -> {
                mapOf(
                    "enabled" to "true",
                    "quality" to "90",
                    "compression" to "75",
                    "sharpen" to "true",
                    "denoise" to "false"
                )
            }
            com.example.feature.plugins.model.PluginCategory.TRANSLATION -> {
                mapOf(
                    "enabled" to "true",
                    "sourceLanguage" to "auto",
                    "targetLanguage" to "ru",
                    "showOriginal" to "true",
                    "cacheTranslations" to "true"
                )
            }
            com.example.feature.plugins.model.PluginCategory.EXPORT -> {
                mapOf(
                    "enabled" to "true",
                    "format" to "pdf",
                    "quality" to "85",
                    "includeMetadata" to "true",
                    "splitChapters" to "false"
                )
            }
            com.example.feature.plugins.model.PluginCategory.THEME -> {
                mapOf(
                    "enabled" to "true",
                    "primaryColor" to "#2196F3",
                    "accentColor" to "#FF4081",
                    "darkMode" to "false",
                    "fontSize" to "16"
                )
            }
            else -> {
                mapOf(
                    "enabled" to "true",
                    "timeout" to "5000",
                    "retryCount" to "3",
                    "cacheEnabled" to "true"
                )
            }
        }
    }
    
    fun setError(message: String) {
        _uiState.update { it.copy(error = message) }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}

data class PluginConfigUiState(
    val configValues: Map<String, String> = emptyMap(),
    val isLoading: Boolean = false,
    val error: String? = null
)