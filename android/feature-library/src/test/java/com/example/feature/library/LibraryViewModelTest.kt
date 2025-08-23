package com.example.feature.library

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.core.data.repository.ComicRepository
import com.example.core.model.Comic
import com.example.core.model.SortOrder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.*
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@OptIn(ExperimentalCoroutinesApi::class)
class LibraryViewModelTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()

    @Mock
    private lateinit var mockComicRepository: ComicRepository

    private lateinit var viewModel: LibraryViewModel

    private val testComics = listOf(
        Comic(
            id = "1",
            title = "Test Comic 1",
            author = "Author 1",
            filePath = "/path/to/comic1.cbz",
            coverPath = "/path/to/cover1.jpg"
        ),
        Comic(
            id = "2", 
            title = "Test Comic 2",
            author = "Author 2",
            filePath = "/path/to/comic2.cbz",
            coverPath = "/path/to/cover2.jpg"
        )
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        MockitoAnnotations.openMocks(this)
        
        // Setup default mock behavior
        whenever(mockComicRepository.getComics(any(), any())).thenReturn(flowOf(testComics))
        
        viewModel = LibraryViewModel(mockComicRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state should have correct default values`() {
        val initialState = viewModel.uiState.value
        
        assertFalse(initialState.isLoading)
        assertFalse(initialState.inSelectionMode)
        assertFalse(initialState.isSearchActive)
        assertEquals("", initialState.searchQuery)
        assertEquals(SortOrder.TITLE_ASC, initialState.sortOrder)
        assertTrue(initialState.selectedComicIds.isEmpty())
        assertTrue(initialState.pendingDeletionIds.isEmpty())
    }

    @Test
    fun `onPermissionsGranted should trigger comic loading`() = runTest {
        viewModel.onPermissionsGranted()
        testDispatcher.scheduler.advanceUntilIdle()

        verify(mockComicRepository).refreshComicsIfEmpty()
    }

    @Test
    fun `onSearchQueryChange should update search query`() = runTest {
        val testQuery = "search term"
        
        viewModel.onSearchQueryChange(testQuery)
        testDispatcher.scheduler.advanceUntilIdle()
        
        assertEquals(testQuery, viewModel.uiState.value.searchQuery)
    }

    @Test
    fun `onToggleSearch should toggle search state and clear query`() = runTest {
        // Initially search is inactive
        assertFalse(viewModel.uiState.value.isSearchActive)
        
        // Toggle to active
        viewModel.onToggleSearch()
        testDispatcher.scheduler.advanceUntilIdle()
        assertTrue(viewModel.uiState.value.isSearchActive)
        
        // Set a search query
        viewModel.onSearchQueryChange("test")
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Toggle back to inactive - should clear query
        viewModel.onToggleSearch()
        testDispatcher.scheduler.advanceUntilIdle()
        
        assertFalse(viewModel.uiState.value.isSearchActive)
        assertEquals("", viewModel.uiState.value.searchQuery)
    }

    @Test
    fun `onSortOrderChange should update sort order`() = runTest {
        val newSortOrder = SortOrder.AUTHOR_ASC
        
        viewModel.onSortOrderChange(newSortOrder)
        testDispatcher.scheduler.advanceUntilIdle()
        
        assertEquals(newSortOrder, viewModel.uiState.value.sortOrder)
    }

    @Test
    fun `onComicSelected should add comic to selection when not selected`() = runTest {
        val comicId = "test-comic-1"
        
        viewModel.onComicSelected(comicId)
        testDispatcher.scheduler.advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertTrue(state.selectedComicIds.contains(comicId))
        assertTrue(state.inSelectionMode)
    }

    @Test
    fun `onComicSelected should remove comic from selection when already selected`() = runTest {
        val comicId = "test-comic-1"
        
        // First select the comic
        viewModel.onComicSelected(comicId)
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Then deselect it
        viewModel.onComicSelected(comicId)
        testDispatcher.scheduler.advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertFalse(state.selectedComicIds.contains(comicId))
        assertFalse(state.inSelectionMode)
    }

    @Test
    fun `onEnterSelectionMode should set initial comic selection`() = runTest {
        val comicId = "test-comic-1"
        
        viewModel.onEnterSelectionMode(comicId)
        testDispatcher.scheduler.advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertTrue(state.inSelectionMode)
        assertTrue(state.selectedComicIds.contains(comicId))
        assertEquals(1, state.selectedComicIds.size)
    }

    @Test
    fun `onClearSelection should reset selection state`() = runTest {
        // First select some comics
        viewModel.onEnterSelectionMode("comic1")
        viewModel.onComicSelected("comic2")
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Then clear selection
        viewModel.onClearSelection()
        testDispatcher.scheduler.advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertFalse(state.inSelectionMode)
        assertTrue(state.selectedComicIds.isEmpty())
    }

    @Test
    fun `onDeleteRequest should move selected comics to pending deletion`() = runTest {
        val comicIds = setOf("comic1", "comic2")
        
        // Select comics
        viewModel.onEnterSelectionMode("comic1")
        viewModel.onComicSelected("comic2")
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Request deletion
        viewModel.onDeleteRequest()
        testDispatcher.scheduler.advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertTrue(state.pendingDeletionIds.containsAll(comicIds))
        assertFalse(state.inSelectionMode)
        assertTrue(state.selectedComicIds.isEmpty())
    }

    @Test
    fun `onUndoDelete should clear pending deletions`() = runTest {
        // Setup pending deletions
        viewModel.onEnterSelectionMode("comic1")
        viewModel.onDeleteRequest()
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Undo deletion
        viewModel.onUndoDelete()
        testDispatcher.scheduler.advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertTrue(state.pendingDeletionIds.isEmpty())
    }

    @Test
    fun `onDeletionTimeout should call repository deleteComics`() = runTest {
        val comicIds = setOf("comic1", "comic2")
        
        // Setup pending deletions
        viewModel.onEnterSelectionMode("comic1")
        viewModel.onComicSelected("comic2")
        viewModel.onDeleteRequest()
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Trigger deletion timeout
        viewModel.onDeletionTimeout()
        testDispatcher.scheduler.advanceUntilIdle()
        
        verify(mockComicRepository).deleteComics(comicIds)
    }

    @Test
    fun `addComic should call repository addComic`() = runTest {
        val title = "New Comic"
        val author = "New Author"
        val coverPath = "/path/to/cover.jpg"
        val filePath = "/path/to/comic.cbz"
        
        viewModel.addComic(title, author, coverPath, filePath)
        testDispatcher.scheduler.advanceUntilIdle()
        
        verify(mockComicRepository).addComic(any())
    }
}