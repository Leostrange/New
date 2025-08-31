import com.example.core.model.LibraryExport
import com.example.core.model.ExportedComic
import com.example.core.model.ExportedBookmark

class ComicRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context,
    private val coverExtractor: CoverExtractor,
    private val comicDao: ComicDao,
    private val settingsRepository: SettingsRepository
) : ComicRepository {

    override suspend fun exportLibrary(): LibraryExport {
        return withContext(Dispatchers.IO) {
            try {
                // Get all comics from the database
                val comicEntities = comicDao.getAllComics()
                val exportedComics = comicEntities.map { entity ->
                    ExportedComic(
                        title = entity.title,
                        author = "Unknown", // Author is not stored in ComicEntity
                        filePath = entity.filePath,
                        coverPath = entity.coverPath,
                        dateAdded = entity.dateAdded
                    )
                }
                
                // Get all bookmarks from the database
                val bookmarkEntities = comicDao.getAllBookmarks()
                val exportedBookmarks = bookmarkEntities.map { entity ->
                    ExportedBookmark(
                        comicId = entity.comicId,
                        page = entity.page,
                        label = entity.label,
                        timestamp = entity.timestamp
                    )
                }
                
                LibraryExport(
                    version = "1.0",
                    exportDate = System.currentTimeMillis(),
                    comics = exportedComics,
                    bookmarks = exportedBookmarks
                )
            } catch (e: Exception) {
                android.util.Log.e("ComicRepository", "Failed to export library", e)
                throw e
            }
        }
    }

    override suspend fun importLibrary(exportData: LibraryExport): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                // Clear existing data if needed
                // Note: We're not clearing existing data to avoid accidental data loss
                // Instead, we'll add new comics and bookmarks
                
                // Import comics
                val comicEntities = exportData.comics.map { exportedComic ->
                    ComicEntity(
                        filePath = exportedComic.filePath,
                        title = exportedComic.title,
                        coverPath = exportedComic.coverPath,
                        dateAdded = exportedComic.dateAdded
                    )
                }
                
                if (comicEntities.isNotEmpty()) {
                    comicDao.insertComics(comicEntities)
                }
                
                // Import bookmarks
                val bookmarkEntities = exportData.bookmarks.map { exportedBookmark ->
                    BookmarkEntity(
                        comicId = exportedBookmark.comicId,
                        page = exportedBookmark.page,
                        label = exportedBookmark.label,
                        timestamp = exportedBookmark.timestamp
                    )
                }
                
                if (bookmarkEntities.isNotEmpty()) {
                    comicDao.insertBookmarks(bookmarkEntities)
                }
                
                Result.success(Unit)
            } catch (e: Exception) {
                android.util.Log.e("ComicRepository", "Failed to import library", e)
                Result.failure(e)
            }
        }
    }
    
}