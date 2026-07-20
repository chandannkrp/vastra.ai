"""Dashboard analytics — meaningful counts derived from the seller's data."""

from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.tables import Image, ImageKind, PipelineRun, Seller, Submission
from app.schemas.catalog import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    user: Seller = Depends(get_current_user), db: Session = Depends(get_db)
) -> AnalyticsSummary:
    subs = db.scalars(select(Submission).where(Submission.seller_id == user.id)).all()
    sub_ids = [s.id for s in subs]
    by_status = Counter(s.status for s in subs)

    images_generated = 0
    tokens_used = 0
    if sub_ids:
        images_generated = (
            db.scalar(
                select(func.count(Image.id)).where(
                    Image.submission_id.in_(sub_ids),
                    Image.kind == ImageKind.enhanced.value,
                )
            )
            or 0
        )
        tokens_used = (
            db.scalar(
                select(
                    func.coalesce(func.sum(PipelineRun.total_input_tokens), 0)
                    + func.coalesce(func.sum(PipelineRun.total_output_tokens), 0)
                ).where(PipelineRun.submission_id.in_(sub_ids))
            )
            or 0
        )

    ready = by_status.get("awaiting_review", 0) + by_status.get("published", 0)
    return AnalyticsSummary(
        total_submissions=len(subs),
        processing=by_status.get("processing", 0) + by_status.get("pending", 0),
        ready=ready,
        failed=by_status.get("failed", 0),
        images_generated=int(images_generated),
        tokens_used=int(tokens_used),
        by_status=dict(by_status),
    )
