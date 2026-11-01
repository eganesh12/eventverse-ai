"""Guest management database models."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    rsvp_status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending | confirmed | declined | maybe
    dietary_preferences: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    plus_one: Mapped[bool] = mapped_column(Boolean, default=False)
    plus_one_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    group_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    invitation_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    checked_in: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    event: Mapped["Event"] = relationship("Event", back_populates="guests")
