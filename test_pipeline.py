import os
from plugins.ocr.tesseract_ocr import TesseractOCR
from universal_translator import UniversalTranslator
from PIL import Image, ImageDraw, ImageFont

def create_test_image(path, text):
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path))
    # Простая функция для создания изображения для теста
    img = Image.new('RGB', (400, 50), color = (255, 255, 255))
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 15)
    except IOError:
        font = ImageFont.load_default()
    d.text((10,10), text, fill=(0,0,0), font=font)
    img.save(path)

def test_full_pipeline():
    print("--- Запуск полного теста пайплайна ---")
    img_path = "test_data/test_image.png"
    original_text = "Hello Batman, how are you?"

    # 1. Создание тестового изображения
    create_test_image(img_path, original_text)
    print(f"✅ Тестовое изображение '{img_path}' создано.")

    # 2. Инициализация
    ocr = TesseractOCR()
    translator = UniversalTranslator()
    print("✅ Движки инициализированы.")

    # 3. OCR
    recognized_text = ocr.recognize(img_path)
    assert "Batman" in recognized_text, "Ошибка OCR: ключевое слово не найдено"
    print(f"✅ OCR выполнен: '{recognized_text.strip()}'")

    # 4. Перевод
    translated_text = translator._translate_small100(recognized_text, lang_pair="en-ru")
    assert "бэтмен" in translated_text.lower(), "Ошибка перевода или словаря"
    print(f"✅ Перевод выполнен: '{translated_text.strip()}'")

    print("--- Тест успешно завершен ---")

if __name__ == "__main__":
    test_full_pipeline()

