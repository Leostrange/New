package com.mrcomic.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    fun signIn(email: String, password: String) {
        if (!validateInput(email, password)) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val result = authRepository.signIn(email, password)
                if (result.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isAuthenticated = true
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.exceptionOrNull()?.message ?: "Ошибка входа"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Неизвестная ошибка"
                )
            }
        }
    }
    
    private fun validateInput(email: String, password: String): Boolean {
        var hasError = false
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.value = _uiState.value.copy(emailError = "Неверный формат email")
            hasError = true
        } else {
            _uiState.value = _uiState.value.copy(emailError = null)
        }
        
        if (password.length < 8) {
            _uiState.value = _uiState.value.copy(passwordError = "Пароль должен содержать минимум 8 символов")
            hasError = true
        } else {
            _uiState.value = _uiState.value.copy(passwordError = null)
        }
        
        return !hasError
    }
}

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val error: String? = null,
    val emailError: String? = null,
    val passwordError: String? = null
)

interface AuthRepository {
    suspend fun signIn(email: String, password: String): Result<Unit>
    suspend fun signOut(): Result<Unit>
    suspend fun getCurrentUser(): Result<User?>
}

data class User(
    val id: String,
    val email: String,
    val displayName: String?
)
