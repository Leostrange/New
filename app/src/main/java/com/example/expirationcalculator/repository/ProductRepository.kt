package com.example.expirationcalculator.repository

import android.content.Context
import com.example.expirationcalculator.data.AppDatabase
import com.example.expirationcalculator.data.Product
import com.example.expirationcalculator.data.ProductDao
import kotlinx.coroutines.flow.Flow

class ProductRepository(context: Context) {
    private val productDao: ProductDao = AppDatabase.getDatabase(context).productDao()
    
    fun getAllProducts(): Flow<List<Product>> = productDao.getAll()
    
    suspend fun insertProduct(product: Product) = productDao.insert(product)
    
    suspend fun deleteProduct(product: Product) = productDao.delete(product)
}
