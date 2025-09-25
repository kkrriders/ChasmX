

from typing import Dict
from fastapi import APIRouter, Body, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from app.utils.otp import generate_otp, verify_otp, update_user_otp
from app.utils.email import send_otp_email
from app.schemas.otp import OTPVerify

from app.core.database import get_database
from app.core.config import settings
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

@router.post("/login")
async def login(
    user_in: UserLogin = Body(),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Authenticate a user and send OTP.
    
    Args:
        user_in: The login credentials
        db: Database instance from dependency injection
    
    Returns:
        Dict: Success message after sending OTP
        
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

    # Check if account is locked due to too many failed attempts
    if user.failed_attempts >= settings.MAX_FAILED_ATTEMPTS:
        logger.warning(f"Account locked for user: {user_in.email} (failed attempts: {user.failed_attempts})")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account locked due to too many failed attempts"
        )
    
    # Verify credentials
    if not await verify_password(user, user_in.password):
        logger.warning(f"Failed password verification for user: {user_in.email}")
        await increment_failed_attempts(user_in.email, db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate and send OTP
    try:
        code, hashed_otp = await generate_otp(user.email)
        if not await update_user_otp(user.email, hashed_otp, db):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save OTP"
            )
        
        if not await send_otp_email(user.email, code):
            logger.error(f"Failed to send OTP email to {user.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP"
            )
        
        return {"message": "OTP sent for verification"}
    except Exception as e:
        logger.error(f"OTP generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate OTP"
        )
    
@router.post("/check-user", response_model=Dict)
async def check_user_exists(
    email: str = Body(..., embed=True),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Check if a user exists by email.

    Args:
        email: Email address to check
        db: Database instance from dependency injection

    Returns:
        Dict: Contains 'exists' boolean indicating if user exists
    """
    user = await get_user_by_email(email, db)
    return {"exists": user is not None}

@router.post("/verify-otp", response_model=Dict)
async def verify_otp_endpoint(
    user_in: OTPVerify = Body(),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Verify OTP and complete authentication.
    
    Args:
        user_in: The OTP verification data
        db: Database instance from dependency injection
    
    Returns:
        Dict: Access token and user data on success
        
    Raises:
        HTTPException: 400 for invalid/expired OTP
                      422 if validation fails
    """
    try:
        # Verify OTP
        if await verify_otp(user_in.email, user_in.otp, db):
            # Get user details
            user = await get_user_by_email(user_in.email, db)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User not found"
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
                "user": UserOut.model_validate(user, from_attributes=True)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Verification failed due to an internal error"
        )