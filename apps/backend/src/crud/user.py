"""User CRUD operations"""

from datetime import datetime
import bcrypt
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Depends
from loguru import logger
from src.core.database import get_database
from src.models.user import User, UserCreate
from src.core.config import settings

async def get_user_by_email(
    email: str,
    db: AsyncIOMotorDatabase
) -> User | None:
    """Retrieve a user by email"""
    user_dict = await db.users.find_one({"email": email})
    return User(**user_dict) if user_dict else None

async def create_user(
    user: UserCreate,
    db: AsyncIOMotorDatabase
) -> User:
    """Create a new user"""
    # Check if user already exists
    if await get_user_by_email(user.email, db):
        raise ValueError("User with this email already exists")
    
    # Hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode(), salt)
    
    # Create user document
    user_dict = {
        "email": user.email,
        "hashed_password": hashed_password.decode(),
        "roles": user.roles,
        "failed_attempts": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert into database
    await db.users.insert_one(user_dict)
    return User(**user_dict)

async def update_last_login(
    email: str,
    db: AsyncIOMotorDatabase
) -> bool:
    """Update user's last login time and reset failed attempts"""
    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "last_login": datetime.utcnow(),
                "failed_attempts": 0,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0

async def increment_failed_attempts(
    email: str,
    db: AsyncIOMotorDatabase
) -> int:
    """Increment failed login attempts for a user"""
    result = await db.users.find_one_and_update(
        {"email": email},
        {
            "$inc": {"failed_attempts": 1},
            "$set": {"updated_at": datetime.utcnow()}
        },
        return_document=True
    )
    return result["failed_attempts"] if result else 0

async def verify_password(
    user: User,
    password: str
) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(
            password.encode(),
            user.hashed_password.encode()
        )
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

async def update_password(
    email: str,
    new_password: str,
    db: AsyncIOMotorDatabase
) -> bool:
    """Update user's password"""
    # Hash the new password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(new_password.encode(), salt)
    
    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "hashed_password": hashed_password.decode(),
                "updated_at": datetime.utcnow()
            },
            "$unset": {
                "password_reset_token": "",
                "password_reset_expires": ""
            }
        }
    )
    return result.modified_count > 0

async def set_password_reset_token(
    email: str,
    token: str,
    expires_at: datetime,
    db: AsyncIOMotorDatabase
) -> bool:
    """Set password reset token for user"""
    result = await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "password_reset_token": token,
                "password_reset_expires": expires_at,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0

async def get_user_by_reset_token(
    token: str,
    db: AsyncIOMotorDatabase
) -> User | None:
    """Get user by password reset token"""
    user_dict = await db.users.find_one({
        "password_reset_token": token,
        "password_reset_expires": {"$gt": datetime.utcnow()}
    })
    return User(**user_dict) if user_dict else None

async def clear_password_reset_token(
    email: str,
    db: AsyncIOMotorDatabase
) -> bool:
    """Clear password reset token for user"""
    result = await db.users.update_one(
        {"email": email},
        {
            "$unset": {
                "password_reset_token": "",
                "password_reset_expires": ""
            },
            "$set": {
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count > 0
