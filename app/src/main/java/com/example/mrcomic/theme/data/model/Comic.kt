package com.example.mrcomic.theme.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName
import androidx.room.TypeConverters
import androidx.room.TypeConverter

/**
 * Модель данных для комикса
 */
@Entity(tableName = "comics")
@TypeConverters(Comic.LabelsConverter::class)
data class Comic(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("title")
    val title: String,

    @SerializedName("author")
    val author: String?,

    @SerializedName("filePath")
    val filePath: String,

    @SerializedName("format")
    val format: String, // CBZ, PDF, EPUB, CBR, MOBI

    @SerializedName("coverImage")
    val coverImage: String?, // путь к изображению или base64

    @SerializedName("addedAt")
    val addedAt: String,

    @SerializedName("lastOpenedAt")
    val lastOpenedAt: String?,

    @SerializedName("isFavorite")
    val isFavorite: Boolean = false,

    @SerializedName("collectionId")
    val collectionId: String? = null,

    @SerializedName("metadata")
    val metadata: String? = null, // JSON с дополнительными метаданными

    @SerializedName("labels")
    val labels: List<String> = emptyList()
) {
    class LabelsConverter {
        @TypeConverter
        fun fromLabels(labels: List<String>?): String =
            labels?.joinToString(",") ?: ""
        @TypeConverter
        fun toLabels(data: String?): List<String> =
            data?.split(",")?.filter { it.isNotBlank() } ?: emptyList()
    }
} 