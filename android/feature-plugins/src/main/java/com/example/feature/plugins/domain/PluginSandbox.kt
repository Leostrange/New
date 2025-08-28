package com.example.feature.plugins.domain

import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import com.example.feature.plugins.model.PluginExecutionContext
import com.example.feature.plugins.model.PluginResult
import com.google.gson.Gson
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.withTimeout
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PluginSandbox @Inject constructor(
    private val gson: Gson
) {
    
    /**
     * Выполнить код плагина в WebView
     */
    suspend fun executeInWebView(
        webView: WebView,
        pluginCode: String,
        context: PluginExecutionContext
    ): PluginResult<Unit> {
        return try {
            val deferred = CompletableDeferred<PluginResult<Unit>>()
            
            // Создание JavaScript интерфейса для взаимодействия
            val jsInterface = PluginJavaScriptInterface(context, deferred)
            webView.addJavascriptInterface(jsInterface, "MrComicAPI")
            
            webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    
                    // Создание безопасного окружения
                    val sandboxCode = createSandboxEnvironment(context)
                    val fullCode = "$sandboxCode\n\n$pluginCode"
                    
                    // Выполнение кода плагина
                    webView.evaluateJavascript(fullCode) { result ->
                        if (!deferred.isCompleted) {
                            if (result == "null" || result.isNullOrEmpty()) {
                                deferred.complete(PluginResult.success(Unit))
                            } else {
                                deferred.complete(PluginResult.error("Ошибка выполнения: $result"))
                            }
                        }
                    }
                }
            }
            
            // Загружаем пустую страницу для инициализации WebView
            webView.loadUrl("about:blank")
            
            // Ожидание результата с таймаутом
            withTimeout(30000) { // 30 секунд
                deferred.await()
            }
        } catch (e: Exception) {
            PluginResult.error("Ошибка выполнения в WebView: ${e.message}")
        }
    }
    
    /**
     * Выполнить команду плагина
     */
    suspend fun executeCommand(
        webView: WebView,
        command: String,
        params: Map<String, Any>
    ): PluginResult<Any> {
        return try {
            val deferred = CompletableDeferred<PluginResult<Any>>()
            val paramsJson = gson.toJson(params)
            
            val commandCode = """
                try {
                    if (typeof window.plugin !== 'undefined' && 
                        typeof window.plugin.executeCommand === 'function') {
                        var result = window.plugin.executeCommand('$command', $paramsJson);
                        MrComicAPI.onCommandResult(JSON.stringify({
                            success: true,
                            data: result
                        }));
                    } else {
                        MrComicAPI.onCommandResult(JSON.stringify({
                            success: false,
                            error: 'Команда не найдена: $command'
                        }));
                    }
                } catch (e) {
                    MrComicAPI.onCommandResult(JSON.stringify({
                        success: false,
                        error: e.message
                    }));
                }
            """.trimIndent()
            
            // Добавляем интерфейс для получения результата команды
            webView.addJavascriptInterface(object {
                @JavascriptInterface
                fun onCommandResult(resultJson: String) {
                    try {
                        val result = gson.fromJson(resultJson, CommandResult::class.java)
                        if (result.success) {
                            deferred.complete(PluginResult.success(result.data ?: Unit))
                        } else {
                            deferred.complete(PluginResult.error(result.error ?: "Неизвестная ошибка"))
                        }
                    } catch (e: Exception) {
                        deferred.complete(PluginResult.error("Ошибка парсинга результата: ${e.message}"))
                    }
                }
            }, "MrComicCommandAPI")
            
            webView.evaluateJavascript(commandCode, null)
            
            withTimeout(10000) { // 10 секунд
                deferred.await()
            }
        } catch (e: Exception) {
            PluginResult.error("Ошибка выполнения команды: ${e.message}")
        }
    }
    
    /**
     * Создать безопасное окружение для плагина
     */
    private fun createSandboxEnvironment(context: PluginExecutionContext): String {
        val permissions = context.permissions.joinToString(",") { "\"${it.name}\"" }
        
        return """
            // Создание изолированного окружения для плагина
            (function() {
                'use strict';
                
                // Очистка глобального контекста
                if (typeof window !== 'undefined') {
                    // Блокируем доступ к опасным функциям
                    delete window.eval;
                    delete window.Function;
                    delete window.setTimeout;
                    delete window.setInterval;
                }
                
                // API плагина
                window.MrComicPlugin = {
                    id: '${context.pluginId}',
                    permissions: [$permissions],
                    
                    // Логирование
                    log: function(message) {
                        if (typeof MrComicAPI !== 'undefined') {
                            MrComicAPI.log(message);
                        }
                    },
                    
                    // Проверка разрешения
                    hasPermission: function(permission) {
                        return this.permissions.includes(permission);
                    },
                    
                    // Выполнение системной команды
                    executeSystemCommand: function(command, params) {
                        if (typeof MrComicAPI !== 'undefined') {
                            return MrComicAPI.executeSystemCommand(command, JSON.stringify(params));
                        }
                        return null;
                    },
                    
                    // Получение данных приложения
                    getAppData: function(key) {
                        if (typeof MrComicAPI !== 'undefined') {
                            return MrComicAPI.getAppData(key);
                        }
                        return null;
                    },
                    
                    // Сохранение данных плагина
                    setPluginData: function(key, value) {
                        if (typeof MrComicAPI !== 'undefined') {
                            MrComicAPI.setPluginData(key, JSON.stringify(value));
                        }
                    },
                    
                    // Получение данных плагина
                    getPluginData: function(key) {
                        if (typeof MrComicAPI !== 'undefined') {
                            var data = MrComicAPI.getPluginData(key);
                            return data ? JSON.parse(data) : null;
                        }
                        return null;
                    }
                };
                
                // Защита от переопределения API
                Object.freeze(window.MrComicPlugin);
            })();
        """.trimIndent()
    }
    
    /**
     * JavaScript интерфейс для взаимодействия с плагинами
     */
    private class PluginJavaScriptInterface(
        private val context: PluginExecutionContext,
        private val deferred: CompletableDeferred<PluginResult<Unit>>
    ) {
        private val pluginStorage: MutableMap<String, MutableMap<String, String>> = mutableMapOf()
        
        @JavascriptInterface
        fun log(message: String) {
            android.util.Log.d("Plugin[${context.pluginId}]", message)
        }
        
        @JavascriptInterface
        fun executeSystemCommand(command: String, paramsJson: String): String? {
            // Minimal secure stub: allow only whitelisted no-op commands
            return when (command) {
                "ping" -> "pong"
                else -> null
            }
        }
        
        @JavascriptInterface
        fun getAppData(key: String): String? {
            // Restricted: return null by default in sandbox
            return null
        }
        
        @JavascriptInterface
        fun setPluginData(key: String, value: String) {
            val store = pluginStorage.getOrPut(context.pluginId) { mutableMapOf() }
            store[key] = value
        }
        
        @JavascriptInterface
        fun getPluginData(key: String): String? {
            val store = pluginStorage[context.pluginId]
            return store?.get(key)
        }
        
        @JavascriptInterface
        fun onError(error: String) {
            if (!deferred.isCompleted) {
                deferred.complete(PluginResult.error(error))
            }
        }
        
        @JavascriptInterface
        fun onSuccess() {
            if (!deferred.isCompleted) {
                deferred.complete(PluginResult.success(Unit))
            }
        }
    }
    
    /**
     * Модель результата команды
     */
    private data class CommandResult(
        val success: Boolean,
        val data: Any? = null,
        val error: String? = null
    )
}