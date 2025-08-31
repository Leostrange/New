package com.example.core.model

import com.google.gson.annotations.SerializedName

/**
 * Data class representing the structure of a library export
 * This will be serialized to JSON for export/import functionality
 */
data class LibraryExport(
    @SerializedName("version")
    val version: String = "1.0",
    
    @SerializedName("exportDate")
    val exportDate: Long = System.currentTimeMillis(),
    
    @SerializedName("comics")
    val comics: List<ExportedComic> = emptyList(),
    
    @SerializedName("bookmarks")
    val bookmarks: List<ExportedBookmark> = emptyList()
)

/**
 * Data class representing an exported comic
 */
data class ExportedComic(
    @SerializedName("title")
    val title: String,
    
    @SerializedName("author")
    val author: String,
    
    @SerializedName("filePath")
    val filePath: String,
    
    @SerializedName("coverPath")
    val coverPath: String? = null,
    
    @SerializedName("dateAdded")
    val dateAdded: Long
)

/**
 * Data class representing an exported bookmark
 */
data class ExportedBookmark(
    @SerializedName("comicId")
    val comicId: String,
    
    @SerializedName("page")
    val page: Int,
    
    @SerializedName("label")
    val label: String?,
    
    @SerializedName("timestamp")
    val timestamp: Long = System.currentTimeMillis()
)