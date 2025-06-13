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
CORRUPTED_DIR = os.path.join(TEST_DATA_DIR, "corrupted")
PROTECTED_DIR = os.path.join(TEST_DATA_DIR, "protected")

def run_corrupted_file_tests():
    logger.info("\n--- Running Corrupted File Opening Tests ---")

    corrupted_files = [
        os.path.join(CORRUPTED_DIR, "corrupted_comic_truncated.cbz"),
        os.path.join(CORRUPTED_DIR, "corrupted_comic_random.cbz"),
        os.path.join(CORRUPTED_DIR, "corrupted_document_header.pdf"),
        os.path.join(CORRUPTED_DIR, "corrupted_document_random.pdf"),
    ]

    all_tests_passed = True

    for file_path in corrupted_files:
        logger.info(f"Testing corrupted file: {file_path}")
        result = open_file_and_get_status(file_path)

        if result.is_failure():
            logger.info(f"SUCCESS: Corrupted file {file_path} correctly failed to open. Message: {result.message}")
        else:
            logger.error(f"FAILURE: Corrupted file {file_path} unexpectedly opened or did not fail correctly. Status: {result.status}, Message: {result.message}")
            all_tests_passed = False

    if all_tests_passed:
        logger.info("\nAll corrupted file opening tests passed successfully!")
    else:
        logger.error("\nSome corrupted file opening tests failed.")

    return all_tests_passed

def run_protected_file_tests():
    logger.info("\n--- Running Protected File Opening Tests ---")

    protected_files = {
        os.path.join(PROTECTED_DIR, "protected_document.pdf"): "testpass",
        os.path.join(PROTECTED_DIR, "protected_document_owner.pdf"): "masterpass",
    }

    all_tests_passed = True

    # Test opening without password
    for file_path, correct_password in protected_files.items():
        logger.info(f"Testing protected file {file_path} without password")
        result = open_file_and_get_status(file_path)
        if result.is_protected():
            logger.info(f"SUCCESS: Protected file {file_path} correctly identified as protected without password. Message: {result.message}")
        else:
            logger.error(f"FAILURE: Protected file {file_path} unexpectedly opened or did not identify as protected without password. Status: {result.status}, Message: {result.message}")
            all_tests_passed = False

    # Test opening with correct password
    for file_path, correct_password in protected_files.items():
        logger.info(f"Testing protected file {file_path} with correct password")
        result = open_file_and_get_status(file_path, password=correct_password)
        if result.is_success():
            logger.info(f"SUCCESS: Protected file {file_path} opened successfully with correct password. Message: {result.message}")
        else:
            logger.error(f"FAILURE: Protected file {file_path} failed to open with correct password. Status: {result.status}, Message: {result.message}")
            all_tests_passed = False

    # Test opening with incorrect password
    for file_path, correct_password in protected_files.items():
        incorrect_password = correct_password + "_wrong"
        logger.info(f"Testing protected file {file_path} with incorrect password")
        result = open_file_and_get_status(file_path, password=incorrect_password)
        if result.is_failure():
            logger.info(f"SUCCESS: Protected file {file_path} correctly failed to open with incorrect password. Message: {result.message}")
        else:
            logger.error(f"FAILURE: Protected file {file_path} unexpectedly opened or did not fail with incorrect password. Status: {result.status}, Message: {result.message}")
            all_tests_passed = False

    if all_tests_passed:
        logger.info("\nAll protected file opening tests passed successfully!")
    else:
        logger.error("\nSome protected file opening tests failed.")

    return all_tests_passed

if __name__ == "__main__":
    all_corrupted_passed = run_corrupted_file_tests()
    all_protected_passed = run_protected_file_tests()

    if all_corrupted_passed and all_protected_passed:
        logger.info("\nAll corrupted and protected file tests passed successfully!")
    else:
        logger.error("\nSome corrupted or protected file tests failed.")


