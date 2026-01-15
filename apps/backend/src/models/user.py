"""User model definitions"""

from datetime import datetime
from typing import List, Optional, Any
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator
from typing_extensions import Annotated

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
    updated_at: Optional[datetime] = None
    otp_code: Optional[str] = None
    otp_expiry: Optional[datetime] = None
    otp_failed_attempts: int = Field(default=0, ge=0)
    otp_locked_until: Optional[datetime] = None
    
    # 2FA flag
    is_2fa_enabled: bool = Field(default=False)
    
    # Password reset fields (token is stored as SHA-256 hash for security)
    password_reset_token: Optional[str] = None  # Hashed with SHA-256
    password_reset_expires: Optional[datetime] = None
    
    # Profile fields
    full_name: Optional[str] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "hashed_password": "hashed_string_here",
                "roles": ["business_user"],
                "failed_attempts": 0,
                "is_2fa_enabled": False,
                "full_name": "John Doe",
                "company": "Acme Corp",
                "bio": "Software engineer with 5+ years experience"
            }
        },
        populate_by_name=True,  # Allow both id and _id
        arbitrary_types_allowed=True  # For MongoDB ObjectId
    )