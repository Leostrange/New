package com.mrcomic.core.data.repository

import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.ComicFormat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.LocalDateTime
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultComicRepository @Inject constructor() : ComicRepository {
	private val comicsState = MutableStateFlow<List<Comic>>(sampleComics())

	override fun getAllComics(): Flow<List<Comic>> = comicsState.asStateFlow()
}

private fun sampleComics(): List<Comic> = listOf(
	Comic(
		id = "1",
		title = "Sample Comic",
		author = "Author",
		filePath = "/storage/emulated/0/Comics/sample.cbz",
		coverPath = null,
		totalPages = 120,
		currentPage = 0,
		progress = 0f,
		lastReadTime = LocalDateTime.now(),
		format = ComicFormat.CBZ,
		fileSize = 1024L,
		isBookmarked = false
	)
)