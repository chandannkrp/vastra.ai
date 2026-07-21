"""Token accounting — usage is derived from PipelineRun token counters so it can
never drift from what was actually consumed."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.tables import PipelineRun, Submission


def _run_tokens_col():
    return func.coalesce(func.sum(PipelineRun.total_input_tokens), 0) + func.coalesce(
        func.sum(PipelineRun.total_output_tokens), 0
    )


def tokens_used_for_sellers(db: Session, seller_ids: list[str]) -> int:
    if not seller_ids:
        return 0
    sub_ids = db.scalars(select(Submission.id).where(Submission.seller_id.in_(seller_ids))).all()
    if not sub_ids:
        return 0
    return int(db.scalar(select(_run_tokens_col()).where(PipelineRun.submission_id.in_(sub_ids))) or 0)


def tokens_used_for_seller(db: Session, seller_id: str) -> int:
    return tokens_used_for_sellers(db, [seller_id])


def daily_usage_for_seller(db: Session, seller_id: str, days: int = 14) -> list[dict]:
    """Per-day token usage for the last `days` days (zero-filled).

    Day-bucketing is done in Python rather than via the DB's ``date()`` function.
    ``PipelineRun.created_at`` is stored tz-aware in UTC, and grouping on
    ``func.date()`` produced key strings that didn't line up with the
    Python-generated date keys below — so every day zero-filled and the chart
    came back empty. Bucketing here is immune to that serialisation mismatch and
    behaves identically on SQLite and Postgres.
    """
    base = datetime.now(timezone.utc).date()
    since = datetime.now(timezone.utc) - timedelta(days=days - 1)
    by_day: dict[str, int] = {}

    sub_ids = db.scalars(select(Submission.id).where(Submission.seller_id == seller_id)).all()
    if sub_ids:
        rows = db.execute(
            select(
                PipelineRun.created_at,
                PipelineRun.total_input_tokens,
                PipelineRun.total_output_tokens,
            ).where(
                PipelineRun.submission_id.in_(sub_ids),
                PipelineRun.created_at >= since,
            )
        ).all()
        for created_at, tin, tout in rows:
            if created_at is None:
                continue
            # Normalise any naive timestamps to UTC so the bucket key matches `base`.
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            key = created_at.astimezone(timezone.utc).date().isoformat()
            by_day[key] = by_day.get(key, 0) + int(tin or 0) + int(tout or 0)

    out = []
    for i in range(days - 1, -1, -1):
        d = (base - timedelta(days=i)).isoformat()
        out.append({"date": d, "tokens": by_day.get(d, 0)})
    return out
