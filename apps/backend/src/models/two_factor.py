from typing import List, Optional, Annotated
from datetime import datetime
from beanie import Document, Indexed
from pydantic import Field

class User2FA(Document):
    """
    User 2FA settings and status.
    Stores the TOTP secret and backup codes.
    """
    user_id: Annotated[str, Indexed(unique=True)] # Link to the user (via string ID since User is manual)
    secret_key: str  # Encrypted or raw secret? Usually raw but protected. 
                     # For higher security we might encrypt it, but for now we'll store as is 
                     # assuming DB encryption or restricted access.
    backup_codes: List[str] = Field(default_factory=list) # Hashed backup codes? Usually hashed.
    enabled: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Settings:
        name = "user_2fa"

class User2FARecoveryCode(Document):
    """
    Separate collection for recovery codes if we want to track usage individually?
    Actually, storing them in User2FA is simpler for now unless we need complex auditing.
    The previous plan suggested a separate model. I'll stick to the plan but maybe
    keep it simple if permitted.
    
    Plan said:
    class User2FARecoveryCode(BaseModel):
        user_id: str
        code_hash: str
        used_at: Optional[datetime] = None
    
    If I make this a Document, I can track individual code usage easily.
    """
    user_id: Annotated[str, Indexed()]
    code_hash: str
    used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "user_2fa_recovery_codes"
