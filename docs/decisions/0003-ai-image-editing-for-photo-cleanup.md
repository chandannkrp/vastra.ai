# 0003 — AI image editing (Gemini) for photo cleanup; color fidelity as a hard constraint

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan

## Context

The product's premise is that sellers upload **raw, badly-lit smartphone photos**
and get back clean, studio-quality product shots. This requires relighting,
background replacement, and clutter removal — fixing *bad lighting* specifically,
which classical image processing does poorly.

Options considered:
1. **Classical pipeline** (rembg for background, Pillow/OpenCV for color/upscale)
   — free and deterministic, but cannot convincingly relight a photo.
2. **AI image-editing API** (Google Gemini image-out model) — high output quality,
   handles relighting; per-image cost.
3. **Hybrid** — classical for basics, AI only on QC-flagged images.

## Decision

Use an **AI image-editing API (Google Gemini image model)** as the primary
enhancement engine (`app/services/gemini_images.py`). Treat **fabric color and
texture fidelity as a hard constraint**: the enhancement prompt explicitly forbids
shifting hue, saturation, pattern, or weave, and a **QC agent verifies** each
enhanced image against its raw source, retrying (≤2) on drift before falling back
to a human flag.

## Rationale

- Bad lighting is the core problem to solve; only generative editing does it well.
- In fabric commerce, **buyers purchase on exact color** — an enhancement that
  "improves" a photo but shifts the color is worse than no enhancement. Hence the
  explicit constraint plus an automated QC gate, rather than trusting the editor
  blindly.
- Keeping the enhancer behind a service interface means the specific model/vendor
  can change without touching the pipeline.

## Consequences

- Per-image inference cost (~$0.02–0.10/image); mitigated by only enhancing on
  submission, caching results, and the retry cap.
- A QC stage (Claude vision) is now a required part of the pipeline, not optional.
- If cost becomes a concern at scale, the hybrid approach (option 3) is the fallback
  — classical first, AI only on QC-flagged images — with no interface change.
- The service is vendor-swappable; Gemini is the current choice, not a lock-in.
