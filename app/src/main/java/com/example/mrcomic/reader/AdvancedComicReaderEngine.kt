package com.example.mrcomic.reader

import android.content.Context
import android.graphics.*
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.pager.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.io.File
import kotlin.math.*

/**
 * Продвинутый движок для чтения комиксов
 * Поддерживает множество режимов чтения, жестов и оптимизаций
 */
object AdvancedComicReaderEngine {
    
    data class ReaderState(
        val currentPage: Int = 0,
        val totalPages: Int = 0,
        val readingMode: ReadingMode = ReadingMode.SINGLE_PAGE,
        val zoomLevel: Float = 1f,
        val panOffset: Offset = Offset.Zero,
        val isFullscreen: Boolean = false,
        val showUI: Boolean = true,
        val brightness: Float = 1f,
        val colorFilter: ColorFilter? = null,
        val isLoading: Boolean = false,
        val error: String? = null,
        val bookmarks: Set<Int> = emptySet(),
        val readingProgress: Float = 0f,
        val readingTime: Long = 0L,
        val lastReadPosition: Int = 0,
        val isNightMode: Boolean = false,
        val isEInkMode: Boolean = false,
        val autoScrollSpeed: Float = 0f,
        val isAutoScrolling: Boolean = false
    )
    
    enum class ReadingMode {
        SINGLE_PAGE,        // Одна страница
        DOUBLE_PAGE,        // Две страницы (разворот)
        VERTICAL_SCROLL,    // Вертикальная прокрутка
        HORIZONTAL_SCROLL,  // Горизонтальная прокрутка
        WEBTOON,           // Режим веб-тунов
        MANGA_RIGHT_TO_LEFT, // Манга справа налево
        MANGA_LEFT_TO_RIGHT, // Манга слева направо
        CONTINUOUS_VERTICAL, // Непрерывная вертикальная прокрутка
        CONTINUOUS_HORIZONTAL, // Непрерывная горизонтальная прокрутка
        SMART_FIT          // Умное масштабирование
    }
    
    enum class PageTransition {
        NONE,
        SLIDE_HORIZONTAL,
        SLIDE_VERTICAL,
        FADE,
        ZOOM,
        FLIP_3D,
        CURL,
        DISSOLVE,
        PUSH,
        COVER,
        REVEAL
    }
    
    enum class ZoomMode {
        FIT_WIDTH,
        FIT_HEIGHT,
        FIT_SCREEN,
        ORIGINAL_SIZE,
        CUSTOM,
        SMART_FIT
    }
    
    data class GestureConfig(
        val tapToTurn: Boolean = true,
        val swipeToTurn: Boolean = true,
        val pinchToZoom: Boolean = true,
        val doubleTapToZoom: Boolean = true,
        val longPressActions: Boolean = true,
        val volumeKeysNavigation: Boolean = true,
        val edgeSwipeNavigation: Boolean = true,
        val gestureThreshold: Float = 0.3f,
        val swipeVelocityThreshold: Float = 1000f
    )
    
    data class DisplayConfig(
        val keepScreenOn: Boolean = true,
        val hideSystemUI: Boolean = false,
        val immersiveMode: Boolean = false,
        val orientationLock: Boolean = false,
        val statusBarColor: Color = Color.Transparent,
        val navigationBarColor: Color = Color.Transparent,
        val cutoutMode: Int = 0 // Для устройств с вырезами
    )
    
    data class PerformanceConfig(
        val preloadPages: Int = 3,
        val cacheSize: Int = 50,
        val imageQuality: Float = 0.9f,
        val enableHardwareAcceleration: Boolean = true,
        val enableMemoryOptimization: Boolean = true,
        val maxTextureSize: Int = 4096,
        val enableLowMemoryMode: Boolean = false
    )
    
    data class AccessibilityConfig(
        val enableTalkBack: Boolean = false,
        val highContrastMode: Boolean = false,
        val largeTextMode: Boolean = false,
        val colorBlindnessSupport: Boolean = false,
        val motionReduction: Boolean = false,
        val hapticFeedback: Boolean = true,
        val audioDescriptions: Boolean = false
    )
    
    private val _readerState = MutableStateFlow(ReaderState())
    val readerState: StateFlow<ReaderState> = _readerState.asStateFlow()
    
