"""Authentication routes for user registration and login.

This module provides the authentication endpoints for user registration and login.
It handles user creation, password verification, and JWT token generation.
"""

from typing import Dict
from fastapi import APIRouter, Body, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from app.core.database import get_database
from app.schemas.user import UserOut
from app.models.user import UserCreate, UserLogin
from app.crud.user import (
    get_user_by_email,
    create_user,
    verify_password,
    increment_failed_attempts,
    update_last_login
)
from app.auth.jwt import create_access_token

# Create router without prefix (prefix will be added in main.py)
router = APIRouter(tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate = Body(),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserOut:
    """Register a new user.
    
    Args:
        user_in: The user registration data
        db: Database instance from dependency injection
    
    Returns:
        UserOut: The created user data (excluding sensitive fields)
        
    Raises:
        HTTPException: 400 if email already registered
                      422 if validation fails
    """
    # Check if user already exists
    if await get_user_by_email(user_in.email, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    try:
        user = await create_user(user_in, db)
        logger.info(f"Registration: {user.email}")
        return UserOut.model_validate(user, from_attributes=True)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to an internal error"
        )

@router.post("/login", response_model=Dict)
async def login(
    user_in: UserLogin = Body(),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Authenticate a user and return an access token.
    
    Args:
        user_in: The login credentials
        db: Database instance from dependency injection
    
    Returns:
        Dict: Access token, token type and user data
        
    Raises:
        HTTPException: 401 for invalid credentials
                      422 if validation fails
    """
    # Get user by email
    user = await get_user_by_email(user_in.email, db)
    
    if not user:
        logger.warning(f"Login attempt with non-existent email: {user_in.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify credentials
    if not await verify_password(user, user_in.password):
        logger.warning(f"Failed password verification for user: {user_in.email}")
        await increment_failed_attempts(user_in.email, db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Update last login time
    await update_last_login(user_in.email, db)
    
    # Generate access token
    token = create_access_token({
        "sub": user.email,
        "roles": user.roles
    })
    
    logger.info(f"Login success: {user.email}")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }