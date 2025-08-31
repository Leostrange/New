# MrComic Developer Documentation

## Overview

This document provides comprehensive documentation for developers working on the MrComic application. It covers the architecture, components, APIs, and development guidelines.

## Architecture

### Clean Architecture

MrComic follows Clean Architecture principles with a clear separation of concerns:

1. **Presentation Layer**: Jetpack Compose UI components
2. **Domain Layer**: Use cases and business logic
3. **Data Layer**: Repositories and data sources
4. **Core Layer**: Shared utilities and models

### Module Structure

```
android/
├── app/                 # Main application module
├── core-data/           # Data models and repositories
├── core-domain/         # Business logic and use cases
├── core-reader/         # Core reading functionality
├── feature-library/     # Library management feature
├── feature-onboarding/  # Onboarding feature
├── feature-ocr/         # OCR and translation feature
├── feature-plugins/     # Plugin system feature
├── feature-reader/      # Comic reader feature
├── feature-settings/    # Settings feature
└── feature-stats/       # Statistics feature
```

## Core Components

### Dependency Injection

The application uses Hilt for dependency injection. All modules are annotated with `@Module` and provide dependencies through `@Provides` methods.

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object ReaderModule {
    
    @Provides
    @Singleton
    fun provideBookReaderFactory(
        cbrReader: CbrReader,
        cbzReader: CbzReader,
        pdfReaderFactory: PdfReaderFactory
    ): BookReaderFactory = BookReaderFactoryImpl(
        cbrReader, cbzReader, pdfReaderFactory
    )
}
```

### State Management

The application uses Kotlin Flows and StateFlow for reactive state management. ViewModels expose StateFlow properties that UI components collect.

```kotlin
@HiltViewModel
class ReaderViewModel @Inject constructor(
    private val readerFactory: BookReaderFactory,
    // ... other dependencies
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ReaderUiState())
    val uiState = _uiState.asStateFlow()
    
    // ...
}
```

## Feature Modules

### Comic Reader

#### BookReader Interface

The `BookReader` interface provides a unified contract for reading different comic formats:

```kotlin
interface BookReader {
    suspend fun open(uri: Uri): Int
    fun renderPage(pageIndex: Int): Bitmap?
    fun getPageCount(): Int
    fun close()
}
```

#### Supported Formats

1. **CBR** - Comic Book Archive (RAR-based)
2. **CBZ** - Comic Book Archive (ZIP-based)
3. **PDF** - Portable Document Format

#### Performance Optimizations

The reader implements several performance optimizations:

1. **Lazy Loading**: Pages are loaded on-demand
2. **Caching**: Bitmaps are cached for quick access
3. **Memory Management**: Large images are scaled appropriately
4. **Preloading**: Adjacent pages are preloaded for smooth navigation

### OCR and Translation

#### OfflineTranslationService

The `OfflineTranslationService` provides offline translation capabilities using local dictionaries:

```kotlin
@Singleton
class OfflineTranslationService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gson: Gson,
    private val localResourcesRepository: LocalResourcesRepository
) : TranslationService {
    
    override suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String
    ): Result<String> {
        // Translation logic
    }
}
```

#### Supported Languages

1. **English-Russian**
2. **Japanese-Russian**
3. **French-English**
4. **Spanish-English**
5. **German-English**
6. **Portuguese-English**
7. **Korean-English**

### Plugin System

#### Plugin Architecture

The plugin system consists of several key components:

1. **PluginManager** - Manages plugin lifecycle
2. **PluginSandbox** - Provides isolated execution environment
3. **PluginPermissionManager** - Manages plugin permissions
4. **PluginValidator** - Validates plugin packages

#### Plugin Types

1. **JavaScript Plugins** - Primary plugin type
2. **Native Plugins** - Kotlin/Java plugins (in development)
3. **Hybrid Plugins** - Combination of JavaScript and native code

#### Plugin API

Plugins interact with the application through a secure API:

```javascript
window.MrComicPlugin = {
    // Logging
    log(message),
    
    // Permission checking
    hasPermission(permission),
    
    // System commands
    executeSystemCommand(command, params),
    
    // Data access
    getAppData(key),
    setPluginData(key, value),
    getPluginData(key)
};
```

#### Plugin Permissions

1. **READ_FILES** - Read files from device
2. **WRITE_FILES** - Write files to device
3. **NETWORK_ACCESS** - Access internet
4. **CAMERA_ACCESS** - Access camera
5. **STORAGE_ACCESS** - Access storage
6. **SYSTEM_SETTINGS** - Modify system settings
7. **READER_CONTROL** - Control comic reader
8. **UI_MODIFICATION** - Modify UI

### Data Management

#### Room Database

The application uses Room for local data storage:

```kotlin
@Entity(tableName = "comics")
data class ComicEntity(
    @PrimaryKey val filePath: String,
    val title: String,
    val coverPath: String?,
    val dateAdded: Long,
    val currentPage: Int = 0
)
```

#### Repositories

Repositories abstract data sources and provide a clean API for data access:

```kotlin
@Singleton
class ComicRepository @Inject constructor(
    private val comicDao: ComicDao,
    private val dispatchers: CoroutinesDispatcherProvider
) {
    
    fun getComics(): Flow<List<Comic>> = 
        comicDao.getComics().map { entities ->
            entities.map { it.toComic() }
        }.flowOn(dispatchers.io)
}
```

## UI Components

### Jetpack Compose

The application uses Jetpack Compose for building the UI. Components are organized in a modular way:

```kotlin
@Composable
fun ReaderScreen(
    viewModel: ReaderViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    ReaderScreenContent(
        uiState = uiState,
        // ... callbacks
    )
}
```

### Custom Components

1. **ZoomablePannableImage** - Image viewer with zoom and pan capabilities
2. **ComicMiniMapDialog** - Mini-map for navigation
3. **BookmarksNotesDialog** - Bookmarks and notes management
4. **SwipeableZoomablePannableImage** - Enhanced image viewer with swipe navigation

## Testing

### Unit Testing

Unit tests are written using JUnit and MockK:

```kotlin
@ExperimentalCoroutinesApi
class ReaderViewModelTest {
    
