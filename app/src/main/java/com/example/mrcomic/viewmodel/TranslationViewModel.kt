import androidx.lifecycle.ViewModel
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class TranslationViewModel : ViewModel() {
    private val ortEnv = OrtEnvironment.getEnvironment()
    private var session: OrtSession? = null
    private val _models = MutableStateFlow<List<TranslationModel>>(emptyList())
    val models: StateFlow<List<TranslationModel>> = _models
    private val _providers = MutableStateFlow<List<TranslationProvider>>(listOf(LibreTranslateProvider))
    val providers: StateFlow<List<TranslationProvider>> = _providers
    private val _targetLanguage = MutableStateFlow("en")
    val targetLanguage: StateFlow<String> = _targetLanguage
    private val _ocrQuality = MutableStateFlow("medium")
    val ocrQuality: StateFlow<String> = _ocrQuality
    private val _selectedProvider = MutableStateFlow<TranslationProvider>(LibreTranslateProvider)
    val selectedProvider: StateFlow<TranslationProvider> = _selectedProvider

    fun loadModel(model: TranslationModel) {
        session = ortEnv.createSession(model.filePath)
    }

    fun translate(text: String, targetLang: String): String {
        // Упрощённая реализация
        return "Translated: $text"
    }

    fun selectProvider(name: String) {
        _providers.value.find { it.javaClass.simpleName == name }?.let {
            _selectedProvider.value = it
        }
    }

    fun setOcrQuality(quality: String) { _ocrQuality.value = quality }

    fun setTargetLanguage(lang: String) { _targetLanguage.value = lang }
} 