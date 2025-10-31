"""
API Key Management Models
Handles API key creation, quota tracking, and usage monitoring
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum
from bson import ObjectId
from pydantic import BaseModel, Field, field_validator
from beanie import Document, before_event, Insert, Update
from loguru import logger


class APIKeyStatus(str, Enum):
    """API key status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    REVOKED = "revoked"


class UserTier(str, Enum):
    """User tier for different quota limits"""
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class QuotaLimits(BaseModel):
    """Quota limits for different user tiers"""
    # Request limits
    requests_per_minute: int = Field(description="Maximum requests per minute")
    requests_per_hour: int = Field(description="Maximum requests per hour")
    requests_per_day: int = Field(description="Maximum requests per day")
    requests_per_month: int = Field(description="Maximum requests per month")
    
    # Workflow limits
    workflow_executions_per_hour: int = Field(description="Maximum workflow executions per hour")
    workflow_executions_per_day: int = Field(description="Maximum workflow executions per day")
    workflow_executions_per_month: int = Field(description="Maximum workflow executions per month")
    
    # AI limits
    ai_requests_per_hour: int = Field(description="Maximum AI requests per hour")
    ai_requests_per_day: int = Field(description="Maximum AI requests per day")
    ai_requests_per_month: int = Field(description="Maximum AI requests per month")
    
    # Webhook limits
    webhook_requests_per_hour: int = Field(description="Maximum webhook requests per hour")
    webhook_requests_per_day: int = Field(description="Maximum webhook requests per day")


# Predefined quota limits by tier
TIER_LIMITS = {
    UserTier.FREE: QuotaLimits(
        requests_per_minute=10,
        requests_per_hour=100,
        requests_per_day=1000,
        requests_per_month=10000,
        workflow_executions_per_hour=5,
        workflow_executions_per_day=50,
        workflow_executions_per_month=500,
        ai_requests_per_hour=10,
        ai_requests_per_day=50,
        ai_requests_per_month=500,
        webhook_requests_per_hour=50,
        webhook_requests_per_day=200
    ),
    UserTier.BASIC: QuotaLimits(
        requests_per_minute=50,
        requests_per_hour=1000,
        requests_per_day=10000,
        requests_per_month=100000,
        workflow_executions_per_hour=25,
        workflow_executions_per_day=250,
        workflow_executions_per_month=2500,
        ai_requests_per_hour=50,
        ai_requests_per_day=250,
        ai_requests_per_month=2500,
        webhook_requests_per_hour=500,
        webhook_requests_per_day=2000
    ),
    UserTier.PRO: QuotaLimits(
        requests_per_minute=200,
        requests_per_hour=5000,
        requests_per_day=50000,
        requests_per_month=500000,
        workflow_executions_per_hour=100,
        workflow_executions_per_day=1000,
        workflow_executions_per_month=10000,
        ai_requests_per_hour=200,
        ai_requests_per_day=1000,
        ai_requests_per_month=10000,
        webhook_requests_per_hour=2000,
        webhook_requests_per_day=10000
    ),
    UserTier.ENTERPRISE: QuotaLimits(
        requests_per_minute=1000,
        requests_per_hour=25000,
        requests_per_day=250000,
        requests_per_month=2500000,
        workflow_executions_per_hour=500,
        workflow_executions_per_day=5000,
        workflow_executions_per_month=50000,
        ai_requests_per_hour=1000,
        ai_requests_per_day=5000,
        ai_requests_per_month=50000,
        webhook_requests_per_hour=10000,
        webhook_requests_per_day=50000
    )
}


class UsageStats(BaseModel):
    """Usage statistics for an API key"""
    # Request counts
    total_requests: int = 0
    requests_this_minute: int = 0
    requests_this_hour: int = 0
    requests_this_day: int = 0
    requests_this_month: int = 0
    
    # Workflow execution counts
    total_workflow_executions: int = 0
    workflow_executions_this_hour: int = 0
    workflow_executions_this_day: int = 0
    workflow_executions_this_month: int = 0
    
    # AI request counts
    total_ai_requests: int = 0
    ai_requests_this_hour: int = 0
    ai_requests_this_day: int = 0
    ai_requests_this_month: int = 0
    
    # Webhook request counts
    total_webhook_requests: int = 0
    webhook_requests_this_hour: int = 0
    webhook_requests_this_day: int = 0
    
    # Error counts
    total_errors: int = 0
    rate_limit_hits: int = 0
    
    # Time tracking
    last_used: Optional[datetime] = None
    last_minute_reset: datetime = Field(default_factory=datetime.utcnow)
    last_hour_reset: datetime = Field(default_factory=datetime.utcnow)
    last_day_reset: datetime = Field(default_factory=datetime.utcnow)
    last_month_reset: datetime = Field(default_factory=datetime.utcnow)


