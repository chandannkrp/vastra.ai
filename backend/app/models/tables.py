import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    awaiting_review = "awaiting_review"
    approved = "approved"
    published = "published"
    failed = "failed"
    rejected = "rejected"


class PipelineStage(str, enum.Enum):
    extracting = "extracting"
    enhancing = "enhancing"
    qc = "qc"
    drafting = "drafting"
    awaiting_review = "awaiting_review"
    publishing = "publishing"
    published = "published"
    failed = "failed"


class ImageKind(str, enum.Enum):
    raw = "raw"
    enhanced = "enhanced"


class Seller(Base):
    __tablename__ = "sellers"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_admin: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    submissions: Mapped[list["Submission"]] = relationship(back_populates="seller")


class Submission(Base):
    """Raw intake from a seller: images + whatever info they provided."""

    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    seller_id: Mapped[str] = mapped_column(ForeignKey("sellers.id"), index=True)
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus), default=SubmissionStatus.pending, index=True
    )
    # Seller-provided fields — all optional; agents fill the gaps
    fabric_type: Mapped[str | None] = mapped_column(String(120))
    color: Mapped[str | None] = mapped_column(String(120))
    price_per_meter: Mapped[float | None] = mapped_column(Float)
    width_inches: Mapped[float | None] = mapped_column(Float)
    gsm: Mapped[float | None] = mapped_column(Float)
    moq_meters: Mapped[float | None] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text)
    source_channel: Mapped[str] = mapped_column(String(20), default="webapp")  # webapp | whatsapp
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    seller: Mapped[Seller] = relationship(back_populates="submissions")
    images: Mapped[list["Image"]] = relationship(back_populates="submission")
    product: Mapped["Product | None"] = relationship(back_populates="submission", uselist=False)
    pipeline_runs: Mapped[list["PipelineRun"]] = relationship(back_populates="submission")


class Image(Base):
    __tablename__ = "images"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id"), index=True)
    kind: Mapped[ImageKind] = mapped_column(Enum(ImageKind), default=ImageKind.raw)
    # For enhanced images, the raw image it was derived from
    parent_image_id: Mapped[str | None] = mapped_column(ForeignKey("images.id"))
    storage_key: Mapped[str] = mapped_column(String(500))
    content_type: Mapped[str] = mapped_column(String(100), default="image/jpeg")
    approved: Mapped[bool | None] = mapped_column(default=None)  # reviewer decision
    qc_result: Mapped[dict | None] = mapped_column(JSON)  # QC agent verdict
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    submission: Mapped[Submission] = relationship(back_populates="images")


class Product(Base):
    """Processed, publishable product derived from a submission."""

    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id"), unique=True)
    # Extraction agent output (structured attributes + per-field confidence)
    attributes: Mapped[dict | None] = mapped_column(JSON)
    # Listing agent output (title, description_html, tags, product_type, metafields, variants)
    listing: Mapped[dict | None] = mapped_column(JSON)
    shopify_product_gid: Mapped[str | None] = mapped_column(String(100), index=True)
    shopify_status: Mapped[str | None] = mapped_column(String(20))  # DRAFT | ACTIVE
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    submission: Mapped[Submission] = relationship(back_populates="product")


class PipelineRun(Base):
    """One end-to-end run of the agent pipeline for a submission. Audit + resumability."""

    __tablename__ = "pipeline_runs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id"), index=True)
    stage: Mapped[PipelineStage] = mapped_column(Enum(PipelineStage), default=PipelineStage.extracting)
    # Per-stage logs: [{stage, started_at, finished_at, ok, detail, usage}]
    stage_log: Mapped[list | None] = mapped_column(JSON, default=list)
    error: Mapped[str | None] = mapped_column(Text)
    total_input_tokens: Mapped[int] = mapped_column(default=0)
    total_output_tokens: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    submission: Mapped[Submission] = relationship(back_populates="pipeline_runs")
