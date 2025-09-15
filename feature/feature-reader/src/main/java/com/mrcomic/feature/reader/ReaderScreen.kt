package com.mrcomic.feature.reader

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.mrcomic.core.common.Result
import com.mrcomic.core.model.ReadingMode
import com.mrcomic.core.ui.theme.MrComicReaderTheme
import com.mrcomic.feature.reader.components.ReaderBottomBar
import com.mrcomic.feature.reader.components.ReaderTopBar
import com.mrcomic.feature.reader.components.ReaderSettingsBottomSheet
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ReaderViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val comic by viewModel.comic.collectAsStateWithLifecycle()
    val pages by viewModel.pages.collectAsStateWithLifecycle()

    MrComicReaderTheme(
        darkTheme = true,
        sepiaMode = false
    ) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (pages) {
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
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.error
                            )
                            Text(
                                text = "Ошибка загрузки комикса",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Button(onClick = onBackClick) {
                                Text("Назад")
                            }
                        }
                    }
                }
                is Result.Success -> {
                    ReaderContent(
                        pages = pages.data,
                        uiState = uiState,
                        onPageChange = viewModel::updateCurrentPage,
                        onToggleUI = viewModel::toggleUIVisibility,
                        onNextPage = viewModel::nextPage,
                        onPreviousPage = viewModel::previousPage,
                        modifier = Modifier.fillMaxSize()
                    )

                    // UI Controls
                    AnimatedVisibility(
                        visible = uiState.isUIVisible,
                        enter = slideInVertically { -it } + fadeIn(),
                        exit = slideOutVertically { -it } + fadeOut()
                    ) {
                        ReaderTopBar(
                            title = when (comic) {
                                is Result.Success -> comic.data?.title ?: "Неизвестный комикс"
                                else -> "Загрузка..."
                            },
                            currentPage = uiState.currentPage + 1,
                            totalPages = uiState.totalPages,
                            onBackClick = onBackClick,
                            onSettingsClick = viewModel::showSettings,
                            modifier = Modifier.align(Alignment.TopCenter)
                        )
                    }

                    AnimatedVisibility(
                        visible = uiState.isUIVisible,
                        enter = slideInVertically { it } + fadeIn(),
                        exit = slideOutVertically { it } + fadeOut()
                    ) {
                        ReaderBottomBar(
                            currentPage = uiState.currentPage,
                            totalPages = uiState.totalPages,
                            onPageChange = viewModel::goToPage,
                            onPreviousPage = viewModel::previousPage,
                            onNextPage = viewModel::nextPage,
                            modifier = Modifier.align(Alignment.BottomCenter)
                        )
                    }
                }
            }

            // Settings bottom sheet
            if (uiState.showSettings) {
                ReaderSettingsBottomSheet(
                    uiState = uiState,
                    onReadingModeChange = viewModel::updateReadingMode,
                    onReadingDirectionChange = viewModel::updateReadingDirection,
                    onScalingModeChange = viewModel::updateScalingMode,
                    onBrightnessChange = viewModel::updateBrightness,
                    onDismiss = viewModel::hideSettings
                )
            }
        }
    }
}

@Composable
private fun ReaderContent(
    pages: List<ComicPage>,
    uiState: ReaderUiState,
    onPageChange: (Int) -> Unit,
    onToggleUI: () -> Unit,
    onNextPage: () -> Unit,
    onPreviousPage: () -> Unit,
    modifier: Modifier = Modifier
) {
    val pagerState = rememberPagerState(
        initialPage = uiState.currentPage,
        pageCount = { pages.size }
    )

    // Sync pager state with UI state
    LaunchedEffect(pagerState.currentPage) {
        if (pagerState.currentPage != uiState.currentPage) {
            onPageChange(pagerState.currentPage)
        }
    }

    // Sync UI state with pager state
    LaunchedEffect(uiState.currentPage) {
        if (pagerState.currentPage != uiState.currentPage) {
            pagerState.animateScrollToPage(uiState.currentPage)
        }
    }

    when (uiState.readingMode) {
        ReadingMode.PAGE_BY_PAGE -> {
            HorizontalPager(
                state = pagerState,
                modifier = modifier.pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { onToggleUI() }
                    )
                },
                reverseLayout = uiState.readingDirection == com.mrcomic.core.model.ReadingDirection.RIGHT_TO_LEFT
            ) { pageIndex ->
                if (pageIndex < pages.size) {
                    ComicPageContent(
                        page = pages[pageIndex],
                        scalingMode = uiState.scalingMode,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
        else -> {
            // Other reading modes would be implemented here
            HorizontalPager(
                state = pagerState,
                modifier = modifier.pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { onToggleUI() }
                    )
                }
            ) { pageIndex ->
                if (pageIndex < pages.size) {
                    ComicPageContent(
                        page = pages[pageIndex],
                        scalingMode = uiState.scalingMode,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}

@Composable
private fun ComicPageContent(
    page: ComicPage,
    scalingMode: com.mrcomic.core.model.ScalingMode,
    modifier: Modifier = Modifier
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(androidx.compose.ui.geometry.Offset.Zero) }

    val transformableState = rememberTransformableState { zoomChange, offsetChange, _ ->
        scale = (scale * zoomChange).coerceIn(0.5f, 5f)
        offset += offsetChange
    }

    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(page.url)
            .crossfade(true)
            .build(),
        contentDescription = "Page ${page.index + 1}",
        modifier = modifier
            .graphicsLayer(
                scaleX = scale,
                scaleY = scale,
                translationX = offset.x,
                translationY = offset.y
            )
            .transformable(state = transformableState),
        contentScale = when (scalingMode) {
            com.mrcomic.core.model.ScalingMode.FIT_WIDTH -> ContentScale.FillWidth
            com.mrcomic.core.model.ScalingMode.FIT_HEIGHT -> ContentScale.FillHeight
            com.mrcomic.core.model.ScalingMode.ORIGINAL_SIZE -> ContentScale.None
            com.mrcomic.core.model.ScalingMode.SMART_FIT -> ContentScale.Fit
        },
        loading = {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        },
        error = {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.BrokenImage,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                    Text(
                        text = "Ошибка загрузки страницы",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    )
}