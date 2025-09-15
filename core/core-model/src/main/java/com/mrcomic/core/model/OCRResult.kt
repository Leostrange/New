package com.mrcomic.core.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import android.graphics.Rect
import com.google.gson.Gson

@Entity(
    tableName = "ocr_results",
    foreignKeys = [ForeignKey(
        entity = Comic::class,
        parentColumns = ["id"],
        childColumns = ["comicId"],
        onDelete = ForeignKey.CASCADE
    )]
)
@TypeConverters(OCRConverters::class)
data class OCRResult(
    @PrimaryKey val id: String,
    val comicId: String,
    val pageNumber: Int,
    val boundingBox: Rect,
    val originalText: String,
    val translatedText: String? = null,
    val confidence: Float,
    val language: String,
    val timestamp: Long = System.currentTimeMillis(),
    val engine: OCREngine = OCREngine.ML_KIT
)

@Entity(tableName = "translation_cache")
data class TranslationCache(
    @PrimaryKey val id: String,
    val originalText: String,
    val translatedText: String,
    val sourceLanguage: String,
    val targetLanguage: String,
    val provider: String,
    val timestamp: Long = System.currentTimeMillis()
)

data class OCRSettings(
    val engine: OCREngine = OCREngine.ML_KIT,
    val languages: List<String> = listOf("en", "ru", "ja"),
    val accuracy: Float = 0.9f,
    val useOfflineModels: Boolean = true,
    val autoTranslate: Boolean = false,
    val targetLanguage: String = "ru"
)

data class TranslationProvider(
    val id: String,
    val name: String,
    val apiKey: String?,
    val isEnabled: Boolean,
    val supportedLanguages: List<String>,
    val dailyLimit: Int?,
    val usedToday: Int = 0
)

class OCRConverters {
    @TypeConverter
    fun fromRect(rect: Rect): String {
        return Gson().toJson(
            mapOf(
                "left" to rect.left,
                "top" to rect.top,
                "right" to rect.right,
                "bottom" to rect.bottom
            )
        )
    }

    @TypeConverter
    fun toRect(rectString: String): Rect {
        return try {
            val map = Gson().fromJson(rectString, Map::class.java)
            Rect(
                (map["left"] as Double).toInt(),
                (map["top"] as Double).toInt(),
                (map["right"] as Double).toInt(),
                (map["bottom"] as Double).toInt()
            )
        } catch (e: Exception) {
            Rect(0, 0, 0, 0)
        }
    }

    @TypeConverter
    fun fromOCREngine(engine: OCREngine): String = engine.name

    @TypeConverter
    fun toOCREngine(engine: String): OCREngine {
        return try {
            OCREngine.valueOf(engine)
        } catch (e: Exception) {
            OCREngine.ML_KIT
        }
    }
}