from PIL import Image
import pytesseract
from .base import BaseOCRPlugin

class TesseractOCRPlugin(BaseOCRPlugin):
    def process_image(self, image_path: str, lang: str = "eng+rus") -> str:
        try:
            img = Image.open(image_path)
            return pytesseract.image_to_string(img, lang=lang)
        except Exception as e:
            return f"[Tesseract Error: {e}]"

class NoOpOCRPlugin(BaseOCRPlugin):
    def process_image(self, image_path: str) -> str:
        return ""


