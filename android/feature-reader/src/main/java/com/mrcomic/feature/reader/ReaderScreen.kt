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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import com.mrcomic.core.ui.components.MrComicButton
import com.mrcomic.core.ui.components.ButtonVariant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    comicId: String,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ReaderViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var isControlsVisible by remember { mutableStateOf(true) }
    var showReaderMenu by remember { mutableStateOf(false) }
    val pagerState = rememberPagerState(
        initialPage = uiState.currentPage,
        pageCount = { uiState.totalPages }
    )
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(comicId) {
        viewModel.loadComic(comicId)
    }

    LaunchedEffect(pagerState.currentPage) {
        if (pagerState.currentPage != uiState.currentPage) {
            viewModel.updateReadingProgress(pagerState.currentPage)
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        if (uiState.isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center)
            )
        } else if (uiState.error != null) {
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Ошибка загрузки: ${uiState.error}",
                    color = MaterialTheme.colorScheme.error
                )
                MrComicButton(
                    onClick = { viewModel.loadComic(comicId) },
                    modifier = Modifier.padding(top = 16.dp),
                    variant = ButtonVariant.Primary
                ) {
                    Text("Повторить")
                }
            }
        } else {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier
                    .fillMaxSize()
                    .clickable { isControlsVisible = !isControlsVisible }
            ) { page ->
                AsyncImage(
                    model = uiState.pages.getOrNull(page)?.imageUrl,
                    contentDescription = "Страница ${page + 1}",
                    contentScale = ContentScale.Fit,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        if (isControlsVisible && !uiState.isLoading) {
            TopAppBar(
                title = { Text(uiState.comic?.title ?: "Читалка") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                },
                actions = {
                    MrComicButton(
                        onClick = onBackClick,
                        variant = ButtonVariant.Ghost
                    ) {
                        Text("Выйти", color = Color.White)
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

        if (isControlsVisible && !uiState.isLoading) {
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
                        coroutineScope.launch {
                            if (pagerState.currentPage > 0) {
                                pagerState.animateScrollToPage(pagerState.currentPage - 1)
                            }
                        }
                    },
                    enabled = pagerState.currentPage > 0
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Предыдущая", tint = Color.White)
                }

                Text(
                    text = "${pagerState.currentPage + 1} / ${uiState.totalPages}",
                    color = Color.White,
                    style = MaterialTheme.typography.bodyMedium
                )

                IconButton(onClick = { showReaderMenu = true }) {
                    Icon(Icons.Default.Menu, contentDescription = "Меню", tint = Color.White)
                }

                IconButton(
                    onClick = { 
                        coroutineScope.launch {
                            if (pagerState.currentPage < uiState.totalPages - 1) {
                                pagerState.animateScrollToPage(pagerState.currentPage + 1)
                            }
                        }
                    },
                    enabled = pagerState.currentPage < uiState.totalPages - 1
                ) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "Следующая", tint = Color.White)
                }
            }
        }

        if (showReaderMenu) {
            ReaderMenuDialog(
                onDismiss = { showReaderMenu = false },
                onTableOfContents = { viewModel.showTableOfContents() },
                onBookmarks = { viewModel.showBookmarks() },
                onSearch = { viewModel.showSearch() },
                onSettings = { viewModel.showSettings() }
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
                MrComicButton(
                    onClick = { onTableOfContents(); onDismiss() },
                    modifier = Modifier.fillMaxWidth(),
                    variant = ButtonVariant.Ghost,
                    icon = Icons.Default.List
                ) {
                    Text("Table of Contents")
                }
                MrComicButton(
                    onClick = { onBookmarks(); onDismiss() },
                    modifier = Modifier.fillMaxWidth(),
                    variant = ButtonVariant.Ghost,
                    icon = Icons.Default.Bookmark
                ) {
                    Text("Bookmarks")
                }
                MrComicButton(
                    onClick = { onSearch(); onDismiss() },
                    modifier = Modifier.fillMaxWidth(),
                    variant = ButtonVariant.Ghost,
                    icon = Icons.Default.Search
                ) {
                    Text("Search")
                }
                MrComicButton(
                    onClick = { onSettings(); onDismiss() },
                    modifier = Modifier.fillMaxWidth(),
                    variant = ButtonVariant.Ghost,
                    icon = Icons.Default.Settings
                ) {
                    Text("Settings")
                }
            }
        },
        confirmButton = {
            MrComicButton(
                onClick = onDismiss,
                variant = ButtonVariant.Ghost
            ) {
                Text("Закрыть")
            }
        }
    )
}
