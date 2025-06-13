import argparse
import os
from universal_translator import UniversalTranslator
from download_model import download_models

def main():
    parser = argparse.ArgumentParser(description="Mr.Comic CLI tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Translate command
    translate_parser = subparsers.add_parser("translate", help="Translate text from an image")
    translate_parser.add_argument("image", type=str, help="Path to the image file")
    translate_parser.add_argument("--lang-pair", type=str, default="en-ru", help="Language pair for translation (e.g., en-ru)")
    translate_parser.add_argument("--ocr-lang", type=str, default="eng+rus", help="OCR language(s) (e.g., eng+rus)")

    args = parser.parse_args()

    if args.command == "translate":
        if not os.path.exists(args.image):
            print(f"Error: Image file not found at {args.image}")
            return

        # Ensure models are downloaded before translation
        download_models()

        translator = UniversalTranslator()
        print(f"Translating text from {args.image}...")
        translated_text = translator.recognize_from_image(args.image, args.lang_pair, args.ocr_lang)
        print("\n--- Translated Text ---")
        print(translated_text)

if __name__ == "__main__":
    main()


