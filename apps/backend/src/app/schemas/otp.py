"""OTP schemas for request/response validation."""

from pydantic import BaseModel, EmailStr

class OTPVerify(BaseModel):
    """Schema for OTP verification request."""
    email: EmailStr
    otp: str
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "otp": "123456"
            }
        }
    }