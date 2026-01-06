from pydantic import BaseModel
from typing import List, Optional

class TwoFactorStatus(BaseModel):
    enabled: bool

class TwoFactorSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str
    qr_code: str # Base64

class TwoFactorEnableRequest(BaseModel):
    code: str

class TwoFactorEnableResponse(BaseModel):
    backup_codes: List[str]

class TwoFactorDisableRequest(BaseModel):
    password: str # Required to confirm disabling

class RecoveryCodesResponse(BaseModel):
    backup_codes: List[str]
