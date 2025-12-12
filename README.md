# AI Meeting & Contract Assistant

Full-stack system that turns meeting audio (uploads or browser-streamed chunks) into structured meeting artifacts (summary, actors, responsibilities, deadlines) and can draft contracts enhanced with clause retrieval (RAG).

**Repository:** `https://github.com/i228808/MinutesOfMeeting`

## What’s in this repo

- **Frontend**: `frontend/` (React + Vite)
- **Backend**: `backend/` (Node.js + Express + MongoDB/Mongoose, JWT auth, cron jobs, Socket.IO)
- **Utility server**: `utilities/` (Python/Flask; Whisper STT + Weaviate RAG + ingestion)
- **CI**: `.github/workflows/ci.yml` (runs unit tests + coverage on push/PR)

## Architecture (high level)

- Frontend (React/Vite) calls backend REST API.
- Chrome extension streams audio chunks to backend streaming endpoints.
- Backend calls the Python utility server for STT and RAG retrieval.
- MongoDB stores users/meetings/contracts/reminders; Weaviate stores embedded clause chunks.

The report includes the full diagram: `systemarchitecture.png`.

## Ports

- **Frontend**: `5173`
- **Backend**: `5000`
- **Utility server**: `5001`
- **MongoDB**: `27017`
- **Weaviate**: `8081` (HTTP), `50052` (gRPC)

## Quickstart (local dev)

### 1) Start MongoDB + Weaviate (Docker)

```bash
docker compose up -d mongo weaviate
```

### 2) Utility server (Python)

```bash
cd utilities
python -m venv .venv
# Windows:
#   .venv\Scripts\activate
# macOS/Linux:
#   source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 3) Backend (Node)

```bash
cd backend
npm install
# add backend/.env (see Environment Variables section below)
npm run dev
```

### 4) Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev
```

## Testing (mandatory)

### Backend (Jest)

```bash
cd backend
npm test -- --coverage
```

### Frontend (Vitest)

```bash
cd frontend
npm run test:run -- --coverage
```

### Utilities (pytest)

```bash
cd utilities
python -m pytest --cov --cov-report=term-missing
```

## CI (GitHub Actions)

Automated tests run on every push/PR via `.github/workflows/ci.yml`:
- backend: `npm test -- --coverage`
- frontend: `npm run test:run -- --coverage`
- utilities: `pytest --cov`

## Environment variables (backend)

Create `backend/.env` (names inferred from code). Common required keys:

- `MONGODB_URI`
- `JWT_SECRET`
- `OPENROUTER_API_KEY`
- `CLIENT_URL`
- `SESSION_SECRET`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Email: `BREVO_API_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, plus plan IDs (`STRIPE_PRICE_*` or `STRIPE_PRODUCT_*`)

## Common issues

- **Compose env var mismatch**: backend code expects `MONGODB_URI`; ensure your env sets that exact key.
- **Utility server URL**: some service-to-service URLs may assume `http://localhost:5001` when running outside Compose.

## Notes

- `frontend/README.md` is the default Vite template README (not the project documentation).
