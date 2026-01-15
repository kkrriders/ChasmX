"""Notification routes for managing user notifications.

This module provides API endpoints for fetching, reading, and managing
user notifications.
"""

from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from loguru import logger

from src.auth.dependencies import get_current_user
from src.models.user import User
from src.core.database import get_database
from src.services.notification_service import get_notification_service
from src.schemas.notification import (
    NotificationOut,
    NotificationListResponse,
    UnreadCountResponse,
    MarkAsReadRequest,
    MarkAsReadResponse,
)

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    current_user: Annotated[User, Depends(get_current_user)],
    unread_only: bool = Query(False, description="Only return unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Maximum notifications to return"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    db=Depends(get_database),
) -> NotificationListResponse:
    """Get notifications for the current user.

    Args:
        current_user: Authenticated user
        unread_only: Filter to only unread notifications
        limit: Maximum number to return
        offset: Pagination offset
        db: Database instance

    Returns:
        List of notifications with metadata
    """
    try:
        user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
        notification_service = get_notification_service(db)

        notifications = await notification_service.get_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
            limit=limit + 1,  # Get one extra to check if there are more
            offset=offset,
        )

        # Check if there are more notifications
        has_more = len(notifications) > limit
        if has_more:
            notifications = notifications[:limit]

        # Get unread count
        total_unread = await notification_service.get_unread_count(user_id)

        return NotificationListResponse(
            notifications=[
                NotificationOut(
                    _id=str(n.id),
                    user_id=n.user_id,
                    type=n.type,
                    title=n.title,
                    message=n.message,
                    priority=n.priority,
                    data=n.data,
                    action_url=n.action_url,
                    is_read=n.is_read,
                    read_at=n.read_at,
                    created_at=n.created_at,
                    expires_at=n.expires_at,
                )
                for n in notifications
            ],
            total_unread=total_unread,
            has_more=has_more,
        )

    except Exception as e:
        logger.error(f"Error fetching notifications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notifications"
        )


@router.get("/unread/count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: Annotated[User, Depends(get_current_user)],
    db=Depends(get_database),
) -> UnreadCountResponse:
    """Get count of unread notifications.

    Args:
        current_user: Authenticated user
        db: Database instance

    Returns:
        Unread notification count
    """
    try:
        user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
        notification_service = get_notification_service(db)
        count = await notification_service.get_unread_count(user_id)
        return UnreadCountResponse(count=count)

    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get unread count"
        )


@router.post("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_as_read(
    notification_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db=Depends(get_database),
):
    """Mark a single notification as read.

    Args:
        notification_id: ID of notification to mark as read
        current_user: Authenticated user
        db: Database instance
    """
    try:
        user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
        notification_service = get_notification_service(db)

        success = await notification_service.mark_as_read(notification_id, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )


@router.post("/read/all", response_model=MarkAsReadResponse)
async def mark_all_as_read(
    current_user: Annotated[User, Depends(get_current_user)],
    db=Depends(get_database),
) -> MarkAsReadResponse:
    """Mark all notifications as read.

    Args:
        current_user: Authenticated user
        db: Database instance

    Returns:
        Number of notifications marked as read
    """
    try:
        user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
        notification_service = get_notification_service(db)
        count = await notification_service.mark_all_as_read(user_id)
        return MarkAsReadResponse(marked_count=count)

    except Exception as e:
        logger.error(f"Error marking all as read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read"
        )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db=Depends(get_database),
):
    """Delete a notification.

    Args:
        notification_id: ID of notification to delete
        current_user: Authenticated user
        db: Database instance
    """
    try:
        user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
        notification_service = get_notification_service(db)

        success = await notification_service.delete_notification(notification_id, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )


# Export router
__all__ = ["router"]
