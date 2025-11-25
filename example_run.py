from dotenv import load_dotenv
import os
load_dotenv()

from pubmed import PubMedRetriever
from chroma_manager import ChromaManager
from embeddings import EmbeddingModel, TextPreprocessor
from rag import RAGPipeline


SEARCH_TERM = "intermittent fasting obesity OR type 2 diabetes OR metabolic disorder"
MAX_RESULTS = 30
COLLECTION_NAME = "if_pubmed"

# STEP 1: SEARCH PUBMED

print("\n=== STEP 1: Searching PubMed ===")
pmids = PubMedRetriever.search_pubmed_articles(SEARCH_TERM, max_results=MAX_RESULTS)
print(f"Found {len(pmids)} PMIDs")

# STEP 2: FETCH ARTICLES

print("\n=== STEP 2: Fetching Articles ===")
articles = PubMedRetriever.fetch_pubmed_abstracts(pmids)
print(f"Fetched {len(articles)} articles.")


# STEP 3: LOAD PREPROCESSOR + EMBEDDINGS

print("\n=== STEP 3: Loading Embedding Model + Preprocessor ===")
preprocessor = TextPreprocessor()
embedding_model = EmbeddingModel()


# STEP 4: INIT CHROMA

print("\n=== STEP 4: Initializing Chroma DB ===")
chroma = ChromaManager(persist_directory="./chroma_db")


# STEP 5: PREP + INGEST

print("\n=== STEP 5: Ingesting Articles into Vector Store ===")

documents = []
for article in articles:
    if isinstance(article["abstract"], dict):
        abstract_text = " ".join(article["abstract"].values())
    else:
        abstract_text = str(article["abstract"])

    cleaned_text = preprocessor.clean_text(article["title"] + " " + abstract_text)

    documents.append({
        "id": article["pmid"],
        "text": cleaned_text,
        "metadata": {
            "title": article["title"],
            "journal": article["journal"],
            "authors": article["authors"],
            "date": article["publication_date"]
        }
    })

count = chroma.ingest_documents(
    collection_name=COLLECTION_NAME,
    docs=documents,
    embedding_fn=embedding_model.embed_text
)

print(f"Ingested {count} articles into ChromaDB collection '{COLLECTION_NAME}'.")


# STEP 6: RAG PIPELINE

print("\n=== STEP 6: Running RAG Query ===")

rag = RAGPipeline(
    persist_dir="./chroma_db",
    collection_name=COLLECTION_NAME
)

question = input("\nEnter your medical question: ")

generated_answer, retrieved_docs = rag.answer_query(question)

print("\n\n=== FINAL ANSWER ===\n")
print(generated_answer)

print("\n\n=== DOCUMENTS USED AS CONTEXT ===\n")
for doc in retrieved_docs:
    print(f"- PMID: {doc['id']} | Title: {doc['metadata']['title']}")
