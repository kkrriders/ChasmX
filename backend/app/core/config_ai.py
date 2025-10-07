"""
Configuration for AI/Agent services.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class AISettings(BaseSettings):
    """AI and Agent system configuration"""

    # OpenRouter Configuration
    OPENROUTER_API_KEY: str

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

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def redis_connection_url(self) -> str:
        """Get Redis connection URL"""
        if self.REDIS_URL:
            return self.REDIS_URL

        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


# Global settings instance
ai_settings = AISettings()
