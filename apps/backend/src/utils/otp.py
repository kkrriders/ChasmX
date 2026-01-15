"""OTP generation and verification utilities."""

from datetime import datetime, timedelta
from typing import Tuple
from fastapi import HTTPException, status
import pyotp
from passlib.hash import sha256_crypt
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from src.crud.user import get_user_by_email
from src.models.user import User
from src.core.config import settings

async def generate_otp(email: str) -> Tuple[str, str]:
    """Generate a new OTP for the given email.
    
    Args:
        email: User's email address
        
    Returns:
        Tuple containing:
            - plain OTP code (for sending via email)
            - hashed OTP code (for storing in DB)
    """
    totp = pyotp.TOTP(settings.OTP_SECRET_KEY, interval=300)  # 5 minute expiry
    code = totp.now()
    hashed_otp = sha256_crypt.hash(code)
    
    logger.info(f"Generated OTP for {email}")
    return code, hashed_otp

async def update_user_otp(
    email: str,
    hashed_otp: str,
    db: AsyncIOMotorDatabase
) -> bool:
    """Update user's OTP and expiry time in database.

    Also resets failed attempts and lockout when new OTP is generated.

    Args:
        email: User's email address
        hashed_otp: Hashed OTP code
        db: Database connection

    Returns:
        bool: True if update successful
    """
    expiry = datetime.utcnow() + timedelta(minutes=5)
    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "otp_code": hashed_otp,
                "otp_expiry": expiry,
                "otp_failed_attempts": 0,  # Reset failed attempts
                "otp_locked_until": None,   # Clear lockout
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0

async def verify_otp(
    email: str,
    otp: str,
    db: AsyncIOMotorDatabase
) -> bool:
    """Verify an OTP code for a user.

    Args:
        email: User's email address
        otp: Plain OTP code to verify
        db: Database connection

    Returns:
        bool: True if OTP is valid

    Raises:
        HTTPException: If OTP is invalid or expired
    """
    user = await get_user_by_email(email, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email"
        )

    # Check if account is temporarily locked due to failed OTP attempts
    if user.otp_locked_until and datetime.utcnow() < user.otp_locked_until:
        remaining_seconds = int((user.otp_locked_until - datetime.utcnow()).total_seconds())
        remaining_minutes = remaining_seconds // 60
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed OTP attempts. Account locked for {remaining_minutes} more minute(s). Please request a new OTP after the lockout period."
        )

    # Check if lockout period has expired - reset attempts
    if user.otp_locked_until and datetime.utcnow() >= user.otp_locked_until:
        await reset_otp_lockout(email, db)
        user = await get_user_by_email(email, db)  # Refresh user data

    if not user.otp_code or not user.otp_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP requested"
        )

    if datetime.utcnow() > user.otp_expiry:
        # Clear expired OTP
        await clear_user_otp(email, db)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    if not sha256_crypt.verify(otp, user.otp_code):
        # Increment failed attempts
        new_attempts = await increment_otp_failed_attempts(email, db)

        # Lock account after 3 failed attempts
        if new_attempts >= settings.MAX_OTP_ATTEMPTS:
            await lock_otp_attempts(email, db)
            logger.warning(f"OTP account locked for {email} after {new_attempts} failed attempts")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed OTP attempts. Account locked for {settings.OTP_LOCKOUT_MINUTES} minutes. Please request a new OTP after the lockout period."
            )

        remaining_attempts = settings.MAX_OTP_ATTEMPTS - new_attempts
        logger.warning(f"Failed OTP verification for {email}. {remaining_attempts} attempt(s) remaining")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP. {remaining_attempts} attempt(s) remaining before account lockout."
        )

    # Clear used OTP and reset failed attempts on success
    await clear_user_otp(email, db)
    return True

async def clear_user_otp(email: str, db: AsyncIOMotorDatabase) -> bool:
    """Clear user's OTP and expiry time from database.

    Also resets failed attempts counter on successful verification.

    Args:
        email: User's email address
        db: Database connection

    Returns:
        bool: True if update successful
    """
    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "otp_code": None,
                "otp_expiry": None,
                "otp_failed_attempts": 0,
                "otp_locked_until": None,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0


async def increment_otp_failed_attempts(email: str, db: AsyncIOMotorDatabase) -> int:
    """Increment failed OTP attempts counter.

    Args:
        email: User's email address
        db: Database connection

    Returns:
        int: New number of failed attempts
    """
    result = await db.users.find_one_and_update(
        {"email": email},
        {
            "$inc": {"otp_failed_attempts": 1},
            "$set": {"updated_at": datetime.utcnow()}
        },
        return_document=True
    )
    return result["otp_failed_attempts"] if result else 0


async def lock_otp_attempts(email: str, db: AsyncIOMotorDatabase) -> bool:
    """Lock account from OTP attempts for a specified duration.

    Args:
        email: User's email address
        db: Database connection

    Returns:
        bool: True if update successful
    """
    lockout_minutes = getattr(settings, 'OTP_LOCKOUT_MINUTES', 15)
    locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)

    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "otp_locked_until": locked_until,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0


async def reset_otp_lockout(email: str, db: AsyncIOMotorDatabase) -> bool:
    """Reset OTP lockout and failed attempts after lockout period expires.

    Args:
        email: User's email address
        db: Database connection

    Returns:
        bool: True if update successful
    """
    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "otp_failed_attempts": 0,
                "otp_locked_until": None,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0