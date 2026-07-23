"""Trigger the agent pipeline: enqueue it to run in-process after the response
is sent. Progress is written to the shared DB (pipeline_runs), so polling,
gallery, and analytics work the same regardless of when it runs."""

from fastapi import BackgroundTasks

from app.workers.queue import enqueue


def trigger_pipeline(background: BackgroundTasks, submission_id: str) -> None:
    from app.agents.graph import run_pipeline

    enqueue(background, run_pipeline, submission_id)
