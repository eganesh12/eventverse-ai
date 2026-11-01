"""Authentication request/response schemas."""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from app.core.security import validate_password_strength


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=255)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not validate_password_strength(v):
            raise ValueError(
                "Password must be at least 8 characters and include an uppercase letter and a digit"
            )
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    is_verified: bool = False
    created_at: str

    model_config = {"from_attributes": True}


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
