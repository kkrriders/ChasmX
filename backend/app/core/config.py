"""Core application settings and configuration"""

from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "chasm_db"
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-secret-key-here"  # Change in production
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
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
    
    class Config:
        env_file = ".env"

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()
