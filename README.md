<div align="center">

# 🤖 **AI Meeting & Contract Assistant**
### *Intelligent Meeting Analysis & Automated Contract Generation*

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&style=for-the-badge)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&style=for-the-badge)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/AI_Engine-Python_3.10-3776AB?logo=python&style=for-the-badge)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&style=for-the-badge)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

</div>

---

## 🚀 **Project Overview**

The **AI Meeting & Contract Assistant** is a unified platform that bridges the gap between **spoken meetings** and **legal documentation**. By leveraging advanced Speech-to-Text (STT) and Large Language Models (LLM), it automatically transforms meeting recordings into structured summaries, actionable tasks, and legally compliant contracts.

> **"Turn your conversations into contracts in seconds."**

---

## ✨ **Key Features**

### 🎙️ **Intelligent Meeting Analysis**
- **Real-time Transcription**: High-accuracy STT engine (Whisper) converts audio to text.
- **Auto-Summarization**: LLMs extract key discussion points, decisions, and action items.
- **Speaker Diarization**: Identifies distinct speakers and assigns roles automatically.

### 📝 **Automated Contract Generation**
- **Context-Aware Drafting**: Generates Service Agreements, NDAs, and more directly from meeting transcripts.
- **Regional Compliance**: Supports legal frameworks for **19+ regions** (USA, UK, EU, Pakistan, India, etc.).
- **Smart Detection**: Automatically detects contract elements (Offer, Consideration, Acceptance) in conversations.

### 🔌 **Google Workspace Integration**
- **One-Click Export**: Push generated contracts directly to **Google Docs**.
- **Calendar Sync**: Automatically sync deadlines and milestones to **Google Calendar**.
- **Sheet Export**: Export structured meeting data (tasks, responsibilities) to **Google Sheets**.

### 🔒 **Security & Privacy**
- **Email Verification**: Secure OTP-based authentication flow.
- **Privacy Controls**: User consent management for AI data usage.
- **Data Protection**: Encryption at rest and secure OAuth 2.0 integrations.

---

## 🏗️ **System Architecture**

```mermaid
graph TD
    %% Client Layer
    subgraph Client [Frontend (React + Vite)]
        UI[User Interface]
        Auth[Auth Manager]
        Editor[Markdown Editor]
        Toast[Notification System]
    end

    %% API Layer
    subgraph Server [Backend (Node.js + Express)]
        API[API Gateway]
        AuthSvc[Auth Service]
        MeetSvc[Meeting Controller]
        ConSvc[Contract Controller]
        GoogleSvc[Google Service]
    end

    %% AI Layer
    subgraph AI [AI Engine (Python + Flask)]
        Whisper[Whisper STT]
        LLM[LLM Interface]
    end

    %% Data Layer
    subgraph Data [Persistence]
        Mongo[(MongoDB)]
        Redis[(Redis Cache)]
    end

    %% External Services
    subgraph External [External APIs]
        GMail[Brevo / SMTP]
        GSuite[Google Workspace APIs]
        OAI[OpenAI / Groq API]
    end

    %% Connections
    UI -->|HTTPS/REST| API
    API --> AuthSvc
    API --> MeetSvc
    API --> ConSvc
    
    MeetSvc -->|Audio Stream| Whisper
    MeetSvc -->|Prompt| LLM
    
    ConSvc -->|JSON/Markdown| GoogleSvc
    GoogleSvc -->|OAuth 2.0| GSuite
    
    AuthSvc -->|SMTP| GMail
    AuthSvc -->|Read/Write| Mongo
    
    MeetSvc --> Mongo
    ConSvc --> Mongo
```

---

## 🛠️ **Tech Stack**

| Component | Technologies |
|-----------|--------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Sonner, Framer Motion |
| **Backend** | Node.js, Express, Mongoose, Passport.js, Brevo (Email) |
| **AI Engine** | Python 3.10, Flask, OpenAI Whisper, Groq/OpenAI APIs |
| **Database** | MongoDB Atlas (NoSQL) |
| **Integrations** | Google Drive, Docs, Sheets, Calendar API |

---

## 🏁 **Getting Started**

### Prerequisites
- Node.js v16+
- Python 3.10+
- MongoDB Instance
- Google Cloud Console Project (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-meeting-assistant.git
   cd ai-meeting-assistant
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env file with DB_URI, CLIENT_URL, GOOGLE_CLIENT_ID etc.
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **AI Engine Setup**
   ```bash
   cd stt
   pip install -r requirements.txt
   python app.py
   ```

---

## 📸 **Gallery**

<div align="center">
  <!-- Placeholders for actual screenshots -->
  <img src="https://via.placeholder.com/800x450/1e293b/ffffff?text=Dashboard+View" alt="Dashboard" width="45%" />
  <img src="https://via.placeholder.com/800x450/1e293b/ffffff?text=Contract+Editor" alt="Editor" width="45%" />
</div>

---

<div align="center">
  <p>Made with ❤️ by the <b>Abdullah Mansoor</b></p>
</div>
