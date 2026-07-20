"""Shared API dependencies: DB session, current user, role guards."""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.tables import Seller
from app.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)

_CREDENTIALS_EXC = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Seller:
    if creds is None or creds.scheme.lower() != "bearer":
        raise _CREDENTIALS_EXC
    try:
        payload = decode_access_token(creds.credentials)
    except jwt.PyJWTError:
        raise _CREDENTIALS_EXC
    user_id = payload.get("sub")
    if not user_id:
        raise _CREDENTIALS_EXC
    user = db.get(Seller, user_id)
    if user is None:
        raise _CREDENTIALS_EXC
    return user


def require_admin(user: Seller = Depends(get_current_user)) -> Seller:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return user
