"""
API Key Schemas for request/response models
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from src.models.api_key import APIKeyStatus, UserTier, QuotaLimits, UsageStats


class CreateAPIKeyRequest(BaseModel):
    """Request schema for creating an API key"""
    name: str = Field(description="Human-readable name for the API key")
    description: Optional[str] = Field(default=None, description="Optional description")
    user_tier: UserTier = Field(default=UserTier.FREE, description="User tier for quota limits")
    scopes: Optional[List[str]] = Field(default=None, description="List of permissions/scopes")
    allowed_ips: Optional[List[str]] = Field(default=None, description="Allowed IP addresses")
    allowed_domains: Optional[List[str]] = Field(default=None, description="Allowed domains")
    expires_at: Optional[datetime] = Field(default=None, description="Expiration date")
    organization_id: Optional[str] = Field(default=None, description="Organization ID")


class UpdateAPIKeyRequest(BaseModel):
    """Request schema for updating an API key"""
    name: Optional[str] = Field(default=None, description="New name")
    description: Optional[str] = Field(default=None, description="New description")
    status: Optional[APIKeyStatus] = Field(default=None, description="New status")
    scopes: Optional[List[str]] = Field(default=None, description="New scopes")
    allowed_ips: Optional[List[str]] = Field(default=None, description="New allowed IP addresses")
    allowed_domains: Optional[List[str]] = Field(default=None, description="New allowed domains")
    expires_at: Optional[datetime] = Field(default=None, description="New expiration date")


class APIKeyResponse(BaseModel):
    """Response schema for API key data"""
    id: str = Field(description="Database ID")
    user_id: str = Field(description="Owner user ID")
    organization_id: Optional[str] = Field(description="Organization ID")
    name: str = Field(description="API key name")
    description: Optional[str] = Field(description="API key description")
    key_id: str = Field(description="Public key identifier")
    api_key: Optional[str] = Field(default=None, description="Actual API key (only shown once)")
    status: APIKeyStatus = Field(description="API key status")
    user_tier: UserTier = Field(description="User tier")
    scopes: List[str] = Field(description="API key scopes")
    quota_limits: QuotaLimits = Field(description="Quota limits")
    usage_stats: UsageStats = Field(description="Usage statistics")
    allowed_ips: List[str] = Field(description="Allowed IP addresses")
    allowed_domains: List[str] = Field(description="Allowed domains")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")
    expires_at: Optional[datetime] = Field(description="Expiration timestamp")
    last_used_at: Optional[datetime] = Field(description="Last usage timestamp")
    is_expired: bool = Field(description="Whether the key is expired")
    is_active: bool = Field(description="Whether the key is active")


class APIKeyListResponse(BaseModel):
    """Response schema for listing API keys"""
    keys: List[APIKeyResponse] = Field(description="List of API keys")
    total: int = Field(description="Total number of keys")
    limit: int = Field(description="Limit used in query")
    offset: int = Field(description="Offset used in query")


class QuotaStatusResponse(BaseModel):
    """Response schema for quota status"""
    api_key_id: str = Field(description="API key ID")
    user_tier: UserTier = Field(description="User tier")
    status: APIKeyStatus = Field(description="API key status")
    limits: Dict[str, Any] = Field(description="Quota limits")
    usage: Dict[str, Any] = Field(description="Current usage")
    usage_percentage: Dict[str, float] = Field(description="Usage as percentage of limits")
    quota_exceeded: List[str] = Field(description="List of exceeded quotas")
    next_reset: Dict[str, str] = Field(description="Next reset times for each window")


class APIKeyValidationResponse(BaseModel):
    """Response schema for API key validation"""
    valid: bool = Field(description="Whether the API key is valid")
    api_key_id: Optional[str] = Field(description="API key ID if valid")
    user_id: Optional[str] = Field(description="User ID if valid")
    scopes: Optional[List[str]] = Field(description="API key scopes if valid")
    user_tier: Optional[UserTier] = Field(description="User tier if valid")
    error: Optional[str] = Field(description="Error message if invalid")