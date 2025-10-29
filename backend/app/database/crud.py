

from datetime import datetime
from typing import Optional

from loguru import logger
from passlib.context import CryptContext
from pymongo.errors import PyMongoError
from pydantic import EmailStr

from app.database.client import get_users_collection
from app.models.user import User
from app.schemas.user import UserCreate

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_user(user_in: UserCreate) -> User:
    """
    Create a new user after checking for email duplicates and hashing the password.
    
    Args:
        user_in (UserCreate): User creation data including email and password
        
    Returns:
        User: Created user object
        
    Raises:
        ValueError: If email already exists
        PyMongoError: For database operation failures
    """
    try:
        # Check for existing user with same email
        if await get_user_by_email(user_in.email):
            raise ValueError(f"User with email {user_in.email} already exists")
        
        # Hash the password
        hashed_password = pwd_context.hash(user_in.password)
        
        # Prepare user data for insertion
        user_data = {
            "email": user_in.email,
            "hashed_password": hashed_password,
            "roles": user_in.roles,
            "is_active": True,
            "failed_login_attempts": 0,
            "last_login": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert the user
        collection = get_users_collection()
        result = await collection.insert_one(user_data)
        
        # Get the created user
        created_user = await collection.find_one({"_id": result.inserted_id})
        logger.info(f"User created: {user_in.email}")
        
        return User.model_validate(created_user)
        
    except PyMongoError as e:
        logger.error(f"Database error while creating user: {str(e)}")
        raise


async def get_user_by_email(email: EmailStr) -> Optional[User]:
    
    try:
        collection = get_users_collection()
        doc = await collection.find_one({"email": email})
        
        if doc:
            return User.model_validate(doc)
        return None
        
    except PyMongoError as e:
        logger.error(f"Database error while retrieving user: {str(e)}")
        raise


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


async def update_last_login(email: EmailStr) -> bool:
    """
    Update the last login timestamp for a user.
    
    Args:
        email (EmailStr): Email of the user
        
    Returns:
        bool: True if update successful, False if user not found
        
    Raises:
        PyMongoError: For database operation failures
    """
    try:
        collection = get_users_collection()
        result = await collection.update_one(
            {"email": email},
            {
                "$set": {
                    "last_login": datetime.utcnow(),
                    "failed_login_attempts": 0  # Reset failed attempts on successful login
                }
            }
        )
        
        if result.modified_count > 0:
            logger.info(f"Updated last login for user: {email}")
            return True
        logger.warning(f"User not found for login update: {email}")
        return False
        
    except PyMongoError as e:
        logger.error(f"Database error while updating last login: {str(e)}")
        raise


async def increment_failed_attempts(email: EmailStr) -> bool:
    """
    Increment the failed login attempts counter for a user.
    
    Args:
        email (EmailStr): Email of the user
        
    Returns:
        bool: True if update successful, False if user not found
        
    Raises:
        PyMongoError: For database operation failures
    """
    try:
        collection = get_users_collection()
        result = await collection.update_one(
            {"email": email},
            {
                "$inc": {"failed_login_attempts": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            logger.warning(f"Incremented failed attempts for user: {email}")
            return True
        logger.warning(f"User not found for failed attempts increment: {email}")
        return False
        
    except PyMongoError as e:
        logger.error(f"Database error while incrementing failed attempts: {str(e)}")
        raise