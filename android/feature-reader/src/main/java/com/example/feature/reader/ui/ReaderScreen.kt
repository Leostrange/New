package com.example.feature.reader.ui

import android.graphics.Bitmap
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.SizeTransform
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.with
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ViewDay
import androidx.compose.material.icons.filled.ViewStream
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.input.pointer.pointerInput
import com.example.feature.reader.ui.components.SwipeableZoomablePannableImage
import com.example.feature.reader.ui.components.NavigationDirection
import com.example.feature.reader.ui.components.BookmarksNotesDialog
import com.example.feature.reader.ui.components.ComicMiniMapDialog
import com.example.feature.reader.ui.components.ComicMiniMapFab
import com.example.feature.reader.ui.components.ComicProgressIndicator

/**
 * The main entry point for the reader screen.
 * It is a stateful composable that holds the ViewModel.
 * The URI is automatically received from navigation via SavedStateHandle.
 *
 * @param viewModel The ViewModel responsible for the reader logic.
 */
@Composable
fun ReaderScreen(
    viewModel: ReaderViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val bgColor by viewModel.background.collectAsState()
    val bookmarks by viewModel.bookmarks.collectAsState()
    val notes by viewModel.notes.collectAsState()
    val isCurrentPageBookmarked by viewModel.isCurrentPageBookmarked.collectAsState()
    val context = LocalContext.current
    
    var showBookmarksNotesDialog by remember { mutableStateOf(false) }
    var showMiniMapDialog by remember { mutableStateOf(false) }

    // Show error toast when error state changes
    LaunchedEffect(uiState.error) {
        uiState.error?.let { error ->
            Toast.makeText(context, "Ошибка: $error", Toast.LENGTH_LONG).show()
        }
    }

    ReaderScreenContent(
        uiState = uiState,
        onNextPage = viewModel::goToNextPage,
        onPreviousPage = viewModel::goToPreviousPage,
        onSetReadingMode = viewModel::setReadingMode,
        onShowBookmarksNotes = { showBookmarksNotesDialog = true },
        onShowMiniMap = { showMiniMapDialog = true },
        onToggleBookmark = { viewModel.toggleBookmark() },
        isCurrentPageBookmarked = isCurrentPageBookmarked,
        backgroundColor = Color(bgColor)
    )
    
    // Bookmarks and Notes Dialog
    if (showBookmarksNotesDialog) {
        BookmarksNotesDialog(
            comicId = viewModel.getCurrentComicId(), // Use actual comic ID from ViewModel
            currentPage = uiState.currentPageIndex,
            bookmarks = bookmarks,
            notes = notes,
            isCurrentPageBookmarked = isCurrentPageBookmarked,
            onDismiss = { showBookmarksNotesDialog = false },
            onAddBookmark = { page, label -> viewModel.addBookmark(page, label) },
            onDeleteBookmark = { bookmark -> viewModel.deleteBookmark(bookmark) },
            onJumpToPage = { page -> 
                viewModel.jumpToPage(page)
                showBookmarksNotesDialog = false
            },
            onAddNote = { page, content, title -> viewModel.addNote(page, content, title) },
            onEditNote = { note -> viewModel.updateNote(note) },
            onDeleteNote = { note -> viewModel.deleteNote(note) }
        )
    }
    
    // Mini Map Dialog
    if (showMiniMapDialog) {
        ComicMiniMapDialog(
            currentPage = uiState.currentPageIndex,
            totalPages = uiState.pageCount,
            bookmarks = bookmarks,
            notes = notes,
            onDismiss = { showMiniMapDialog = false },
            onPageSelected = { page ->
                viewModel.jumpToPage(page)
                showMiniMapDialog = false
            }
        )
    }
}

/**
 * A stateless composable that displays the reader UI.
 *
 * @param uiState The current state of the UI.
 * @param onNextPage Callback for navigating to the next page.
 * @param onPreviousPage Callback for navigating to the previous page.
 */
