package com.mrcomic.ui.translations

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TranslationsScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Переводчик", "OCR", "Настройки")
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        CenterAlignedTopAppBar(
            title = {
                Text(
                    text = "Переводы и OCR",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
            },
            colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        )
        
        // Tabs
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }
        
        // Content
        when (selectedTab) {
            0 -> TranslatorTab()
            1 -> OCRTab()
            2 -> TranslationSettingsTab()
        }
    }
}

@Composable
fun TranslatorTab() {
    var sourceText by remember { mutableStateOf("") }
    var translatedText by remember { mutableStateOf("") }
    var sourceLanguage by remember { mutableStateOf("Русский") }
    var targetLanguage by remember { mutableStateOf("English") }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Language selection
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            LanguageSelector(
                language = sourceLanguage,
                onLanguageChange = { sourceLanguage = it },
                modifier = Modifier.weight(1f)
            )
            
            IconButton(onClick = { 
                val temp = sourceLanguage
                sourceLanguage = targetLanguage
                targetLanguage = temp
            }) {
                Icon(Icons.Default.SwapHoriz, contentDescription = "Поменять языки")
            }
            
            LanguageSelector(
                language = targetLanguage,
                onLanguageChange = { targetLanguage = it },
                modifier = Modifier.weight(1f)
            )
        }
        
        // Input text
        OutlinedTextField(
            value = sourceText,
            onValueChange = { sourceText = it },
            label = { Text("Введите текст") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 5
        )
        
        // Action buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { /* Camera OCR */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.CameraAlt, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Сканировать")
            }
            
            Button(
                onClick = { /* Translate */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Translate, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Перевести")
            }
        }
        
        // Translation result
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                contentAlignment = if (translatedText.isEmpty()) Alignment.Center else Alignment.TopStart
            ) {
                if (translatedText.isEmpty()) {
                    Text(
                        text = "Перевод появится здесь",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyMedium
                    )
                } else {
                    Text(
                        text = translatedText,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

@Composable
fun OCRTab() {
    var isProcessing by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // OCR Preview Area
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                if (isProcessing) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        CircularProgressIndicator()
                        Text("Обработка изображения...")
                    }
                } else {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Icon(
                            Icons.Default.CameraAlt,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Нажмите кнопку ниже для сканирования",
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
        
        // OCR Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = { /* Gallery */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.PhotoLibrary, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Галерея")
            }
            
            Button(
                onClick = { 
                    isProcessing = true
                    // Simulate OCR processing
                },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.CameraAlt, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Камера")
            }
        }
        
        // OCR Result
        OutlinedTextField(
            value = "",
            onValueChange = { },
            label = { Text("Распознанный текст") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 5,
            readOnly = true
        )
    }
}

@Composable
fun TranslationSettingsTab() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            SettingsSection(
                title = "OCR движок",
                items = listOf(
                    SettingsItem("Tesseract", "Высокая точность", true),
                    SettingsItem("MLKit", "Быстрая обработка", false)
                )
            )
        }
        
        item {
            SettingsSection(
                title = "Поставщики перевода",
                items = listOf(
                    SettingsItem("Google Translate API", "Требует API ключ", false),
                    SettingsItem("DeepL API", "Требует API ключ", false),
                    SettingsItem("OpenAI Whisper", "Требует API ключ", false)
                )
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "API ключи",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    OutlinedButton(
                        onClick = { /* Add API key */ },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Добавить API ключ")
                    }
                }
            }
        }
        
        item {
            SettingsSection(
                title = "Оффлайн модели",
                items = listOf(
                    SettingsItem("Whisper", "Скачать модель", false, hasAction = true)
                )
            )
        }
    }
}

@Composable
fun LanguageSelector(
    language: String,
    onLanguageChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    val languages = listOf("Русский", "English", "Español", "Français", "Deutsch")
    
    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = language,
            onValueChange = { },
            readOnly = true,
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth()
        )
        
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            languages.forEach { lang ->
                DropdownMenuItem(
                    text = { Text(lang) },
                    onClick = {
                        onLanguageChange(lang)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
fun SettingsSection(
    title: String,
    items: List<SettingsItem>
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            items.forEach { item ->
                SettingsItemRow(item)
            }
        }
    }
}

@Composable
fun SettingsItemRow(item: SettingsItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.title,
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = item.subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        if (item.hasAction) {
            TextButton(onClick = { /* Download action */ }) {
                Text("Скачать")
            }
        } else {
            RadioButton(
                selected = item.isSelected,
                onClick = { /* Handle selection */ }
            )
        }
    }
}

data class SettingsItem(
    val title: String,
    val subtitle: String,
    val isSelected: Boolean,
    val hasAction: Boolean = false
)
