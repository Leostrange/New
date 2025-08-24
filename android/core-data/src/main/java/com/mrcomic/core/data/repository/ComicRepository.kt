package com.mrcomic.core.data.repository

import com.mrcomic.core.model.Comic
import kotlinx.coroutines.flow.Flow

interface ComicRepository {
	fun getAllComics(): Flow<List<Comic>>
}