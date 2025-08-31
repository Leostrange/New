package com.example.core.data.database

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface NoteDao {
    
    @Query("SELECT * FROM notes ORDER BY lastModified DESC")
    fun getAllNotes(): Flow<List<NoteEntity>>
    
    @Query("SELECT * FROM notes WHERE comicId = :comicId ORDER BY page ASC, timestamp ASC")
    fun getNotesForComic(comicId: String): Flow<List<NoteEntity>>
    
    @Query("SELECT * FROM notes WHERE comicId = :comicId AND page = :page ORDER BY timestamp ASC")
    fun getNotesForPage(comicId: String, page: Int): Flow<List<NoteEntity>>
    
    @Query("SELECT * FROM notes WHERE id = :id")
    suspend fun getNoteById(id: Long): NoteEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: NoteEntity): Long
    
    @Update
    suspend fun updateNote(note: NoteEntity)
    
    @Delete
    suspend fun deleteNote(note: NoteEntity)
    
    @Query("DELETE FROM notes WHERE id = :id")
    suspend fun deleteNoteById(id: Long)
    
    @Query("DELETE FROM notes WHERE comicId = :comicId")
    suspend fun deleteNotesForComic(comicId: String)
    
    @Query("DELETE FROM notes WHERE comicId = :comicId AND page = :page")
    suspend fun deleteNotesForPage(comicId: String, page: Int)
    
    @Query("SELECT COUNT(*) FROM notes WHERE comicId = :comicId")
    suspend fun getNoteCountForComic(comicId: String): Int
    
    @Query("SELECT COUNT(*) FROM notes WHERE comicId = :comicId AND page = :page")
    suspend fun getNoteCountForPage(comicId: String, page: Int): Int
    
    @Query("SELECT * FROM notes WHERE content LIKE '%' || :searchText || '%' OR title LIKE '%' || :searchText || '%' ORDER BY lastModified DESC")
    fun searchNotes(searchText: String): Flow<List<NoteEntity>>
}