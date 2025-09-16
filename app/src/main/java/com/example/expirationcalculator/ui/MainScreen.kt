package com.example.expirationcalculator.ui

import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.expirationcalculator.data.Product
import com.example.expirationcalculator.viewmodel.ProductViewModel
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: ProductViewModel) {
    var showAddDialog by remember { mutableStateOf(false) }
    val products by viewModel.products.collectAsState(initial = emptyList())
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Срок годности",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Normal
                    ) 
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.Black
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Color(0xFF4CAF50),
                contentColor = Color.White
            ) {
                Text("+", fontSize = 24.sp)
            }
        },
        containerColor = Color.White
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (products.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "Нет продуктов.\nНажмите + чтобы добавить.",
                            color = Color.Gray,
                            fontSize = 16.sp
                        )
                    }
                }
            } else {
                items(products, key = { it.id }) { product ->
                    ProductCard(
                        product = product,
                        viewModel = viewModel
                    )
                }
            }
        }
    }
    
    if (showAddDialog) {
        AddProductDialog(
            viewModel = viewModel,
            onDismiss = { showAddDialog = false }
        )
    }
}

@Composable
fun ProductCard(
    product: Product,
    viewModel: ProductViewModel
) {
    var offsetX by remember { mutableStateOf(0f) }
    val expDate = viewModel.calculateExpiration(product.productionDate, product.duration, product.unit)
    val (status, color, _) = viewModel.getStatus(expDate)
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .pointerInput(Unit) {
                detectHorizontalDragGestures { _, dragAmount ->
                    offsetX += dragAmount
                    if (offsetX < -200f) {
                        viewModel.deleteProduct(product)
                        offsetX = 0f
                    }
                }
            }
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .offset(x = offsetX.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = product.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = "Произведено: ${product.productionDate}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Истекает: ${expDate.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"))}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = status,
                    fontSize = 14.sp,
                    color = Color(color),
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddProductDialog(
    viewModel: ProductViewModel,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var productionDate by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }
    var unit by remember { mutableStateOf("days") }
    var error by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf(false) }
    
    val units = mapOf(
        "days" to "Дни",
        "weeks" to "Недели", 
        "months" to "Месяцы",
        "years" to "Годы"
    )
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Text(
                "Добавить продукт",
                fontSize = 20.sp,
                color = Color.Black
            ) 
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Название") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF4CAF50),
                        focusedLabelColor = Color(0xFF4CAF50)
                    )
                )
                
                OutlinedTextField(
                    value = productionDate,
                    onValueChange = { productionDate = it },
                    label = { Text("Дата производства (ДД.ММ.ГГГГ)") },
                    placeholder = { Text("15.08.2025") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF4CAF50),
                        focusedLabelColor = Color(0xFF4CAF50)
                    )
                )
                
                OutlinedTextField(
                    value = duration,
                    onValueChange = { duration = it },
                    label = { Text("Срок") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF4CAF50),
                        focusedLabelColor = Color(0xFF4CAF50)
                    )
                )
                
                ExposedDropdownMenuBox(
                    expanded = expanded,
                    onExpandedChange = { expanded = !expanded }
                ) {
                    OutlinedTextField(
                        readOnly = true,
                        value = units[unit] ?: "Дни",
                        onValueChange = {},
                        label = { Text("Единица") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF4CAF50),
                            focusedLabelColor = Color(0xFF4CAF50)
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        units.forEach { (key, value) ->
                            DropdownMenuItem(
                                onClick = { 
                                    unit = key
                                    expanded = false 
                                },
                                text = { Text(value) }
                            )
                        }
                    }
                }
                
                if (error.isNotEmpty()) {
                    Text(
                        text = error,
                        color = Color(0xFFF44336),
                        fontSize = 14.sp,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    error = ""
                    try {
                        if (name.isBlank()) {
                            error = "Введите название продукта"
                            return@Button
                        }
                        
                        val dur = duration.toIntOrNull()
                        if (dur == null || dur <= 0) {
                            error = "Срок должен быть положительным числом"
                            return@Button
                        }
                        
                        // Проверка формата даты
                        val formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy")
                        formatter.parse(productionDate)
                        
                        viewModel.addProduct(name, productionDate, dur, unit)
                        onDismiss()
                    } catch (e: DateTimeParseException) {
                        error = "Неверный формат даты (используйте ДД.ММ.ГГГГ)"
                    } catch (e: Exception) {
                        error = e.message ?: "Ошибка ввода"
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF4CAF50)
                )
            ) {
                Text("Сохранить", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Отмена", color = Color.Gray)
            }
        },
        containerColor = Color.White
    )
}
