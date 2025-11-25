import re

class TextPreprocessor:
    def __init__(self):
        pass

    def clean_text(self, text: str) -> str:
        """
        Simple text cleaning:
        - Lowercase
        - Remove extra spaces
        - Remove non-alphanumeric characters (keep basic punctuation)
        """
        text = text.lower()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^a-z0-9.,;:!?()\- ]+', '', text)
        return text.strip()
