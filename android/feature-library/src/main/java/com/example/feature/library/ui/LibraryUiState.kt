package com.example.feature.library.ui

import androidx.compose.runtime.Immutable
import com.example.core.model.Comic
import com.example.core.model.SortOrder

@Immutable
data class LibraryUiState(
    val isLoading: Boolean = true,
    val comics: List<Comic> = emptyList(),
    val error: String? = null,
    val sortOrder: SortOrder = SortOrder.DATE_ADDED_DESC,
    val searchQuery: String = "",
    val isSearchActive: Boolean = false,
    val inSelectionMode: Boolean = false,
    val selectedComicIds: Set<String> = emptySet(),
    val pendingDeletionIds: Set<String> = emptySet(),
    // Comic counter implementation for Issue #24
    val totalComicsCount: Int = 0,
    val visibleComicsCount: Int = 0,
    // Pagination support for lazy loading
    val currentPage: Int = 0,
    val itemsPerPage: Int = 20, // Default page size
    val hasMoreItems: Boolean = true,
    val isLoadingMore: Boolean = false,
    val enablePagination: Boolean = true, // Can be disabled for small libraries
    val displayedComics: List<Comic> = emptyList(), // Currently displayed comics with pagination
    // Import progress tracking
    val importProgress: ImportProgress? = null,
    // Export data
    val exportData: String? = null
)

/**
 * Represents the progress of comic import operations
 */
data class ImportProgress(
    val operationType: ImportOperationType,
    val fileName: String,
    val progressPercentage: Float = 0f,
    val downloadedBytes: Long = 0L,
    val totalBytes: Long = 0L,
    val isIndeterminate: Boolean = false,
    val statusMessage: String = ""
)

/**
 * Types of import operations
 */
enum class ImportOperationType {
    DOWNLOADING,
    EXTRACTING,
    PROCESSING,
    VALIDATING,
    SAVING
}