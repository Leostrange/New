package com.example.mrcomic.personalization

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import java.util.*
import kotlin.math.*

/**
 * Система персонализации и адаптации для Mr.Comic
 * Изучает поведение пользователя и автоматически адаптирует интерфейс
 */

val Context.personalizationDataStore: DataStore<Preferences> by preferencesDataStore(name = "personalization_data")

/**
 * Данные персонализации
 */
@Serializable
data class PersonalizationData(
    val userId: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val lastUpdatedAt: Long = System.currentTimeMillis(),
    
    // Поведенческие данные
    val behaviorData: BehaviorData = BehaviorData(),
    
    // Предпочтения интерфейса
    val interfacePreferences: InterfacePreferences = InterfacePreferences(),
    
    // Контекстные данные
    val contextualData: ContextualData = ContextualData(),
    
    // Адаптивные настройки
    val adaptiveSettings: AdaptiveSettings = AdaptiveSettings(),
    
    // Машинное обучение
    val mlData: MachineLearningData = MachineLearningData(),
    
    // Настройки персонализации
    val personalizationSettings: PersonalizationSettings = PersonalizationSettings()
)

/**
 * Поведенческие данные пользователя
 */
@Serializable
data class BehaviorData(
    // Паттерны чтения
    val readingPatterns: ReadingPatterns = ReadingPatterns(),
    
    // Взаимодействие с интерфейсом
    val uiInteractions: UIInteractions = UIInteractions(),
    
    // Временные паттерны
    val timePatterns: TimePatterns = TimePatterns(),
    
    // Навигационные паттерны
    val navigationPatterns: NavigationPatterns = NavigationPatterns(),
    
    // Предпочтения контента
    val contentPreferences: ContentPreferences = ContentPreferences()
)

/**
 * Паттерны чтения
 */
@Serializable
data class ReadingPatterns(
    val averageReadingSpeed: Float = 0f, // страниц в минуту
    val preferredReadingTime: List<Int> = emptyList(), // часы дня
    val averageSessionDuration: Long = 0L, // миллисекунды
    val preferredPageTransitions: Map<String, Int> = emptyMap(),
    val zoomLevels: List<Float> = emptyList(),
    val scrollSpeeds: List<Float> = emptyList(),
    val pauseFrequency: Float = 0f, // пауз на страницу
    val backtrackFrequency: Float = 0f, // возвратов на предыдущие страницы
    val bookmarkUsage: Float = 0f, // частота использования закладок
    val annotationUsage: Float = 0f, // частота создания аннотаций
    val favoriteGenres: Map<String, Float> = emptyMap(), // жанр -> вес
    val readingModePreferences: Map<String, Int> = emptyMap() // режим -> количество использований
)

/**
 * Взаимодействие с интерфейсом
 */
@Serializable
data class UIInteractions(
    val tapPatterns: Map<String, Int> = emptyMap(), // зона экрана -> количество тапов
    val swipePatterns: Map<String, Int> = emptyMap(), // направление -> количество свайпов
    val gesturePreferences: Map<String, Int> = emptyMap(), // жест -> частота использования
    val menuUsage: Map<String, Int> = emptyMap(), // пункт меню -> частота использования
    val searchQueries: List<String> = emptyList(),
    val errorEncounters: Map<String, Int> = emptyMap(), // тип ошибки -> количество
    val helpSectionVisits: Map<String, Int> = emptyMap(),
    val settingsChanges: Map<String, Int> = emptyMap(), // настройка -> количество изменений
    val themeChanges: List<Long> = emptyList(), // временные метки смены тем
    val languageChanges: List<String> = emptyList() // история смены языков
)

/**
 * Временные паттерны
 */
@Serializable
data class TimePatterns(
    val dailyUsage: Map<Int, Long> = emptyMap(), // час -> время использования
    val weeklyUsage: Map<Int, Long> = emptyMap(), // день недели -> время использования
    val monthlyUsage: Map<Int, Long> = emptyMap(), // день месяца -> время использования
    val seasonalUsage: Map<String, Long> = emptyMap(), // сезон -> время использования
    val peakUsageHours: List<Int> = emptyList(),
    val averageSessionsPerDay: Float = 0f,
    val longestSession: Long = 0L,
    val shortestSession: Long = 0L,
    val weekendVsWeekdayRatio: Float = 0f,
    val nightModeUsage: Map<Int, Boolean> = emptyMap() // час -> использование ночного режима
)

