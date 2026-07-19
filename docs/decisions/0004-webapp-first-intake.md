# 0004 — Webapp-first intake, WhatsApp in phase 2

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan

## Context

Sellers need to submit photos + product info. The plan mentions two channels: a
web app and WhatsApp. WhatsApp is attractive for Indian sellers (no login,
familiar), but the WhatsApp Business API requires a BSP (Gupshup/Twilio) and Meta
approval, adding 1–2 weeks of setup before anything works.

## Decision

Ship the **webapp upload flow first**. Add **WhatsApp intake in phase 2** (M4).
Design the intake boundary so both channels produce the same `submissions` row and
feed the identical downstream pipeline.

## Rationale

- Fastest path to a working end-to-end MVP — the webapp needs no third-party
  approval.
- The value of the product is the *pipeline*, not the intake channel; proving the
  pipeline against the simpler channel first de-risks the whole build.
- Modeling the channel as `submissions.source_channel` from day one means WhatsApp
  is later an adapter, not a rebuild.

## Consequences

- Sellers must use a web form for the MVP; some may prefer WhatsApp. Accepted as a
  temporary limitation.
- The Meta/BSP approval process should be *started early* (in parallel with M1–M3)
  because of its lead time, even though the integration lands in M4.
- The WhatsApp intake will be the one genuinely LLM-driven agent (conversational
  follow-ups for missing fields), distinct from the deterministic pipeline
  (ADR-0002).
