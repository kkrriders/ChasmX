"""User response schemas.

This module defines the Pydantic schemas for user-related API responses.
Includes models for safe data return without sensitive information.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class UserOut(BaseModel):
    """User response model without sensitive data.
    
    This model is used for API responses and excludes sensitive fields 
    like hashed_password and internal tracking fields.
    """
    email: EmailStr
    roles: list[str]
    created_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "roles": ["business_user"],
                "created_at": "2025-09-23T10:00:00",
                "last_login": "2025-09-23T11:00:00"
            }
        },
        from_attributes=True  # Allow model creation from class/dict with attributes
    )
