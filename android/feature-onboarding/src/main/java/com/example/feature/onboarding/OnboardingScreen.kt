package com.example.feature.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
=======
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
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
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(
                    color = MaterialTheme.colorScheme.primary,
                    shape = MaterialTheme.shapes.large
                )
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "MC",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.onPrimary
            )
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
        }
        // App icon placeholder
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(
                    color = MaterialTheme.colorScheme.primary,
                    shape = MaterialTheme.shapes.large
                )
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "MC",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.onPrimary
            )
        }
=======
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(
                    color = MaterialTheme.colorScheme.primary,
                    shape = MaterialTheme.shapes.large
                )
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "MC",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.onPrimary
            )
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Text(
            text = "Welcome to Mr.Comic!",
            style = MaterialTheme.typography.headlineMedium,
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
            modifier = Modifier.padding(bottom = 16.dp)
        )
        // Welcome text
        Text(
            text = "Welcome to Mr.Comic!",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )
=======
        Text(
            text = "Welcome to Mr.Comic!",
            style = MaterialTheme.typography.headlineMedium,
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        Text(
            text = "Your personal comic reader with powerful features",
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(bottom = 8.dp),
            textAlign = TextAlign.Center
        )
        
        Text(
            text = "• Support for CBZ, CBR, PDF formats\n• Custom themes and reading preferences\n• Progress tracking and bookmarks\n• Plugin system for extensions",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 32.dp),
            textAlign = TextAlign.Center
        )
        
        // Get started button
        Button(
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
        // Description
        Text(
            text = "Your personal comic reader with powerful features",
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(bottom = 8.dp),
            textAlign = TextAlign.Center
        )
        
        Text(
            text = "• Support for CBZ, CBR, PDF formats\n• Custom themes and reading preferences\n• Progress tracking and bookmarks\n• Plugin system for extensions",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 32.dp),
            textAlign = TextAlign.Center
        )
=======
        Text(
            text = "Your personal comic reader with powerful features",
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(bottom = 8.dp),
            textAlign = TextAlign.Center
        )
        
        Text(
            text = "• Support for CBZ, CBR, PDF formats\n• Custom themes and reading preferences\n• Progress tracking and bookmarks\n• Plugin system for extensions",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 32.dp),
            textAlign = TextAlign.Center
        )
        
        // Get started button
        Button(
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
            Text(
                text = "Get Started",
                style = MaterialTheme.typography.titleMedium
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
            )
        }
        // Get started button
        Button(
            onClick = onOnboardingComplete,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp)
        ) {
            Text(
                text = "Get Started",
                style = MaterialTheme.typography.titleMedium
            )
        }
=======
            Text(
                text = "Get Started",
                style = MaterialTheme.typography.titleMedium
>>>>>>> 58d41db0 (Fix: Resolve all compilation errors and achieve green build)
            )
        }
    }
}


