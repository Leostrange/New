package com.mrcomic.feature.reader

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    comicId: String,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isControlsVisible by remember { mutableStateOf(true) }
    var showReaderMenu by remember { mutableStateOf(false) }
    val pages = remember { generateSamplePages() }
    val pagerState = rememberPagerState(pageCount = { pages.size })

    Box(modifier = modifier.fillMaxSize()) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxSize()
                .clickable { isControlsVisible = !isControlsVisible }
        ) { page ->
            AsyncImage(
                model = pages[page],
                contentDescription = "Page ${page + 1}",
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize()
            )
        }

        if (isControlsVisible) {
            TopAppBar(
                title = { Text("Глава 3") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                },
                actions = {
                    TextButton(onClick = onBackClick) {
                        Text("Выйти")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Black.copy(alpha = 0.7f),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                    actionIconContentColor = Color.White
                ),
                modifier = Modifier.background(Color.Black.copy(alpha = 0.7f))
            )
        }

        if (isControlsVisible) {
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.7f))
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { 
                        if (pagerState.currentPage > 0) {
                            // Navigate to previous page
                        }
                    },
                    enabled = pagerState.currentPage > 0
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Предыдущая", tint = Color.White)
                }

                Text(
                    text = "${pagerState.currentPage + 1} / ${pages.size}",
                    color = Color.White,
                    style = MaterialTheme.typography.bodyMedium
                )

                IconButton(onClick = { showReaderMenu = true }) {
                    Icon(Icons.Default.Menu, contentDescription = "Меню", tint = Color.White)
                }

                IconButton(
                    onClick = { 
                        if (pagerState.currentPage < pages.size - 1) {
                            // Navigate to next page
                        }
                    },
                    enabled = pagerState.currentPage < pages.size - 1
                ) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "Следующая", tint = Color.White)
                }
            }
        }

        if (showReaderMenu) {
            ReaderMenuDialog(
                onDismiss = { showReaderMenu = false },
                onTableOfContents = { /* TODO */ },
                onBookmarks = { /* TODO */ },
                onSearch = { /* TODO */ },
                onSettings = { /* TODO */ }
            )
        }
    }
}

@Composable
private fun ReaderMenuDialog(
    onDismiss: () -> Unit,
    onTableOfContents: () -> Unit,
    onBookmarks: () -> Unit,
    onSearch: () -> Unit,
    onSettings: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Reader Menu") },
        text = {
            Column {
                TextButton(
                    onClick = { onTableOfContents(); onDismiss() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.List, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Table of Contents")
                    }
                }
                TextButton(
                    onClick = { onBookmarks(); onDismiss() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Bookmark, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Bookmarks")
                    }
                }
                TextButton(
                    onClick = { onSearch(); onDismiss() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Search, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Search")
                    }
                }
                TextButton(
                    onClick = { onSettings(); onDismiss() },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Settings, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Settings")
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

private fun generateSamplePages(): List<String> {
    return (1..24).map { "https://example.com/page$it.jpg" }
}
