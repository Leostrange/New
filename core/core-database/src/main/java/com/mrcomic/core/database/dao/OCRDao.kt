package com.mrcomic.core.database.dao

import androidx.room.*
import com.mrcomic.core.model.OCRResult
import com.mrcomic.core.model.TranslationCache
import kotlinx.coroutines.flow.Flow

@Dao
interface OCRDao {
    
    @Query("SELECT * FROM ocr_results WHERE comicId = :comicId ORDER BY pageNumber ASC")
    fun getOCRResultsForComic(comicId: String): Flow<List<OCRResult>>
    
    @Query("SELECT * FROM ocr_results WHERE comicId = :comicId AND pageNumber = :pageNumber")
    suspend fun getOCRResultsForPage(comicId: String, pageNumber: Int): List<OCRResult>
    
    @Query("SELECT * FROM ocr_results WHERE id = :id")
    suspend fun getOCRResultById(id: String): OCRResult?
    
    @Query("SELECT COUNT(*) FROM ocr_results WHERE comicId = :comicId")
    suspend fun getOCRResultsCountForComic(comicId: String): Int
    
    @Query("SELECT COUNT(*) FROM ocr_results WHERE translatedText IS NOT NULL")
    suspend fun getTranslatedResultsCount(): Int
    
    @Query("SELECT DISTINCT language FROM ocr_results ORDER BY language ASC")
    suspend fun getAllDetectedLanguages(): List<String>
    
    @Query("SELECT AVG(confidence) FROM ocr_results WHERE comicId = :comicId")
    suspend fun getAverageConfidenceForComic(comicId: String): Float
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOCRResult(result: OCRResult)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOCRResults(results: List<OCRResult>)
    
    @Update
    suspend fun updateOCRResult(result: OCRResult)
    
    @Query("UPDATE ocr_results SET translatedText = :translatedText WHERE id = :id")
    suspend fun updateTranslation(id: String, translatedText: String)
    
    @Delete
    suspend fun deleteOCRResult(result: OCRResult)
    
    @Query("DELETE FROM ocr_results WHERE comicId = :comicId")
    suspend fun deleteOCRResultsForComic(comicId: String)
    
    @Query("DELETE FROM ocr_results WHERE comicId = :comicId AND pageNumber = :pageNumber")
    suspend fun deleteOCRResultsForPage(comicId: String, pageNumber: Int)
    
    @Query("DELETE FROM ocr_results")
    suspend fun deleteAllOCRResults()
    
    // Translation cache methods
    @Query("SELECT * FROM translation_cache WHERE originalText = :originalText AND sourceLanguage = :sourceLanguage AND targetLanguage = :targetLanguage")
    suspend fun getCachedTranslation(originalText: String, sourceLanguage: String, targetLanguage: String): TranslationCache?
    
    @Query("SELECT * FROM translation_cache ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecentTranslations(limit: Int = 100): List<TranslationCache>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTranslationCache(cache: TranslationCache)
    
    @Query("DELETE FROM translation_cache WHERE timestamp < :timestamp")
    suspend fun deleteOldTranslationCache(timestamp: Long)
    
    @Query("DELETE FROM translation_cache")
    suspend fun deleteAllTranslationCache()
    
    @Query("SELECT COUNT(*) FROM translation_cache")
    suspend fun getTranslationCacheSize(): Int
    
    // Statistics queries
    @Query("""
        SELECT language, COUNT(*) as count 
        FROM ocr_results 
        GROUP BY language 
        ORDER BY count DESC
    """)
    suspend fun getLanguageStatistics(): List<LanguageCount>
    
    @Query("""
        SELECT provider, COUNT(*) as count 
        FROM translation_cache 
        GROUP BY provider 
        ORDER BY count DESC
    """)
    suspend fun getTranslationProviderStatistics(): List<ProviderCount>
}

data class LanguageCount(
    val language: String,
    val count: Int
)

data class ProviderCount(
    val provider: String,
    val count: Int
)