import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../plugins/ocr')))

from universal_translator import UniversalTranslator

class TestEndToEndIntegration(unittest.TestCase):
    def setUp(self):
        self.translator = UniversalTranslator()
        self.dummy_image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dummy_image.png'))

    @patch('universal_translator.UniversalTranslator._init_small100')
    @patch('plugins.ocr.tesseract_plugin.pytesseract.image_to_string')
    def test_ocr_translate_cli_flow(self, mock_image_to_string, mock_init_small100):
        # Mock OCR result
        mock_image_to_string.return_value = "Hello world"

        # Ensure small100 model is not loaded for this test
        mock_init_small100.return_value = None
        self.translator.small100_session = None
        self.translator.small100_tokenizer = None

        # Simulate OCR
        ocr_text = self.translator.recognize_from_image(self.dummy_image_path, ocr_lang="eng")
        self.assertEqual(ocr_text, "Hello world")

        # Simulate translation (will use fallback as small100 is mocked off)
        translated_text = self.translator._fallback_translation(ocr_text, "en-ru")
        self.assertEqual(translated_text, "привет world") # Based on fallback dictionary

        # Simulate CLI output (simple print for now)
        cli_output = f"Translated text: {translated_text}"
        self.assertIn("привет world", cli_output)

if __name__ == '__main__':
    unittest.main()

