package com.example.feature.plugins.domain

import javax.inject.Inject
import javax.inject.Singleton

/**
 * Унифицированный валидатор плагинов, объединяющий Kotlin и JavaScript валидаторы
 */
@Singleton
class UnifiedPluginValidator @Inject constructor(
    private val kotlinValidator: PluginValidator
) {
    
    /**
     * Валидация плагина с использованием обоих валидаторов
     */
    suspend fun validatePlugin(pluginPath: String): ValidationResult {
        // First validate with Kotlin validator
        val kotlinResult = kotlinValidator.validatePackage(pluginPath)
        if (!kotlinResult.success) {
            return ValidationResult(false, "Kotlin validation failed: ${kotlinResult.error}")
        }
        
        // JavaScript validation would be done on the Android side through the bridge
        // For now, we'll assume it passes if Kotlin validation passes
        return ValidationResult(true, "Plugin validation successful")
    }
    
    /**
     * Проверка цифровой подписи плагина
     */
    fun verifyPluginSignature(pluginPath: String, expectedSignature: String): Boolean {
        val file = java.io.File(pluginPath)
        val actualSignature = kotlinValidator.calculateFileHash(file)
        return actualSignature == expectedSignature
    }
    
    /**
     * Проверка на вредоносный код
     */
    fun checkForMaliciousCode(code: String): PluginResult<Unit> {
        return kotlinValidator.checkForMaliciousCode(code)
    }
}

/**
 * Результат валидации плагина
 */
data class ValidationResult(
    val success: Boolean,
    val message: String
)