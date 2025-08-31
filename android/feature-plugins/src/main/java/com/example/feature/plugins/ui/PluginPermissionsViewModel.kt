package com.example.feature.plugins.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.feature.plugins.domain.PluginPermissionManager
import com.example.feature.plugins.model.Plugin
import com.example.feature.plugins.model.PluginPermission
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PluginPermissionsViewModel @Inject constructor(
    private val permissionManager: PluginPermissionManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(PluginPermissionsUiState())
    val uiState: StateFlow<PluginPermissionsUiState> = _uiState.asStateFlow()
    
    fun loadPluginPermissions(plugin: Plugin) {
        viewModelScope.launch {
            try {
                val grantedPermissions = permissionManager.getGrantedPermissions(plugin.id)
                _uiState.value = PluginPermissionsUiState(
                    grantedPermissions = grantedPermissions,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = PluginPermissionsUiState(
                    error = "Ошибка загрузки разрешений: ${e.message}",
                    isLoading = false
                )
            }
        }
    }
    
    fun togglePermission(pluginId: String, permission: PluginPermission, grant: Boolean) {
        viewModelScope.launch {
            try {
                if (grant) {
                    permissionManager.grantPermissions(pluginId, listOf(permission))
                } else {
                    permissionManager.revokePermissions(pluginId, listOf(permission))
                }
                
                // Update UI state
                val currentPermissions = _uiState.value.grantedPermissions.toMutableSet()
                if (grant) {
                    currentPermissions.add(permission)
                } else {
                    currentPermissions.remove(permission)
                }
                
                _uiState.value = _uiState.value.copy(
                    grantedPermissions = currentPermissions
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = "Ошибка изменения разрешения: ${e.message}"
                )
            }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class PluginPermissionsUiState(
    val grantedPermissions: Set<PluginPermission> = emptySet(),
    val isLoading: Boolean = true,
    val error: String? = null
)