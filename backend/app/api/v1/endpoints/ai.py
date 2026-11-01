"""AI planning endpoints."""

import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.models.user import User
from app.models.event import Event
from app.models.ai_plan import AIConversation, AIMessage, AIGeneratedPlan
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    GeneratePlanRequest,
    RevisePlanRequest,
    EventPlanResponse,
)
from app.services.ai_service import (
    chat_with_ai,
    generate_event_plan,
    AIServiceUnavailableError,
)
from app.api.v1.endpoints.auth import auth_dependency

router = APIRouter(prefix="/ai", tags=["AI Planning"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    """Conversational AI planning endpoint."""
    # Load or create conversation
    conversation = None
    history = []

    if payload.conversation_id:
        result = await db.execute(
            select(AIConversation).where(
                and_(
                    AIConversation.id == uuid.UUID(payload.conversation_id),
                    AIConversation.user_id == current_user.id,
                )
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation:
            msgs_result = await db.execute(
                select(AIMessage)
                .where(AIMessage.conversation_id == conversation.id)
                .order_by(AIMessage.created_at)
                .limit(20)
            )
            for msg in msgs_result.scalars():
                history.append({"role": msg.role, "content": msg.content})

    if not conversation:
        conversation = AIConversation(
            id=uuid.uuid4(),
            user_id=current_user.id,
            event_id=uuid.UUID(payload.event_id) if payload.event_id else None,
        )
        db.add(conversation)
        await db.flush()

    # Save user message
    user_msg = AIMessage(
        id=uuid.uuid4(),
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
    )
    db.add(user_msg)

    # Load event context if provided
    event_context = None
    if payload.event_id:
        event_result = await db.execute(
            select(Event).where(Event.id == uuid.UUID(payload.event_id))
        )
        event = event_result.scalar_one_or_none()
        if event:
            event_context = {
                "type": event.type,
                "title": event.title,
                "date": str(event.date),
                "location": event.location,
                "guest_count": event.guest_count,
                "total_budget": float(event.total_budget),
                "currency": event.currency,
            }

    try:
        response = await chat_with_ai(
            message=payload.message,
            conversation_history=history,
            event_context=event_context,
        )
        response.conversation_id = str(conversation.id)

        # Save AI response
        ai_msg = AIMessage(
            id=uuid.uuid4(),
            conversation_id=conversation.id,
            role="assistant",
            content=response.message,
            extracted_data=response.extracted_data,
        )
        db.add(ai_msg)
        await db.flush()

        return response

    except AIServiceUnavailableError:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please configure OPENAI_API_KEY or GEMINI_API_KEY.",
        )


@router.post("/generate-plan", response_model=dict)
async def generate_plan(
    payload: GeneratePlanRequest,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    """Generate a complete AI event plan."""
    result = await db.execute(
        select(Event).where(Event.id == uuid.UUID(payload.event_id))
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        plan_data = await generate_event_plan({
            "type": event.type,
            "title": event.title,
            "date": str(event.date),
            "location": event.location,
            "guest_count": event.guest_count,
            "total_budget": float(event.total_budget),
            "currency": event.currency,
            "theme": event.theme,
            "description": event.description,
        })
    except AIServiceUnavailableError:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Configure AI API keys to generate plans.",
        )

    # Get existing version count
    ver_result = await db.execute(
        select(AIGeneratedPlan).where(AIGeneratedPlan.event_id == event.id)
    )
    existing = ver_result.scalars().all()
    version = len(existing) + 1

    plan = AIGeneratedPlan(
        id=uuid.uuid4(),
        event_id=event.id,
        version=version,
        concept=plan_data.get("concept", ""),
        plan_data=plan_data,
        is_active="true",
    )
    db.add(plan)
    await db.flush()

    return {
        "id": str(plan.id),
        "event_id": str(event.id),
        "version": version,
        **plan_data,
        "created_at": plan.created_at.isoformat(),
    }


@router.post("/revise-plan", response_model=dict)
async def revise_plan(
    payload: RevisePlanRequest,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    """Revise an existing plan based on a change request."""
    result = await db.execute(
        select(Event).where(Event.id == uuid.UUID(payload.event_id))
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # For budget revision requests
    from app.services.ai_service import revise_budget
    import re

    # Detect budget change requests
    budget_pattern = re.compile(r"(\d[\d,\.]*)\s*(lakh|l|cr|crore|k)?", re.IGNORECASE)
    match = budget_pattern.search(payload.change_request.lower())

    if "budget" in payload.change_request.lower() and match:
        amount_str = match.group(1).replace(",", "")
        unit = (match.group(2) or "").lower()
        new_amount = float(amount_str)
        if "lakh" in unit or unit == "l":
            new_amount *= 100000
        elif "crore" in unit or unit == "cr":
            new_amount *= 10000000
        elif unit == "k":
            new_amount *= 1000

        try:
            revision = await revise_budget(
                current_budget=float(event.total_budget),
                new_budget=new_amount,
                event_type=event.type,
                change_request=payload.change_request,
                current_allocations=[],
            )
            return {
                "type": "budget_revision",
                "requires_approval": True,
                **revision,
            }
        except AIServiceUnavailableError:
            raise HTTPException(status_code=503, detail="AI service unavailable")

    # Generic plan regeneration
    try:
        plan_data = await generate_event_plan({
            "type": event.type,
            "title": event.title,
            "date": str(event.date),
            "location": event.location,
            "guest_count": event.guest_count,
            "total_budget": float(event.total_budget),
            "currency": event.currency,
            "change_request": payload.change_request,
        })
        return {"type": "plan_revision", **plan_data}
    except AIServiceUnavailableError:
        raise HTTPException(status_code=503, detail="AI service unavailable")
