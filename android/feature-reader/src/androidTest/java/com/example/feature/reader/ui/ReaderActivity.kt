package com.example.feature.reader.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.feature.reader.ui.state.ReaderUiState
import com.example.feature.reader.ui.state.ReadingMode

class ReaderActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create a mock UI state for testing
        val mockUiState = ReaderUiState(
            isLoading = false,
            error = null,
            pageCount = 10,
            currentPageIndex = 0,
            readingMode = ReadingMode.PAGE,
            currentPageBitmap = null,
            bitmaps = emptyMap()
        )
        
        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                ReaderScreenContent(
                    uiState = mockUiState,
                    onNextPage = {},
                    onPreviousPage = {},
                    onSetReadingMode = {},
                    onShowBookmarksNotes = {},
                    onShowMiniMap = {},
                    onToggleBookmark = {},
                    isCurrentPageBookmarked = false,
                    backgroundColor = androidx.compose.ui.graphics.Color.White
                )
            }
        }
    }
}