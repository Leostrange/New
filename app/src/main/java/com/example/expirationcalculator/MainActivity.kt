package com.example.expirationcalculator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import com.example.expirationcalculator.repository.ProductRepository
import com.example.expirationcalculator.ui.MainScreen
import com.example.expirationcalculator.viewmodel.ProductViewModel
import com.example.expirationcalculator.viewmodel.ProductViewModelFactory

class MainActivity : ComponentActivity() {
    
    private val repository by lazy { ProductRepository(this) }
    private val viewModel: ProductViewModel by viewModels { 
        ProductViewModelFactory(repository) 
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface {
                    MainScreen(viewModel)
                }
            }
        }
    }
}
