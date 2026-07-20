"""Product gallery — processed products with imagery, listing and status."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.tables import Image, ImageKind, Product, Seller, Submission
from app.schemas.catalog import ProductCard

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductCard])
def gallery(
    user: Seller = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[ProductCard]:
    subs = db.scalars(
        select(Submission)
        .where(Submission.seller_id == user.id)
        .order_by(Submission.created_at.desc())
    ).all()

    cards: list[ProductCard] = []
    for sub in subs:
        product = db.scalar(select(Product).where(Product.submission_id == sub.id))
        if product is None:
            continue  # not processed yet

        gen = next((i for i in sub.images if i.kind == ImageKind.enhanced.value), None)
        raw = next((i for i in sub.images if i.kind == ImageKind.raw.value), None)
        thumb = gen or raw
        listing = product.listing or {}
        attrs = product.attributes or {}

        cards.append(
            ProductCard(
                submission_id=sub.id,
                title=listing.get("title") or attrs.get("suggested_title") or sub.title or "Untitled fabric",
                fabric_type=attrs.get("fabric_type") or sub.fabric_type,
                status=sub.status,
                shopify_status=product.shopify_status,
                thumbnail_url=f"/api/images/{thumb.id}" if thumb else None,
                tags=listing.get("tags") or attrs.get("tags") or [],
                created_at=sub.created_at,
            )
        )
    return cards
