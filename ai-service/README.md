# vastra.ai — AI service

The agent pipeline as a standalone, independently deployable service. It runs the
LangGraph graph (intake → image → listing → marketing → publisher) and writes
progress to the shared Neon DB + S3, so the backend's polling/gallery/analytics
work unchanged.

The backend delegates runs here over HTTP when `AI_SERVICE_URL` is set (falls
back to running the pipeline in-process otherwise).

## Run

```bash
cd ai-service
uv sync
uv run uvicorn service.main:app --port 8100 --reload
```

Then set `AI_SERVICE_URL=http://localhost:8100` in the repo-root `.env` so the
backend delegates to it.

## Endpoints

- `GET /health`
- `POST /run` — body `{"submission_id": "..."}`; schedules a pipeline run (202).

Configuration (DB, OpenAI, S3) is read from the same repo-root `.env` as the
backend, via the shared `app.config` settings.
