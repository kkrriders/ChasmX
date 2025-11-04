"""Notification preferences service.

This module provides services for managing user notification preferences.
"""

from datetime import datetime
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from loguru import logger

from src.models.preferences import NotificationPreferences
from src.schemas.preferences import NotificationPreferencesOut, NotificationPreferencesUpdate

class NotificationPreferencesService:
    """Service for managing notification preferences"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.notification_preferences
    
    async def get_user_preferences(self, user_id: str) -> NotificationPreferencesOut:
        """Get notification preferences for a user.
        
        Args:
            user_id: The user ID
            
        Returns:
            NotificationPreferencesOut: The user's notification preferences
            
        Raises:
            HTTPException: If preferences not found, creates default preferences
        """
        logger.info(f"Getting notification preferences for user: {user_id}")
        
        # Try to find existing preferences
        preferences = await self.collection.find_one({"user_id": user_id})
        
        if not preferences:
            # Create default preferences if none exist
            logger.info(f"Creating default notification preferences for user: {user_id}")
            default_prefs = NotificationPreferences(
                user_id=user_id,
                email_notifications=True,
                workflow_alerts=True,
                security_alerts=True,
                marketing_updates=False
            )
            
            # Insert into database
            result = await self.collection.insert_one(default_prefs.model_dump(exclude={"id"}))
            
            # Fetch the created preferences
            preferences = await self.collection.find_one({"_id": result.inserted_id})
            
            if not preferences:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create default notification preferences"
                )
        
        return NotificationPreferencesOut.model_validate(preferences)
    
    async def update_user_preferences(
        self, 
        user_id: str, 
        preferences_update: NotificationPreferencesUpdate
    ) -> NotificationPreferencesOut:
        """Update notification preferences for a user.
        
        Args:
            user_id: The user ID
            preferences_update: The preferences update data
            
        Returns:
            NotificationPreferencesOut: The updated notification preferences
            
        Raises:
            HTTPException: If update fails
        """
        logger.info(f"Updating notification preferences for user: {user_id}")
        
        # Prepare update data - only include fields that were provided
        update_data = {}
        
        if preferences_update.email_notifications is not None:
            update_data["email_notifications"] = preferences_update.email_notifications
        if preferences_update.workflow_alerts is not None:
            update_data["workflow_alerts"] = preferences_update.workflow_alerts
        if preferences_update.security_alerts is not None:
            update_data["security_alerts"] = preferences_update.security_alerts
        if preferences_update.marketing_updates is not None:
            update_data["marketing_updates"] = preferences_update.marketing_updates
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        # If no fields to update, get current preferences
        if not update_data:
            logger.info(f"No fields to update for user preferences: {user_id}")
            return await self.get_user_preferences(user_id)
        
        # Update preferences in database
        result = await self.collection.update_one(
            {"user_id": user_id},
            {"$set": update_data},
            upsert=True  # Create if doesn't exist
        )
        
        if result.matched_count == 0 and result.upserted_id is None:
            # If neither matched nor upserted, try to create default first
            logger.info(f"Creating default preferences before update for user: {user_id}")
            await self.get_user_preferences(user_id)  # This will create defaults
            
            # Try update again
            result = await self.collection.update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update notification preferences"
                )
        
        # Fetch and return updated preferences
        updated_preferences = await self.collection.find_one({"user_id": user_id})
        if not updated_preferences:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preferences not found after update"
            )
        
        logger.info(f"Notification preferences updated successfully for user: {user_id}")
        return NotificationPreferencesOut.model_validate(updated_preferences)
    
    async def delete_user_preferences(self, user_id: str) -> bool:
        """Delete notification preferences for a user.
        
        Args:
            user_id: The user ID
            
        Returns:
            bool: True if deleted successfully
        """
        logger.info(f"Deleting notification preferences for user: {user_id}")
        
        result = await self.collection.delete_one({"user_id": user_id})
        
        return result.deleted_count > 0

# Global service instance (to be initialized with database)
notification_preferences_service: Optional[NotificationPreferencesService] = None

def get_notification_preferences_service(db: AsyncIOMotorDatabase) -> NotificationPreferencesService:
    """Get or create notification preferences service instance"""
    return NotificationPreferencesService(db)