    private val pageCache = mutableMapOf<Int, Bitmap>()
    private val preloadScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    /**
     * Инициализация ридера с комиксом
     */
    suspend fun initializeReader(
        comicFile: File,
        context: Context,
        startPage: Int = 0
    ): Boolean = withContext(Dispatchers.IO) {
        
        try {
            _readerState.value = _readerState.value.copy(isLoading = true, error = null)
            
            // Извлекаем страницы комикса
            val extractionResult = com.example.mrcomic.data.FormatHandler.extractContent(
                comicFile, 
                File(context.cacheDir, "reader_cache"), 
                context
            )
            
            if (extractionResult.pages.isEmpty()) {
                _readerState.value = _readerState.value.copy(
                    isLoading = false,
                    error = "Не удалось загрузить страницы комикса"
                )
                return@withContext false
            }
            
            // Обновляем состояние
            _readerState.value = _readerState.value.copy(
                currentPage = startPage.coerceIn(0, extractionResult.pages.size - 1),
                totalPages = extractionResult.pages.size,
                isLoading = false,
                readingProgress = if (extractionResult.pages.isNotEmpty()) {
                    startPage.toFloat() / extractionResult.pages.size
                } else 0f
            )
            
            // Предварительно загружаем страницы
            preloadPages(extractionResult.pages, startPage, context)
            
            true
            
        } catch (e: Exception) {
            _readerState.value = _readerState.value.copy(
                isLoading = false,
                error = "Ошибка инициализации ридера: ${e.message}"
            )
            false
        }
    }
    
    /**
     * Переход к следующей странице
     */
    fun nextPage() {
        val currentState = _readerState.value
        if (currentState.currentPage < currentState.totalPages - 1) {
            val newPage = currentState.currentPage + 1
            _readerState.value = currentState.copy(
                currentPage = newPage,
                readingProgress = newPage.toFloat() / currentState.totalPages,
                lastReadPosition = newPage
            )
        }
    }
    
    /**
     * Переход к предыдущей странице
     */
    fun previousPage() {
        val currentState = _readerState.value
        if (currentState.currentPage > 0) {
            val newPage = currentState.currentPage - 1
            _readerState.value = currentState.copy(
                currentPage = newPage,
                readingProgress = newPage.toFloat() / currentState.totalPages,
                lastReadPosition = newPage
            )
        }
    }
    
    /**
     * Переход к конкретной странице
     */
    fun goToPage(page: Int) {
        val currentState = _readerState.value
        val targetPage = page.coerceIn(0, currentState.totalPages - 1)
        _readerState.value = currentState.copy(
            currentPage = targetPage,
            readingProgress = targetPage.toFloat() / currentState.totalPages,
            lastReadPosition = targetPage
        )
    }
    
    /**
     * Изменение режима чтения
     */
    fun setReadingMode(mode: ReadingMode) {
        _readerState.value = _readerState.value.copy(readingMode = mode)
    }
    
    /**
     * Управление масштабированием
     */
    fun setZoom(level: Float, center: Offset = Offset.Zero) {
        val clampedZoom = level.coerceIn(0.1f, 10f)
        _readerState.value = _readerState.value.copy(
            zoomLevel = clampedZoom,
            panOffset = if (clampedZoom == 1f) Offset.Zero else _readerState.value.panOffset
        )
    }
    
    /**
     * Управление панорамированием
     */
    fun setPan(offset: Offset) {
        _readerState.value = _readerState.value.copy(panOffset = offset)
    }
    
    /**
     * Переключение полноэкранного режима
     */
    fun toggleFullscreen() {
        _readerState.value = _readerState.value.copy(
            isFullscreen = !_readerState.value.isFullscreen,
            showUI = _readerState.value.isFullscreen // Показываем UI при выходе из полноэкранного режима
        )
    }
    
    /**
     * Переключение видимости UI
     */
    fun toggleUI() {
        _readerState.value = _readerState.value.copy(showUI = !_readerState.value.showUI)
    }
    
    /**
     * Управление яркостью
     */
    fun setBrightness(brightness: Float) {
        val clampedBrightness = brightness.coerceIn(0.1f, 1f)
        _readerState.value = _readerState.value.copy(brightness = clampedBrightness)
    }
    
