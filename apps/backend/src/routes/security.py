from fastapi import APIRouter, Depends, HTTPException, status, Body
from src.auth.dependencies import get_current_user
from src.models.user import User
from src.services.two_factor_service import two_factor_service
from src.schemas.security import (
    TwoFactorStatus,
    TwoFactorSetupResponse,
    TwoFactorEnableRequest,
    TwoFactorEnableResponse,
    TwoFactorDisableRequest,
    RecoveryCodesResponse
)
from src.crud.user import verify_password

router = APIRouter(prefix="/users/me/security/2fa", tags=["Security"])

@router.get("", response_model=TwoFactorStatus)
async def get_2fa_status(current_user: User = Depends(get_current_user)):
    """Get the current 2FA status for the user"""
    # User object from dependencies is Pydantic model. 
    # We need the ID. Pydantic model has 'id' field which is PyObjectId (str).
    user_2fa = await two_factor_service.get_user_2fa(str(current_user.id))
    enabled = user_2fa.enabled if user_2fa else False
    return TwoFactorStatus(enabled=enabled)

@router.post("/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(current_user: User = Depends(get_current_user)):
    """
    Initialize 2FA setup.
    Returns the secret and QR code.
    """
    secret, uri, qr_code = await two_factor_service.create_2fa_setup(
        str(current_user.id), 
        current_user.email
    )
    return TwoFactorSetupResponse(
        secret=secret,
        provisioning_uri=uri,
        qr_code=qr_code
    )

@router.post("/enable", response_model=TwoFactorEnableResponse)
async def enable_2fa(
    request: TwoFactorEnableRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Verify the code and enable 2FA.
    Returns backup codes.
    """
    success, backup_codes = await two_factor_service.enable_2fa(
        str(current_user.id), 
        request.code
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authentication code"
        )
        
    return TwoFactorEnableResponse(backup_codes=backup_codes)

@router.post("/disable", status_code=status.HTTP_200_OK)
async def disable_2fa(
    request: TwoFactorDisableRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Disable 2FA. Requires password verification.
    """
    # Verify password first
    is_valid = await verify_password(current_user, request.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
        
    await two_factor_service.disable_2fa(str(current_user.id), password_verified=True)
    return {"message": "2FA disabled successfully"}

@router.post("/recovery-codes", response_model=RecoveryCodesResponse)
async def regenerate_recovery_codes(
    current_user: User = Depends(get_current_user)
):
    """
    Regenerate recovery codes.
    Invalidates old codes.
    """
    codes = await two_factor_service.generate_recovery_codes(str(current_user.id))
    return RecoveryCodesResponse(backup_codes=codes)
