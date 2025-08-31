package com.example.feature.settings.ui

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.core.model.SortOrder
import com.example.core.model.LocalDictionary
import com.example.core.model.LocalModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel = hiltViewModel(),
    onNavigateToAnalytics: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    
    // File picker for importing dictionaries
    val importDictionaryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent(),
        onResult = { uri: Uri? ->
            uri?.let { 
                viewModel.importDictionary(it)
                Toast.makeText(context, "Importing dictionary...", Toast.LENGTH_SHORT).show()
            }
        }
    )

    Scaffold(topBar = { 
        TopAppBar(
            title = { Text("Settings") },
            actions = {
                IconButton(onClick = onNavigateToAnalytics) {
                    Icon(
                        imageVector = Icons.Default.Analytics,
                        contentDescription = "Analytics Dashboard"
                    )
                }
            }
        ) 
    }) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            SortOrderRow(uiState.sortOrder, viewModel::onSortOrderSelected)
            Spacer(modifier = Modifier.height(8.dp))
            LibraryFoldersList(uiState.libraryFolders, viewModel::onAddFolder, viewModel::onRemoveFolder)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Language: ${uiState.targetLanguage}")
            Spacer(modifier = Modifier.height(8.dp))
            Text("OCR: ${uiState.ocrEngine}")
            Spacer(modifier = Modifier.height(8.dp))
            Text("Provider: ${uiState.translationProvider}")
            Spacer(modifier = Modifier.height(8.dp))
            ApiKeyField(uiState.translationApiKey, viewModel::onApiKeyChanged)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Performance Mode")
                Switch(checked = uiState.performanceMode, onCheckedChange = viewModel::onPerformanceModeChanged)
            }
            Spacer(modifier = Modifier.height(12.dp))

            HorizontalDivider()
            Spacer(modifier = Modifier.height(8.dp))
            LocalResourcesSection(
                dictionaries = uiState.availableDictionaries,
                models = uiState.availableModels,
                selectedDictionary = uiState.selectedDictionary,
                selectedModel = uiState.selectedModel,
                onRefresh = viewModel::refreshLocalResources,
                onSelectDictionary = viewModel::selectDictionary,
                onSelectModel = viewModel::selectModel,
                onImportDictionary = { importDictionaryLauncher.launch("application/json") },
                onExportDictionary = { dict, uri -> viewModel.exportDictionary(dict, uri) },
                onDeleteDictionary = { dict -> viewModel.deleteDictionary(dict) }
            )

            Spacer(modifier = Modifier.height(12.dp))
            Button(onClick = viewModel::clearCache) { Text("Clear Cache") }
        }
    }
}

@Composable
private fun SortOrderRow(current: SortOrder, onChange: (SortOrder) -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = { onChange(SortOrder.TITLE_ASC) }) { Text("Title A-Z") }
        Button(onClick = { onChange(SortOrder.TITLE_DESC) }) { Text("Title Z-A") }
        Button(onClick = { onChange(SortOrder.DATE_ADDED_DESC) }) { Text("Date") }
    }
}

@Composable
private fun LibraryFoldersList(folders: Set<String>, onAdd: (String) -> Unit, onRemove: (String) -> Unit) {
    Text("Library Folders")
    LazyColumn(modifier = Modifier.fillMaxWidth()) {
        items(folders.toList()) { uri ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(uri, modifier = Modifier.weight(1f))
                Button(onClick = { onRemove(uri) }) { Text("Remove") }
            }
            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
        }
    }
    Spacer(modifier = Modifier.height(8.dp))
    var text by remember { mutableStateOf("") }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(value = text, onValueChange = { text = it }, modifier = Modifier.weight(1f), label = { Text("Folder URI") })
        Button(onClick = { if (text.isNotBlank()) onAdd(text) }) { Text("Add") }
    }
}

@Composable
private fun ApiKeyField(valueInitial: String, onChange: (String) -> Unit) {
    var value by remember { mutableStateOf(valueInitial) }
    OutlinedTextField(
        value = value,
        onValueChange = {
            value = it
            onChange(it)
        },
        modifier = Modifier.fillMaxWidth(),
        label = { Text("API Key") }
    )
}

@Composable
private fun LocalResourcesSection(
    dictionaries: List<LocalDictionary>,
    models: List<LocalModel>,
    selectedDictionary: LocalDictionary?,
    selectedModel: LocalModel?,
    onRefresh: () -> Unit,
    onSelectDictionary: (LocalDictionary?) -> Unit,
    onSelectModel: (LocalModel?) -> Unit,
    onImportDictionary: () -> Unit,
    onExportDictionary: (LocalDictionary, Uri) -> Unit,
    onDeleteDictionary: (LocalDictionary) -> Unit
) {
    Text("Local Resources")
    Spacer(modifier = Modifier.height(4.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = onRefresh) { Text("Rescan") }
        // Import dictionary button
        Button(onClick = onImportDictionary) {
            Icon(imageVector = Icons.Default.FileUpload, contentDescription = "Import Dictionary")
        }
    }
    Spacer(modifier = Modifier.height(8.dp))
    Text("Dictionaries")
    LazyColumn(modifier = Modifier.fillMaxWidth()) {
        items(dictionaries) { dict ->
            DictionaryItem(
                dictionary = dict,
                isSelected = selectedDictionary?.id == dict.id,
                onSelect = { onSelectDictionary(dict) },
                onExport = { 
                    // In a real implementation, this would open a file picker for export destination
                    // For now, we'll just show a toast message
                    android.widget.Toast.makeText(
                        androidx.compose.ui.platform.LocalContext.current, 
                        "Export functionality would save ${dict.name} to selected location", 
                        android.widget.Toast.LENGTH_SHORT
                    ).show()
                },
                onDelete = { onDeleteDictionary(dict) }
            )
            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
        }
    }

    Spacer(modifier = Modifier.height(8.dp))
    if (selectedModel != null) {
        Text("Model: ${selectedModel.name}")
    } else {
        Text("Model: None")
    }
    Spacer(modifier = Modifier.height(4.dp))
    Text("Models")
    LazyColumn(modifier = Modifier.fillMaxWidth()) {
        items(models) { model ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(model.name, modifier = Modifier.weight(1f))
                Button(onClick = { onSelectModel(model) }) { Text("Select") }
            }
            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
        }
    }
}

@Composable
private fun DictionaryItem(
    dictionary: LocalDictionary,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onExport: () -> Unit,
    onDelete: () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = dictionary.name,
                modifier = Modifier.weight(1f)
            )
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Button(onClick = onSelect, enabled = !isSelected) {
                    Text(if (isSelected) "Selected" else "Select")
                }
                IconButton(onClick = onExport) {
                    Icon(
                        imageVector = Icons.Default.FileDownload,
                        contentDescription = "Export"
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete"
                    )
                }
            }
        }
        if (dictionary.languages.isNotEmpty()) {
            Text(
                text = "Languages: ${dictionary.languages.joinToString(", ")}",
                style = androidx.compose.material3.MaterialTheme.typography.bodySmall
            )
        }
        if (dictionary.version != null) {
            Text(
                text = "Version: ${dictionary.version}",
                style = androidx.compose.material3.MaterialTheme.typography.bodySmall
            )
        }
    }
}