package com.example.core.model

data class Note(
    val id: String,
    val comicId: String,
    val page: Int,
    val content: String,
    val title: String? = null,
    val positionX: Float? = null, // Optional position for anchored notes on page
    val positionY: Float? = null, // Optional position for anchored notes on page
    val timestamp: Long = System.currentTimeMillis(),
    val lastModified: Long = System.currentTimeMillis()
)