    /**
     * Применение цветового фильтра
     */
    fun setColorFilter(filter: ColorFilter?) {
        _readerState.value = _readerState.value.copy(colorFilter = filter)
    }
    
    /**
     * Переключение ночного режима
     */
    fun toggleNightMode() {
        val isNight = !_readerState.value.isNightMode
        _readerState.value = _readerState.value.copy(
            isNightMode = isNight,
            colorFilter = if (isNight) {
                ColorFilter.colorMatrix(
                    ColorMatrix().apply {
                        // Инвертируем цвета и снижаем яркость
                        setToSaturation(0.8f)
                        val nightMatrix = floatArrayOf(
                            -0.9f, 0f, 0f, 0f, 255f,
                            0f, -0.9f, 0f, 0f, 255f,
                            0f, 0f, -0.9f, 0f, 255f,
                            0f, 0f, 0f, 1f, 0f
                        )
                        set(nightMatrix)
                    }
                )
            } else null
        )
    }
    
    /**
     * Переключение E-Ink режима
     */
    fun toggleEInkMode() {
        val isEInk = !_readerState.value.isEInkMode
        _readerState.value = _readerState.value.copy(
            isEInkMode = isEInk,
            colorFilter = if (isEInk) {
                ColorFilter.colorMatrix(
                    ColorMatrix().apply {
                        setToSaturation(0f) // Черно-белый
                        // Увеличиваем контраст
                        val contrastMatrix = floatArrayOf(
                            2f, 0f, 0f, 0f, -128f,
                            0f, 2f, 0f, 0f, -128f,
                            0f, 0f, 2f, 0f, -128f,
                            0f, 0f, 0f, 1f, 0f
                        )
                        set(contrastMatrix)
                    }
                )
            } else null
        )
    }
    
    /**
     * Управление закладками
     */
    fun toggleBookmark(page: Int = _readerState.value.currentPage) {
        val currentBookmarks = _readerState.value.bookmarks.toMutableSet()
        if (currentBookmarks.contains(page)) {
            currentBookmarks.remove(page)
        } else {
            currentBookmarks.add(page)
        }
        _readerState.value = _readerState.value.copy(bookmarks = currentBookmarks)
    }
    
    /**
     * Автоматическая прокрутка
     */
    fun startAutoScroll(speed: Float) {
        _readerState.value = _readerState.value.copy(
            autoScrollSpeed = speed,
            isAutoScrolling = true
        )
        
        // Запускаем корутину для автоматической прокрутки
        preloadScope.launch {
            while (_readerState.value.isAutoScrolling) {
                delay((1000 / speed).toLong())
                if (_readerState.value.readingMode == ReadingMode.VERTICAL_SCROLL ||
                    _readerState.value.readingMode == ReadingMode.CONTINUOUS_VERTICAL) {
                    // Прокручиваем вертикально
                    val currentOffset = _readerState.value.panOffset
                    setPan(currentOffset.copy(y = currentOffset.y - 10f))
                } else {
                    // Переходим к следующей странице
                    nextPage()
                }
            }
        }
    }
    
    /**
     * Остановка автоматической прокрутки
     */
    fun stopAutoScroll() {
        _readerState.value = _readerState.value.copy(
            isAutoScrolling = false,
            autoScrollSpeed = 0f
        )
    }
    
    /**
     * Предварительная загрузка страниц
     */
    private suspend fun preloadPages(
        pages: List<File>,
        currentPage: Int,
        context: Context,
        preloadCount: Int = 3
    ) = withContext(Dispatchers.IO) {
        
        val startIndex = (currentPage - preloadCount).coerceAtLeast(0)
        val endIndex = (currentPage + preloadCount).coerceAtMost(pages.size - 1)
        
        for (i in startIndex..endIndex) {
            if (!pageCache.containsKey(i)) {
                try {
                    val bitmap = BitmapFactory.decodeFile(pages[i].absolutePath)
                    if (bitmap != null) {
                        pageCache[i] = bitmap
                    }
                } catch (e: Exception) {
                    // Игнорируем ошибки загрузки отдельных страниц
                }
            }
        }
        
        // Очищаем старые страницы из кэша
        val keysToRemove = pageCache.keys.filter { 
            it < startIndex - preloadCount || it > endIndex + preloadCount 
        }
        keysToRemove.forEach { pageCache.remove(it) }
    }
    
