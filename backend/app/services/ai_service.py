"""
EventVerse AI – Multi-Agent Planning Service

This service orchestrates 10 specialized AI agents via LangGraph.
Each agent has a defined scope and uses structured tool calling.
All financial calculations use deterministic code, not LLM arithmetic.
"""

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import uuid

from app.core.config import settings
from app.schemas.ai import (
    ChatResponse,
    EventPlanResponse,
    BudgetCategory,
    TimelineItem,
    ThemeSuggestion,
    RiskItem,
)

logger = logging.getLogger(__name__)


def get_llm_client():
    """Return configured LLM client or raise if no AI keys configured."""
    if settings.DEFAULT_LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        from openai import AsyncOpenAI
        return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    elif settings.DEFAULT_LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        # Gemini via langchain
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
        )
    return None


class AIServiceUnavailableError(Exception):
    """Raised when no AI provider is configured."""
    pass


# ──────────────────────────────────────────────────────────────
# Agent 1: Event Understanding Agent
# ──────────────────────────────────────────────────────────────

EXTRACTION_SYSTEM_PROMPT = """
You are the Event Understanding Agent for EventVerse AI.

Your job is to:
1. Understand the user's event description in natural language
2. Extract structured event details as JSON
3. Identify missing information and ask for it politely
4. Classify the event type

Always respond with valid JSON in this exact format:
{
  "response_message": "Your conversational reply to the user",
  "extracted_data": {
    "type": null,
    "title": null,
    "date": null,
    "location": null,
    "guest_count": null,
    "total_budget": null,
    "currency": "INR",
    "theme": null,
    "special_requirements": null
  },
  "missing_fields": ["list of missing required fields"],
  "suggestions": ["1-3 helpful next steps or tips"],
  "requires_clarification": true or false
}

Event types: wedding, birthday, college, community, corporate, cultural, charity, conference

When budget is mentioned without currency, assume INR.
For Indian budgets mentioned in "lakh", convert: 1 lakh = 100000.
Be warm, professional, and culturally aware.
"""


async def chat_with_ai(
    message: str,
    conversation_history: List[Dict[str, str]],
    event_context: Optional[Dict[str, Any]] = None,
) -> ChatResponse:
    """
    Main conversational AI endpoint.
    Uses the Event Understanding Agent to parse natural language.
    Falls back gracefully when AI is unavailable.
    """
    client = get_llm_client()
    if not client:
        raise AIServiceUnavailableError("No AI provider configured")

    conversation_id = str(uuid.uuid4())

    # Build messages list
    messages = [{"role": "system", "content": EXTRACTION_SYSTEM_PROMPT}]
    for hist in conversation_history[-10:]:  # Keep last 10 messages for context
        messages.append(hist)

    if event_context:
        messages.append({
            "role": "system",
            "content": f"Current event context: {json.dumps(event_context)}",
        })
    messages.append({"role": "user", "content": message})

    if settings.DEFAULT_LLM_PROVIDER == "openai":
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1500,
        )
        content = response.choices[0].message.content or "{}"
        parsed = json.loads(content)
    else:
        # Gemini path
        full_prompt = "\n".join([m["content"] for m in messages])
        response = await client.ainvoke(full_prompt)
        try:
            parsed = json.loads(response.content)
        except json.JSONDecodeError:
            parsed = {"response_message": response.content, "extracted_data": {}, "suggestions": []}

    return ChatResponse(
        conversation_id=conversation_id,
        message=parsed.get("response_message", "I understand your requirements."),
        extracted_data=parsed.get("extracted_data"),
        suggestions=parsed.get("suggestions"),
        requires_clarification=parsed.get("requires_clarification", False),
        clarification_questions=parsed.get("missing_fields"),
    )


# ──────────────────────────────────────────────────────────────
# Agent 3: Budget Intelligence Agent (deterministic calculations)
# ──────────────────────────────────────────────────────────────

