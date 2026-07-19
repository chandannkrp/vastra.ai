# 0007 — Claude Opus 4.8 via the SDK tool runner; structured outputs for extraction

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan

## Context

Three of the five pipeline agents are LLM-backed (extraction, QC, listing). We need
to choose the model, how the agentic loop is driven, and how structured data comes
out of the model reliably.

## Decision

- **Model:** `claude-opus-4-8` with adaptive thinking (`thinking={"type":
  "adaptive"}`) as the default for LLM agents.
- **Agentic loop:** where a stage needs tools, use the **Anthropic SDK tool
  runner** (`@beta_tool` + `client.beta.messages.tool_runner`) rather than a
  hand-written request/execute loop.
- **Structured extraction:** use `client.messages.parse()` with **Pydantic**
  models so the extraction agent returns a validated schema (attributes + per-field
  confidence), not free text.
- **Cost levers:** prompt caching (`cache_control` on stable system prompts, which
  are reused across many per-image/per-product runs) and `effort: "low"` for the
  cheap QC/classification-style stages.

## Rationale

- Opus 4.8 is the most capable model for the vision + reasoning these agents do
  (reading fabric photos, judging color drift, writing commerce copy); the default
  choice unless a specific stage proves it can drop to a cheaper tier.
- The tool runner removes hand-rolled loop boilerplate and its bugs, while still
  allowing per-turn intervention (gating, result modification) where needed.
- `messages.parse()` + Pydantic guarantees the extraction output validates against
  the same schema the rest of the backend consumes — no brittle JSON parsing.
- Prompt caching is a large, near-free saving because the agents run repeatedly
  with the same system prompts across a submission's images.

## Consequences

- The tool runner is a beta SDK surface; acceptable, and the manual loop is a known
  fallback if a stage needs control the runner doesn't expose.
- Token usage is recorded per run (`pipeline_runs.total_*_tokens`) so per-product
  cost is measurable before scaling — a gate to revisit model/effort choices.
- Model IDs and effort are configurable (`CLAUDE_MODEL` in settings), so upgrading
  or down-tiering a stage is a config change.
