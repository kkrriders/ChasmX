"""Password reset utilities."""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Tuple


def generate_reset_token() -> str:
    """Generate a secure password reset token.

    Returns:
        str: A secure random token
    """
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    """Hash a reset token for secure storage.

    Args:
        token: The plaintext reset token

    Returns:
        str: SHA-256 hash of the token
    """
    return hashlib.sha256(token.encode()).hexdigest()


def get_reset_token_expiry() -> datetime:
    """Get expiry time for password reset token.
    
    Returns:
        datetime: Expiry time (1 hour from now)
    """
    return datetime.utcnow() + timedelta(hours=1)


def is_token_expired(expires_at: datetime) -> bool:
    """Check if a reset token has expired.
    
    Args:
        expires_at: Token expiry time
        
    Returns:
        bool: True if token has expired
    """
    return datetime.utcnow() > expires_at