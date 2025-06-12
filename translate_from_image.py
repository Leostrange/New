import sys
from plugins.ocr.tesseract_ocr import TesseractOCR
from universal_translator import UniversalTranslator # Предполагается, что класс готов

def main(image_path):
    print(f"1. Инициализация движков…")
    ocr = TesseractOCR()
    translator = UniversalTranslator() # Вызовет _initialize_engines() в __init__

    print(f"2. Распознавание текста с изображения: {image_path}")
    ocr_text = ocr.recognize(image_path, lang="eng+rus")
    print("="*20)
    print("📄 Распознанный текст:\n", ocr_text)
    print("="*20)

    print("3. Перевод текста…")
    translated = translator._translate_small100(ocr_text, lang_pair="en-ru")
    print("="*20)
    print("🌐 Перевод:\n", translated)
    print("="*20)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python translate_from_image.py <путь_к_изображению>")
    else:
        main(sys.argv[1])

