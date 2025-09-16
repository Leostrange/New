package com.mrcomic.feature.library

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mrcomic.core.data.repository.ComicRepository
import com.mrcomic.core.model.Comic
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val comicRepository: ComicRepository
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    private val _isSearchVisible = MutableStateFlow(false)
    
    private val comics = comicRepository.getAllComics()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val uiState = combine(
        comics,
        _searchQuery,
        _isSearchVisible
    ) { comicsList, query, searchVisible ->
        LibraryUiState(
            comics = comicsList,
            filteredComics = if (query.isBlank()) {
                comicsList
            } else {
                comicsList.filter { 
                    it.title.contains(query, ignoreCase = true) ||
                    it.author?.contains(query, ignoreCase = true) == true
                }
            },
            searchQuery = query,
            isSearchVisible = searchVisible
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = LibraryUiState()
    )

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun toggleSearch() {
        _isSearchVisible.value = !_isSearchVisible.value
        if (!_isSearchVisible.value) {
            _searchQuery.value = ""
        }
    }
}

data class LibraryUiState(
    val comics: List<Comic> = emptyList(),
    val filteredComics: List<Comic> = emptyList(),
    val searchQuery: String = "",
    val isSearchVisible: Boolean = false,
    val isLoading: Boolean = false
)
