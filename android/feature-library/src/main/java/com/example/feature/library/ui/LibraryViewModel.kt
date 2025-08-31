package com.example.feature.library.ui

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.core.data.repository.ComicRepository
import com.example.core.model.Comic
import com.example.core.model.LibraryExport
import com.example.core.model.SortOrder
import com.example.feature.library.ui.ImportProgress
import com.example.feature.library.ui.ImportOperationType
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject
import java.io.File
import java.util.UUID

/**
 * ViewModel for the Library screen
 * Manages comic data, search, sorting, and user interactions
 * 
 * @property comicRepository Repository for comic data operations
 * @property gson Gson instance for JSON serialization
 */
@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val comicRepository: ComicRepository,
    private val gson: Gson
) : ViewModel() {

    private val _uiState = MutableStateFlow(LibraryUiState())
    val uiState = _uiState.asStateFlow()

    init {
        observeComics()
    }

    /**
     * Observes comic data changes and updates UI state accordingly
     * Handles sorting, searching, filtering, and pagination of comics
     */
    private fun observeComics() {
        viewModelScope.launch {
            // Collect UI state changes
            _uiState.collect { uiState ->
                // Launch a new coroutine for each state change to avoid nested collectLatest
                launch {
                    comicRepository.getComics(uiState.sortOrder, uiState.searchQuery).collect { comics ->
                        val visibleComics = comics.filter { comic ->
                            comic.filePath !in uiState.pendingDeletionIds
                        }
                        
                        // Apply pagination if enabled and library is large
                        val shouldPaginate = uiState.enablePagination && visibleComics.size > uiState.itemsPerPage
                        val displayedComics = if (shouldPaginate) {
                            val endIndex = kotlin.math.min(
                                (uiState.currentPage + 1) * uiState.itemsPerPage,
                                visibleComics.size
                            )
                            visibleComics.take(endIndex)
                        } else {
                            visibleComics
                        }
                        
                        val hasMoreItems = shouldPaginate && 
                            displayedComics.size < visibleComics.size
                        
                        _uiState.update { currentState ->
                            currentState.copy(
                                isLoading = false,
                                isLoadingMore = false,
                                comics = comics,
                                displayedComics = displayedComics,
                                totalComicsCount = comics.size,
                                visibleComicsCount = visibleComics.size,
                                hasMoreItems = hasMoreItems,
                                enablePagination = shouldPaginate
                            )
                        }
                    }
                }
            }
        }
    }

    /**
     * Handles permission grant and refreshes comic data
     * Called when user grants necessary permissions for file access
     */
    fun onPermissionsGranted() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                comicRepository.refreshComicsIfEmpty()
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "An unknown error occurred"
                    )
                }
            }
        }
    }

    fun onSearchQueryChange(query: String) {
        resetPagination()
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun onToggleSearch() {
        resetPagination()
        _uiState.update { it.copy(isSearchActive = !it.isSearchActive, searchQuery = "") }
    }

    fun onSortOrderChange(sortOrder: SortOrder) {
        resetPagination()
        _uiState.update { it.copy(sortOrder = sortOrder) }
    }

    fun onComicSelected(comicId: String) {
        _uiState.update { currentState ->
            val selectedIds = currentState.selectedComicIds.toMutableSet()
            if (selectedIds.contains(comicId)) {
                selectedIds.remove(comicId)
            } else {
                selectedIds.add(comicId)
            }
            val inSelectionMode = selectedIds.isNotEmpty()
            currentState.copy(
                selectedComicIds = selectedIds,
                inSelectionMode = inSelectionMode
            )
        }
    }

    fun onEnterSelectionMode(initialComicId: String) {
        _uiState.update {
            it.copy(inSelectionMode = true, selectedComicIds = setOf(initialComicId))
        }
    }

    fun onClearSelection() {
        _uiState.update { it.copy(inSelectionMode = false, selectedComicIds = emptySet()) }
    }

    fun onDeleteRequest() {
        val selectedIds = _uiState.value.selectedComicIds
        if (selectedIds.isEmpty()) return

        _uiState.update { currentState ->
            val newPendingDeletionIds = currentState.pendingDeletionIds + selectedIds
            val visibleComics = currentState.comics.filter { comic ->
                comic.filePath !in newPendingDeletionIds
            }
            
            currentState.copy(
                pendingDeletionIds = newPendingDeletionIds,
                inSelectionMode = false,
                selectedComicIds = emptySet(),
                visibleComicsCount = visibleComics.size
            )
        }
    }

    fun onUndoDelete() {
        _uiState.update { currentState ->
            currentState.copy(
                pendingDeletionIds = emptySet(),
                visibleComicsCount = currentState.comics.size
            )
        }
    }

    fun onDeletionTimeout() {
        viewModelScope.launch {
            comicRepository.deleteComics(_uiState.value.pendingDeletionIds)
            _uiState.update { it.copy(pendingDeletionIds = emptySet()) }
        }
    }

    fun addComic(title: String, author: String, coverUrl: String, filePath: String) {
        viewModelScope.launch(Dispatchers.IO) {
            val newComic = Comic(
                title = title,
                author = author,
                coverUrl = coverUrl,
                filePath = filePath
            )
            comicRepository.addComic(newComic)
        }
    }
    
    /**
     * Adds a comic from a selected URI (file picker result)
     */
    fun addComicFromUri(context: Context, uri: Uri) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val fileName = getFileNameFromUri(context, uri) ?: "Unknown Comic"
                val fileExtension = fileName.substringAfterLast('.', "")
                
                // Validate file format
                if (!isValidComicFormat(fileExtension)) {
                    _uiState.update {
                        it.copy(error = "Unsupported file format: $fileExtension")
                    }
                    return@launch
                }
                
                val title = fileName.substringBeforeLast('.')
                val comic = Comic(
                    title = title,
                    author = "", // Will be extracted later if available
                    coverUrl = "", // Will be generated later
                    filePath = uri.toString()
                )
                
                comicRepository.addComic(comic)
                
                // Clear any previous errors
                _uiState.update { it.copy(error = null) }
                
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(error = "Failed to add comic: ${e.message}")
                }
            }
        }
    }
    
    /**
     * Adds a comic from a URL by downloading it with progress tracking
     */
    fun addComicFromUrl(context: Context, url: String) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                _uiState.update { it.copy(error = null) }
                
                // Validate URL format
                if (!isValidUrl(url)) {
                    _uiState.update {
                        it.copy(
                            error = "Invalid URL format"
                        )
                    }
                    return@launch
                }
                
                // Extract filename from URL
                val fileName = extractFileNameFromUrl(url)
                val fileExtension = fileName.substringAfterLast('.', "")
                
                // Validate file format
                if (!isValidComicFormat(fileExtension)) {
                    _uiState.update {
                        it.copy(
                            error = "Unsupported file format: $fileExtension. Supported formats: CBZ, CBR, PDF, ZIP, RAR"
                        )
                    }
                    return@launch
                }
                
                // Start progress tracking
                _uiState.update {
                    it.copy(
                        importProgress = ImportProgress(
                            operationType = ImportOperationType.DOWNLOADING,
                            fileName = fileName,
                            isIndeterminate = true,
                            statusMessage = "Connecting..."
                        )
                    )
                }
                
                // Create a local file in app's cache directory
                val cacheDir = context.cacheDir
                val localFile = File(cacheDir, "downloaded_comics/$fileName")
                localFile.parentFile?.mkdirs()
                
                // Download the file with progress tracking
                try {
                    val connection = java.net.URL(url).openConnection()
                    connection.connect()
                    
                    val contentLength = connection.contentLength.toLong()
                    if (contentLength > 100 * 1024 * 1024) { // 100MB limit
                        _uiState.update {
                            it.copy(
                                importProgress = null,
                                error = "File too large. Maximum size: 100MB"
                            )
                        }
                        return@launch
                    }
                    
                    // Update progress with file size info
                    _uiState.update {
                        it.copy(
                            importProgress = it.importProgress?.copy(
                                totalBytes = contentLength,
                                isIndeterminate = contentLength <= 0,
                                statusMessage = if (contentLength > 0) "Downloading ${contentLength / 1024 / 1024}MB..." else "Downloading..."
                            )
                        )
                    }
                    
                    connection.getInputStream().use { input ->
                        localFile.outputStream().use { output ->
                            val buffer = ByteArray(8192)
                            var downloadedBytes = 0L
                            var bytesRead: Int
                            
                            while (input.read(buffer).also { bytesRead = it } != -1) {
                                output.write(buffer, 0, bytesRead)
                                downloadedBytes += bytesRead
                                
                                // Update progress
                                if (contentLength > 0) {
                                    val progress = (downloadedBytes.toFloat() / contentLength.toFloat())
                                    _uiState.update {
                                        it.copy(
                                            importProgress = it.importProgress?.copy(
                                                progressPercentage = progress,
                                                downloadedBytes = downloadedBytes,
                                                statusMessage = "Downloaded ${downloadedBytes / 1024 / 1024}MB / ${contentLength / 1024 / 1024}MB"
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Processing phase
                    _uiState.update {
                        it.copy(
                            importProgress = it.importProgress?.copy(
                                operationType = ImportOperationType.PROCESSING,
                                statusMessage = "Processing comic file...",
                                isIndeterminate = true
                            )
                        )
                    }
                    
                    // Create comic entry
                    val title = fileName.substringBeforeLast('.')
                    val comic = Comic(
                        title = title,
                        author = "",
                        coverUrl = "",
                        filePath = localFile.absolutePath
                    )
                    
                    // Saving phase
                    _uiState.update {
                        it.copy(
                            importProgress = it.importProgress?.copy(
                                operationType = ImportOperationType.SAVING,
                                statusMessage = "Saving to library..."
                            )
                        )
                    }
                    
                    comicRepository.addComic(comic)
                    
                    // Complete
                    _uiState.update { 
                        it.copy(
                            importProgress = null,
                            error = null
                        ) 
                    }
                    
                } catch (e: java.net.MalformedURLException) {
                    _uiState.update {
                        it.copy(
                            importProgress = null,
                            error = "Invalid URL: ${e.message}"
                        )
                    }
                } catch (e: java.io.IOException) {
                    _uiState.update {
                        it.copy(
                            importProgress = null,
                            error = "Download failed: ${e.message}"
                        )
                    }
                }
                
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        importProgress = null,
                        error = "Failed to add comic from URL: ${e.message}"
                    )
                }
            }
        }
    }
        viewModelScope.launch(Dispatchers.IO) {
            try {
                _uiState.update { it.copy(isLoading = true) }
                
                val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(
                    directoryUri,
                    DocumentsContract.getTreeDocumentId(directoryUri)
                )
                
                val cursor = context.contentResolver.query(
                    childrenUri,
                    arrayOf(
                        DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                        DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                        DocumentsContract.Document.COLUMN_MIME_TYPE
                    ),
                    null, null, null
                )
                
                cursor?.use {
                    while (it.moveToNext()) {
                        val documentId = it.getString(0)
                        val fileName = it.getString(1)
                        val mimeType = it.getString(2)
                        
                        if (fileName != null && isValidComicFormat(fileName.substringAfterLast('.', ""))) {
                            val documentUri = DocumentsContract.buildDocumentUriUsingTree(
                                directoryUri, documentId
                            )
                            
                            val title = fileName.substringBeforeLast('.')
                            val comic = Comic(
                                title = title,
                                author = "",
                                coverUrl = "",
                                filePath = documentUri.toString()
                            )
                            
                            comicRepository.addComic(comic)
                        }
                    }
                }
                
                _uiState.update { it.copy(isLoading = false, error = null) }
                
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to scan directory: ${e.message}"
                    )
                }
            }
        }
    }
    
    /**
     * Exports the entire library to a JSON string
     */
    fun exportLibrary(): Result<String> {
        return try {
            viewModelScope.launch(Dispatchers.IO) {
                try {
                    val exportData = comicRepository.exportLibrary()
                    val json = gson.toJson(exportData)
                    _uiState.update { it.copy(exportData = json, error = null) }
                } catch (e: Exception) {
                    _uiState.update { it.copy(error = "Failed to export library: ${e.message}") }
                }
            }
            Result.success("Export initiated")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Imports library data from a JSON string
     */
    fun importLibrary(jsonData: String): Result<Unit> {
        return try {
            viewModelScope.launch(Dispatchers.IO) {
                try {
                    val exportData = gson.fromJson(jsonData, LibraryExport::class.java)
                    val result = comicRepository.importLibrary(exportData)
                    if (result.isFailure) {
                        _uiState.update { it.copy(error = "Failed to import library: ${result.exceptionOrNull()?.message}") }
                    } else {
                        _uiState.update { it.copy(error = null) }
                    }
                } catch (e: Exception) {
                    _uiState.update { it.copy(error = "Failed to parse import data: ${e.message}") }
                }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Gets the display name of a file from its URI
     */
    private fun getFileNameFromUri(context: Context, uri: Uri): String? {
        return context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            cursor.moveToFirst()
            cursor.getString(nameIndex)
        }
    }
    
    /**
     * Validates if the file format is supported for comics
     */
    private fun isValidComicFormat(extension: String): Boolean {
        val supportedFormats = setOf(
            "pdf", "zip", "cbz", "cbr", "rar",
            "PDF", "ZIP", "CBZ", "CBR", "RAR"
        )
        return extension in supportedFormats
    }
    
    /**
     * Validates if the URL format is valid
     */
    private fun isValidUrl(url: String): Boolean {
        return try {
            val urlObj = java.net.URL(url)
            urlObj.protocol in setOf("http", "https") 
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Extracts filename from URL
     */
    private fun extractFileNameFromUrl(url: String): String {
        return try {
            val urlObj = java.net.URL(url)
            val path = urlObj.path
            val fileName = path.substringAfterLast('/')
            if (fileName.isBlank() || !fileName.contains('.')) {
                // Generate filename if not available
                "comic_${System.currentTimeMillis()}.cbz"
            } else {
                fileName
            }
        } catch (e: Exception) {
            "comic_${System.currentTimeMillis()}.cbz"
        }
    }
    
    /**
     * Loads the next page of comics when user scrolls to the bottom
     */
    fun loadMoreComics() {
        val currentState = _uiState.value
        if (!currentState.enablePagination || 
            !currentState.hasMoreItems || 
            currentState.isLoadingMore) {
            return
        }
        
        _uiState.update { it.copy(isLoadingMore = true) }
        
        viewModelScope.launch {
            try {
                // Increment page and trigger UI state update
                _uiState.update { 
                    it.copy(currentPage = it.currentPage + 1)
                }
                // The observeComics() flow will automatically handle the pagination
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoadingMore = false,
                        error = "Failed to load more comics: ${e.message}"
                    )
                }
            }
        }
    }
    
    /**
     * Resets pagination when search or sort changes
     */
    private fun resetPagination() {
        _uiState.update { 
            it.copy(
                currentPage = 0,
                hasMoreItems = true,
                isLoadingMore = false
            )
        }
    }
    
    /**
     * Checks if user has scrolled near the end of the list to trigger loading more items
     */
    fun onScrollNearEnd(visibleItemIndex: Int) {
        val currentState = _uiState.value
        if (currentState.enablePagination && 
            currentState.hasMoreItems && 
            !currentState.isLoadingMore) {
            
            // Trigger load more when user is within 3 items of the end
            val triggerIndex = currentState.displayedComics.size - 3
            if (visibleItemIndex >= triggerIndex) {
                loadMoreComics()
            }
        }
    }
}