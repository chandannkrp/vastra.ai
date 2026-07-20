# Vastra.ai — Multi-Agent Fabric Commerce Platform

> System design and rationale: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
> [`docs/decisions/`](docs/decisions/).

## What we're building

**vastra.ai** is a B2B fabric-commerce tool for the Indian clothing market
(designers and garmenters). Sellers submit raw, badly-lit smartphone photos plus
product details; a team of AI agents cleans and generates product imagery, writes
customizable listings, and publishes everything to the seller's live **Shopify**
store — then keeps the store fresh (lookbooks, marketing copy) over time. The
long-term USP is a **Drape Studio** where buyers preview a fabric as a finished
garment.

## Working style — iterative, not phased

We build → test → gather feedback → refine, in thin end-to-end slices. No fixed
module gates. Current priority order:

1. **Foundation + Auth (now):** branded frontend, backend, and a complete JWT
   auth workflow for **admin** and **seller** panels, working end-to-end.
2. **Product intake + agent pipeline:** seller submits a product with
   customization choices → agents process it.
3. **Shopify Admin API integration (the main goal):** agents publish products,
   images, and marketing content to the live store.

We test after each slice before moving on.

## Stack

| Layer | Choice |
|---|---|
| Backend | Python 3.13 · FastAPI · `uv` |
| Frontend | React · TypeScript · Vite · Tailwind · Framer Motion · lucide-react |
| Auth | JWT (access token in the client, role-based: `admin` / `seller`) |
| DB | SQLite (dev) → Postgres (prod), via SQLAlchemy |
| Object storage | Local dir (dev) → Cloudflare R2 / S3 (prod) |
| Image generation | **OpenAI `gpt-image-1`** — cost-capped in dev (see below) |
| LLM reasoning / copy | Claude (`claude-opus-4-8`) |
| Agent orchestration | **LangGraph** (stateful graph) + **LangChain** (model/tool glue) |
| Commerce | Shopify Admin **GraphQL** API (custom-app token, existing Impulse store) |

### Cost discipline in dev/testing
- OpenAI images: `quality="low"`, `size="1024x1024"`, `n=1`, and a hard
  per-run/per-day cap. A `DRY_RUN_IMAGES` flag returns a placeholder instead of
  calling the API so UI/agent flows can be tested for free.
- Claude: prompt caching on stable system prompts; `effort:"low"` for cheap
  classification/QC steps; token usage logged per run.

## The agents (LangGraph nodes)

A LangGraph `StateGraph` orchestrates specialized agents. Each is a node with a
typed state; the graph is deterministic about *ordering*, LLMs decide *content*.

1. **Intake / Extraction agent** — reads the submitted photos + seller text,
   produces a structured, validated product profile (fabric type, weave,
   composition, colors, pattern, suggested tags), flags low-confidence fields.
2. **Image agent (clean + generate)** — cleans/relights the raw photos and
   **generates additional product images** (OpenAI `gpt-image-1`). The generated
   set is **not fixed** — it varies per product and per the seller's
   customization choices (e.g. flat-lay, draped, on-model style, close-up
   weave). Preserves true fabric color/texture. Saves outputs to storage and,
   later, to the same Shopify product's media/collection.
3. **Listing agent** — writes the Shopify listing (title, description, tags,
   product type, per-meter variants, metafields). **Description and style are
   customizable at submission time** — the seller picks from a range of presets
   (tone, length, audience) that steer this agent.
4. **Marketing / lookbook agent** — post-publish, updates lookbooks, writes
   marketing copy, refreshes collections and product content over time.
5. **Publisher (Shopify) agent** — the tool-executing agent that performs the
   actual Shopify Admin GraphQL writes (product create/update, staged media
   upload, metafields), idempotent on the stored product GID.

Human-in-the-loop review sits before anything goes live.

## Customization at submission (initial range)

The seller's choices steer the agents. Initial presets:
- **Image set:** which shot types to generate (flat-lay / draped / on-model /
  macro weave) and how many.
- **Description tone:** minimal · editorial · technical · storytelling.
- **Audience:** designers · bulk garmenters · boutiques.
- **Length:** short · standard · detailed.

These map to agent parameters, stored on the submission, and are expandable.

## Do we need an MCP server?

**Not for the MVP.** The Shopify Admin GraphQL API is a direct HTTP endpoint —
calling it from the Publisher agent (via LangChain tools) is simpler, cheaper,
and more controllable than routing through an MCP layer. Options if useful later:
- **Shopify Dev MCP** — handy *during development* for exploring the Admin
  GraphQL schema/introspection; not needed at runtime.
- **context7 MCP** — already in use here for pulling current library docs.

Recommendation: skip runtime MCP; keep Shopify access as first-party LangChain
tools. Revisit only if we expose vastra's own capabilities to external agents.

## Repo layout

```
vastra.ai/
├── backend/                 # FastAPI + agents
│   └── app/
│       ├── main.py          # app entry, router registration
│       ├── config.py        # typed settings from .env
│       ├── db.py            # SQLAlchemy engine/session
│       ├── security.py      # password hashing + JWT
│       ├── api/             # routers: auth, (products, review, publish…)
│       ├── agents/          # LangGraph graph + agent nodes
│       ├── services/        # shopify.py, openai_images.py, storage.py
│       ├── models/          # SQLAlchemy tables
│       ├── schemas/         # Pydantic request/response models
│       └── workers/         # background job queue
├── frontend/                # React (Vite + TS) — landing, auth, dashboards
├── docs/                    # ARCHITECTURE.md + decisions/ (ADRs)
├── .env.example
└── PLAN.md
```

## Current status

- [x] Backend scaffold (FastAPI, `uv`), `/health`, DB tables, storage/shopify service stubs.
- [x] Image service switched to OpenAI `gpt-image-1` (dev cost caps + dry-run).
- [x] JWT auth end-to-end: register (seller), login, `/me`, role-guarded routes, seeded admin.
- [x] Branded, animated frontend: landing page, auth flow, seller + admin dashboards, JWT persisted.
- [ ] Product submission + customization UI → submission stored.
- [ ] LangGraph agent pipeline (intake → image → listing → marketing → publisher).
- [ ] Shopify Admin API integration (the main goal).
- [ ] Drape Studio (future).

## Verification we run per slice
- Auth: register → login → token persists → protected route works → role guard blocks seller from admin routes.
- Agents: single submission runs the graph end-to-end with logged state and token/image usage.
- Shopify: creates a DRAFT product with generated images + listing; approve → ACTIVE on the storefront.
- Cost: per-run OpenAI + Claude spend logged and within dev caps.