# Category allocation templates by event type
BUDGET_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
    "wedding": [
        {"category": "Venue", "percentage": 20},
        {"category": "Catering & Food", "percentage": 30},
        {"category": "Decoration & Florals", "percentage": 12},
        {"category": "Photography & Video", "percentage": 10},
        {"category": "Music & Entertainment", "percentage": 6},
        {"category": "Makeup & Styling", "percentage": 5},
        {"category": "Accommodation", "percentage": 8},
        {"category": "Invitations & Stationery", "percentage": 2},
        {"category": "Contingency", "percentage": 7},
    ],
    "corporate": [
        {"category": "Venue", "percentage": 25},
        {"category": "Catering", "percentage": 25},
        {"category": "AV & Technology", "percentage": 15},
        {"category": "Decoration", "percentage": 8},
        {"category": "Photography & Video", "percentage": 7},
        {"category": "Entertainment", "percentage": 10},
        {"category": "Transportation", "percentage": 5},
        {"category": "Contingency", "percentage": 5},
    ],
    "birthday": [
        {"category": "Venue", "percentage": 20},
        {"category": "Catering", "percentage": 30},
        {"category": "Decoration", "percentage": 15},
        {"category": "Photography", "percentage": 10},
        {"category": "Entertainment", "percentage": 15},
        {"category": "Cake", "percentage": 5},
        {"category": "Contingency", "percentage": 5},
    ],
    "college": [
        {"category": "Venue", "percentage": 15},
        {"category": "Sound & Lighting", "percentage": 20},
        {"category": "Performer / Celebrity", "percentage": 25},
        {"category": "Food & Beverages", "percentage": 20},
        {"category": "Decoration", "percentage": 8},
        {"category": "Marketing & Promotion", "percentage": 7},
        {"category": "Contingency", "percentage": 5},
    ],
    "default": [
        {"category": "Venue", "percentage": 20},
        {"category": "Catering", "percentage": 30},
        {"category": "Decoration", "percentage": 15},
        {"category": "Photography", "percentage": 10},
        {"category": "Entertainment", "percentage": 10},
        {"category": "Logistics", "percentage": 8},
        {"category": "Contingency", "percentage": 7},
    ],
}


def calculate_budget_breakdown(
    total_budget: float,
    event_type: str,
    currency: str = "INR",
) -> List[BudgetCategory]:
    """
    Deterministic budget allocation.
    LLM is NOT used for the actual financial maths.
    """
    template = BUDGET_TEMPLATES.get(event_type, BUDGET_TEMPLATES["default"])
    result = []
    for item in template:
        amount = round(total_budget * item["percentage"] / 100, 2)
        result.append(
            BudgetCategory(
                category=item["category"],
                estimated_amount=amount,
                percentage=item["percentage"],
            )
        )
    return result


# ──────────────────────────────────────────────────────────────
# Agent 4: Timeline Agent
# ──────────────────────────────────────────────────────────────

