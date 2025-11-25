from typing import List
from chroma_manager import ChromaManager
from embeddings import EmbeddingModel
from groq_client import generate

import textwrap

class RAGPipeline:
    def __init__(self, persist_dir: str = "./chroma_db", collection_name: str = "pubmed_articles"):
        self.chroma = ChromaManager(persist_dir)
        self.collection = collection_name
        self.embedder = EmbeddingModel()

    def _embed_fn(self, texts):
        return self.embedder.embed_text(texts)

    def query_store(self, query: str, k: int = 5):
        hits = self.chroma.query(self.collection, query, embedding_fn=self._embed_fn, n_results=k)
        return hits

    def build_prompt(self, docs: List[dict], user_query: str) -> str:
        ctx_pieces = []
        for i, d in enumerate(docs, start=1):
            meta = d.get("metadata", {})
            title = meta.get("title", "No title")
            pmid = meta.get("pmid", d.get("id", "Unknown PMIDs"))
            journal = meta.get("journal", "")
            date = meta.get("date", "")
            snippet = d.get("document", "")
            piece = f"Doc {i} | PMID: {pmid} | {title} | {journal} | {date}\n{snippet}\n"
            ctx_pieces.append(piece)

        context = "\n---\n".join(ctx_pieces)
        prompt = textwrap.dedent(f"""
        You are a knowledgeable medical-data assistant. Use ONLY the information provided in the CONTEXT to answer the user's QUERY.

        CONTEXT:
        {context}

        QUERY:
        {user_query}

        INSTRUCTIONS:
        * Provide a short answer (2-6 sentences) summarizing the findings from the context.
        * Cite the Doc number and PMID for factual claims.
        * If evidence is contradictory, mention both sides and say evidence is mixed.
        * Add a "Confidence" line: High / Medium / Low.

        Begin:
        """).strip()
        return prompt

    def answer_query(self, user_query: str, k: int = 5):
        hits = self.query_store(user_query, k=k)
        prompt = self.build_prompt(hits, user_query)
        response_text = generate(prompt)
        return response_text, hits
