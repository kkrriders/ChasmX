# app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ChasmX"
    DEBUG: bool = True
    ALLOWED_ORIGINS: list = ["*"]  # For CORS

settings = Settings()
