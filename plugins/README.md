# Плагины MrComic

Добро пожаловать в систему плагинов MrComic! Здесь вы найдете готовые плагины и сможете создать собственные.

## 🚀 Быстрый старт

### Установка плагина

1. Откройте MrComic
2. Перейдите в **Настройки** → **Плагины**
3. Нажмите кнопку **"+"** (Установить плагин)
4. Выберите файл плагина (.js или .zip)
5. Подтвердите установку и предоставьте необходимые разрешения

### Доступные плагины

#### 🖼️ Улучшение изображений (`image-enhancer-plugin`)
Автоматическое улучшение качества изображений комиксов.

**Возможности:**
- Повышение резкости
- Улучшение контраста  
- Шумоподавление
- Цветокоррекция

**Разрешения:** Чтение файлов, Запись файлов, Управление читалкой

#### 🌐 Переводчик комиксов (`comic-translator-plugin`)
Автоматический перевод текста в комиксах.

**Возможности:**
- OCR распознавание текста
- Перевод на множество языков
- Наложение переводов
- Кэширование результатов

**Разрешения:** Чтение файлов, Запись файлов, Доступ к сети, Управление читалкой, Изменение интерфейса

## 🛠️ Создание собственного плагина

### 1. Создайте структуру файлов

```
my-plugin/
├── plugin.json    # Метаданные
├── main.js        # Основной код
└── icon.png       # Иконка (необязательно)
```

### 2. Настройте plugin.json

```json
{
  "id": "my-unique-plugin",
  "name": "Мой плагин",
  "version": "1.0.0",
  "author": "Ваше имя",
  "description": "Описание функциональности",
  "category": "UTILITY",
  "type": "JAVASCRIPT",
  "permissions": ["READ_FILES"],
  "dependencies": [],
  "configurable": false,
  "main": "main.js"
}
```

### 3. Напишите код плагина (main.js)

```javascript
class MyPlugin {
    constructor() {
        this.name = 'My Plugin';
        this.init();
    }
    
    init() {
        if (typeof window.MrComicPlugin !== 'undefined') {
            window.MrComicPlugin.log('Плагин запущен!');
            this.registerCommands();
        }
    }
    
    registerCommands() {
        window.plugin = {
            executeCommand: (command, params) => {
                switch (command) {
                    case 'hello':
                        return { 
                            success: true, 
                            message: 'Привет от плагина!' 
                        };
                    default:
                        throw new Error(`Неизвестная команда: ${command}`);
                }
            }
        };
    }
}

// Запуск плагина
new MyPlugin();
```

### 4. Упакуйте и установите

- **Простой способ:** Сохраните main.js и plugin.json в одной папке, заархивируйте в .zip
- **Альтернатива:** Используйте только main.js файл (для простых плагинов)

## 📚 API плагинов

### Доступные функции

```javascript
// Логирование
window.MrComicPlugin.log('Сообщение');

// Проверка разрешений
window.MrComicPlugin.hasPermission('READ_FILES');

// Выполнение системных команд
window.MrComicPlugin.executeSystemCommand('get_current_page_path');

// Сохранение/получение данных плагина
window.MrComicPlugin.setPluginData('key', 'value');
const data = window.MrComicPlugin.getPluginData('key');
```

### Разрешения

- `READ_FILES` - Чтение файлов
- `WRITE_FILES` - Запись файлов  
- `NETWORK_ACCESS` - Доступ к интернету
- `CAMERA_ACCESS` - Доступ к камере
- `STORAGE_ACCESS` - Доступ к хранилищу
- `SYSTEM_SETTINGS` - Настройки системы
- `READER_CONTROL` - Управление читалкой
- `UI_MODIFICATION` - Изменение интерфейса

## 🔒 Безопасность

### Ограничения
- Плагины выполняются в изолированной среде
- Доступ только к разрешенным функциям
- Проверка кода перед установкой
- Ограничение размера файлов (10 МБ)

### Запрещенные конструкции
- `eval()`, `Function()`
- Прямой доступ к DOM
- `localStorage`, `sessionStorage`
- `fetch()`, `XMLHttpRequest` (без разрешения NETWORK_ACCESS)

## 🎯 Примеры использования

### Обработка изображения
```javascript
// Получить путь к текущей странице
const imagePath = window.MrComicPlugin.executeSystemCommand('get_current_page_path');

// Обработать изображение (требует READ_FILES, WRITE_FILES)
if (window.MrComicPlugin.hasPermission('READ_FILES')) {
    // Ваша логика обработки
}
```

### Добавление UI элемента
```javascript
// Добавить кнопку в интерфейс (требует UI_MODIFICATION)
if (window.MrComicPlugin.hasPermission('UI_MODIFICATION')) {
    window.MrComicPlugin.executeSystemCommand('add_toolbar_button', {
        id: 'my-button',
        icon: 'star',
        tooltip: 'Моя функция',
        onClick: () => console.log('Кнопка нажата!')
    });
}
```

## 🐛 Отладка

### Логи
Все сообщения плагинов отображаются в Android Log:
```
adb logcat | grep "Plugin\[your-plugin-id\]"
```

### Тестирование
1. Начните с простого плагина
2. Постепенно добавляйте функциональность
3. Тестируйте каждую новую возможность
4. Проверяйте работу разрешений

## 📖 Полная документация

Подробную документацию смотрите в [PLUGIN_SYSTEM_GUIDE.md](../docs/PLUGIN_SYSTEM_GUIDE.md)

## 🤝 Поддержка

Если у вас есть вопросы или проблемы:
1. Проверьте логи Android
2. Убедитесь в корректности plugin.json
3. Проверьте права доступа плагина
4. Создайте issue в репозитории проекта

---

**Удачи в создании плагинов! 🚀**