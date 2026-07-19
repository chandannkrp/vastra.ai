# vastra.ai

Multi-agent fabric commerce platform. Sellers upload raw smartphone photos + basic
info; an agent pipeline cleans images, enriches product data, and publishes polished
listings to a live Shopify (Impulse theme) store.

## Structure

- `backend/` — FastAPI + agent pipeline (Python 3.13, managed with `uv`)
- `frontend/` — React + TypeScript + Tailwind seller/review panel (Vite)

## Setup

1. `cp .env.example .env` and fill in credentials (Anthropic, Gemini, Shopify).

### Backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Serves on http://localhost:8000 — check http://localhost:8000/health.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on http://localhost:5173.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture, data model,
  agent pipeline, environments.
- [`docs/decisions/`](docs/decisions/) — Architecture Decision Records (ADRs).
  Start with the [index](docs/decisions/README.md).

## Roadmap

Module breakdown: **M0** foundation ✓ · **M1** seller panel · **M2** agent
pipeline · **M3** review UI · **M4** WhatsApp intake · **M5** Drape Studio.
See [ARCHITECTURE §8](docs/ARCHITECTURE.md#8-roadmap).
