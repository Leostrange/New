package com.mrcomic.core.domain.usecase

import com.mrcomic.core.data.repository.ComicRepository
import com.mrcomic.core.model.Comic
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetComicsUseCase @Inject constructor(
    private val comicRepository: ComicRepository
) {
    operator fun invoke(): Flow<List<Comic>> = comicRepository.getComics()
}

class SearchComicsUseCase @Inject constructor(
    private val comicRepository: ComicRepository
) {
    operator fun invoke(query: String): Flow<List<Comic>> = 
        comicRepository.searchComics(query)
}

class UpdateReadingProgressUseCase @Inject constructor(
    private val comicRepository: ComicRepository
) {
    suspend operator fun invoke(comicId: String, currentPage: Int, progress: Float) {
        comicRepository.updateReadingProgress(comicId, currentPage, progress)
    }
}