/**
 * Навигационные паттерны
 */
@Serializable
data class NavigationPatterns(
    val screenTransitions: Map<String, Map<String, Int>> = emptyMap(), // from -> to -> count
    val backButtonUsage: Int = 0,
    val homeButtonUsage: Int = 0,
    val searchUsage: Int = 0,
    val libraryBrowsingPatterns: Map<String, Int> = emptyMap(), // тип сортировки -> использование
    val deepLinkUsage: Map<String, Int> = emptyMap(),
    val externalAppLaunches: Map<String, Int> = emptyMap(),
    val shareActions: Map<String, Int> = emptyMap(),
    val averageNavigationDepth: Float = 0f,
    val mostVisitedScreens: Map<String, Int> = emptyMap()
)

/**
 * Предпочтения контента
 */
@Serializable
data class ContentPreferences(
    val genrePreferences: Map<String, Float> = emptyMap(), // жанр -> оценка предпочтения
    val authorPreferences: Map<String, Float> = emptyMap(),
    val publisherPreferences: Map<String, Float> = emptyMap(),
    val languagePreferences: Map<String, Float> = emptyMap(),
    val formatPreferences: Map<String, Float> = emptyMap(), // CBZ, PDF и т.д.
    val lengthPreferences: Map<String, Float> = emptyMap(), // короткие, средние, длинные
    val colorPreferences: Map<String, Float> = emptyMap(), // цветные, ч/б
    val ageRatingPreferences: Map<String, Float> = emptyMap(),
    val completionRates: Map<String, Float> = emptyMap(), // жанр -> процент завершения
    val ratingPatterns: Map<Int, Int> = emptyMap(), // оценка -> количество
    val reviewLengthPreference: Float = 0f // средняя длина отзывов
)

/**
 * Предпочтения интерфейса
 */
@Serializable
data class InterfacePreferences(
    val preferredThemes: Map<String, Float> = emptyMap(), // тема -> вес предпочтения
    val colorSchemePreferences: Map<String, Float> = emptyMap(),
    val fontSizePreferences: Map<Float, Int> = emptyMap(), // размер -> частота использования
    val layoutPreferences: Map<String, Float> = emptyMap(), // тип макета -> предпочтение
    val animationPreferences: Map<String, Float> = emptyMap(),
    val densityPreferences: Map<String, Float> = emptyMap(), // плотность интерфейса
    val iconStylePreferences: Map<String, Float> = emptyMap(),
    val navigationStylePreferences: Map<String, Float> = emptyMap(),
    val feedbackPreferences: Map<String, Float> = emptyMap(), // тип обратной связи
    val accessibilityUsage: Map<String, Boolean> = emptyMap() // функция -> использование
)

/**
 * Контекстные данные
 */
@Serializable
data class ContextualData(
    val deviceInfo: DeviceInfo = DeviceInfo(),
    val environmentalData: EnvironmentalData = EnvironmentalData(),
    val locationData: LocationData = LocationData(),
    val networkData: NetworkData = NetworkData(),
    val batteryData: BatteryData = BatteryData(),
    val usageContext: UsageContext = UsageContext()
)

/**
 * Информация об устройстве
 */
@Serializable
data class DeviceInfo(
    val screenSize: String = "", // small, medium, large, xlarge
    val screenDensity: String = "", // ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
    val orientation: String = "", // portrait, landscape
    val deviceType: String = "", // phone, tablet, tv, watch
    val osVersion: String = "",
    val appVersion: String = "",
    val availableMemory: Long = 0L,
    val storageSpace: Long = 0L,
    val processorInfo: String = "",
    val hasStylus: Boolean = false,
    val hasKeyboard: Boolean = false,
    val hasGamepad: Boolean = false
)

/**
 * Данные окружения
 */
@Serializable
data class EnvironmentalData(
    val lightLevel: Float = 0f, // люкс
    val noiseLevel: Float = 0f, // децибелы
    val temperature: Float = 0f, // градусы Цельсия
    val humidity: Float = 0f, // процент
    val pressure: Float = 0f, // гПа
    val motionLevel: Float = 0f, // уровень движения устройства
    val proximityDetected: Boolean = false,
    val headphonesConnected: Boolean = false,
    val chargingState: Boolean = false,
    val bluetoothDevices: List<String> = emptyList()
)

