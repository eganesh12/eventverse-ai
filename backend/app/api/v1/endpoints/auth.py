"""Authentication endpoints."""

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    decode_token,
)
from app.db.base import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    RefreshTokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        avatar_url=user.avatar_url,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat(),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check uniqueness
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role="event_owner",
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.flush()

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user_to_response(user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user_to_response(user))


async def get_current_user(
    token: str,
    db: AsyncSession,
) -> User:
    """Shared dependency to decode JWT and load user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise credentials_exception
    return user


from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()


async def auth_dependency(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: AsyncSession = Depends(get_db),
) -> User:
    return await get_current_user(credentials.credentials, db)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(auth_dependency)):
    """Get the authenticated user's profile."""
    return user_to_response(current_user)
