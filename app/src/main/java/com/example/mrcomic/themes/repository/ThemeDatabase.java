package com.example.mrcomic.themes.repository;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverters;
import androidx.room.migration.Migration;
import androidx.sqlite.db.SupportSQLiteDatabase;

import com.example.mrcomic.themes.model.Theme;
import com.example.mrcomic.themes.model.ThemeRating;
import com.example.mrcomic.themes.model.ThemeCreator;
import com.example.mrcomic.themes.utils.ThemeConverters;

/**
 * База данных Room для системы тем
 * Управляет всеми таблицами, связанными с темами, рейтингами и создателями
 */
@Database(
    entities = {
        Theme.class,
        ThemeRating.class,
        ThemeCreator.class
    },
    version = 1,
    exportSchema = false
)
@TypeConverters(ThemeConverters.class)
public abstract class ThemeDatabase extends RoomDatabase {
    
    private static final String DATABASE_NAME = "theme_database";
    private static volatile ThemeDatabase INSTANCE;
    
    // Абстрактные методы для получения DAO
    public abstract ThemeDao themeDao();
    public abstract ThemeRatingDao ratingDao();
    public abstract ThemeCreatorDao creatorDao();
    
    /**
     * Получает экземпляр базы данных (Singleton)
     */
    public static ThemeDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (ThemeDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(
                            context.getApplicationContext(),
                            ThemeDatabase.class,
                            DATABASE_NAME
                    )
                    .addCallback(DATABASE_CALLBACK)
                    .addMigrations(MIGRATION_1_2) // Для будущих миграций
                    .build();
                }
            }
        }
        return INSTANCE;
    }
    
    /**
     * Callback для инициализации базы данных
     */
    private static final RoomDatabase.Callback DATABASE_CALLBACK = new RoomDatabase.Callback() {
        @Override
        public void onCreate(SupportSQLiteDatabase db) {
            super.onCreate(db);
            // Здесь можно добавить начальные данные
            populateInitialData();
        }
        
        @Override
        public void onOpen(SupportSQLiteDatabase db) {
            super.onOpen(db);
            // Выполняется при каждом открытии базы данных
        }
    };
    
    /**
     * Миграция с версии 1 на версию 2 (пример для будущего использования)
     */
    private static final Migration MIGRATION_1_2 = new Migration(1, 2) {
        @Override
        public void migrate(SupportSQLiteDatabase database) {
            // Пример миграции - добавление нового столбца
            // database.execSQL("ALTER TABLE themes ADD COLUMN new_column TEXT");
        }
    };
    
    /**
     * Заполняет базу данных начальными данными
     */
    private static void populateInitialData() {
        // Выполняется в фоновом потоке
        new Thread(() -> {
            if (INSTANCE != null) {
                // Добавляем начальные категории и примеры тем
                insertSampleData();
            }
        }).start();
    }
    
    /**
     * Вставляет примеры данных для демонстрации
     */
    private static void insertSampleData() {
        try {
            ThemeDao themeDao = INSTANCE.themeDao();
            ThemeCreatorDao creatorDao = INSTANCE.creatorDao();
            
            // Создаем примерного создателя
            ThemeCreator sampleCreator = new ThemeCreator(
                "creator_001",
                "mr_comic_dev",
                "Mr.Comic Developer",
                "dev@mrcomic.com"
            );
            sampleCreator.setBio("Официальный разработчик тем для Mr.Comic");
            sampleCreator.setIsVerified(true);
            sampleCreator.setIsFeatured(true);
            creatorDao.insertCreator(sampleCreator);
            
            // Создаем примерные темы
            Theme darkTheme = new Theme(
                "theme_dark_default",
                "Темная тема",
                "Классическая темная тема для комфортного чтения",
                "creator_001",
                "Mr.Comic Developer"
            );
            darkTheme.setCategory(com.example.mrcomic.themes.model.ThemeCategory.DARK);
            darkTheme.setIsFeatured(true);
            darkTheme.setIsVerified(true);
            darkTheme.setDownloadCount(10000L);
            darkTheme.setRating(4.8);
            darkTheme.setRatingCount(500L);
            
            Theme lightTheme = new Theme(
                "theme_light_default",
                "Светлая тема",
                "Классическая светлая тема для дневного чтения",
                "creator_001",
                "Mr.Comic Developer"
            );
            lightTheme.setCategory(com.example.mrcomic.themes.model.ThemeCategory.LIGHT);
            lightTheme.setIsFeatured(true);
            lightTheme.setIsVerified(true);
            lightTheme.setDownloadCount(8500L);
            lightTheme.setRating(4.6);
            lightTheme.setRatingCount(350L);
            
            Theme mangaTheme = new Theme(
                "theme_manga_classic",
                "Классическая манга",
                "Тема в стиле традиционной японской манги",
                "creator_001",
                "Mr.Comic Developer"
            );
            mangaTheme.setCategory(com.example.mrcomic.themes.model.ThemeCategory.MANGA);
            mangaTheme.setIsFeatured(true);
            mangaTheme.setIsVerified(true);
            mangaTheme.setDownloadCount(15000L);
            mangaTheme.setRating(4.9);
            mangaTheme.setRatingCount(750L);
            
            // Вставляем темы
            themeDao.insertTheme(darkTheme);
            themeDao.insertTheme(lightTheme);
            themeDao.insertTheme(mangaTheme);
            
        } catch (Exception e) {
            // Логируем ошибку, но не прерываем работу приложения
            e.printStackTrace();
        }
    }
    
    /**
     * Очищает все данные в базе данных
     */
    public void clearAllData() {
        new Thread(() -> {
            themeDao().deleteAllThemes();
            ratingDao().deleteAllRatings();
            creatorDao().deleteAllCreators();
        }).start();
    }
    
    /**
     * Экспортирует данные базы данных
     */
    public void exportData(ExportCallback callback) {
        new Thread(() -> {
            try {
                ExportData exportData = new ExportData();
                exportData.themes = themeDao().getAllThemesSync();
                exportData.creators = creatorDao().getAllCreatorsSync();
                // Рейтинги экспортируем отдельно из-за большого объема
                
                callback.onSuccess(exportData);
            } catch (Exception e) {
                callback.onError(e);
            }
        }).start();
    }
    
    /**
     * Импортирует данные в базу данных
     */
    public void importData(ExportData data, ImportCallback callback) {
        new Thread(() -> {
            try {
                if (data.creators != null && !data.creators.isEmpty()) {
                    creatorDao().insertCreators(data.creators);
                }
                
                if (data.themes != null && !data.themes.isEmpty()) {
                    themeDao().insertThemes(data.themes);
                }
                
                callback.onSuccess();
            } catch (Exception e) {
                callback.onError(e);
            }
        }).start();
    }
    
    /**
     * Выполняет обслуживание базы данных
     */
    public void performMaintenance() {
        new Thread(() -> {
            try {
                // Исправляем null значения
                themeDao().fixNullDownloadCounts();
                themeDao().fixNullRatings();
                creatorDao().fixNullThemeCounts();
                creatorDao().fixNullDownloadCounts();
                ratingDao().fixNullHelpfulCounts();
                ratingDao().fixNullNotHelpfulCounts();
                
                // Очищаем старые данные (старше 1 года)
                long oneYearAgo = System.currentTimeMillis() - 365L * 24 * 60 * 60 * 1000;
                java.util.Date cutoffDate = new java.util.Date(oneYearAgo);
                
                themeDao().cleanupOldThemes(cutoffDate);
                creatorDao().cleanupInactiveCreators(cutoffDate);
                ratingDao().cleanupSpamRatings(cutoffDate);
                
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
    
    /**
     * Получает статистику базы данных
     */
    public void getDatabaseStats(StatsCallback callback) {
        new Thread(() -> {
            try {
                DatabaseStats stats = new DatabaseStats();
                stats.totalThemes = themeDao().getTotalThemeCount().getValue();
                stats.totalCreators = creatorDao().getTotalCreatorCount().getValue();
                stats.totalDownloads = themeDao().getTotalDownloadCount().getValue();
                stats.averageRating = themeDao().getAverageRating().getValue();
                
                callback.onSuccess(stats);
            } catch (Exception e) {
                callback.onError(e);
            }
        }).start();
    }
    
    // Вспомогательные классы и интерфейсы
    
    public static class ExportData {
        public java.util.List<Theme> themes;
        public java.util.List<ThemeCreator> creators;
    }
    
    public static class DatabaseStats {
        public Integer totalThemes;
        public Integer totalCreators;
        public Long totalDownloads;
        public Double averageRating;
    }
    
    public interface ExportCallback {
        void onSuccess(ExportData data);
        void onError(Exception error);
    }
    
    public interface ImportCallback {
        void onSuccess();
        void onError(Exception error);
    }
    
    public interface StatsCallback {
        void onSuccess(DatabaseStats stats);
        void onError(Exception error);
    }
}

