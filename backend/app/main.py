"""
EventVerse AI – FastAPI Application Entry Point

Configures CORS, middleware, error handlers, WebSocket support,
health checks, and mounts the v1 API router.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO if not settings.APP_DEBUG else logging.DEBUG)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info(f"EventVerse AI starting — environment: {settings.APP_ENV}")
    logger.info(f"AI provider: {settings.DEFAULT_LLM_PROVIDER} — available: {settings.ai_available}")
    yield
    logger.info("EventVerse AI shutting down")


app = FastAPI(
    title="EventVerse AI API",
    description="Intelligent Event Planning & Management Platform — REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Error handlers ────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )


# ── Routes ────────────────────────────────────────────────────
app.include_router(api_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "EventVerse AI",
        "version": "1.0.0",
        "status": "operational",
        "ai_available": settings.ai_available,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "ai_provider": settings.DEFAULT_LLM_PROVIDER,
        "ai_configured": settings.ai_available,
        "environment": settings.APP_ENV,
    }
