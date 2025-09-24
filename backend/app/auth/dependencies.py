"""Authentication and authorization dependencies for FastAPI.

This module provides dependencies for user authentication and role-based access control (RBAC).
It integrates with JWT token verification and MongoDB user operations.
"""

from typing import Annotated, List, Callable, Any
from functools import wraps
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from app.models.user import User
from app.core.database import get_database
from app.crud.user import get_user_by_email, update_last_login
from app.auth.jwt import verify_token

# Security scheme for Bearer token authentication
security = HTTPBearer(auto_error=True)

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> User:
    """Get the current authenticated user from bearer token.

    Args:
        credentials: The HTTP Authorization credentials containing the bearer token
        db: The database connection from FastAPI dependency injection

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: 401 if unauthorized/invalid token, 404 if user not found
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Missing 'sub' claim",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Missing 'sub' claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await get_user_by_email(email, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update last login time
    await update_last_login(email, db)
    logger.info(f"Access granted for user: {email}")

    return user

def verify_role(required_roles: List[str]) -> Callable:
    """Create a dependency that verifies user has required roles.

    Args:
        required_roles: List of role names required for access

    Returns:
        FastAPI dependency function that checks user roles
    """
    async def role_verifier(
        current_user: Annotated[User, Depends(get_current_user)]
    ) -> User:
        # Check if user has any of the required roles
        has_role = any(role in current_user.roles for role in required_roles)

        if not has_role:
            logger.warning(
                f"Access denied - User {current_user.email} lacks required roles: {required_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        return current_user

    return role_verifier