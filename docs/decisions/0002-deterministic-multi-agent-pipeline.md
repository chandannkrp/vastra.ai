# 0002 — Deterministic state-machine orchestrator over LLM control flow

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan

## Context

The seller-onboarding pipeline has distinct stages: extract product data, enhance
images, quality-check the enhancements, draft the listing, publish. There are two
ways to orchestrate them:

1. **LLM-driven** — a single agent decides which stage/tool to run next.
2. **Deterministic** — a plain state machine advances through fixed stages, using
   LLMs *inside* stages.

## Decision

Orchestrate the pipeline as a **deterministic state machine** over
`pipeline_runs.stage` (`extracting → enhancing → qc → drafting → awaiting_review
→ publishing → published | failed`). Each stage is resumable and logged. Claude
is invoked *within* stages (via the SDK tool runner where a stage needs tools —
see ADR-0007); it does not choose the pipeline's control flow.

## Rationale

- The workflow is known and fixed — there is no open-ended reasoning about *what
  to do next*, only *how to do each step well*. That is the textbook case for a
  workflow, not an agent (per Anthropic's own agent-design guidance).
- **Cheaper** — no tokens spent on an LLM re-deriving the obvious next step.
- **Debuggable** — each stage writes to `pipeline_runs.stage_log`; a failure
  points at one stage, and the run can resume from it.
- **Predictable cost/latency** per product, which matters for a marketplace that
  will process many submissions.

## Consequences

- Adding a stage means editing the state machine, not just a prompt. Acceptable —
  stages change rarely.
- The one LLM-driven agent we *will* build is the WhatsApp conversational intake
  (phase 2), because that genuinely needs open-ended dialogue — but it produces a
  `submission` and hands off to this same deterministic pipeline.
- QC → enhancement forms a bounded retry loop (≤2) to catch color/texture drift
  (see ADR-0003); the bound keeps cost finite.
