@Database(entities = [Comic::class, Annotation::class, OcrResult::class, ...], version = 2)
abstract class AppDatabase : RoomDatabase() {
    // ... existing code ...
} 