# vastra.ai

A team of AI agents for fabric sellers. Sellers upload raw smartphone photos +
basic info; the agents clean and **generate** product imagery, write
**customizable** listings, and publish them to a live Shopify (Impulse theme)
store — then keep the store fresh with lookbooks and marketing.

Built for the Indian clothing market (designers & garmenters). Monorepo.

## Structure

- `backend/` — FastAPI + agent pipeline (Python 3.13, managed with `uv`)
- `frontend/` — React 19 + TypeScript + Tailwind v4 (Vite) — landing, auth, dashboards

## Setup

```bash
cp .env.example .env      # backend reads this; set SECRET_KEY, ADMIN_*, API keys
cp frontend/.env.example frontend/.env
```

Fill in `SECRET_KEY` (>= 32 bytes), `ADMIN_PASSWORD`, and the API keys
(`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, Shopify) as you need them. Image
generation defaults to **dry-run** (`DRY_RUN_IMAGES=true`) so nothing hits the
paid API in dev.

### Backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Serves on http://localhost:8000 — check http://localhost:8000/health.
On first start it creates the SQLite DB and seeds the default admin
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Auth smoke test: `uv run python verify_auth.py`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on http://localhost:5173. Log in as the seeded admin, or register a new
seller account.

## Documentation

- [`PLAN.md`](PLAN.md) — what we're building, working style, the agents, status.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture, auth, data
  model, agent pipeline, environments.
- [`docs/decisions/`](docs/decisions/) — Architecture Decision Records (ADRs).

## Status

Foundation + full JWT auth (admin + seller) and a branded, animated frontend are
done and verified end-to-end. Next: product submission + customization UI, the
LangGraph agent pipeline, then the Shopify Admin API integration (the main goal).
See [`PLAN.md`](PLAN.md).
