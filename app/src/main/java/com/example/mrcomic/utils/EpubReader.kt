package com.example.mrcomic.utils

import android.content.Context
import nl.siegmann.epublib.epub.EpubReader
import java.io.InputStream

class EpubReader(private val context: Context) {

    fun openEpub(inputStream: InputStream): nl.siegmann.epublib.domain.Book {
        val epubReader = EpubReader()
        return epubReader.readEpub(inputStream)
    }

    // TODO: Add methods for extracting pages, images, etc.
}


