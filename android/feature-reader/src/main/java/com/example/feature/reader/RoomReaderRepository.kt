package com.example.feature.reader

import com.example.core.data.reader.ReaderStateDao
import com.example.core.data.reader.ReaderStateEntity
import com.example.core.data.sync.ReadingProgressSyncService
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class RoomReaderRepository @Inject constructor(
    private val dao: ReaderStateDao,
    private val syncService: ReadingProgressSyncService
) : ReaderRepository {
    override fun getCurrentComic(): String = ""

    override fun getStateFlow(): Flow<Pair<String, Int>> {
        return dao.getState().map { state ->
            if (state != null) state.comicTitle to state.page else "" to 0
        }
    }

    override suspend fun setState(comicTitle: String, page: Int) {
        syncService.saveReadingProgress(comicTitle, page)
    }
    
    /**
     * Synchronize reading progress with other devices
     */
    fun syncReadingProgress() {
        syncService.syncReadingProgress()
    }
}