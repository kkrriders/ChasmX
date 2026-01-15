"""Notification schemas for API requests and responses."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

from src.models.notification import NotificationType, NotificationPriority


class NotificationOut(BaseModel):
    """Response model for a notification."""
    id: str = Field(..., alias="_id")
    user_id: str
    type: NotificationType
    title: str
    message: str
    priority: NotificationPriority
    data: Dict[str, Any] = Field(default_factory=dict)
    action_url: Optional[str] = None
    is_read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "user_id": "507f1f77bcf86cd799439012",
                "type": "team_invitation",
                "title": "Team Invitation",
                "message": "John Doe invited you to join 'Engineering Team'",
                "priority": "medium",
                "data": {
                    "team_id": "507f1f77bcf86cd799439013",
                    "team_name": "Engineering Team"
                },
                "action_url": "/teams/invitations",
                "is_read": False,
                "created_at": "2024-01-15T10:00:00Z"
            }
        }
    )


class NotificationListResponse(BaseModel):
    """Response model for list of notifications with metadata."""
    notifications: List[NotificationOut]
    total_unread: int
    has_more: bool

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "notifications": [],
                "total_unread": 5,
                "has_more": True
            }
        }
    )


class UnreadCountResponse(BaseModel):
    """Response model for unread notification count."""
    count: int

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "count": 5
            }
        }
    )


class MarkAsReadRequest(BaseModel):
    """Request model for marking notifications as read."""
    notification_ids: List[str] = Field(
        ...,
        description="List of notification IDs to mark as read"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "notification_ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
            }
        }
    )


class MarkAsReadResponse(BaseModel):
    """Response model for mark as read operation."""
    marked_count: int

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "marked_count": 2
            }
        }
    )
