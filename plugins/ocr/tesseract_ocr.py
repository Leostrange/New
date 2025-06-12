from PIL import Image
import pytesseract
from .base_plugin import OcrPlugin

class TesseractOCR(OcrPlugin):
    def recognize(self, image_path: str, lang: str = "eng+rus") -> str:
        try:
            img = Image.open(image_path)
            return pytesseract.image_to_string(img, lang=lang)
        except Exception as e:
            return f"[Tesseract Error: {e}]"

