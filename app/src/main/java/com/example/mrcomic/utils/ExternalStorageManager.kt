import android.content.Context
import java.io.File

object ExternalStorageManager {
    fun getExternalStorageFiles(context: Context): List<File> {
        return context.getExternalFilesDirs(null).flatMap { it?.listFiles()?.toList() ?: emptyList() }
    }
} 