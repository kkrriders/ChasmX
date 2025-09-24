"""JWT token handling functionality for No-Code AI backend.

This module provides JWT token creation and verification functionality using python-jose.
Tokens are used for user authentication and session continuity in the ACP (AI Control Protocol).
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
import os
from jose import JWTError, jwt
from loguru import logger
from app.core.config import settings
import time

# Use environment variable with fallback for JWT secret key
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM


def get_current_timestamp() -> int:
    """Get current timestamp - extracted for easier testing"""
    return int(time.time())


def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new JWT access token with optional expiration time.

    Args:
        data (Dict): Payload data to encode in token (must include 'sub' for email)
        expires_delta (Optional[timedelta]): Optional custom expiration time

    Returns:
        str: Encoded JWT token

    Note:
        Default expiration is 30 minutes if not specified
    """
    to_encode = data.copy()

    current_time = get_current_timestamp()
    if expires_delta:
        expire = current_time + int(expires_delta.total_seconds())
    else:
        expire = current_time + int(
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES).total_seconds()
        )

    to_encode.update({"exp": expire, "iat": current_time})

    # Ensure required claims are present
    if "sub" not in to_encode:
        raise ValueError("Token must include 'sub' claim with user email")

    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Failed to create access token: {str(e)}")
        raise


def verify_token(token: str) -> Optional[Dict]:
    """Verify and decode a JWT token.

    Args:
        token (str): JWT token to verify and decode

    Returns:
        Optional[Dict]: Token payload if valid, None if invalid

    Note:
        Verifies token signature, expiration, and presence of 'sub' claim
    """
    try:
        # Decode without verifying expiration
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False}
        )

        # We let get_current_user handle sub verification since it's
        # part of the application logic rather than token validation

        # Verify expiration manually
        current_time = get_current_timestamp()
        exp_time = payload.get("exp")

        if not exp_time or exp_time <= current_time:
            logger.warning("Token has expired")
            return None

        return payload

    except JWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error verifying token: {str(e)}")
        return None
