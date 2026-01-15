"""Notification model definitions for in-app notifications."""

from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing_extensions import Annotated

# Custom type for MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(lambda x: str(x) if isinstance(x, ObjectId) else x)]


class NotificationType(str, Enum):
    """Types of notifications supported by the system."""
    # Team notifications
    TEAM_INVITATION = "team_invitation"
    TEAM_INVITATION_ACCEPTED = "team_invitation_accepted"
    TEAM_INVITATION_DECLINED = "team_invitation_declined"
    TEAM_MEMBER_JOINED = "team_member_joined"
    TEAM_MEMBER_LEFT = "team_member_left"
    TEAM_ROLE_CHANGED = "team_role_changed"

    # Workflow notifications
    WORKFLOW_COMPLETED = "workflow_completed"
    WORKFLOW_FAILED = "workflow_failed"
    WORKFLOW_SHARED = "workflow_shared"

    # Budget notifications
    BUDGET_WARNING = "budget_warning"
    BUDGET_EXCEEDED = "budget_exceeded"

    # Security notifications
    PASSWORD_CHANGED = "password_changed"
    LOGIN_FROM_NEW_DEVICE = "login_from_new_device"
    TWO_FACTOR_ENABLED = "two_factor_enabled"
    TWO_FACTOR_DISABLED = "two_factor_disabled"

    # System notifications
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    MAINTENANCE_SCHEDULED = "maintenance_scheduled"


class NotificationPriority(str, Enum):
    """Priority levels for notifications."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(BaseModel):
    """In-app notification model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str = Field(..., description="User ID who receives this notification")
    type: NotificationType = Field(..., description="Type of notification")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message body")
    priority: NotificationPriority = Field(
        default=NotificationPriority.MEDIUM,
        description="Notification priority"
    )

    # Additional data for the notification (e.g., team_id, workflow_id, etc.)
    data: Dict[str, Any] = Field(default_factory=dict, description="Additional notification data")

    # Action URL for the notification (e.g., link to team page)
    action_url: Optional[str] = Field(None, description="URL for notification action")

    # Read status
    is_read: bool = Field(default=False, description="Whether notification has been read")
    read_at: Optional[datetime] = Field(None, description="When notification was read")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(None, description="When notification expires")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "type": "team_invitation",
                "title": "Team Invitation",
                "message": "John Doe invited you to join 'Engineering Team'",
                "priority": "medium",
                "data": {
                    "team_id": "507f1f77bcf86cd799439012",
                    "team_name": "Engineering Team",
                    "inviter_name": "John Doe"
                },
                "action_url": "/teams/invitations",
                "is_read": False
            }
        },
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

    def mark_as_read(self) -> None:
        """Mark notification as read."""
        self.is_read = True
        self.read_at = datetime.utcnow()

    def is_expired(self) -> bool:
        """Check if notification has expired."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at
