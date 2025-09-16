package com.mrcomic.core.database.dao

import androidx.room.*
import com.mrcomic.core.database.entity.ComicEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ComicDao {
    @Query("SELECT * FROM comics ORDER BY lastReadTime DESC")
    fun getAllComics(): Flow<List<ComicEntity>>

    @Query("SELECT * FROM comics WHERE isFavorite = 1")
    fun getFavoriteComics(): Flow<List<ComicEntity>>

    @Query("SELECT * FROM comics WHERE isDownloaded = 1")
    fun getDownloadedComics(): Flow<List<ComicEntity>>

    @Query("SELECT * FROM comics WHERE id = :id")
    suspend fun getComicById(id: String): ComicEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertComic(comic: ComicEntity)

    @Update
    suspend fun updateComic(comic: ComicEntity)

    @Delete
    suspend fun deleteComic(comic: ComicEntity)

    @Query("UPDATE comics SET currentPage = :page, lastReadTime = :time WHERE id = :id")
    suspend fun updateReadingProgress(id: String, page: Int, time: Long)
}