/**
 * Данные местоположения (анонимизированные)
 */
@Serializable
data class LocationData(
    val timeZone: String = "",
    val country: String = "",
    val region: String = "",
    val city: String = "",
    val locationType: String = "", // home, work, public, transport
    val movementSpeed: Float = 0f, // км/ч
    val altitude: Float = 0f, // метры
    val weather: String = "", // sunny, cloudy, rainy, snowy
    val season: String = "" // spring, summer, autumn, winter
)

/**
 * Данные сети
 */
@Serializable
data class NetworkData(
    val connectionType: String = "", // wifi, mobile, ethernet, none
    val connectionSpeed: Float = 0f, // Мбит/с
    val connectionQuality: String = "", // excellent, good, fair, poor
    val dataUsage: Long = 0L, // байты
    val latency: Int = 0, // миллисекунды
    val isMetered: Boolean = false,
    val isRoaming: Boolean = false,
    val vpnActive: Boolean = false
)

/**
 * Данные батареи
 */
@Serializable
data class BatteryData(
    val batteryLevel: Float = 0f, // процент
    val isCharging: Boolean = false,
    val chargingType: String = "", // ac, usb, wireless
    val batteryHealth: String = "", // good, overheat, dead, cold
    val powerSaveMode: Boolean = false,
    val estimatedTimeRemaining: Long = 0L, // минуты
    val chargingSpeed: Float = 0f, // ватты
    val batteryTemperature: Float = 0f // градусы Цельсия
)

/**
 * Контекст использования
 */
@Serializable
data class UsageContext(
    val sessionType: String = "", // reading, browsing, searching, organizing
    val multitasking: Boolean = false,
    val interruptions: Int = 0, // количество прерываний за сессию
    val focusLevel: Float = 0f, // уровень концентрации (0-1)
    val stressLevel: Float = 0f, // уровень стресса (0-1)
    val urgency: String = "", // low, medium, high
    val socialContext: String = "", // alone, with_friends, public
    val activityType: String = "", // leisure, work, education, commute
    val goalOriented: Boolean = false // целенаправленное использование
)

/**
 * Адаптивные настройки
 */
@Serializable
data class AdaptiveSettings(
    val autoThemeSwitch: Boolean = true,
    val autoFontSizeAdjustment: Boolean = true,
    val autoLayoutOptimization: Boolean = true,
    val autoPerformanceOptimization: Boolean = true,
    val autoContentRecommendations: Boolean = true,
    val autoUISimplification: Boolean = false,
    val autoAccessibilityEnhancements: Boolean = true,
    val autoLanguageDetection: Boolean = false,
    val autoTimeBasedAdjustments: Boolean = true,
    val autoContextualAdaptations: Boolean = true,
    val adaptationSensitivity: Float = 0.5f, // 0-1, чувствительность адаптации
    val learningRate: Float = 0.1f, // скорость обучения
    val confidenceThreshold: Float = 0.7f, // порог уверенности для применения адаптаций
    val maxAdaptationsPerDay: Int = 10,
    val adaptationCooldown: Long = 3600000L // миллисекунды между адаптациями
)

/**
 * Данные машинного обучения
 */
@Serializable
data class MachineLearningData(
    val userClusters: List<String> = emptyList(), // кластеры пользователей
    val behaviorPredictions: Map<String, Float> = emptyMap(), // предсказания поведения
    val preferenceWeights: Map<String, Float> = emptyMap(), // веса предпочтений
    val anomalyScores: Map<String, Float> = emptyMap(), // оценки аномалий
    val recommendationScores: Map<String, Float> = emptyMap(), // оценки рекомендаций
    val modelVersion: String = "1.0.0",
    val lastTrainingDate: Long = 0L,
    val trainingDataSize: Int = 0,
    val modelAccuracy: Float = 0f,
    val featureImportance: Map<String, Float> = emptyMap() // важность признаков
)

/**
 * Настройки персонализации
 */
