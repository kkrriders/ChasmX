"""Routes package initialization.

Exports route modules for app registration.
"""

from .auth import router as auth_router
from .users import router as users_router

__all__ = ["auth_router", "users_router"]
