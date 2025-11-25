# chroma_manager.py
from typing import List, Dict, Callable
import chromadb
from chromadb.config import Settings

class ChromaManager:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb",  
            persist_directory=persist_directory
        ))

    def create_collection(self, name: str):
        try:
            return self.client.get_collection(name)
        except Exception:
            return self.client.create_collection(name)

    def ingest_documents(self, collection_name: str, docs: List[Dict], embedding_fn: Callable[[List[str]], List[List[float]]]):
        col = self.create_collection(collection_name)
        ids = [d["id"] for d in docs]
        metadatas = [d.get("metadata", {}) for d in docs]
        texts = [d["text"] for d in docs]
        embeddings = embedding_fn(texts)

        col.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids,
            embeddings=embeddings
        )

        try:
            self.client.persist()
        except Exception:
            pass
        return len(ids)

    def query(self, collection_name: str, query_text: str, embedding_fn: Callable[[List[str]], List[List[float]]], n_results: int = 5):
        col = self.create_collection(collection_name)
        query_embedding = embedding_fn([query_text])
        res = col.query(
            query_embeddings=query_embedding,
            n_results=n_results,
            include=["documents", "metadatas", "distances"]  # no 'ids'
        )

        hits = []
        for i in range(len(res["documents"][0])):
            hits.append({
                "document": res["documents"][0][i],
                "metadata": res["metadatas"][0][i],
                "distance": res["distances"][0][i]
            })
        return hits
