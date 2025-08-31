package com.example.feature.analytics.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.core.analytics.PerformanceStats
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.roundToInt
import com.patrykandpatrick.vico.compose.axis.horizontal.bottomAxis
import com.patrykandpatrick.vico.compose.axis.vertical.startAxis
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.chart.bar.barChart
import com.patrykandpatrick.vico.compose.component.shape.shader.fromColor
import com.patrykandpatrick.vico.compose.style.currentChartStyle
import com.patrykandpatrick.vico.core.axis.AxisPosition
import com.patrykandpatrick.vico.core.chart.line.LineChart
import com.patrykandpatrick.vico.core.component.shape.Shapes
import com.patrykandpatrick.vico.core.entry.ChartEntryModel
import com.patrykandpatrick.vico.core.entry.entryModelOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToCrashReports: () -> Unit,
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val selectedCrashReport by viewModel.selectedCrashReport.collectAsStateWithLifecycle()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Analytics Dashboard") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refreshData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                    IconButton(onClick = onNavigateToCrashReports) {
                        Icon(Icons.Default.BugReport, contentDescription = "Crash Reports")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                uiState.error != null -> {
                    ErrorMessage(
                        error = uiState.error!!,
                        onRetry = { viewModel.refreshData() },
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                else -> {
                    AnalyticsDashboard(
                        usageStats = uiState.usageStats,
                        performanceStats = uiState.performanceStats,
                        appEvents = uiState.appEvents,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
    
    // Show crash report details dialog if a report is selected
    selectedCrashReport?.let { report ->
        CrashReportDetailsDialog(
            report = report,
            onDismiss = { viewModel.clearSelectedCrashReport() }
        )
    }
}

@Composable
private fun AnalyticsDashboard(
    usageStats: UsageStats,
    performanceStats: PerformanceStats,
    appEvents: List<AppEvent>,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Usage Statistics Section
        item {
            UsageStatsSection(usageStats)
        }
        
        // Daily Usage Chart
        item {
            DailyUsageChart(usageStats.dailyUsage)
        }
        
        // Feature Usage Chart
        item {
            FeatureUsageChart(usageStats.mostUsedFeatures)
        }
        
        // Performance Statistics Section
        item {
            PerformanceStatsSection(performanceStats)
        }
        
        // Recent Events Section
        item {
            RecentEventsSection(appEvents)
        }
    }
}

@Composable
private fun UsageStatsSection(usageStats: UsageStats) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Usage Statistics",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Key Metrics
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                StatCard(
                    title = "Comics Read",
                    value = usageStats.totalComicsRead.toString(),
                    icon = Icons.Default.MenuBook
                )
                
                StatCard(
                    title = "Time Reading",
                    value = "${usageStats.totalTimeReading / 60}h ${(usageStats.totalTimeReading % 60)}m",
                    icon = Icons.Default.AccessTime
                )
                
                StatCard(
                    title = "Pages Read",
                    value = usageStats.totalPagesRead.toString(),
                    icon = Icons.Default.Description
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Favorite Genres
            Text(
                text = "Favorite Genres",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                usageStats.favoriteGenres.forEach { genre ->
                    AssistChip(
                        onClick = { },
                        label = { Text(genre) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun DailyUsageChart(dailyUsage: List<DailyUsage>) {
    if (dailyUsage.isEmpty()) return
    
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Daily Reading Time",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Prepare data for chart
            val chartEntries = dailyUsage.mapIndexed { index, usage ->
                index to usage.minutes.toFloat()
            }
            
            val model = entryModelOf(*chartEntries.toTypedArray())
            
            Chart(
                chart = lineChart(
                    lines = listOf(
                        LineChart.LineSpec(
                            lineColor = MaterialTheme.colorScheme.primary,
                            lineBackgroundShader = fromColor(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                            pointSize = 8.dp
                        )
                    )
                ),
                model = model,
                modifier = Modifier.fillMaxWidth().height(200.dp),
                startAxis = startAxis(),
                bottomAxis = bottomAxis(
                    valueFormatter = { index, _ ->
                        if (index.toInt() < dailyUsage.size) {
                            dailyUsage[index.toInt()].date.substring(5) // Show MM-DD
                        } else {
                            ""
                        }
                    }
                )
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Legend
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Minutes", style = MaterialTheme.typography.bodySmall)
                Text("Days", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable
private fun FeatureUsageChart(featureUsage: List<FeatureUsage>) {
    if (featureUsage.isEmpty()) return
    
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Feature Usage",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Prepare data for chart
            val chartEntries = featureUsage.mapIndexed { index, usage ->
                index to usage.usageCount.toFloat()
            }
            
            val model = entryModelOf(*chartEntries.toTypedArray())
            
            Chart(
                chart = barChart(
                    bars = listOf(
                        com.patrykandpatrick.vico.core.chart.bar.BarChart.BarSpec(
                            fillShader = fromColor(MaterialTheme.colorScheme.primary)
                        )
                    )
                ),
                model = model,
                modifier = Modifier.fillMaxWidth().height(200.dp),
                startAxis = startAxis(),
                bottomAxis = bottomAxis(
                    valueFormatter = { index, _ ->
                        if (index.toInt() < featureUsage.size) {
                            featureUsage[index.toInt()].featureName.take(3) // Show first 3 chars
                        } else {
                            ""
                        }
                    }
                )
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Feature list with usage counts
            featureUsage.forEach { feature ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(feature.featureName)
                    Text("${feature.usageCount} times")
                }
            }
        }
    }
}

@Composable
private fun PerformanceStatsSection(performanceStats: PerformanceStats) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Performance Statistics",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Performance Metrics
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                StatCard(
                    title = "Avg. Duration",
                    value = "${(performanceStats.averageDuration / 1000).roundToInt()}s",
                    icon = Icons.Default.Speed
                )
                
                StatCard(
                    title = "Operations",
                    value = performanceStats.totalOperations.toString(),
                    icon = Icons.Default.Analytics
                )
                
                StatCard(
                    title = "Slow Ops",
                    value = performanceStats.slowOperations.toString(),
                    icon = Icons.Default.Warning,
                    valueColor = if (performanceStats.slowOperations > 0) MaterialTheme.colorScheme.error else Color.Unspecified
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Operation Counts
            Text(
                text = "Operation Distribution",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            performanceStats.operationCounts.forEach { (operation, count) ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(operation)
                    Text("$count")
                }
                LinearProgressIndicator(
                    progress = (count.toFloat() / performanceStats.operationCounts.values.maxOrNull()?.toFloat() ?: 1f),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
private fun RecentEventsSection(appEvents: List<AppEvent>) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Recent Events",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            if (appEvents.isEmpty()) {
                Text(
                    text = "No recent events",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                appEvents.forEach { event ->
                    EventItem(event)
                }
            }
        }
    }
}

@Composable
private fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    valueColor: Color = Color.Unspecified
) {
    Card(
        modifier = Modifier.width(100.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = value,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold,
                color = valueColor
            )
        }
    }
}

@Composable
private fun FeatureUsageItem(feature: FeatureUsage) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = feature.featureName,
                style = MaterialTheme.typography.bodyLarge
            )
            
            Text(
                text = "Last used: ${formatTimeAgo(feature.lastUsed)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        Text(
            text = feature.usageCount.toString(),
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun EventItem(event: AppEvent) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = event.eventName.replace("_", " ").replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.bodyLarge
            )
            
            if (event.parameters.isNotEmpty()) {
                Text(
                    text = event.parameters.entries.joinToString(", ") { "${it.key}: ${it.value}" },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Text(
                text = formatTime(event.timestamp),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ErrorMessage(
    error: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.Warning,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.error,
            modifier = Modifier.size(48.dp)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = error,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.error
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(onClick = onRetry) {
            Text("Retry")
        }
    }
}

@Composable
private fun CrashReportDetailsDialog(
    report: com.example.core.analytics.CrashReport,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Crash Report Details")
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(400.dp)
            ) {
                Text(
                    text = report.content,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

// Helper functions
private fun formatTimeAgo(timestamp: Long): String {
    val now = System.currentTimeMillis()
    val diff = now - timestamp
    
    return when {
        diff < 60000 -> "Just now"
        diff < 3600000 -> "${diff / 60000} minutes ago"
        diff < 86400000 -> "${diff / 3600000} hours ago"
        else -> "${diff / 86400000} days ago"
    }
}

private fun formatTime(timestamp: Long): String {
    val formatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    return formatter.format(Date(timestamp))
}