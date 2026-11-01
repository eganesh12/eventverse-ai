"""Guest management endpoints."""

import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from app.db.base import get_db
from app.models.guest import Guest
from app.models.user import User
from app.api.v1.endpoints.auth import auth_dependency

router = APIRouter(tags=["Guests"])


class GuestCreate(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None
    plus_one: bool = False
    group_name: Optional[str] = None
    notes: Optional[str] = None


class RsvpUpdate(BaseModel):
    status: str  # pending | confirmed | declined | maybe


def guest_to_dict(guest: Guest) -> dict:
    return {
        "id": str(guest.id),
        "event_id": str(guest.event_id),
        "full_name": guest.full_name,
        "email": guest.email,
        "phone": guest.phone,
        "rsvp_status": guest.rsvp_status,
        "dietary_preferences": guest.dietary_preferences,
        "plus_one": guest.plus_one,
        "group_name": guest.group_name,
        "notes": guest.notes,
        "invitation_sent": guest.invitation_sent,
        "checked_in": guest.checked_in,
    }


@router.post("/events/{event_id}/guests", status_code=201)
async def add_guest(
    event_id: str,
    payload: GuestCreate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    guest = Guest(
        id=uuid.uuid4(),
        event_id=uuid.UUID(event_id),
        **payload.model_dump(exclude_none=True),
    )
    db.add(guest)
    await db.flush()
    return guest_to_dict(guest)


@router.get("/events/{event_id}/guests")
async def list_guests(
    event_id: str,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Guest).where(Guest.event_id == uuid.UUID(event_id))
    )
    guests = result.scalars().all()
    return [guest_to_dict(g) for g in guests]


@router.patch("/guests/{guest_id}/rsvp")
async def update_rsvp(
    guest_id: str,
    payload: RsvpUpdate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    valid_statuses = {"pending", "confirmed", "declined", "maybe"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=422, detail=f"Status must be one of {valid_statuses}")

    result = await db.execute(select(Guest).where(Guest.id == uuid.UUID(guest_id)))
    guest = result.scalar_one_or_none()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")

    guest.rsvp_status = payload.status
    await db.flush()
    return guest_to_dict(guest)
