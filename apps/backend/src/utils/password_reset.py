"""Password reset utilities."""

import secrets
from datetime import datetime, timedelta
from typing import Tuple


def generate_reset_token() -> str:
    """Generate a secure password reset token.
    
    Returns:
        str: A secure random token
    """
    return secrets.token_urlsafe(32)


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