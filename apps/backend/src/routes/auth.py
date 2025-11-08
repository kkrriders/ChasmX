

from typing import Dict, Annotated
from fastapi import APIRouter, Body, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.utils.otp import generate_otp, verify_otp, update_user_otp
from src.utils.email import send_otp_email, send_password_reset_email, send_password_changed_notification
from src.utils.password_reset import generate_reset_token, get_reset_token_expiry
from src.schemas.otp import OTPVerify

from src.core.database import get_database
from src.core.config import settings
from src.schemas.user import UserOut
from src.models.user import UserCreate, UserLogin, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, User
from src.crud.user import (
    get_user_by_email,
    create_user,
    verify_password,
    increment_failed_attempts,
    update_last_login,
    update_password,
    set_password_reset_token,
    get_user_by_reset_token,
    clear_password_reset_token
)
from src.auth.jwt import create_access_token
from src.auth.dependencies import get_current_user

# Create router without prefix (prefix will be added in main.py)
router = APIRouter(tags=["auth"])

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
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
@limiter.limit("10/minute")
async def login(
    request: Request,
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
@limiter.limit("20/minute")
async def check_user_exists(
    request: Request,
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
@limiter.limit("5/minute")
async def verify_otp_endpoint(
    request: Request,
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

@router.post("/resend-otp", response_model=Dict)
@limiter.limit("3/minute")
async def resend_otp(
    request: Request,
    email: str = Body(..., embed=True),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Resend OTP code to user's email.

    Args:
        email: User's email address
        db: Database instance from dependency injection

    Returns:
        Dict: Success message after sending OTP

    Raises:
        HTTPException: 400 if user not found
                      500 if OTP generation/sending fails
    """
    # Check if user exists
    user = await get_user_by_email(email, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    # Generate and send new OTP
    try:
        code, hashed_otp = await generate_otp(email)
        if not await update_user_otp(email, hashed_otp, db):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save OTP"
            )

        if not await send_otp_email(email, code):
            logger.error(f"Failed to send OTP email to {email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP"
            )

        logger.info(f"OTP resent to {email}")
        return {"message": "OTP sent successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend OTP error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend OTP"
        )


@router.post("/change-password")
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    password_request: ChangePasswordRequest = Body(),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Change user password with current password verification.
    
    Args:
        password_request: Current and new password data
        current_user: Current authenticated user
        db: Database instance from dependency injection
        
    Returns:
        Dict: Success message
        
    Raises:
        HTTPException: 400 for invalid current password
                      500 for server errors
    """
    try:
        # Verify current password
        if not await verify_password(current_user, password_request.current_password):
            logger.warning(f"Failed current password verification for user: {current_user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update to new password
        if not await update_password(current_user.email, password_request.new_password, db):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        # Send confirmation email
        await send_password_changed_notification(current_user.email)
        
        logger.info(f"Password changed successfully for user: {current_user.email}")
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    forgot_request: ForgotPasswordRequest = Body(),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Initiate password reset flow via email.
    
    Args:
        forgot_request: Email for password reset
        db: Database instance from dependency injection
        
    Returns:
        Dict: Success message (always returns success for security)
        
    Note:
        Always returns success message even if email doesn't exist
        for security reasons (prevents email enumeration)
    """
    try:
        # Check if user exists
        user = await get_user_by_email(forgot_request.email, db)
        
        if user:
            # Generate reset token
            reset_token = generate_reset_token()
            expires_at = get_reset_token_expiry()
            
            # Save reset token
            if await set_password_reset_token(forgot_request.email, reset_token, expires_at, db):
                # Send reset email
                await send_password_reset_email(forgot_request.email, reset_token)
                logger.info(f"Password reset initiated for user: {forgot_request.email}")
            else:
                logger.error(f"Failed to save reset token for user: {forgot_request.email}")
        else:
            logger.info(f"Password reset requested for non-existent email: {forgot_request.email}")
        
        # Always return success message for security
        return {"message": "If the email exists, a password reset link has been sent"}
        
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        # Still return success message to avoid revealing errors
        return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    reset_request: ResetPasswordRequest = Body(),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict:
    """Complete password reset with token.
    
    Args:
        reset_request: Reset token and new password
        db: Database instance from dependency injection
        
    Returns:
        Dict: Success message
        
    Raises:
        HTTPException: 400 for invalid/expired token
                      500 for server errors
    """
    try:
        # Find user by reset token
        user = await get_user_by_reset_token(reset_request.token, db)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Update password
        if not await update_password(user.email, reset_request.new_password, db):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        # Send confirmation email
        await send_password_changed_notification(user.email)
        
        logger.info(f"Password reset completed for user: {user.email}")
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
        )