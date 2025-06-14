package com.example.comicapp.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.comicapp.data.ComicDao
import com.example.comicapp.data.ComicEntity
import com.example.comicapp.utils.ComicScanner
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

