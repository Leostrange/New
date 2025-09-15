package com.mrcomic.core.database.dao

import androidx.room.*
import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.ComicFormat
import kotlinx.coroutines.flow.Flow

@Dao
interface ComicDao {
    
    @Query("SELECT * FROM comics ORDER BY dateAdded DESC")
    fun getAllComics(): Flow<List<Comic>>
    
    @Query("SELECT * FROM comics WHERE id = :id")
    suspend fun getComicById(id: String): Comic?
    
    @Query("SELECT * FROM comics WHERE isFavorite = 1 ORDER BY lastRead DESC")
    fun getFavoriteComics(): Flow<List<Comic>>
    
    @Query("SELECT * FROM comics WHERE readingProgress > 0 AND readingProgress < 1 ORDER BY lastRead DESC")
    fun getInProgressComics(): Flow<List<Comic>>
    
    @Query("SELECT * FROM comics WHERE readingProgress = 1 ORDER BY lastRead DESC")
    fun getCompletedComics(): Flow<List<Comic>>
    
    @Query("""
        SELECT * FROM comics 
        WHERE title LIKE '%' || :query || '%' 
        OR author LIKE '%' || :query || '%' 
        OR genre LIKE '%' || :query || '%'
        ORDER BY 
            CASE WHEN title LIKE :query || '%' THEN 1 ELSE 2 END,
            title ASC
    """)
    fun searchComics(query: String): Flow<List<Comic>>
    
    @Query("SELECT * FROM comics WHERE format = :format ORDER BY dateAdded DESC")
    fun getComicsByFormat(format: ComicFormat): Flow<List<Comic>>
    
    @Query("SELECT * FROM comics WHERE genre = :genre ORDER BY dateAdded DESC")
    fun getComicsByGenre(genre: String): Flow<List<Comic>>
    
    @Query("SELECT DISTINCT genre FROM comics WHERE genre IS NOT NULL ORDER BY genre ASC")
    suspend fun getAllGenres(): List<String>
    
    @Query("SELECT DISTINCT author FROM comics WHERE author IS NOT NULL ORDER BY author ASC")
    suspend fun getAllAuthors(): List<String>
    
    @Query("UPDATE comics SET currentPage = :page, readingProgress = :progress, lastRead = :timestamp WHERE id = :id")
    suspend fun updateReadingProgress(id: String, page: Int, progress: Float, timestamp: Long)
    
    @Query("UPDATE comics SET isFavorite = :isFavorite WHERE id = :id")
    suspend fun updateFavoriteStatus(id: String, isFavorite: Boolean)
    
    @Query("SELECT COUNT(*) FROM comics")
    suspend fun getTotalComicsCount(): Int
    
    @Query("SELECT COUNT(*) FROM comics WHERE readingProgress > 0")
    suspend fun getReadComicsCount(): Int
    
    @Query("SELECT AVG(readingProgress) FROM comics WHERE readingProgress > 0")
    suspend fun getAverageReadingProgress(): Float
    
    @Query("SELECT SUM(fileSize) FROM comics")
    suspend fun getTotalLibrarySize(): Long
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertComic(comic: Comic)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertComics(comics: List<Comic>)
    
    @Update
    suspend fun updateComic(comic: Comic)
    
    @Delete
    suspend fun deleteComic(comic: Comic)
    
    @Query("DELETE FROM comics WHERE id = :id")
    suspend fun deleteComicById(id: String)
    
    @Query("DELETE FROM comics")
    suspend fun deleteAllComics()
    
    // Full-text search queries
    @Query("""
        SELECT * FROM comics 
        WHERE comics MATCH :query 
        ORDER BY rank
    """)
    fun fullTextSearch(query: String): Flow<List<Comic>>
    
    // Statistics queries
    @Query("""
        SELECT genre, COUNT(*) as count 
        FROM comics 
        WHERE genre IS NOT NULL 
        GROUP BY genre 
        ORDER BY count DESC 
        LIMIT 10
    """)
    suspend fun getTopGenres(): List<GenreCount>
    
    @Query("""
        SELECT author, COUNT(*) as count 
        FROM comics 
        WHERE author IS NOT NULL 
        GROUP BY author 
        ORDER BY count DESC 
        LIMIT 10
    """)
    suspend fun getTopAuthors(): List<AuthorCount>
}

data class GenreCount(
    val genre: String,
    val count: Int
)

data class AuthorCount(
    val author: String,
    val count: Int
)