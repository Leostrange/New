package com.example.feature.library.ui

import android.Manifest
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.DocumentsContract
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.background
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.draganddrop.dragAndDropTarget
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Alignment
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.TextButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.draganddrop.DragAndDropEvent
import androidx.compose.ui.draganddrop.DragAndDropTarget
import androidx.compose.ui.draganddrop.mimeTypes
import androidx.compose.ui.draganddrop.toAndroidDragEvent
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.core.model.Comic
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.shouldShowRationale
import java.io.File

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class, ExperimentalFoundationApi::class)
@Composable
fun LibraryScreen(
    onBookClick: (filePath: String) -> Unit,
    onAddClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onPluginsClick: () -> Unit = { }, // Добавлен параметр для навигации к плагинам
    viewModel: LibraryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var showAddDialog by remember { mutableStateOf(false) }
    var showUrlDialog by remember { mutableStateOf(false) }
    var showExportDialog by remember { mutableStateOf(false) }
    var showImportDialog by remember { mutableStateOf(false) }
    var exportFileUri by remember { mutableStateOf<Uri?>(null) }
    
    // Drag and drop state
    var isDragActive by remember { mutableStateOf(false) }
    var dragErrorMessage by remember { mutableStateOf<String?>(null) }
    
    // Create drag and drop target
    val dragAndDropTarget = remember {
        object : DragAndDropTarget {
            override fun onStarted(event: DragAndDropEvent) {
                isDragActive = true
                dragErrorMessage = null
            }
            
            override fun onEntered(event: DragAndDropEvent) {
                // Visual feedback when drag enters the drop zone
                isDragActive = true
            }
            
            override fun onMoved(event: DragAndDropEvent) {
                // Handle drag movement if needed
            }
            
            override fun onExited(event: DragAndDropEvent) {
                // Reset visual feedback when drag exits
                isDragActive = false
            }
            
            override fun onEnded(event: DragAndDropEvent) {
                isDragActive = false
            }
            
            override fun onDrop(event: DragAndDropEvent): Boolean {
                isDragActive = false
                
                try {
                    val dragEvent = event.toAndroidDragEvent()
                    val clipData = dragEvent.clipData
                    
                    if (clipData != null && clipData.itemCount > 0) {
                        for (i in 0 until clipData.itemCount) {
                            val item = clipData.getItemAt(i)
                            val uri = item.uri
                            
                            if (uri != null) {
                                // Validate file format
                                val fileName = uri.lastPathSegment ?: ""
                                val extension = fileName.substringAfterLast('.', "")
                                
                                if (isValidComicFormat(extension)) {
                                    viewModel.addComicFromUri(context, uri)
                                } else {
                                    dragErrorMessage = "Unsupported file format: $extension"
                                    return false
                                }
                            }
                        }
                        return true
                    }
                } catch (e: Exception) {
                    dragErrorMessage = "Failed to process dropped files: ${e.message}"
                    return false
                }
                
                dragErrorMessage = "No valid files found in drop"
                return false
            }
        }
    }
    
    // Helper function to validate comic formats
    fun isValidComicFormat(extension: String): Boolean {
        val supportedFormats = setOf(
            "pdf", "zip", "cbz", "cbr", "rar",
            "PDF", "ZIP", "CBZ", "CBR", "RAR"
        )
        return extension in supportedFormats
    }
    
    // Permission state for file access
    val storagePermissionState = rememberPermissionState(
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_IMAGES
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }
    )
    
    // File picker launcher
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let { fileUri ->
            viewModel.addComicFromUri(context, fileUri)
        }
    }
    
    // Multiple files picker launcher
    val multipleFilePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments()
    ) { uris: List<Uri> ->
        uris.forEach { uri ->
            viewModel.addComicFromUri(context, uri)
        }
    }
    
    // Directory picker launcher
    val directoryPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocumentTree()
    ) { uri: Uri? ->
        uri?.let { directoryUri ->
            viewModel.addComicsFromDirectory(context, directoryUri)
        }
    }
    
    // File picker launcher for import
    val importFilePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let { fileUri ->
            try {
                val jsonString = context.contentResolver.openInputStream(fileUri)?.bufferedReader().use { it?.readText() }
                jsonString?.let { json ->
                    viewModel.importLibrary(json)
                    showImportDialog = true
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    // Effect to show import success dialog
    LaunchedEffect(uiState.error) {
        // This is a simplified approach - in a real app you'd want more precise state management
        // For now, we'll just show the import dialog when there's no error after an import operation
    }
    
    // File saver launcher for export
    val exportFileSaverLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/json")
    ) { uri: Uri? ->
        uri?.let { fileUri ->
            exportFileUri = fileUri
            viewModel.exportLibrary()
        }
    }
    
    // Effect to handle export file writing
    LaunchedEffect(uiState.exportData) {
        uiState.exportData?.let { exportData ->
            exportFileUri?.let { uri ->
                try {
                    context.contentResolver.openOutputStream(uri)?.use { outputStream ->
                        outputStream.write(exportData.toByteArray())
                    }
                    showExportDialog = true
                } catch (e: Exception) {
                    // Handle error
                }
            }
        }
    }
    
    Scaffold(
        topBar = { 
            TopAppBar(
                title = { Text("Library") },
                actions = {
                    IconButton(onClick = onPluginsClick) {
                        Icon(Icons.Default.Extension, contentDescription = "Плагины")
                    }
                    IconButton(onClick = onSettingsClick) {
                        Icon(Icons.Default.Settings, contentDescription = "Настройки")
                    }
                }
            ) 
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add Comic")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .dragAndDropTarget(
                    shouldStartDragAndDrop = { event ->
                        event.mimeTypes().any { mimeType ->
                            mimeType.startsWith("application/") || 
                            mimeType.startsWith("text/") ||
                            mimeType == "*/*"
                        }
                    },
                    target = dragAndDropTarget
                )
                .then(
                    if (isDragActive) {
                        Modifier.background(
                            color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f),
                            shape = androidx.compose.foundation.shape.RoundedCornerShape(8.dp)
                        )
                    } else Modifier
                )
        ) {
            // Loading indicator
            if (uiState.isLoading) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Loading comics...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
            
            // Error display with better styling
            val errorText = uiState.error
            if (errorText != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Error",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = errorText,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { viewModel.onPermissionsGranted() },
                            colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Text("Retry")
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Drag and drop error display
            dragErrorMessage?.let { errorMsg ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Drag & Drop Error: $errorMsg",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(
                            onClick = { dragErrorMessage = null }
                        ) {
                            Text("Dismiss")
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Drag and drop visual feedback overlay
            if (isDragActive) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.CloudUpload,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Drop comic files here",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "Supported formats: CBZ, CBR, PDF, ZIP, RAR",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Import progress display
            uiState.importProgress?.let { progress ->
                ImportProgressCard(
                    importProgress = progress,
                    onCancel = {
                        // TODO: Implement cancel functionality
                    }
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Comics list with lazy loading
            if (!uiState.isLoading && uiState.displayedComics.isNotEmpty()) {
                val listState = rememberLazyListState()
                
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    state = listState,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(
                        items = uiState.displayedComics,
                        key = { comic -> comic.filePath } // Stable key for performance
                    ) { comic ->
                        ComicRow(
                            comic = comic, 
                            onClick = { onBookClick(comic.filePath) }
                        )
                    }
                    
                    // Loading more indicator
                    if (uiState.isLoadingMore) {
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp
                                    )
                                    Text(
                                        text = "Loading more comics...",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                    
                    // Load more trigger or end indicator
                    if (uiState.enablePagination && uiState.hasMoreItems && !uiState.isLoadingMore) {
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                TextButton(
                                    onClick = { viewModel.loadMoreComics() }
                                ) {
                                    Text("Load More (${uiState.visibleComicsCount - uiState.displayedComics.size} remaining)")
                                }
                            }
                        }
                    }
                }
                
                // Detect scroll position for automatic loading
                LaunchedEffect(listState) {
                    snapshotFlow { listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0 }
                        .collect { lastVisibleIndex ->
                            viewModel.onScrollNearEnd(lastVisibleIndex)
                        }
                }
            } else if (!uiState.isLoading && uiState.displayedComics.isEmpty() && errorText == null) {
                // Empty state
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "No comics found",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Add your first comic to get started",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
        
        // Add Comic Dialog
        if (showAddDialog) {
            AddComicDialog(
                onDismiss = { showAddDialog = false },
                onPickSingleFile = {
                    showAddDialog = false
                    if (storagePermissionState.status.isGranted) {
                        filePickerLauncher.launch(arrayOf(
                            "application/pdf",
                            "application/zip", 
                            "application/x-cbz",
                            "application/x-cbr",
                            "application/x-rar-compressed"
                        ))
                    } else {
                        storagePermissionState.launchPermissionRequest()
                    }
                },
                onPickMultipleFiles = {
                    showAddDialog = false
                    if (storagePermissionState.status.isGranted) {
                        multipleFilePickerLauncher.launch(arrayOf(
                            "application/pdf",
                            "application/zip", 
                            "application/x-cbz",
                            "application/x-cbr",
                            "application/x-rar-compressed"
                        ))
                    } else {
                        storagePermissionState.launchPermissionRequest()
                    }
                },
                onPickDirectory = {
                    showAddDialog = false
                    if (storagePermissionState.status.isGranted) {
                        directoryPickerLauncher.launch(null)
                    } else {
                        storagePermissionState.launchPermissionRequest()
                    }
                },
                onAddFromUrl = {
                    showAddDialog = false
                    showUrlDialog = true
                },
                onExportLibrary = {
                    showAddDialog = false
                    exportFileSaverLauncher.launch("mrcomic_library_export.json")
                },
                onImportLibrary = {
                    showAddDialog = false
                    if (storagePermissionState.status.isGranted) {
                        importFilePickerLauncher.launch(arrayOf("application/json"))
                    } else {
                        storagePermissionState.launchPermissionRequest()
                    }
                }
            )
        }
        
        // Export Dialog
        if (showExportDialog && uiState.exportData != null) {
            AlertDialog(
                onDismissRequest = { showExportDialog = false },
                title = { Text("Export Library") },
                text = { Text("Your library has been exported successfully!") },
                confirmButton = {
                    TextButton(onClick = { showExportDialog = false }) {
                        Text("OK")
                    }
                }
            )
        }
        
        // Import Dialog
        if (showImportDialog) {
            AlertDialog(
                onDismissRequest = { showImportDialog = false },
                title = { Text("Import Library") },
                text = { Text("Library import completed successfully!") },
                confirmButton = {
                    TextButton(onClick = { showImportDialog = false }) {
                        Text("OK")
                    }
                }
            )
        }
        
        // URL Input Dialog
        if (showUrlDialog) {
            UrlInputDialog(
                onDismiss = { showUrlDialog = false },
                onConfirm = { url ->
                    showUrlDialog = false
                    viewModel.addComicFromUrl(context, url)
                }
            )
        }
    }
}

@Composable
private fun ImportProgressCard(
    importProgress: ImportProgress,
    onCancel: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header row with operation type and cancel button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = when (importProgress.operationType) {
                        ImportOperationType.DOWNLOADING -> "Downloading"
                        ImportOperationType.EXTRACTING -> "Extracting"
                        ImportOperationType.PROCESSING -> "Processing"
                        ImportOperationType.VALIDATING -> "Validating"
                        ImportOperationType.SAVING -> "Saving"
                    },
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                
                // Cancel button (only show for cancellable operations)
                if (importProgress.operationType == ImportOperationType.DOWNLOADING) {
                    TextButton(
                        onClick = onCancel,
                        colors = androidx.compose.material3.ButtonDefaults.textButtonColors(
                            contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    ) {
                        Text("Cancel")
                    }
                }
            }
            
            // File name
            Text(
                text = importProgress.fileName,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
                maxLines = 2
            )
            
            // Progress indicator
            if (importProgress.isIndeterminate) {
                // Indeterminate progress for operations like extracting
                androidx.compose.material3.LinearProgressIndicator(
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                )
            } else {
                // Determinate progress with percentage
                androidx.compose.material3.LinearProgressIndicator(
                    progress = { importProgress.progressPercentage / 100f },
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                )
            }
            
            // Progress details row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Progress percentage or status message
                Text(
                    text = if (importProgress.statusMessage.isNotEmpty()) {
                        importProgress.statusMessage
                    } else if (!importProgress.isIndeterminate) {
                        "${importProgress.progressPercentage.toInt()}%"
                    } else {
                        "Processing..."
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                )
                
                // File size information (for downloads)
                if (importProgress.operationType == ImportOperationType.DOWNLOADING && 
                    importProgress.totalBytes > 0) {
                    Text(
                        text = "${formatFileSize(importProgress.downloadedBytes)} / ${formatFileSize(importProgress.totalBytes)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                    )
                }
            }
        }
    }
}

/**
 * Formats file size in human-readable format
 */
private fun formatFileSize(bytes: Long): String {
    if (bytes < 1024) return "$bytes B"
    val kb = bytes / 1024.0
    if (kb < 1024) return "%.1f KB".format(kb)
    val mb = kb / 1024.0
    if (mb < 1024) return "%.1f MB".format(mb)
    val gb = mb / 1024.0
    return "%.1f GB".format(gb)
}

@Composable
private fun ComicRow(comic: Comic, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp)
    ) {
        Text(text = comic.title)
        if (!comic.coverPath.isNullOrEmpty()) {
            Text(text = comic.coverPath!!, modifier = Modifier.padding(top = 2.dp))
        }
        HorizontalDivider(modifier = Modifier.padding(top = 8.dp))
    }
}