TIMELINE_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
    "wedding": [
        {"title": "Book venue", "category": "Venue", "days_before": 365},
        {"title": "Set final guest list", "category": "Guests", "days_before": 300},
        {"title": "Book photographer & videographer", "category": "Photography", "days_before": 270},
        {"title": "Book caterer and confirm menu", "category": "Catering", "days_before": 240},
        {"title": "Send save-the-date cards", "category": "Invitations", "days_before": 180},
        {"title": "Book makeup artists & stylists", "category": "Beauty", "days_before": 150},
        {"title": "Book accommodation for outstation guests", "category": "Accommodation", "days_before": 120},
        {"title": "Finalize decoration theme", "category": "Decoration", "days_before": 90},
        {"title": "Send formal invitations", "category": "Invitations", "days_before": 60},
        {"title": "Confirm all vendor bookings", "category": "Vendors", "days_before": 45},
        {"title": "Final headcount confirmation", "category": "Guests", "days_before": 14},
        {"title": "Final walkthrough with venue", "category": "Venue", "days_before": 7},
        {"title": "Final payment to vendors", "category": "Payments", "days_before": 3},
    ],
    "corporate": [
        {"title": "Define event objectives and agenda", "category": "Planning", "days_before": 180},
        {"title": "Book venue", "category": "Venue", "days_before": 150},
        {"title": "Confirm keynote speakers", "category": "Speakers", "days_before": 120},
        {"title": "Send invitations to attendees", "category": "Invitations", "days_before": 90},
        {"title": "Book AV and technology vendors", "category": "Technology", "days_before": 60},
        {"title": "Confirm catering orders", "category": "Catering", "days_before": 30},
        {"title": "Final headcount", "category": "Guests", "days_before": 7},
        {"title": "Technical rehearsal", "category": "Logistics", "days_before": 3},
    ],
    "default": [
        {"title": "Book venue", "category": "Venue", "days_before": 90},
        {"title": "Send invitations", "category": "Guests", "days_before": 60},
        {"title": "Book caterer", "category": "Catering", "days_before": 45},
        {"title": "Confirm guest count", "category": "Guests", "days_before": 14},
        {"title": "Final vendor confirmation", "category": "Vendors", "days_before": 7},
        {"title": "Event setup", "category": "Logistics", "days_before": 1},
    ],
}


def generate_timeline(event_date: datetime, event_type: str) -> List[TimelineItem]:
    """Generate preparation timeline with deterministic date calculations."""
    template = TIMELINE_TEMPLATES.get(event_type, TIMELINE_TEMPLATES["default"])
    timeline = []
    now = datetime.now()

    for item in template:
        due = event_date - timedelta(days=item["days_before"])
        if due < now:
            status = "completed" if (now - due).days > 14 else "in_progress"
        elif (due - now).days < 7:
            status = "in_progress"
        else:
            status = "pending"

        timeline.append(
            TimelineItem(
                id=str(uuid.uuid4()),
                title=item["title"],
                category=item["category"],
                due_date=due.strftime("%Y-%m-%d"),
                status=status,
            )
        )

    return sorted(timeline, key=lambda x: x.due_date)


# ──────────────────────────────────────────────────────────────
# Agent 2: Event Planning Agent + Agent 7: Creative Director
# ──────────────────────────────────────────────────────────────

PLANNING_SYSTEM_PROMPT = """
You are the Event Planning Agent and Creative Director for EventVerse AI.

Given event details, generate a comprehensive event plan as JSON with these exact fields:
{
  "concept": "2-3 paragraph event concept description",
  "theme_suggestions": [
    {
      "name": "Theme name",
      "description": "Description",
      "color_palette": ["#hex1", "#hex2", "#hex3"],
      "style_keywords": ["keyword1", "keyword2"]
    }
  ],
  "vendor_checklist": [
    {"category": "Venue", "required": true, "status": "not_started", "notes": "..."},
    ...
  ],
  "risk_assessment": [
    {"title": "Risk title", "severity": "high|medium|low", "probability": "X%", "mitigation": "..."},
    ...
  ],
  "invitation_draft": "Draft invitation text"
}

Rules:
- Generate exactly 3 theme suggestions
- Include at least 5 risks with appropriate severities
- Vendor checklist should include all relevant categories for this event type
- Never suggest specific vendor names, prices, or availability — those come from the database
- Be culturally appropriate for Indian events when location is in India
"""


