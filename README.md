# Medi Assist AI

A web-based AI-powered chat application that answers medical questions related to **intermittent fasting, obesity, type 2 diabetes, and metabolic disorders** using a **Retrieval-Augmented Generation (RAG)** pipeline. The app fetches relevant research articles from **PubMed**, stores them in **ChromaDB**, and uses **Groq Llama 3** to generate responses.

---

## **Features**

- Search and fetch PubMed articles automatically for a given topic.
- Store and manage documents in a vector database (**ChromaDB**) with embeddings.
- Query the vector store and provide AI-generated answers using the **RAG pipeline**.
- Sidebar to manage multiple chat sessions.
- Streaming AI responses for a real-time chat experience.

---

## **Tech Stack**

### Backend

- **Python 3.11+**
- **FastAPI** – web framework for API and frontend serving
- **Uvicorn** – ASGI server
- **ChromaDB** – vector database for storing embeddings
- **Sentence-Transformers** – text embeddings
- **Requests** – for PubMed API calls
- **dotenv** – environment variable management
- **Groq Llama 3 API** – LLM for generating responses

### Frontend

- **HTML / JS / Tailwind CSS**
- **Marked.js** – Markdown rendering in chat bubbles
- **LocalStorage** – persistent chat history on browser
- **Responsive design** – mobile-friendly chat interface



