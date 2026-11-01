"""Budget and expense endpoints."""

import uuid
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.base import get_db
from app.models.budget import Budget, Expense
from app.models.user import User
from app.api.v1.endpoints.auth import auth_dependency

router = APIRouter(tags=["Budget"])


class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount: float
    expense_date: Optional[date] = None
    vendor_id: Optional[str] = None
    status: str = "pending"
    notes: Optional[str] = None


class BudgetUpdate(BaseModel):
    total_budget: Optional[float] = None
    contingency_percentage: Optional[float] = None


@router.get("/events/{event_id}/budget")
async def get_budget(
    event_id: str,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Budget).where(Budget.event_id == uuid.UUID(event_id))
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Get all expenses
    exp_result = await db.execute(
        select(Expense).where(Expense.event_id == uuid.UUID(event_id))
    )
    expenses = exp_result.scalars().all()

    # Deterministic calculations — never rely on LLM for arithmetic
    total_actual = sum(float(e.amount) for e in expenses)
    total_budget = float(budget.total_budget)
    remaining = total_budget - total_actual
    contingency_amount = total_budget * float(budget.contingency_percentage) / 100

    return {
        "id": str(budget.id),
        "event_id": event_id,
        "total_budget": total_budget,
        "currency": budget.currency,
        "contingency_percentage": float(budget.contingency_percentage),
        "contingency_amount": contingency_amount,
        "total_actual": total_actual,
        "remaining": remaining,
        "remaining_after_contingency": remaining - contingency_amount,
        "budget_utilization_percent": round(total_actual / total_budget * 100, 1) if total_budget > 0 else 0,
        "category_allocations": budget.category_allocations or {},
        "expenses": [
            {
                "id": str(e.id),
                "category": e.category,
                "description": e.description,
                "amount": float(e.amount),
                "status": e.status,
                "expense_date": str(e.expense_date) if e.expense_date else None,
            }
            for e in expenses
        ],
    }


@router.post("/events/{event_id}/expenses", status_code=201)
async def add_expense(
    event_id: str,
    payload: ExpenseCreate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    # Get budget id
    result = await db.execute(
        select(Budget).where(Budget.event_id == uuid.UUID(event_id))
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    expense = Expense(
        id=uuid.uuid4(),
        budget_id=budget.id,
        event_id=uuid.UUID(event_id),
        category=payload.category,
        description=payload.description,
        amount=payload.amount,
        expense_date=payload.expense_date,
        vendor_id=uuid.UUID(payload.vendor_id) if payload.vendor_id else None,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(expense)
    await db.flush()

    return {
        "id": str(expense.id),
        "event_id": event_id,
        "category": expense.category,
        "description": expense.description,
        "amount": float(expense.amount),
        "status": expense.status,
    }


@router.patch("/events/{event_id}/budget")
async def update_budget(
    event_id: str,
    payload: BudgetUpdate,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Budget).where(Budget.event_id == uuid.UUID(event_id))
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if payload.total_budget is not None:
        budget.total_budget = payload.total_budget
    if payload.contingency_percentage is not None:
        budget.contingency_percentage = payload.contingency_percentage

    await db.flush()
    return {"id": str(budget.id), "total_budget": float(budget.total_budget)}
