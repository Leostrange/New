package com.mrcomic.feature.library

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.mrcomic.core.model.Comic

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(
    onComicClick: (Comic) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: LibraryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Библиотека", "Облако", "Аннотации", "Плагины")

    Column(modifier = modifier.fillMaxSize()) {
        TopAppBar(
            title = { 
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Моя библиотека")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${uiState.comics.size}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            actions = {
                IconButton(onClick = { viewModel.toggleSearch() }) {
                    Icon(Icons.Default.Search, contentDescription = "Поиск")
                }
                IconButton(onClick = { /* TODO: Toggle grid/list view */ }) {
                    Icon(Icons.Default.GridView, contentDescription = "Режим просмотра")
                }
            }
        )

        if (uiState.isSearchVisible) {
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::updateSearchQuery,
                label = { Text("Поиск комиксов...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        TabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }

        when (selectedTab) {
            0 -> LibraryContent(
                comics = uiState.filteredComics,
                onComicClick = onComicClick,
                modifier = Modifier.fillMaxSize()
            )
            1 -> CloudContent()
            2 -> AnnotationsContent()
            3 -> PluginsContent()
        }
    }
}

@Composable
private fun LibraryContent(
    comics: List<Comic>,
    onComicClick: (Comic) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 120.dp),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = modifier
    ) {
        items(comics) { comic ->
            ComicCard(
                comic = comic,
                onClick = { onComicClick(comic) }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ComicCard(
    comic: Comic,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.aspectRatio(0.7f)
    ) {
        Column {
            AsyncImage(
                model = comic.coverPath,
                contentDescription = comic.title,
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery),
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            )
            
            Column(
                modifier = Modifier.padding(8.dp)
            ) {
                Text(
                    text = comic.title,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                if (comic.progress > 0) {
                    LinearProgressIndicator(
                        progress = comic.progress,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun CloudContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Облачное хранилище")
    }
}

@Composable
private fun AnnotationsContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Аннотации")
    }
}

@Composable
private fun PluginsContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Плагины")
    }
}
