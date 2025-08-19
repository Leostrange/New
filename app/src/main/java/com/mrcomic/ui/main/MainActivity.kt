package com.mrcomic.ui.main

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.mrcomic.ui.auth.LoginScreen
import com.mrcomic.ui.library.LibraryScreen
import com.mrcomic.ui.library.Comic
import com.mrcomic.ui.reader.ReaderScreen
import com.mrcomic.ui.settings.SettingsScreen
import com.mrcomic.ui.theme.AppTheme
import com.mrcomic.ui.theme.MrComicTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MrComicApp()
        }
    }
}

@Composable
fun MrComicApp() {
    var currentTheme by remember { mutableStateOf(AppTheme.LIGHT) }
    var isAuthenticated by remember { mutableStateOf(false) }
    var currentScreen by remember { mutableStateOf(Screen.LIBRARY) }
    var selectedComic by remember { mutableStateOf<Comic?>(null) }

    MrComicTheme(theme = currentTheme) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            when {
                !isAuthenticated -> {
                    LoginScreen(
                        onLoginClick = { username, password ->
                            // Здесь должна быть логика авторизации
                            isAuthenticated = true
                        },
                        onRegisterClick = {
                            // Переход к экрану регистрации
                        },
                        onForgotPasswordClick = {
                            // Переход к восстановлению пароля
                        }
                    )
                }
                selectedComic != null -> {
                    ReaderScreen(
                        comicTitle = selectedComic!!.title,
                        pages = generateSamplePages(),
                        initialPage = selectedComic!!.currentPage,
                        onBackClick = { selectedComic = null },
                        onMenuClick = { /* Открыть меню читалки */ }
                    )
                }
                else -> {
                    MainScreenWithNavigation(
                        currentScreen = currentScreen,
                        onScreenChange = { currentScreen = it },
                        currentTheme = currentTheme,
                        onThemeChange = { currentTheme = it },
                        onComicClick = { comic -> selectedComic = comic }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreenWithNavigation(
    currentScreen: Screen,
    onScreenChange: (Screen) -> Unit,
    currentTheme: AppTheme,
    onThemeChange: (AppTheme) -> Unit,
    onComicClick: (Comic) -> Unit
) {
    Scaffold(
        bottomBar = {
            NavigationBar {
                Screen.values().forEach { screen ->
                    NavigationBarItem(
                        icon = {
                            Icon(
                                imageVector = screen.icon,
                                contentDescription = screen.title
                            )
                        },
                        label = { Text(screen.title) },
                        selected = currentScreen == screen,
                        onClick = { onScreenChange(screen) }
                    )
                }
            }
        }
    ) { paddingValues ->
        when (currentScreen) {
            Screen.LIBRARY -> {
                LibraryScreen(
                    comics = generateSampleComics(),
                    onComicClick = onComicClick,
                    onSearchClick = { /* Открыть поиск */ },
                    modifier = Modifier.padding(paddingValues)
                )
            }
            Screen.READER -> {
                // Заглушка для раздела "Чтение"
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = androidx.compose.ui.Alignment.Center
                ) {
                    Text("Раздел 'Чтение' - выберите комикс из библиотеки")
                }
            }
            Screen.TRANSLATIONS -> {
                // Заглушка для раздела "Переводы"
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = androidx.compose.ui.Alignment.Center
                ) {
                    Text("Раздел 'Переводы' в разработке")
                }
            }
            Screen.SETTINGS -> {
                SettingsScreen(
                    currentTheme = currentTheme,
                    onThemeChange = onThemeChange,
                    onLanguageClick = { /* Открыть выбор языка */ },
                    onAccountClick = { /* Открыть настройки аккаунта */ },
                    onOptimizationClick = { /* Открыть настройки оптимизации */ },
                    modifier = Modifier.padding(paddingValues)
                )
            }
        }
    }
}

enum class Screen(val title: String, val icon: ImageVector) {
    LIBRARY("Домой", Icons.Default.Home),
    READER("Чтение", Icons.Default.Book),
    TRANSLATIONS("Переводы", Icons.Default.Translate),
    SETTINGS("Настройки", Icons.Default.Settings)
}

// Функции для генерации тестовых данных
private fun generateSampleComics(): List<Comic> {
    return listOf(
        Comic(
            id = "1",
            title = "Spider-Man",
            author = "Stan Lee",
            coverUrl = "https://example.com/spiderman.jpg",
            progress = 0.3f,
            totalPages = 24,
            currentPage = 7
        ),
        Comic(
            id = "2",
            title = "Batman: The Dark Knight",
            author = "Frank Miller",
            coverUrl = "https://example.com/batman.jpg",
            progress = 0.8f,
            totalPages = 32,
            currentPage = 25
        ),
        Comic(
            id = "3",
            title = "X-Men",
            author = "Chris Claremont",
            coverUrl = "https://example.com/xmen.jpg",
            progress = 0.0f,
            totalPages = 28,
            currentPage = 0
        ),
        Comic(
            id = "4",
            title = "Wonder Woman",
            author = "George Pérez",
            coverUrl = "https://example.com/wonderwoman.jpg",
            progress = 0.5f,
            totalPages = 20,
            currentPage = 10
        ),
        Comic(
            id = "5",
            title = "The Flash",
            author = "Mark Waid",
            coverUrl = "https://example.com/flash.jpg",
            progress = 0.1f,
            totalPages = 22,
            currentPage = 2
        ),
        Comic(
            id = "6",
            title = "Green Lantern",
            author = "Geoff Johns",
            coverUrl = "https://example.com/greenlantern.jpg",
            progress = 0.0f,
            totalPages = 26,
            currentPage = 0
        )
    )
}

private fun generateSamplePages(): List<String> {
    return (1..24).map { "https://example.com/page$it.jpg" }
}
