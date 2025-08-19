package com.mrcomic.ui.reader

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    comicTitle: String,
    pages: List<String>,
    initialPage: Int = 0,
    onBackClick: () -> Unit,
    onMenuClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val pagerState = rememberPagerState(
        initialPage = initialPage,
        pageCount = { pages.size }
    )
    val scope = rememberCoroutineScope()
    var isUIVisible by remember { mutableStateOf(true) }

    Box(modifier = modifier.fillMaxSize()) {
        // Основной контент - страницы комикса
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxSize()
                .clickable { isUIVisible = !isUIVisible }
        ) { page ->
            AsyncImage(
                model = pages[page],
                contentDescription = "Страница ${page + 1}",
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize()
            )
        }

        // Верхняя панель
        if (isUIVisible) {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = comicTitle,
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = "Глава ${(pagerState.currentPage / 20) + 1}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Назад"
                        )
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
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Нижняя панель с навигацией
        if (isUIVisible) {
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color.Black.copy(alpha = 0.8f)
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Кнопка "Назад"
                    IconButton(
                        onClick = {
                            scope.launch {
                                if (pagerState.currentPage > 0) {
                                    pagerState.animateScrollToPage(pagerState.currentPage - 1)
                                }
                            }
                        },
                        enabled = pagerState.currentPage > 0
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Предыдущая страница",
                            tint = Color.White
                        )
                    }

                    // Прогресс и номер страницы
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "${pagerState.currentPage + 1} / ${pages.size}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White
                        )
                        LinearProgressIndicator(
                            progress = (pagerState.currentPage + 1).toFloat() / pages.size,
                            modifier = Modifier
                                .width(120.dp)
                                .padding(top = 4.dp),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Кнопка "Вперед"
                    IconButton(
                        onClick = {
                            scope.launch {
                                if (pagerState.currentPage < pages.size - 1) {
                                    pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                }
                            }
                        },
                        enabled = pagerState.currentPage < pages.size - 1
                    ) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Следующая страница",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    }
}
