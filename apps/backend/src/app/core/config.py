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
    JWT_SECRET_KEY: str  # Required from environment
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OTP Settings
    OTP_SECRET_KEY: str  # Required from environment

    # Password Settings
    MIN_PASSWORD_LENGTH: int = 8
    MAX_FAILED_ATTEMPTS: int = 5

    # CORS Settings
    CORS_ORIGINS: str = "*"  # Default to all origins

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

settings = Settings()

# Backward compatibility aliases
ai_settings = settings