    /**
     * Получение Bitmap страницы из кэша
     */
    fun getPageBitmap(page: Int): Bitmap? = pageCache[page]
    
    /**
     * Сброс состояния ридера
     */
    fun reset() {
        _readerState.value = ReaderState()
        pageCache.clear()
        preloadScope.coroutineContext.cancelChildren()
    }
    
    /**
     * Обновление времени чтения
     */
    fun updateReadingTime(additionalTime: Long) {
        _readerState.value = _readerState.value.copy(
            readingTime = _readerState.value.readingTime + additionalTime
        )
    }
    
    /**
     * Получение статистики чтения
     */
    fun getReadingStats(): Map<String, Any> {
        val state = _readerState.value
        return mapOf(
            "currentPage" to state.currentPage,
            "totalPages" to state.totalPages,
            "progress" to state.readingProgress,
            "readingTime" to state.readingTime,
            "bookmarksCount" to state.bookmarks.size,
            "readingMode" to state.readingMode.name,
            "zoomLevel" to state.zoomLevel
        )
    }
}

/**
 * Продвинутый компонент ридера комиксов
 */
@OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3Api::class)
@Composable
fun AdvancedComicReader(
    comicFile: File,
    modifier: Modifier = Modifier,
    gestureConfig: AdvancedComicReaderEngine.GestureConfig = AdvancedComicReaderEngine.GestureConfig(),
    displayConfig: AdvancedComicReaderEngine.DisplayConfig = AdvancedComicReaderEngine.DisplayConfig(),
    performanceConfig: AdvancedComicReaderEngine.PerformanceConfig = AdvancedComicReaderEngine.PerformanceConfig(),
    accessibilityConfig: AdvancedComicReaderEngine.AccessibilityConfig = AdvancedComicReaderEngine.AccessibilityConfig(),
    onPageChange: (Int) -> Unit = {},
    onExit: () -> Unit = {}
) {
    val context = LocalContext.current
    val density = LocalDensity.current
    val configuration = LocalConfiguration.current
    
    val readerState by AdvancedComicReaderEngine.readerState.collectAsState()
    
    var showSettings by remember { mutableStateOf(false) }
    var showBookmarks by remember { mutableStateOf(false) }
    var showPageSelector by remember { mutableStateOf(false) }
    
    // Инициализация ридера
    LaunchedEffect(comicFile) {
        AdvancedComicReaderEngine.initializeReader(comicFile, context)
    }
    
    // Обработка изменения страницы
    LaunchedEffect(readerState.currentPage) {
        onPageChange(readerState.currentPage)
    }
    
    // Основной контейнер
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
            .systemBarsPadding()
    ) {
        
        // Основная область чтения
        ReaderContent(
            readerState = readerState,
            gestureConfig = gestureConfig,
            performanceConfig = performanceConfig,
            modifier = Modifier.fillMaxSize()
        )
        
        // UI элементы (показываются только если showUI = true)
        AnimatedVisibility(
            visible = readerState.showUI,
            enter = fadeIn(animationSpec = tween(300)),
            exit = fadeOut(animationSpec = tween(300))
        ) {
            ReaderUI(
                readerState = readerState,
                onSettingsClick = { showSettings = true },
                onBookmarksClick = { showBookmarks = true },
                onPageSelectorClick = { showPageSelector = true },
                onExitClick = onExit,
                modifier = Modifier.fillMaxSize()
            )
        }
        
        // Диалоги
        if (showSettings) {
            ReaderSettingsDialog(
                onDismiss = { showSettings = false }
            )
        }
        
        if (showBookmarks) {
            BookmarksDialog(
                bookmarks = readerState.bookmarks.toList(),
                onPageSelected = { page ->
                    AdvancedComicReaderEngine.goToPage(page)
                    showBookmarks = false
                },
                onDismiss = { showBookmarks = false }
            )
        }
        
        if (showPageSelector) {
            PageSelectorDialog(
                currentPage = readerState.currentPage,
                totalPages = readerState.totalPages,
                onPageSelected = { page ->
                    AdvancedComicReaderEngine.goToPage(page)
                    showPageSelector = false
                },
                onDismiss = { showPageSelector = false }
            )
        }
        
        // Индикатор загрузки
        if (readerState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.7f)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.primary,
                        strokeWidth = 4.dp
                    )
                    Text(
                        text = "Загрузка комикса...",
                        color = Color.White,
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
        }
        
        // Сообщение об ошибке
        readerState.error?.let { error ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.9f)),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier
                        .padding(32.dp)
                        .fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Error,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(48.dp)
                        )
                        Text(
                            text = "Ошибка",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Text(
                            text = error,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        Button(
                            onClick = onExit,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Text("Закрыть")
                        }
                    }
                }
            }
        }
    }
}

