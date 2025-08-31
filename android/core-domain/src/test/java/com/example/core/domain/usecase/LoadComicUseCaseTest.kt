package com.example.core.domain.usecase

import android.net.Uri
import com.example.core.domain.util.Result
import kotlinx.coroutines.test.runTest
import org.junit.Test
import kotlin.test.assertTrue

class LoadComicUseCaseTest {

    private val loadComicUseCase = LoadComicUseCase()

    @Test
    fun `invoke with valid URI should return Success`() = runTest {
        // Given
        val uri = Uri.parse("content://test/comic.cbz")

        // When
        val result = loadComicUseCase.invoke(uri)

        // Then
        assertTrue(result is Result.Success)
    }

    @Test
    fun `invoke with empty URI should return Error`() = runTest {
        // Given
        val uri = Uri.parse("")

        // When
        val result = loadComicUseCase.invoke(uri)

        // Then
        assertTrue(result is Result.Error)
    }

    @Test
    fun `invoke with blank URI should return Error`() = runTest {
        // Given
        val uri = Uri.parse("   ")

        // When
        val result = loadComicUseCase.invoke(uri)

        // Then
        assertTrue(result is Result.Error)
    }

    @Test
    fun `invoke with null URI string should return Error`() = runTest {
        // Given
        val uri = Uri.parse(null as String?)

        // When
        val result = loadComicUseCase.invoke(uri)

        // Then
        assertTrue(result is Result.Error)
    }

    @Test
    fun `releaseResources should not throw exception`() {
        // When/Then
        loadComicUseCase.releaseResources()
        // Should not throw any exception
    }
}