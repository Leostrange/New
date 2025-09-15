package com.mrcomic.feature.library

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mrcomic.core.common.Result
import com.mrcomic.core.common.asResult
import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.ComicFormat
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val comicDao: ComicDao
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    private val _selectedTab = MutableStateFlow(LibraryTab.ALL)
    private val _sortMode = MutableStateFlow(SortMode.DATE_ADDED)
    private val _isGridView = MutableStateFlow(true)
    private val _isRefreshing = MutableStateFlow(false)

    val searchQuery = _searchQuery.asStateFlow()
    val selectedTab = _selectedTab.asStateFlow()
    val sortMode = _sortMode.asStateFlow()
    val isGridView = _isGridView.asStateFlow()
    val isRefreshing = _isRefreshing.asStateFlow()

    // Debounced search query
    private val debouncedSearchQuery = _searchQuery
        .debounce(300)
        .distinctUntilChanged()

    // Combined comics flow based on tab, search, and sort
    val comics: StateFlow<Result<List<Comic>>> = combine(
        _selectedTab,
        debouncedSearchQuery,
        _sortMode
    ) { tab, query, sort ->
        Triple(tab, query, sort)
    }.flatMapLatest { (tab, query, sort) ->
        getComicsFlow(tab, query, sort)
    }.asResult().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = Result.Loading
    )

    // Statistics
    val libraryStats: StateFlow<Result<LibraryStatistics>> = flow {
        val totalCount = comicDao.getTotalComicsCount()
        val readCount = comicDao.getReadComicsCount()
        val averageProgress = comicDao.getAverageReadingProgress()
        val totalSize = comicDao.getTotalLibrarySize()

        emit(
            LibraryStatistics(
                totalComics = totalCount,
                readComics = readCount,
                averageProgress = averageProgress,
                totalSize = totalSize
            )
        )
    }.asResult().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = Result.Loading
    )

    private fun getComicsFlow(
        tab: LibraryTab,
        query: String,
        sort: SortMode
    ): Flow<List<Comic>> {
        val baseFlow = when (tab) {
            LibraryTab.ALL -> {
                if (query.isBlank()) {
                    comicDao.getAllComics()
                } else {
                    comicDao.searchComics(query)
                }
            }
            LibraryTab.FAVORITES -> comicDao.getFavoriteComics()
            LibraryTab.IN_PROGRESS -> comicDao.getInProgressComics()
            LibraryTab.COMPLETED -> comicDao.getCompletedComics()
        }

        return baseFlow.map { comics ->
            when (sort) {
                SortMode.DATE_ADDED -> comics.sortedByDescending { it.dateAdded }
                SortMode.TITLE_ASC -> comics.sortedBy { it.title }
                SortMode.TITLE_DESC -> comics.sortedByDescending { it.title }
                SortMode.AUTHOR -> comics.sortedBy { it.author ?: "" }
                SortMode.PROGRESS -> comics.sortedByDescending { it.readingProgress }
                SortMode.LAST_READ -> comics.sortedByDescending { it.lastRead ?: 0 }
            }
        }
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun selectTab(tab: LibraryTab) {
        _selectedTab.value = tab
    }

    fun updateSortMode(mode: SortMode) {
        _sortMode.value = mode
    }

    fun toggleViewMode() {
        _isGridView.value = !_isGridView.value
    }

    fun toggleFavorite(comic: Comic) {
        viewModelScope.launch {
            comicDao.updateFavoriteStatus(comic.id, !comic.isFavorite)
        }
    }

    fun refreshLibrary() {
        viewModelScope.launch {
            _isRefreshing.value = true
            try {
                // Implement library scanning logic here
                // For now, just simulate refresh
                kotlinx.coroutines.delay(1000)
            } finally {
                _isRefreshing.value = false
            }
        }
    }

    fun deleteComic(comic: Comic) {
        viewModelScope.launch {
            comicDao.deleteComic(comic)
        }
    }
}

enum class LibraryTab {
    ALL,
    FAVORITES,
    IN_PROGRESS,
    COMPLETED
}

enum class SortMode {
    DATE_ADDED,
    TITLE_ASC,
    TITLE_DESC,
    AUTHOR,
    PROGRESS,
    LAST_READ
}

data class LibraryStatistics(
    val totalComics: Int = 0,
    val readComics: Int = 0,
    val averageProgress: Float = 0f,
    val totalSize: Long = 0L
)