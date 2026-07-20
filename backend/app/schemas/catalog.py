from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    shot_type: str | None = None
    url: str = ""  # filled in by the router


class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str | None = None
    fabric_type: str | None = None
    status: str
    created_at: datetime


class SubmissionListItem(SubmissionOut):
    stage: str | None = None
    percent: int = 0
    thumbnail_url: str | None = None


class SubmissionDetail(BaseModel):
    submission: SubmissionOut
    customization: dict | None = None
    progress: dict
    attributes: dict | None = None
    listing: dict | None = None
    marketing: dict | None = None
    images: list[ImageOut] = []
    shopify_status: str | None = None


class ProductCard(BaseModel):
    submission_id: str
    title: str
    fabric_type: str | None = None
    status: str
    shopify_status: str | None = None
    thumbnail_url: str | None = None
    tags: list[str] = []
    created_at: datetime


class AnalyticsSummary(BaseModel):
    total_submissions: int
    processing: int
    ready: int  # awaiting_review / published
    failed: int
    images_generated: int
    tokens_used: int
    by_status: dict[str, int]


class ConnectorStatus(BaseModel):
    connected: bool
    store_domain: str | None = None
    shop_name: str | None = None
    detail: str | None = None
