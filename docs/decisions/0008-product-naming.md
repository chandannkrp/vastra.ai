# 0008 — Keep vastra.ai; name the sub-products

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan

## Context

The project needs a durable name for the platform and a way to refer to its major
features (the fabric-visualization USP and the internal agent pipeline).

## Decision

Keep **vastra.ai** as the platform name (Vastra = garment/cloth in Sanskrit —
short, meaningful, culturally rooted, `.ai` TLD). Name the sub-products separately:

- **Fabric Studio** feature → **Drape Studio** (buyer-facing).
- Multi-agent pipeline → **Bunkar** ("weaver") / **TanaBana** ("warp & weft") as an
  internal codename.

Fallback platform names if `vastra.ai` is unavailable: **TanaBana.ai**,
**Bunkar.ai**, **KapdaKart**.

## Rationale

- `vastra` is instantly meaningful to the Indian clothing market it serves, and
  short enough to be memorable.
- Naming features separately keeps marketing flexible: "Drape Studio" can be sold
  as a headline feature without renaming the company.
- The pipeline codename gives the team a single word for the agent system in code
  and docs.

## Consequences

- Domain/trademark availability for `vastra.ai` should be confirmed before any
  public launch; fallbacks are pre-identified.
- Sub-product names are provisional and buyer-facing ones (Drape Studio) may be
  A/B'd before the M5 launch.
