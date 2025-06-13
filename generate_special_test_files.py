import os
import random
import shutil
from zipfile import ZipFile, ZIP_DEFLATED
from PyPDF2 import PdfWriter, PdfReader

# Define paths
OUTPUT_BASE_DIR = "test_data"
CORRUPTED_DIR = os.path.join(OUTPUT_BASE_DIR, "corrupted")
PROTECTED_DIR = os.path.join(OUTPUT_BASE_DIR, "protected")
VALID_CBZ_PATH = os.path.join(OUTPUT_BASE_DIR, "valid", "cbz", "valid_comic.cbz")
VALID_PDF_PATH = os.path.join(OUTPUT_BASE_DIR, "valid", "pdf", "valid_document.pdf")

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def generate_corrupted_file(
    input_path: str,
    output_dir: str,
    corruption_type: str = "random_bytes",
    corruption_percentage: float = 0.01,
    output_filename: str = None
):
    """
    Генерирует поврежденный файл на основе исходного.
    :param input_path: Путь к исходному файлу.
    :param output_dir: Директория для сохранения поврежденного файла.
    :param corruption_type: Тип повреждения (e.g., "random_bytes", "truncate", "corrupt_header", "corrupt_zip_eocd", "corrupt_pdf_xref").
    :param corruption_percentage: Процент повреждения для некоторых типов.
    :param output_filename: Имя выходного файла. Если None, генерируется автоматически.
    """
    ensure_dir(output_dir)
    if output_filename is None:
        base_name, ext = os.path.splitext(os.path.basename(input_path))
        output_filename = f"{base_name}_{corruption_type}{ext}"
    output_path = os.path.join(output_dir, output_filename)

    with open(input_path, 'rb') as f_in:
        data = bytearray(f_in.read())

    if corruption_type == "random_bytes":
        # Make random_bytes corruption more aggressive, target beginning of file
        num_bytes_to_corrupt = int(len(data) * corruption_percentage) if len(data) > 0 else 0
        if num_bytes_to_corrupt == 0 and len(data) > 0: num_bytes_to_corrupt = 1 # Corrupt at least one byte
        
        for _ in range(num_bytes_to_corrupt):
            if len(data) == 0: continue
            index = random.randint(0, min(len(data) - 1, 100)) # Target first 100 bytes more often
            data[index] = random.randint(0, 255)
        # Also corrupt a few bytes at the very beginning to hit headers
        for i in range(min(5, len(data))):
            data[i] = random.randint(0, 255)

    elif corruption_type == "truncate":
        truncate_at = int(len(data) * (1 - corruption_percentage)) # Обрезать, оставив corruption_percentage
        data = data[:truncate_at]
    elif corruption_type == "corrupt_header":
        # Make PDF header corruption more aggressive, overwrite more bytes
        for i in range(min(20, len(data))): # Corrupt first 20 bytes
            data[i] = random.randint(0, 255)
    elif corruption_type == "corrupt_zip_eocd": # End of Central Directory Record for ZIP/CBZ
        # ZIP EOCD is typically at the end of the file. Corrupt last 22 bytes (min size of EOCD)
        if len(data) >= 22:
            for i in range(1, 22): # Corrupt all but the very last byte to ensure some data remains
                data[len(data) - i] = random.randint(0, 255)
        else:
            # If file is too small, just corrupt all bytes
            for i in range(len(data)):
                data[i] = random.randint(0, 255)
    elif corruption_type == "corrupt_pdf_xref": # Cross-reference table for PDF
        # This is a simplistic corruption. A real PDF corruption would be more complex.
        # We'll try to corrupt the last 100 bytes, where xref or startxref might be.
        if len(data) >= 100:
            for i in range(1, 100): # Corrupt last 100 bytes
                data[len(data) - i] = random.randint(0, 255)
        else:
            for i in range(len(data)):
                data[i] = random.randint(0, 255)
    else:
        raise ValueError(f"Неизвестный тип повреждения: {corruption_type}")

    with open(output_path, 'wb') as f_out:
        f_out.write(data)
    print(f"Сгенерирован поврежденный файл: {output_path}")
    return output_path

def generate_protected_pdf(
    input_pdf_path: str,
    output_dir: str,
    password: str,
    output_filename: str = None,
    encrypt_owner: bool = False
):
    """
    Генерирует PDF, защищенный паролем.
    :param input_pdf_path: Путь к исходному PDF файлу.
    :param output_dir: Директория для сохранения защищенного PDF.
    :param password: Пароль для защиты.
    :param output_filename: Имя выходного файла. Если None, генерируется автоматически.
    :param encrypt_owner: Если True, устанавливает также мастер-пароль.
    """
    ensure_dir(output_dir)
    if output_filename is None:
        base_name, ext = os.path.splitext(os.path.basename(input_pdf_path))
        output_filename = f"{base_name}_protected{ext}"
    output_path = os.path.join(output_dir, output_filename)

    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    if encrypt_owner:
        writer.encrypt(user_password=password, owner_password=password) # Пример: одинаковый пароль для обоих
    else:
        writer.encrypt(user_password=password)

    with open(output_path, "wb") as f:
        writer.write(f)
    print(f"Сгенерирован защищенный PDF: {output_path}")
    return output_path

# --- Main generation logic ---
if __name__ == "__main__":
    ensure_dir(CORRUPTED_DIR)
    ensure_dir(PROTECTED_DIR)

    # Generate corrupted files
    print("\n--- Generating Corrupted Files ---")
    generate_corrupted_file(VALID_CBZ_PATH, CORRUPTED_DIR, corruption_type="truncate", output_filename="corrupted_comic_truncated.cbz")
    generate_corrupted_file(VALID_CBZ_PATH, CORRUPTED_DIR, corruption_type="random_bytes", output_filename="corrupted_comic_random.cbz")
    generate_corrupted_file(VALID_CBZ_PATH, CORRUPTED_DIR, corruption_type="corrupt_zip_eocd", output_filename="corrupted_comic_eocd.cbz")

    generate_corrupted_file(VALID_PDF_PATH, CORRUPTED_DIR, corruption_type="corrupt_header", output_filename="corrupted_document_header.pdf")
    generate_corrupted_file(VALID_PDF_PATH, CORRUPTED_DIR, corruption_type="random_bytes", output_filename="corrupted_document_random.pdf")
    generate_corrupted_file(VALID_PDF_PATH, CORRUPTED_DIR, corruption_type="corrupt_pdf_xref", output_filename="corrupted_document_xref.pdf")

    # Generate protected files
    print("\n--- Generating Protected Files ---")
    generate_protected_pdf(VALID_PDF_PATH, PROTECTED_DIR, "testpass", output_filename="protected_document.pdf")
    generate_protected_pdf(VALID_PDF_PATH, PROTECTED_DIR, "masterpass", output_filename="protected_document_owner.pdf", encrypt_owner=True)


