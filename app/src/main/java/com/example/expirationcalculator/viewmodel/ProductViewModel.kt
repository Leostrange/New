package com.example.expirationcalculator.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.expirationcalculator.data.Product
import com.example.expirationcalculator.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

class ProductViewModel(private val repository: ProductRepository) : ViewModel() {
    
    val products: Flow<List<Product>> = repository.getAllProducts()
    
    fun addProduct(name: String, productionDate: String, duration: Int, unit: String) {
        viewModelScope.launch {
            repository.insertProduct(
                Product(
                    name = name,
                    productionDate = productionDate,
                    duration = duration,
                    unit = unit
                )
            )
        }
    }
    
    fun deleteProduct(product: Product) {
        viewModelScope.launch {
            repository.deleteProduct(product)
        }
    }
    
    fun calculateExpiration(productionDate: String, duration: Int, unit: String): LocalDate {
        val formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy")
        val start = LocalDate.parse(productionDate, formatter)
        return when (unit) {
            "days" -> start.plusDays(duration.toLong())
            "weeks" -> start.plusWeeks(duration.toLong())
            "months" -> start.plusMonths(duration.toLong())
            "years" -> start.plusYears(duration.toLong())
            else -> start
        }
    }
    
    fun getStatus(expiration: LocalDate): Triple<String, Long, Boolean> {
        val today = LocalDate.now()
        val daysLeft = ChronoUnit.DAYS.between(today, expiration)
        return when {
            daysLeft < 0 -> Triple("Истек", 0xFFF44336, true) // red
            daysLeft < 7 -> Triple("Скоро истечет", 0xFFFFC107, true) // yellow
            else -> Triple("Свежий", 0xFF4CAF50, false) // green
        }
    }
}
