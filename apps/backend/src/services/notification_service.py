"""Notification service for sending in-app and email notifications.

This service provides a unified interface for sending notifications through
multiple channels (in-app, email) while respecting user preferences.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger
from bson import ObjectId

from src.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
)
from src.utils.email import send_generic_alert_email


class NotificationService:
    """Service for managing and sending notifications."""

    def __init__(self, db: AsyncIOMotorDatabase):
        """Initialize notification service.

        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.notifications_collection = db.notifications
        self.preferences_collection = db.notification_preferences

    # ================================================================
    # Core notification methods
    # ================================================================

    async def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        data: Optional[Dict[str, Any]] = None,
        action_url: Optional[str] = None,
        expires_in_days: Optional[int] = 30,
        send_email: bool = False,
        email_subject: Optional[str] = None,
        email_body: Optional[str] = None,
    ) -> Optional[Notification]:
        """Create and store a notification for a user.

        Args:
            user_id: ID of the user to notify
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            priority: Notification priority level
            data: Additional data for the notification
            action_url: URL for notification action
            expires_in_days: Days until notification expires (None for no expiry)
            send_email: Whether to also send email notification
            email_subject: Custom email subject (uses title if not provided)
            email_body: Custom email body (uses message if not provided)

        Returns:
            Created notification or None if failed
        """
        try:
            # Check user preferences
            preferences = await self._get_user_preferences(user_id)
            if not preferences.get("email_notifications", True) and send_email:
                send_email = False
                logger.info(f"Email notifications disabled for user {user_id}")

            # Calculate expiry date
            expires_at = None
            if expires_in_days:
                expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

            # Create notification document
            notification = Notification(
                user_id=user_id,
                type=notification_type,
                title=title,
                message=message,
                priority=priority,
                data=data or {},
                action_url=action_url,
                expires_at=expires_at,
            )

            # Insert into database
            notification_dict = notification.model_dump(by_alias=True, exclude={"id"})
            result = await self.notifications_collection.insert_one(notification_dict)
            notification.id = str(result.inserted_id)

            logger.info(
                f"Created notification for user {user_id}: {notification_type.value}"
            )

            # Send email if requested
            if send_email:
                user = await self.db.users.find_one({"_id": ObjectId(user_id)})
                if user:
                    email = user.get("email")
                    if email:
                        await send_generic_alert_email(
                            to_email=email,
                            subject=email_subject or title,
                            body=email_body or message,
                        )

            return notification

        except Exception as e:
            logger.error(f"Failed to create notification: {e}")
            return None

    async def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Notification]:
        """Get notifications for a user.

        Args:
            user_id: User ID
            unread_only: Only return unread notifications
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip

        Returns:
            List of notifications
        """
        try:
            query = {"user_id": user_id}
            if unread_only:
                query["is_read"] = False

            # Exclude expired notifications
            query["$or"] = [
                {"expires_at": None},
                {"expires_at": {"$gt": datetime.utcnow()}},
            ]

            cursor = (
                self.notifications_collection.find(query)
                .sort("created_at", -1)
                .skip(offset)
                .limit(limit)
            )

            notifications = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                notifications.append(Notification(**doc))

            return notifications

        except Exception as e:
            logger.error(f"Failed to get notifications for user {user_id}: {e}")
            return []

    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for a user.

        Args:
            user_id: User ID

        Returns:
            Count of unread notifications
        """
        try:
            count = await self.notifications_collection.count_documents(
                {
                    "user_id": user_id,
                    "is_read": False,
                    "$or": [
                        {"expires_at": None},
                        {"expires_at": {"$gt": datetime.utcnow()}},
                    ],
                }
            )
            return count
        except Exception as e:
            logger.error(f"Failed to get unread count for user {user_id}: {e}")
            return 0

    async def mark_as_read(
        self, notification_id: str, user_id: str
    ) -> bool:
        """Mark a notification as read.

        Args:
            notification_id: Notification ID
            user_id: User ID (for authorization)

        Returns:
            True if successful
        """
        try:
            result = await self.notifications_collection.update_one(
                {"_id": ObjectId(notification_id), "user_id": user_id},
                {"$set": {"is_read": True, "read_at": datetime.utcnow()}},
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {e}")
            return False

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user.

        Args:
            user_id: User ID

        Returns:
            Number of notifications marked as read
        """
        try:
            result = await self.notifications_collection.update_many(
                {"user_id": user_id, "is_read": False},
                {"$set": {"is_read": True, "read_at": datetime.utcnow()}},
            )
            return result.modified_count
        except Exception as e:
            logger.error(f"Failed to mark all notifications as read: {e}")
            return 0

    async def delete_notification(
        self, notification_id: str, user_id: str
    ) -> bool:
        """Delete a notification.

        Args:
            notification_id: Notification ID
            user_id: User ID (for authorization)

        Returns:
            True if successful
        """
        try:
            result = await self.notifications_collection.delete_one(
                {"_id": ObjectId(notification_id), "user_id": user_id}
            )
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete notification: {e}")
            return False

    async def delete_expired_notifications(self) -> int:
        """Delete all expired notifications (maintenance task).

        Returns:
            Number of notifications deleted
        """
        try:
            result = await self.notifications_collection.delete_many(
                {"expires_at": {"$lt": datetime.utcnow()}}
            )
            logger.info(f"Deleted {result.deleted_count} expired notifications")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Failed to delete expired notifications: {e}")
            return 0

    # ================================================================
    # Helper methods
    # ================================================================

    async def _get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user notification preferences.

        Args:
            user_id: User ID

        Returns:
            User preferences dict
        """
        try:
            preferences = await self.preferences_collection.find_one(
                {"user_id": user_id}
            )
            if preferences:
                return preferences
            # Return defaults if no preferences found
            return {
                "email_notifications": True,
                "workflow_alerts": True,
                "security_alerts": True,
            }
        except Exception as e:
            logger.error(f"Failed to get user preferences: {e}")
            return {"email_notifications": True}

    async def _get_user_email(self, user_id: str) -> Optional[str]:
        """Get user email by ID.

        Args:
            user_id: User ID

        Returns:
            User email or None
        """
        try:
            user = await self.db.users.find_one({"_id": ObjectId(user_id)})
            return user.get("email") if user else None
        except Exception as e:
            logger.error(f"Failed to get user email: {e}")
            return None

    # ================================================================
    # Convenience methods for common notification types
    # ================================================================

    async def notify_team_invitation(
        self,
        user_id: str,
        user_email: str,
        team_id: str,
        team_name: str,
        inviter_name: str,
        invitation_token: str,
        message: Optional[str] = None,
    ) -> Optional[Notification]:
        """Send team invitation notification.

        Args:
            user_id: User ID being invited (may be None for non-registered users)
            user_email: Email of user being invited
            team_id: Team ID
            team_name: Team name
            inviter_name: Name of person sending invitation
            invitation_token: Token to accept invitation
            message: Optional personal message from inviter

        Returns:
            Created notification or None
        """
        title = f"Team Invitation: {team_name}"
        notification_message = f"{inviter_name} invited you to join '{team_name}'"
        if message:
            notification_message += f"\n\nMessage: {message}"

        # Email body
        email_body = f"""
