"""
Collaboration models for real-time workflow editing.

This module defines the database models for:
- Presence tracking (who's viewing/editing)
- Cursor positions (live cursor tracking)
- Version history (workflow snapshots)
- Comments and reviews
- Collaboration sessions
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from enum import Enum
from beanie import Document, Indexed
from pydantic import BaseModel, Field
from bson import ObjectId


class PresenceStatus(str, Enum):
    """User presence status"""
    VIEWING = "viewing"
    EDITING = "editing"
    IDLE = "idle"
    OFFLINE = "offline"


class CursorPosition(BaseModel):
    """Cursor position in the workflow editor"""
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")
    node_id: Optional[str] = Field(None, description="Node being edited, if any")
    field: Optional[str] = Field(None, description="Field being edited, if any")


class UserPresence(Document):
    """
    Tracks active users in a workflow.

    Used for showing "who's here" and live cursor positions.
    Automatically expires after 5 minutes of inactivity.
    """
    workflow_id: Indexed(str) = Field(..., description="Workflow being viewed/edited")
    user_id: Indexed(str) = Field(..., description="User ID")
    user_name: str = Field(..., description="User display name")
    user_email: str = Field(..., description="User email")
    user_avatar: Optional[str] = Field(None, description="User avatar URL")

    status: PresenceStatus = Field(default=PresenceStatus.VIEWING, description="Current status")
    cursor_position: Optional[CursorPosition] = Field(None, description="Current cursor position")

    session_id: str = Field(..., description="WebSocket session ID")
    connected_at: datetime = Field(default_factory=datetime.utcnow, description="Connection time")
    last_active: datetime = Field(default_factory=datetime.utcnow, description="Last activity timestamp")

    # Metadata
    client_info: Optional[Dict[str, Any]] = Field(None, description="Client browser/device info")

    class Settings:
        name = "user_presence"
        indexes = [
            [("workflow_id", 1), ("user_id", 1)],
            [("workflow_id", 1), ("session_id", 1)],
            [("last_active", 1)],  # For cleanup queries
        ]

    def is_active(self) -> bool:
        """Check if user is still considered active (< 5 min)"""
        return (datetime.utcnow() - self.last_active) < timedelta(minutes=5)


class VersionType(str, Enum):
    """Type of version snapshot"""
    MANUAL = "manual"  # User saved manually
    AUTO = "auto"  # Auto-save
    CHECKPOINT = "checkpoint"  # Major milestone
    RESTORE = "restore"  # Restored from history


class WorkflowVersion(Document):
    """
    Version history for workflows.

    Stores complete snapshots of workflow state for:
    - Undo/redo functionality
    - Visual diff comparison
    - Rollback to previous versions
    """
    workflow_id: Indexed(str) = Field(..., description="Workflow ID")
    version_number: int = Field(..., description="Sequential version number")

    # Version metadata
    version_type: VersionType = Field(default=VersionType.AUTO, description="Type of save")
    created_by: str = Field(..., description="User who created this version")
    created_by_name: str = Field(..., description="User display name")
    created_at: Indexed(datetime) = Field(default_factory=datetime.utcnow, description="Creation time")

    # Workflow state
    workflow_data: Dict[str, Any] = Field(..., description="Complete workflow JSON")

    # Change tracking
    parent_version: Optional[int] = Field(None, description="Previous version number")
    change_summary: Optional[str] = Field(None, description="Summary of changes")
    changes: Optional[Dict[str, Any]] = Field(None, description="Detailed diff from parent")

    # Metadata
    tags: List[str] = Field(default_factory=list, description="Version tags")
    description: Optional[str] = Field(None, description="User description")
    is_checkpoint: bool = Field(default=False, description="Is this a major checkpoint?")

    class Settings:
        name = "workflow_versions"
        indexes = [
            [("workflow_id", 1), ("version_number", -1)],
            [("workflow_id", 1), ("created_at", -1)],
            [("workflow_id", 1), ("is_checkpoint", 1)],
        ]


class CommentStatus(str, Enum):
    """Comment status"""
    OPEN = "open"
    RESOLVED = "resolved"
    DELETED = "deleted"


class Comment(BaseModel):
    """Individual comment in a thread"""
    id: str = Field(default_factory=lambda: str(ObjectId()), description="Comment ID")
    author_id: str = Field(..., description="Author user ID")
    author_name: str = Field(..., description="Author display name")
    author_avatar: Optional[str] = Field(None, description="Author avatar URL")

    content: str = Field(..., description="Comment text")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation time")
    edited_at: Optional[datetime] = Field(None, description="Last edit time")

    # Reactions
    reactions: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Emoji reactions: {emoji: [user_ids]}"
    )


class WorkflowComment(Document):
    """
    Comments and discussions on workflows.

    Supports threaded discussions, reactions, and resolution tracking.
    Can be attached to the whole workflow or specific nodes.
    """
    workflow_id: Indexed(str) = Field(..., description="Workflow ID")

    # Comment location
    node_id: Optional[Indexed(str)] = Field(None, description="Specific node (if applicable)")
    position: Optional[Dict[str, float]] = Field(None, description="Position in canvas")

    # Thread
    thread_id: str = Field(default_factory=lambda: str(ObjectId()), description="Thread ID")
    comments: List[Comment] = Field(default_factory=list, description="Comment thread")

    # Status
    status: CommentStatus = Field(default=CommentStatus.OPEN, description="Thread status")
    resolved_by: Optional[str] = Field(None, description="User who resolved")
    resolved_at: Optional[datetime] = Field(None, description="Resolution time")

    # Metadata
    created_at: Indexed(datetime) = Field(default_factory=datetime.utcnow, description="Thread creation")
    last_activity: datetime = Field(default_factory=datetime.utcnow, description="Last comment time")
    participant_ids: List[str] = Field(default_factory=list, description="All participants")

    class Settings:
        name = "workflow_comments"
        indexes = [
            [("workflow_id", 1), ("status", 1)],
            [("workflow_id", 1), ("node_id", 1)],
            [("workflow_id", 1), ("created_at", -1)],
        ]


class CollaborationSessionStatus(str, Enum):
    """Collaboration session status"""
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"


class CollaborationSession(Document):
    """
    Collaboration session tracking.

    Groups related presence, edits, and activity for a workflow editing session.
    Useful for analytics and session replay.
    """
    workflow_id: Indexed(str) = Field(..., description="Workflow ID")
    session_id: str = Field(..., description="Unique session ID")

    # Session info
    started_at: Indexed(datetime) = Field(default_factory=datetime.utcnow, description="Session start")
    ended_at: Optional[datetime] = Field(None, description="Session end")
    status: CollaborationSessionStatus = Field(default=CollaborationSessionStatus.ACTIVE)

    # Participants
    participants: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of participants with join/leave times"
    )

    # Activity tracking
    total_edits: int = Field(default=0, description="Total edits in session")
    total_comments: int = Field(default=0, description="Total comments")
    versions_created: List[int] = Field(default_factory=list, description="Version numbers created")

    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional session data")

    class Settings:
        name = "collaboration_sessions"
        indexes = [
            [("workflow_id", 1), ("started_at", -1)],
            [("session_id", 1)],
            [("status", 1)],
        ]


class ChangeType(str, Enum):
    """Type of change made"""
    NODE_ADDED = "node_added"
    NODE_REMOVED = "node_removed"
    NODE_UPDATED = "node_updated"
    NODE_MOVED = "node_moved"
    EDGE_ADDED = "edge_added"
    EDGE_REMOVED = "edge_removed"
    PROPERTIES_UPDATED = "properties_updated"
    METADATA_UPDATED = "metadata_updated"


class WorkflowChange(Document):
    """
    Individual changes to workflows.

    Fine-grained change tracking for:
    - Operational transformation (OT)
    - Change feed / activity log
    - Conflict detection
    """
    workflow_id: Indexed(str) = Field(..., description="Workflow ID")
    session_id: Optional[str] = Field(None, description="Collaboration session")

    # Change info
    change_type: ChangeType = Field(..., description="Type of change")
    change_data: Dict[str, Any] = Field(..., description="Change payload")

    # Attribution
    user_id: str = Field(..., description="User who made the change")
    user_name: str = Field(..., description="User display name")
    timestamp: Indexed(datetime) = Field(default_factory=datetime.utcnow, description="When changed")

    # Context
    version: Optional[int] = Field(None, description="Associated version number")
    parent_change_id: Optional[str] = Field(None, description="Previous change ID")

    # Operational transformation
    operation: Optional[Dict[str, Any]] = Field(None, description="OT operation data")

    class Settings:
        name = "workflow_changes"
        indexes = [
            [("workflow_id", 1), ("timestamp", -1)],
            [("workflow_id", 1), ("session_id", 1)],
            [("user_id", 1), ("timestamp", -1)],
        ]


# Export all models
__all__ = [
    "UserPresence",
    "PresenceStatus",
    "CursorPosition",
    "WorkflowVersion",
    "VersionType",
    "WorkflowComment",
    "CommentStatus",
    "Comment",
    "CollaborationSession",
    "CollaborationSessionStatus",
    "WorkflowChange",
    "ChangeType",
]
