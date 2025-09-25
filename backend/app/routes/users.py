"""User routes for the API.

This module defines the user-related routes including protected endpoints for 
user profile access and administrative user management.
"""

from typing import Annotated, Dict, List
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from app.auth.dependencies import get_current_user, verify_role
from app.core.database import get_database
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/me", response_model=UserOut)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> UserOut:
    """Get details of currently authenticated user.
    
    Args:
        current_user: The authenticated user from token validation
        
    Returns:
        UserOut: The user profile with sensitive data excluded
        
    Notes:
        - Requires valid JWT token
        - Accessible by all authenticated users
    """
    logger.info(f"User profile accessed: {current_user.email}")
    return UserOut.model_validate(current_user)

@router.get("/admin/users", response_model=Dict[str, List[UserOut] | int])
async def list_users(
    current_user: Annotated[User, Depends(verify_role(["admin", "compliance_officer"]))],
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = 100
) -> Dict[str, List[UserOut] | int]:
    """List all users in the system.
    
    Args:
        current_user: The authenticated admin/compliance user
        db: Database connection from dependency
        limit: Maximum number of users to return (default: 100)
        
    Returns:
        Dict containing:
            - users: List of user profiles
            - count: Total number of users returned
            
    Notes:
        - Requires valid JWT token
        - Accessible only by admin and compliance_officer roles
        - Paginated with default limit of 100 users
        - Returns users with sensitive data excluded
    """
    # Get users collection cursor
    cursor = db.users.find({})
    
    # Convert cursor to list with limit
    users = await cursor.to_list(length=limit)
    
    # Log the access
    logger.info(
        f"Admin user list accessed by: {current_user.email} "
        f"(role: {', '.join(current_user.roles)})"
    )
    
    return {
        "users": [UserOut.model_validate(user) for user in users],
        "count": len(users)
    }
