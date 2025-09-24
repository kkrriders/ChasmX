"""Authentication package initialization"""

# Auth dependencies import removed
from app.auth.jwt import create_access_token, verify_token

__all__ = ["create_access_token", "verify_token"]
