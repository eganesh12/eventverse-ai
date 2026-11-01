"""Main v1 API router — aggregates all endpoint routers."""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, events, ai, vendors, guests, budget

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(events.router)
api_router.include_router(ai.router)
api_router.include_router(vendors.router)
api_router.include_router(guests.router)
api_router.include_router(budget.router)
