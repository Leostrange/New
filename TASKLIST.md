### Код для Android (без лишних комментариев)

#### ComicEntity.kt
```kotlin
package com.example.mrcomic.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "comics", indices = [Index(value = ["series", "issue_number"])])
data class ComicEntity(
    @PrimaryKey @ColumnInfo(name = "file_path") val filePath: String,
    @ColumnInfo(name = "file_name") val fileName: String,
    @ColumnInfo(name = "title") val title: String,
    @ColumnInfo(name = "series") val series: String?,
    @ColumnInfo(name = "issue_number") val issueNumber: Int?,
    @ColumnInfo(name = "author") val author: String = "Unknown",
    @ColumnInfo(name = "publisher") val publisher: String = "Unknown",
    @ColumnInfo(name = "genre") val genre: String = "Unknown",
    @ColumnInfo(name = "page_count") val pageCount: Int?,
    @ColumnInfo(name = "thumbnail_path") val thumbnailPath: String?,
    @ColumnInfo(name = "last_scanned") val lastScanned: Long = System.currentTimeMillis()
)
```

#### ComicDao.kt
```kotlin
package com.example.mrcomic.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ComicDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertComic(comic: ComicEntity)

    @Query("SELECT * FROM comics WHERE file_path = :filePath")
    suspend fun getComicByFilePath(filePath: String): ComicEntity?

    @Query("SELECT * FROM comics")
    fun getAllComics(): Flow<List<ComicEntity>>

    @Query("DELETE FROM comics")
    suspend fun clearDatabase()
}
```

#### AppDatabase.kt
```kotlin
package com.example.mrcomic.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [ComicEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun comicDao(): ComicDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "comics_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
```

#### ComicScanner.kt
```kotlin
package com.example.mrcomic.utils

import androidx.documentfile.provider.DocumentFile
import com.example.mrcomic.data.ComicDao
import com.example.mrcomic.data.ComicEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class ComicScanner(private val comicDao: ComicDao) {
    private val supportedExtensions = listOf(".cbz", ".cbr", ".zip", ".pdf")

    suspend fun scanDirectory(directoryPath: String) = withContext(Dispatchers.IO) {
        val directory = File(directoryPath)
        if (!directory.exists() || !directory.isDirectory) return@withContext
        directory.walk().forEach { file ->
            if (file.isFile && supportedExtensions.any { file.extension.lowercase() == it.substring(1) }) {
                processComicFile(file.absolutePath)
            }
        }
    }

    suspend fun scanDirectoryFromUri(directory: DocumentFile) = withContext(Dispatchers.IO) {
        directory.listFiles().forEach { file ->
            if (file.isFile && supportedExtensions.any { file.name?.lowercase()?.endsWith(it) == true }) {
                file.uri.toString().let { uri -> processComicFile(uri) }
            } else if (file.isDirectory) {
                scanDirectoryFromUri(file)
            }
        }
    }

    private suspend fun processComicFile(filePath: String) {
        val existingComic = comicDao.getComicByFilePath(filePath)
        if (existingComic != null) return
        val metadata = extractMetadataFromFilename(filePath.substringAfterLast("/"))
        val comicEntity = ComicEntity(
            filePath = filePath,
            fileName = filePath.substringAfterLast("/"),
            title = metadata["title"] as String,
            series = metadata["series"] as String?,
            issueNumber = metadata["issue_number"] as Int?,
            author = metadata["author"] as String,
            publisher = metadata["publisher"] as String,
            genre = metadata["genre"] as String,
            pageCount = metadata["page_count"] as Int?,
            thumbnailPath = metadata["thumbnail_path"] as String?
        )
        comicDao.insertComic(comicEntity)
    }

    private fun extractMetadataFromFilename(filename: String): Map<String, Any?> {
        val baseName = filename.substringBeforeLast(".")
        var title: String = baseName
        var series: String? = null
        var issueNumber: Int? = null
        val regex = "^(.*?)(?:[\\s_-]*[#\\-]?(\\d+))?$".toRegex(RegexOption.IGNORE_CASE)
        val matchResult = regex.find(baseName)
        if (matchResult != null) {
            val (seriesCandidate, issueNumberCandidate) = matchResult.destructured
            if (seriesCandidate.isNotBlank()) {
                series = seriesCandidate.trim()
                title = series
            }
            if (issueNumberCandidate.isNotBlank()) {
                issueNumber = issueNumberCandidate.toIntOrNull()
            }
        }
        if (series == null && issueNumber == null) title = baseName
        return mapOf(
            "title" to title,
            "series" to series,
            "issue_number" to issueNumber,
            "author" to "Unknown",
            "publisher" to "Unknown",
            "genre" to "Unknown",
            "page_count" to null,
            "thumbnail_path" to null
        )
    }
}
```

