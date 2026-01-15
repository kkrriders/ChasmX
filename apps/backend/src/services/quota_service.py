"""
Quota Service for API Usage Tracking
Handles quota management, usage tracking, and enforcement using Redis
"""

import time
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple, Any, List
from bson import ObjectId
import redis.asyncio as redis
from loguru import logger

from src.core.config import settings
from src.models.api_key import APIKey, APIKeyStatus, UserTier, UsageStats, QuotaLimits, TIER_LIMITS


class QuotaService:
    """Service for managing API quotas and usage tracking"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.redis_connection_url
        self.redis_client: Optional[redis.Redis] = None
        
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            # Test connection
            ping_result = await self.redis_client.ping()
            logger.info("Quota service connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis for quota service: {e}")
            if settings.ENV == "development":
                logger.warning("Running without Redis for quota service (Development Mode)")
                self.redis_client = None
            else:
                raise
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Quota service disconnected from Redis")
    
    def _get_quota_key(self, api_key_id: str, quota_type: str, window: str) -> str:
        """Generate Redis key for quota tracking"""
        return f"quota:{api_key_id}:{quota_type}:{window}"
    
    def _get_usage_key(self, api_key_id: str) -> str:
        """Generate Redis key for usage statistics"""
        return f"usage:{api_key_id}"
    
    async def _get_current_window_time(self, window_type: str) -> int:
        """Get current window timestamp for different time windows"""
        now = datetime.utcnow()
        
        if window_type == "minute":
            return int(now.replace(second=0, microsecond=0).timestamp())
        elif window_type == "hour":
            return int(now.replace(minute=0, second=0, microsecond=0).timestamp())
        elif window_type == "day":
            return int(now.replace(hour=0, minute=0, second=0, microsecond=0).timestamp())
        elif window_type == "month":
            return int(now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).timestamp())
        else:
            return int(now.timestamp())
    
    async def check_quota(
        self, 
        api_key: APIKey, 
        usage_type: str, 
        amount: int = 1
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if usage is within quota limits
        
        Args:
            api_key: API key object
            usage_type: Type of usage (request, workflow_execution, ai_request, webhook_request)
            amount: Amount of usage to check
            
        Returns:
            Tuple of (is_allowed, quota_info)
        """
        if not self.redis_client:
            logger.warning("Redis not available for quota checking")
            return True, {}  # Allow if Redis is down
        
        try:
            quota_info = {}
            limits = api_key.quota_limits
            
            # Check different time windows based on usage type
            if usage_type == "request":
                windows_to_check = [
                    ("minute", limits.requests_per_minute),
                    ("hour", limits.requests_per_hour),
                    ("day", limits.requests_per_day),
                    ("month", limits.requests_per_month)
                ]
            elif usage_type == "workflow_execution":
                windows_to_check = [
                    ("hour", limits.workflow_executions_per_hour),
                    ("day", limits.workflow_executions_per_day),
                    ("month", limits.workflow_executions_per_month)
                ]
            elif usage_type == "ai_request":
                windows_to_check = [
                    ("hour", limits.ai_requests_per_hour),
                    ("day", limits.ai_requests_per_day),
                    ("month", limits.ai_requests_per_month)
                ]
            elif usage_type == "webhook_request":
                windows_to_check = [
                    ("hour", limits.webhook_requests_per_hour),
                    ("day", limits.webhook_requests_per_day)
                ]
            else:
                return True, {}  # Unknown usage type, allow
            
            # Check each time window
            for window, limit in windows_to_check:
                if limit <= 0:  # No limit set
                    continue
                    
                window_time = await self._get_current_window_time(window)
                quota_key = self._get_quota_key(str(api_key.id), usage_type, f"{window}:{window_time}")
                
                # Get current usage for this window
                current_usage = await self.redis_client.get(quota_key)
                current_usage = int(current_usage) if current_usage else 0
                
                # Check if adding the new amount would exceed the limit
                if current_usage + amount > limit:
                    quota_info = {
                        "exceeded_window": window,
                        "limit": limit,
                        "current": current_usage,
                        "requested": amount,
                        "window_time": window_time
                    }
                    return False, quota_info
                
                quota_info[f"{window}_limit"] = limit
                quota_info[f"{window}_current"] = current_usage
                quota_info[f"{window}_remaining"] = limit - current_usage
            
            return True, quota_info
            
        except Exception as e:
            logger.error(f"Error checking quota: {e}")
            return True, {}  # Allow on error
    
    async def record_usage(
        self, 
        api_key: APIKey, 
        usage_type: str, 
        amount: int = 1,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Record usage for an API key
        
        Args:
            api_key: API key object
            usage_type: Type of usage
            amount: Amount of usage
            metadata: Additional metadata about the usage
            
        Returns:
            Success status
        """
        if not self.redis_client:
            logger.warning("Redis not available for usage recording")
            return False
        
        try:
            # Determine which windows to update based on usage type
            if usage_type == "request":
                windows = ["minute", "hour", "day", "month"]
            elif usage_type == "workflow_execution":
                windows = ["hour", "day", "month"]
            elif usage_type == "ai_request":
                windows = ["hour", "day", "month"]
            elif usage_type == "webhook_request":
                windows = ["hour", "day"]
            else:
                windows = ["hour"]  # Default
            
            # Update usage for each time window
            pipe = self.redis_client.pipeline()
            
            for window in windows:
                window_time = await self._get_current_window_time(window)
                quota_key = self._get_quota_key(str(api_key.id), usage_type, f"{window}:{window_time}")
                
                # Increment usage counter
                pipe.incrby(quota_key, amount)
                
                # Set expiry based on window type
                if window == "minute":
                    pipe.expire(quota_key, 120)  # 2 minutes
                elif window == "hour":
                    pipe.expire(quota_key, 7200)  # 2 hours
                elif window == "day":
                    pipe.expire(quota_key, 172800)  # 2 days
                elif window == "month":
                    pipe.expire(quota_key, 2678400)  # 31 days
            
            # Execute pipeline
            await pipe.execute()
            
            # Update usage statistics in the database
            await api_key.update_usage(usage_type, amount)
            
            # Store usage event with metadata if provided
            if metadata:
                usage_event = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "usage_type": usage_type,
                    "amount": amount,
                    "metadata": metadata
                }
                usage_key = f"usage_events:{api_key.id}:{int(time.time())}"
                await self.redis_client.setex(
                    usage_key, 
                    86400,  # Store for 24 hours
                    json.dumps(usage_event)
                )
            
            return True
            
        except Exception as e:
            logger.error(f"Error recording usage: {e}")
            return False
    
    async def get_usage_stats(
        self, 
        api_key_id: str, 
        usage_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get current usage statistics for an API key
        
        Args:
            api_key_id: API key ID
            usage_type: Specific usage type to get stats for
            
        Returns:
            Usage statistics dictionary
        """
        if not self.redis_client:
            return {}
        
        try:
            stats = {}
            usage_types = [usage_type] if usage_type else [
                "request", "workflow_execution", "ai_request", "webhook_request"
            ]
            
            for utype in usage_types:
                stats[utype] = {}
                
                # Get stats for different windows
                windows = ["minute", "hour", "day", "month"]
                if utype == "webhook_request":
                    windows = ["hour", "day"]  # Webhooks don't track minute/month
                
                for window in windows:
                    window_time = await self._get_current_window_time(window)
                    quota_key = self._get_quota_key(api_key_id, utype, f"{window}:{window_time}")
                    
                    current_usage = await self.redis_client.get(quota_key)
                    stats[utype][window] = int(current_usage) if current_usage else 0
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting usage stats: {e}")
            return {}
    
    async def reset_quota(
        self, 
        api_key_id: str, 
        usage_type: Optional[str] = None,
        window: Optional[str] = None
    ) -> bool:
        """
        Reset quota for an API key (admin function)
        
        Args:
            api_key_id: API key ID
            usage_type: Specific usage type to reset (None for all)
            window: Specific window to reset (None for all)
            
        Returns:
            Success status
        """
        if not self.redis_client:
            return False
        
        try:
            # Find all quota keys for this API key
            pattern = f"quota:{api_key_id}:*"
            if usage_type:
                pattern = f"quota:{api_key_id}:{usage_type}:*"
            if window:
                pattern = f"quota:{api_key_id}:*:{window}:*"
            
            # Get all matching keys
            keys = []
            async for key in self.redis_client.scan_iter(match=pattern):
                keys.append(key)
            
            # Delete the keys
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"Reset quota for API key {api_key_id}: deleted {len(keys)} keys")
            
            return True
            
        except Exception as e:
            logger.error(f"Error resetting quota: {e}")
            return False
    
    async def get_quota_status(
        self, 
        api_key: APIKey
    ) -> Dict[str, Any]:
        """
        Get comprehensive quota status for an API key
        
        Args:
            api_key: API key object
            
        Returns:
            Comprehensive quota status
        """
        try:
            # Get current usage stats
            usage_stats = await self.get_usage_stats(str(api_key.id))
            
            # Build status response
            status = {
                "api_key_id": str(api_key.id),
                "user_tier": api_key.user_tier,
                "status": api_key.status,
                "limits": api_key.quota_limits.dict(),
                "usage": usage_stats,
                "usage_percentage": {},
                "quota_exceeded": [],
                "next_reset": {}
            }
            
            # Calculate usage percentages and check for exceeded quotas
            limits = api_key.quota_limits
            
            # Check request quotas
            if "request" in usage_stats:
                req_usage = usage_stats["request"]
                if limits.requests_per_minute > 0:
                    pct = (req_usage.get("minute", 0) / limits.requests_per_minute) * 100
                    status["usage_percentage"]["requests_per_minute"] = pct
                    if pct >= 100:
                        status["quota_exceeded"].append("requests_per_minute")
                
                if limits.requests_per_hour > 0:
                    pct = (req_usage.get("hour", 0) / limits.requests_per_hour) * 100
                    status["usage_percentage"]["requests_per_hour"] = pct
                    if pct >= 100:
                        status["quota_exceeded"].append("requests_per_hour")
            
            # Calculate next reset times
            now = datetime.utcnow()
            status["next_reset"] = {
                "minute": (now.replace(second=0, microsecond=0) + timedelta(minutes=1)).isoformat(),
                "hour": (now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)).isoformat(),
                "day": (now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).isoformat(),
                "month": self._get_next_month_start(now).isoformat()
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting quota status: {e}")
            return {"error": str(e)}
    
    def _get_next_month_start(self, dt: datetime) -> datetime:
        """Get the start of next month"""
        if dt.month == 12:
            return dt.replace(year=dt.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            return dt.replace(month=dt.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    async def upgrade_user_tier(
        self, 
        api_key_id: str, 
        new_tier: UserTier
    ) -> bool:
        """
        Upgrade user tier and apply new quota limits
        
        Args:
            api_key_id: API key ID
            new_tier: New user tier
            
        Returns:
            Success status
        """
        try:
            # Get API key
            api_key = await APIKey.get(api_key_id)
            if not api_key:
                return False
            
            # Update tier and limits
            api_key.user_tier = new_tier
            api_key.quota_limits = TIER_LIMITS[new_tier]
            
            # Save changes
            await api_key.save()
            
            logger.info(f"Upgraded API key {api_key_id} to tier {new_tier}")
            return True
            
        except Exception as e:
            logger.error(f"Error upgrading user tier: {e}")
            return False


# Global quota service instance
quota_service = QuotaService()