import unittest
from unittest.mock import MagicMock, patch
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from plugins.ocr.tesseract_plugin import TesseractOCRPlugin
from plugins.ocr.base import BaseOCRPlugin

class TestOCR(unittest.TestCase):
    def setUp(self):
        self.dummy_image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'dummy_image.png'))

    @patch("plugins.ocr.tesseract_plugin.pytesseract.image_to_string")
    @patch("plugins.ocr.tesseract_plugin.Image.open")
    def test_tesseract_plugin_process_image(self, mock_image_open, mock_image_to_string):
        mock_image_to_string.return_value = "Test OCR Result"
        mock_image_open.return_value = MagicMock()
        plugin = TesseractOCRPlugin()
        result = plugin.process_image(self.dummy_image_path)
        mock_image_open.assert_called_once_with(self.dummy_image_path)
        mock_image_to_string.assert_called_once_with(mock_image_open.return_value, lang="eng+rus")
        self.assertEqual(result, "Test OCR Result")

    @patch("plugins.ocr.tesseract_plugin.pytesseract.image_to_string")
    @patch("plugins.ocr.tesseract_plugin.Image.open")
    def test_tesseract_plugin_process_image_with_lang(self, mock_image_open, mock_image_to_string):
        mock_image_to_string.return_value = "Тестовый результат OCR"
        mock_image_open.return_value = MagicMock()
        plugin = TesseractOCRPlugin()
        result = plugin.process_image(self.dummy_image_path, lang="rus")
        mock_image_open.assert_called_once_with(self.dummy_image_path)
        mock_image_to_string.assert_called_once_with(mock_image_open.return_value, lang="rus")
        self.assertEqual(result, "Тестовый результат OCR")

if __name__ == '__main__':
    unittest.main()

