package com.example.core.data.reader

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reader_state")
data class ReaderStateEntity(
    @PrimaryKey val id: Int = 0,
    val comicTitle: String,
    val page: Int,
    val deviceId: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val isSynced: Boolean = false
)