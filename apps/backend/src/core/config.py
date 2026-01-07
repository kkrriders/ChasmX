"""Core application settings and configuration"""

from typing import List, Optional
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the backend directory (two levels up from this file)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    """Unified application settings"""

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "chasm_db"

    # JWT Settings
    JWT_SECRET_KEY: str  # Required from environment - MUST be set!
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OTP Settings
    OTP_SECRET_KEY: str  # Required from environment - MUST be set!

    # Password Settings
    MIN_PASSWORD_LENGTH: int = 8
    MAX_FAILED_ATTEMPTS: int = 5

    # CORS Settings - MUST be explicitly set in production
    # For development: use "http://localhost:3000,http://localhost:8000"
    # For production: specify exact domains, NEVER use "*"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # SMTP Settings for OTP emails
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465  # SSL port
    SMTP_USER: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "your-app-password"
    SMTP_SSL: bool = True

    # Environment
    ENV: str = "development"

    # OpenRouter Configuration (AI)
    OPENROUTER_API_KEY: str = ""

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None

    # Cache Configuration
    CACHE_DEFAULT_TTL: int = 3600  # 1 hour
    CACHE_ENABLED: bool = True

    # Agent Configuration
    MAX_AGENTS: int = 100
    AGENT_TIMEOUT: int = 300  # 5 minutes
    AGENT_MAX_RETRIES: int = 3

    # Model Configuration
    DEFAULT_COMMUNICATION_MODEL: str = "google/gemini-2.0-flash-exp:free"
    DEFAULT_REASONING_MODEL: str = "meta-llama/llama-3.3-70b-instruct:free"
    DEFAULT_CODE_MODEL: str = "qwen/qwen-2.5-coder-32b-instruct:free"
    DEFAULT_STRUCTURED_MODEL: str = "qwen/qwen-2.5-72b-instruct:free"

    # LLM Configuration
    LLM_TIMEOUT: int = 120
    LLM_MAX_RETRIES: int = 3
    LLM_DEFAULT_TEMPERATURE: float = 0.7
    LLM_DEFAULT_MAX_TOKENS: int = 2048

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def redis_connection_url(self) -> str:
        """Get Redis connection URL"""
        if self.REDIS_URL:
            return self.REDIS_URL

        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    def validate_required_settings(self) -> None:
        """Validate that all required settings are properly configured"""
        errors = []
        warnings = []

        # Insecure/default values to check against
        INSECURE_DEFAULTS = [
            "your-super-secret-jwt-key-here",
            "your-super-secret-otp-key-here",
            "secret",
            "password",
            "changeme",
            "test",
            "default"
        ]

        # Check JWT_SECRET_KEY
        if not self.JWT_SECRET_KEY:
            errors.append("JWT_SECRET_KEY must be set")
        elif self.JWT_SECRET_KEY.lower() in INSECURE_DEFAULTS or len(self.JWT_SECRET_KEY) < 32:
            errors.append("JWT_SECRET_KEY must be a secure random value (min 32 characters, not a default value)")

        # Check OTP_SECRET_KEY
        if not self.OTP_SECRET_KEY:
            errors.append("OTP_SECRET_KEY must be set")
        elif self.OTP_SECRET_KEY.lower() in INSECURE_DEFAULTS or len(self.OTP_SECRET_KEY) < 32:
            errors.append("OTP_SECRET_KEY must be a secure random value (min 32 characters, not a default value)")

        # Check MONGODB_URL
        if not self.MONGODB_URL:
            errors.append("MONGODB_URL must be set")

        # Check SMTP Settings for defaults
        if self.SMTP_USER == "your-email@gmail.com" or self.SMTP_PASSWORD == "your-app-password":
            warnings.append("SMTP credentials appear to be default values - email functionality will not work")

        # Production-specific validations
        if self.ENV == "production":
            # CORS must be specific in production
            if self.CORS_ORIGINS == "*":
                errors.append("CORS_ORIGINS must not be '*' in production - specify exact allowed domains")

            # API keys should be set
            if not self.OPENROUTER_API_KEY:
                warnings.append("OPENROUTER_API_KEY not set - AI features will not work")

            # Redis password should be set in production
            if not self.REDIS_PASSWORD and not self.REDIS_URL:
                warnings.append("REDIS_PASSWORD not set - Redis is running without authentication")

            # MongoDB should use secure connection
            if self.MONGODB_URL and not self.MONGODB_URL.startswith("mongodb+srv://"):
                warnings.append("MONGODB_URL should use secure connection (mongodb+srv://) in production")

        # Print warnings
        if warnings:
            import sys
            warning_message = "Configuration warnings:\n" + "\n".join(f"  ⚠️  {warning}" for warning in warnings)
            print(f"\n{warning_message}\n", file=sys.stderr)

        # Raise errors
        if errors:
            error_message = "❌ Configuration validation failed:\n" + "\n".join(f"  - {error}" for error in errors)
            raise ValueError(error_message)

settings = Settings()

# Always validate settings on import (will raise errors in production, warnings in dev)
settings.validate_required_settings()

# Backward compatibility aliases
ai_settings = settings
