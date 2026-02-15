

import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from bson import ObjectId
from bson.errors import InvalidId
from loguru import logger

from ..core.config import settings
from ..models.collaboration import (
    UserPresence,
    PresenceStatus,
    CursorPosition,
    WorkflowVersion,
    VersionType,
    WorkflowComment,
    CommentStatus,
    Comment,
    CollaborationSession,
    CollaborationSessionStatus,
    WorkflowChange,
    ChangeType,
)


class CollaborationService:
    """Service for managing workflow collaboration features"""

    # ============================================================
    # PRESENCE MANAGEMENT
    # ============================================================

    @staticmethod
    async def update_presence(
        workflow_id: str,
        user_id: str,
        user_name: str,
        user_email: str,
        session_id: str,
        status: PresenceStatus = PresenceStatus.VIEWING,
        cursor_position: Optional[CursorPosition] = None,
        user_avatar: Optional[str] = None,
        client_info: Optional[Dict[str, Any]] = None,
    ) -> UserPresence:
        """
        Update or create user presence in a workflow.

        Args:
            workflow_id: Workflow being viewed/edited
            user_id: User ID
            user_name: User display name
            user_email: User email
            session_id: WebSocket session ID
            status: Current presence status
            cursor_position: Current cursor position
            user_avatar: User avatar URL
            client_info: Client browser/device info

        Returns:
            UserPresence object
        """
        now = datetime.utcnow()

        # Clean up any stale presence records for this user in this workflow
        # (except the current session) to prevent accumulation
        stale_cutoff = now - timedelta(minutes=settings.PRESENCE_STALE_MINUTES)
        await UserPresence.find(
            UserPresence.workflow_id == workflow_id,
            UserPresence.user_id == user_id,
            UserPresence.session_id != session_id,
            UserPresence.last_active < stale_cutoff,
        ).delete()

        # Try to find existing presence for this session
        presence = await UserPresence.find_one(
            UserPresence.workflow_id == workflow_id,
            UserPresence.session_id == session_id,
        )

        if presence:
            # Update existing
            presence.status = status
            presence.last_active = now
            if cursor_position:
                presence.cursor_position = cursor_position
            await presence.save()
            logger.debug(f"Updated presence for user {user_id} in workflow {workflow_id}")
        else:
            # Create new
            presence = UserPresence(
                workflow_id=workflow_id,
                user_id=user_id,
                user_name=user_name,
                user_email=user_email,
                user_avatar=user_avatar,
                status=status,
                cursor_position=cursor_position,
                session_id=session_id,
                connected_at=now,
                last_active=now,
                client_info=client_info,
            )
            await presence.insert()
            logger.info(f"Created presence for user {user_id} in workflow {workflow_id}")

        return presence

    @staticmethod
    async def remove_presence(session_id: str) -> bool:
        """
        Remove user presence by session ID.

        Args:
            session_id: WebSocket session ID

        Returns:
            True if presence was removed
        """
        presence = await UserPresence.find_one(UserPresence.session_id == session_id)
        if presence:
            await presence.delete()
            logger.info(f"Removed presence for session {session_id}")
            return True
        return False

    @staticmethod
    async def get_active_users(workflow_id: str) -> List[Dict[str, Any]]:
        """
        Get all active users for a workflow.

        Args:
            workflow_id: Workflow ID

        Returns:
            List of active user presence data
        """
        # Find all recent presence
        cutoff_time = datetime.utcnow() - timedelta(minutes=settings.PRESENCE_CLEANUP_INTERVAL_MINUTES)

        presences = await UserPresence.find(
            UserPresence.workflow_id == workflow_id,
            UserPresence.last_active >= cutoff_time,
        ).to_list()

        return [
            {
                "user_id": p.user_id,
                "user_name": p.user_name,
                "user_email": p.user_email,
                "user_avatar": p.user_avatar,
                "status": p.status,
                "cursor_position": p.cursor_position.model_dump() if p.cursor_position else None,
                "session_id": p.session_id,
                "connected_at": p.connected_at.isoformat(),
                "last_active": p.last_active.isoformat(),
            }
            for p in presences
        ]

    @staticmethod
    async def cleanup_stale_presence(max_age_minutes: Optional[int] = None) -> int:
        """
        Remove stale presence records.

        Args:
            max_age_minutes: Max age before considering stale (defaults to config value)

        Returns:
            Number of records removed
        """
        if max_age_minutes is None:
            max_age_minutes = settings.PRESENCE_STALE_MINUTES

        cutoff_time = datetime.utcnow() - timedelta(minutes=max_age_minutes)
        result = await UserPresence.find(
            UserPresence.last_active < cutoff_time
        ).delete()
        count = result.deleted_count if result else 0
        if count > 0:
            logger.info(f"Cleaned up {count} stale presence records")
        return count

    # ============================================================
    # VERSION HISTORY
    # ============================================================

    @staticmethod
    async def create_version(
        workflow_id: str,
        workflow_data: Dict[str, Any],
        created_by: str,
        created_by_name: str,
        version_type: VersionType = VersionType.AUTO,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        is_checkpoint: bool = False,
    ) -> WorkflowVersion:
        """
        Create a new workflow version with retry logic to handle concurrent updates.

        Args:
            workflow_id: Workflow ID
            workflow_data: Complete workflow JSON
            created_by: User ID
            created_by_name: User display name
            version_type: Type of version
            description: User description
            tags: Version tags
            is_checkpoint: Mark as checkpoint

        Returns:
            WorkflowVersion object
        """
        max_retries = 3

        for attempt in range(max_retries):
            try:
                # Get latest version number
                latest = await WorkflowVersion.find(
                    WorkflowVersion.workflow_id == workflow_id
                ).sort(-WorkflowVersion.version_number).first_or_none()

                version_number = (latest.version_number + 1) if latest else 1
                parent_version = latest.version_number if latest else None

                # TODO: Calculate diff from parent
                change_summary = None
                changes = None
                if latest:
                    change_summary = "Workflow updated"
                    # Could add diff calculation here

                version = WorkflowVersion(
                    workflow_id=workflow_id,
                    version_number=version_number,
                    version_type=version_type,
                    created_by=created_by,
                    created_by_name=created_by_name,
                    workflow_data=workflow_data,
                    parent_version=parent_version,
                    change_summary=change_summary,
                    changes=changes,
                    tags=tags or [],
                    description=description,
                    is_checkpoint=is_checkpoint,
                )

                await version.insert()
                logger.info(
                    f"Created version {version_number} for workflow {workflow_id} "
                    f"by {created_by_name} (type: {version_type})"
                )

                return version

            except Exception as e:
                # Check if it's a duplicate key error (concurrent version creation)
                if "duplicate" in str(e).lower() or "unique" in str(e).lower():
                    if attempt < max_retries - 1:
                        # Exponential backoff
                        wait_time = 0.1 * (2 ** attempt)
                        logger.warning(
                            f"Version conflict for workflow {workflow_id}, "
                            f"retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})"
                        )
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"Failed to create version after {max_retries} retries")
                        raise ValueError("Failed to create version due to concurrent updates")
                else:
                    # Re-raise non-duplicate errors immediately
                    raise

    @staticmethod
    async def get_version_history(
        workflow_id: str,
        limit: int = 50,
        checkpoints_only: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Get version history for a workflow.

        Args:
            workflow_id: Workflow ID
            limit: Max versions to return
            checkpoints_only: Only return checkpoint versions

        Returns:
            List of version metadata (without full workflow_data)
        """
        # Build query conditions upfront for better performance
        conditions = [WorkflowVersion.workflow_id == workflow_id]

        if checkpoints_only:
            conditions.append(WorkflowVersion.is_checkpoint == True)

        versions = await WorkflowVersion.find(*conditions).sort(
            -WorkflowVersion.version_number
        ).limit(limit).to_list()

        return [
            {
                "version_number": v.version_number,
                "version_type": v.version_type,
                "created_by": v.created_by,
                "created_by_name": v.created_by_name,
                "created_at": v.created_at.isoformat(),
                "change_summary": v.change_summary,
                "tags": v.tags,
                "description": v.description,
                "is_checkpoint": v.is_checkpoint,
                "parent_version": v.parent_version,
            }
            for v in versions
        ]

    @staticmethod
    async def get_version(workflow_id: str, version_number: int) -> Optional[WorkflowVersion]:
        """
        Get a specific workflow version.

        Args:
            workflow_id: Workflow ID
            version_number: Version number

        Returns:
            WorkflowVersion object or None
        """
        return await WorkflowVersion.find_one(
            WorkflowVersion.workflow_id == workflow_id,
            WorkflowVersion.version_number == version_number,
        )

    @staticmethod
    async def compare_versions(
        workflow_id: str,
        version_a: int,
        version_b: int,
    ) -> Dict[str, Any]:
        """
        Compare two workflow versions.

        Args:
            workflow_id: Workflow ID
            version_a: First version number
            version_b: Second version number

        Returns:
            Diff data
        """
        v_a = await CollaborationService.get_version(workflow_id, version_a)
        v_b = await CollaborationService.get_version(workflow_id, version_b)

        if not v_a or not v_b:
            raise ValueError("One or both versions not found")

        # TODO: Implement proper diff algorithm
        # For now, return basic comparison
        return {
            "version_a": version_a,
            "version_b": version_b,
            "created_at_a": v_a.created_at.isoformat(),
            "created_at_b": v_b.created_at.isoformat(),
            "created_by_a": v_a.created_by_name,
            "created_by_b": v_b.created_by_name,
            "workflow_data_a": v_a.workflow_data,
            "workflow_data_b": v_b.workflow_data,
            # Add proper diff here
            "changes": {
                "nodes_added": [],
                "nodes_removed": [],
                "nodes_modified": [],
                "edges_added": [],
                "edges_removed": [],
            },
        }

    # ============================================================
    # COMMENTS & DISCUSSIONS
    # ============================================================

    @staticmethod
    async def create_comment_thread(
        workflow_id: str,
        author_id: str,
        author_name: str,
        content: str,
        node_id: Optional[str] = None,
        position: Optional[Dict[str, float]] = None,
        author_avatar: Optional[str] = None,
    ) -> WorkflowComment:
        """
        Create a new comment thread.

        Args:
            workflow_id: Workflow ID
            author_id: Comment author user ID
            author_name: Author display name
            content: Comment text
            node_id: Specific node (if applicable)
            position: Position in canvas
            author_avatar: Author avatar URL

        Returns:
            WorkflowComment object
        """
        # Validate and sanitize content
        if not content or len(content.strip()) == 0:
            raise ValueError("Comment content cannot be empty")

        if len(content) > 5000:
            raise ValueError("Comment exceeds maximum length of 5000 characters")

        # Trim whitespace
        content = content.strip()

        comment = Comment(
            author_id=author_id,
            author_name=author_name,
            author_avatar=author_avatar,
            content=content,
        )

        thread = WorkflowComment(
            workflow_id=workflow_id,
            node_id=node_id,
            position=position,
            comments=[comment],
            participant_ids=[author_id],
        )

        await thread.insert()
        logger.info(f"Created comment thread for workflow {workflow_id} by {author_name}")

        return thread

    @staticmethod
    async def add_comment_to_thread(
        thread_id: str,
        author_id: str,
        author_name: str,
        content: str,
        author_avatar: Optional[str] = None,
    ) -> WorkflowComment:
        """
        Add a comment to an existing thread.

        Args:
            thread_id: Thread ID
            author_id: Comment author user ID
            author_name: Author display name
            content: Comment text
            author_avatar: Author avatar URL

        Returns:
            Updated WorkflowComment object
        """
        # Validate thread_id format
        try:
            ObjectId(thread_id)
        except (InvalidId, TypeError):
            raise ValueError(f"Invalid thread_id format: {thread_id}")

        # Validate and sanitize content
        if not content or len(content.strip()) == 0:
            raise ValueError("Comment content cannot be empty")

        if len(content) > 5000:
            raise ValueError("Comment exceeds maximum length of 5000 characters")

        # Trim whitespace
        content = content.strip()

        thread = await WorkflowComment.find_one(WorkflowComment.thread_id == thread_id)
        if not thread:
            raise ValueError(f"Thread {thread_id} not found")

        comment = Comment(
            author_id=author_id,
            author_name=author_name,
            author_avatar=author_avatar,
            content=content,
        )

        thread.comments.append(comment)
        thread.last_activity = datetime.utcnow()

        if author_id not in thread.participant_ids:
            thread.participant_ids.append(author_id)

        await thread.save()
        logger.info(f"Added comment to thread {thread_id} by {author_name}")

        return thread

    @staticmethod
    async def resolve_comment_thread(thread_id: str, resolved_by: str) -> WorkflowComment:
        """
        Mark a comment thread as resolved.

        Args:
            thread_id: Thread ID
            resolved_by: User ID who resolved

        Returns:
            Updated WorkflowComment object
        """
        # Validate thread_id format
        try:
            ObjectId(thread_id)
        except (InvalidId, TypeError):
            raise ValueError(f"Invalid thread_id format: {thread_id}")

        thread = await WorkflowComment.find_one(WorkflowComment.thread_id == thread_id)
        if not thread:
            raise ValueError(f"Thread {thread_id} not found")

        thread.status = CommentStatus.RESOLVED
        thread.resolved_by = resolved_by
        thread.resolved_at = datetime.utcnow()

        await thread.save()
        logger.info(f"Resolved comment thread {thread_id}")

        return thread

    @staticmethod
    async def get_comments(
        workflow_id: str,
        node_id: Optional[str] = None,
        status: Optional[CommentStatus] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get comments for a workflow.

        Args:
            workflow_id: Workflow ID
            node_id: Filter by specific node
            status: Filter by status

        Returns:
            List of comment threads
        """
        # Validate inputs
        if node_id and not isinstance(node_id, str):
            raise ValueError("node_id must be a string")

        # Validate status is from enum
        if status and not isinstance(status, CommentStatus):
            try:
                status = CommentStatus(status)
            except ValueError:
                raise ValueError(f"Invalid status: {status}")

        # Build query conditions upfront for better performance
        conditions = [WorkflowComment.workflow_id == workflow_id]

        if node_id:
            conditions.append(WorkflowComment.node_id == node_id)

        if status:
            conditions.append(WorkflowComment.status == status)

        threads = await WorkflowComment.find(*conditions).sort(
            -WorkflowComment.last_activity
        ).to_list()

        return [
            {
                "thread_id": t.thread_id,
                "workflow_id": t.workflow_id,
                "node_id": t.node_id,
                "position": t.position,
                "status": t.status,
                "comments": [c.model_dump() for c in t.comments],
                "created_at": t.created_at.isoformat(),
                "last_activity": t.last_activity.isoformat(),
                "participant_ids": t.participant_ids,
                "resolved_by": t.resolved_by,
                "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            }
            for t in threads
        ]

    # ============================================================
    # CHANGE TRACKING
    # ============================================================

    @staticmethod
    async def track_change(
        workflow_id: str,
        change_type: ChangeType,
        change_data: Dict[str, Any],
        user_id: str,
        user_name: str,
        session_id: Optional[str] = None,
        version: Optional[int] = None,
    ) -> WorkflowChange:
        """
        Track a workflow change.

        Args:
            workflow_id: Workflow ID
            change_type: Type of change
            change_data: Change payload
            user_id: User who made the change
            user_name: User display name
            session_id: Collaboration session ID
            version: Associated version number

        Returns:
            WorkflowChange object
        """
        change = WorkflowChange(
            workflow_id=workflow_id,
            session_id=session_id,
            change_type=change_type,
            change_data=change_data,
            user_id=user_id,
            user_name=user_name,
            version=version,
        )

        await change.insert()
        logger.debug(f"Tracked {change_type} for workflow {workflow_id} by {user_name}")

        return change

    @staticmethod
    async def get_change_history(
        workflow_id: str,
        limit: int = 100,
        since: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get change history for a workflow.

        Args:
            workflow_id: Workflow ID
            limit: Max changes to return
            since: Only return changes after this time

        Returns:
            List of changes
        """
        query = WorkflowChange.find(WorkflowChange.workflow_id == workflow_id)

        if since:
            query = query.find(WorkflowChange.timestamp >= since)

        changes = await query.sort(-WorkflowChange.timestamp).limit(limit).to_list()

        return [
            {
                "change_type": c.change_type,
                "change_data": c.change_data,
                "user_id": c.user_id,
                "user_name": c.user_name,
                "timestamp": c.timestamp.isoformat(),
                "session_id": c.session_id,
                "version": c.version,
            }
            for c in changes
        ]


# Export service
__all__ = ["CollaborationService"]
