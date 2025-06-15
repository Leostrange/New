package com.example.mrcomic.plugins.core;

/**
 * Перечисление типов плагинов в системе Mr.Comic
 */
public enum PluginType {
    
    /**
     * Плагины для оптического распознавания текста (OCR)
     * Примеры: Tesseract, PaddleOCR, EasyOCR
     */
    OCR("ocr", "OCR Plugins", "🔍"),
    
    /**
     * Плагины для перевода текста
     * Примеры: Google Translate, DeepL, локальные модели
     */
    TRANSLATOR("translator", "Translation Plugins", "🌐"),
    
    /**
     * Плагины для поддержки новых форматов файлов
     * Примеры: новые форматы комиксов, архивов
     */
    FORMAT_HANDLER("format_handler", "Format Handler Plugins", "📁"),
    
    /**
     * Плагины для расширения пользовательского интерфейса
     * Примеры: кастомные панели, виджеты, элементы управления
     */
    UI_EXTENSION("ui_extension", "UI Extension Plugins", "🎨"),
    
    /**
     * Плагины для тем и визуальных эффектов
     * Примеры: анимации, переходы, кастомные темы
     */
    THEME("theme", "Theme Plugins", "🎭"),
    
    /**
     * Плагины для интеграции с внешними сервисами
     * Примеры: облачные хранилища, социальные сети, API
     */
    INTEGRATION("integration", "Integration Plugins", "🔗"),
    
    /**
     * Плагины для обработки и анализа контента
     * Примеры: анализ жанров, рекомендации, метаданные
     */
    CONTENT_PROCESSOR("content_processor", "Content Processor Plugins", "⚙️"),
    
    /**
     * Плагины для экспорта и конвертации
     * Примеры: экспорт в PDF, EPUB, различные форматы
     */
    EXPORTER("exporter", "Export Plugins", "📤"),
    
    /**
     * Плагины для аналитики и мониторинга
     * Примеры: сбор метрик, аналитика использования
     */
    ANALYTICS("analytics", "Analytics Plugins", "📊"),
    
    /**
     * Плагины для безопасности и защиты
     * Примеры: шифрование, аутентификация, защита контента
     */
    SECURITY("security", "Security Plugins", "🔒"),
    
    /**
     * Плагины для автоматизации и скриптов
     * Примеры: автоматические действия, макросы, скрипты
     */
    AUTOMATION("automation", "Automation Plugins", "🤖"),
    
    /**
     * Плагины для работы с базами данных
     * Примеры: синхронизация, резервное копирование, миграции
     */
    DATABASE("database", "Database Plugins", "🗄️"),
    
    /**
     * Плагины для сетевого взаимодействия
     * Примеры: протоколы, прокси, VPN
     */
    NETWORK("network", "Network Plugins", "🌍"),
    
    /**
     * Плагины для работы с мультимедиа
     * Примеры: аудио, видео, анимации
     */
    MULTIMEDIA("multimedia", "Multimedia Plugins", "🎬"),
    
    /**
     * Универсальные плагины, не попадающие в другие категории
     */
    UTILITY("utility", "Utility Plugins", "🛠️");
    
    private final String id;
    private final String displayName;
    private final String icon;
    
    PluginType(String id, String displayName, String icon) {
        this.id = id;
        this.displayName = displayName;
        this.icon = icon;
    }
    
    /**
     * Получить идентификатор типа плагина
     * 
     * @return строковый идентификатор
     */
    public String getId() {
        return id;
    }
    
    /**
     * Получить отображаемое название типа плагина
     * 
     * @return название для отображения пользователю
     */
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Получить иконку типа плагина
     * 
     * @return эмодзи иконка
     */
    public String getIcon() {
        return icon;
    }
    
    /**
     * Найти тип плагина по идентификатору
     * 
     * @param id идентификатор типа
     * @return тип плагина или null, если не найден
     */
    public static PluginType fromId(String id) {
        for (PluginType type : values()) {
            if (type.getId().equals(id)) {
                return type;
            }
        }
        return null;
    }
    
    /**
     * Проверить, является ли тип критически важным для системы
     * 
     * @return true, если тип критически важен
     */
    public boolean isCritical() {
        return this == SECURITY || this == DATABASE || this == FORMAT_HANDLER;
    }
    
    /**
     * Проверить, требует ли тип специальных разрешений
     * 
     * @return true, если требуются специальные разрешения
     */
    public boolean requiresSpecialPermissions() {
        return this == SECURITY || this == NETWORK || this == DATABASE || 
               this == INTEGRATION || this == ANALYTICS;
    }
    
    /**
     * Получить максимальное количество плагинов данного типа
     * 
     * @return максимальное количество или -1 для неограниченного
     */
    public int getMaxInstances() {
        switch (this) {
            case SECURITY:
            case DATABASE:
                return 5; // Ограниченное количество для критических типов
            case OCR:
            case TRANSLATOR:
                return 10; // Умеренное ограничение
            default:
                return -1; // Неограниченно
        }
    }
}

