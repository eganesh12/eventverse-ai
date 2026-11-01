"""Vendor marketplace endpoints."""

import uuid
import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.models.vendor import Vendor, VendorService, VendorQuote
from app.models.user import User
from app.api.v1.endpoints.auth import auth_dependency

router = APIRouter(tags=["Vendors"])


@router.get("/vendors")
async def list_vendors(
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    verified_only: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    query = select(Vendor).where(Vendor.active.is_(True))

    if category:
        query = query.where(Vendor.category == category)
    if city:
        query = query.where(Vendor.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.where(Vendor.starting_price >= min_price)
    if max_price is not None:
        query = query.where(Vendor.starting_price <= max_price)
    if verified_only:
        query = query.where(Vendor.verified.is_(True))
    if search:
        query = query.where(
            or_(
                Vendor.business_name.ilike(f"%{search}%"),
                Vendor.description.ilike(f"%{search}%"),
                Vendor.location.ilike(f"%{search}%"),
            )
        )

    count_q = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_q.scalar() or 0

    result = await db.execute(
        query.order_by(Vendor.verified.desc(), Vendor.rating.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    vendors = result.scalars().all()

    return {
        "items": [
            {
                "id": str(v.id),
                "business_name": v.business_name,
                "category": v.category,
                "description": v.description,
                "location": v.location,
                "city": v.city,
                "rating": float(v.rating),
                "review_count": v.review_count,
                "starting_price": float(v.starting_price),
                "currency": v.currency,
                "verified": v.verified,
                "avatar_url": v.avatar_url,
                "portfolio_images": v.portfolio_images or [],
                "services": [],
            }
            for v in vendors
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if total > 0 else 1,
    }


@router.get("/vendors/{vendor_id}")
async def get_vendor(vendor_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vendor).where(Vendor.id == uuid.UUID(vendor_id)))
    vendor = result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    services_result = await db.execute(
        select(VendorService).where(VendorService.vendor_id == vendor.id)
    )
    services = [
        {"id": str(s.id), "name": s.name, "description": s.description, "price": float(s.price), "unit": s.unit}
        for s in services_result.scalars()
    ]

    return {
        "id": str(vendor.id),
        "business_name": vendor.business_name,
        "category": vendor.category,
        "description": vendor.description,
        "location": vendor.location,
        "city": vendor.city,
        "rating": float(vendor.rating),
        "review_count": vendor.review_count,
        "starting_price": float(vendor.starting_price),
        "currency": vendor.currency,
        "verified": vendor.verified,
        "portfolio_images": vendor.portfolio_images or [],
        "services": services,
    }


@router.post("/vendor-quotes", status_code=201)
async def request_quote(
    payload: dict,
    current_user: User = Depends(auth_dependency),
    db: AsyncSession = Depends(get_db),
):
    """Request a quote from a vendor for a specific event."""
    vendor_id = payload.get("vendor_id")
    event_id = payload.get("event_id")
    if not vendor_id or not event_id:
        raise HTTPException(status_code=422, detail="vendor_id and event_id are required")

    quote = VendorQuote(
        id=uuid.uuid4(),
        vendor_id=uuid.UUID(vendor_id),
        event_id=uuid.UUID(event_id),
        requested_by=current_user.id,
        requirements=payload.get("requirements"),
        status="pending",
    )
    db.add(quote)
    await db.flush()

    return {
        "id": str(quote.id),
        "vendor_id": vendor_id,
        "event_id": event_id,
        "status": "pending",
        "message": "Quote request submitted. The vendor will respond within 24-48 hours.",
    }
