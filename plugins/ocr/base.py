from abc import ABC, abstractmethod

class BaseOCRPlugin(ABC):
    """Base abstract class for OCR plugins. 
    All OCR plugins must inherit from this class and implement the process_image method.
    """
    def __init__(self):
        """Initializes the BaseOCRPlugin. """
        pass

    @abstractmethod
    def process_image(self, image_path: str) -> str:
        """Processes an image to extract text.

        Args:
            image_path (str): The path to the image file.

        Returns:
            str: The extracted text from the image.
        """
        pass


