package com.example.feature.reader.ui

import android.net.Uri
import android.graphics.Bitmap
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.feature.reader.domain.BookReader
import com.example.feature.reader.domain.BookReaderFactory
import com.example.core.data.repository.SettingsRepository
import com.example.core.data.repository.BookmarkRepository
import com.example.core.data.repository.NoteRepository
import com.example.core.model.Bookmark
import com.example.core.model.Note
import com.example.feature.reader.ReaderRepository
import com.example.core.analytics.AnalyticsTracker
import com.example.core.analytics.AnalyticsEvent
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class ReaderViewModel @Inject constructor(
    private val readerFactory: BookReaderFactory,
    private val settingsRepository: SettingsRepository,
    private val bookmarkRepository: BookmarkRepository,
    private val noteRepository: NoteRepository,
    private val readerRepository: ReaderRepository,
    private val analyticsTracker: AnalyticsTracker,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReaderUiState())
    val uiState = _uiState.asStateFlow()

    // Current comic file path for bookmarks and notes
    private var currentComicId: String? = null
    private var currentComicFormat: String? = null
    private var currentComicPageCount: Int = 0
    
    // Reading time tracking
    private var readingStartTime: Long = 0
    private var pagesReadInSession: Int = 0
    private var lastPageNumber: Int = -1
    
    // Bookmarks and notes state
    private val _bookmarks = MutableStateFlow<List<Bookmark>>(emptyList())
    val bookmarks = _bookmarks.asStateFlow()
    
    private val _notes = MutableStateFlow<List<Note>>(emptyList())
    val notes = _notes.asStateFlow()
    
    private val _isCurrentPageBookmarked = MutableStateFlow(false)
    val isCurrentPageBookmarked = _isCurrentPageBookmarked.asStateFlow()

    val lineSpacing = settingsRepository.readerLineSpacing.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        1.5f
    )

    val font = settingsRepository.readerFont.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        "Sans"
    )

    val background = settingsRepository.readerBackground.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        0xFFFFFFFF
    )

    private var bookReader: BookReader? = null

    companion object {
        private const val PRELOAD_DISTANCE = 1
        private const val TAG = "ReaderViewModel"
        
        // Lazy loading constants
        private const val LAZY_LOAD_THRESHOLD = 50 // Start lazy loading for comics with more than 50 pages
        private const val LAZY_LOAD_CHUNK_SIZE = 20 // Load pages in chunks of 20
    }

    init {
        // The file path is passed as a navigation argument.
        // SavedStateHandle automatically receives arguments from the NavController.
        android.util.Log.d(TAG, "🎬 ReaderViewModel initialized")
        android.util.Log.d(TAG, "📋 SavedStateHandle keys: ${savedStateHandle.keys()}")
        val uriString = savedStateHandle.get<String>("uri")
        android.util.Log.d(TAG, "📁 Received URI from navigation: $uriString")
        if (uriString != null) {
            android.util.Log.d(TAG, "✅ URI found, opening book...")
            openBook(Uri.parse(uriString))
        } else {
            android.util.Log.e(TAG, "❌ No URI provided in navigation arguments!")
            _uiState.update { it.copy(isLoading = false, error = "File URI not provided.") }
        }
    }

    fun openBook(uri: Uri) {
        android.util.Log.d(TAG, "Opening book: $uri")
        currentComicId = uri.toString() // Use URI as comic ID
        currentComicFormat = uri.toString().substringAfterLast(".", "").uppercase()
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            // Close previous reader if a new book is opened
            bookReader?.close()

            try {
                val reader = readerFactory.create(uri)
                val pageCount = reader.open(uri)
                bookReader = reader // Only assign if successful
                currentComicPageCount = pageCount
                android.util.Log.d(TAG, "Book opened successfully. Page count: $pageCount")
                
                // Start reading session tracking
                readingStartTime = System.currentTimeMillis()
                pagesReadInSession = 0
                lastPageNumber = -1
                
                // Track reading started event
                analyticsTracker.trackEvent(
                    AnalyticsEvent.ReadingStarted(
                        comicId = currentComicId ?: "unknown",
                        format = currentComicFormat ?: "unknown"
                    )
                )
                
                _uiState.update { it.copy(pageCount = pageCount) }
                
                // Load bookmarks and notes for this comic
                loadBookmarksAndNotes()
                
                loadPage(0) // Load the first page
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to open book", e)
                _uiState.update {
                    it.copy(isLoading = false, error = "Failed to open file: ${e.message}")
                }
            }
        }
    }

    fun goToNextPage() {
        val currentState = _uiState.value
        val nextPage = currentState.currentPageIndex + 1
        android.util.Log.d(TAG, "goToNextPage: current=${currentState.currentPageIndex}, next=$nextPage, total=${currentState.pageCount}")
        if (nextPage < currentState.pageCount) {
            loadPage(nextPage)
        } else {
            android.util.Log.d(TAG, "Already at last page")
        }
    }

    fun goToPreviousPage() {
        val currentState = _uiState.value
        val prevPage = currentState.currentPageIndex - 1
        android.util.Log.d(TAG, "goToPreviousPage: current=${currentState.currentPageIndex}, prev=$prevPage")
        if (prevPage >= 0) {
            loadPage(prevPage)
        } else {
            android.util.Log.d(TAG, "Already at first page")
        }
    }

    fun setReadingMode(mode: ReadingMode) {
        android.util.Log.d(TAG, "Setting reading mode: $mode")
        _uiState.update { it.copy(readingMode = mode) }
    }

    fun setReadingDirection(direction: ReadingDirection) {
        android.util.Log.d(TAG, "Setting reading direction: $direction")
        _uiState.update { it.copy(readingDirection = direction) }
    }

    /**
     * Get the current comic ID for bookmarks and notes
     * 
     * @return The current comic ID or empty string if not set
     */
    fun getCurrentComicId(): String {
        return currentComicId ?: ""
    }

    suspend fun getPage(pageIndex: Int): Bitmap? {
        return withContext(Dispatchers.IO) {
            bookReader?.renderPage(pageIndex)
        }
    }
    
    // Bookmark and Notes functionality
    private fun loadBookmarksAndNotes() {
        val comicId = currentComicId ?: return
        
        viewModelScope.launch {
            // Load bookmarks
            bookmarkRepository.getBookmarksForComic(comicId).collect { bookmarkList ->
                _bookmarks.value = bookmarkList
                updateCurrentPageBookmarkStatus()
            }
        }
        
        viewModelScope.launch {
            // Load notes
            noteRepository.getNotesForComic(comicId).collect { noteList ->
                _notes.value = noteList
            }
        }
    }
    
    private suspend fun updateCurrentPageBookmarkStatus() {
        val comicId = currentComicId ?: return
        val currentPage = _uiState.value.currentPageIndex
        _isCurrentPageBookmarked.value = bookmarkRepository.isPageBookmarked(comicId, currentPage)
    }
    
    fun addBookmark(page: Int, label: String? = null) {
        val comicId = currentComicId ?: return
        viewModelScope.launch {
            try {
                bookmarkRepository.addBookmark(comicId, page, label)
                updateCurrentPageBookmarkStatus()
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to add bookmark", e)
            }
        }
    }
    
    fun deleteBookmark(bookmark: Bookmark) {
        viewModelScope.launch {
            try {
                bookmarkRepository.deleteBookmark(bookmark)
                updateCurrentPageBookmarkStatus()
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to delete bookmark", e)
            }
        }
    }
    
    fun toggleBookmark(page: Int? = null, label: String? = null) {
        val comicId = currentComicId ?: return
        val targetPage = page ?: _uiState.value.currentPageIndex
        
        viewModelScope.launch {
            try {
                bookmarkRepository.toggleBookmark(comicId, targetPage, label)
                updateCurrentPageBookmarkStatus()
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to toggle bookmark", e)
            }
        }
    }
    
    fun addNote(page: Int, content: String, title: String? = null) {
        val comicId = currentComicId ?: return
        viewModelScope.launch {
            try {
                noteRepository.addNote(comicId, page, content, title)
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to add note", e)
            }
        }
    }
    
    fun updateNote(note: Note) {
        viewModelScope.launch {
            try {
                noteRepository.updateNote(note)
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to update note", e)
            }
        }
    }
    
    fun deleteNote(note: Note) {
        viewModelScope.launch {
            try {
                noteRepository.deleteNote(note)
            } catch (e: Exception) {
                android.util.Log.e(TAG, "Failed to delete note", e)
            }
        }
    }
    
    fun jumpToPage(page: Int) {
        if (page >= 0 && page < _uiState.value.pageCount) {
            loadPage(page)
        }
    }
    
    private fun loadPage(pageIndex: Int) {
        android.util.Log.d(TAG, "Loading page: $pageIndex")
        _uiState.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            val bitmap = withContext(Dispatchers.IO) {
                bookReader?.renderPage(pageIndex)
            }
            
            if (bitmap != null) {
                android.util.Log.d(TAG, "Page $pageIndex loaded successfully (${bitmap.width}x${bitmap.height})")
            } else {
                android.util.Log.w(TAG, "Failed to load page $pageIndex")
            }
            
            _uiState.update {
                it.copy(
                    isLoading = false,
                    currentPageIndex = pageIndex,
                    currentPageBitmap = bitmap,
                    error = if (bitmap == null) "Failed to load page ${pageIndex + 1}" else null
                )
            }
            
            // Track page turn if this is a new page
            if (pageIndex != lastPageNumber) {
                pagesReadInSession++
                lastPageNumber = pageIndex
                
                // Track page turned event
                analyticsTracker.trackEvent(
                    AnalyticsEvent.PageTurned(
                        pageNumber = pageIndex,
                        direction = if (pageIndex > lastPageNumber) "forward" else "backward"
                    )
                )
            }
            
            // Update bookmark status for current page
            updateCurrentPageBookmarkStatus()
            
            // Save reading progress
            currentComicId?.let { comicId ->
                viewModelScope.launch {
                    readerRepository.setState(comicId, pageIndex)
                }
            }
            
            // After updating UI, preload adjacent pages for a smoother experience
            preloadAdjacentPages(pageIndex)
        }
    }

    /**
     * Preloads pages before and after the given index into the cache.
     * This is a "fire-and-forget" operation running in the background.
     */
    private fun preloadAdjacentPages(centerPageIndex: Int) {
        val pageCount = _uiState.value.pageCount
        if (pageCount <= 1) return

        viewModelScope.launch(Dispatchers.IO) {
            // For large comics, use lazy loading approach
            val shouldUseLazyLoading = pageCount > LAZY_LOAD_THRESHOLD
            
            if (shouldUseLazyLoading) {
                // Preload in chunks for large comics
                val startChunk = (centerPageIndex / LAZY_LOAD_CHUNK_SIZE) * LAZY_LOAD_CHUNK_SIZE
                val endChunk = minOf(startChunk + LAZY_LOAD_CHUNK_SIZE - 1, pageCount - 1)
                
                // Preload pages in the current chunk
                for (i in maxOf(0, startChunk) until endChunk) {
                    if (i != centerPageIndex) { // Don't preload current page again
                        android.util.Log.d(TAG, "Lazy loading page: $i")
                        bookReader?.renderPage(i)
                    }
                }
            } else {
                // Preload pages after the current one
                for (i in 1..PRELOAD_DISTANCE) {
                    val nextIndex = centerPageIndex + i
                    if (nextIndex < pageCount) {
                        android.util.Log.d(TAG, "Preloading page: $nextIndex")
                        bookReader?.renderPage(nextIndex)
                    }
                }
                // Preload pages before the current one
                for (i in 1..PRELOAD_DISTANCE) {
                    val prevIndex = centerPageIndex - i
                    if (prevIndex >= 0) {
                        android.util.Log.d(TAG, "Preloading page: $prevIndex")
                        bookReader?.renderPage(prevIndex)
                    }
                }
            }
        }
    }
    
    /**
     * Progressive page loading for better user experience with large files
     */
    private fun loadPageProgressively(pageIndex: Int) {
        android.util.Log.d(TAG, "Loading page progressively: $pageIndex")
        _uiState.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            // First, try to get a low-quality version quickly
            val lowQualityBitmap = withContext(Dispatchers.IO) {
                bookReader?.renderPage(pageIndex)
            }
            
            // Update UI with low-quality version if available
            if (lowQualityBitmap != null) {
                _uiState.update {
                    it.copy(
                        currentPageIndex = pageIndex,
                        currentPageBitmap = lowQualityBitmap,
                        error = null
                    )
                }
            }
            
            // Then load the full quality version
            val fullQualityBitmap = withContext(Dispatchers.IO) {
                bookReader?.renderPage(pageIndex)
            }
            
            // Update UI with full quality version
            if (fullQualityBitmap != null) {
                android.util.Log.d(TAG, "Page $pageIndex loaded successfully (${fullQualityBitmap.width}x${fullQualityBitmap.height})")
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        currentPageBitmap = fullQualityBitmap,
                        error = null
                    )
                }
            } else {
                android.util.Log.w(TAG, "Failed to load page $pageIndex")
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = if (lowQualityBitmap == null) "Failed to load page ${pageIndex + 1}" else null
                    )
                }
            }
            
            // Track page turn if this is a new page
            if (pageIndex != lastPageNumber) {
                pagesReadInSession++
                lastPageNumber = pageIndex
                
                // Track page turned event
                analyticsTracker.trackEvent(
                    AnalyticsEvent.PageTurned(
                        pageNumber = pageIndex,
                        direction = if (pageIndex > lastPageNumber) "forward" else "backward"
                    )
                )
            }
            
            // Update bookmark status for current page
            updateCurrentPageBookmarkStatus()
            
            // Save reading progress
            currentComicId?.let { comicId ->
                viewModelScope.launch {
                    readerRepository.setState(comicId, pageIndex)
                }
            }
            
            // After updating UI, preload adjacent pages for a smoother experience
            preloadAdjacentPages(pageIndex)
        }
    }

    /**
     * Synchronize reading progress with other devices
     */
    fun syncReadingProgress() {
        if (readerRepository is com.example.feature.reader.RoomReaderRepository) {
            readerRepository.syncReadingProgress()
        }
    }

    override fun onCleared() {
        super.onCleared()
        android.util.Log.d(TAG, "ViewModel cleared, closing book reader")
        
        // Track reading finished event
        if (currentComicId != null && readingStartTime > 0) {
            val sessionDuration = System.currentTimeMillis() - readingStartTime
            analyticsTracker.trackEvent(
                AnalyticsEvent.ReadingFinished(
                    comicId = currentComicId ?: "unknown",
                    pagesRead = pagesReadInSession,
                    totalPages = currentComicPageCount,
                    sessionDuration = sessionDuration
                )
            )
        }
        
        // Ensure resources are freed when the ViewModel is destroyed
        bookReader?.close()
        bookReader = null
        
        // Sync reading progress when closing the reader
        syncReadingProgress()
    }
}