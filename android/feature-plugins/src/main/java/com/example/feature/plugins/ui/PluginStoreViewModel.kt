package com.example.feature.plugins.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.feature.plugins.data.repository.PluginRepository
import com.example.feature.plugins.data.repository.PluginMarketplaceRepository
import com.example.feature.plugins.model.Plugin
import com.example.feature.plugins.model.PluginCategory
import com.example.feature.plugins.model.PluginType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import java.net.URL
import javax.inject.Inject

@HiltViewModel
class PluginStoreViewModel @Inject constructor(
    private val pluginRepository: PluginRepository,
    private val marketplaceRepository: PluginMarketplaceRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(PluginStoreUiState())
    val uiState = _uiState.asStateFlow()
    
    init {
        refreshStore()
    }
    
    fun refreshStore() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                // Fetch plugins from the real marketplace
                val marketplacePlugins = marketplaceRepository.getPlugins()
                
                // Convert marketplace plugins to local plugin models
                val plugins = marketplacePlugins.map { marketplaceRepository.toPlugin(it) }
                
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        availablePlugins = plugins
                    ) 
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false, 
                        error = "Ошибка загрузки плагинов: ${e.message}"
                    ) 
                }
            }
        }
    }
    
    fun searchPlugins(query: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                // Search plugins in the marketplace
                val marketplacePlugins = marketplaceRepository.searchPlugins(query)
                
                // Convert marketplace plugins to local plugin models
                val plugins = marketplacePlugins.map { marketplaceRepository.toPlugin(it) }
                
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        availablePlugins = plugins
                    ) 
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false, 
                        error = "Ошибка поиска плагинов: ${e.message}"
                    ) 
                }
            }
        }
    }
    
    fun installPlugin(plugin: Plugin) {
        viewModelScope.launch {
            try {
                // Get plugin download URL
                val downloadUrl = marketplaceRepository.getPluginDownloadUrl(plugin.id)
                
                if (downloadUrl != null) {
                    // Download plugin file
                    val pluginFile = downloadPluginFile(downloadUrl)
                    
                    if (pluginFile != null) {
                        // Install the plugin
                        val result = pluginRepository.installPlugin(pluginFile.absolutePath)
                        
                        if (result.success) {
                            _uiState.update { it.copy(error = "Плагин успешно установлен") }
                            // Refresh the store to update installed status
                            refreshStore()
                        } else {
                            _uiState.update { it.copy(error = result.error) }
                        }
                    } else {
                        _uiState.update { it.copy(error = "Не удалось загрузить плагин") }
                    }
                } else {
                    _uiState.update { it.copy(error = "Не удалось получить URL для загрузки плагина") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "Ошибка установки плагина: ${e.message}") }
            }
        }
    }
    
    private suspend fun downloadPluginFile(downloadUrl: String): File? {
        return try {
            val url = URL(downloadUrl)
            val tempFile = File.createTempFile("plugin_", ".zip")
            url.openStream().use { input ->
                tempFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
            tempFile
        } catch (e: Exception) {
            null
        }
    }
    
    fun setError(message: String) {
        _uiState.update { it.copy(error = message) }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}

data class PluginStoreUiState(
    val availablePlugins: List<Plugin> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)