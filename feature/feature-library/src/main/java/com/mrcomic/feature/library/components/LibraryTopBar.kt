package com.mrcomic.feature.library.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryTopBar(
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onSearchClick: () -> Unit,
    isGridView: Boolean,
    onToggleViewMode: () -> Unit,
    onSortClick: () -> Unit,
    onStatsClick: () -> Unit,
    onRefresh: () -> Unit,
    isRefreshing: Boolean,
    modifier: Modifier = Modifier
) {
    var isSearchActive by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            if (isSearchActive) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchQueryChange,
                    placeholder = { Text("Поиск комиксов...") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    trailingIcon = {
                        IconButton(
                            onClick = {
                                onSearchQueryChange("")
                                isSearchActive = false
                            }
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Закрыть поиск")
                        }
                    }
                )
            } else {
                Text("Библиотека")
            }
        },
        actions = {
            if (!isSearchActive) {
                // Search button
                IconButton(onClick = { isSearchActive = true }) {
                    Icon(Icons.Default.Search, contentDescription = "Поиск")
                }
                
                // View mode toggle
                IconButton(onClick = onToggleViewMode) {
                    Icon(
                        imageVector = if (isGridView) Icons.Default.ViewList else Icons.Default.GridView,
                        contentDescription = if (isGridView) "Список" else "Сетка"
                    )
                }
                
                // More options menu
                var showMenu by remember { mutableStateOf(false) }
                
                Box {
                    IconButton(onClick = { showMenu = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Меню")
                    }
                    
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Сортировка") },
                            onClick = {
                                onSortClick()
                                showMenu = false
                            },
                            leadingIcon = {
                                Icon(Icons.Default.Sort, contentDescription = null)
                            }
                        )
                        
                        DropdownMenuItem(
                            text = { Text("Статистика") },
                            onClick = {
                                onStatsClick()
                                showMenu = false
                            },
                            leadingIcon = {
                                Icon(Icons.Default.Analytics, contentDescription = null)
                            }
                        )
                        
                        Divider()
                        
                        DropdownMenuItem(
                            text = { Text("Обновить") },
                            onClick = {
                                onRefresh()
                                showMenu = false
                            },
                            leadingIcon = {
                                if (isRefreshing) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Icon(Icons.Default.Refresh, contentDescription = null)
                                }
                            },
                            enabled = !isRefreshing
                        )
                    }
                }
            }
        },
        modifier = modifier
    )
}