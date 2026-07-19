# vastra.ai — Architecture

_Last updated: 2026-07-19_

## 1. What this system is

vastra.ai is a B2B fabric-commerce platform for the Indian clothing market
(designers and garmenters buying fabrics). The differentiating feature is a
future **Fabric Studio** ("Drape Studio") where buyers preview a fabric as a
finished garment.

This document describes the **MVP**: a seller onboarding pipeline. Sellers submit
raw, badly-lit smartphone photos plus whatever product details they have; a
multi-agent pipeline cleans the images, extracts and enriches the product data,
and publishes a polished listing to an existing live **Shopify** store (Impulse
theme) via the Admin API. A human reviews before anything goes live.

## 2. High-level architecture

```
                            ┌──────────────────────────────────────────┐
  Seller (React webapp) ───▶│  FastAPI backend                         │
   multi-image upload       │  ┌────────────┐   ┌─────────────────┐    │
   + partial product info   │  │ REST API   │──▶│ enqueue() queue │    │
                            │  └────────────┘   └────────┬────────┘    │
                            │        │                   │             │
                            │   Postgres/SQLite    Agent Pipeline      │
                            │   Object storage    (state machine)      │
                            │   (local / R2)            │              │
                            └───────────────────────────┼──────────────┘
                                                        │
                    ┌───────────────────┬───────────────┼───────────────┐
                    ▼                   ▼               ▼               ▼
             Extraction Agent    Enhancement Agent   QC Agent    Listing Agent
              (Claude vision)    (Gemini image edit) (Claude)     (Claude)
                    │                   │               │               │
                    └───────────────────┴───────┬───────┴───────────────┘
                                                ▼
                                        Publisher Agent
                                    (Shopify Admin GraphQL)
                                                │
  Reviewer (React) ◀── raw vs. cleaned images, draft listing ──┘
        │ approve / reject
        ▼
   Shopify product: DRAFT ──approve──▶ ACTIVE (live on Impulse storefront)
```

**Two front doors, one pipeline.** The webapp is the MVP intake channel. WhatsApp
(phase 2) will feed the *same* `submissions` pipeline — the channel is only an
adapter that produces a submission row.

## 3. Component breakdown

### Backend (`backend/`, FastAPI · Python 3.13 · uv)

| Path | Responsibility |
|---|---|
| `app/main.py` | FastAPI app, CORS, DB init on startup, `/health` |
| `app/config.py` | Typed settings from `.env` (AI keys, Shopify, storage, DB) |
| `app/db.py` | SQLAlchemy engine, session factory, `init_db()` |
| `app/models/tables.py` | ORM tables (see §4) |
| `app/api/` | REST routes: auth, uploads, submissions, review, publish |
| `app/agents/` | One module per agent + the orchestrator state machine |
| `app/services/shopify.py` | Shopify Admin **GraphQL** client |
| `app/services/gemini_images.py` | Gemini image-editing (photo cleanup) |
| `app/services/storage.py` | Object storage: local dir (dev) / S3-R2 (prod) |
| `app/workers/queue.py` | `enqueue()` abstraction over BackgroundTasks |

### Frontend (`frontend/`, React · TypeScript · Tailwind v4 · Vite)

- Seller panel: submission form + multi-image upload.
- Review UI: raw vs. cleaned image comparison, editable extracted fields and
  generated copy, per-field confidence flags, approve/reject.
- Dashboard: submissions by status; per-run agent logs for debugging.

### External services

- **Anthropic Claude** (`claude-opus-4-8`) — vision extraction, QC, listing copy.
- **Google Gemini** (image-out model) — photo relight/background/cleanup.
- **Shopify Admin GraphQL API** — product create/update, media, metafields.
- **Object storage** — Cloudflare R2 (S3-compatible) in prod.

## 4. Data model

Five tables (`app/models/tables.py`):

