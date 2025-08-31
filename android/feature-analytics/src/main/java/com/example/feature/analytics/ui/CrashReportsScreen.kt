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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.core.analytics.CrashReport
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CrashReportsScreen(
    onNavigateBack: () -> Unit,
    viewModel: AnalyticsViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val crashReports by viewModel.crashReports.collectAsState()
    val isLoading by viewModel.isCrashReportsLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadCrashReports(context)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Crash Reports") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.submitAllCrashReports(context) }) {
                        Icon(Icons.Default.Upload, contentDescription = "Submit All")
                    }
                    IconButton(onClick = { viewModel.loadCrashReports(context) }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                    IconButton(onClick = { viewModel.clearAllCrashReports(context) }) {
                        Icon(Icons.Default.Delete, contentDescription = "Clear All")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            when {
                isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                crashReports.isEmpty() -> {
                    EmptyCrashReportsView()
                }
                else -> {
                    CrashReportsList(
                        crashReports = crashReports,
                        onReportSelected = { report -> viewModel.selectCrashReport(report) },
                        onDeleteReport = { report -> viewModel.deleteCrashReport(context, report) },
                        onSubmitReport = { report -> viewModel.submitCrashReport(context, report) }
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyCrashReportsView() {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.BugReport,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "No crash reports found",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "Crash reports will appear here when the app encounters unhandled exceptions",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun CrashReportsList(
    crashReports: List<CrashReport>,
    onReportSelected: (CrashReport) -> Unit,
    onDeleteReport: (CrashReport) -> Unit,
    onSubmitReport: (CrashReport) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(crashReports) { report ->
            CrashReportItem(
                report = report,
                onReportSelected = onReportSelected,
                onDeleteReport = onDeleteReport,
                onSubmitReport = onSubmitReport
            )
        }
    }
}

@Composable
private fun CrashReportItem(
    report: CrashReport,
    onReportSelected: (CrashReport) -> Unit,
    onDeleteReport: (CrashReport) -> Unit,
    onSubmitReport: (CrashReport) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header with timestamp and error type
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = formatDateTime(report.timestamp),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Text(
                    text = extractErrorType(report.content),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Report summary
            Text(
                text = extractErrorMessage(report.content),
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = { onDeleteReport(report) }) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete")
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                TextButton(onClick = { onSubmitReport(report) }) {
                    Icon(
                        Icons.Default.Upload,
                        contentDescription = "Submit",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Submit")
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Button(onClick = { onReportSelected(report) }) {
                    Text("View Details")
                }
            }
        }
    }
}

@Composable
private fun CrashReportDetailsDialog(
    report: CrashReport,
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
private fun formatDateTime(timestamp: Long): String {
    val formatter = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
    return formatter.format(Date(timestamp))
}

private fun formatTime(timestamp: Long): String {
    val formatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    return formatter.format(Date(timestamp))
}

private fun extractErrorType(content: String): String {
    val lines = content.lines()
    val exceptionLine = lines.firstOrNull { it.startsWith("Exception:") }
    return exceptionLine?.substringAfter("Exception: ")?.takeIf { it.isNotBlank() } ?: "Unknown Error"
}

private fun extractErrorMessage(content: String): String {
    val lines = content.lines()
    val messageLine = lines.firstOrNull { it.startsWith("Message:") }
    return messageLine?.substringAfter("Message: ")?.takeIf { it.isNotBlank() } ?: "No message provided"
}