/**
 * Основной контент ридера
 */
@Composable
private fun ReaderContent(
    readerState: AdvancedComicReaderEngine.ReaderState,
    gestureConfig: AdvancedComicReaderEngine.GestureConfig,
    performanceConfig: AdvancedComicReaderEngine.PerformanceConfig,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    
    Box(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures(
                    onTap = { offset ->
                        if (gestureConfig.tapToTurn) {
                            val screenWidth = size.width
                            when {
                                offset.x < screenWidth * 0.3f -> {
                                    // Левая треть экрана - предыдущая страница
                                    AdvancedComicReaderEngine.previousPage()
                                }
                                offset.x > screenWidth * 0.7f -> {
                                    // Правая треть экрана - следующая страница
                                    AdvancedComicReaderEngine.nextPage()
                                }
                                else -> {
                                    // Центр экрана - переключение UI
                                    AdvancedComicReaderEngine.toggleUI()
                                }
                            }
                        }
                    },
                    onDoubleTap = { offset ->
                        if (gestureConfig.doubleTapToZoom) {
                            val newZoom = if (readerState.zoomLevel > 1f) 1f else 2f
                            AdvancedComicReaderEngine.setZoom(newZoom, offset)
                        }
                    },
                    onLongPress = { offset ->
                        if (gestureConfig.longPressActions) {
                            // Добавляем закладку на текущую страницу
                            AdvancedComicReaderEngine.toggleBookmark()
                        }
                    }
                )
            }
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, zoom, _ ->
                    if (gestureConfig.pinchToZoom && zoom != 1f) {
                        val newZoom = (readerState.zoomLevel * zoom).coerceIn(0.1f, 10f)
                        AdvancedComicReaderEngine.setZoom(newZoom)
                    }
                    
                    if (readerState.zoomLevel > 1f) {
                        val newOffset = readerState.panOffset + pan
                        AdvancedComicReaderEngine.setPan(newOffset)
                    }
                }
            }
            .pointerInput(Unit) {
                detectHorizontalDragGestures(
                    onDragEnd = {
                        // Обработка свайпов для перехода между страницами
                        if (gestureConfig.swipeToTurn) {
                            // Логика свайпа будет добавлена здесь
                        }
                    }
                ) { _, _ -> }
            }
    ) {
        
        // Отображение страницы в зависимости от режима чтения
        when (readerState.readingMode) {
            AdvancedComicReaderEngine.ReadingMode.SINGLE_PAGE -> {
                SinglePageView(
                    readerState = readerState,
                    modifier = Modifier.fillMaxSize()
                )
            }
            AdvancedComicReaderEngine.ReadingMode.DOUBLE_PAGE -> {
                DoublePageView(
                    readerState = readerState,
                    modifier = Modifier.fillMaxSize()
                )
            }
            AdvancedComicReaderEngine.ReadingMode.VERTICAL_SCROLL -> {
                VerticalScrollView(
                    readerState = readerState,
                    modifier = Modifier.fillMaxSize()
                )
            }
            AdvancedComicReaderEngine.ReadingMode.WEBTOON -> {
                WebtoonView(
                    readerState = readerState,
                    modifier = Modifier.fillMaxSize()
                )
            }
            else -> {
                SinglePageView(
                    readerState = readerState,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}

/**
 * Просмотр одной страницы
 */
@Composable
private fun SinglePageView(
    readerState: AdvancedComicReaderEngine.ReaderState,
    modifier: Modifier = Modifier
) {
    val bitmap = AdvancedComicReaderEngine.getPageBitmap(readerState.currentPage)
    
    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        if (bitmap != null) {
            Image(
                bitmap = bitmap.asImageBitmap(),
                contentDescription = "Страница ${readerState.currentPage + 1}",
                modifier = Modifier
                    .fillMaxSize()
                    .scale(readerState.zoomLevel)
                    .offset {
                        IntOffset(
                            readerState.panOffset.x.roundToInt(),
                            readerState.panOffset.y.roundToInt()
                        )
                    }
                    .let { mod ->
                        readerState.colorFilter?.let { filter ->
                            mod.drawWithContent {
                                drawIntoCanvas { canvas ->
                                    val paint = Paint().apply {
                                        colorFilter = filter
                                    }
                                    canvas.saveLayer(
                                        Rect(Offset.Zero, size),
                                        paint
                                    )
                                    drawContent()
                                    canvas.restore()
                                }
                            }
                        } ?: mod
                    },
                contentScale = ContentScale.Fit
            )
        } else {
            // Заглушка для загрузки
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Gray.copy(alpha = 0.3f)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

/**
 * Просмотр двух страниц (разворот)
 */
@Composable
private fun DoublePageView(
    readerState: AdvancedComicReaderEngine.ReaderState,
    modifier: Modifier = Modifier
) {
    val leftBitmap = AdvancedComicReaderEngine.getPageBitmap(readerState.currentPage)
    val rightBitmap = if (readerState.currentPage + 1 < readerState.totalPages) {
        AdvancedComicReaderEngine.getPageBitmap(readerState.currentPage + 1)
    } else null
    
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Левая страница
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight(),
            contentAlignment = Alignment.Center
        ) {
            if (leftBitmap != null) {
                Image(
                    bitmap = leftBitmap.asImageBitmap(),
                    contentDescription = "Страница ${readerState.currentPage + 1}",
                    modifier = Modifier
                        .fillMaxSize()
                        .scale(readerState.zoomLevel),
                    contentScale = ContentScale.Fit
                )
            }
        }
        
        // Разделитель
        Spacer(modifier = Modifier.width(2.dp))
        
        // Правая страница
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight(),
            contentAlignment = Alignment.Center
        ) {
            if (rightBitmap != null) {
                Image(
                    bitmap = rightBitmap.asImageBitmap(),
                    contentDescription = "Страница ${readerState.currentPage + 2}",
                    modifier = Modifier
                        .fillMaxSize()
                        .scale(readerState.zoomLevel),
                    contentScale = ContentScale.Fit
                )
            }
        }
    }
}

/**
 * Вертикальная прокрутка
 */
@Composable
private fun VerticalScrollView(
    readerState: AdvancedComicReaderEngine.ReaderState,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(16.dp)
    ) {
        items(readerState.totalPages) { pageIndex ->
            val bitmap = AdvancedComicReaderEngine.getPageBitmap(pageIndex)
            
            if (bitmap != null) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = "Страница ${pageIndex + 1}",
                    modifier = Modifier
                        .fillMaxWidth()
                        .wrapContentHeight(),
                    contentScale = ContentScale.FitWidth
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(400.dp)
                        .background(Color.Gray.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
        }
    }
}

/**
 * Режим веб-тунов
 */
@Composable
private fun WebtoonView(
    readerState: AdvancedComicReaderEngine.ReaderState,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(0.dp)
    ) {
        items(readerState.totalPages) { pageIndex ->
            val bitmap = AdvancedComicReaderEngine.getPageBitmap(pageIndex)
            
            if (bitmap != null) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = "Страница ${pageIndex + 1}",
                    modifier = Modifier
                        .fillMaxWidth()
                        .wrapContentHeight(),
                    contentScale = ContentScale.FitWidth
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(600.dp)
                        .background(Color.Gray.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
        }
    }
}

/**
 * UI элементы ридера
 */
@Composable
private fun ReaderUI(
    readerState: AdvancedComicReaderEngine.ReaderState,
    onSettingsClick: () -> Unit,
    onBookmarksClick: () -> Unit,
    onPageSelectorClick: () -> Unit,
    onExitClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier) {
        
        // Верхняя панель
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .align(Alignment.TopCenter),
            colors = CardDefaults.cardColors(
                containerColor = Color.Black.copy(alpha = 0.7f)
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onExitClick) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Назад",
                        tint = Color.White
                    )
                }
                
                Text(
                    text = "${readerState.currentPage + 1} / ${readerState.totalPages}",
                    color = Color.White,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Row {
                    IconButton(onClick = onBookmarksClick) {
                        Icon(
                            imageVector = Icons.Default.Bookmark,
                            contentDescription = "Закладки",
                            tint = if (readerState.bookmarks.contains(readerState.currentPage)) {
                                Color.Yellow
                            } else {
                                Color.White
                            }
                        )
                    }
                    
                    IconButton(onClick = onSettingsClick) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Настройки",
                            tint = Color.White
                        )
                    }
                }
            }
        }
        
        // Нижняя панель с прогрессом
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .align(Alignment.BottomCenter),
            colors = CardDefaults.cardColors(
                containerColor = Color.Black.copy(alpha = 0.7f)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Прогресс-бар
                LinearProgressIndicator(
                    progress = readerState.readingProgress,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp)),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = Color.Gray.copy(alpha = 0.3f)
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Кнопки навигации
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    IconButton(
                        onClick = { AdvancedComicReaderEngine.previousPage() },
                        enabled = readerState.currentPage > 0
                    ) {
                        Icon(
                            imageVector = Icons.Default.SkipPrevious,
                            contentDescription = "Предыдущая страница",
                            tint = Color.White
                        )
                    }
                    
                    IconButton(onClick = onPageSelectorClick) {
                        Icon(
                            imageVector = Icons.Default.GridView,
                            contentDescription = "Выбор страницы",
                            tint = Color.White
                        )
                    }
                    
                    IconButton(
                        onClick = { AdvancedComicReaderEngine.nextPage() },
                        enabled = readerState.currentPage < readerState.totalPages - 1
                    ) {
                        Icon(
                            imageVector = Icons.Default.SkipNext,
                            contentDescription = "Следующая страница",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    }
}

