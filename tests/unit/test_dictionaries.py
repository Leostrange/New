import unittest
import json
import os

class TestDictionaries(unittest.TestCase):
    def setUp(self):
        self.dictionaries_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'dictionaries'))

    def test_pre_json_format(self):
        with open(os.path.join(self.dictionaries_path, 'pre.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.assertIsInstance(data, dict)
            self.assertIn('pre', data)
            self.assertIsInstance(data['pre'], dict)
            for key, value in data['pre'].items():
                self.assertIsInstance(key, str)
                self.assertIsInstance(value, str)

    def test_post_json_format(self):
        with open(os.path.join(self.dictionaries_path, 'post.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.assertIsInstance(data, dict)
            self.assertIn('post', data)
            self.assertIsInstance(data['post'], dict)
            for key, value in data['post'].items():
                self.assertIsInstance(key, str)
                self.assertIsInstance(value, str)

    def test_ocr_json_format(self):
        with open(os.path.join(self.dictionaries_path, 'ocr.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.assertIsInstance(data, dict)
            self.assertIn('ocr', data)
            self.assertIsInstance(data['ocr'], dict)
            for key, value in data['ocr'].items():
                self.assertIsInstance(key, str)
                self.assertIsInstance(value, str)

if __name__ == '__main__':
    unittest.main()

