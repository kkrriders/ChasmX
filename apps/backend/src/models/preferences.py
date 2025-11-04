"""User preferences model definitions"""

from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing_extensions import Annotated

# Custom type for MongoDB ObjectId
PyObjectId = Annotated[str, BeforeValidator(lambda x: str(x) if isinstance(x, ObjectId) else x)]

class NotificationPreferences(BaseModel):
    """Notification preferences model"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")  # MongoDB _id
    user_id: str  # Reference to user
    email_notifications: bool = Field(default=True, description="Email notifications enabled")
    workflow_alerts: bool = Field(default=True, description="Workflow execution alerts")
    security_alerts: bool = Field(default=True, description="Security-related alerts")
    marketing_updates: bool = Field(default=False, description="Marketing and promotional updates")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "email_notifications": True,
                "workflow_alerts": True,
                "security_alerts": True,
                "marketing_updates": False
            }
        },
        populate_by_name=True,
        arbitrary_types_allowed=True
    )