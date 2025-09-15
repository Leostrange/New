package com.mrcomic.core.common

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import kotlinx.coroutines.delay
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

// String extensions
fun String.isValidEmail(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
}

fun String.capitalizeWords(): String {
    return split(" ").joinToString(" ") { it.lowercase().replaceFirstChar { char -> char.uppercase() } }
}

fun String.removeSpecialChars(): String {
    return replace(Regex("[^A-Za-z0-9 ]"), "")
}

// File extensions
fun File.sizeInMB(): Double {
    return length() / (1024.0 * 1024.0)
}

fun File.isComicFile(): Boolean {
    val extension = extension.lowercase()
    return extension in listOf("cbz", "cbr", "pdf", "zip", "rar")
}

fun File.getComicFormat(): String {
    return when (extension.lowercase()) {
        "cbz", "zip" -> "CBZ"
        "cbr", "rar" -> "CBR"
        "pdf" -> "PDF"
        else -> "UNKNOWN"
    }
}

// Bitmap extensions
fun Bitmap.saveToFile(context: Context, fileName: String): Uri? {
    return try {
        val file = File(context.filesDir, fileName)
        val outputStream = FileOutputStream(file)
        compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
        outputStream.close()
        Uri.fromFile(file)
    } catch (e: Exception) {
        null
    }
}

// Date extensions
fun Long.toFormattedDate(): String {
    val formatter = SimpleDateFormat("dd.MM.yyyy", Locale.getDefault())
    return formatter.format(Date(this))
}

fun Long.toFormattedDateTime(): String {
    val formatter = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault())
    return formatter.format(Date(this))
}

fun Long.toRelativeTime(): String {
    val now = System.currentTimeMillis()
    val diff = now - this
    
    return when {
        diff < 60_000 -> "Только что"
        diff < 3_600_000 -> "${diff / 60_000} мин назад"
        diff < 86_400_000 -> "${diff / 3_600_000} ч назад"
        diff < 604_800_000 -> "${diff / 86_400_000} дн назад"
        else -> toFormattedDate()
    }
}

// Progress extensions
fun Float.toPercentage(): String {
    return "${(this * 100).toInt()}%"
}

fun Int.formatFileSize(): String {
    val bytes = this.toLong()
    return when {
        bytes < 1024 -> "$bytes B"
        bytes < 1024 * 1024 -> "${bytes / 1024} KB"
        bytes < 1024 * 1024 * 1024 -> "${bytes / (1024 * 1024)} MB"
        else -> "${bytes / (1024 * 1024 * 1024)} GB"
    }
}

// Collection extensions
fun <T> List<T>.chunkedSafely(size: Int): List<List<T>> {
    return if (isEmpty()) emptyList() else chunked(size)
}

// Compose extensions
@Composable
fun <T> T.OnChange(
    key: T,
    action: suspend (T) -> Unit
) {
    val currentAction by rememberUpdatedState(action)
    LaunchedEffect(key) {
        currentAction(key)
    }
}

@Composable
fun Debounce(
    delay: Long = 300L,
    action: suspend () -> Unit
) {
    val currentAction by rememberUpdatedState(action)
    LaunchedEffect(Unit) {
        delay(delay)
        currentAction()
    }
}

// Validation extensions
fun String.isValidPassword(): Boolean {
    return length >= 8 && 
           any { it.isDigit() } && 
           any { it.isLetter() } &&
           any { !it.isLetterOrDigit() }
}

fun String.isValidApiKey(): Boolean {
    return isNotBlank() && length >= 16
}

// Comic specific extensions
fun Float.toReadingStatus(): String {
    return when {
        this <= 0f -> "Не начато"
        this >= 1f -> "Прочитано"
        else -> "В процессе"
    }
}

fun Int.toPageRange(totalPages: Int): String {
    return "$this из $totalPages"
}