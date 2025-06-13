import onnxruntime as ort
import sentencepiece as spm
import json, os
import re

class UniversalTranslator:
    def __init__(self):
        self._initialize_engines()

    def _init_small100(self):
        model_path = os.path.join(os.path.dirname(__file__), 'local-translation-models/model.onnx')
        sp_path = os.path.join(os.path.dirname(__file__), 'local-translation-models/sentencepiece.bpe.model')
        
        # Проверяем наличие файлов модели
        if not os.path.exists(model_path) or not os.path.exists(sp_path):
            # print(f"Модель small100 не найдена в {model_path}")
            self.small100_session = None
            self.small100_tokenizer = None
            return
            
        try:
            self.small100_session = ort.InferenceSession(model_path)
            self.small100_tokenizer = spm.SentencePieceProcessor()
            self.small100_tokenizer.load(sp_path)
            # print("Модель small100 загружена успешно")
        except Exception as e:
            # print(f"Ошибка загрузки модели small100: {e}")
            self.small100_session = None
            self.small100_tokenizer = None

    def _load_dictionaries(self):
        self.dictionaries = {}
        dictionaries_dir = os.path.join(os.path.dirname(__file__), 'dictionaries')
        for fname in os.listdir(dictionaries_dir):
            if fname.endswith(".json"):
                lang_pair = fname.replace(".json", "")
                try:
                    with open(os.path.join(dictionaries_dir, fname), "r", encoding="utf-8") as f:
                        self.dictionaries[lang_pair] = json.load(f)
                except Exception as e:
                    print(f"Ошибка при загрузке словаря {fname}: {e}")

    def _initialize_engines(self):
        # Временно отключаем загрузку тяжелой модели
        # self._init_small100()
        self._load_dictionaries()
        self._load_ocr_plugins()
        
        # Устанавливаем модель как недоступную
        self.small100_session = None
        self.small100_tokenizer = None
        # print("Инициализация завершена (модель small100 отключена для экономии памяти)")




    def _translate_small100(self, text: str, lang_pair: str = "en-ru") -> str:
        if not text.strip():
            return "[Empty input]"
        
        # Применяем предварительный словарь
        if hasattr(self, "dictionaries") and lang_pair in self.dictionaries:
            text = self._apply_pre_dictionary(text, lang_pair)
        
        # Проверяем, загружена ли модель
        if self.small100_session is None or self.small100_tokenizer is None:
            # print("Модель small100 недоступна, используется fallback перевод")
            return self._fallback_translation(text, lang_pair)
        
        try:
            # Добавляем префикс языка для small100
            if lang_pair == "en-ru":
                prefixed_text = ">>rus<< " + text
            else:
                prefixed_text = text
            
            # Кодируем текст
            input_ids = self.small100_tokenizer.encode(prefixed_text)
            
            # Подготавливаем входные данные для ONNX
            import numpy as np
            input_ids = np.array([input_ids], dtype=np.int64)
            
            # Для генерации используем простой greedy decoding
            max_length = 50  # Уменьшаем для экономии памяти
            generated_ids = []
            
            # Начинаем с BOS токена (обычно 0)
            decoder_input_ids = np.array([[0]], dtype=np.int64)
            
            for _ in range(max_length):
                # Запускаем модель
                ort_inputs = {
                    "input_ids": input_ids,
                    "decoder_input_ids": decoder_input_ids
                }
                
                outputs = self.small100_session.run(None, ort_inputs)
                
                # Получаем следующий токен (greedy - берем самый вероятный)
                next_token_logits = outputs[0][0, -1, :]
                next_token_id = np.argmax(next_token_logits)
                
                # Если достигли EOS токена, останавливаемся
                if next_token_id == 1:  # EOS токен обычно 1
                    break
                    
                generated_ids.append(next_token_id)
                
                # Обновляем decoder_input_ids для следующей итерации
                decoder_input_ids = np.concatenate([
                    decoder_input_ids, 
                    np.array([[next_token_id]], dtype=np.int64)
                ], axis=1)
            
            # Декодируем результат
            if generated_ids:
                decoded = self.small100_tokenizer.decode(generated_ids)
            else:
                decoded = "[No translation generated]"
                
        except Exception as e:
            # Если модель не работает, используем fallback
            # print(f"ONNX model error: {e}, using fallback translation")
            return self._fallback_translation(text, lang_pair)
        
        # Применяем постобработку словарем
        if hasattr(self, "dictionaries") and lang_pair in self.dictionaries:
            decoded = self._apply_post_dictionary(decoded, lang_pair)
            
        return decoded
    
    def _fallback_translation(self, text: str, lang_pair: str) -> str:
        """Простой словарный перевод как fallback"""
        simple_translations = {
            "hello": "привет",
            "batman": "бэтмен", 
            "how are you": "как дела",
            "good": "хорошо",
            "bad": "плохо",
            "yes": "да",
            "no": "нет",
            "comic": "комикс",
            "page": "страница",
            "text": "текст"
        }
        
        result = text
        for en, ru in simple_translations.items():
            result = re.sub(r'\b' + re.escape(en) + r'\b', ru, result, flags=re.IGNORECASE)
        
        # Применяем постобработку словарем
        if hasattr(self, "dictionaries") and lang_pair in self.dictionaries:
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
            text = re.sub(src, tgt, text)
        return text



    def post_ocr_cleanup(self, text: str, lang_pair: str) -> str:
        if hasattr(self, "dictionaries"):
            mapping = self.dictionaries.get(lang_pair, {})
            for src, tgt in mapping.get("ocr", {}).items():
                text = re.sub(src, tgt, text)
        return text

    def recognize_from_image(self, image_path, lang_pair="en-ru", ocr_lang="eng+rus"):
        # Используем активный OCR-движок
        cleaned_text = self.active_ocr.process_image(image_path)
        cleaned_text = self.post_ocr_cleanup(cleaned_text, lang_pair)
        return cleaned_text


    def _load_ocr_plugins(self):
        from plugins.ocr.tesseract_plugin import TesseractOCRPlugin, NoOpOCRPlugin
        self.ocr_plugins = {
            "tesseract": TesseractOCRPlugin(),
            "noop": NoOpOCRPlugin()
        }
        # По умолчанию используется tesseract
        self.active_ocr = self.ocr_plugins["tesseract"]

    def set_ocr_engine(self, name: str):
        if name in self.ocr_plugins:
            self.active_ocr = self.ocr_plugins[name]
        else:
            # print(f"OCR-движок \'{name}\' не найден. Используется fallback (NoOpOCRPlugin).")
            self.active_ocr = self.ocr_plugins["noop"]



