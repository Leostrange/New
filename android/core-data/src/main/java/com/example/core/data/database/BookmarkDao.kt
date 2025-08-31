package com.example.core.data.database

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface BookmarkDao {
    
    @Query("SELECT * FROM bookmarks ORDER BY timestamp DESC")
    fun getAllBookmarks(): Flow<List<BookmarkEntity>>
    
    @Query("SELECT * FROM bookmarks WHERE comicId = :comicId ORDER BY page ASC")
    fun getBookmarksForComic(comicId: String): Flow<List<BookmarkEntity>>
    
    @Query("SELECT * FROM bookmarks WHERE comicId = :comicId AND page = :page LIMIT 1")
    suspend fun getBookmarkForPage(comicId: String, page: Int): BookmarkEntity?
    
    @Query("SELECT * FROM bookmarks WHERE id = :id")
    suspend fun getBookmarkById(id: Long): BookmarkEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookmark(bookmark: BookmarkEntity): Long
    
    @Update
    suspend fun updateBookmark(bookmark: BookmarkEntity)
    
    @Delete
    suspend fun deleteBookmark(bookmark: BookmarkEntity)
    
    @Query("DELETE FROM bookmarks WHERE id = :id")
    suspend fun deleteBookmarkById(id: Long)
    
    @Query("DELETE FROM bookmarks WHERE comicId = :comicId")
    suspend fun deleteBookmarksForComic(comicId: String)
    
    @Query("SELECT COUNT(*) FROM bookmarks WHERE comicId = :comicId")
    suspend fun getBookmarkCountForComic(comicId: String): Int
    
    @Query("SELECT EXISTS(SELECT 1 FROM bookmarks WHERE comicId = :comicId AND page = :page)")
    suspend fun isPageBookmarked(comicId: String, page: Int): Boolean
}