/**
 * Диалог настроек ридера
 */
@Composable
private fun ReaderSettingsDialog(
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .fillMaxHeight(0.8f),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp)
            ) {
                Text(
                    text = "Настройки ридера",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text(
                            text = "Режим чтения",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium
                        )
                        
                        // Селектор режима чтения
                        val readingModes = AdvancedComicReaderEngine.ReadingMode.values()
                        readingModes.forEach { mode ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        AdvancedComicReaderEngine.setReadingMode(mode)
                                    }
                                    .padding(vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = false, // TODO: получить текущий режим
                                    onClick = {
                                        AdvancedComicReaderEngine.setReadingMode(mode)
                                    }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = mode.name.replace("_", " "),
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }
                    }
                    
                    item {
                        Text(
                            text = "Яркость",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium
                        )
                        
                        Slider(
                            value = 0.5f, // TODO: получить текущую яркость
                            onValueChange = { AdvancedComicReaderEngine.setBrightness(it) },
                            valueRange = 0.1f..1f,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            Button(
                                onClick = { AdvancedComicReaderEngine.toggleNightMode() }
                            ) {
                                Text("Ночной режим")
                            }
                            
                            Button(
                                onClick = { AdvancedComicReaderEngine.toggleEInkMode() }
                            ) {
                                Text("E-Ink режим")
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Закрыть")
                }
            }
        }
    }
}

