package com.mrcomic.di

import com.mrcomic.core.data.repository.ComicRepository
import com.mrcomic.core.data.repository.DefaultComicRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
	@Binds
	@Singleton
	abstract fun bindComicRepository(impl: DefaultComicRepository): ComicRepository
}