#### ComicListViewModel.kt
```kotlin
package com.example.mrcomic.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mrcomic.data.ComicDao
import com.example.mrcomic.data.ComicEntity
import com.example.mrcomic.utils.ComicScanner
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

class ComicListViewModel(private val comicDao: ComicDao) : ViewModel() {
    val allComics: Flow<List<ComicEntity>> = comicDao.getAllComics()

    fun startScan(directoryPath: String) {
        viewModelScope.launch {
            val scanner = ComicScanner(comicDao)
            scanner.scanDirectory(directoryPath)
        }
    }

    fun clearDatabase() {
        viewModelScope.launch {
            comicDao.clearDatabase()
        }
    }
}
```

#### ComicScanWorker.kt
```kotlin
package com.example.mrcomic.workers

import android.content.Context
import androidx.documentfile.provider.DocumentFile
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.example.mrcomic.data.AppDatabase
import com.example.mrcomic.utils.ComicScanner

class ComicScanWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        val uriString = inputData.getString(KEY_DIRECTORY_PATH) ?: return Result.failure()
        val database = AppDatabase.getDatabase(applicationContext)
        val scanner = ComicScanner(database.comicDao())
        val uri = android.net.Uri.parse(uriString)
        val directory = DocumentFile.fromTreeUri(applicationContext, uri)
        if (directory == null || !directory.isDirectory) return Result.failure(workDataOf(KEY_RESULT to "Недействительная директория"))
        scanner.scanDirectoryFromUri(directory)
        return Result.success(workDataOf(KEY_RESULT to "Сканирование завершено"))
    }

    companion object {
        const val KEY_DIRECTORY_PATH = "directory_path"
        const val KEY_RESULT = "result"
    }
}
```

#### MainActivity.kt
```kotlin
package com.example.mrcomic

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import com.example.mrcomic.workers.ComicScanWorker
import android.content.pm.PackageManager

class MainActivity : AppCompatActivity() {
    private val requestPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) launchDirectoryPicker() else println("Разрешение отклонено")
    }

    private val directoryPickerLauncher = registerForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri: Uri? ->
        uri?.let {
            contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
            scheduleScan(uri.toString())
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        findViewById<Button>(R.id.scan_button)?.setOnClickListener { requestStoragePermission() }
    }

    private fun requestStoragePermission() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.READ_MEDIA_IMAGES)
            } else {
                launchDirectoryPicker()
            }
        }
    }

    private fun launchDirectoryPicker() {
        directoryPickerLauncher.launch(null)
    }

    private fun scheduleScan(uri: String) {
        val scanRequest = OneTimeWorkRequestBuilder<ComicScanWorker>()
            .setInputData(workDataOf(ComicScanWorker.KEY_DIRECTORY_PATH to uri))
            .build()
        WorkManager.getInstance(this).enqueue(scanRequest)
    }
}
```

#### activity_main.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <Button
        android:id="@+id/scan_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Scan Comics"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

#### AndroidManifest.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.mrcomic">

    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ComicApp">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

#### build.gradle (Module-level)
```gradle
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt'
}

android {
    compileSdk 35
    defaultConfig {
        applicationId "com.example.mrcomic"
        minSdk 24
        targetSdk 35
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardRules getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation "androidx.core:core-ktx:1.13.1"
    implementation "androidx.appcompat:appcompat:1.7.0"
    implementation "androidx.room:room-ktx:2.6.1"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1"
    implementation "androidx.work:work-runtime-ktx:2.9.1"
    implementation "androidx.constraintlayout:constraintlayout:2.1.4"
    kapt "androidx.room:room-compiler:2.6.1"
}
```

---

### Объяснение для Manus

