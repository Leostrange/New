package com.example.core.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.example.core.ui.theme.ComicGridSpacing
import com.example.core.ui.theme.PaddingMedium

/**
 * Adaptive navigation component that switches between bottom navigation and navigation rail
 * based on screen size
 */
@Composable
fun AdaptiveNavigation(
    windowSizeClass: WindowSizeClass,
    navigationItems: List<NavigationItem>,
    currentDestination: String?,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable (PaddingValues) -> Unit
) {
    val useNavigationRail = windowSizeClass.widthSizeClass != WindowWidthSizeClass.Compact

    if (useNavigationRail) {
        Row(modifier = modifier.fillMaxSize()) {
            NavigationRail(
                modifier = Modifier.padding(vertical = PaddingMedium)
            ) {
                navigationItems.forEach { item ->
                    NavigationRailItem(
                        icon = { androidx.compose.material3.Icon(item.icon, contentDescription = item.label) },
                        label = { androidx.compose.material3.Text(item.label) },
                        selected = currentDestination == item.route,
                        onClick = { onNavigate(item.route) }
                    )
                }
            }
            Box(modifier = Modifier.weight(1f)) {
                content(PaddingValues(0.dp))
            }
        }
    } else {
        Scaffold(
            modifier = modifier,
            bottomBar = {
                NavigationBar {
                    navigationItems.forEach { item ->
                        NavigationBarItem(
                            icon = { androidx.compose.material3.Icon(item.icon, contentDescription = item.label) },
                            label = { androidx.compose.material3.Text(item.label) },
                            selected = currentDestination == item.route,
                            onClick = { onNavigate(item.route) }
                        )
                    }
                }
            },
            content = content
        )
    }
}

/**
 * Navigation item data class
 */
data class NavigationItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)

/**
 * Adaptive grid that adjusts column count based on screen size
 */
@Composable
fun <T> AdaptiveGrid(
    items: List<T>,
    windowSizeClass: WindowSizeClass,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(ComicGridSpacing),
    verticalArrangement: Arrangement.Vertical = Arrangement.spacedBy(ComicGridSpacing),
    horizontalArrangement: Arrangement.Horizontal = Arrangement.spacedBy(ComicGridSpacing),
    itemContent: @Composable (T) -> Unit
) {
    val columns = when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> 2
        WindowWidthSizeClass.Medium -> 3
        WindowWidthSizeClass.Expanded -> 4
        else -> 2
    }

    LazyVerticalGrid(
        columns = GridCells.Fixed(columns),
        modifier = modifier,
        contentPadding = contentPadding,
        verticalArrangement = verticalArrangement,
        horizontalArrangement = horizontalArrangement
    ) {
        items(items) { item ->
            itemContent(item)
        }
    }
}

/**
 * Adaptive layout that switches between single-pane and two-pane based on screen size
 */
@Composable
fun AdaptiveLayout(
    windowSizeClass: WindowSizeClass,
    modifier: Modifier = Modifier,
    masterPane: @Composable () -> Unit,
    detailPane: @Composable () -> Unit,
    showDetailPane: Boolean = true
) {
    val useTwoPaneLayout = windowSizeClass.widthSizeClass == WindowWidthSizeClass.Expanded

    if (useTwoPaneLayout && showDetailPane) {
        Row(
            modifier = modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.spacedBy(PaddingMedium)
        ) {
            Box(
                modifier = Modifier
                    .weight(0.4f)
                    .fillMaxSize()
            ) {
                masterPane()
            }
            Box(
                modifier = Modifier
                    .weight(0.6f)
                    .fillMaxSize()
            ) {
                detailPane()
            }
        }
    } else {
        Box(modifier = modifier.fillMaxSize()) {
            if (showDetailPane) {
                detailPane()
            } else {
                masterPane()
            }
        }
    }
}

/**
 * Adaptive content layout with responsive padding
 */
@Composable
fun AdaptiveContentLayout(
    windowSizeClass: WindowSizeClass,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val horizontalPadding = when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> 16.dp
        WindowWidthSizeClass.Medium -> 32.dp
        WindowWidthSizeClass.Expanded -> 48.dp
        else -> 16.dp
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = horizontalPadding)
    ) {
        content()
    }
}

/**
 * Responsive text size based on screen size
 */
@Composable
fun getAdaptiveTextStyle(windowSizeClass: WindowSizeClass) = when (windowSizeClass.widthSizeClass) {
    WindowWidthSizeClass.Compact -> MaterialTheme.typography.bodyMedium
    WindowWidthSizeClass.Medium -> MaterialTheme.typography.bodyLarge
    WindowWidthSizeClass.Expanded -> MaterialTheme.typography.titleMedium
    else -> MaterialTheme.typography.bodyMedium
}

/**
 * Adaptive dialog/sheet component
 */
@Composable
fun AdaptiveDialog(
    windowSizeClass: WindowSizeClass,
    showDialog: Boolean,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    title: String? = null,
    content: @Composable () -> Unit
) {
    val useFullScreenDialog = windowSizeClass.widthSizeClass == WindowWidthSizeClass.Compact

    if (showDialog) {
        if (useFullScreenDialog) {
            // Use bottom sheet or full screen dialog for compact screens
            androidx.compose.material3.AlertDialog(
                onDismissRequest = onDismiss,
                title = title?.let { { androidx.compose.material3.Text(it) } },
                text = { content() },
                confirmButton = {
                    androidx.compose.material3.TextButton(onClick = onDismiss) {
                        androidx.compose.material3.Text("OK")
                    }
                },
                modifier = modifier
            )
        } else {
            // Use regular dialog for larger screens
            androidx.compose.material3.AlertDialog(
                onDismissRequest = onDismiss,
                title = title?.let { { androidx.compose.material3.Text(it) } },
                text = { content() },
                confirmButton = {
                    androidx.compose.material3.TextButton(onClick = onDismiss) {
                        androidx.compose.material3.Text("OK")
                    }
                },
                modifier = modifier
            )
        }
    }
}