package com.example.mrcomic

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.example.core.ui.splash.VideoSplash
import com.example.core.ui.theme.MrComicTheme
import com.example.mrcomic.navigation.AppNavHost
import com.example.mrcomic.navigation.Screen
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dagger.hilt.android.AndroidEntryPoint

/**
 * Main activity for Mr.Comic application
 * Handles app lifecycle and initializes the main UI
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge mode for modern UI
        enableEdgeToEdge()
        
        setContent {
            MrComicApp()
        }
    }
    
    override fun onResume() {
        super.onResume()
        
        // Track app activation
        // TODO: Add app activation analytics
    }
    
    override fun onPause() {
        super.onPause()
        
        // Track app background transition
        // TODO: Add app background transition analytics
    }
}

/**
 * Main application component with modern video splash screen
 * Manages splash screen state and navigation initialization
 */
@Composable
fun MrComicApp() {
    var showVideoSplash by remember { mutableStateOf(true) }
    
    // Apply theme and initialize navigation
    MrComicTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            if (showVideoSplash) {
                // Fallback to simple splash if video resource is not available
                try {
                    VideoSplash(
                        videoResId = R.raw.splash_video,
                        onFinished = { 
                            showVideoSplash = false
                        }
                    )
                } catch (e: Exception) {
                    // Fallback to simple text splash
                    SimpleTextSplash(
                        onFinished = { 
                            showVideoSplash = false
                        }
                    )
                }
            } else {
                val navController = rememberNavController()
                AppNavHost(
                    navController = navController,
                    onOnboardingComplete = { 
                        // Navigate to library after onboarding completion
                        navController.navigate(Screen.Library.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}

/**
 * Simple text-based splash screen as fallback
 * Used when video splash is not available or fails to load
 * 
 * @param onFinished Callback to execute when splash is finished
 */
@Composable
private fun SimpleTextSplash(onFinished: () -> Unit) {
    androidx.compose.runtime.LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(2000) // Show for 2 seconds
        onFinished()
    }
    
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Mr.Comic",
            fontSize = 32.sp,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Loading...",
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

/**
 * Preview for development
 * Shows a simplified version of the app for design preview
 */
@androidx.compose.ui.tooling.preview.Preview(showBackground = true)
@Composable
fun MrComicAppPreview() {
    MrComicTheme {
        // For preview, show a simplified version
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            // TODO: Add mock navigation for preview
        }
    }
}


