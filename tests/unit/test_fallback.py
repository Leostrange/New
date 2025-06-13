import unittest
from unittest.mock import MagicMock, patch
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from universal_translator import UniversalTranslator

class TestFallbackTranslation(unittest.TestCase):
    def setUp(self):
        # Ensure small100 model is not loaded for these tests
        with patch.object(UniversalTranslator, '_init_small100', return_value=None):
            self.translator = UniversalTranslator()
            self.translator.small100_session = None
            self.translator.small100_tokenizer = None

    def test_fallback_translation_basic(self):
        text = "hello"
        lang_pair = "en-ru"
        expected_translation = "привет"
        result = self.translator._fallback_translation(text, lang_pair)
        self.assertEqual(result, expected_translation)

    def test_fallback_translation_unknown_word(self):
        text = "unknownword"
        lang_pair = "en-ru"
        expected_translation = "unknownword"
        result = self.translator._fallback_translation(text, lang_pair)
        self.assertEqual(result, expected_translation)

    def test_fallback_translation_with_post_dictionary(self):
        # Mock dictionaries to include a post-processing rule
        self.translator.dictionaries = {
            "en-ru": {
                "post": {
                    "привет": "Здравствуй"
                }
            }
        }
        text = "hello"
        lang_pair = "en-ru"
        expected_translation = "Здравствуй"
        result = self.translator._fallback_translation(text, lang_pair)
        self.assertEqual(result, expected_translation)

    @patch.object(UniversalTranslator, '_fallback_translation')
    def test_translate_small100_calls_fallback_when_model_unavailable(self, mock_fallback):
        mock_fallback.return_value = "Fallback result"
        text = "some text"
        lang_pair = "en-ru"
        result = self.translator._translate_small100(text, lang_pair)
        mock_fallback.assert_called_once_with(text, lang_pair)
        self.assertEqual(result, "Fallback result")

if __name__ == '__main__':
    unittest.main()