class APIKey(Document):
    """API Key model for authentication and quota management"""
    
    # Basic information
    user_id: ObjectId = Field(description="Owner user ID")
    organization_id: Optional[ObjectId] = Field(default=None, description="Organization ID if applicable")
    
    # Key identification
    name: str = Field(description="Human-readable name for the API key")
    description: Optional[str] = Field(default=None, description="Optional description")
    key_id: str = Field(description="Public key identifier (first 8 chars)")
    key_hash: str = Field(description="Hashed API key for verification")
    
    # Status and permissions
    status: APIKeyStatus = Field(default=APIKeyStatus.ACTIVE)
    user_tier: UserTier = Field(default=UserTier.FREE)
    scopes: List[str] = Field(default_factory=list, description="Allowed scopes/permissions")
    
    # Quota and limits
    quota_limits: QuotaLimits = Field(description="Quota limits for this key")
    usage_stats: UsageStats = Field(default_factory=UsageStats)
    
    # Security
    allowed_ips: List[str] = Field(default_factory=list, description="Allowed IP addresses (empty = all)")
    allowed_domains: List[str] = Field(default_factory=list, description="Allowed domains")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None, description="Expiration date")
    last_used_at: Optional[datetime] = Field(default=None)
    
    # Metadata
    created_by_ip: Optional[str] = Field(default=None)
    user_agent: Optional[str] = Field(default=None)
    
    class Settings:
        name = "api_keys"
        indexes = [
            "user_id",
            "organization_id",
            "key_id",
            "key_hash",
            "status",
            "created_at",
            "expires_at",
            [("user_id", 1), ("status", 1)],
            [("organization_id", 1), ("status", 1)]
        ]

    model_config = {
        "arbitrary_types_allowed": True
    }

    @staticmethod
    def generate_api_key() -> str:
        """Generate a new API key"""
        return f"chasm_{secrets.token_urlsafe(32)}"
    
    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """Hash an API key for storage"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    @staticmethod
    def verify_api_key(api_key: str, key_hash: str) -> bool:
        """Verify an API key against its hash"""
        return hashlib.sha256(api_key.encode()).hexdigest() == key_hash
    
    @field_validator('scopes')
    @classmethod
    def validate_scopes(cls, v):
        """Validate API key scopes"""
        valid_scopes = {
            'read', 'write', 'execute', 'admin',
            'workflows:read', 'workflows:write', 'workflows:execute',
            'ai:read', 'ai:write', 'ai:execute',
            'webhooks:read', 'webhooks:write', 'webhooks:trigger',
            'users:read', 'users:write'
        }
        for scope in v:
            if scope not in valid_scopes:
                raise ValueError(f"Invalid scope: {scope}")
        return v
    
    @before_event(Insert)
    async def before_insert(self):
        """Set defaults before inserting"""
        if not self.quota_limits:
            self.quota_limits = TIER_LIMITS[self.user_tier]
        if not self.key_id:
            # This will be set when the actual key is generated
            pass
    
    @before_event(Update)
    async def before_update(self):
        """Update timestamp before updating"""
        self.updated_at = datetime.utcnow()
    
    def is_expired(self) -> bool:
        """Check if the API key is expired"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
    
    def is_active(self) -> bool:
        """Check if the API key is active and not expired"""
        return (
            self.status == APIKeyStatus.ACTIVE and 
            not self.is_expired()
        )
    
    def can_access_ip(self, ip_address: str) -> bool:
        """Check if the API key can be used from this IP address"""
        if not self.allowed_ips:
            return True  # No IP restrictions
        return ip_address in self.allowed_ips
    
    def can_access_scope(self, required_scope: str) -> bool:
        """Check if the API key has the required scope"""
        if not self.scopes:
            return False
        
        # Check for exact match
        if required_scope in self.scopes:
            return True
        
        # Check for wildcard permissions
        if 'admin' in self.scopes:
            return True
        
        # Check for read/write permissions
        if required_scope.endswith(':read') and 'read' in self.scopes:
            return True
        
        if required_scope.endswith(':write') and 'write' in self.scopes:
            return True
        
        return False
    
    async def update_usage(self, usage_type: str, amount: int = 1):
        """Update usage statistics"""
        now = datetime.utcnow()
        
        # Reset counters if needed
        if (now - self.usage_stats.last_minute_reset).seconds >= 60:
            self.usage_stats.requests_this_minute = 0
            self.usage_stats.last_minute_reset = now
        
        if (now - self.usage_stats.last_hour_reset).seconds >= 3600:
            self.usage_stats.requests_this_hour = 0
            self.usage_stats.workflow_executions_this_hour = 0
            self.usage_stats.ai_requests_this_hour = 0
            self.usage_stats.webhook_requests_this_hour = 0
            self.usage_stats.last_hour_reset = now
        
        if (now - self.usage_stats.last_day_reset).days >= 1:
            self.usage_stats.requests_this_day = 0
            self.usage_stats.workflow_executions_this_day = 0
            self.usage_stats.ai_requests_this_day = 0
            self.usage_stats.webhook_requests_this_day = 0
            self.usage_stats.last_day_reset = now
        
        if (now - self.usage_stats.last_month_reset).days >= 30:
            self.usage_stats.requests_this_month = 0
            self.usage_stats.workflow_executions_this_month = 0
            self.usage_stats.ai_requests_this_month = 0
            self.usage_stats.last_month_reset = now
        
        # Update usage counters
        if usage_type == "request":
            self.usage_stats.total_requests += amount
            self.usage_stats.requests_this_minute += amount
            self.usage_stats.requests_this_hour += amount
            self.usage_stats.requests_this_day += amount
            self.usage_stats.requests_this_month += amount
        
        elif usage_type == "workflow_execution":
            self.usage_stats.total_workflow_executions += amount
            self.usage_stats.workflow_executions_this_hour += amount
            self.usage_stats.workflow_executions_this_day += amount
            self.usage_stats.workflow_executions_this_month += amount
        
        elif usage_type == "ai_request":
            self.usage_stats.total_ai_requests += amount
            self.usage_stats.ai_requests_this_hour += amount
            self.usage_stats.ai_requests_this_day += amount
            self.usage_stats.ai_requests_this_month += amount
        
        elif usage_type == "webhook_request":
            self.usage_stats.total_webhook_requests += amount
            self.usage_stats.webhook_requests_this_hour += amount
            self.usage_stats.webhook_requests_this_day += amount
        
        elif usage_type == "error":
            self.usage_stats.total_errors += amount
        
        elif usage_type == "rate_limit_hit":
            self.usage_stats.rate_limit_hits += amount
        
        self.usage_stats.last_used = now
        self.last_used_at = now
        
        # Save to database
        await self.save()
    
    def check_quota(self, usage_type: str) -> bool:
        """Check if the API key is within quota limits"""
        limits = self.quota_limits
        stats = self.usage_stats
        
        if usage_type == "request":
            return (
                stats.requests_this_minute < limits.requests_per_minute and
                stats.requests_this_hour < limits.requests_per_hour and
                stats.requests_this_day < limits.requests_per_day and
                stats.requests_this_month < limits.requests_per_month
            )
        
        elif usage_type == "workflow_execution":
            return (
                stats.workflow_executions_this_hour < limits.workflow_executions_per_hour and
                stats.workflow_executions_this_day < limits.workflow_executions_per_day and
                stats.workflow_executions_this_month < limits.workflow_executions_per_month
            )
        
        elif usage_type == "ai_request":
            return (
                stats.ai_requests_this_hour < limits.ai_requests_per_hour and
                stats.ai_requests_this_day < limits.ai_requests_per_day and
                stats.ai_requests_this_month < limits.ai_requests_per_month
            )
        
        elif usage_type == "webhook_request":
            return (
                stats.webhook_requests_this_hour < limits.webhook_requests_per_hour and
                stats.webhook_requests_this_day < limits.webhook_requests_per_day
            )
        
        return True