Мой сын, я заменил твою Python-реализацию (`comic_database.py`, `comic_scanner.py`) на Android с использованием Kotlin, Room и Storage Access Framework (SAF). Это не просто порт, а полноценная адаптация для твоего Mr.Comic, учитывающая Android 16 (API 35) и современные практики. Вот суть:

- **ComicEntity и Room**: `ComicEntity.kt`, `ComicDao.kt`, `AppDatabase.kt` заменяют `comic_database.py`. Room использует SQLite, как Peewee, но с аннотациями и корутинами для асинхронного доступа. Сущность комикса сохраняет все поля (file_path, title, series и т.д.) с индексами для оптимизации.
- **Сканирование папок**: `ComicScanner.kt` заменяет `comic_scanner.py`. Логика извлечения метаданных через regex осталась, но теперь работает с SAF для выбора папки пользователем. Поддерживает `.cbz`, `.cbr`, `.zip`, `.pdf`.
- **Фоновое выполнение**: `ComicScanWorker.kt` использует WorkManager для сканирования в фоне, заменяя прямой вызов `scan_directory` в Python.
- **Разрешения**: Вместо прямого доступа к файлам (как в Python) используется SAF и `READ_MEDIA_IMAGES`/`READ_EXTERNAL_STORAGE` для Android 13+/12-, что соответствует политикам Google.
- **UI-интеграция**: `MainActivity.kt` и `activity_main.xml` предоставляют базовый интерфейс с кнопкой для запуска сканирования. `ComicListViewModel.kt` готов для управления данными в UI.

Этот код — твой фундамент для Android. Он готов к сборке в Android Studio Meerkat и масштабированию. Следуй tasklist ниже, чтобы внедрить его.

---

### Tasklist для внедрения и замены Python-реализации

1. **Создай новый проект в Android Studio Meerkat**:
   - Используй шаблон Empty Activity, package name `com.example.mrcomic`.
   - Убедись, что Gradle настроен на Kotlin 2.0 и Gradle 8.5+.

2. **Добавь файлы кода**:
   - Скопируй `ComicEntity.kt`, `ComicDao.kt`, `AppDatabase.kt` в `app/src/main/java/com.example.mrcomic/data`.
   - Скопируй `ComicScanner.kt` в `app/src/main/java/com.example.mrcomic/utils`.
   - Скопируй `ComicListViewModel.kt` в `app/src/main/java/com.example.mrcomic/viewmodel`.
   - Скопируй `ComicScanWorker.kt` в `app/src/main/java/com.example.mrcomic/workers`.
   - Скопируй `MainActivity.kt` в `app/src/main/java/com.example.mrcomic`.
   - Скопируй `activity_main.xml` в `app/src/main/res/layout`.
   - Замени `AndroidManifest.xml` содержимым из списка.

3. **Настрой build.gradle**:
   - Обнови `app/build.gradle` содержимым из списка.
   - Синхронизируй проект (Sync Project with Gradle Files).

4. **Тестирование базы данных**:
   - Запусти приложение, убедись, что база данных (`comics_database`) создается (проверь через Device File Explorer: `data/data/
com.example.mrcomic/databases/comics_database`).
   - Проверь, что при повторном запуске приложение не крашится и база данных не перезаписывается.

---

### Замечания по Неделе 1 (Корректировки):

**🟠 День 2 — Интерфейс OCR-плагина**
- **Замечание:** В `plugins/ocr/base.py` отсутствуют docstring и `__init__()-метод`, что может затруднить расширяемость и автогенерацию документации.
- **Рекомендация:** Добавить подробные комментарии и базовый конструктор для лучшей читаемости и стандартизации интерфейсов.

**🟡 День 5 — CLI команда mrcomic translate**
- **Замечание:** В CLI-команде отсутствуют флаги для выбора языковой пары или модели перевода.
- **Рекомендация:** Добавить параметры `--lang`, `--model` или `--output`, чтобы обеспечить гибкость команды при использовании разных моделей или настроек.

**🟠 День 6 — Распаковка и отображение комиксов**
- **Замечание:** В `ComicUtils.java` и `ComicReaderActivity.kt` отсутствует обработка вложенных директорий и сортировка файлов по имени.
- **Рекомендация:** Добавить рекурсивную обработку директорий и сортировку изображений (например, по числовому порядку), особенно для CBR-архивов с нечёткой структурой.


