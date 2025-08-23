package com.example.feature.plugins.data.mapper

import com.example.feature.plugins.data.local.PluginEntity
import com.example.feature.plugins.model.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

private val gson = Gson()

fun PluginEntity.toDomain(): Plugin {
    val permissionsList = try {
        gson.fromJson<List<String>>(
            permissions,
            object : TypeToken<List<String>>() {}.type
        ).map { PluginPermission.valueOf(it) }
    } catch (e: Exception) {
        emptyList()
    }
    
    val dependenciesList = try {
        gson.fromJson<List<String>>(
            dependencies,
            object : TypeToken<List<String>>() {}.type
        )
    } catch (e: Exception) {
        emptyList()
    }
    
    val metadataMap = try {
        gson.fromJson<Map<String, String>>(
            metadata,
            object : TypeToken<Map<String, String>>() {}.type
        )
    } catch (e: Exception) {
        emptyMap()
    }
    
    return Plugin(
        id = id,
        name = name,
        version = version,
        author = author,
        description = description,
        category = PluginCategory.valueOf(category),
        type = PluginType.valueOf(type),
        permissions = permissionsList,
        dependencies = dependenciesList,
        isEnabled = isEnabled,
        isInstalled = isInstalled,
        configurable = configurable,
        iconUrl = iconUrl,
        sourceUrl = sourceUrl,
        packagePath = packagePath,
        metadata = metadataMap
    )
}

fun Plugin.toEntity(): PluginEntity {
    val currentTime = System.currentTimeMillis()
    
    return PluginEntity(
        id = id,
        name = name,
        version = version,
        author = author,
        description = description,
        category = category.name,
        type = type.name,
        permissions = gson.toJson(permissions.map { it.name }),
        dependencies = gson.toJson(dependencies),
        isEnabled = isEnabled,
        isInstalled = isInstalled,
        configurable = configurable,
        iconUrl = iconUrl,
        sourceUrl = sourceUrl,
        packagePath = packagePath,
        metadata = gson.toJson(metadata),
        installDate = currentTime,
        lastUpdateDate = currentTime
    )
}