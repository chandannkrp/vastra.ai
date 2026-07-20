"""Auth routes: seller self-registration, login (admin + seller), current user."""

import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.config import get_settings
from app.db import get_db
from app.models.tables import Seller
from app.schemas.auth import (
    GoogleLogin,
    LoginRequest,
    SellerRegister,
    TokenResponse,
    UserOut,
)
from app.security import create_access_token, hash_password, verify_password

logger = logging.getLogger("vastra.auth")
router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _token_response(user: Seller) -> TokenResponse:
    role = "admin" if user.is_admin else "seller"
    return TokenResponse(
        access_token=create_access_token(subject=user.id, role=role),
        role=role,
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_seller(payload: SellerRegister, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.scalar(select(Seller).where(Seller.email == payload.email.lower()))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = Seller(
        email=payload.email.lower(),
        name=payload.name,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(Seller).where(Seller.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    return _token_response(user)


@router.post("/google", response_model=TokenResponse)
def google_login(payload: GoogleLogin, db: Session = Depends(get_db)) -> TokenResponse:
    if not settings.google_client_id:
        raise HTTPException(status_code=500, detail="Google login is not configured")
    try:
        info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.google_client_id,
            clock_skew_in_seconds=10,
        )
    except ValueError as exc:
        logger.warning("Google token verification failed: %s", exc)
        detail = f"Invalid Google credential: {exc}" if settings.debug else "Invalid Google credential"
        raise HTTPException(status_code=401, detail=detail)

    email = (info.get("email") or "").lower()
    if not email or not info.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google account email not verified")

    user = db.scalar(select(Seller).where(Seller.email == email))
    if user is None:
        user = Seller(
            email=email,
            name=info.get("name") or email.split("@")[0],
            # OAuth accounts have no password — store an unusable random hash.
            password_hash=hash_password(secrets.token_urlsafe(32)),
            is_admin=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return _token_response(user)


@router.get("/me", response_model=UserOut)
def me(user: Seller = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)
