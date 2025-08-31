package com.example.feature.plugins.data.model

import com.example.feature.plugins.model.PluginCategory
import com.example.feature.plugins.model.PluginType
import com.google.gson.annotations.SerializedName

/**
 * Data model for plugin from marketplace
 */
data class MarketplacePlugin(
    @SerializedName("id")
    val id: String,
    
    @SerializedName("name")
    val name: String,
    
    @SerializedName("version")
    val version: String,
    
    @SerializedName("author")
    val author: String,
    
    @SerializedName("description")
    val description: String,
    
    @SerializedName("category")
    val category: PluginCategory,
    
    @SerializedName("type")
    val type: PluginType,
    
    @SerializedName("download_url")
    val downloadUrl: String,
    
    @SerializedName("size")
    val size: Long,
    
    @SerializedName("rating")
    val rating: Float,
    
    @SerializedName("downloads")
    val downloads: Int,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String,
    
    @SerializedName("is_installed")
    val isInstalled: Boolean = false,
    
    @SerializedName("is_compatible")
    val isCompatible: Boolean = true
)