from abc import ABC, abstractmethod

class BaseOCRPlugin(ABC):
    @abstractmethod
    def process_image(self, image_path: str) -> str:
        pass


