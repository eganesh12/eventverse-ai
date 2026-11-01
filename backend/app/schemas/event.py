"""Event schemas."""

from datetime import date
from typing import Optional, List
from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    type: str = Field(min_length=1, max_length=50)
    description: Optional[str] = None
    date: date
    end_date: Optional[date] = None
    location: str = Field(min_length=2, max_length=255)
    venue_type: str = "tbd"
    guest_count: int = Field(gt=0)
    total_budget: float = Field(gt=0)
    currency: str = "INR"
    theme: Optional[str] = None
    status: str = "draft"


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    venue_type: Optional[str] = None
    guest_count: Optional[int] = Field(None, gt=0)
    total_budget: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    theme: Optional[str] = None
    status: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    title: str
    type: str
    description: Optional[str] = None
    date: str
    end_date: Optional[str] = None
    location: str
    venue_type: str
    guest_count: int
    total_budget: float
    currency: str
    status: str
    theme: Optional[str] = None
    cover_image: Optional[str] = None
    owner_id: str
    created_at: str
    updated_at: str
    # Computed
    total_expenses: Optional[float] = 0.0
    task_completion: Optional[float] = 0.0

    model_config = {"from_attributes": True}


class EventListResponse(BaseModel):
    items: List[EventResponse]
    total: int
    page: int
    limit: int
    pages: int


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None
    category: str = "general"
    due_date: Optional[date] = None
    priority: int = 1


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    event_id: str
    title: str
    category: str
    status: str
    due_date: Optional[str] = None
    priority: int

    model_config = {"from_attributes": True}
