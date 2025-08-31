package com.example.core.data.repository

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import com.example.core.model.LocalDictionary
import com.example.core.model.LocalModel
import com.example.core.model.ModelType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import javax.inject.Inject

interface LocalResourcesRepository {
	suspend fun listDictionaries(): List<LocalDictionary>
	suspend fun listModels(): List<LocalModel>
	suspend fun setCustomRoots(dictionariesRoot: String?, modelsRoot: String?)
	suspend fun getRoots(): Pair<String, String>
	
	// Dictionary management functions
	suspend fun importDictionary(sourceUri: Uri, context: Context): Result<LocalDictionary>
	suspend fun exportDictionary(dictionary: LocalDictionary, destinationUri: Uri, context: Context): Result<Unit>
	suspend fun deleteDictionary(dictionary: LocalDictionary, context: Context): Result<Unit>
}

class LocalResourcesRepositoryImpl @Inject constructor(
	private val context: Context,
) : LocalResourcesRepository {
	companion object {
		private const val TAG = "LocalResourcesRepository"
	}
	
	// Default roots: app-internal files dir
	@Volatile private var dictionariesRootInternal: String? = null
	@Volatile private var modelsRootInternal: String? = null

	override suspend fun setCustomRoots(dictionariesRoot: String?, modelsRoot: String?) {
		dictionariesRootInternal = dictionariesRoot
		modelsRootInternal = modelsRoot
	}

	override suspend fun getRoots(): Pair<String, String> = withContext(Dispatchers.IO) {
		val base = context.filesDir.absolutePath
		val dict = dictionariesRootInternal ?: "$base/local_resources/dictionaries"
		val models = modelsRootInternal ?: "$base/local_resources/llm"
		Pair(dict, models)
	}

	override suspend fun listDictionaries(): List<LocalDictionary> = withContext(Dispatchers.IO) {
		val (dictRoot, _) = getRoots()
		val rootDoc = DocumentFile.fromFile(File(dictRoot))
		if (!rootDoc.exists()) return@withContext emptyList()
		rootDoc.listFiles()
			.filter { it.isDirectory || it.name?.endsWith(".zip", true) == true }
			.mapNotNull { file ->
				val name = file.name ?: return@mapNotNull null
				val id = UUID.nameUUIDFromBytes(name.toByteArray()).toString()
				LocalDictionary(
					id = id,
					name = name,
					languages = emptyList(),
					version = null,
					path = file.uri.toString()
				)
			}
	}

	override suspend fun listModels(): List<LocalModel> = withContext(Dispatchers.IO) {
		val (_, modelsRoot) = getRoots()
		val rootDoc = DocumentFile.fromFile(File(modelsRoot))
		if (!rootDoc.exists()) return@withContext emptyList()
		rootDoc.listFiles()
			.filter { it.isFile || it.isDirectory }
			.mapNotNull { file ->
				val name = file.name ?: return@mapNotNull null
				val id = UUID.nameUUIDFromBytes(name.toByteArray()).toString()
				val type = when {
					name.endsWith(".gguf", true) -> ModelType.GGUF
					name.endsWith(".onnx", true) -> ModelType.ONNX
					else -> ModelType.OTHER
				}
				LocalModel(
					id = id,
					name = name,
					type = type,
					filePath = file.uri.toString(),
					sizeBytes = null
				)
			}
	}
	
	override suspend fun importDictionary(sourceUri: Uri, context: Context): Result<LocalDictionary> = withContext(Dispatchers.IO) {
		return@withContext try {
			val (dictRoot, _) = getRoots()
			val rootDir = File(dictRoot)
			if (!rootDir.exists()) {
				rootDir.mkdirs()
			}
			
			val sourceFile = DocumentFile.fromSingleUri(context, sourceUri) ?: return@try Result.failure(Exception("Invalid source URI"))
			val fileName = sourceFile.name ?: return@try Result.failure(Exception("Invalid file name"))
			
			// Copy file to local directory
			val destFile = File(rootDir, fileName)
			context.contentResolver.openInputStream(sourceUri)?.use { input ->
				FileOutputStream(destFile).use { output ->
					input.copyTo(output)
				}
			}
			
			// Create LocalDictionary object
			val id = UUID.nameUUIDFromBytes(fileName.toByteArray()).toString()
			val localDictionary = LocalDictionary(
				id = id,
				name = fileName,
				languages = emptyList(),
				version = null,
				path = destFile.toURI().toString()
			)
			
			Log.d(TAG, "Successfully imported dictionary: $fileName")
			Result.success(localDictionary)
		} catch (e: Exception) {
			Log.e(TAG, "Failed to import dictionary", e)
			Result.failure(e)
		}
	}
	
	override suspend fun exportDictionary(dictionary: LocalDictionary, destinationUri: Uri, context: Context): Result<Unit> = withContext(Dispatchers.IO) {
		return@withContext try {
			val sourceFile = File(Uri.parse(dictionary.path).path ?: return@try Result.failure(Exception("Invalid dictionary path")))
			if (!sourceFile.exists()) {
				return@try Result.failure(Exception("Dictionary file not found"))
			}
			
			context.contentResolver.openOutputStream(destinationUri)?.use { output ->
				sourceFile.inputStream().use { input ->
					input.copyTo(output)
				}
			}
			
			Log.d(TAG, "Successfully exported dictionary: ${dictionary.name}")
			Result.success(Unit)
		} catch (e: Exception) {
			Log.e(TAG, "Failed to export dictionary", e)
			Result.failure(e)
		}
	}
	
	override suspend fun deleteDictionary(dictionary: LocalDictionary, context: Context): Result<Unit> = withContext(Dispatchers.IO) {
		return@withContext try {
			val file = File(Uri.parse(dictionary.path).path ?: return@try Result.failure(Exception("Invalid dictionary path")))
			if (file.exists() && file.delete()) {
				Log.d(TAG, "Successfully deleted dictionary: ${dictionary.name}")
				Result.success(Unit)
			} else {
				Result.failure(Exception("Failed to delete dictionary file"))
			}
		} catch (e: Exception) {
			Log.e(TAG, "Failed to delete dictionary", e)
			Result.failure(e)
		}
	}
}