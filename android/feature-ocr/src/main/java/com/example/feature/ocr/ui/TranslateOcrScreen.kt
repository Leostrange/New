package com.example.feature.ocr.ui

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import java.io.File
import java.io.FileOutputStream

@Composable
fun TranslateOcrContent(
    recognizedText: String,
    currentLanguage: String,
    onLanguageChanged: (String) -> Unit,
    onTranslate: (String, String) -> Unit,
    translatedText: String?,
    isLoading: Boolean,
    isWhisperAvailable: Boolean,
    onDownloadWhisper: () -> Unit,
    transcription: String,
    isTranscribing: Boolean,
    onTranscribeAudio: (File) -> Unit
) {
    var textToTranslate by remember { mutableStateOf(recognizedText) }
    var targetLanguage by remember { mutableStateOf(currentLanguage) }
    var expanded by remember { mutableStateOf(false) }
    val languages = listOf("en", "es", "fr", "de", "ru")
    val context = LocalContext.current
    var hasAudioPermission by remember { mutableStateOf(checkAudioPermission(context)) }

    val audioFileLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { audioUri ->
            val audioFile = copyAudioFileToInternalStorage(context, audioUri)
            audioFile?.let { onTranscribeAudio(it) }
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasAudioPermission = isGranted
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text("Распознанный текст:")
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = textToTranslate,
            onValueChange = { textToTranslate = it },
            modifier = Modifier.fillMaxWidth(),
            readOnly = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text("Целевой язык")
        Spacer(modifier = Modifier.height(8.dp))
        Box {
            TextField(
                value = targetLanguage,
                onValueChange = {},
                modifier = Modifier.fillMaxWidth(),
                readOnly = true,
                trailingIcon = {
                    Button(onClick = { expanded = true }) {
                        Text("Выбрать")
                    }
                }
            )
            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                languages.forEach { language ->
                    DropdownMenuItem(
                        text = { Text(language) },
                        onClick = {
                            targetLanguage = language
                            onLanguageChanged(language)
                            expanded = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { onTranslate(textToTranslate, targetLanguage) },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp))
            } else {
                Text("Перевести")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        translatedText?.let {
            Text("Переведённый текст:")
            Spacer(modifier = Modifier.height(8.dp))
            TextField(
                value = it,
                onValueChange = {},
                modifier = Modifier.fillMaxWidth(),
                readOnly = true
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Whisper section
        Text("Аудио транскрипция")
        Spacer(modifier = Modifier.height(8.dp))
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Whisper модель")
            if (isWhisperAvailable) {
                Text("Скачана")
            } else {
                Button(onClick = onDownloadWhisper) {
                    Text("Скачать")
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Audio transcription controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Button(
                onClick = {
                    if (hasAudioPermission) {
                        audioFileLauncher.launch("audio/*")
                    } else {
                        permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    }
                },
                enabled = isWhisperAvailable && !isTranscribing
            ) {
                Icon(Icons.Default.Mic, contentDescription = "Select audio file")
                Spacer(modifier = Modifier.width(8.dp))
                Text("Выбрать аудио")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (isTranscribing) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.width(16.dp))
                Text("Транскрибирование...")
            }
        }

        if (transcription.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            Text("Транскрипция:")
            Spacer(modifier = Modifier.height(8.dp))
            TextField(
                value = transcription,
                onValueChange = {},
                modifier = Modifier.fillMaxWidth(),
                readOnly = true
            )
        }
    }
}

@Composable
fun TranslateOcrScreen(
    recognizedText: String,
    onTranslate: (String, String) -> Unit,
    translatedText: String?,
    isLoading: Boolean,
    viewModel: TranslateOcrViewModel = hiltViewModel()
) {
    val language by viewModel.targetLanguage.collectAsState()
    val whisperAvailable by viewModel.isWhisperModelAvailable.collectAsState()
    val transcription by viewModel.transcription.collectAsState()
    val isTranscribing by viewModel.isTranscribing.collectAsState()

    TranslateOcrContent(
        recognizedText = recognizedText,
        currentLanguage = language,
        onLanguageChanged = viewModel::onLanguageSelected,
        onTranslate = onTranslate,
        translatedText = translatedText,
        isLoading = isLoading,
        isWhisperAvailable = whisperAvailable,
        onDownloadWhisper = viewModel::downloadWhisperModel,
        transcription = transcription,
        isTranscribing = isTranscribing,
        onTranscribeAudio = viewModel::transcribeAudio
    )
}

private fun checkAudioPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.RECORD_AUDIO
    ) == PackageManager.PERMISSION_GRANTED
}

private fun copyAudioFileToInternalStorage(context: Context, uri: Uri): File? {
    return try {
        val inputStream = context.contentResolver.openInputStream(uri)
        val fileName = getFileName(context, uri) ?: "audio_recording.wav"
        val outputFile = File(context.cacheDir, fileName)
        
        inputStream?.use { input ->
            FileOutputStream(outputFile).use { output ->
                input.copyTo(output)
            }
        }
        
        outputFile
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }
}

private fun getFileName(context: Context, uri: Uri): String? {
    var fileName: String? = null
    context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
        if (cursor.moveToFirst()) {
            fileName = cursor.getString(nameIndex)
        }
    }
    return fileName
}