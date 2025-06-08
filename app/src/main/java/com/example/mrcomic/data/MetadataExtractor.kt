package com.example.mrcomic.data

import java.io.File
import nl.siegmann.epublib.epub.EpubReader
import com.github.shiraji.mobi.MobiBook

object MetadataExtractor {
    fun extractMetadata(file: File): Map<String, String> {
        val ext = file.extension.lowercase()
        return when (ext) {
            "epub" -> {
                val epubBook = EpubReader().readEpub(file.inputStream())
                mapOf(
                    "title" to (epubBook.title ?: file.nameWithoutExtension),
                    "author" to (epubBook.metadata.authors.joinToString() ?: ""),
                    "tags" to (epubBook.metadata.subjects.joinToString() ?: "")
                )
            }
            "mobi" -> {
                val mobiBook = MobiBook(file)
                mapOf(
                    "title" to (mobiBook.title ?: file.nameWithoutExtension),
                    "author" to (mobiBook.author ?: ""),
                    "tags" to (mobiBook.subject ?: "")
                )
            }
            else -> mapOf("title" to file.nameWithoutExtension)
        }
    }
} 