@OptIn(ExperimentalAnimationApi::class)
@Composable
private fun ReaderScreenContent(
    uiState: ReaderUiState,
    onNextPage: () -> Unit,
    onPreviousPage: () -> Unit,
    onSetReadingMode: (ReadingMode) -> Unit,
    onShowBookmarksNotes: () -> Unit,
    onShowMiniMap: () -> Unit,
    onToggleBookmark: () -> Unit,
    isCurrentPageBookmarked: Boolean,
    backgroundColor: Color
) {
    Scaffold(
        bottomBar = {
            if (!uiState.isLoading && uiState.error == null && uiState.pageCount > 0) {
                Column {
                    // Progress indicator
                    ComicProgressIndicator(
                        currentPage = uiState.currentPageIndex,
                        totalPages = uiState.pageCount,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                    
                    BottomAppBar {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Bookmark button
                            IconButton(onClick = onToggleBookmark) {
                                Icon(
                                    imageVector = if (isCurrentPageBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                    contentDescription = if (isCurrentPageBookmarked) "Remove bookmark" else "Add bookmark",
                                    tint = if (isCurrentPageBookmarked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                                )
                            }
                            
                            // Page counter
                            Text(
                                text = "Page ${uiState.currentPageIndex + 1} of ${uiState.pageCount}",
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                            
                            // Reading mode toggle
                            IconButton(onClick = {
                                val newMode = if (uiState.readingMode == ReadingMode.PAGE) ReadingMode.WEBTOON else ReadingMode.PAGE
                                onSetReadingMode(newMode)
                            }) {
                                Icon(
                                    imageVector = if (uiState.readingMode == ReadingMode.PAGE) Icons.Default.ViewStream else Icons.Default.ViewDay,
                                    contentDescription = "Switch Reading Mode"
                                )
                            }
                            
                            // Bookmarks & Notes button
                            TextButton(onClick = onShowBookmarksNotes) {
                                Text("Notes")
                            }
                        }
                    }
                }
            }
        },
        floatingActionButton = {
            if (!uiState.isLoading && uiState.error == null && uiState.pageCount > 0) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ComicMiniMapFab(
                        onShowMiniMap = onShowMiniMap
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(backgroundColor),
            contentAlignment = Alignment.Center
        ) {
            when {
                uiState.isLoading -> {
                    // Show loading indicator
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                uiState.error != null -> {
                    // Show error message
                    Text(
                        text = uiState.error,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                uiState.pageCount > 0 -> {
                    // Show content
                    when (uiState.readingMode) {
                        ReadingMode.PAGE -> PagedReader(uiState, onNextPage, onPreviousPage)
                        ReadingMode.WEBTOON -> WebtoonReader(uiState)
                    }
                }
                else -> {
                    // Show empty state
                    Text(
                        text = "Выберите файл для чтения",
                        color = MaterialTheme.colorScheme.onSurface,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalAnimationApi::class)
@Composable
private fun PagedReader(
    uiState: ReaderUiState,
    onNextPage: () -> Unit,
    onPreviousPage: () -> Unit
) {
    AnimatedContent(
        targetState = uiState,
        transitionSpec = {
            val forward = targetState.currentPageIndex > initialState.currentPageIndex
            val slideIn = slideInHorizontally { fullWidth -> if (forward) fullWidth else -fullWidth }
            val slideOut = slideOutHorizontally { fullWidth -> if (forward) -fullWidth else fullWidth }
            (slideIn with slideOut).using(SizeTransform(clip = false))
        },
        label = "PageSlider"
    ) { targetState ->
        BoxWithConstraints(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            targetState.currentPageBitmap?.let { bitmap ->
                SwipeableZoomablePannableImage(
                    bitmap = bitmap,
                    contentDescription = "Page ${targetState.currentPageIndex + 1}",
                    modifier = Modifier.fillMaxSize(),
                    onTap = { offset ->
                        // Handle tap events for UI controls or other interactions
                    },
                    onDoubleTap = {
                        // Double tap handled by zoom functionality
                    },
                    onPageNavigation = { direction ->
                        when (direction) {
                            NavigationDirection.PREVIOUS -> onPreviousPage()
                            NavigationDirection.NEXT -> onNextPage()
                        }
                    },
                    onSwipe = { direction ->
                        when (direction) {
                            NavigationDirection.PREVIOUS -> onPreviousPage()
                            NavigationDirection.NEXT -> onNextPage()
                        }
                    },
                    minZoom = 1f,
                    maxZoom = 5f,
                    contentScale = ContentScale.Fit,
                    enablePageNavigation = true,
                    enableSwipeNavigation = true,
                    swipeThreshold = 100f
                )
            }
        }
    }
}

@Composable
private fun WebtoonReader(
    uiState: ReaderUiState
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        items(uiState.pageCount, key = { it }) { pageIndex ->
            WebtoonPageItem(pageIndex = pageIndex, uiState = uiState)
        }
    }
}

@Composable
private fun WebtoonPageItem(
    pageIndex: Int,
    uiState: ReaderUiState
) {
    val bitmap = uiState.bitmaps[pageIndex]

    if (bitmap != null) {
        Image(
            painter = remember(bitmap) { BitmapPainter(bitmap.asImageBitmap()) },
            contentDescription = "Page ${pageIndex + 1}",
            modifier = Modifier.fillMaxWidth(),
            contentScale = ContentScale.FillWidth
        )
    } else {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
        ) {
            // Placeholder with a common aspect ratio
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        }
    }
}


