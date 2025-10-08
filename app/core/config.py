# app/core/config.py
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), "../../backend/.env"))


class Settings(BaseSettings):
    PROJECT_NAME: str = "ChasmX"
    DEBUG: bool = True
    ALLOWED_ORIGINS: list = ["*"]  # For CORS

settings = Settings()

# MongoDB settings from environment variables
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "chasmx")
