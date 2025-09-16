package com.example.expirationcalculator.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "products")
data class Product(
    @PrimaryKey(autoGenerate = true) 
    val id: Int = 0,
    val name: String,
    val productionDate: String, // "DD.MM.YYYY"
    val duration: Int,
    val unit: String // "days", "weeks", "months", "years"
)
