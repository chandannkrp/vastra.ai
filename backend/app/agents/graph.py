"""Builds the LangGraph pipeline and the entry point that runs it for a submission."""

import logging

from langgraph.graph import END, START, StateGraph

from app.agents.nodes import (
    image_node,
    intake_node,
    listing_node,
    marketing_node,
    publisher_node,
)
from app.agents.progress import fail_run
from app.agents.state import PipelineState
from app.db import SessionLocal
from app.models.tables import PipelineRun, Submission

logger = logging.getLogger("vastra.agents")

_compiled = None


def build_graph():
    """Compile the sequential agent graph (cached)."""
    global _compiled
    if _compiled is not None:
        return _compiled

    g = StateGraph(PipelineState)
    g.add_node("intake", intake_node)
    g.add_node("image", image_node)
    g.add_node("listing", listing_node)
    g.add_node("marketing", marketing_node)
    g.add_node("publisher", publisher_node)

    g.add_edge(START, "intake")
    g.add_edge("intake", "image")
    g.add_edge("image", "listing")
    g.add_edge("listing", "marketing")
    g.add_edge("marketing", "publisher")
    g.add_edge("publisher", END)

    _compiled = g.compile()
    return _compiled


def run_pipeline(submission_id: str) -> None:
    """Create a run, mark the submission processing, and execute the graph.

    Designed to be called from a background task. All errors are captured onto
    the PipelineRun so the UI can surface them.
    """
    with SessionLocal() as db:
        run = PipelineRun(submission_id=submission_id, stage="queued", stage_log=[])
        db.add(run)
        sub = db.get(Submission, submission_id)
        if sub is not None:
            sub.status = "processing"
        db.commit()
        run_id = run.id

    graph = build_graph()
    try:
        graph.invoke({"submission_id": submission_id, "run_id": run_id})
        logger.info("pipeline completed for submission %s", submission_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("pipeline failed for submission %s", submission_id)
        with SessionLocal() as db:
            run = db.get(PipelineRun, run_id)
            sub = db.get(Submission, submission_id)
            if run is not None:
                fail_run(db, run, run.stage or "unknown", str(exc))
            if sub is not None:
                sub.status = "failed"
                db.commit()
