package com.mrcomic.feature.library.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.mrcomic.feature.library.LibraryTab

@Composable
fun LibraryEmptyState(
    selectedTab: LibraryTab,
    searchQuery: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        val (icon, title, description, actionText) = when {
            searchQuery.isNotBlank() -> {
                Quadruple(
                    Icons.Default.SearchOff,
                    "Ничего не найдено",
                    "Попробуйте изменить поисковый запрос",
                    "Очистить поиск"
                )
            }
            selectedTab == LibraryTab.FAVORITES -> {
                Quadruple(
                    Icons.Default.FavoriteBorder,
                    "Нет избранных комиксов",
                    "Добавьте комиксы в избранное, чтобы они появились здесь",
                    null
                )
            }
            selectedTab == LibraryTab.IN_PROGRESS -> {
                Quadruple(
                    Icons.Default.MenuBook,
                    "Нет начатых комиксов",
                    "Начните читать комиксы, чтобы они появились здесь",
                    null
                )
            }
            selectedTab == LibraryTab.COMPLETED -> {
                Quadruple(
                    Icons.Default.CheckCircle,
                    "Нет прочитанных комиксов",
                    "Завершите чтение комиксов, чтобы они появились здесь",
                    null
                )
            }
            else -> {
                Quadruple(
                    Icons.Default.LibraryBooks,
                    "Библиотека пуста",
                    "Добавьте комиксы для начала чтения",
                    "Добавить комиксы"
                )
            }
        }

        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(72.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = description,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(0.8f)
        )

        if (actionText != null) {
            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    // Handle action based on context
                    when {
                        searchQuery.isNotBlank() -> {
                            // Clear search - this would need to be passed as callback
                        }
                        selectedTab == LibraryTab.ALL -> {
                            // Add comics - this would need to be passed as callback
                        }
                    }
                }
            ) {
                Text(actionText)
            }
        }
    }
}

private data class Quadruple<A, B, C, D>(
    val first: A,
    val second: B,
    val third: C,
    val fourth: D
)