    private lateinit var viewModel: ReaderViewModel
    private lateinit var readerFactory: BookReaderFactory
    
    @Before
    fun setup() {
        readerFactory = mockk()
        viewModel = ReaderViewModel(
            readerFactory,
            // ... other dependencies
        )
    }
    
    @Test
    fun `openBook should update uiState`() = runTest {
        // Test implementation
    }
}
```

### UI Testing

UI tests are written using Compose Testing framework:

```kotlin
@RunWith(AndroidJUnit4::class)
class ReaderScreenTest {
    
    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()
    
    @Test
    fun `ReaderScreen should display loading state initially`() {
        composeTestRule.setContent {
            ReaderScreen()
        }
        
        composeTestRule.onNodeWithTag("loadingIndicator")
            .assertIsDisplayed()
    }
}
```

## Development Guidelines

### Code Style

1. **Kotlin Coroutines** - Use structured concurrency
2. **Null Safety** - Prefer non-nullable types
3. **Immutability** - Use immutable data classes
4. **Sealed Classes** - Use for representing state

### Error Handling

1. **Result Wrapper** - Use Result for operations that can fail
2. **Exception Handling** - Handle exceptions at appropriate levels
3. **User Feedback** - Provide clear error messages to users

### Performance

1. **Memory Management** - Properly release resources
2. **Threading** - Use appropriate dispatchers for operations
3. **Caching** - Implement caching for expensive operations
4. **Lazy Loading** - Load data on-demand

## APIs

### Internal APIs

1. **ComicRepository** - Comic data management
2. **BookmarkRepository** - Bookmark data management
3. **NoteRepository** - Note data management
4. **SettingsRepository** - Settings management

### External APIs

1. **Google MLKit** - Text recognition
2. **Google Translate API** - Online translation
3. **Pdfium** - PDF rendering
4. **ComicRack** - CBR/CBZ format support

## Building and Deployment

### Build Variants

1. **Debug** - Development build with logging
2. **Release** - Production build with optimizations

### Signing

Release builds are signed with a production key:

```kotlin
signingConfigs {
    release {
        storeFile file("keystore.jks")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

### ProGuard Rules

Release builds use ProGuard for code obfuscation:

```proguard
# Keep data classes
-keep class com.example.core.model.** { *; }

# Keep Hilt generated classes
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
```

## Troubleshooting

### Common Issues

1. **OutOfMemoryError** - Check image loading and caching
2. **Plugin Loading Failures** - Validate plugin packages
3. **Translation Failures** - Check dictionary files
4. **Database Issues** - Verify Room migrations

### Debugging

1. **Logging** - Use Android Log with appropriate tags
2. **Debug Builds** - Use debug builds for development
3. **LeakCanary** - Detect memory leaks
4. **Stetho** - Debug database and network requests

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Write tests
5. Submit pull request

### Code Review

All pull requests require code review from maintainers. Reviewers check for:

1. **Correctness** - Code works as intended
2. **Performance** - Efficient implementation
3. **Security** - No security vulnerabilities
4. **Style** - Follows coding standards

## Versioning

The application follows Semantic Versioning (SemVer):

1. **Major** - Breaking changes
2. **Minor** - New features
3. **Patch** - Bug fixes

## Support

For development questions and issues, contact the development team or check the project documentation.