- **`sellers`** — account (email, password hash, admin flag).
- **`submissions`** — one raw intake. Holds seller-provided fields (all optional
  except images) and a `status` enum: `pending → processing → awaiting_review →
  approved → published` (plus `failed` / `rejected`). Carries `source_channel`
  (`webapp` | `whatsapp`).
- **`images`** — `kind` = `raw` | `enhanced`; enhanced rows link back to their
  `parent_image_id`; store `storage_key`, reviewer `approved` flag, and the QC
  agent's `qc_result` JSON. Original high-res raws are retained to feed Drape
  Studio later.
- **`products`** — one per submission. Holds the extraction agent's `attributes`
  (with per-field confidence), the listing agent's `listing` JSON, and the
  `shopify_product_gid` + `shopify_status`.
- **`pipeline_runs`** — audit + resumability. `stage` enum, a `stage_log` JSON
  array (timing, ok/fail, usage per stage), `error`, and cumulative token
  counts.

## 5. The agent pipeline

Orchestrated as a **deterministic state machine** over `pipeline_runs.stage`, not
an LLM deciding control flow. Claude is used *inside* stages. Stages are
resumable and individually logged.

```
extracting → enhancing → qc → drafting → awaiting_review → publishing → published
                  ▲────────┘ (retry ≤2 on color/texture drift)          └▶ failed
```

1. **Extraction Agent** (Claude vision) — raw images + seller text → Pydantic-
   validated attribute schema via `client.messages.parse()`, with per-field
   confidence and flags for fields needing seller confirmation.
2. **Enhancement Agent** (Gemini) — per image: clean background, fix lighting/
   white balance. **Hard constraint: never shift the fabric's true hue,
   saturation, pattern, or texture** — buyers purchase on color fidelity.
3. **QC Agent** (Claude vision) — compares raw vs. enhanced pairs; rejects colour/
   pattern drift and retries enhancement with adjusted instructions (≤2 retries,
   then keep best + flag for human).
4. **Listing Agent** (Claude) — Shopify-ready SEO title, Impulse-compatible HTML
   description, tags, product type, per-meter variant structure, metafields (GSM,
   width, composition, care).
5. **Publisher Agent** (deterministic Python + Shopify GraphQL) — `productCreate`
   → `stagedUploadsCreate` + `productCreateMedia` → `metafieldsSet` → status
   **DRAFT**. Idempotent via the stored product GID (re-runs update, never
   duplicate). Reviewer approval flips DRAFT → ACTIVE.

## 6. Cross-cutting concerns

- **Async processing** — MVP uses FastAPI `BackgroundTasks` behind `enqueue()`;
  swappable to arq/Redis without touching agent code.
- **Cost control** — prompt caching (`cache_control` on stable system prompts,
  high reuse across per-image runs); `effort: "low"` for cheap QC/classification;
  token usage recorded per run in `pipeline_runs`.
- **Idempotency** — publisher keys on the Shopify product GID.
- **Auditability** — every stage writes to `pipeline_runs.stage_log`.
- **Human in the loop** — nothing goes ACTIVE without reviewer approval.

## 7. Environments

| | Dev | Prod (target) |
|---|---|---|
| DB | SQLite file | Postgres |
| Storage | local `./storage` | Cloudflare R2 |
| Queue | BackgroundTasks | arq + Redis |
| Backend | `uvicorn --reload` | Railway / Fly / container |
| Frontend | Vite dev server | Static host (Vercel/Netlify) |

## 8. Roadmap

- **M0** Foundation ✓
- **M1** Seller panel (auth + upload → submission)
- **M2** Agent pipeline (extraction → enhancement → QC → listing → publisher)
- **M3** Review & publish UI
- **M4** WhatsApp intake (Gupshup/Twilio BSP)
- **M5** Drape Studio (fabric → garment visualization)

## 9. Decisions

Architecturally significant decisions are recorded as ADRs in
[`docs/decisions/`](./decisions/). Start with the
[ADR index](./decisions/README.md).
