package com.mrcomic.feature.reader

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mrcomic.core.common.Result
import com.mrcomic.core.common.asResult
import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.ReadingMode
import com.mrcomic.core.model.ReadingDirection
import com.mrcomic.core.model.ScalingMode
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReaderViewModel @Inject constructor(
    private val comicDao: ComicDao,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val comicId: String = checkNotNull(savedStateHandle["comicId"])

    private val _uiState = MutableStateFlow(ReaderUiState())
    val uiState = _uiState.asStateFlow()

    // Comic data
    val comic: StateFlow<Result<Comic?>> = flow {
        emit(comicDao.getComicById(comicId))
    }.asResult().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = Result.Loading
    )

    // Pages data (mock implementation)
    val pages: StateFlow<Result<List<ComicPage>>> = comic.map { comicResult ->
        when (comicResult) {
            is Result.Success -> {
                val comic = comicResult.data
                if (comic != null) {
                    Result.Success(generateMockPages(comic.pageCount))
                } else {
                    Result.Error(Exception("Comic not found"))
                }
            }
            is Result.Error -> Result.Error(comicResult.exception)
            is Result.Loading -> Result.Loading
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = Result.Loading
    )

    init {
        // Load initial reading position
        viewModelScope.launch {
            comic.collect { comicResult ->
                if (comicResult is Result.Success && comicResult.data != null) {
                    _uiState.update { currentState ->
                        currentState.copy(
                            currentPage = comicResult.data.currentPage,
                            totalPages = comicResult.data.pageCount
                        )
                    }
                }
            }
        }
    }

    fun updateCurrentPage(page: Int) {
        _uiState.update { it.copy(currentPage = page) }
        
        // Update reading progress in database
        viewModelScope.launch {
            val progress = if (_uiState.value.totalPages > 0) {
                page.toFloat() / _uiState.value.totalPages
            } else 0f
            
            comicDao.updateReadingProgress(
                id = comicId,
                page = page,
                progress = progress,
                timestamp = System.currentTimeMillis()
            )
        }
    }

    fun toggleUIVisibility() {
        _uiState.update { it.copy(isUIVisible = !it.isUIVisible) }
    }

    fun updateReadingMode(mode: ReadingMode) {
        _uiState.update { it.copy(readingMode = mode) }
    }

    fun updateReadingDirection(direction: ReadingDirection) {
        _uiState.update { it.copy(readingDirection = direction) }
    }

    fun updateScalingMode(mode: ScalingMode) {
        _uiState.update { it.copy(scalingMode = mode) }
    }

    fun updateBrightness(brightness: Float) {
        _uiState.update { it.copy(brightness = brightness) }
    }

    fun toggleFullscreen() {
        _uiState.update { it.copy(isFullscreen = !it.isFullscreen) }
    }

    fun showSettings() {
        _uiState.update { it.copy(showSettings = true) }
    }

    fun hideSettings() {
        _uiState.update { it.copy(showSettings = false) }
    }

    fun nextPage() {
        val currentPage = _uiState.value.currentPage
        val totalPages = _uiState.value.totalPages
        if (currentPage < totalPages - 1) {
            updateCurrentPage(currentPage + 1)
        }
    }

    fun previousPage() {
        val currentPage = _uiState.value.currentPage
        if (currentPage > 0) {
            updateCurrentPage(currentPage - 1)
        }
    }

    fun goToPage(page: Int) {
        val totalPages = _uiState.value.totalPages
        if (page in 0 until totalPages) {
            updateCurrentPage(page)
        }
    }

    private fun generateMockPages(pageCount: Int): List<ComicPage> {
        return (0 until pageCount).map { index ->
            ComicPage(
                index = index,
                url = "https://picsum.photos/800/1200?random=$index", // Mock image URLs
                width = 800,
                height = 1200
            )
        }
    }
}

data class ReaderUiState(
    val currentPage: Int = 0,
    val totalPages: Int = 0,
    val isUIVisible: Boolean = false,
    val isFullscreen: Boolean = false,
    val readingMode: ReadingMode = ReadingMode.PAGE_BY_PAGE,
    val readingDirection: ReadingDirection = ReadingDirection.LEFT_TO_RIGHT,
    val scalingMode: ScalingMode = ScalingMode.FIT_WIDTH,
    val brightness: Float = 0.5f,
    val showSettings: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null
)

data class ComicPage(
    val index: Int,
    val url: String,
    val width: Int,
    val height: Int
)