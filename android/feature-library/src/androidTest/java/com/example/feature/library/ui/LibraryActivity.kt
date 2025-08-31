package com.example.feature.library.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.core.model.SortOrder
import com.example.feature.library.LibraryViewModel
import com.example.feature.library.ui.state.LibraryUiState

class LibraryActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create a mock view model for testing
        val mockViewModel = object : LibraryViewModel(null) {
            override val uiState = androidx.lifecycle.MutableLiveData(
                LibraryUiState(
                    comics = emptyList(),
                    isLoading = false,
                    inSelectionMode = false,
                    isSearchActive = false,
                    searchQuery = "",
                    sortOrder = SortOrder.TITLE_ASC,
                    selectedComicIds = emptySet(),
                    pendingDeletionIds = emptySet()
                )
            )
        }
        
        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                LibraryScreen(
                    viewModel = mockViewModel,
                    onBookClick = {},
                    onSettingsClick = {},
                    onPluginsClick = {},
                    onAddClick = {}
                )
            }
        }
    }
}