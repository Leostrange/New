package com.example.core.domain.usecase

import com.example.core.data.repository.ComicRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

class DeleteComicUseCaseTest {

    private lateinit var repository: ComicRepository
    private lateinit var deleteComicUseCase: DeleteComicUseCase

    @Before
    fun setUp() {
        repository = mockk(relaxed = true)
        deleteComicUseCase = DeleteComicUseCase(repository)
    }

    @Test
    fun `invoke should call repository deleteComics`() = runTest {
        // Given
        val comicIds = setOf("comic1", "comic2")

        // When
        deleteComicUseCase.invoke(comicIds)

        // Then
        coVerify(exactly = 1) { repository.deleteComics(comicIds) }
    }

    @Test
    fun `invoke should propagate repository exceptions`() = runTest {
        // Given
        val comicIds = setOf("comic1", "comic2")
        val exception = RuntimeException("Database error")
        coEvery { repository.deleteComics(comicIds) } throws exception

        // When & Then
        try {
            deleteComicUseCase.invoke(comicIds)
            assert(false) { "Expected exception to be thrown" }
        } catch (e: RuntimeException) {
            assert(e.message == "Database error")
        }
    }
}