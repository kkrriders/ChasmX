"""User model definitions"""

from datetime import datetime
from typing import List, Optional, Any
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator, ConfigDict, BeforeValidator
from typing_extensions import Annotated
from app.core.config import settings

# Custom type for MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(lambda x: str(x) if isinstance(x, ObjectId) else x)]

class User(BaseModel):
    """User model with role-based access control"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")  # MongoDB _id
    email: EmailStr
    hashed_password: str
    roles: List[str] = Field(default_factory=lambda: ["business_user"])
    failed_attempts: int = Field(default=0, ge=0)
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    otp_code: Optional[str] = None
    otp_expiry: Optional[datetime] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "hashed_password": "hashed_string_here",
                "roles": ["business_user"],
                "failed_attempts": 0
            }
        },
        populate_by_name=True,  # Allow both id and _id
        arbitrary_types_allowed=True  # For MongoDB ObjectId
    )

class UserCreate(BaseModel):
    """Schema for user creation"""
    email: EmailStr
    password: str
    roles: List[str] = Field(default_factory=lambda: ["business_user"])
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "password": "StrongPass123!",
                "roles": ["business_user"]
            }
        }
    )
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password meets minimum requirements"""
        if len(v) < settings.MIN_PASSWORD_LENGTH:
            raise ValueError(
                f"Password must be at least {settings.MIN_PASSWORD_LENGTH} characters long"
            )
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v
    
    @field_validator("roles")
    @classmethod
    def validate_roles(cls, v: List[str]) -> List[str]:
        """Validate user roles"""
        valid_roles = {"business_user", "admin", "compliance_officer"}
        if not all(role in valid_roles for role in v):
            raise ValueError(f"Invalid roles. Must be one of: {valid_roles}")
        if "business_user" not in v:
            v.append("business_user")  # Ensure business_user is always included
        return v

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class UserOut(BaseModel):
    """Schema for user response without sensitive data"""
    email: EmailStr
    roles: List[str]
    last_login: Optional[datetime] = None
    created_at: datetime
