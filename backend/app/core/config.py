"""Application configuration loaded from environment variables."""

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "change-me-in-production"
    APP_DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/eventverse"
    SYNC_DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/eventverse"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "change-this-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    JWT_REFRESH_EXPIRY_DAYS: int = 7

    # AI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    DEFAULT_LLM_PROVIDER: str = "openai"

    # Storage
    STORAGE_PROVIDER: str = "supabase"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "eventverse-assets"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: Optional[str] = None

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@eventverse.ai"

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Sentry
    SENTRY_DSN: Optional[str] = None

    @property
    def ai_available(self) -> bool:
        if self.DEFAULT_LLM_PROVIDER == "openai":
            return bool(self.OPENAI_API_KEY)
        elif self.DEFAULT_LLM_PROVIDER == "gemini":
            return bool(self.GEMINI_API_KEY)
        return False


settings = Settings()
