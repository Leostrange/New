import os
import logging
from file_handler import open_file_and_get_status, FileOpeningResult

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Define the path to your test data directory
TEST_DATA_DIR = os.path.join(os.path.dirname(__file__), "test_data")

def run_valid_file_tests():
    logger.info("\n--- Running Valid File Opening Tests ---")

    valid_files = [
        os.path.join(TEST_DATA_DIR, "valid", "cbz", "valid_comic.cbz"),
        os.path.join(TEST_DATA_DIR, "valid", "pdf", "valid_document.pdf"),
    ]

    all_tests_passed = True

    for file_path in valid_files:
        logger.info(f"Testing valid file: {file_path}")
        result = open_file_and_get_status(file_path)

        if result.is_success():
            logger.info(f"SUCCESS: File {file_path} opened successfully. Message: {result.message}")
        else:
            logger.error(f"FAILURE: File {file_path} failed to open. Status: {result.status}, Message: {result.message}")
            all_tests_passed = False

    if all_tests_passed:
        logger.info("\nAll valid file opening tests passed successfully!")
    else:
        logger.error("\nSome valid file opening tests failed.")

    return all_tests_passed

if __name__ == "__main__":
    run_valid_file_tests()


