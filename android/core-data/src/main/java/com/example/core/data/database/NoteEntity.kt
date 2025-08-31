package com.example.core.data.database

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "notes",
    foreignKeys = [
        ForeignKey(
            entity = ComicEntity::class,
            parentColumns = ["filePath"],
            childColumns = ["comicId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["comicId"]),
        Index(value = ["page"])
    ]
)
data class NoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val comicId: String, // Foreign key to ComicEntity.filePath
    val page: Int,
    val content: String,
    val title: String?,
    val positionX: Float? = null, // Optional position for anchored notes
    val positionY: Float? = null, // Optional position for anchored notes
    val timestamp: Long = System.currentTimeMillis(),
    val lastModified: Long = System.currentTimeMillis()
)