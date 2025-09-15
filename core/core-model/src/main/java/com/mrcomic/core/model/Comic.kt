package com.mrcomic.core.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

@Entity(tableName = "comics")
@TypeConverters(Converters::class)
data class Comic(
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
    val format: ComicFormat,
    val tags: List<String> = emptyList(),
    val description: String? = null,
    val publisher: String? = null,
    val publicationDate: String? = null,
    val language: String = "ru"
)

enum class ComicFormat {
    CBZ, CBR, PDF, UNKNOWN
}

enum class ReadingMode {
    PAGE_BY_PAGE,
    DOUBLE_PAGE,
    VERTICAL_SCROLL,
    CONTINUOUS_SCROLL
}

enum class ReadingDirection {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM
}

enum class ScalingMode {
    FIT_WIDTH,
    FIT_HEIGHT,
    ORIGINAL_SIZE,
    SMART_FIT
}

enum class ImageQuality {
    LOW,
    MEDIUM,
    HIGH,
    ORIGINAL
}

enum class AppTheme {
    LIGHT,
    DARK,
    SYSTEM
}

enum class OCREngine {
    ML_KIT,
    TESSERACT,
    PADDLE_OCR,
    EASY_OCR
}

enum class CloudProvider {
    GOOGLE_DRIVE,
    DROPBOX,
    ONEDRIVE,
    NEXTCLOUD,
    WEBDAV
}

enum class BackupSchedule {
    DAILY,
    WEEKLY,
    MONTHLY,
    MANUAL
}

class Converters {
    @TypeConverter
    fun fromStringList(value: List<String>): String {
        return Gson().toJson(value)
    }

    @TypeConverter
    fun toStringList(value: String): List<String> {
        return try {
            Gson().fromJson<List<String>>(
                value,
                object : TypeToken<List<String>>() {}.type
            ) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    @TypeConverter
    fun fromComicFormat(format: ComicFormat): String = format.name

    @TypeConverter
    fun toComicFormat(format: String): ComicFormat {
        return try {
            ComicFormat.valueOf(format)
        } catch (e: Exception) {
            ComicFormat.UNKNOWN
        }
    }
}