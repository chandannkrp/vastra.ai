# vastra.ai — Architecture

_Last updated: 2026-07-20_

## 1. What this system is

vastra.ai is a B2B fabric-commerce platform for the Indian clothing market
(designers and garmenters). Sellers submit raw, badly-lit smartphone photos plus
whatever product details they have; a team of AI agents cleans and **generates**
product imagery, writes **customizable** listings, and publishes everything to
the seller's live **Shopify** store — then keeps the store fresh (lookbooks,
marketing copy) over time. The long-term USP is a **Drape Studio** where buyers
preview a fabric as a finished garment.

We build iteratively (build → test → feedback → refine). Current priority:
foundation + auth (done), then product intake + the agent pipeline, then the
Shopify Admin API integration (the main goal).

## 2. High-level architecture

```
  Seller / Admin (React SPA) ──JWT──▶ FastAPI backend
   landing · auth · dashboards        ┌───────────────┐
                                      │ REST API      │
                                      │  /auth  …      │
                                      └──────┬────────┘
                                             │ enqueue()
                                        LangGraph pipeline (StateGraph)
                                             │
              ┌───────────┬──────────────────┼──────────────────┬───────────────┐
              ▼           ▼                  ▼                  ▼               ▼
         Intake       Image agent        Listing agent    Marketing agent   Publisher
        (Claude)   (OpenAI gpt-image-1)   (Claude)          (Claude)     (Shopify GraphQL)
              └───────────┴──────────────────┴──────────────────┴───────────────┘
                                             │
   Reviewer (React) ◀── generated images + draft listing ──┘  approve → publish
                                             │
     Postgres/SQLite · Object storage (local / R2)   Shopify (live Impulse store)
```

## 3. Component breakdown

### Backend (`backend/`, FastAPI · Python 3.13 · uv)

| Path | Responsibility |
|---|---|
| `app/main.py` | App entry, CORS, lifespan (DB init + admin seed), router registration |
| `app/config.py` | Typed settings from `.env` (auth, AI keys, Shopify, storage, DB) |
| `app/db.py` | SQLAlchemy engine, session factory, `init_db()` |
| `app/security.py` | Password hashing (bcrypt) + JWT create/decode |
| `app/seed.py` | Idempotent startup seeding of the default admin |
| `app/models/tables.py` | ORM tables (see §5) |
| `app/schemas/` | Pydantic request/response models (auth, …) |
| `app/api/deps.py` | Shared deps: current user, `require_admin` role guard |
| `app/api/auth.py` | Auth routes: register, login, `/me` |
| `app/agents/` | LangGraph graph + agent nodes (intake, image, listing, marketing, publisher) |
| `app/services/openai_images.py` | OpenAI `gpt-image-1` generate/edit (dev cost caps + dry-run) |
| `app/services/shopify.py` | Shopify Admin **GraphQL** client |
| `app/services/storage.py` | Object storage: local dir (dev) / S3-R2 (prod) |
| `app/workers/queue.py` | `enqueue()` abstraction over BackgroundTasks |

### Frontend (`frontend/`, React 19 · TypeScript · Vite · Tailwind v4)

- **Landing** — branded, animated marketing page explaining the tool and agents
  (Framer Motion, lucide-react icons).
- **Auth** — login + seller registration, split-screen branded shell.
- **Seller dashboard** — product overview and (next) the submission flow.
- **Admin dashboard** — agent fleet status, integrations, access.
- Auth state via a React context (`lib/auth.tsx`); JWT persisted in
  `localStorage` and attached by an axios interceptor (`lib/api.ts`); role-gated
  routes via `ProtectedRoute`.

### External services

- **Anthropic Claude** (`claude-opus-4-8`) — extraction, listing copy, marketing,
  reasoning.
- **OpenAI** (`gpt-image-1`) — clean/relight + **generate** product imagery.
- **Shopify Admin GraphQL API** — product create/update, media, metafields.
- **Object storage** — Cloudflare R2 (S3-compatible) in prod.

## 4. Authentication

- **Password hashing:** bcrypt (`security.py`).
- **Tokens:** JWT (HS256) carrying `sub` (user id) + `role` (`admin`/`seller`),
  7-day expiry. Returned on register/login; the SPA stores it and sends it as a
  `Bearer` token.
- **Roles:** a single `sellers` table with an `is_admin` flag. `get_current_user`
  resolves the token to a user; `require_admin` guards admin-only routes.
- **Seeding:** a default admin is created on first startup from `ADMIN_*` env
  vars (idempotent — skipped if any admin already exists).
