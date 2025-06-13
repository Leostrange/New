import argparse
import os
from universal_translator import UniversalTranslator
from download_model import download_models
from epub_reader import display_first_epub_page

def main():
    parser = argparse.ArgumentParser(description="Mr.Comic CLI tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Translate command
    translate_parser = subparsers.add_parser("translate", help="Translate text from an image")
    translate_parser.add_argument("image", type=str, help="Path to the image file")
    translate_parser.add_argument("--lang-pair", type=str, default="en-ru", help="Language pair for translation (e.g., en-ru)")
    translate_parser.add_argument("--ocr-lang", type=str, default="eng+rus", help="OCR language(s) (e.g., eng+rus)")
    translate_parser.add_argument("--model", type=str, default="fallback", help="Translation model to use (e.g., small100, fallback)")
    translate_parser.add_argument("--output", type=str, help="Output file to save translated text")
    translate_parser.add_argument("--dry-run", action="store_true", help="Perform a dry run without actual translation")

    # EPUB command
    epub_parser = subparsers.add_parser("epub", help="Display the first page of an EPUB file")
    epub_parser.add_argument("file", type=str, help="Path to the EPUB file")

    args = parser.parse_args()

    if args.command == "translate":
        if not os.path.exists(args.image):
            print(f"Error: Image file not found at {args.image}")
            return

        if args.dry_run:
            print(f"Dry run: Would translate text from {args.image} using model \'{args.model}\' for language pair \'{args.lang_pair}\' with OCR language \'{args.ocr_lang}\'.")
            if args.output:
                print(f"Dry run: Would save output to {args.output}.")
            return

        # Ensure models are downloaded before translation
        download_models()

        translator = UniversalTranslator()
        # Set the translation model based on the --model argument
        translator.set_translation_model(args.model)

        print(f"Translating text from {args.image}...")
        translated_text = translator.recognize_from_image(args.image, args.lang_pair, args.ocr_lang)
        
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(translated_text)
            print(f"Translated text saved to {args.output}")
        else:
            print("\n--- Translated Text ---")
            print(translated_text)

    elif args.command == "epub":
        display_first_epub_page(args.file)

if __name__ == "__main__":
    main()


