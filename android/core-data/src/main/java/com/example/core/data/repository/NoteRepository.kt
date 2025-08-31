package com.example.core.data.repository

import com.example.core.data.database.NoteDao
import com.example.core.data.database.NoteEntity
import com.example.core.model.Note
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NoteRepository @Inject constructor(
    private val noteDao: NoteDao
) {
    
    fun getAllNotes(): Flow<List<Note>> = 
        noteDao.getAllNotes().map { entities ->
            entities.map { it.toNote() }
        }
    
    fun getNotesForComic(comicId: String): Flow<List<Note>> = 
        noteDao.getNotesForComic(comicId).map { entities ->
            entities.map { it.toNote() }
        }
    
    fun getNotesForPage(comicId: String, page: Int): Flow<List<Note>> = 
        noteDao.getNotesForPage(comicId, page).map { entities ->
            entities.map { it.toNote() }
        }
    
    suspend fun getNoteById(id: String): Note? =
        noteDao.getNoteById(id.toLongOrNull() ?: return null)?.toNote()
    
    suspend fun addNote(
        comicId: String, 
        page: Int, 
        content: String, 
        title: String? = null,
        positionX: Float? = null,
        positionY: Float? = null
    ): Long {
        val note = NoteEntity(
            comicId = comicId,
            page = page,
            content = content,
            title = title,
            positionX = positionX,
            positionY = positionY,
            timestamp = System.currentTimeMillis(),
            lastModified = System.currentTimeMillis()
        )
        return noteDao.insertNote(note)
    }
    
    suspend fun updateNote(note: Note) {
        val entity = note.toNoteEntity().copy(lastModified = System.currentTimeMillis())
        noteDao.updateNote(entity)
    }
    
    suspend fun deleteNote(note: Note) {
        val entity = note.toNoteEntity()
        noteDao.deleteNote(entity)
    }
    
    suspend fun deleteNoteById(id: String) {
        val longId = id.toLongOrNull() ?: return
        noteDao.deleteNoteById(longId)
    }
    
    suspend fun deleteNotesForComic(comicId: String) {
        noteDao.deleteNotesForComic(comicId)
    }
    
    suspend fun deleteNotesForPage(comicId: String, page: Int) {
        noteDao.deleteNotesForPage(comicId, page)
    }
    
    suspend fun getNoteCountForComic(comicId: String): Int =
        noteDao.getNoteCountForComic(comicId)
    
    suspend fun getNoteCountForPage(comicId: String, page: Int): Int =
        noteDao.getNoteCountForPage(comicId, page)
    
    fun searchNotes(searchText: String): Flow<List<Note>> = 
        noteDao.searchNotes(searchText).map { entities ->
            entities.map { it.toNote() }
        }
}

// Extension functions for converting between entities and models
private fun NoteEntity.toNote(): Note = Note(
    id = id.toString(),
    comicId = comicId,
    page = page,
    content = content,
    title = title,
    positionX = positionX,
    positionY = positionY,
    timestamp = timestamp,
    lastModified = lastModified
)

private fun Note.toNoteEntity(): NoteEntity = NoteEntity(
    id = id.toLongOrNull() ?: 0,
    comicId = comicId,
    page = page,
    content = content,
    title = title,
    positionX = positionX,
    positionY = positionY,
    timestamp = timestamp,
    lastModified = lastModified
)