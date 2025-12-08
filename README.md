<div align="center">

# 🤖 **AI Meeting & Contract Assistant**
### *Intelligent Meeting Analysis & Automated Contract Generation*

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&style=for-the-badge)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&style=for-the-badge)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/AI_Engine-Python_3.10-3776AB?logo=python&style=for-the-badge)](https://python.org/)
[![Weaviate](https://img.shields.io/badge/Vector_DB-Weaviate-green?logo=weaviate&style=for-the-badge)](https://weaviate.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-rag-pipeline">RAG Pipeline</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

</div>

---

## 🚀 **Project Overview**

The **AI Meeting & Contract Assistant** is a unified platform that bridges the gap between **spoken meetings** and **legal documentation**. By leveraging advanced Speech-to-Text (STT) and Large Language Models (LLM), it automatically transforms meeting recordings into structured summaries, actionable tasks, and legally compliant contracts.

It features a **Local RAG (Retrieval Augmented Generation)** system running on Weaviate to ensure contracts are drafted using relevant legal clauses, enhancing accuracy and compliance.

> **"Turn your conversations into contracts in seconds."**

---

## ✨ **Key Features**

### 🎙️ **Intelligent Meeting Analysis**
- **Real-time Transcription**: Local Whisper model (running on Flask Utility Server) for high-accuracy STT.
- **Auto-Summarization**: LLMs extract key discussion points, decisions, and action items.
- **Speaker Diarization**: Identifies distinct speakers and assigns roles automatically.

### 📝 **Automated Contract Generation (RAG Enhanced)**
- **Context-Aware Drafting**: Uses RAG to retrieve relevant clauses from a vector database based on meeting context.
- **Hierarchical Chunking**: Smart parsing of contracts into Clauses and Sections for precise retrieval.
- **Continuous Learning**: Users can opt-in to contribute their contracts for training; a weekly cron job processes new contracts into the vector store.
- **Regional Compliance**: Initial database populated with standard agreements (NDAs, Service Agreements).

### 🔌 **Google Workspace Integration**
- **One-Click Export**: Push generated contracts directly to **Google Docs**.
- **Calendar Sync**: Automatically sync deadlines and milestones to **Google Calendar**.
- **Sheet Export**: Export structured meeting data (tasks, responsibilities) to **Google Sheets**.

### 🔒 **Security & Privacy**
- **Email Verification**: Secure OTP-based authentication flow.
- **Privacy Controls**: Granular user consent for AI data usage.
- **Data Protection**: Encryption at rest and secure OAuth 2.0 integrations.

---

## 🏗️ **System Architecture**

```mermaid
graph TD
    %% Client Layer
    subgraph Client ["Frontend (React + Vite)"]
        UI[User Interface]
        Auth[Auth Manager]
        Editor[Markdown Editor]
    end

    %% API Layer
    subgraph Server ["Backend (Node.js + Express)"]
        API[API Gateway]
        AuthSvc[Auth Service]
        MeetSvc[Meeting Controller]
        ConSvc[Contract Controller]
        Cron[Weekly RAG Cron]
    end

    %% Utility & AI Layer (Python)
    subgraph Utility ["Utility Server (Python/Flask)"]
        Whisper[Whisper STT]
        Clean[Text Cleaner]
        Chunk[Hierarchical Chunker]
        Embed[SentenceTransformer (CUDA)]
    end

    %% Data Layer
    subgraph Database [Persistence]
        Mongo[(MongoDB)]
        Weaviate[(Weaviate Vector DB)]
    end

    %% External
    subgraph External ["External APIs"]
        LLM[OpenRouter / OpenAI]
        GSuite[Google Workspace]
    end

    %% Connections
    UI -->|REST| API
    API --> AuthSvc
    API --> MeetSvc
    API --> ConSvc
    
    %% RAG Flow
    ConSvc -->|Query| Utility
    Utility -->|Search| Weaviate
    ConSvc -->|Prompt + Context| LLM
    
    %% Continuous Learning Flow
    Cron -->|Fetch Contracts| Mongo
    Cron -->|Batch Process| Utility
    Utility -->|Embed & Store| Weaviate
    
    %% STT Flow
    MeetSvc -->|Audio| Utility
    Utility -->|Transcription| Whisper
```

---

## 🧠 **RAG Pipeline (Retrieval Augmented Generation)**

The project uses a sophisticated local RAG pipeline to enhance contact generation:

1.  **Ingestion**: Contracts are loaded via the `/process_contracts` endpoint.
2.  **Cleaning & Parsing**: `pypdfium2` extracts text, and regex-based parsers split contracts into **Sections** and **Clauses**.
3.  **Hierarchical Chunking**:
    *   **Level 1 (Clause)**: Small, precise chunks (e.g., "Indemnification Clause").
    *   **Level 2 (Section)**: Broader context (e.g., "Termination Section").
    *   **Level 3 (Fallback)**: Semantic sliding windows.
4.  **Embedding**: Uses local `sentence-transformers/all-MiniLM-L6-v2` (GPU Accelerated) to generate vector embeddings.
5.  **Storage**: Vectors are stored in a local **Weaviate** instance (Dockerized).
6.  **Retrieval**: The backend queries Weaviate for similar clauses when drafting a new contract.

---

## 🛠️ **Tech Stack**

| Component | Technologies |
|-----------|--------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Sonner, Framer Motion |
| **Backend** | Node.js, Express, Mongoose, Passport.js, node-cron |
| **Utility Server** | Python 3.10, Flask, PyTorch (CUDA), SentenceTransformers, Tiktoken |
| **Vector DB** | Weaviate (Docker), Port 8081/50052 |
| **Database** | MongoDB Atlas (NoSQL) |
| **Integrations** | Google Drive, Docs, Sheets, Calendar API |

---

## 🏁 **Getting Started**

### Prerequisites
- Node.js v16+
- Python 3.10+ (with CUDA support recommended)
- Docker Desktop (for Weaviate)
- MongoDB Connection String
- OpenRouter/OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-meeting-assistant.git
   cd ai-meeting-assistant
   ```

2. **Start Vector Database (Weaviate)**
   ```bash
   docker-compose up -d
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env with DB_URI, OPENROUTER_API_KEY, etc.
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Utility Server (AI Engine) Setup**
   ```bash
   cd utilities
   python -m venv .venv
   # Activate venv (Windows: .venv\Scripts\activate, Linux/Mac: source .venv/bin/activate)
   pip install -r requirements.txt
   python app.py
   ```
   *Note: Ensure `app.py` is running on port 5001.*

---

## 📸 **Gallery**

<div align="center">
  <img src="https://via.placeholder.com/800x450/1e293b/ffffff?text=Dashboard+View" alt="Dashboard" width="45%" />
  <img src="https://via.placeholder.com/800x450/1e293b/ffffff?text=Contract+Editor" alt="Editor" width="45%" />
</div>

---

<div align="center">
  <p>Made with ❤️ by <b>Abdullah Mansoor</b></p>
</div>
