import subprocess
import json
import logging
import os
from zipfile import ZipFile, BadZipFile
from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError

logger = logging.getLogger(__name__)

class FileOpeningResult:
    SUCCESS = "success"
    FAILURE = "failure"
    PROTECTED = "protected"

    def __init__(self, status: str, message: str = "", details: dict = None):
        self.status = status
        self.message = message
        self.details = details if details is not None else {}

    def is_success(self) -> bool:
        return self.status == self.SUCCESS

    def is_failure(self) -> bool:
        return self.status == self.FAILURE

    def is_protected(self) -> bool:
        return self.status == self.PROTECTED

def open_file_and_get_status(
    file_path: str,
    password: str = None,
    use_cli: bool = False # For this demonstration, we'll primarily use the internal API mock
) -> FileOpeningResult:
    """
    Пытается открыть файл с помощью Mr.Comic и возвращает статус.
    Эта функция может вызывать соответствующую логику Mr.Comic
    через CLI или прямой вызов внутренних API.

    :param file_path: Путь к файлу для открытия.
    :param password: Пароль для защищенных файлов (опционально).
    :param use_cli: Если True, использует CLI Mr.Comic; иначе - внутренний API.
    :return: Объект FileOpeningResult, содержащий статус и сообщение.
    """
    if use_cli:
        # In a real scenario, you would call the actual mrcomic CLI here
        # For this mock, we'll just simulate the outcome based on file_path
        return _simulate_cli_open(file_path, password) # Keep simulation for CLI as we don't have actual CLI
    else:
        return _open_file_via_internal_api(file_path, password)

def _simulate_cli_open(file_path: str, password: str = None) -> FileOpeningResult:
    """
    Simulates CLI behavior for demonstration.
    This part remains a simulation as we don't have the actual `mrcomic` CLI.
    """
    # This is a placeholder for actual CLI calls. For now, it will try to open via internal API
    # and map the results to CLI-like output.
    return _open_file_via_internal_api(file_path, password)

def _open_file_via_internal_api(file_path: str, password: str = None) -> FileOpeningResult:
    """
    Открывает файл через внутренний API Mr.Comic (реальная попытка).
    """
    if not os.path.exists(file_path):
        return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Файл не найден: {file_path}")

    file_extension = os.path.splitext(file_path)[1].lower()

    try:
        if file_extension == ".cbz" or file_extension == ".zip":
            with ZipFile(file_path, 'r') as zip_ref:
                # Attempt to list contents and read a small part of the first file
                namelist = zip_ref.namelist()
                if not namelist:
                    raise BadZipFile("Empty ZIP/CBZ archive.")
                with zip_ref.open(namelist[0]) as first_file:
                    first_file.read(10) # Read first 10 bytes to trigger potential errors
            return FileOpeningResult(FileOpeningResult.SUCCESS, message=f"CBZ/ZIP файл {file_path} успешно открыт.")
        elif file_extension == ".pdf":
            reader = PdfReader(file_path)
            if reader.is_encrypted:
                if password:
                    try:
                        # PyPDF2's decrypt method returns 0 for incorrect, 1 for user, 2 for owner
                        decryption_result = reader.decrypt(password)
                        if decryption_result in [1, 2]: # Successfully decrypted with user or owner password
                            # Try to access a page to ensure it's truly readable
                            len(reader.pages)
                            return FileOpeningResult(FileOpeningResult.SUCCESS, message=f"PDF файл {file_path} успешно открыт с паролем.")
                        else: # Decryption failed (returned 0)
                            return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Неверный пароль для PDF файла {file_path}.")
                    except Exception as e:
                        # Catch any other exceptions during decryption (e.g., malformed password)
                        return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Ошибка дешифрования PDF файла {file_path}: {e}")
                else:
                    return FileOpeningResult(FileOpeningResult.PROTECTED, message=f"PDF файл {file_path} защищен паролем. Требуется пароль.")
            else:
                # Attempt to read a page to ensure it's a valid PDF
                len(reader.pages)
                reader.pages[0].extract_text() # Try to extract text from first page to trigger more errors
                return FileOpeningResult(FileOpeningResult.SUCCESS, message=f"PDF файл {file_path} успешно открыт.")
        else:
            return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Формат файла {file_path} ({file_extension}) не поддерживается для реального открытия в этой демонстрации.")

    except BadZipFile:
        return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Файл {file_path} является поврежденным ZIP/CBZ архивом.")
    except PdfReadError as e:
        if "Incorrect password" in str(e):
            return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Неверный пароль для PDF файла {file_path}.")
        elif "encrypted" in str(e).lower() and not password:
            return FileOpeningResult(FileOpeningResult.PROTECTED, message=f"PDF файл {file_path} защищен паролем. Требуется пароль.")
        else:
            return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Файл {file_path} является поврежденным PDF файлом: {e}")
    except Exception as e:
        return FileOpeningResult(FileOpeningResult.FAILURE, message=f"Неизвестная ошибка при открытии файла {file_path}: {e}")


