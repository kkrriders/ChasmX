"""
Rate Limiting Middleware for FastAPI
Implements Redis-based rate limiting with sliding window algorithm
"""

import time
import json
from typing import Dict, Optional, Tuple, Any
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis
from loguru import logger
from src.core.config import settings


class RateLimitConfig:
    """Rate limiting configuration"""
    
    # Authentication endpoints - strict limits
    AUTH_LOGIN = {"requests": 5, "window": 60}  # 5 requests per minute
    AUTH_VERIFY_OTP = {"requests": 10, "window": 60}  # 10 requests per minute
    AUTH_REGISTER = {"requests": 3, "window": 60}  # 3 requests per minute
    
    # Workflow endpoints - medium limits  
    WORKFLOW_EXECUTE = {"requests": 30, "window": 60}  # 30 requests per minute
    WORKFLOW_CREATE = {"requests": 20, "window": 60}  # 20 requests per minute
    
    # AI endpoints - conservative limits
    AI_CHAT = {"requests": 10, "window": 60}  # 10 requests per minute
    AI_GENERATE = {"requests": 20, "window": 3600}  # 20 requests per hour
    
    # General API endpoints
    API_GENERAL = {"requests": 100, "window": 60}  # 100 requests per minute
    
    # Webhook endpoints
    WEBHOOK_TRIGGER = {"requests": 500, "window": 3600}  # 500 requests per hour


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Redis-based rate limiting middleware with sliding window algorithm"""
    
    def __init__(self, app, redis_url: Optional[str] = None):
        super().__init__(app)
        self.redis_url = redis_url or settings.redis_connection_url
        self.redis_client: Optional[redis.Redis] = None
        self.rate_limits = self._build_rate_limit_map()
        
    async def _get_redis_client(self) -> Optional[redis.Redis]:
        """Get or create Redis client"""
        if self.redis_client is None:
            try:
                self.redis_client = redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_timeout=5,
                    socket_connect_timeout=5
                )
                # Test connection
                ping_result = self.redis_client.ping()
                logger.info("Rate limiter connected to Redis")
            except Exception as e:
                logger.error(f"Failed to connect to Redis for rate limiting: {e}")
                # Continue without rate limiting if Redis is unavailable
                self.redis_client = None
                return None
        return self.redis_client
    
    def _build_rate_limit_map(self) -> Dict[str, Dict[str, int]]:
        """Build mapping of endpoints to rate limits"""
        return {
            # Authentication
            "/auth/login": RateLimitConfig.AUTH_LOGIN,
            "/auth/verify-otp": RateLimitConfig.AUTH_VERIFY_OTP,
            "/auth/register": RateLimitConfig.AUTH_REGISTER,
            
            # Workflows
            "/workflows/execute": RateLimitConfig.WORKFLOW_EXECUTE,
            "/workflows": RateLimitConfig.WORKFLOW_CREATE,
            
            # AI endpoints
            "/ai/chat": RateLimitConfig.AI_CHAT,
            "/ai/generate-workflow": RateLimitConfig.AI_GENERATE,
            
            # Webhooks
            "/webhooks/trigger": RateLimitConfig.WEBHOOK_TRIGGER,
        }
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get unique identifier for client (IP + User if authenticated)"""
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        # Check for authenticated user
        auth_header = request.headers.get("Authorization")
        user_id = None
        if auth_header and auth_header.startswith("Bearer "):
            # Extract user from token if possible (simplified)
            # In production, you'd decode the JWT here
            user_id = "authenticated_user"  # Placeholder
        
        # Create composite identifier
        if user_id:
            return f"user:{user_id}:{client_ip}"
        return f"ip:{client_ip}"
    
    def _get_rate_limit_for_path(self, path: str, method: str) -> Optional[Dict[str, int]]:
        """Get rate limit configuration for a specific path"""
        # Direct match
        if path in self.rate_limits:
            return self.rate_limits[path]
        
        # Pattern matching for common endpoints
        if path.startswith("/workflows/") and path.endswith("/execute"):
            return RateLimitConfig.WORKFLOW_EXECUTE
        
        if path.startswith("/ai/"):
            return RateLimitConfig.AI_CHAT
        
        if path.startswith("/webhooks/"):
            return RateLimitConfig.WEBHOOK_TRIGGER
        
        # Default general API limit
        return RateLimitConfig.API_GENERAL
    
    async def _check_rate_limit(
        self, 
        client_id: str, 
        endpoint: str, 
        limit_config: Dict[str, int]
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if request is within rate limits using sliding window
        Returns (is_allowed, rate_limit_info)
        """
        redis_client = await self._get_redis_client()
        if not redis_client:
            # If Redis is unavailable, allow the request
            return True, {}
        
        try:
            current_time = int(time.time())
            window_seconds = limit_config["window"]
            max_requests = limit_config["requests"]
            
            # Redis key for this client+endpoint combination
            key = f"rate_limit:{client_id}:{endpoint}"
            
            # Use sliding window with sorted sets
            # Remove old entries outside the window
            await redis_client.zremrangebyscore(
                key, 
                "-inf", 
                current_time - window_seconds
            )
            
            # Count current requests in window
            current_count = await redis_client.zcard(key)
            
            # Check if limit exceeded
            if current_count >= max_requests:
                # Get oldest request time to calculate retry-after
                oldest_requests = await redis_client.zrange(key, 0, 0, withscores=True)
                retry_after = window_seconds
                if oldest_requests:
                    oldest_time = oldest_requests[0][1]
                    retry_after = int(oldest_time + window_seconds - current_time)
                
                return False, {
                    "limit": max_requests,
                    "window": window_seconds,
                    "current": current_count,
                    "retry_after": max(retry_after, 1)
                }
            
            # Add current request
            await redis_client.zadd(key, {str(current_time): current_time})
            
            # Set expiry on the key
            await redis_client.expire(key, window_seconds + 60)  # Extra buffer
            
            return True, {
                "limit": max_requests,
                "window": window_seconds,
                "current": current_count + 1,
                "remaining": max_requests - current_count - 1
            }
            
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Allow request if there's an error
            return True, {}
    
    async def dispatch(self, request: Request, call_next):
        """Process the request with rate limiting"""
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get rate limit configuration
        limit_config = self._get_rate_limit_for_path(request.url.path, request.method)
        if not limit_config:
            return await call_next(request)
        
        # Get client identifier
        client_id = self._get_client_identifier(request)
        
        # Check rate limit
        is_allowed, rate_info = await self._check_rate_limit(
            client_id, 
            request.url.path, 
            limit_config
        )
        
        if not is_allowed:
            # Rate limit exceeded
            logger.warning(
                f"Rate limit exceeded for {client_id} on {request.url.path}: "
                f"{rate_info.get('current', 0)}/{rate_info.get('limit', 0)} requests"
            )
            
            headers = {
                "X-RateLimit-Limit": str(rate_info.get("limit", 0)),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Window": str(rate_info.get("window", 0)),
                "Retry-After": str(rate_info.get("retry_after", 60))
            }
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Try again in {rate_info.get('retry_after', 60)} seconds.",
                    "limit": rate_info.get("limit", 0),
                    "window": rate_info.get("window", 0)
                },
                headers=headers
            )
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers to successful responses
        if rate_info:
            response.headers["X-RateLimit-Limit"] = str(rate_info.get("limit", 0))
            response.headers["X-RateLimit-Remaining"] = str(rate_info.get("remaining", 0))
            response.headers["X-RateLimit-Window"] = str(rate_info.get("window", 0))
        
        return response