@Serializable
data class PersonalizationSettings(
    val enabled: Boolean = true,
    val dataCollection: Boolean = true,
    val behaviorAnalysis: Boolean = true,
    val adaptiveUI: Boolean = true,
    val smartRecommendations: Boolean = true,
    val contextualAdaptations: Boolean = true,
    val privacyMode: Boolean = false,
    val dataRetentionDays: Int = 365,
    val shareAnonymousData: Boolean = false,
    val explicitFeedbackWeight: Float = 0.7f, // вес явной обратной связи
    val implicitFeedbackWeight: Float = 0.3f, // вес неявной обратной связи
    val adaptationNotifications: Boolean = true,
    val manualOverrideAllowed: Boolean = true
)

/**
 * Менеджер персонализации
 */
object PersonalizationManager {
    
    private val PERSONALIZATION_DATA_KEY = stringPreferencesKey("personalization_data")
    private val BEHAVIOR_EVENTS_KEY = stringPreferencesKey("behavior_events")
    private val ADAPTATION_HISTORY_KEY = stringPreferencesKey("adaptation_history")
    
    private val json = Json { 
        ignoreUnknownKeys = true
        encodeDefaults = true
    }
    
    /**
     * Получение данных персонализации
     */
    fun getPersonalizationData(context: Context): Flow<PersonalizationData> {
        return context.personalizationDataStore.data.map { preferences ->
            val dataJson = preferences[PERSONALIZATION_DATA_KEY]
            if (dataJson != null) {
                try {
                    json.decodeFromString<PersonalizationData>(dataJson)
                } catch (e: Exception) {
                    PersonalizationData()
                }
            } else {
                PersonalizationData()
            }
        }
    }
    
    /**
     * Сохранение данных персонализации
     */
    suspend fun savePersonalizationData(context: Context, data: PersonalizationData) {
        context.personalizationDataStore.edit { preferences ->
            preferences[PERSONALIZATION_DATA_KEY] = json.encodeToString(
                data.copy(lastUpdatedAt = System.currentTimeMillis())
            )
        }
    }
    
    /**
     * Запись события поведения
     */
    suspend fun recordBehaviorEvent(
        context: Context,
        eventType: String,
        eventData: Map<String, Any>,
        timestamp: Long = System.currentTimeMillis()
    ) {
        val currentData = getPersonalizationData(context).first()
        
        if (!currentData.personalizationSettings.enabled || 
            !currentData.personalizationSettings.behaviorAnalysis) {
            return
        }
        
        // Обновляем поведенческие данные на основе события
        val updatedBehaviorData = updateBehaviorData(currentData.behaviorData, eventType, eventData)
        val updatedData = currentData.copy(behaviorData = updatedBehaviorData)
        
        savePersonalizationData(context, updatedData)
        
        // Проверяем, нужна ли адаптация
        checkForAdaptations(context, updatedData)
    }
    
    /**
     * Обновление поведенческих данных
     */
    private fun updateBehaviorData(
        behaviorData: BehaviorData,
        eventType: String,
        eventData: Map<String, Any>
    ): BehaviorData {
        return when (eventType) {
            "page_read" -> {
                val readingTime = eventData["reading_time"] as? Long ?: 0L
                val pageCount = eventData["page_count"] as? Int ?: 1
                val speed = if (readingTime > 0) pageCount.toFloat() / (readingTime / 60000f) else 0f
                
                behaviorData.copy(
                    readingPatterns = behaviorData.readingPatterns.copy(
                        averageReadingSpeed = (behaviorData.readingPatterns.averageReadingSpeed + speed) / 2f
                    )
                )
            }
            "ui_interaction" -> {
                val interactionType = eventData["type"] as? String ?: ""
                val location = eventData["location"] as? String ?: ""
                
                val updatedInteractions = behaviorData.uiInteractions.tapPatterns.toMutableMap()
                updatedInteractions[location] = (updatedInteractions[location] ?: 0) + 1
                
                behaviorData.copy(
                    uiInteractions = behaviorData.uiInteractions.copy(
                        tapPatterns = updatedInteractions
                    )
                )
            }
            "theme_change" -> {
                val themeId = eventData["theme_id"] as? String ?: ""
                val timestamp = eventData["timestamp"] as? Long ?: System.currentTimeMillis()
                
                val updatedChanges = behaviorData.uiInteractions.themeChanges.toMutableList()
                updatedChanges.add(timestamp)
                
                behaviorData.copy(
                    uiInteractions = behaviorData.uiInteractions.copy(
                        themeChanges = updatedChanges
                    )
                )
            }
            else -> behaviorData
        }
    }
    