/**
 * Диалог закладок
 */
@Composable
private fun BookmarksDialog(
    bookmarks: List<Int>,
    onPageSelected: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .fillMaxHeight(0.6f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp)
            ) {
                Text(
                    text = "Закладки",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                if (bookmarks.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Нет закладок",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(bookmarks.sorted()) { page ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onPageSelected(page) },
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                                )
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Bookmark,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = "Страница ${page + 1}",
                                        style = MaterialTheme.typography.bodyLarge
                                    )
                                }
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Закрыть")
                }
            }
        }
    }
}

/**
 * Диалог выбора страницы
 */
@Composable
private fun PageSelectorDialog(
    currentPage: Int,
    totalPages: Int,
    onPageSelected: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    var selectedPage by remember { mutableStateOf(currentPage) }
    
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .wrapContentHeight()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Text(
                    text = "Перейти к странице",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Text(
                    text = "Страница ${selectedPage + 1} из $totalPages",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Slider(
                    value = selectedPage.toFloat(),
                    onValueChange = { selectedPage = it.toInt() },
                    valueRange = 0f..(totalPages - 1).toFloat(),
                    steps = totalPages - 2,
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Отмена")
                    }
                    
                    Button(
                        onClick = { onPageSelected(selectedPage) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Перейти")
                    }
                }
            }
        }
    }
}

