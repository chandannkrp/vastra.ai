# 0005 — SQLite for MVP; storage and queue behind swappable abstractions

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan

## Context

A solo MVP should minimize moving infrastructure. But we don't want early choices
to force a rewrite when the platform grows (Postgres, object storage in the cloud,
a real job queue).

## Decision

For the MVP:
- **Database:** SQLite via SQLAlchemy. The ORM code is identical for Postgres, so
  production swaps the `DATABASE_URL` only.
- **Object storage:** a `Storage` interface with a **local-filesystem** backend
  (dev) and an **S3-compatible** backend (Cloudflare R2, prod) — selected by
  `STORAGE_BACKEND`.
- **Job queue:** a thin `enqueue()` function over FastAPI `BackgroundTasks`, with a
  stable signature so it can become arq/Redis later without touching agent/API
  code.

## Rationale

- Zero external infra to run locally (no Postgres server, no Redis, no S3) → fastest
  iteration for a solo build.
- Each choice is isolated behind an interface or a single config value, so the
  production upgrade is configuration, not refactoring.
- SQLAlchemy + a `database_url` setting means the Postgres migration is a connection
  string change; SQLite-specific behavior (`check_same_thread`) is already guarded.

## Consequences

- SQLite doesn't handle high write concurrency — fine for the MVP's single-process,
  low-volume onboarding, not for scale. The Postgres path is pre-planned.
- `BackgroundTasks` runs jobs in the web process; a crash loses in-flight work.
  Acceptable for MVP because `pipeline_runs` records stage state and runs are
  resumable; the Redis-backed queue is the durability upgrade.
- Cloudflare R2 chosen for prod storage (S3-compatible, no egress fees) — but any
  S3-compatible store works through the same interface.