    /**
     * Проверка необходимости адаптаций
     */
    private suspend fun checkForAdaptations(context: Context, data: PersonalizationData) {
        if (!data.adaptiveSettings.autoThemeSwitch && 
            !data.adaptiveSettings.autoFontSizeAdjustment &&
            !data.adaptiveSettings.autoLayoutOptimization) {
            return
        }
        
        val currentTime = System.currentTimeMillis()
        val lastAdaptation = getLastAdaptationTime(context)
        
        if (currentTime - lastAdaptation < data.adaptiveSettings.adaptationCooldown) {
            return
        }
        
        // Анализируем данные и применяем адаптации
        val adaptations = analyzeAndGenerateAdaptations(data)
        
        for (adaptation in adaptations) {
            if (adaptation.confidence >= data.adaptiveSettings.confidenceThreshold) {
                applyAdaptation(context, adaptation)
            }
        }
    }
    
    /**
     * Анализ данных и генерация адаптаций
     */
    private fun analyzeAndGenerateAdaptations(data: PersonalizationData): List<Adaptation> {
        val adaptations = mutableListOf<Adaptation>()
        
        // Адаптация темы на основе времени
        if (data.adaptiveSettings.autoThemeSwitch) {
            val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val nightModeUsage = data.behaviorData.timePatterns.nightModeUsage
            
            if (hour in 20..23 || hour in 0..6) {
                val nightModePreference = nightModeUsage[hour] ?: false
                if (nightModePreference) {
                    adaptations.add(
                        Adaptation(
                            type = "theme_switch",
                            value = "dark",
                            confidence = 0.8f,
                            reason = "Пользователь предпочитает темную тему в это время"
                        )
                    )
                }
            }
        }
        
        // Адаптация размера шрифта на основе времени чтения
        if (data.adaptiveSettings.autoFontSizeAdjustment) {
            val averageSessionDuration = data.behaviorData.readingPatterns.averageSessionDuration
            if (averageSessionDuration > 3600000L) { // более часа
                adaptations.add(
                    Adaptation(
                        type = "font_size_increase",
                        value = "1.1",
                        confidence = 0.7f,
                        reason = "Длительные сессии чтения - увеличиваем шрифт для комфорта"
                    )
                )
            }
        }
        
        // Адаптация макета на основе паттернов навигации
        if (data.adaptiveSettings.autoLayoutOptimization) {
            val mostVisitedScreens = data.behaviorData.navigationPatterns.mostVisitedScreens
            val libraryUsage = mostVisitedScreens["library"] ?: 0
            val readerUsage = mostVisitedScreens["reader"] ?: 0
            
            if (readerUsage > libraryUsage * 2) {
                adaptations.add(
                    Adaptation(
                        type = "layout_optimization",
                        value = "reader_focused",
                        confidence = 0.75f,
                        reason = "Пользователь больше читает, чем просматривает библиотеку"
                    )
                )
            }
        }
        
        return adaptations
    }
    
    /**
     * Применение адаптации
     */
    private suspend fun applyAdaptation(context: Context, adaptation: Adaptation) {
        // Здесь будет логика применения конкретных адаптаций
        // Например, изменение темы, размера шрифта, макета и т.д.
        
        // Записываем адаптацию в историю
        recordAdaptation(context, adaptation)
    }
    
    /**
     * Запись адаптации в историю
     */
    private suspend fun recordAdaptation(context: Context, adaptation: Adaptation) {
        context.personalizationDataStore.edit { preferences ->
            val historyJson = preferences[ADAPTATION_HISTORY_KEY] ?: "[]"
            val history = try {
                json.decodeFromString<List<Adaptation>>(historyJson).toMutableList()
            } catch (e: Exception) {
                mutableListOf<Adaptation>()
            }
            
            history.add(0, adaptation.copy(timestamp = System.currentTimeMillis()))
            if (history.size > 100) {
                history.removeAt(history.size - 1)
            }
            
            preferences[ADAPTATION_HISTORY_KEY] = json.encodeToString(history)
        }
    }
    
