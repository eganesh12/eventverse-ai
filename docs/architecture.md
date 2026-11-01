# EventVerse AI – System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USERS (Browser / PWA)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│              FRONTEND  (Next.js 15 · Vercel)                 │
│  Landing · Dashboard · Events · AI Chat · Vendors · Guests   │
│  TanStack Query · Framer Motion · Recharts · Tailwind CSS    │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│            BACKEND  (FastAPI · Render / Railway)             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               API Layer (v1 Router)                   │   │
│  │  /auth  /events  /ai  /vendors  /guests  /budget      │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │           Multi-Agent AI Orchestrator                  │   │
│  │                                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │ Understanding│  │   Planning   │  │  Budget    │  │   │
│  │  │   Agent (1)  │  │   Agent (2)  │  │ Agent (3)  │  │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │  Timeline    │  │   Vendor     │  │   Guest    │  │   │
│  │  │  Agent (4)   │  │  Agent (5)   │  │ Agent (6)  │  │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │  Creative    │  │    Risk      │  │ Monitoring │  │   │
│  │  │  Agent (7)   │  │  Agent (8)   │  │ Agent (9)  │  │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │   │
│  │  ┌──────────────┐                                     │   │
│  │  │  Reporting   │   Orchestrated via LangGraph        │   │
│  │  │  Agent (10)  │                                     │   │
│  │  └──────────────┘                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              LLM Provider Abstraction                  │   │
│  │         OpenAI GPT-4o  ←→  Google Gemini 1.5         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼───┐ ┌──────▼──────┐
│  PostgreSQL  │ │ Redis  │ │  Storage    │
│  (Supabase)  │ │ Cache  │ │ (S3/Supa.)  │
│  pgvector    │ │        │ │             │
└──────────────┘ └────────┘ └─────────────┘
```

## Request Flow

```
User Input (Natural Language)
       │
       ▼
Frontend Chat UI
       │  POST /api/v1/ai/chat
       ▼
FastAPI Auth Middleware (JWT validation)
       │
       ▼
AI Chat Endpoint
       │
       ▼
Event Understanding Agent
  - Parse intent
  - Extract event details
  - Identify missing fields
       │
       ▼
Event Orchestrator
  ├── Budget Agent (deterministic math)
  ├── Timeline Agent (date calculations)
  ├── Planning Agent (LLM creative)
  ├── Creative Agent (themes, colors)
  └── Risk Agent (contingency planning)
       │
       ▼
Structured JSON Response
       │
       ▼
PostgreSQL (persist plan with version number)
       │
       ▼
Frontend Dashboard (render plan sections)
```

## Budget Calculation Architecture

```
┌─────────────────────────────────────────────────┐
│             Budget Intelligence Agent            │
│                                                  │
│  LLM Role: Explain changes, suggest categories  │
│  Code Role: All arithmetic (NEVER use LLM math) │
│                                                  │
│  total_budget → category_percentages[]           │
│       │                                          │
│       ▼ (deterministic Python)                   │
│  allocated_amounts[] = budget × percentage / 100 │
│       │                                          │
│       ▼                                          │
│  remaining = total_budget - sum(expenses)        │
│  utilization = spent / total × 100               │
└─────────────────────────────────────────────────┘
```

## Database Schema Overview

```
users ──────────────── events ──── event_tasks
  │                      │
  └── user_profiles       ├── budgets ── expenses
                          │
                          ├── guests
                          │
                          ├── vendor_quotes ── vendors
                          │                      └── vendor_services
                          │
                          └── ai_generated_plans
                                   │
                                   └── ai_conversations ── ai_messages
```

## Security Layers

1. **Transport**: HTTPS everywhere, HSTS headers
2. **Auth**: JWT (HS256, 60min expiry) + refresh tokens
3. **Authorization**: Row-level — users can only access their own events
4. **Input**: Pydantic validation on all endpoints, Zod on frontend
5. **AI Safety**: Structured JSON output enforced; no free-form SQL from LLM
6. **Secrets**: Environment variables only, never in code
7. **Audit**: All sensitive changes logged to `audit_logs` table
8. **Data isolation**: Guest PII never exposed to vendors
