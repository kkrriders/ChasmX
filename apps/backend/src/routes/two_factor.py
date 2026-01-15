from fastapi import APIRouter, Depends, HTTPException, status
from src.core.database import get_database
from src.models.user import User
from src.routes.auth import get_current_user
from src.utils.otp import generate_otp, update_user_otp, verify_otp
from src.utils.email import send_otp_email
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

router = APIRouter()

class TwoFactorEnableRequest(BaseModel):
    email: str

class TwoFactorVerifyRequest(BaseModel):
    email: str
    otp: str

@router.post("/2fa/enable")
async def enable_2fa(
    request: TwoFactorEnableRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    if request.email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only enable 2FA for your own account",
        )

    otp = generate_otp()
    hashed_otp = await update_user_otp(request.email, otp, db)
    await send_otp_email(request.email, otp)
    
    return {"message": "OTP has been sent to your email."}

@router.post("/2fa/verify")
async def verify_2fa(
    request: TwoFactorVerifyRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    if request.email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only verify 2FA for your own account",
        )
    
    if await verify_otp(request.email, request.otp, db):
        await db.users.update_one(
            {"email": request.email},
            {"$set": {"is_2fa_enabled": True}},
        )
        return {"message": "2FA has been enabled successfully."}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )
