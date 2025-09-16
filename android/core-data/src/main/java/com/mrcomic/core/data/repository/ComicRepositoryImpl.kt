package com.mrcomic.core.data.repository

import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.database.entity.ComicEntity
import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.ComicPage
import com.mrcomic.core.model.ComicFormat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.io.File
import java.util.zip.ZipFile
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ComicRepositoryImpl @Inject constructor(
    private val comicDao: ComicDao
) : ComicRepository {

    override fun getComics(): Flow<List<Comic>> {
        return comicDao.getAllComics().map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    override suspend fun getComicById(id: String): Comic? {
        return comicDao.getComicById(id)?.toDomainModel()
    }

    override suspend fun getComicPages(comicId: String): List<ComicPage> {
        val comic = getComicById(comicId) ?: return emptyList()
        
        return when (comic.format) {
            ComicFormat.CBZ -> extractCBZPages(comic)
            ComicFormat.CBR -> extractCBRPages(comic)
            ComicFormat.PDF -> extractPDFPages(comic)
            ComicFormat.UNKNOWN -> emptyList()
        }
    }

    override suspend fun updateReadingProgress(comicId: String, currentPage: Int, progress: Float) {
        comicDao.updateReadingProgress(comicId, currentPage, progress, System.currentTimeMillis())
    }

    override fun searchComics(query: String): Flow<List<Comic>> {
        return comicDao.searchComics("%$query%").map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    private suspend fun extractCBZPages(comic: Comic): List<ComicPage> {
        return try {
            val zipFile = ZipFile(comic.filePath)
            val imageEntries = zipFile.entries().asSequence()
                .filter { entry ->
                    !entry.isDirectory && 
                    entry.name.lowercase().matches(Regex(".*\\.(jpg|jpeg|png|gif|webp)$"))
                }
                .sortedBy { it.name }
                .toList()

            imageEntries.mapIndexed { index, entry ->
                ComicPage(
                    id = "${comic.id}_page_$index",
                    comicId = comic.id,
                    pageNumber = index,
                    imageUrl = "file://${comic.filePath}#${entry.name}",
                    fileSize = entry.size
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    private suspend fun extractCBRPages(comic: Comic): List<ComicPage> {
        // Implement RAR extraction using appropriate library
        return emptyList()
    }

    private suspend fun extractPDFPages(comic: Comic): List<ComicPage> {
        // Implement PDF page extraction using PdfRenderer
        return emptyList()
    }
}

private fun ComicEntity.toDomainModel(): Comic {
    return Comic(
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
}
