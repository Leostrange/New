package com.example.feature.plugins.data.repository

import com.example.core.data.database.plugins.PluginDao
import com.example.feature.plugins.domain.PluginManager
import com.example.feature.plugins.domain.PluginValidator
import com.example.feature.plugins.model.PluginResult
import io.mockk.*
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Before
import org.junit.Test

class PluginRepositoryTest {

    private lateinit var pluginRepository: PluginRepository
    private lateinit var pluginDao: PluginDao
    private lateinit var pluginManager: PluginManager
    private lateinit var pluginValidator: PluginValidator

    @Before
    fun setUp() {
        pluginDao = mockk()
        pluginManager = mockk()
        pluginValidator = mockk()
        pluginRepository = PluginRepository(pluginDao, pluginManager, pluginValidator)
    }

    @After
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `installPlugin should return success when validation and installation succeed`() = runBlocking {
        // Given
        val packagePath = "test-plugin.zip"
        val validationResult = PluginResult.success(Unit)
        val metadata = mockk<com.example.feature.plugins.domain.PluginMetadata>()
        val plugin = mockk<com.example.feature.plugins.model.Plugin>()

        every { pluginValidator.validatePackage(packagePath) } returns validationResult
        coEvery { pluginManager.extractMetadata(packagePath) } returns metadata
        every { pluginManager.checkDependencies(any()) } returns PluginResult.success(Unit)
        every { metadata.id } returns "test-plugin"
        every { metadata.name } returns "Test Plugin"
        every { metadata.version } returns "1.0.0"
        every { metadata.author } returns "Test Author"
        every { metadata.description } returns "Test Description"
        every { metadata.category } returns com.example.feature.plugins.model.PluginCategory.UTILITY
        every { metadata.type } returns com.example.feature.plugins.model.PluginType.JAVASCRIPT
        every { metadata.permissions } returns emptyList()
        every { metadata.dependencies } returns emptyList()
        every { metadata.customMetadata } returns emptyMap()
        every { metadata.packagePath } returns packagePath
        coEvery { pluginDao.insertPlugin(any()) } just runs

        // When
        val result = pluginRepository.installPlugin(packagePath)

        // Then
        assert(result.success)
        coVerify { pluginDao.insertPlugin(any()) }
    }

    @Test
    fun `installPlugin should return error when validation fails`() = runBlocking {
        // Given
        val packagePath = "invalid-plugin.zip"
        val validationResult = PluginResult.error("Invalid plugin")

        every { pluginValidator.validatePackage(packagePath) } returns validationResult

        // When
        val result = pluginRepository.installPlugin(packagePath)

        // Then
        assert(!result.success)
        assert(result.error == "Ошибка валидации: Invalid plugin")
        coVerify(exactly = 0) { pluginManager.extractMetadata(any()) }
    }
}