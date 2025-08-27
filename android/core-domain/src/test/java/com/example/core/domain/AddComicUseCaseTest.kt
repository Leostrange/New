package com.example.core.domain

import com.example.core.data.repository.ComicRepository
import com.example.core.model.Comic
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

class AddComicUseCaseTest {

    private lateinit var repository: ComicRepository
    private lateinit var addComicUseCase: AddComicUseCase

    @Before
    fun setUp() {
        repository = mockk(relaxed = true)
        addComicUseCase = AddComicUseCase(repository)
    }

    @Test
    fun `invoke should call repository addComic`() = runTest {
        // Given
        val comic = Comic(title = "Test Comic", author = "Unknown", filePath = "/path/to/comic", coverPath = "/path/to/cover")

        // When
        addComicUseCase.invoke(comic)

        // Then
        coVerify(exactly = 1) { repository.addComic(comic) }
    }

    @Test
    fun `invoke should propagate repository exceptions`() = runTest {
        // Given
        val comic = Comic(title = "Test Comic", author = "Unknown", filePath = "/path/to/comic", coverPath = "/path/to/cover")
        val exception = RuntimeException("Database error")
        coEvery { repository.addComic(comic) } throws exception

        // When & Then
        try {
            addComicUseCase.invoke(comic)
            assert(false) { "Expected exception to be thrown" }
        } catch (e: RuntimeException) {
            assert(e.message == "Database error")
        }
    }
}