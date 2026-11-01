"""Event CRUD endpoints."""

import uuid
import math
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.models.event import Event, EventTask
from app.models.budget import Budget, Expense
from app.models.user import User
from app.schemas.event import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventListResponse,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
)
from app.api.v1.endpoints.auth import auth_dependency

router = APIRouter(prefix="/events", tags=["Events"])


def event_to_response(event: Event, total_expenses: float = 0.0, task_completion: float = 0.0) -> EventResponse:
    return EventResponse(
        id=str(event.id),
        title=event.title,
        type=event.type,
        description=event.description,
        date=str(event.date),
        end_date=str(event.end_date) if event.end_date else None,
        location=event.location,
        venue_type=event.venue_type,
        guest_count=event.guest_count,
        total_budget=float(event.total_budget),
        currency=event.currency,
        status=event.status,
        theme=event.theme,
        cover_image=event.cover_image,
        owner_id=str(event.owner_id),
        created_at=event.created_at.isoformat(),
        updated_at=event.updated_at.isoformat(),
        total_expenses=total_expenses,
        task_completion=task_completion,
    )


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: EventCreate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    event = Event(
        id=uuid.uuid4(),
        owner_id=current_user.id,
        **payload.model_dump(exclude_none=True),
    )
    db.add(event)

    # Create a budget record
    budget = Budget(
        id=uuid.uuid4(),
        event_id=event.id,
        total_budget=payload.total_budget,
        currency=payload.currency,
    )
    db.add(budget)
    await db.flush()

    return event_to_response(event)


@router.get("/", response_model=EventListResponse)
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    base_query = select(Event).where(
        and_(Event.owner_id == current_user.id, Event.deleted_at.is_(None))
    )
    if status_filter:
        base_query = base_query.where(Event.status == status_filter)

    count_q = await db.execute(select(func.count()).select_from(base_query.subquery()))
    total = count_q.scalar() or 0

    result = await db.execute(
        base_query.order_by(Event.date.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    events = result.scalars().all()

    return EventListResponse(
        items=[event_to_response(e) for e in events],
        total=total,
        page=page,
        limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 1,
    )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Event).where(
            and_(Event.id == uuid.UUID(event_id), Event.deleted_at.is_(None))
        )
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    # Get expense total
    exp_result = await db.execute(
        select(func.sum(Expense.amount)).where(Expense.event_id == event.id)
    )
    total_expenses = float(exp_result.scalar() or 0)

    # Get task completion
    task_result = await db.execute(
        select(func.count()).where(EventTask.event_id == event.id)
    )
    total_tasks = task_result.scalar() or 0
    done_result = await db.execute(
        select(func.count()).where(
            and_(EventTask.event_id == event.id, EventTask.status == "completed")
        )
    )
    done_tasks = done_result.scalar() or 0
    task_completion = round((done_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)

    return event_to_response(event, total_expenses, task_completion)


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    payload: EventUpdate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Event).where(Event.id == uuid.UUID(event_id))
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(event, field, value)

    await db.flush()
    return event_to_response(event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone
    result = await db.execute(select(Event).where(Event.id == uuid.UUID(event_id)))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    # Soft delete
    event.deleted_at = datetime.now(timezone.utc)
    await db.flush()


# ── Tasks ──────────────────────────────────────────────────────

@router.post("/{event_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    event_id: str,
    payload: TaskCreate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    task = EventTask(
        id=uuid.uuid4(),
        event_id=uuid.UUID(event_id),
        **payload.model_dump(exclude_none=True),
    )
    db.add(task)
    await db.flush()
    return TaskResponse(
        id=str(task.id),
        event_id=str(task.event_id),
        title=task.title,
        category=task.category,
        status=task.status,
        due_date=str(task.due_date) if task.due_date else None,
        priority=task.priority,
    )


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EventTask).where(EventTask.id == uuid.UUID(task_id)))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    await db.flush()

    return TaskResponse(
        id=str(task.id),
        event_id=str(task.event_id),
        title=task.title,
        category=task.category,
        status=task.status,
        due_date=str(task.due_date) if task.due_date else None,
        priority=task.priority,
    )