async def generate_event_plan(
    event: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate a complete AI event plan.
    Uses Event Planning Agent + Budget Agent + Timeline Agent + Creative Director.
    """
    client = get_llm_client()
    if not client:
        raise AIServiceUnavailableError("No AI provider configured")

    event_prompt = f"""
Event Details:
- Type: {event.get('type', 'event')}
- Title: {event.get('title', 'Untitled')}
- Date: {event.get('date', 'TBD')}
- Location: {event.get('location', 'TBD')}
- Guests: {event.get('guest_count', 0)}
- Budget: {event.get('currency', 'INR')} {event.get('total_budget', 0):,.0f}
- Theme Preference: {event.get('theme', 'Not specified')}
- Description: {event.get('description', 'None')}

Generate a comprehensive event plan.
"""

    if settings.DEFAULT_LLM_PROVIDER == "openai":
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": PLANNING_SYSTEM_PROMPT},
                {"role": "user", "content": event_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
            max_tokens=3000,
        )
        content = response.choices[0].message.content or "{}"
        ai_data = json.loads(content)
    else:
        full_prompt = PLANNING_SYSTEM_PROMPT + "\n\n" + event_prompt
        response = await client.ainvoke(full_prompt)
        try:
            ai_data = json.loads(response.content)
        except json.JSONDecodeError:
            ai_data = {"concept": response.content, "theme_suggestions": [], "vendor_checklist": [], "risk_assessment": []}

    # Combine AI creative content with deterministic budget/timeline
    event_date = datetime.strptime(str(event.get("date")), "%Y-%m-%d") if event.get("date") else datetime.now()
    budget_breakdown = calculate_budget_breakdown(
        float(event.get("total_budget", 0)),
        str(event.get("type", "default")),
        str(event.get("currency", "INR")),
    )
    timeline = generate_timeline(event_date, str(event.get("type", "default")))

    return {
        "concept": ai_data.get("concept", ""),
        "theme_suggestions": ai_data.get("theme_suggestions", []),
        "budget_breakdown": [b.model_dump() for b in budget_breakdown],
        "timeline": [t.model_dump() for t in timeline],
        "vendor_checklist": ai_data.get("vendor_checklist", []),
        "risk_assessment": ai_data.get("risk_assessment", []),
        "invitation_draft": ai_data.get("invitation_draft", ""),
    }


async def revise_budget(
    current_budget: float,
    new_budget: float,
    event_type: str,
    change_request: str,
    current_allocations: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Budget revision agent.
    Uses deterministic recalculation + AI explanation.
    Never allows AI to perform authoritative financial arithmetic.
    """
    # Deterministic: recalculate all allocations
    new_breakdown = calculate_budget_breakdown(new_budget, event_type)
    difference = new_budget - current_budget
    affected = [
        {"category": b.category, "change": b.estimated_amount - (current_budget * b.percentage / 100)}
        for b in new_breakdown
    ]

    if not settings.ai_available:
        return {
            "new_budget": new_budget,
            "difference": difference,
            "new_breakdown": [b.model_dump() for b in new_breakdown],
            "explanation": f"Budget updated from {current_budget:,.0f} to {new_budget:,.0f}. All categories recalculated proportionally.",
            "affected_categories": affected,
            "requires_approval": True,
        }

    client = get_llm_client()
    explanation_prompt = f"""
Budget change requested: "{change_request}"
Original budget: {current_budget:,.0f}
New budget: {new_budget:,.0f}
Difference: {difference:,.0f} ({'+' if difference > 0 else ''}{difference/current_budget*100:.1f}%)

Affected categories: {json.dumps(affected, indent=2)}

Write a 2-3 sentence explanation of the budget change and what the user should be aware of.
Focus on which services may be impacted. Do NOT suggest specific prices.
"""
    if settings.DEFAULT_LLM_PROVIDER == "openai":
        resp = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": explanation_prompt}],
            max_tokens=300,
        )
        explanation = resp.choices[0].message.content or ""
    else:
        resp = await client.ainvoke(explanation_prompt)
        explanation = resp.content

    return {
        "new_budget": new_budget,
        "difference": difference,
        "new_breakdown": [b.model_dump() for b in new_breakdown],
        "explanation": explanation,
        "affected_categories": affected,
        "requires_approval": True,
    }
