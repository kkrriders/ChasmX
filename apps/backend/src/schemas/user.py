"""User response schemas.

This module defines the Pydantic schemas for user-related API responses.
Includes models for safe data return without sensitive information.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
from src.core.config import settings

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

class UserUpdate(BaseModel):
    """Schema for user profile update"""
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    company: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "first_name": "John",
                "last_name": "Doe", 
                "email": "john.doe@example.com",
                "company": "Acme Corp",
                "bio": "Software engineer with 5+ years experience"
            }
        }
    )
    
    @field_validator("first_name", "last_name", "company")
    @classmethod
    def validate_string_fields(cls, v: Optional[str]) -> Optional[str]:
        """Validate string fields are not empty and trimmed"""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
        return v
    
    @field_validator("bio")
    @classmethod 
    def validate_bio(cls, v: Optional[str]) -> Optional[str]:
        """Validate bio field"""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
        return v

class UserOut(BaseModel):
    """User response model without sensitive data.
    
    This model is used for API responses and excludes sensitive fields 
    like hashed_password and internal tracking fields.
    """
    email: EmailStr
    roles: List[str]
    created_at: datetime
    last_login: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "roles": ["business_user"],
                "created_at": "2025-09-23T10:00:00",
                "last_login": "2025-09-23T11:00:00",
                "first_name": "John",
                "last_name": "Doe",
                "company": "Acme Corp",
                "bio": "Software engineer with 5+ years experience"
            }
        },
        from_attributes=True  # Allow model creation from class/dict with attributes
    )

class ChangePasswordRequest(BaseModel):
    """Schema for changing password with current password verification"""
    current_password: str
    new_password: str
    
    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate new password meets minimum requirements"""
        # Using hardcoded values to avoid circular import issue
        MIN_PASSWORD_LENGTH = 8
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v

class ForgotPasswordRequest(BaseModel):
    """Schema for initiating password reset"""
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    """Schema for completing password reset with token"""
    token: str
    new_password: str
    
    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate new password meets minimum requirements"""
        # Using hardcoded values to avoid circular import issue
        MIN_PASSWORD_LENGTH = 8
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v