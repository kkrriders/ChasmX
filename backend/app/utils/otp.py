"""OTP generation and verification utilities."""

from datetime import datetime, timedelta
from typing import Tuple
from fastapi import HTTPException, status
import pyotp
from passlib.hash import sha256_crypt
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from app.crud.user import get_user_by_email
from app.models.user import User
from app.core.config import settings

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Clear used OTP
    await clear_user_otp(email, db)
    return True

async def clear_user_otp(email: str, db: AsyncIOMotorDatabase) -> bool:
    """Clear user's OTP and expiry time from database.
    
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
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0