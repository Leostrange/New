/**
 * Hello World плагин для MrComic
 * Простейший пример плагина для тестирования системы
 */

class HelloWorldPlugin {
    constructor() {
        this.name = 'Hello World';
        this.version = '1.0.0';
        this.init();
    }
    
    /**
     * Инициализация плагина
     */
    init() {
        if (typeof window.MrComicPlugin !== 'undefined') {
            window.MrComicPlugin.log('Hello World Plugin initialized!');
            this.registerCommands();
        } else {
            console.log('Hello World Plugin - MrComicPlugin API not available');
        }
    }
    
    /**
     * Регистрация команд плагина
     */
    registerCommands() {
        window.plugin = {
            executeCommand: (command, params) => {
                return this.handleCommand(command, params);
            }
        };
    }
    
    /**
     * Обработка команд плагина
     */
    handleCommand(command, params) {
        try {
            switch (command) {
                case 'say_hello':
                    return this.sayHello(params.name);
                    
                case 'get_info':
                    return this.getPluginInfo();
                    
                case 'test_permissions':
                    return this.testPermissions();
                    
                case 'echo':
                    return this.echo(params.message);
                    
                default:
                    throw new Error(`Неизвестная команда: ${command}`);
            }
        } catch (error) {
            if (typeof window.MrComicPlugin !== 'undefined') {
                window.MrComicPlugin.log(`Ошибка выполнения команды ${command}: ${error.message}`);
            }
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Приветствие пользователя
     */
    sayHello(name = 'Пользователь') {
        const message = `Привет, ${name}! Это Hello World плагин для MrComic.`;
        
        if (typeof window.MrComicPlugin !== 'undefined') {
            window.MrComicPlugin.log(message);
        }
        
        return {
            success: true,
            message: message,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Получение информации о плагине
     */
    getPluginInfo() {
        return {
            success: true,
            info: {
                name: this.name,
                version: this.version,
                description: 'Простейший тестовый плагин',
                author: 'MrComic Team',
                capabilities: [
                    'say_hello',
                    'get_info',
                    'test_permissions',
                    'echo'
                ]
            }
        };
    }
    
    /**
     * Тестирование разрешений плагина
     */
    testPermissions() {
        if (typeof window.MrComicPlugin === 'undefined') {
            return {
                success: false,
                error: 'MrComicPlugin API недоступен'
            };
        }
        
        const permissions = [
            'READ_FILES',
            'WRITE_FILES',
            'NETWORK_ACCESS',
            'CAMERA_ACCESS',
            'STORAGE_ACCESS',
            'SYSTEM_SETTINGS',
            'READER_CONTROL',
            'UI_MODIFICATION'
        ];
        
        const permissionStatus = {};
        
        permissions.forEach(permission => {
            permissionStatus[permission] = window.MrComicPlugin.hasPermission(permission);
        });
        
        return {
            success: true,
            permissions: permissionStatus,
            pluginId: window.MrComicPlugin.id
        };
    }
    
    /**
     * Эхо - возвращает переданное сообщение
     */
    echo(message = 'Пустое сообщение') {
        return {
            success: true,
            originalMessage: message,
            echoMessage: `Эхо: ${message}`,
            timestamp: new Date().toISOString()
        };
    }
}

// Инициализация плагина
const helloWorldPlugin = new HelloWorldPlugin();

// Экспорт для использования в других частях системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelloWorldPlugin;
}

// Дополнительные тесты для отладки
if (typeof window !== 'undefined') {
    // Тест через 2 секунды после загрузки
    setTimeout(() => {
        if (typeof window.plugin !== 'undefined') {
            console.log('Тестирование Hello World плагина...');
            
            // Тест команды say_hello
            const helloResult = window.plugin.executeCommand('say_hello', { name: 'Разработчик' });
            console.log('Say Hello Result:', helloResult);
            
            // Тест команды get_info
            const infoResult = window.plugin.executeCommand('get_info', {});
            console.log('Plugin Info Result:', infoResult);
            
            // Тест команды echo
            const echoResult = window.plugin.executeCommand('echo', { message: 'Тестовое сообщение' });
            console.log('Echo Result:', echoResult);
        }
    }, 2000);
}