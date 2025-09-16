package com.mrcomic.core.model

data class ComicPage(
    val id: String,
    val comicId: String,
    val pageNumber: Int,
    val imageUrl: String,
    val width: Int = 0,
    val height: Int = 0,
    val fileSize: Long = 0
)
