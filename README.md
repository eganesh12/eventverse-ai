# EventVerse AI 🎉

**Intelligent Event Planning & Management Platform**

An AI-powered, full-stack event planning platform built with Next.js, FastAPI, PostgreSQL, and a multi-agent LangGraph AI architecture.

---

## Features

- **Multi-Agent AI Planning** — 10 specialized AI agents for understanding, planning, budgeting, timelines, vendor discovery, guests, creative concepts, risk management, monitoring, and reporting
- **Smart Budget Intelligence** — Deterministic calculations + AI recommendations. Natural language budget updates
- **Vendor Marketplace** — Discover, compare, and book verified local vendors
- **Guest Management** — CSV import, RSVPs, dietary preferences, seating, QR invitations
- **AI Creative Studio** — Themes, invitation copy, color palettes, social captions
- **India-First** — INR, multiple Indian languages, Indian wedding functions, GST-aware invoicing
- **Real-time Collaboration** — Shared tasks, comments, approvals, notifications

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | Python FastAPI, Pydantic, SQLAlchemy |
| Database | PostgreSQL (Supabase), pgvector |
| Cache | Redis |
| AI | OpenAI GPT-4o / Gemini 1.5, LangGraph |
| Auth | JWT + Google OAuth |
| Deploy | Vercel (frontend), Render/Railway (backend) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
uvicorn app.main:app --reload
```

### Database Setup

```bash
# Run against your PostgreSQL instance
psql -U postgres -d eventverse -f migrations/001_initial_schema.sql
psql -U postgres -d eventverse -f migrations/002_seed_demo_data.sql
```

---

## Environment Variables

See [backend/.env.example](backend/.env.example) for all required variables.

**Required:**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET_KEY` — Long random secret

**For AI features:**
- `OPENAI_API_KEY` — OpenAI API key (or `GEMINI_API_KEY`)

**Optional:**
- `REDIS_URL` — For caching (falls back to in-memory)
- `SUPABASE_URL` — For managed storage

---

## Demo Account

After running seed data:
- **Email:** demo@eventverse.ai
- **Password:** Demo@1234

---

## API Documentation

With backend running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm run test
```

---

## Project Structure

```
eventverse-ai/
├── frontend/                    # Next.js application
│   └── src/
│       ├── app/                 # App router pages
│       │   ├── (auth)/          # Login, register
│       │   └── (dashboard)/     # Protected dashboard
│       ├── components/          # Reusable components
│       ├── lib/                 # API client, utilities
│       └── contexts/            # React context providers
│
├── backend/                     # FastAPI application
│   └── app/
│       ├── api/v1/endpoints/    # REST API routes
│       ├── core/                # Config, security
│       ├── db/                  # SQLAlchemy engine
│       ├── models/              # ORM models
│       ├── schemas/             # Pydantic schemas
│       └── services/            # Business logic + AI
│
├── migrations/                  # SQL migrations
└── docs/                        # Architecture diagrams
```

---

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Render / Railway)

Set environment variables in your hosting dashboard, then:

```
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Database (Supabase)

1. Create a new Supabase project
2. Run migration SQL in the Supabase SQL editor
3. Copy the connection string to `DATABASE_URL`

---

## Security Notes

- Never commit `.env` files
- JWT tokens expire in 60 minutes by default
- All guest data is isolated per event and user
- AI-generated budget estimates are clearly labeled — never treated as confirmed quotes
- Vendor details are only fabricated in demo mode

---

## License

MIT — See [LICENSE](LICENSE) for details.

---

Built with ❤️ for extraordinary events.
