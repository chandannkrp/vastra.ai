# Architecture Decision Records

This directory holds ADRs — short documents capturing an architecturally
significant decision, its context, and its consequences. One decision per file,
numbered sequentially, never deleted (superseded ones are marked, not removed).

Format: [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-record).

## Index

| # | Decision | Status | Date |
|---|---|---|---|
| [0001](./0001-python-fastapi-react-stack.md) | Python/FastAPI backend + React frontend | Accepted | 2026-07-19 |

## Creating a new ADR

Copy an existing file, bump the number, set status to `Proposed`, and add a row
above. Statuses: `Proposed` → `Accepted` → (optionally) `Superseded by NNNN` /
`Deprecated`.
