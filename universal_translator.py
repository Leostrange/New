import onnxruntime as ort
import sentencepiece as spm
import json, os

class UniversalTranslator:
    def __init__(self):
        self._initialize_engines()

    def _init_small100(self):
        model_path = 'local-translation-models/model.onnx'
        sp_path = 'local-translation-models/sentencepiece.bpe.model'
        self.small100_session = ort.InferenceSession(model_path)
        self.small100_tokenizer = spm.SentencePieceProcessor()
        self.small100_tokenizer.load(sp_path)

    def _load_dictionaries(self):
        self.dictionaries = {}
        for fname in os.listdir('dictionaries'):
            if fname.endswith('.json'):
                lang_pair = fname.replace('.json', '')
                try:
                    with open(f'dictionaries/{fname}', 'r', encoding='utf-8') as f:
                        self.dictionaries[lang_pair] = json.load(f)
                except Exception as e:
                    print(f"Ошибка при загрузке словаря {fname}: {e}")

    def _initialize_engines(self):
        self._init_small100()
        self._load_dictionaries()
        self._load_ocr_plugins()




    def _translate_small100(self, text: str, lang_pair: str = "en-ru") -> str:
        """
        Простая заглушка для перевода, пока модель small100 не настроена корректно
        """
        if not text.strip():
            return "[Empty input]"
        
        # Применяем предварительный словарь
        if hasattr(self, 'dictionaries') and lang_pair in self.dictionaries:
            text = self._apply_pre_dictionary(text, lang_pair)
        
        # Временная заглушка - простой словарный перевод
        simple_translations = {
            "hello": "привет",
            "batman": "бэтмен", 
            "how are you": "как дела",
            "good": "хорошо",
            "bad": "плохо",
            "yes": "да",
            "no": "нет"
        }
        
        result = text.lower()
        for en, ru in simple_translations.items():
            result = result.replace(en, ru)
        
        # Применяем постобработку словарем
        if hasattr(self, 'dictionaries') and lang_pair in self.dictionaries:
            result = self._apply_post_dictionary(result, lang_pair)
            
        return result

    def _apply_pre_dictionary(self, text: str, lang_pair: str) -> str:
        mapping = self.dictionaries.get(lang_pair, {})
        for src, tgt in mapping.get("pre", {}).items():
            text = text.replace(src, tgt)
        return text

    def _apply_post_dictionary(self, text: str, lang_pair: str) -> str:
        mapping = self.dictionaries.get(lang_pair, {})
        for src, tgt in mapping.get("post", {}).items():
            text = text.replace(src, tgt)
        return text



    def post_ocr_cleanup(self, text: str, lang_pair: str) -> str:
        if hasattr(self, 'dictionaries'):
            mapping = self.dictionaries.get(lang_pair, {})
            for src, tgt in mapping.get("ocr", {}).items():
                text = text.replace(src, tgt)
        return text

    def recognize_from_image(self, image_path, lang_pair="en-ru", ocr_lang="eng+rus"):
        # Импортируем функцию распознавания
        from revolutionary_ocr import recognize_text
        text = recognize_text(image_path, lang=ocr_lang)
        cleaned_text = self.post_ocr_cleanup(text, lang_pair)
        return cleaned_text


    def _load_ocr_plugins(self):
        from plugins.ocr.tesseract_ocr import TesseractOCR
        self.ocr_plugins = {"tesseract": TesseractOCR()}
        # По умолчанию используется tesseract
        self.active_ocr = self.ocr_plugins["tesseract"]

    def set_ocr_engine(self, name: str):
        if name in self.ocr_plugins:
            self.active_ocr = self.ocr_plugins[name]
        else:
            print(f"OCR-движок '{name}' не найден.")

