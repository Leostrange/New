package com.mrcomic.core.database.dao

import androidx.room.*
import com.mrcomic.core.database.entity.OCRResultEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface OCRResultDao {
    @Query("SELECT * FROM ocr_results WHERE comicId = :comicId ORDER BY pageNumber ASC")
    fun getOCRResultsForComic(comicId: String): Flow<List<OCRResultEntity>>
    
    @Query("SELECT * FROM ocr_results WHERE comicId = :comicId AND pageNumber = :pageNumber")
    suspend fun getOCRResultsForPage(comicId: String, pageNumber: Int): List<OCRResultEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOCRResult(ocrResult: OCRResultEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOCRResults(ocrResults: List<OCRResultEntity>)
    
    @Update
    suspend fun updateOCRResult(ocrResult: OCRResultEntity)
    
    @Delete
    suspend fun deleteOCRResult(ocrResult: OCRResultEntity)
    
    @Query("DELETE FROM ocr_results WHERE comicId = :comicId")
    suspend fun deleteOCRResultsForComic(comicId: String)
    
    @Query("SELECT COUNT(*) FROM ocr_results WHERE comicId = :comicId")
    suspend fun getOCRResultCount(comicId: String): Int
}
