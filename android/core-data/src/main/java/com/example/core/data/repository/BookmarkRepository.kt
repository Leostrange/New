package com.example.core.data.repository

import com.example.core.data.database.BookmarkDao
import com.example.core.data.database.BookmarkEntity
import com.example.core.model.Bookmark
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BookmarkRepository @Inject constructor(
    private val bookmarkDao: BookmarkDao
) {
    
    fun getAllBookmarks(): Flow<List<Bookmark>> = 
        bookmarkDao.getAllBookmarks().map { entities ->
            entities.map { it.toBookmark() }
        }
    
    fun getBookmarksForComic(comicId: String): Flow<List<Bookmark>> = 
        bookmarkDao.getBookmarksForComic(comicId).map { entities ->
            entities.map { it.toBookmark() }
        }
    
    suspend fun getBookmarkForPage(comicId: String, page: Int): Bookmark? =
        bookmarkDao.getBookmarkForPage(comicId, page)?.toBookmark()
    
    suspend fun getBookmarkById(id: String): Bookmark? =
        bookmarkDao.getBookmarkById(id.toLongOrNull() ?: return null)?.toBookmark()
    
    suspend fun addBookmark(comicId: String, page: Int, label: String? = null): Long {
        val bookmark = BookmarkEntity(
            comicId = comicId,
            page = page,
            label = label,
            timestamp = System.currentTimeMillis()
        )
        return bookmarkDao.insertBookmark(bookmark)
    }
    
    suspend fun updateBookmark(bookmark: Bookmark) {
        val entity = bookmark.toBookmarkEntity()
        bookmarkDao.updateBookmark(entity)
    }
    
    suspend fun deleteBookmark(bookmark: Bookmark) {
        val entity = bookmark.toBookmarkEntity()
        bookmarkDao.deleteBookmark(entity)
    }
    
    suspend fun deleteBookmarkById(id: String) {
        val longId = id.toLongOrNull() ?: return
        bookmarkDao.deleteBookmarkById(longId)
    }
    
    suspend fun deleteBookmarksForComic(comicId: String) {
        bookmarkDao.deleteBookmarksForComic(comicId)
    }
    
    suspend fun getBookmarkCountForComic(comicId: String): Int =
        bookmarkDao.getBookmarkCountForComic(comicId)
    
    suspend fun isPageBookmarked(comicId: String, page: Int): Boolean =
        bookmarkDao.isPageBookmarked(comicId, page)
    
    suspend fun toggleBookmark(comicId: String, page: Int, label: String? = null): Boolean {
        val isBookmarked = isPageBookmarked(comicId, page)
        return if (isBookmarked) {
            val existing = getBookmarkForPage(comicId, page)
            existing?.let { deleteBookmark(it) }
            false
        } else {
            addBookmark(comicId, page, label)
            true
        }
    }
}

// Extension functions for converting between entities and models
private fun BookmarkEntity.toBookmark(): Bookmark = Bookmark(
    id = id.toString(),
    comicId = comicId,
    page = page,
    label = label
)

private fun Bookmark.toBookmarkEntity(): BookmarkEntity = BookmarkEntity(
    id = id.toLongOrNull() ?: 0,
    comicId = comicId,
    page = page,
    label = label,
    timestamp = System.currentTimeMillis()
)