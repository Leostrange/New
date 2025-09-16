package com.mrcomic.ui.library

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

data class Comic(
    val id: String,
    val title: String,
    val author: String,
    val coverUrl: String,
    val progress: Float = 0f,
    val totalPages: Int = 0,
    val currentPage: Int = 0
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(
    onComicClick: (Comic) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val sampleComics = remember {
        listOf(
            Comic("1", "Spider-Man", "Stan Lee", "/placeholder.svg?height=200&width=140", 0.3f, 100, 30),
            Comic("2", "Batman", "Bob Kane", "/placeholder.svg?height=200&width=140", 0.7f, 80, 56),
            Comic("3", "X-Men", "Stan Lee", "/placeholder.svg?height=200&width=140", 0.1f, 120, 12),
            Comic("4", "Wonder Woman", "William Moulton", "/placeholder.svg?height=200&width=140", 0.9f, 90, 81),
            Comic("5", "The Flash", "Gardner Fox", "/placeholder.svg?height=200&width=140", 0.5f, 110, 55),
            Comic("6", "Green Lantern", "Bill Finger", "/placeholder.svg?height=200&width=140", 0.0f, 95, 0)
        )
    }
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Библиотека", "Облако", "Аннотации", "Плагины")

    Column(modifier = modifier.fillMaxSize()) {
        // Верхняя панель с поиском
        TopAppBar(
            title = {
                Text(
                    text = "Моя библиотека ${sampleComics.size}",
                    style = MaterialTheme.typography.headlineSmall
                )
            },
            actions = {
                IconButton(onClick = { /* TODO: Implement search */ }) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Поиск"
                    )
                }
            }
        )

        // Табы
        TabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                )
            }
        }

        // Контент библиотеки
        when (selectedTab) {
            0 -> LibraryContent(
                comics = sampleComics,
                onComicClick = onComicClick,
                modifier = Modifier.fillMaxSize()
            )
            else -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Раздел \"${tabs[selectedTab]}\" в разработке",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
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
        columns = GridCells.Fixed(3),
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
        modifier = modifier.fillMaxWidth()
    ) {
        Column {
            // Обложка комикса
            AsyncImage(
                model = comic.coverUrl,
                contentDescription = comic.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(0.7f)
            )

            // Информация о комиксе
            Column(
                modifier = Modifier.padding(8.dp)
            ) {
                Text(
                    text = comic.title,
                    style = MaterialTheme.typography.titleSmall,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Text(
                    text = comic.author,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 2.dp)
                )

                // Прогресс чтения
                if (comic.progress > 0) {
                    LinearProgressIndicator(
                        progress = comic.progress,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp)
                    )
                    Text(
                        text = "${comic.currentPage}/${comic.totalPages}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        }
    }
}
