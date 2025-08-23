package com.example.feature.plugins.domain

import com.example.feature.plugins.model.PluginResult
import java.io.File
import java.security.MessageDigest
import java.util.zip.ZipFile
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PluginValidator @Inject constructor() {
    
    // Максимальный размер плагина (10 МБ)
    private val maxPluginSize = 10 * 1024 * 1024
    
    // Разрешенные расширения файлов
    private val allowedExtensions = setOf(".js", ".zip", ".jar")
    
    // Запрещенные паттерны в коде
    private val forbiddenPatterns = listOf(
        "eval\\s*\\(",
        "Function\\s*\\(",
        "document\\.cookie",
        "localStorage",
        "sessionStorage",
        "fetch\\s*\\(",
        "XMLHttpRequest",
        "import\\s+.*\\s+from",
        "require\\s*\\(",
        "process\\.",
        "__dirname",
        "__filename"
    )
    
    /**
     * Валидация пакета плагина
     */
    fun validatePackage(packagePath: String): PluginResult<Unit> {
        val file = File(packagePath)
        
        // Проверка существования файла
        if (!file.exists()) {
            return PluginResult.error("Файл плагина не найден")
        }
        
        // Проверка размера файла
        if (file.length() > maxPluginSize) {
            return PluginResult.error("Размер плагина превышает допустимый (${maxPluginSize / 1024 / 1024} МБ)")
        }
        
        // Проверка расширения файла
        val extension = file.extension.lowercase()
        if (!allowedExtensions.any { it.removePrefix(".") == extension }) {
            return PluginResult.error("Неподдерживаемый тип файла: .$extension")
        }
        
        // Валидация содержимого в зависимости от типа
        return when (extension) {
            "js" -> validateJavaScriptFile(file)
            "zip" -> validateZipFile(file)
            "jar" -> validateJarFile(file)
            else -> PluginResult.error("Неизвестный тип файла")
        }
    }
    
    /**
     * Валидация JavaScript файла
     */
    private fun validateJavaScriptFile(file: File): PluginResult<Unit> {
        return try {
            val content = file.readText()
            
            // Проверка на запрещенные паттерны
            val violations = findSecurityViolations(content)
            if (violations.isNotEmpty()) {
                return PluginResult.error("Обнаружены небезопасные конструкции: ${violations.joinToString(", ")}")
            }
            
            // Проверка синтаксиса JavaScript (базовая)
            if (!isValidJavaScript(content)) {
                return PluginResult.error("Синтаксическая ошибка в JavaScript коде")
            }
            
            PluginResult.success(Unit)
        } catch (e: Exception) {
            PluginResult.error("Ошибка чтения JavaScript файла: ${e.message}")
        }
    }
    
    /**
     * Валидация ZIP архива
     */
    private fun validateZipFile(file: File): PluginResult<Unit> {
        return try {
            ZipFile(file).use { zipFile ->
                var hasPluginJson = false
                var hasMainScript = false
                
                for (entry in zipFile.entries()) {
                    // Проверка имени файла на безопасность
                    if (entry.name.contains("..") || entry.name.startsWith("/")) {
                        return PluginResult.error("Небезопасный путь к файлу: ${entry.name}")
                    }
                    
                    // Проверка на наличие обязательных файлов
                    when {
                        entry.name == "plugin.json" -> hasPluginJson = true
                        entry.name.endsWith(".js") && entry.name == "main.js" -> hasMainScript = true
                    }
                    
                    // Проверка размера распакованного файла
                    if (entry.size > maxPluginSize) {
                        return PluginResult.error("Размер файла ${entry.name} превышает допустимый")
                    }
                    
                    // Валидация JavaScript файлов в архиве
                    if (entry.name.endsWith(".js")) {
                        val content = zipFile.getInputStream(entry).bufferedReader().use { it.readText() }
                        val violations = findSecurityViolations(content)
                        if (violations.isNotEmpty()) {
                            return PluginResult.error("Небезопасный код в ${entry.name}: ${violations.joinToString(", ")}")
                        }
                    }
                }
                
                // Проверка наличия обязательных файлов
                if (!hasPluginJson) {
                    return PluginResult.error("Отсутствует файл plugin.json")
                }
                
                if (!hasMainScript) {
                    return PluginResult.error("Отсутствует главный файл main.js")
                }
                
                PluginResult.success(Unit)
            }
        } catch (e: Exception) {
            PluginResult.error("Ошибка валидации ZIP файла: ${e.message}")
        }
    }
    
    /**
     * Валидация JAR файла
     */
    private fun validateJarFile(file: File): PluginResult<Unit> {
        // В будущем здесь будет валидация JAR файлов для нативных плагинов
        return PluginResult.error("JAR плагины пока не поддерживаются")
    }
    
    /**
     * Поиск нарушений безопасности в коде
     */
    private fun findSecurityViolations(code: String): List<String> {
        val violations = mutableListOf<String>()
        
        for (pattern in forbiddenPatterns) {
            val regex = Regex(pattern, RegexOption.IGNORE_CASE)
            if (regex.containsMatchIn(code)) {
                violations.add(pattern)
            }
        }
        
        return violations
    }
    
    /**
     * Базовая проверка синтаксиса JavaScript
     */
    private fun isValidJavaScript(code: String): Boolean {
        return try {
            // Простые проверки синтаксиса
            val openBraces = code.count { it == '{' }
            val closeBraces = code.count { it == '}' }
            val openParens = code.count { it == '(' }
            val closeParens = code.count { it == ')' }
            val openBrackets = code.count { it == '[' }
            val closeBrackets = code.count { it == ']' }
            
            openBraces == closeBraces && 
            openParens == closeParens && 
            openBrackets == closeBrackets
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Вычисление хеша файла для проверки целостности
     */
    fun calculateFileHash(file: File): String {
        return try {
            val digest = MessageDigest.getInstance("SHA-256")
            val bytes = file.readBytes()
            val hashBytes = digest.digest(bytes)
            hashBytes.joinToString("") { "%02x".format(it) }
        } catch (e: Exception) {
            ""
        }
    }
    
    /**
     * Проверка цифровой подписи плагина
     */
    fun verifySignature(file: File, expectedSignature: String): Boolean {
        // В будущем здесь будет проверка цифровой подписи
        return true
    }
}