package com.example.core.data.database.plugins

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "plugins")
data class PluginEntity(
    @PrimaryKey val id: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val category: String,
    val type: String,
    val permissions: String, // JSON строка
    val dependencies: String, // JSON строка
    val isEnabled: Boolean,
    val isInstalled: Boolean,
    val configurable: Boolean,
    val iconUrl: String?,
    val sourceUrl: String?,
    val packagePath: String?,
    val metadata: String, // JSON строка
    val installDate: Long,
    val lastUpdateDate: Long
)

