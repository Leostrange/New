package com.example.comicapp.utils

import androidx.documentfile.provider.DocumentFile
import com.example.comicapp.data.ComicDao
import com.example.comicapp.data.ComicEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class ComicScanner(private val comicDao: ComicDao) {
    private val supportedExtensions = listOf(".cbz", ".cbr", ".zip", ".pdf")

    suspend fun scanDirectory(directoryPath: String) = withContext(Dispatchers.IO) {
        val directory = File(directoryPath)
        if (!directory.exists() || !directory.isDirectory) return@withContext
        directory.walk().forEach { file ->
            if (file.isFile && supportedExtensions.any { file.extension.lowercase() == it.substring(1) }) {
                processComicFile(file.absolutePath)
            }
        }
    }

    suspend fun scanDirectoryFromUri(directory: DocumentFile) = withContext(Dispatchers.IO) {
        directory.listFiles().forEach { file ->
            if (file.isFile && supportedExtensions.any { file.name?.lowercase()?.endsWith(it) == true }) {
                file.uri.toString().let { uri -> processComicFile(uri) }
            } else if (file.isDirectory) {
                scanDirectoryFromUri(file)
            }
        }
    }

    private suspend fun processComicFile(filePath: String) {
        val existingComic = comicDao.getComicByFilePath(filePath)
        if (existingComic != null) return
        val metadata = extractMetadataFromFilename(filePath.substringAfterLast("/"))
        val comicEntity = ComicEntity(
            filePath = filePath,
            fileName = filePath.substringAfterLast("/"),
            title = metadata["title"] as String,
            series = metadata["series"] as String?,
            issueNumber = metadata["issue_number"] as Int?,
            author = metadata["author"] as String,
            publisher = metadata["publisher"] as String,
            genre = metadata["genre"] as String,
            pageCount = metadata["page_count"] as Int?,
            thumbnailPath = metadata["thumbnail_path"] as String?
        )
        comicDao.insertComic(comicEntity)
    }

    private fun extractMetadataFromFilename(filename: String): Map<String, Any?> {
        val baseName = filename.substringBeforeLast(".")
        var title: String = baseName
        var series: String? = null
        var issueNumber: Int? = null
        val regex = "^(.*?)(?:[\\s_-]*[#\\-]?(\\d+))?$".toRegex(RegexOption.IGNORE_CASE)
        val matchResult = regex.find(baseName)
        if (matchResult != null) {
            val (seriesCandidate, issueNumberCandidate) = matchResult.destructured
            if (seriesCandidate.isNotBlank()) {
                series = seriesCandidate.trim()
                title = series
            }
            if (issueNumberCandidate.isNotBlank()) {
                issueNumber = issueNumberCandidate.toIntOrNull()
            }
        }
        if (series == null && issueNumber == null) title = baseName
        return mapOf(
            "title" to title,
            "series" to series,
            "issue_number" to issueNumber,
            "author" to "Unknown",
            "publisher" to "Unknown",
            "genre" to "Unknown",
            "page_count" to null,
            "thumbnail_path" to null
        )
    }
}

