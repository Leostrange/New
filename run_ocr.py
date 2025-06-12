import sys
import os
from plugins.ocr.tesseract_ocr import TesseractOCR

def main():
    if len(sys.argv) < 2:
        print("Использование: python run_ocr.py <путь_к_изображению> [ocr_движок]")
        sys.exit(1)

    img_path = sys.argv[1]
    ocr_name = sys.argv[2] if len(sys.argv) > 2 else "tesseract"

    if not os.path.exists(img_path):
        print(f"Ошибка: файл изображения не найден по пути {img_path}")
        sys.exit(1)

    # Здесь можно добавить логику выбора плагина
    if ocr_name == "tesseract":
        ocr_engine = TesseractOCR()
    else:
        print(f"Движок {ocr_name} не поддерживается.")
        sys.exit(1)

    text = ocr_engine.recognize(img_path)
    print(text)

if __name__ == "__main__":
    main()

