"""User routes for the API.

This module defines the user-related routes including protected endpoints for 
user profile access and administrative user management.
"""

from typing import Annotated, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger
from datetime import datetime

from src.auth.dependencies import get_current_user, verify_role
from src.core.database import get_database
from src.models.user import User
from src.schemas.user import UserOut, UserUpdate
from src.schemas.preferences import NotificationPreferencesOut, NotificationPreferencesUpdate
from src.services.notification_preferences_service import get_notification_preferences_service

router = APIRouter(
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

@router.put("/me", response_model=UserOut)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserOut:
    """Update the profile of the currently authenticated user.
    
    Args:
        user_update: The user update data
        current_user: The authenticated user from token validation
        db: Database connection from dependency
        
    Returns:
        UserOut: The updated user profile with sensitive data excluded
        
    Notes:
        - Requires valid JWT token
        - Only updates provided fields (partial update)
        - Email updates require validation
        - Accessible by all authenticated users
    """
    logger.info(f"User profile update requested: {current_user.email}")
    
    # Prepare update data - only include fields that were provided
    update_data = {}
    
    # Handle each field individually
    if user_update.first_name is not None:
        update_data["first_name"] = user_update.first_name
    if user_update.last_name is not None:
        update_data["last_name"] = user_update.last_name
    if user_update.company is not None:
        update_data["company"] = user_update.company
    if user_update.bio is not None:
        update_data["bio"] = user_update.bio
    
    # Handle email update separately (might need additional validation)
    if user_update.email is not None and user_update.email != current_user.email:
        # Check if email is already taken
        existing_user = await db.users.find_one({"email": user_update.email})
        if existing_user and str(existing_user["_id"]) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        update_data["email"] = user_update.email
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # If no fields to update, return current user
    if not update_data:
        logger.info(f"No fields to update for user: {current_user.email}")
        return UserOut.model_validate(current_user)
    
    # Update user in database
    from bson import ObjectId
    user_object_id = ObjectId(current_user.id) if isinstance(current_user.id, str) else current_user.id
    
    result = await db.users.update_one(
        {"_id": user_object_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Fetch and return updated user
    updated_user = await db.users.find_one({"_id": user_object_id})
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found after update"
        )
    
    logger.info(f"User profile updated successfully: {current_user.email}")
    return UserOut.model_validate(updated_user)

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

# Notification Preferences Endpoints

@router.get("/me/preferences/notifications", response_model=NotificationPreferencesOut)
async def get_notification_preferences(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> NotificationPreferencesOut:
    """Get notification preferences for the current user.
    
    Args:
        current_user: The authenticated user from token validation
        db: Database connection from dependency
        
    Returns:
        NotificationPreferencesOut: The user's notification preferences
        
    Notes:
        - Requires valid JWT token
        - Creates default preferences if none exist
        - Accessible by all authenticated users
    """
    logger.info(f"Getting notification preferences for user: {current_user.email}")
    
    preferences_service = get_notification_preferences_service(db)
    return await preferences_service.get_user_preferences(str(current_user.id))

@router.put("/me/preferences/notifications", response_model=NotificationPreferencesOut)
async def update_notification_preferences(
    preferences_update: NotificationPreferencesUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> NotificationPreferencesOut:
    """Update notification preferences for the current user.
    
    Args:
        preferences_update: The notification preferences update data
        current_user: The authenticated user from token validation
        db: Database connection from dependency
        
    Returns:
        NotificationPreferencesOut: The updated notification preferences
        
    Notes:
        - Requires valid JWT token
        - Only updates provided fields (partial update)
        - Creates default preferences if none exist
        - Accessible by all authenticated users
    """
    logger.info(f"Updating notification preferences for user: {current_user.email}")
    
    preferences_service = get_notification_preferences_service(db)
    return await preferences_service.update_user_preferences(
        str(current_user.id), 
        preferences_update
    )
