"""
API Key Management Routes
Handles CRUD operations for API keys and quota management
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.security import HTTPBearer
from bson import ObjectId
from loguru import logger

from src.models.api_key import APIKey, APIKeyStatus, UserTier, QuotaLimits, TIER_LIMITS
from src.models.user import User
from src.auth.dependencies import get_current_user, verify_role
from src.services.quota_service import quota_service
from src.schemas.api_key import (
    CreateAPIKeyRequest,
    APIKeyResponse,
    APIKeyListResponse,
    UpdateAPIKeyRequest,
    QuotaStatusResponse
)

router = APIRouter(prefix="/api-keys", tags=["API Keys"])
security = HTTPBearer()


@router.post("/", response_model=APIKeyResponse)
async def create_api_key(
    request: CreateAPIKeyRequest = Body(),
    current_user: User = Depends(get_current_user)
) -> APIKeyResponse:
    """
    Create a new API key for the authenticated user
    
    Args:
        request: API key creation request
        current_user: Authenticated user
        
    Returns:
        Created API key with the actual key value (only shown once)
    """
    try:
        # Generate new API key
        api_key_value = APIKey.generate_api_key()
        key_hash = APIKey.hash_api_key(api_key_value)
        key_id = api_key_value[:12]  # First 12 chars for identification
        
        # Set quota limits based on user tier
        quota_limits = TIER_LIMITS.get(request.user_tier, TIER_LIMITS[UserTier.FREE])
        
        # Create API key object
        api_key = APIKey(
            user_id=ObjectId(current_user.id),
            organization_id=ObjectId(request.organization_id) if request.organization_id else None,
            name=request.name,
            description=request.description,
            key_id=key_id,
            key_hash=key_hash,
            status=APIKeyStatus.ACTIVE,
            user_tier=request.user_tier,
            scopes=request.scopes or ["read"],
            quota_limits=quota_limits,
            allowed_ips=request.allowed_ips or [],
            allowed_domains=request.allowed_domains or [],
            expires_at=request.expires_at
        )
        
        # Save to database
        await api_key.insert()
        
        logger.info(f"Created API key {key_id} for user {current_user.email}")
        
        # Return response with the actual key (only time it's shown)
        return APIKeyResponse(
            id=str(api_key.id),
            user_id=str(api_key.user_id),
            organization_id=str(api_key.organization_id) if api_key.organization_id else None,
            name=api_key.name,
            description=api_key.description,
            key_id=api_key.key_id,
            api_key=api_key_value,  # Only shown on creation
            status=api_key.status,
            user_tier=api_key.user_tier,
            scopes=api_key.scopes,
            quota_limits=api_key.quota_limits,
            usage_stats=api_key.usage_stats,
            allowed_ips=api_key.allowed_ips,
            allowed_domains=api_key.allowed_domains,
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
            expires_at=api_key.expires_at,
            last_used_at=api_key.last_used_at,
            is_expired=api_key.is_expired(),
            is_active=api_key.is_active()
        )
        
    except Exception as e:
        logger.error(f"Error creating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key"
        )


@router.get("/", response_model=APIKeyListResponse)
async def list_api_keys(
    status_filter: Optional[APIKeyStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=100, description="Number of keys to return"),
    offset: int = Query(0, ge=0, description="Number of keys to skip"),
    current_user: User = Depends(get_current_user)
) -> APIKeyListResponse:
    """
    List API keys for the authenticated user
    
    Args:
        status_filter: Optional status filter
        limit: Maximum number of keys to return
        offset: Number of keys to skip
        current_user: Authenticated user
        
    Returns:
        List of API keys (without actual key values)
    """
    try:
        # Build query using Beanie syntax
        if status_filter:
            api_keys = await APIKey.find(
                APIKey.user_id == ObjectId(current_user.id),
                APIKey.status == status_filter
            ).skip(offset).limit(limit).to_list()
            total = await APIKey.find(
                APIKey.user_id == ObjectId(current_user.id),
                APIKey.status == status_filter
            ).count()
        else:
            api_keys = await APIKey.find(
                APIKey.user_id == ObjectId(current_user.id)
            ).skip(offset).limit(limit).to_list()
            total = await APIKey.find(
                APIKey.user_id == ObjectId(current_user.id)
            ).count()
        
        # Convert to response format (without actual key values)
        keys_response = []
        for key in api_keys:
            keys_response.append(APIKeyResponse(
                id=str(key.id),
                user_id=str(key.user_id),
                organization_id=str(key.organization_id) if key.organization_id else None,
                name=key.name,
                description=key.description,
                key_id=key.key_id,
                api_key=None,  # Never show actual key in list
                status=key.status,
                user_tier=key.user_tier,
                scopes=key.scopes,
                quota_limits=key.quota_limits,
                usage_stats=key.usage_stats,
                allowed_ips=key.allowed_ips,
                allowed_domains=key.allowed_domains,
                created_at=key.created_at,
                updated_at=key.updated_at,
                expires_at=key.expires_at,
                last_used_at=key.last_used_at,
                is_expired=key.is_expired(),
                is_active=key.is_active()
            ))
        
        return APIKeyListResponse(
            keys=keys_response,
            total=total,
            limit=limit,
            offset=offset
        )
        
    except Exception as e:
        logger.error(f"Error listing API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list API keys"
        )


@router.get("/{key_id}", response_model=APIKeyResponse)
async def get_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user)
) -> APIKeyResponse:
    """
    Get a specific API key by ID
    
    Args:
        key_id: API key ID (not the actual key)
        current_user: Authenticated user
        
    Returns:
        API key details (without actual key value)
    """
    try:
        # Find API key
        api_key = await APIKey.find_one({
            "key_id": key_id,
            "user_id": ObjectId(current_user.id)
        })
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        return APIKeyResponse(
            id=str(api_key.id),
            user_id=str(api_key.user_id),
            organization_id=str(api_key.organization_id) if api_key.organization_id else None,
            name=api_key.name,
            description=api_key.description,
            key_id=api_key.key_id,
            api_key=None,  # Never show actual key
            status=api_key.status,
            user_tier=api_key.user_tier,
            scopes=api_key.scopes,
            quota_limits=api_key.quota_limits,
            usage_stats=api_key.usage_stats,
            allowed_ips=api_key.allowed_ips,
            allowed_domains=api_key.allowed_domains,
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
            expires_at=api_key.expires_at,
            last_used_at=api_key.last_used_at,
            is_expired=api_key.is_expired(),
            is_active=api_key.is_active()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get API key"
        )


@router.put("/{key_id}", response_model=APIKeyResponse)
async def update_api_key(
    key_id: str,
    request: UpdateAPIKeyRequest = Body(),
    current_user: User = Depends(get_current_user)
) -> APIKeyResponse:
    """
    Update an API key
    
    Args:
        key_id: API key ID
        request: Update request
        current_user: Authenticated user
        
    Returns:
        Updated API key
    """
    try:
        # Find API key
        api_key = await APIKey.find_one({
            "key_id": key_id,
            "user_id": ObjectId(current_user.id)
        })
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Update fields
        if request.name is not None:
            api_key.name = request.name
        if request.description is not None:
            api_key.description = request.description
        if request.status is not None:
            api_key.status = request.status
        if request.scopes is not None:
            api_key.scopes = request.scopes
        if request.allowed_ips is not None:
            api_key.allowed_ips = request.allowed_ips
        if request.allowed_domains is not None:
            api_key.allowed_domains = request.allowed_domains
        if request.expires_at is not None:
            api_key.expires_at = request.expires_at
        
        # Save changes
        await api_key.save()
        
        logger.info(f"Updated API key {key_id} for user {current_user.email}")
        
        return APIKeyResponse(
            id=str(api_key.id),
            user_id=str(api_key.user_id),
            organization_id=str(api_key.organization_id) if api_key.organization_id else None,
            name=api_key.name,
            description=api_key.description,
            key_id=api_key.key_id,
            api_key=None,
            status=api_key.status,
            user_tier=api_key.user_tier,
            scopes=api_key.scopes,
            quota_limits=api_key.quota_limits,
            usage_stats=api_key.usage_stats,
            allowed_ips=api_key.allowed_ips,
            allowed_domains=api_key.allowed_domains,
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
            expires_at=api_key.expires_at,
            last_used_at=api_key.last_used_at,
            is_expired=api_key.is_expired(),
            is_active=api_key.is_active()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update API key"
        )


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Delete an API key
    
    Args:
        key_id: API key ID
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    try:
        # Find API key
        api_key = await APIKey.find_one({
            "key_id": key_id,
            "user_id": ObjectId(current_user.id)
        })
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Delete the API key
        await api_key.delete()
        
        # Clean up associated quota data
        await quota_service.reset_quota(str(api_key.id))
        
        logger.info(f"Deleted API key {key_id} for user {current_user.email}")
        
        return {"message": "API key deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete API key"
        )


@router.post("/{key_id}/regenerate", response_model=APIKeyResponse)
async def regenerate_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user)
) -> APIKeyResponse:
    """
    Regenerate an API key (creates new key value)
    
    Args:
        key_id: API key ID
        current_user: Authenticated user
        
    Returns:
        API key with new key value (only shown once)
    """
    try:
        # Find API key
        api_key = await APIKey.find_one({
            "key_id": key_id,
            "user_id": ObjectId(current_user.id)
        })
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Generate new key
        new_api_key_value = APIKey.generate_api_key()
        new_key_hash = APIKey.hash_api_key(new_api_key_value)
        new_key_id = new_api_key_value[:12]
        
        # Update API key
        api_key.key_id = new_key_id
        api_key.key_hash = new_key_hash
        api_key.updated_at = datetime.utcnow()
        
        # Save changes
        await api_key.save()
        
        logger.info(f"Regenerated API key {key_id} for user {current_user.email}")
        
        return APIKeyResponse(
            id=str(api_key.id),
            user_id=str(api_key.user_id),
            organization_id=str(api_key.organization_id) if api_key.organization_id else None,
            name=api_key.name,
            description=api_key.description,
            key_id=api_key.key_id,
            api_key=new_api_key_value,  # Only shown on regeneration
            status=api_key.status,
            user_tier=api_key.user_tier,
            scopes=api_key.scopes,
            quota_limits=api_key.quota_limits,
            usage_stats=api_key.usage_stats,
            allowed_ips=api_key.allowed_ips,
            allowed_domains=api_key.allowed_domains,
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
            expires_at=api_key.expires_at,
            last_used_at=api_key.last_used_at,
            is_expired=api_key.is_expired(),
            is_active=api_key.is_active()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate API key"
        )


@router.get("/{key_id}/quota", response_model=QuotaStatusResponse)
async def get_quota_status(
    key_id: str,
    current_user: User = Depends(get_current_user)
) -> QuotaStatusResponse:
    """
    Get quota status for an API key
    
    Args:
        key_id: API key ID
        current_user: Authenticated user
        
    Returns:
        Quota status and usage information
    """
    try:
        # Find API key
        api_key = await APIKey.find_one({
            "key_id": key_id,
            "user_id": ObjectId(current_user.id)
        })
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Get quota status
        quota_status = await quota_service.get_quota_status(api_key)
        
        return QuotaStatusResponse(**quota_status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting quota status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get quota status"
        )


@router.post("/{key_id}/quota/reset")
async def reset_quota(
    key_id: str,
    usage_type: Optional[str] = Query(None, description="Usage type to reset"),
    window: Optional[str] = Query(None, description="Time window to reset"),
    current_user: User = Depends(verify_role(["admin"]))
) -> Dict[str, str]:
    """
    Reset quota for an API key (admin only)
    
    Args:
        key_id: API key ID
        usage_type: Optional usage type to reset
        window: Optional time window to reset
        current_user: Authenticated admin user
        
    Returns:
        Success message
    """
    try:
        # Find API key (any user's key for admin)
        api_key = await APIKey.find_one({"key_id": key_id})
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Reset quota
        success = await quota_service.reset_quota(
            str(api_key.id),
            usage_type=usage_type,
            window=window
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reset quota"
            )
        
        logger.info(f"Admin {current_user.email} reset quota for API key {key_id}")
        
        return {"message": "Quota reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting quota: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset quota"
        )


@router.post("/{key_id}/upgrade")
async def upgrade_tier(
    key_id: str,
    new_tier: UserTier = Body(..., description="New user tier"),
    current_user: User = Depends(verify_role(["admin"]))
) -> Dict[str, str]:
    """
    Upgrade user tier for an API key (admin only)
    
    Args:
        key_id: API key ID
        new_tier: New user tier
        current_user: Authenticated admin user
        
    Returns:
        Success message
    """
    try:
        # Find API key
        api_key = await APIKey.find_one({"key_id": key_id})
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Upgrade tier
        success = await quota_service.upgrade_user_tier(str(api_key.id), new_tier)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upgrade tier"
            )
        
        logger.info(f"Admin {current_user.email} upgraded API key {key_id} to tier {new_tier}")
        
        return {"message": f"API key upgraded to {new_tier} tier successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upgrading tier: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade tier"
        )