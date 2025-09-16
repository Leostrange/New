package com.mrcomic.feature.translations

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TranslationsScreen(
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Переводчик", "OCR", "Настройки")

    Column(modifier = modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Переводы и OCR") }
        )

        TabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }

        when (selectedTab) {
            0 -> TranslatorContent()
            1 -> OCRContent()
            2 -> TranslationSettingsContent()
        }
    }
}

@Composable
private fun TranslatorContent() {
    var sourceText by remember { mutableStateOf("") }
    var translatedText by remember { mutableStateOf("") }
    var sourceLanguage by remember { mutableStateOf("English") }
    var targetLanguage by remember { mutableStateOf("Russian") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(sourceLanguage, style = MaterialTheme.typography.bodyLarge)
            IconButton(onClick = { 
                val temp = sourceLanguage
                sourceLanguage = targetLanguage
                targetLanguage = temp
            }) {
                Icon(Icons.Default.SwapHoriz, contentDescription = "Поменять языки")
            }
            Text(targetLanguage, style = MaterialTheme.typography.bodyLarge)
        }

        OutlinedTextField(
            value = sourceText,
            onValueChange = { sourceText = it },
            label = { Text("Введите текст") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 5
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { translatedText = "Переведенный текст появится здесь..." },
                modifier = Modifier.weight(1f)
            ) {
                Text("Перевести")
            }
            
            OutlinedButton(
                onClick = { /* TODO: Open camera for OCR */ }
            ) {
                Icon(Icons.Default.CameraAlt, contentDescription = "Сканировать")
            }
        }

        OutlinedTextField(
            value = translatedText,
            onValueChange = { },
            label = { Text("Перевод") },
            readOnly = true,
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
            maxLines = 5
        )
    }
}

@Composable
private fun OCRContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.CameraAlt,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            "OCR Cropping",
            style = MaterialTheme.typography.headlineSmall
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            "Выберите область текста для распознавания",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(onClick = { /* TODO: Open camera */ }) {
                Text("Камера")
            }
            
            OutlinedButton(onClick = { /* TODO: Open gallery */ }) {
                Text("Галерея")
            }
        }
    }
}

@Composable
private fun TranslationSettingsContent() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                "OCR движок",
                style = MaterialTheme.typography.titleMedium
            )
            
            var selectedEngine by remember { mutableStateOf("Tesseract") }
            val engines = listOf("Tesseract", "MLKit")
            
            engines.forEach { engine ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    RadioButton(
                        selected = selectedEngine == engine,
                        onClick = { selectedEngine = engine }
                    )
                    Text(engine)
                }
            }
        }
        
        item {
            Text(
                "Поставщики перевода",
                style = MaterialTheme.typography.titleMedium
            )
            
            val providers = listOf(
                "Google Translate API",
                "DeepL API", 
                "OpenAI Whisper"
            )
            
            providers.forEach { provider ->
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(provider)
                        TextButton(onClick = { /* TODO: Add API key */ }) {
                            Text("Добавить ключ")
                        }
                    }
                }
            }
        }
        
        item {
            Text(
                "Оффлайн модели",
                style = MaterialTheme.typography.titleMedium
            )
            
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Whisper")
                        Text(
                            "Модель для распознавания речи",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Button(onClick = { /* TODO: Download model */ }) {
                        Text("Скачать")
                    }
                }
            }
        }
    }
}
