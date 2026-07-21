"""Serve stored image bytes by opaque id.

IDs are 128-bit random hex (unguessable). For a hardening pass we can move to
short-lived signed URLs; opaque ids are acceptable for now.
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.tables import Image, Seller, Submission
from app.services.storage import get_storage

router = APIRouter(prefix="/images", tags=["images"])
storage = get_storage()


@router.get("/{image_id}")
def get_image(image_id: str, db: Session = Depends(get_db)) -> Response:
    image = db.get(Image, image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    try:
        data = storage.load(image.storage_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Image data missing")
    return Response(content=data, media_type=image.content_type)


def _owned_image(db: Session, image_id: str, user: Seller) -> Image:
    image = db.get(Image, image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    sub = db.get(Submission, image.submission_id)
    if sub is None or (sub.seller_id != user.id and not user.is_admin):
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@router.delete("/{image_id}")
def delete_image(
    image_id: str, user: Seller = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    image = _owned_image(db, image_id, user)
    try:
        storage.delete(image.storage_key)
    except Exception:  # noqa: BLE001
        pass
    db.delete(image)
    db.commit()
    return {"deleted": image_id}


@router.post("/{image_id}/select")
def select_image(
    image_id: str,
    payload: dict,
    user: Seller = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    image = _owned_image(db, image_id, user)
    image.approved = bool(payload.get("approved", True))
    db.commit()
    return {"id": image_id, "approved": image.approved}
