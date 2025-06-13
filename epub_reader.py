import ebooklib
from ebooklib import epub
import os

def display_first_epub_page(epub_path):
    """Displays the content of the first text page of an EPUB file."""
    if not os.path.exists(epub_path):
        print(f"Error: EPUB file not found at {epub_path}")
        return

    try:
        book = epub.read_epub(epub_path)
        
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                # This is an HTML/XHTML document, which typically represents a page
                # We'll take the first one we find as the 


                print("\n--- First EPUB Page Content ---")
                print(item.content.decode("utf-8"))
                return
        print("No readable content found in the EPUB file.")

    except Exception as e:
        print(f"Error reading EPUB file: {e}")

if __name__ == "__main__":
    # Example usage (replace with a real EPUB file path)
    # For testing, you might need to create a dummy EPUB file or use an existing one.
    # For now, we'll just print a message.
    print("To test, call display_first_epub_page("your_epub_file.epub")")