- **Flow verified end-to-end:** register → seller role; duplicate email → 409;
  `/me` with/without token → 200/401; wrong password → 401; seeded admin login →
  admin role; protected routes redirect by role.

## 5. Data model

Five tables (`app/models/tables.py`):

- **`sellers`** — account (email, bcrypt hash, `is_admin`). Admins and sellers
  share this table, distinguished by the flag.
- **`submissions`** — one raw intake. Seller-provided fields (all optional except
  images) + `status` + `source_channel` + **customization choices** that steer
  the agents (image set, description tone, audience, length).
- **`images`** — `kind` = `raw` | `enhanced`/generated; links to `parent_image_id`;
  `storage_key`, reviewer `approved`, QC `qc_result`. Original high-res raws are
  retained to feed Drape Studio later.
- **`products`** — one per submission: extraction `attributes` (+confidence),
  listing JSON, `shopify_product_gid`, `shopify_status`.
- **`pipeline_runs`** — audit + resumability: `stage`, `stage_log` JSON, `error`,
  cumulative token counts.

## 6. The agent pipeline (LangGraph)

A LangGraph `StateGraph` orchestrates the agents over a typed state. The graph is
deterministic about **ordering**; the LLMs decide **content**. Each node logs to
`pipeline_runs`; the run is resumable.

1. **Intake / Extraction agent** (Claude vision) — raw images + text → validated
   product profile (fabric, weave, composition, colours, pattern, tags) with
   confidence flags.
2. **Image agent** (OpenAI `gpt-image-1`) — cleans/relights raws and **generates
   a variable set** of product shots (flat-lay, draped, on-model, macro) driven
   by the seller's customization choices. **Never shifts true fabric colour /
   texture.** Saves to storage and, later, the Shopify product's media.
3. **Listing agent** (Claude) — writes the listing (title, description, tags,
   product type, per-meter variants, metafields). **Tone/length/audience are
   customizable** at submission time.
4. **Marketing / lookbook agent** (Claude) — post-publish: lookbooks, marketing
   copy, collection refreshes.
5. **Publisher agent** (Shopify GraphQL) — `productCreate` →
   `stagedUploadsCreate` + `productCreateMedia` → `metafieldsSet` → DRAFT;
   idempotent on the product GID. Reviewer approval flips DRAFT → ACTIVE.

Human-in-the-loop review sits before anything goes live.

## 7. Cross-cutting concerns

- **Cost discipline (dev):** OpenAI images at `quality="low"`, `n=1`, plus a
  `DRY_RUN_IMAGES` flag that returns a local placeholder (zero API spend) so
  UI/agent flows can be exercised free. Claude prompt caching + `effort:"low"`
  for cheap steps. Token/image usage logged per run.
- **Async processing:** `enqueue()` over BackgroundTasks; swappable to a
  dedicated queue later without touching agent code. No Redis in the stack —
  caching (`app/services/cache.py`) is an in-process TTL dict.
- **Idempotency:** publisher keys on the Shopify product GID.
- **Auditability:** every stage writes to `pipeline_runs.stage_log`.

## 8. MCP servers — needed?

**Not for the MVP.** The Shopify Admin GraphQL API is a direct HTTP endpoint;
calling it from the Publisher agent as a LangChain tool is simpler and more
controllable than an MCP layer. Optional later: **Shopify Dev MCP** for schema
exploration during development, and **context7 MCP** (already used here) for
pulling current library docs. Revisit runtime MCP only if we expose vastra's own
capabilities to external agents.

## 9. Environments

| | Dev | Prod (target) |
|---|---|---|
| DB | SQLite file | Postgres (Neon) |
| Storage | local `./storage` | AWS S3 |
| Queue | BackgroundTasks | BackgroundTasks (single instance) |
| Images | dry-run placeholder / `gpt-image-1` low | `gpt-image-1` |
| Backend + ai-service | `uvicorn --reload` | containers on a single EC2 instance (Docker Hub images, GitHub Actions CI/CD) |
| Frontend | Vite dev server | Vercel |

## 10. Status & roadmap

- [x] Backend foundation, DB, storage/shopify service stubs.
- [x] OpenAI image service (dev caps + dry-run).
- [x] JWT auth end-to-end (admin + seller), verified.
- [x] Branded animated frontend: landing, auth, dashboards, JWT persistence.
- [ ] Product submission + customization UI.
- [ ] LangGraph agent pipeline.
- [ ] Shopify Admin API integration (main goal).
- [ ] Drape Studio (future).

## 11. Decisions

Architecturally significant decisions are recorded as ADRs in
[`docs/decisions/`](./decisions/).
