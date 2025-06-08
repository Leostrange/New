@Dao
interface ComicDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnnotation(annotation: Annotation)

    @Query("SELECT * FROM annotations WHERE comicId = :comicId AND pageIndex = :pageIndex LIMIT 1")
    suspend fun getAnnotation(comicId: Int, pageIndex: Int): Annotation?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOcrResult(result: OcrResult)

    @Query("SELECT * FROM ocr_results WHERE comicId = :comicId AND pageIndex = :pageIndex LIMIT 1")
    suspend fun getOcrResult(comicId: Int, pageIndex: Int): OcrResult?
} 