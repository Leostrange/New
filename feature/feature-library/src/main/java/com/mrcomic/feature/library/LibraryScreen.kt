package com.mrcomic.feature.library

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.mrcomic.core.common.Result
import com.mrcomic.core.model.Comic
import com.mrcomic.core.ui.components.ComicCard
import com.mrcomic.feature.library.components.LibraryTopBar
import com.mrcomic.feature.library.components.LibraryTabRow
import com.mrcomic.feature.library.components.LibraryEmptyState
import com.mrcomic.feature.library.components.LibraryStats

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(
    windowSizeClass: WindowSizeClass,
    onComicClick: (String) -> Unit,
    onSearchClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: LibraryViewModel = hiltViewModel()
) {
    val comics by viewModel.comics.collectAsStateWithLifecycle()
    val libraryStats by viewModel.libraryStats.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedTab by viewModel.selectedTab.collectAsStateWithLifecycle()
    val sortMode by viewModel.sortMode.collectAsStateWithLifecycle()
    val isGridView by viewModel.isGridView.collectAsStateWithLifecycle()
    val isRefreshing by viewModel.isRefreshing.collectAsStateWithLifecycle()

    var showSortDialog by remember { mutableStateOf(false) }
    var showStatsDialog by remember { mutableStateOf(false) }

    Column(
        modifier = modifier.fillMaxSize()
    ) {
        LibraryTopBar(
            searchQuery = searchQuery,
            onSearchQueryChange = viewModel::updateSearchQuery,
            onSearchClick = onSearchClick,
            isGridView = isGridView,
            onToggleViewMode = viewModel::toggleViewMode,
            onSortClick = { showSortDialog = true },
            onStatsClick = { showStatsDialog = true },
            onRefresh = viewModel::refreshLibrary,
            isRefreshing = isRefreshing
        )

        LibraryTabRow(
            selectedTab = selectedTab,
            onTabSelected = viewModel::selectTab,
            modifier = Modifier.fillMaxWidth()
        )

        when (comics) {
            is Result.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is Result.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Error,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.error
                        )
                        Text(
                            text = "Ошибка загрузки библиотеки",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Button(onClick = viewModel::refreshLibrary) {
                            Text("Повторить")
                        }
                    }
                }
            }
            is Result.Success -> {
                if (comics.data.isEmpty()) {
                    LibraryEmptyState(
                        selectedTab = selectedTab,
                        searchQuery = searchQuery,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    LibraryContent(
                        comics = comics.data,
                        windowSizeClass = windowSizeClass,
                        isGridView = isGridView,
                        onComicClick = onComicClick,
                        onFavoriteClick = viewModel::toggleFavorite,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }

    // Sort dialog
    if (showSortDialog) {
        SortDialog(
            currentSort = sortMode,
            onSortSelected = { mode ->
                viewModel.updateSortMode(mode)
                showSortDialog = false
            },
            onDismiss = { showSortDialog = false }
        )
    }

    // Stats dialog
    if (showStatsDialog) {
        when (libraryStats) {
            is Result.Success -> {
                LibraryStats(
                    statistics = libraryStats.data,
                    onDismiss = { showStatsDialog = false }
                )
            }
            else -> {
                showStatsDialog = false
            }
        }
    }
}

@Composable
private fun LibraryContent(
    comics: List<Comic>,
    windowSizeClass: WindowSizeClass,
    isGridView: Boolean,
    onComicClick: (String) -> Unit,
    onFavoriteClick: (Comic) -> Unit,
    modifier: Modifier = Modifier
) {
    val columns = when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> if (isGridView) 2 else 1
        WindowWidthSizeClass.Medium -> if (isGridView) 3 else 1
        WindowWidthSizeClass.Expanded -> if (isGridView) 4 else 2
        else -> if (isGridView) 2 else 1
    }

    if (isGridView) {
        LazyVerticalGrid(
            columns = GridCells.Fixed(columns),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = modifier
        ) {
            items(comics, key = { it.id }) { comic ->
                ComicCard(
                    comic = comic,
                    onClick = { onComicClick(comic.id) },
                    onFavoriteClick = onFavoriteClick,
                    showProgress = true,
                    showFavorite = true
                )
            }
        }
    } else {
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = modifier
        ) {
            items(comics, key = { it.id }) { comic ->
                ComicCard(
                    comic = comic,
                    onClick = { onComicClick(comic.id) },
                    onFavoriteClick = onFavoriteClick,
                    showProgress = true,
                    showFavorite = true,
                    modifier = Modifier.height(120.dp)
                )
            }
        }
    }
}

@Composable
private fun SortDialog(
    currentSort: SortMode,
    onSortSelected: (SortMode) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Сортировка") },
        text = {
            Column {
                SortMode.values().forEach { mode ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = currentSort == mode,
                            onClick = { onSortSelected(mode) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = when (mode) {
                                SortMode.DATE_ADDED -> "По дате добавления"
                                SortMode.TITLE_ASC -> "По названию (А-Я)"
                                SortMode.TITLE_DESC -> "По названию (Я-А)"
                                SortMode.AUTHOR -> "По автору"
                                SortMode.PROGRESS -> "По прогрессу"
                                SortMode.LAST_READ -> "По последнему чтению"
                            }
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Закрыть")
            }
        }
    )
}