Hello,

{inviter_name} has invited you to join the team "{team_name}" on ChasmX.

{f'Personal message: {message}' if message else ''}

To accept this invitation, log in to your ChasmX account and navigate to your pending invitations.

If you don't have a ChasmX account yet, you can create one at: http://localhost:3000/auth/register

This invitation will expire in 7 days.

Best regards,
ChasmX Team
"""

        # For registered users, create in-app notification
        if user_id:
            return await self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.TEAM_INVITATION,
                title=title,
                message=notification_message,
                priority=NotificationPriority.HIGH,
                data={
                    "team_id": team_id,
                    "team_name": team_name,
                    "inviter_name": inviter_name,
                    "invitation_token": invitation_token,
                },
                action_url="/teams/invitations",
                expires_in_days=7,
                send_email=True,
                email_subject=f"You're invited to join {team_name} on ChasmX",
                email_body=email_body,
            )
        else:
            # For non-registered users, just send email
            await send_generic_alert_email(
                to_email=user_email,
                subject=f"You're invited to join {team_name} on ChasmX",
                body=email_body,
            )
            return None

    async def notify_team_invitation_accepted(
        self,
        inviter_user_id: str,
        team_name: str,
        accepted_by_name: str,
    ) -> Optional[Notification]:
        """Notify inviter that their invitation was accepted.

        Args:
            inviter_user_id: User ID of the person who sent the invitation
            team_name: Team name
            accepted_by_name: Name of person who accepted

        Returns:
            Created notification or None
        """
        return await self.create_notification(
            user_id=inviter_user_id,
            notification_type=NotificationType.TEAM_INVITATION_ACCEPTED,
            title="Invitation Accepted",
            message=f"{accepted_by_name} accepted your invitation to join '{team_name}'",
            priority=NotificationPriority.MEDIUM,
            data={"team_name": team_name, "accepted_by": accepted_by_name},
            expires_in_days=7,
        )

    async def notify_workflow_completed(
        self,
        user_id: str,
        workflow_id: str,
        workflow_name: str,
        execution_time_ms: int,
    ) -> Optional[Notification]:
        """Notify user that workflow execution completed.

        Args:
            user_id: User ID
            workflow_id: Workflow ID
            workflow_name: Workflow name
            execution_time_ms: Execution time in milliseconds

        Returns:
            Created notification or None
        """
        # Check if user wants workflow alerts
        preferences = await self._get_user_preferences(user_id)
        if not preferences.get("workflow_alerts", True):
            return None

        execution_time_sec = execution_time_ms / 1000
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.WORKFLOW_COMPLETED,
            title="Workflow Completed",
            message=f"'{workflow_name}' completed successfully in {execution_time_sec:.2f}s",
            priority=NotificationPriority.LOW,
            data={
                "workflow_id": workflow_id,
                "workflow_name": workflow_name,
                "execution_time_ms": execution_time_ms,
            },
            action_url=f"/workflows/{workflow_id}",
            expires_in_days=7,
        )

    async def notify_workflow_failed(
        self,
        user_id: str,
        workflow_id: str,
        workflow_name: str,
        error_message: str,
    ) -> Optional[Notification]:
        """Notify user that workflow execution failed.

        Args:
            user_id: User ID
            workflow_id: Workflow ID
            workflow_name: Workflow name
            error_message: Error message

        Returns:
            Created notification or None
        """
        # Check if user wants workflow alerts
        preferences = await self._get_user_preferences(user_id)
        if not preferences.get("workflow_alerts", True):
            return None

        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.WORKFLOW_FAILED,
            title="Workflow Failed",
            message=f"'{workflow_name}' failed: {error_message[:100]}",
            priority=NotificationPriority.HIGH,
            data={
                "workflow_id": workflow_id,
                "workflow_name": workflow_name,
                "error": error_message,
            },
            action_url=f"/workflows/{workflow_id}",
            expires_in_days=14,
            send_email=True,
            email_subject=f"Workflow Failed: {workflow_name}",
            email_body=f"""
Hello,

Your workflow "{workflow_name}" has failed to execute.

Error: {error_message}

Please check your workflow configuration and try again.

View workflow: http://localhost:3000/workflows/{workflow_id}

Best regards,
ChasmX Team
""",
        )

    async def notify_security_event(
        self,
        user_id: str,
        event_type: NotificationType,
        title: str,
        message: str,
    ) -> Optional[Notification]:
        """Notify user of a security-related event.

        Args:
            user_id: User ID
            event_type: Type of security event
            title: Notification title
            message: Notification message

        Returns:
            Created notification or None
        """
        # Check if user wants security alerts
        preferences = await self._get_user_preferences(user_id)
        if not preferences.get("security_alerts", True):
            return None

        return await self.create_notification(
            user_id=user_id,
            notification_type=event_type,
            title=title,
            message=message,
            priority=NotificationPriority.HIGH,
            expires_in_days=30,
            send_email=True,
        )


# Singleton instance holder
_notification_service: Optional[NotificationService] = None


def get_notification_service(db: AsyncIOMotorDatabase) -> NotificationService:
    """Get or create notification service instance.

    Args:
        db: MongoDB database instance

    Returns:
        NotificationService instance
    """
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService(db)
    return _notification_service
