package com.mrcomic.core.model

import java.time.LocalDateTime

data class Comic(
    val id: String,
    val title: String,
    val author: String? = null,
    val filePath: String,
    val coverPath: String? = null,
    val totalPages: Int = 0,
    val currentPage: Int = 0,
    val progress: Float = 0f,
    val lastReadTime: LocalDateTime? = null,
    val format: ComicFormat,
    val fileSize: Long = 0,
    val isBookmarked: Boolean = false,
    val tags: List<String> = emptyList(),
    val series: String? = null,
    val volume: Int? = null,
    val issue: Int? = null,
    val publishedDate: LocalDateTime? = null,
    val description: String? = null,
    val rating: Float? = null
)

enum class ComicFormat {
    CBZ, CBR, PDF, EPUB
}
