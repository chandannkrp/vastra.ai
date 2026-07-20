from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SellerRegister(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLogin(BaseModel):
    credential: str  # Google ID token (JWT) from Google Identity Services


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: str
    phone: str | None = None
    is_admin: bool
    created_at: datetime

    @property
    def role(self) -> str:
        return "admin" if self.is_admin else "seller"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: UserOut