@Composable
private fun AddComicDialog(
    onDismiss: () -> Unit,
    onPickSingleFile: () -> Unit,
    onPickMultipleFiles: () -> Unit,
    onPickDirectory: () -> Unit,
    onAddFromUrl: () -> Unit,
    onExportLibrary: () -> Unit,
    onImportLibrary: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Add Comics",
                style = MaterialTheme.typography.headlineSmall
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Choose how you want to add comics to your library:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                // Single file option
                OutlinedButton(
                    onClick = onPickSingleFile,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.FolderOpen,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text("Pick Single File")
                }
                
                // Multiple files option
                OutlinedButton(
                    onClick = onPickMultipleFiles,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.FolderOpen,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text("Pick Multiple Files")
                }
                
                // Directory option
                OutlinedButton(
                    onClick = onPickDirectory,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.FolderOpen,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text("Scan Directory")
                }
                
                // URL option
                OutlinedButton(
                    onClick = onAddFromUrl,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.CloudUpload,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text("Add from URL")
                }
                
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                
                // Export option
                OutlinedButton(
                    onClick = onExportLibrary,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.CloudUpload,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text("Export Library")
                }
                
                // Import option
                OutlinedButton(
                    onClick = onImportLibrary,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.FolderOpen,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text("Import Library")
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun UrlInputDialog(
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit
) {
    var url by remember { mutableStateOf("") }
    var isValidUrl by remember { mutableStateOf(true) }
    
    // URL validation
    fun validateUrl(inputUrl: String): Boolean {
        return try {
            val urlObj = java.net.URL(inputUrl)
            urlObj.protocol in setOf("http", "https") &&
            inputUrl.matches(Regex(".*\\.(cbz|cbr|pdf|zip|rar)$", RegexOption.IGNORE_CASE))
        } catch (e: Exception) {
            false
        }
    }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Add Comic from URL",
                style = MaterialTheme.typography.headlineSmall
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Enter the direct URL to a comic file (CBZ, CBR, PDF, ZIP, RAR):",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                OutlinedTextField(
                    value = url,
                    onValueChange = { newUrl ->
                        url = newUrl
                        isValidUrl = newUrl.isBlank() || validateUrl(newUrl)
                    },
                    label = { Text("Comic URL") },
                    placeholder = { Text("https://example.com/comic.cbz") },
                    modifier = Modifier.fillMaxWidth(),
                    isError = !isValidUrl,
                    supportingText = {
                        if (!isValidUrl) {
                            Text(
                                text = "Please enter a valid URL ending with .cbz, .cbr, .pdf, .zip, or .rar",
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    },
                    singleLine = false,
                    maxLines = 3
                )
                
                // URL format examples
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp)
                    ) {
                        Text(
                            text = "Examples:",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "• https://example.com/manga.cbz\n• https://site.com/comic.pdf\n• https://host.com/archive.rar",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(url) },
                enabled = url.isNotBlank() && isValidUrl
            ) {
                Text("Download")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}


