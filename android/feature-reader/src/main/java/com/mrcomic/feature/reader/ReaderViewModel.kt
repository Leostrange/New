package com.mrcomic.feature.reader

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mrcomic.core.data.repository.ComicRepository
import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.ComicPage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReaderViewModel @Inject constructor(
    private val comicRepository: ComicRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReaderUiState())
    val uiState: StateFlow<ReaderUiState> = _uiState.asStateFlow()

    fun loadComic(comicId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val comic = comicRepository.getComicById(comicId)
                val pages = comicRepository.getComicPages(comicId)
                
                _uiState.value = _uiState.value.copy(
                    comic = comic,
                    pages = pages,
                    totalPages = pages.size,
                    currentPage = comic?.currentPage ?: 0,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Неизвестная ошибка",
                    isLoading = false
                )
            }
        }
    }

    fun updateReadingProgress(page: Int) {
        viewModelScope.launch {
            val comic = _uiState.value.comic ?: return@launch
            val progress = (page + 1).toFloat() / _uiState.value.totalPages
            
            comicRepository.updateReadingProgress(
                comicId = comic.id,
                currentPage = page,
                progress = progress
            )
            
            _uiState.value = _uiState.value.copy(currentPage = page)
        }
    }

    fun showTableOfContents() {
        // Implement table of contents functionality
        _uiState.value = _uiState.value.copy(showTableOfContents = true)
    }

    fun showBookmarks() {
        // Implement bookmarks functionality
        _uiState.value = _uiState.value.copy(showBookmarks = true)
    }

    fun showSearch() {
        // Implement search functionality
        _uiState.value = _uiState.value.copy(showSearch = true)
    }

    fun showSettings() {
        // Implement settings functionality
        _uiState.value = _uiState.value.copy(showSettings = true)
    }
}

data class ReaderUiState(
    val comic: Comic? = null,
    val pages: List<ComicPage> = emptyList(),
    val currentPage: Int = 0,
    val totalPages: Int = 0,
    val isLoading: Boolean = false,
    val error: String? = null,
    val showTableOfContents: Boolean = false,
    val showBookmarks: Boolean = false,
    val showSearch: Boolean = false,
    val showSettings: Boolean = false
)
