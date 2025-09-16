package com.mrcomic.feature.details

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ComicDetailsScreen(
    comicId: String,
    onBackClick: () -> Unit,
    onReadClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Mock data - replace with actual ViewModel
    val comic = remember {
        Comic(
            id = comicId,
            title = "Spider-Man: Amazing Adventures",
            author = "Stan Lee",
            description = "Follow the amazing adventures of your friendly neighborhood Spider-Man as he swings through New York City fighting crime and protecting the innocent.",
            coverUrl = "/placeholder.svg?height=400&width=300",
            rating = 4.5f,
            totalPages = 24,
            currentPage = 12,
            tags = listOf("Action", "Superhero", "Marvel", "Adventure"),
            publishDate = "2024-01-15",
            fileSize = "45.2 MB"
        )
    }
    
    val recommendations = remember {
        listOf(
            Comic(id = "2", title = "X-Men Origins", author = "Chris Claremont", coverUrl = "/placeholder.svg?height=200&width=150"),
            Comic(id = "3", title = "Iron Man Legacy", author = "Matt Fraction", coverUrl = "/placeholder.svg?height=200&width=150"),
            Comic(id = "4", title = "Thor: God of Thunder", author = "Jason Aaron", coverUrl = "/placeholder.svg?height=200&width=150")
        )
    }

    Column(modifier = modifier.fillMaxSize()) {
        // Top App Bar
        TopAppBar(
            title = { Text("Comic Details") },
            navigationIcon = {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            actions = {
                IconButton(onClick = { /* Share */ }) {
                    Icon(Icons.Default.Share, contentDescription = "Share")
                }
                IconButton(onClick = { /* Favorite */ }) {
                    Icon(Icons.Default.FavoriteBorder, contentDescription = "Add to favorites")
                }
            }
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Comic Cover and Basic Info
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    AsyncImage(
                        model = comic.coverUrl,
                        contentDescription = comic.title,
                        modifier = Modifier
                            .width(120.dp)
                            .height(160.dp),
                        contentScale = ContentScale.Crop
                    )
                    
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = comic.title,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "by ${comic.author}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        // Rating
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                Icons.Default.Star,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "${comic.rating}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                        
                        // Progress
                        Text(
                            text = "Page ${comic.currentPage} of ${comic.totalPages}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        LinearProgressIndicator(
                            progress = { comic.currentPage.toFloat() / comic.totalPages },
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
            }

            // Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onReadClick,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Continue Reading")
                    }
                    
                    OutlinedButton(
                        onClick = { /* Download */ },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Download")
                    }
                }
            }

            // Tags
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(comic.tags) { tag ->
                        AssistChip(
                            onClick = { /* Filter by tag */ },
                            label = { Text(tag) }
                        )
                    }
                }
            }

            // Description
            item {
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Description",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = comic.description,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            // Metadata
            item {
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Information",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        MetadataRow("Published", comic.publishDate)
                        MetadataRow("Pages", "${comic.totalPages}")
                        MetadataRow("File Size", comic.fileSize)
                        MetadataRow("Format", "CBZ")
                    }
                }
            }

            // Recommendations
            item {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "You might also like",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(recommendations) { recommendedComic ->
                            Column(
                                modifier = Modifier.width(100.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                AsyncImage(
                                    model = recommendedComic.coverUrl,
                                    contentDescription = recommendedComic.title,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(130.dp),
                                    contentScale = ContentScale.Crop
                                )
                                Text(
                                    text = recommendedComic.title,
                                    style = MaterialTheme.typography.bodySmall,
                                    maxLines = 2
                                )
                                Text(
                                    text = recommendedComic.author,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetadataRow(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

// Data class for Comic (should be in core-model)
data class Comic(
    val id: String,
    val title: String,
    val author: String,
    val description: String = "",
    val coverUrl: String,
    val rating: Float = 0f,
    val totalPages: Int = 0,
    val currentPage: Int = 0,
    val tags: List<String> = emptyList(),
    val publishDate: String = "",
    val fileSize: String = ""
)
