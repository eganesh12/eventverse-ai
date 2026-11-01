"""Event-related database models."""

import uuid
from datetime import datetime, date, timezone
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("draft", "planning", "confirmed", "in_progress", "completed", "cancelled",
             name="event_status_enum"),
        default="draft",
        nullable=False,
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    venue_type: Mapped[str] = mapped_column(String(100), nullable=False, default="tbd")
    guest_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_budget: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    theme: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cover_image: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="events")
    tasks: Mapped[list["EventTask"]] = relationship("EventTask", back_populates="event", lazy="noload")
    guests: Mapped[list["Guest"]] = relationship("Guest", back_populates="event", lazy="noload")
    budget: Mapped[Optional["Budget"]] = relationship("Budget", back_populates="event", uselist=False, lazy="noload")
    ai_plans: Mapped[list["AIGeneratedPlan"]] = relationship("AIGeneratedPlan", back_populates="event", lazy="noload")


class EventTask(Base):
    __tablename__ = "event_tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="general")
    status: Mapped[str] = mapped_column(
        Enum("pending", "in_progress", "completed", "overdue", name="task_status_enum"),
        default="pending",
    )
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    priority: Mapped[int] = mapped_column(Integer, default=1)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    event: Mapped["Event"] = relationship("Event", back_populates="tasks")
