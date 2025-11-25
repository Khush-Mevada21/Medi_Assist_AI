from sentence_transformers import SentenceTransformer

class EmbeddingModel:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the sentence-transformers model.
        """
        self.model = SentenceTransformer(model_name)

    def embed_text(self, texts):
        """
        Generate embeddings for a single text or a list of texts.
        """
        if isinstance(texts, str):
            texts = [texts]
        embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return embeddings.tolist()  # list of lists
