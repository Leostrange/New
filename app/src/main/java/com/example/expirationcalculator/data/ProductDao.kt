package com.example.expirationcalculator.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY id DESC")
    fun getAll(): Flow<List<Product>>

    @Insert
    suspend fun insert(product: Product)

    @Delete
    suspend fun delete(product: Product)
}
