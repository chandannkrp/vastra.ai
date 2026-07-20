"""Serve stored image bytes by opaque id.

IDs are 128-bit random hex (unguessable). For a hardening pass we can move to
short-lived signed URLs; opaque ids are acceptable for now.
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.tables import Image
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
