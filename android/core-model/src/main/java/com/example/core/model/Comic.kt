package com.example.core.model

/**
 * Унифицированная модель комикса для всего приложения.
 *
 * @param id Уникальный идентификатор комикса
 * @param title Название комикса
 * @param author Автор комикса
 * @param filePath Абсолютный путь к файлу комикса
 * @param coverUrl URL, локальный путь или ресурс для обложки
 */
data class Comic(
    val id: String = "",
    val title: String,
    val author: String = "Unknown",
    val filePath: String,
    val coverUrl: Any? = null
)