    /**
     * Получение времени последней адаптации
     */
    private suspend fun getLastAdaptationTime(context: Context): Long {
        return context.personalizationDataStore.data.map { preferences ->
            val historyJson = preferences[ADAPTATION_HISTORY_KEY] ?: "[]"
            try {
                val history = json.decodeFromString<List<Adaptation>>(historyJson)
                history.firstOrNull()?.timestamp ?: 0L
            } catch (e: Exception) {
                0L
            }
        }.first()
    }
    
    /**
     * Получение рекомендаций контента
     */
    fun getContentRecommendations(
        context: Context,
        contentList: List<ContentItem>
    ): Flow<List<ContentItem>> {
        return getPersonalizationData(context).map { data ->
            if (!data.personalizationSettings.smartRecommendations) {
                return@map contentList
            }
            
            // Сортируем контент на основе предпочтений пользователя
            contentList.sortedByDescending { content ->
                calculateContentScore(content, data.behaviorData.contentPreferences)
            }
        }
    }
    
    /**
     * Расчет оценки контента
     */
    private fun calculateContentScore(
        content: ContentItem,
        preferences: ContentPreferences
    ): Float {
        var score = 0f
        
        // Оценка по жанру
        val genreScore = preferences.genrePreferences[content.genre] ?: 0f
        score += genreScore * 0.4f
        
        // Оценка по автору
        val authorScore = preferences.authorPreferences[content.author] ?: 0f
        score += authorScore * 0.2f
        
        // Оценка по издателю
        val publisherScore = preferences.publisherPreferences[content.publisher] ?: 0f
        score += publisherScore * 0.1f
        
        // Оценка по формату
        val formatScore = preferences.formatPreferences[content.format] ?: 0f
        score += formatScore * 0.1f
        
        // Оценка по длине
        val lengthCategory = when {
            content.pageCount < 50 -> "short"
            content.pageCount < 200 -> "medium"
            else -> "long"
        }
        val lengthScore = preferences.lengthPreferences[lengthCategory] ?: 0f
        score += lengthScore * 0.1f
        
        // Оценка по возрастному рейтингу
        val ratingScore = preferences.ageRatingPreferences[content.ageRating] ?: 0f
        score += ratingScore * 0.1f
        
        return score
    }
    
    /**
     * Сброс данных персонализации
     */
    suspend fun resetPersonalizationData(context: Context) {
        context.personalizationDataStore.edit { preferences ->
            preferences.clear()
        }
    }
    
    /**
     * Экспорт данных персонализации
     */
    suspend fun exportPersonalizationData(context: Context): String {
        val data = getPersonalizationData(context).first()
        return json.encodeToString(data)
    }
    
    /**
     * Импорт данных персонализации
     */
    suspend fun importPersonalizationData(context: Context, dataJson: String): Boolean {
        return try {
            val data = json.decodeFromString<PersonalizationData>(dataJson)
            savePersonalizationData(context, data)
            true
        } catch (e: Exception) {
            false
        }
    }
}

/**
 * Адаптация интерфейса
 */
@Serializable
data class Adaptation(
    val type: String,
    val value: String,
    val confidence: Float,
    val reason: String,
    val timestamp: Long = System.currentTimeMillis(),
    val applied: Boolean = false,
    val userFeedback: String? = null
)

/**
 * Элемент контента для рекомендаций
 */
data class ContentItem(
    val id: String,
    val title: String,
    val author: String,
    val publisher: String,
    val genre: String,
    val format: String,
    val pageCount: Int,
    val ageRating: String,
    val rating: Float,
    val tags: List<String>
)

/**
 * Composable для персонализации
 */
@Composable
fun PersonalizedContent(
    content: @Composable (PersonalizationData) -> Unit
) {
    val context = LocalContext.current
    val personalizationData by PersonalizationManager.getPersonalizationData(context)
        .collectAsState(initial = PersonalizationData())
    
    content(personalizationData)
}

/**
 * Хук для записи событий поведения
 */
@Composable
fun rememberBehaviorTracker(): (String, Map<String, Any>) -> Unit {
    val context = LocalContext.current
    
    return remember {
        { eventType: String, eventData: Map<String, Any> ->
            // Запускаем в корутине
            kotlinx.coroutines.GlobalScope.launch {
                PersonalizationManager.recordBehaviorEvent(context, eventType, eventData)
            }
        }
    }
}

