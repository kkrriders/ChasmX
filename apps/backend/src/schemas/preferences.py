"""User preferences response schemas.

This module defines the Pydantic schemas for user preferences API responses.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class NotificationPreferencesOut(BaseModel):
    """Notification preferences response model"""
    email_notifications: bool = Field(description="Email notifications enabled")
    workflow_alerts: bool = Field(description="Workflow execution alerts")
    security_alerts: bool = Field(description="Security-related alerts")
    marketing_updates: bool = Field(description="Marketing and promotional updates")
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email_notifications": True,
                "workflow_alerts": True,
                "security_alerts": True,
                "marketing_updates": False,
                "created_at": "2025-11-03T10:00:00",
                "updated_at": "2025-11-03T10:30:00"
            }
        },
        from_attributes=True
    )

class NotificationPreferencesUpdate(BaseModel):
    """Schema for updating notification preferences"""
    email_notifications: Optional[bool] = Field(None, description="Email notifications enabled")
    workflow_alerts: Optional[bool] = Field(None, description="Workflow execution alerts")
    security_alerts: Optional[bool] = Field(None, description="Security-related alerts")
    marketing_updates: Optional[bool] = Field(None, description="Marketing and promotional updates")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email_notifications": True,
                "workflow_alerts": True,
                "security_alerts": True,
                "marketing_updates": False
            }
        }
    )