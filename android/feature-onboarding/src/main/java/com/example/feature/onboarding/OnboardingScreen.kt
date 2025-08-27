package com.example.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun OnboardingScreen(onOnboardingComplete: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // App icon placeholder
        androidx.compose.foundation.background(
            color = androidx.compose.material3.MaterialTheme.colorScheme.primary,
            shape = androidx.compose.material3.MaterialTheme.shapes.large
        ) {
            androidx.compose.foundation.layout.Box(
                modifier = Modifier
                    .size(120.dp)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                androidx.compose.material3.Text(
                    text = "MC",
                    style = androidx.compose.material3.MaterialTheme.typography.displayLarge,
                    color = androidx.compose.material3.MaterialTheme.colorScheme.onPrimary
                )
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Welcome text
        androidx.compose.material3.Text(
            text = "Welcome to Mr.Comic!",
            style = androidx.compose.material3.MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        // Description
        androidx.compose.material3.Text(
            text = "Your personal comic reader with powerful features",
            style = androidx.compose.material3.MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(bottom = 8.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        
        androidx.compose.material3.Text(
            text = "• Support for CBZ, CBR, PDF formats\n• Custom themes and reading preferences\n• Progress tracking and bookmarks\n• Plugin system for extensions",
            style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 32.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        
        // Get started button
        androidx.compose.material3.Button(
            onClick = onOnboardingComplete,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp)
        ) {
            androidx.compose.material3.Text(
                text = "Get Started",
                style = androidx.compose.material3.MaterialTheme.typography.titleMedium
            )
        }
    }
}


