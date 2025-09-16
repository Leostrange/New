package com.mrcomic.core.data.repository

import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.database.entity.ComicEntity
import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.ComicFormat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ComicRepository @Inject constructor(
    private val comicDao: ComicDao
) {
    fun getComics(): Flow<List<Comic>> = 
        comicDao.getAllComics().map { entities ->
            entities.map { it.toDomainModel() }
        }
    
    fun searchComics(query: String): Flow<List<Comic>> =
        comicDao.searchComics(query).map { entities ->
            entities.map { it.toDomainModel() }
        }
    
    suspend fun insertComic(comic: Comic) {
        comicDao.insertComic(comic.toEntity())
    }
    
    suspend fun updateReadingProgress(comicId: String, currentPage: Int, progress: Float) {
        comicDao.updateReadingProgress(comicId, currentPage, progress)
    }
    
    suspend fun toggleFavorite(comicId: String) {
        comicDao.toggleFavorite(comicId)
    }
    
    suspend fun deleteComic(comicId: String) {
        comicDao.deleteComic(comicId)
    }
}

// Extension functions for mapping
private fun ComicEntity.toDomainModel(): Comic = Comic(
    id = id,
    title = title,
    author = author,
    filePath = filePath,
    coverPath = coverPath,
    pageCount = pageCount,
    currentPage = currentPage,
    readingProgress = readingProgress,
    dateAdded = dateAdded,
    lastRead = lastRead,
    isFavorite = isFavorite,
    genre = genre,
    fileSize = fileSize,
    format = ComicFormat.valueOf(format),
    tags = tags
)

private fun Comic.toEntity(): ComicEntity = ComicEntity(
    id = id,
    title = title,
    author = author,
    filePath = filePath,
    coverPath = coverPath,
    pageCount = pageCount,
    currentPage = currentPage,
    readingProgress = readingProgress,
    dateAdded = dateAdded,
    lastRead = lastRead,
    isFavorite = isFavorite,
    genre = genre,
    fileSize = fileSize,
    format = format.name,
    tags = tags
)
