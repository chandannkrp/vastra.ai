# Architecture Decision Records

This directory holds ADRs — short documents capturing an architecturally
significant decision, its context, and its consequences. One decision per file,
numbered sequentially, never deleted (superseded ones are marked, not removed).

Format: [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-record).

## Index

| # | Decision | Status | Date |
|---|---|---|---|
| [0001](./0001-python-fastapi-react-stack.md) | Python/FastAPI backend + React frontend | Accepted | 2026-07-19 |
| [0002](./0002-deterministic-multi-agent-pipeline.md) | Deterministic state-machine orchestrator over LLM control flow | Accepted | 2026-07-19 |
| [0003](./0003-ai-image-editing-for-photo-cleanup.md) | AI image editing (Gemini) for photo cleanup, color fidelity as hard constraint | Accepted | 2026-07-19 |
| [0004](./0004-webapp-first-intake.md) | Webapp-first intake, WhatsApp in phase 2 | Accepted | 2026-07-19 |
| [0005](./0005-sqlite-mvp-with-storage-abstraction.md) | SQLite for MVP, storage/queue behind swappable abstractions | Accepted | 2026-07-19 |
| [0006](./0006-shopify-graphql-admin-api.md) | Publish via Shopify Admin GraphQL API to the existing Impulse store | Accepted | 2026-07-19 |
| [0007](./0007-claude-opus-tool-runner.md) | Claude Opus 4.8 via the SDK tool runner; structured outputs for extraction | Accepted | 2026-07-19 |
| [0008](./0008-product-naming.md) | Keep vastra.ai; name sub-products (Drape Studio, Bunkar) | Accepted | 2026-07-19 |

## Creating a new ADR

Copy an existing file, bump the number, set status to `Proposed`, and add a row
above. Statuses: `Proposed` → `Accepted` → (optionally) `Superseded by NNNN` /
`Deprecated`.
