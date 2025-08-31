package com.example.feature.plugins.domain

import com.example.feature.plugins.model.PluginResult
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonSyntaxException
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PluginJsonValidator @Inject constructor(
    private val gson: Gson
) {
    
    /**
     * Валидация plugin.json файла
     */
    fun validatePluginJson(pluginJsonFile: File): PluginResult<JsonObject> {
        return try {
            val jsonContent = pluginJsonFile.readText()
            val jsonObject = gson.fromJson(jsonContent, JsonObject::class.java)
            
            // Проверка обязательных полей
            val requiredFields = listOf("id", "name", "version", "author", "description", "type")
            for (field in requiredFields) {
                if (!jsonObject.has(field)) {
                    return PluginResult.error("Отсутствует обязательное поле: $field")
                }
            }
            
            // Проверка формата ID
            val id = jsonObject.get("id").asString
            if (!isValidPluginId(id)) {
                return PluginResult.error("Неверный формат ID плагина")
            }
            
            // Проверка версии
            val version = jsonObject.get("version").asString
            if (!isValidVersion(version)) {
                return PluginResult.error("Неверный формат версии плагина")
            }
            
            // Проверка типа плагина
            val type = jsonObject.get("type").asString
            if (!isValidPluginType(type)) {
                return PluginResult.error("Неверный тип плагина: $type")
            }
            
            // Проверка категории (если указана)
            if (jsonObject.has("category")) {
                val category = jsonObject.get("category").asString
                if (!isValidPluginCategory(category)) {
                    return PluginResult.error("Неверная категория плагина: $category")
                }
            }
            
            // Проверка разрешений (если указаны)
            if (jsonObject.has("permissions")) {
                val permissions = jsonObject.getAsJsonArray("permissions")
                for (permission in permissions) {
                    if (!isValidPluginPermission(permission.asString)) {
                        return PluginResult.error("Неверное разрешение плагина: ${permission.asString}")
                    }
                }
            }
            
            PluginResult.success(jsonObject)
        } catch (e: JsonSyntaxException) {
            PluginResult.error("Неверный формат JSON: ${e.message}")
        } catch (e: Exception) {
            PluginResult.error("Ошибка валидации plugin.json: ${e.message}")
        }
    }
    
    /**
     * Проверка валидности ID плагина
     */
    private fun isValidPluginId(id: String): Boolean {
        return id.matches(Regex("^[a-zA-Z0-9._-]+$")) && id.length <= 100
    }
    
    /**
     * Проверка валидности версии
     */
    private fun isValidVersion(version: String): Boolean {
        return version.matches(Regex("^[0-9]+(\\.[0-9]+)*$"))
    }
    
    /**
     * Проверка валидности типа плагина
     */
    private fun isValidPluginType(type: String): Boolean {
        return type in listOf("JAVASCRIPT", "NATIVE", "HYBRID")
    }
    
    /**
     * Проверка валидности категории плагина
     */
    private fun isValidPluginCategory(category: String): Boolean {
        return category in listOf(
            "READER_ENHANCEMENT",
            "IMAGE_PROCESSING", 
            "TRANSLATION",
            "EXPORT",
            "UTILITY",
            "THEME",
            "FORMAT_SUPPORT",
            "INTEGRATION"
        )
    }
    
    /**
     * Проверка валидности разрешений плагина
     */
    private fun isValidPluginPermission(permission: String): Boolean {
        return permission in listOf(
            "READ_FILES",
            "WRITE_FILES",
            "NETWORK_ACCESS",
            "CAMERA_ACCESS",
            "STORAGE_ACCESS",
            "SYSTEM_SETTINGS",
            "READER_CONTROL",
            "UI_MODIFICATION"
        )
    }
}