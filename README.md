# Mr.Comic OCR + Translation Engine

Это проект для распознавания текста (OCR) на изображениях, в первую очередь комиксах, и его последующего перевода с использованием локальных нейросетевых моделей и словарей.

## Структура проекта

- `local-translation-models/`: Место для хранения моделей ONNX и токенизаторов.
- `dictionaries/`: JSON-словари для коррекции перевода до (`pre`), после (`post`) и во время OCR (`ocr`).
- `plugins/ocr/`: Модульная система для подключения различных OCR-движков (Tesseract, etc.).
- `universal_translator.py`: Основной класс-оркестратор, управляющий переводом и словарями.
- `translate_from_image.py`: Главный исполняемый файл для запуска полного цикла OCR+перевод.
- `test_pipeline.py`: Автоматический тест для проверки работоспособности всего конвейера.

## Быстрый старт

1. **Установите зависимости:**
    ```bash
    pip install -r requirements.txt
    ```

2. **Установите Tesseract OCR:**
    ```bash
    # Ubuntu/Debian
    sudo apt update
    sudo apt install tesseract-ocr tesseract-ocr-eng tesseract-ocr-rus
    ```

3. **Скачайте модели (опционально):**
    ```bash
    mkdir -p local-translation-models
    wget https://huggingface.co/alirezamsh/small100/resolve/main/model.onnx -O local-translation-models/model.onnx
    wget https://huggingface.co/alirezamsh/small100/resolve/main/sentencepiece.bpe.model -O local-translation-models/sentencepiece.bpe.model
    ```
    **Примечание:** Модель small100 весит ~1.8GB и требует значительных ресурсов памяти. Система работает и без неё, используя fallback перевод.

4. **Запустите тест:**
    ```bash
    python test_pipeline.py
    ```

5. **Переведите изображение:**
    ```bash
    python translate_from_image.py path/to/your/comic.png
    ```

## Возможности

- ✅ Модульная архитектура OCR-плагинов
- ✅ Поддержка словарей для коррекции перевода
- ✅ Fallback перевод при недоступности нейросетевой модели
- ✅ Интеграция Tesseract OCR с поддержкой русского и английского языков
- ✅ Полный пайплайн OCR + перевод
- ✅ Автоматические тесты

## Статус реализации

**Фаза 1 ✅**: Структура каталогов и подготовка окружения
**Фаза 2 ✅**: Реализация перевода через small100 + словари (с fallback)
**Фаза 3 ✅**: Настройка и интеграция Tesseract OCR
**Фаза 4 ✅**: OCR-плагины и модульность через CLI
**Фаза 5 ✅**: Единый пайплайн, тестирование и документация

### Финальная проверка

После выполнения всех фаз убедитесь, что:
- ✅ Скрипт `test_pipeline.py` выполняется без ошибок.
- ✅ Скрипт `translate_from_image.py` корректно обрабатывает изображения и выводит распознанный и переведенный текст.
- ✅ Словари из папки `dictionaries/` корректно подхватываются и влияют на результат.
- ✅ Система устойчива к пустым или некорректным входным данным.

