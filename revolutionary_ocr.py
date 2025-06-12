from PIL import Image
import pytesseract

def recognize_text(image_path: str, lang: str = "eng+rus") -> str:
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang=lang)
        if not text.strip():
            return "[Empty input]"
        return text
    except FileNotFoundError:
        return "[Image not found]"
    except Exception as e:
        return f"[OCR Error: {e}]"

