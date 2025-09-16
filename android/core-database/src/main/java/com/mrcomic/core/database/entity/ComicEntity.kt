package com.mrcomic.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.mrcomic.core.database.converter.StringListConverter

@Entity(tableName = "comics")
@TypeConverters(StringListConverter::class)
data class ComicEntity(
    @PrimaryKey val id: String,
    val title: String,
    val author: String? = null,
    val filePath: String,
    val coverPath: String? = null,
    val pageCount: Int = 0,
    val currentPage: Int = 0,
    val readingProgress: Float = 0f,
    val dateAdded: Long = System.currentTimeMillis(),
    val lastRead: Long? = null,
    val isFavorite: Boolean = false,
    val genre: String? = null,
    val fileSize: Long = 0,
    val format: String, // ComicFormat as String
    val tags: List<String> = emptyList()
)

@Entity(
    tableName = "ocr_results",
    foreignKeys = [androidx.room.ForeignKey(
        entity = ComicEntity::class,
        parentColumns = ["id"],
        childColumns = ["comicId"],
        onDelete = androidx.room.ForeignKey.CASCADE
    )]
)
data class OCRResultEntity(
    @PrimaryKey val id: String,
    val comicId: String,
    val pageNumber: Int,
    val boundingBoxLeft: Int,
    val boundingBoxTop: Int,
    val boundingBoxRight: Int,
    val boundingBoxBottom: Int,
    val originalText: String,
    val translatedText: String? = null,
    val confidence: Float,
    val language: String,
    val timestamp: Long = System.currentTimeMillis()
)
