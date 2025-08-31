package com.example.feature.reader.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Note
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.core.model.Bookmark
import com.example.core.model.Note
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun BookmarksNotesDialog(
    comicId: String,
    currentPage: Int,
    bookmarks: List<Bookmark>,
    notes: List<Note>,
    isCurrentPageBookmarked: Boolean,
    onDismiss: () -> Unit,
    onAddBookmark: (page: Int, label: String?) -> Unit,
    onDeleteBookmark: (bookmark: Bookmark) -> Unit,
    onJumpToPage: (page: Int) -> Unit,
    onAddNote: (page: Int, content: String, title: String?) -> Unit,
    onEditNote: (note: Note) -> Unit,
    onDeleteNote: (note: Note) -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    var showAddNoteDialog by remember { mutableStateOf(false) }
    var showAddBookmarkDialog by remember { mutableStateOf(false) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Bookmarks & Notes")
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(400.dp)
            ) {
                // Tab Row
                TabRow(selectedTabIndex = selectedTab) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("Bookmarks (${bookmarks.size})") },
                        icon = { Icon(Icons.Default.Bookmark, contentDescription = null) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("Notes (${notes.size})") },
                        icon = { Icon(Icons.Default.Note, contentDescription = null) }
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Content based on selected tab
                when (selectedTab) {
                    0 -> BookmarksContent(
                        bookmarks = bookmarks,
                        currentPage = currentPage,
                        isCurrentPageBookmarked = isCurrentPageBookmarked,
                        onJumpToPage = onJumpToPage,
                        onDeleteBookmark = onDeleteBookmark,
                        onAddBookmark = { showAddBookmarkDialog = true }
                    )
                    1 -> NotesContent(
                        notes = notes.filter { it.comicId == comicId },
                        currentPage = currentPage,
                        onJumpToPage = onJumpToPage,
                        onEditNote = onEditNote,
                        onDeleteNote = onDeleteNote,
                        onAddNote = { showAddNoteDialog = true }
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
    
    // Add Bookmark Dialog
    if (showAddBookmarkDialog) {
        AddBookmarkDialog(
            currentPage = currentPage,
            onDismiss = { showAddBookmarkDialog = false },
            onConfirm = { page, label ->
                onAddBookmark(page, label)
                showAddBookmarkDialog = false
            }
        )
    }
    
    // Add Note Dialog
    if (showAddNoteDialog) {
        AddNoteDialog(
            currentPage = currentPage,
            onDismiss = { showAddNoteDialog = false },
            onConfirm = { page, content, title ->
                onAddNote(page, content, title)
                showAddNoteDialog = false
            }
        )
    }
}

@Composable
private fun BookmarksContent(
    bookmarks: List<Bookmark>,
    currentPage: Int,
    isCurrentPageBookmarked: Boolean,
    onJumpToPage: (Int) -> Unit,
    onDeleteBookmark: (Bookmark) -> Unit,
    onAddBookmark: () -> Unit
) {
    Column {
        // Quick bookmark current page button
        OutlinedButton(
            onClick = onAddBookmark,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = if (isCurrentPageBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                contentDescription = null,
                modifier = Modifier.padding(end = 8.dp)
            )
            Text(if (isCurrentPageBookmarked) "Remove Bookmark" else "Bookmark Current Page ($currentPage)")
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (bookmarks.isEmpty()) {
            Text(
                text = "No bookmarks yet",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(16.dp)
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(bookmarks) { bookmark ->
                    BookmarkItem(
                        bookmark = bookmark,
                        onJumpToPage = onJumpToPage,
                        onDelete = onDeleteBookmark
                    )
                }
            }
        }
    }
}

@Composable
private fun NotesContent(
    notes: List<Note>,
    currentPage: Int,
    onJumpToPage: (Int) -> Unit,
    onEditNote: (Note) -> Unit,
    onDeleteNote: (Note) -> Unit,
    onAddNote: () -> Unit
) {
    Column {
        // Add note button
        OutlinedButton(
            onClick = onAddNote,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = null,
                modifier = Modifier.padding(end = 8.dp)
            )
            Text("Add Note to Current Page ($currentPage)")
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (notes.isEmpty()) {
            Text(
                text = "No notes yet",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(16.dp)
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(notes) { note ->
                    NoteItem(
                        note = note,
                        onJumpToPage = onJumpToPage,
                        onEdit = onEditNote,
                        onDelete = onDeleteNote
                    )
                }
            }
        }
    }
}

@Composable
private fun BookmarkItem(
    bookmark: Bookmark,
    onJumpToPage: (Int) -> Unit,
    onDelete: (Bookmark) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = bookmark.label ?: "Page ${bookmark.page}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "Page ${bookmark.page}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Row {
                TextButton(onClick = { onJumpToPage(bookmark.page) }) {
                    Text("Jump")
                }
                IconButton(onClick = { onDelete(bookmark) }) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete bookmark",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
private fun NoteItem(
    note: Note,
    onJumpToPage: (Int) -> Unit,
    onEdit: (Note) -> Unit,
    onDelete: (Note) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    if (!note.title.isNullOrBlank()) {
                        Text(
                            text = note.title,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Text(
                        text = "Page ${note.page}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Row {
                    TextButton(onClick = { onJumpToPage(note.page) }) {
                        Text("Jump")
                    }
                    IconButton(onClick = { onEdit(note) }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit note")
                    }
                    IconButton(onClick = { onDelete(note) }) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Delete note",
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = note.content,
                style = MaterialTheme.typography.bodySmall,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun AddBookmarkDialog(
    currentPage: Int,
    onDismiss: () -> Unit,
    onConfirm: (page: Int, label: String?) -> Unit
) {
    var page by remember { mutableStateOf(currentPage.toString()) }
    var label by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Bookmark") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = page,
                    onValueChange = { page = it },
                    label = { Text("Page") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                
                OutlinedTextField(
                    value = label,
                    onValueChange = { label = it },
                    label = { Text("Label (Optional)") },
                    placeholder = { Text("Enter bookmark label") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val pageNum = page.toIntOrNull() ?: currentPage
                    val bookmarkLabel = if (label.isBlank()) null else label
                    onConfirm(pageNum, bookmarkLabel)
                }
            ) {
                Text("Add")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun AddNoteDialog(
    currentPage: Int,
    onDismiss: () -> Unit,
    onConfirm: (page: Int, content: String, title: String?) -> Unit
) {
    var page by remember { mutableStateOf(currentPage.toString()) }
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Note") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = page,
                    onValueChange = { page = it },
                    label = { Text("Page") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title (Optional)") },
                    placeholder = { Text("Enter note title") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Content") },
                    placeholder = { Text("Enter your note") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    if (content.isNotBlank()) {
                        val pageNum = page.toIntOrNull() ?: currentPage
                        val noteTitle = if (title.isBlank()) null else title
                        onConfirm(pageNum, content, noteTitle)
                    }
                },
                enabled = content.isNotBlank()
            ) {
                Text("Add")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}