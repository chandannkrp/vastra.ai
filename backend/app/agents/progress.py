"""Helpers to record pipeline progress on the PipelineRun row.

The UI polls the run's `stage` + `stage_log` to render the live agent flow, so
every node calls `start_stage` on entry and `finish_stage` on success.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.tables import PIPELINE_STAGES, PipelineRun

STAGE_LABELS = {
    "extracting": "Intake agent",
    "enhancing": "Image agent",
    "drafting": "Listing agent",
    "marketing": "Marketing agent",
    "publishing": "Publisher agent",
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _append_log(run: PipelineRun, entry: dict) -> None:
    log = list(run.stage_log or [])
    log.append(entry)
    run.stage_log = log
    flag_modified(run, "stage_log")


def start_stage(db: Session, run: PipelineRun, stage: str) -> None:
    run.stage = stage
    _append_log(run, {"stage": stage, "status": "running", "at": _now_iso()})
    db.commit()


def finish_stage(db: Session, run: PipelineRun, stage: str, detail: str = "") -> None:
    _append_log(run, {"stage": stage, "status": "done", "detail": detail, "at": _now_iso()})
    db.commit()


def add_usage(db: Session, run: PipelineRun, input_tokens: int, output_tokens: int) -> None:
    run.total_input_tokens += int(input_tokens or 0)
    run.total_output_tokens += int(output_tokens or 0)
    db.commit()


def fail_run(db: Session, run: PipelineRun, stage: str, error: str) -> None:
    run.stage = "failed"
    run.error = f"[{stage}] {error}"
    _append_log(run, {"stage": stage, "status": "failed", "detail": error, "at": _now_iso()})
    db.commit()


def build_progress(run: PipelineRun | None) -> dict:
    """Turn a run's stage_log into UI-ready progress for the animated flow."""
    if run is None:
        return {"stages": [], "current": None, "percent": 0, "done": False,
                "failed": False, "error": None, "tokens": 0}

    log = run.stage_log or []
    done = {e["stage"] for e in log if e.get("status") == "done"}
    failed = {e["stage"] for e in log if e.get("status") == "failed"}
    details = {e["stage"]: e.get("detail", "") for e in log if e.get("status") == "done"}
    finished = run.stage == "published"

    stages = []
    for key in PIPELINE_STAGES:
        if key in failed:
            status = "failed"
        elif key in done or finished:
            status = "done"
        elif run.stage == key:
            status = "running"
        else:
            status = "pending"
        stages.append(
            {"key": key, "label": STAGE_LABELS.get(key, key), "status": status,
             "detail": details.get(key, "")}
        )

    done_count = sum(1 for s in stages if s["status"] == "done")
    percent = 100 if finished else round(done_count / len(stages) * 100)
    return {
        "stages": stages,
        "current": run.stage,
        "percent": percent,
        "done": finished,
        "failed": run.stage == "failed",
        "error": run.error,
        "tokens": (run.total_input_tokens or 0) + (run.total_output_tokens or 0),
    }
