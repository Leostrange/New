class OcrPlugin:
    def recognize(self, image_path: str, lang: str) -> str:
        raise NotImplementedError("Каждый плагин должен реализовать метод recognize.")

