"""AI chat and plan generation schemas."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    event_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    role: str = "assistant"
    extracted_data: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None
    requires_clarification: bool = False
    clarification_questions: Optional[List[str]] = None


class GeneratePlanRequest(BaseModel):
    event_id: str
    requirements: Optional[str] = None


class RevisePlanRequest(BaseModel):
    event_id: str
    change_request: str


class GenerateThemeRequest(BaseModel):
    event_id: str
    style_preferences: Optional[str] = None


class GenerateTimelineRequest(BaseModel):
    event_id: str


class BudgetCategory(BaseModel):
    category: str
    estimated_amount: float
    percentage: float
    items: Optional[List[Dict[str, Any]]] = None


class TimelineItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: str
    status: str = "pending"
    category: str
    dependencies: Optional[List[str]] = None


class ThemeSuggestion(BaseModel):
    name: str
    description: str
    color_palette: List[str]
    style_keywords: List[str]


class RiskItem(BaseModel):
    title: str
    severity: str  # low | medium | high
    probability: str
    mitigation: str


class EventPlanResponse(BaseModel):
    id: str
    event_id: str
    version: int
    concept: str
    theme_suggestions: List[ThemeSuggestion]
    budget_breakdown: List[BudgetCategory]
    timeline: List[TimelineItem]
    vendor_checklist: List[Dict[str, Any]]
    risk_assessment: List[RiskItem]
    created_at: str

    model_config = {"from_attributes": True}
