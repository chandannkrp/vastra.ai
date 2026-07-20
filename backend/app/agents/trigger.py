"""Trigger the agent pipeline — via the separate ai-service if configured,
otherwise in-process. Both paths write progress to the shared DB, so the rest
of the app (polling, gallery, analytics) is identical either way."""

import logging

import httpx
from fastapi import BackgroundTasks

from app.config import get_settings
from app.workers.queue import enqueue

logger = logging.getLogger("vastra.trigger")
settings = get_settings()


def _run_in_process(submission_id: str) -> None:
    from app.agents.graph import run_pipeline

    run_pipeline(submission_id)


def _call_ai_service(submission_id: str) -> None:
    url = settings.ai_service_url.rstrip("/") + "/run"
    try:
        resp = httpx.post(url, json={"submission_id": submission_id}, timeout=15)
        resp.raise_for_status()
        logger.info("delegated pipeline for %s to ai-service", submission_id)
    except Exception:  # noqa: BLE001
        logger.exception("ai-service unreachable; running pipeline in-process")
        _run_in_process(submission_id)


def trigger_pipeline(background: BackgroundTasks, submission_id: str) -> None:
    fn = _call_ai_service if settings.ai_service_url else _run_in_process
    enqueue(background, fn, submission_id)
