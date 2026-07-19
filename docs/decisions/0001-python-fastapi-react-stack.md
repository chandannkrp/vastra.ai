# 0001 — Python/FastAPI backend + React frontend

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan (solo founder)

## Context

We need a stack for a multi-agent platform that (a) drives LLM agents and image
processing, (b) integrates cleanly with the Shopify Admin API, and (c) presents a
polished seller/review web UI. The build is solo, so operational simplicity and a
strong ecosystem matter more than raw performance.

Options considered:
1. **TypeScript/Node across the board** — one language, best-in-class Shopify SDK.
2. **Python backend + React frontend** — stronger image/ML ecosystem, at the cost
   of two languages.
3. **Python-only, API-first** — fastest agent prototyping, weakest UI story.

## Decision

Use **Python 3.13 + FastAPI** for the backend (agents, API, integrations) and
**React + TypeScript + Tailwind (Vite)** for the frontend. Manage backend deps
with `uv`.

## Rationale

- The core of the product is agents and image handling; Python's LLM/image
  ecosystem (Anthropic SDK, google-genai, Pillow) is the natural home for that.
- FastAPI gives typed request/response models (Pydantic) that pair well with the
  structured-output extraction the pipeline depends on.
- A dedicated React frontend is worth the second language for a seller-facing and
  review UI that needs to feel professional (side-by-side image review, etc.).
- Shopify has no official Python SDK we depend on, but its Admin **GraphQL** API
  is a plain HTTP endpoint — an `httpx` client is sufficient (see ADR-0006), so
  the lack of a first-class Python SDK is not blocking.

## Consequences

- Two languages/toolchains to maintain (`uv` + `npm`). Acceptable for the value.
- Image-generation/editing is **not** done in Python directly — it is delegated to
  an external API (see ADR-0003), so Python's ML libraries are used for glue and
  light processing, not heavy inference.
- Backend and frontend deploy separately (see ARCHITECTURE §7).
