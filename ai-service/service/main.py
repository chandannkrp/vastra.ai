"""vastra.ai AI service — runs the LangGraph agent pipeline.

Reuses the shared `app` package (agents, db, models, services, config) from the
backend project. Progress is written to the shared DB, so the backend surfaces
it through its existing polling endpoints.
"""

import logging

from fastapi import BackgroundTasks, FastAPI
from pydantic import BaseModel

from app.agents.graph import run_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vastra.ai-service")

app = FastAPI(title="vastra.ai AI service")


class RunRequest(BaseModel):
    submission_id: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ai-service"}


@app.post("/run", status_code=202)
def run(req: RunRequest, background: BackgroundTasks) -> dict:
    logger.info("received pipeline run for submission %s", req.submission_id)
    background.add_task(run_pipeline, req.submission_id)
    return {"accepted": True, "submission_id": req.submission_id}
