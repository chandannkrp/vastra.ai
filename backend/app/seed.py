"""Idempotent startup seeding — ensures a default admin account exists."""

import logging

from sqlalchemy import select

from app.config import get_settings
from app.db import SessionLocal
from app.models.tables import Seller
from app.security import hash_password

logger = logging.getLogger("vastra.seed")
settings = get_settings()


def ensure_admin() -> None:
    with SessionLocal() as db:
        existing_admin = db.scalar(select(Seller).where(Seller.is_admin.is_(True)))
        if existing_admin is not None:
            return
        admin = Seller(
            email=settings.admin_email.lower(),
            name=settings.admin_name,
            password_hash=hash_password(settings.admin_password),
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        logger.info("Seeded default admin: %s", settings.admin_email)
