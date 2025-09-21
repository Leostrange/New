package com.mrcomic.feature.library

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
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
                    Text("Mr.Comic")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${uiState.comics.size}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            actions = {
                IconButton(onClick = { viewModel.openFilePicker() }) {
                    Icon(Icons.Default.Add, contentDescription = "Добавить комикс")
                }
                IconButton(onClick = { viewModel.toggleSearch() }) {
                    Icon(Icons.Default.Search, contentDescription = "Поиск")
                }
                IconButton(onClick = { viewModel.toggleViewMode() }) {
                    Icon(
                        if (uiState.isGridView) Icons.Default.ViewList else Icons.Default.GridView, 
                        contentDescription = "Режим просмотра"
                    )
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
            0 -> {
                if (uiState.comics.isEmpty()) {
                    WelcomeContent(
                        onAddComicClick = { viewModel.openFilePicker() }
                    )
                } else {
                    LibraryContent(
                        comics = uiState.filteredComics,
                        onComicClick = onComicClick,
                        isGridView = uiState.isGridView,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
            1 -> CloudContent()
            2 -> AnnotationsContent()
            3 -> PluginsContent()
        }
    }
}

@Composable
private fun WelcomeContent(
    onAddComicClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.MenuBook,
            contentDescription = null,
            modifier = Modifier.size(120.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "Добро пожаловать в Mr.Comic!",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Начните читать комиксы, добавив их из файлов на устройстве",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = onAddComicClick,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.Add, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Добавить комикс")
        }
    }
}

@Composable
private fun LibraryContent(
    comics: List<Comic>,
    onComicClick: (Comic) -> Unit,
    isGridView: Boolean,
    modifier: Modifier = Modifier
) {
    if (isGridView) {
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
    } else {
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = modifier
        ) {
            items(comics) { comic ->
                ComicListItem(
                    comic = comic,
                    onClick = { onComicClick(comic) }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ComicListItem(
    comic: Comic,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = comic.coverPath,
                contentDescription = comic.title,
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = android.R.drawable.ic_menu_gallery),
                modifier = Modifier
                    .size(60.dp)
                    .aspectRatio(0.7f)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = comic.title,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                
                if (comic.progress > 0) {
                    Text(
                        text = "Прочитано ${(comic.progress * 100).toInt()}%",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    LinearProgressIndicator(
                        progress = comic.progress,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp)
                    )
                }
            }
        }
    }
}

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
