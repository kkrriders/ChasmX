"""
Collaboration routes for real-time workflow editing.

Provides WebSocket and REST endpoints for:
- Real-time collaboration
- Presence tracking
- Version history
- Comments and discussions
"""

from typing import Dict, Set, Optional, List, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
from loguru import logger
import json
import asyncio
from datetime import datetime
import uuid

from ..services.collaboration_service import CollaborationService
from ..models.collaboration import (
    PresenceStatus,
    CursorPosition,
    VersionType,
    CommentStatus,
    ChangeType,
)

router = APIRouter(
    prefix="/collaboration",
    tags=["collaboration"]
)


# ============================================================
# WEBSOCKET CONNECTION MANAGER
# ============================================================

class CollaborationManager:
    """Manages WebSocket connections for real-time collaboration"""

    def __init__(self):
        # Map of workflow_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of WebSocket -> workflow_id for cleanup
        self.connection_to_workflow: Dict[WebSocket, str] = {}
        # Map of WebSocket -> session_id
        self.connection_to_session: Dict[WebSocket, str] = {}
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        workflow_id: str,
        user_id: str,
        user_name: str,
        user_email: str,
        user_avatar: Optional[str] = None,
    ):
        """Accept a new WebSocket connection for collaboration"""
        await websocket.accept()

        session_id = str(uuid.uuid4())

        async with self._lock:
            if workflow_id not in self.active_connections:
                self.active_connections[workflow_id] = set()

            self.active_connections[workflow_id].add(websocket)
            self.connection_to_workflow[websocket] = workflow_id
            self.connection_to_session[websocket] = session_id

        # Create presence record
        await CollaborationService.update_presence(
            workflow_id=workflow_id,
            user_id=user_id,
            user_name=user_name,
            user_email=user_email,
            session_id=session_id,
            status=PresenceStatus.VIEWING,
            user_avatar=user_avatar,
        )

        # Notify others
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "user_joined",
                "user_id": user_id,
                "user_name": user_name,
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
            exclude=websocket,
        )

        logger.info(
            f"WebSocket connected for collaboration on workflow {workflow_id}. "
            f"User: {user_name}, Session: {session_id}"
        )

        return session_id

    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        async with self._lock:
            workflow_id = self.connection_to_workflow.pop(websocket, None)
            session_id = self.connection_to_session.pop(websocket, None)

            if workflow_id and workflow_id in self.active_connections:
                self.active_connections[workflow_id].discard(websocket)

                # Clean up empty workflow groups
                if not self.active_connections[workflow_id]:
                    del self.active_connections[workflow_id]
                    logger.info(f"No more connections for workflow {workflow_id}, cleaned up")

        # Remove presence record
        if session_id:
            await CollaborationService.remove_presence(session_id)

            # Notify others
            if workflow_id:
                await self.broadcast_to_workflow(
                    workflow_id,
                    {
                        "type": "user_left",
                        "session_id": session_id,
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )

    async def broadcast_to_workflow(
        self,
        workflow_id: str,
        message: dict,
        exclude: Optional[WebSocket] = None,
    ):
        """Broadcast a message to all connections for a workflow"""
        async with self._lock:
            connections = self.active_connections.get(workflow_id, set()).copy()

        if not connections:
            return

        # Serialize message once
        message_json = json.dumps(message)

        # Send to all connections except excluded
        disconnected = []
        for connection in connections:
            if connection == exclude:
                continue

            try:
                await connection.send_text(message_json)
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {e}")
                disconnected.append(connection)

        # Clean up disconnected connections
        for connection in disconnected:
            await self.disconnect(connection)

    async def send_to_session(self, session_id: str, message: dict):
        """Send a message to a specific session"""
        # Find the connection with this session_id
        target_connection = None
        async with self._lock:
            for connection, sid in self.connection_to_session.items():
                if sid == session_id:
                    target_connection = connection
                    break

        if target_connection:
            try:
                await target_connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to session {session_id}: {e}")
                await self.disconnect(target_connection)


# Global collaboration manager instance
collab_manager = CollaborationManager()


# ============================================================
# WEBSOCKET ENDPOINTS
# ============================================================

@router.websocket("/workflows/{workflow_id}")
async def websocket_collaboration_endpoint(
    websocket: WebSocket,
    workflow_id: str,
    user_id: str,
    user_name: str,
    user_email: str,
    user_avatar: Optional[str] = None,
):
    """
    WebSocket endpoint for real-time workflow collaboration.

    Supports:
    - Presence awareness (who's viewing/editing)
    - Live cursor tracking
    - Real-time edits synchronization
    - Comments and notifications

    Example client usage:
        const ws = new WebSocket(
            'ws://localhost:8000/collaboration/workflows/workflow_123?'
            + 'user_id=user_1&user_name=John&user_email=john@example.com'
        );

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleCollaborationEvent(data);
        };

        // Update cursor position
        ws.send(JSON.stringify({
            type: 'cursor_move',
            cursor_position: { x: 100, y: 200, node_id: 'node_1' }
        }));
    """
    session_id = await collab_manager.connect(
        websocket, workflow_id, user_id, user_name, user_email, user_avatar
    )

    try:
        # Send initial connection confirmation with active users
        active_users = await CollaborationService.get_active_users(workflow_id)
        await websocket.send_json({
            "type": "connected",
            "workflow_id": workflow_id,
            "session_id": session_id,
            "active_users": active_users,
            "timestamp": datetime.utcnow().isoformat(),
        })

        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)

                # Handle different message types
                await handle_collaboration_message(
                    message,
                    workflow_id,
                    user_id,
                    user_name,
                    session_id,
                    websocket,
                )

            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from session {session_id}")
            except Exception as e:
                logger.error(f"Error in collaboration WebSocket loop: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                })

    finally:
        await collab_manager.disconnect(websocket)


async def handle_collaboration_message(
    message: dict,
    workflow_id: str,
    user_id: str,
    user_name: str,
    session_id: str,
    websocket: WebSocket,
):
    """Handle incoming collaboration messages"""
    msg_type = message.get("type")

    if msg_type == "ping":
        # Heartbeat
        await websocket.send_json({"type": "pong"})

    elif msg_type == "cursor_move":
        # Update cursor position
        cursor_data = message.get("cursor_position", {})
        cursor_position = CursorPosition(**cursor_data) if cursor_data else None

        await CollaborationService.update_presence(
            workflow_id=workflow_id,
            user_id=user_id,
            user_name=user_name,
            user_email=message.get("user_email", ""),
            session_id=session_id,
            status=PresenceStatus.EDITING,
            cursor_position=cursor_position,
        )

        # Broadcast cursor position to others
        await collab_manager.broadcast_to_workflow(
            workflow_id,
            {
                "type": "cursor_update",
                "user_id": user_id,
                "session_id": session_id,
                "cursor_position": cursor_data,
                "timestamp": datetime.utcnow().isoformat(),
            },
            exclude=websocket,
        )

    elif msg_type == "status_change":
        # Update presence status
        status = PresenceStatus(message.get("status", "viewing"))
        await CollaborationService.update_presence(
            workflow_id=workflow_id,
            user_id=user_id,
            user_name=user_name,
            user_email=message.get("user_email", ""),
            session_id=session_id,
            status=status,
        )

    elif msg_type == "workflow_change":
        # Track and broadcast workflow changes
        change_type = ChangeType(message.get("change_type"))
        change_data = message.get("change_data", {})

        await CollaborationService.track_change(
            workflow_id=workflow_id,
            change_type=change_type,
            change_data=change_data,
            user_id=user_id,
            user_name=user_name,
            session_id=session_id,
        )

        # Broadcast change to others
        await collab_manager.broadcast_to_workflow(
            workflow_id,
            {
                "type": "workflow_updated",
                "change_type": change_type,
                "change_data": change_data,
                "user_id": user_id,
                "user_name": user_name,
                "timestamp": datetime.utcnow().isoformat(),
            },
            exclude=websocket,
        )

    else:
        logger.warning(f"Unknown message type: {msg_type}")


# ============================================================
# REST API ENDPOINTS
# ============================================================

@router.get("/workflows/{workflow_id}/presence")
async def get_workflow_presence(workflow_id: str):
    """Get active users for a workflow"""
    active_users = await CollaborationService.get_active_users(workflow_id)
    return {
        "workflow_id": workflow_id,
        "active_users": active_users,
        "count": len(active_users),
    }


@router.post("/workflows/{workflow_id}/versions")
async def create_workflow_version(
    workflow_id: str,
    workflow_data: Dict[str, Any],
    created_by: str,
    created_by_name: str,
    version_type: VersionType = VersionType.AUTO,
    description: Optional[str] = None,
    tags: Optional[List[str]] = None,
    is_checkpoint: bool = False,
):
    """Create a new workflow version"""
    version = await CollaborationService.create_version(
        workflow_id=workflow_id,
        workflow_data=workflow_data,
        created_by=created_by,
        created_by_name=created_by_name,
        version_type=version_type,
        description=description,
        tags=tags,
        is_checkpoint=is_checkpoint,
    )

    return {
        "version_number": version.version_number,
        "created_at": version.created_at.isoformat(),
        "version_type": version.version_type,
    }


@router.get("/workflows/{workflow_id}/versions")
async def get_workflow_versions(
    workflow_id: str,
    limit: int = Query(50, ge=1, le=100),
    checkpoints_only: bool = False,
):
    """Get version history for a workflow"""
    versions = await CollaborationService.get_version_history(
        workflow_id=workflow_id,
        limit=limit,
        checkpoints_only=checkpoints_only,
    )

    return {
        "workflow_id": workflow_id,
        "versions": versions,
        "count": len(versions),
    }


@router.get("/workflows/{workflow_id}/versions/{version_number}")
async def get_workflow_version(workflow_id: str, version_number: int):
    """Get a specific workflow version"""
    version = await CollaborationService.get_version(workflow_id, version_number)

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    return {
        "version_number": version.version_number,
        "version_type": version.version_type,
        "created_by": version.created_by,
        "created_by_name": version.created_by_name,
        "created_at": version.created_at.isoformat(),
        "workflow_data": version.workflow_data,
        "change_summary": version.change_summary,
        "tags": version.tags,
        "description": version.description,
        "is_checkpoint": version.is_checkpoint,
    }


@router.get("/workflows/{workflow_id}/versions/compare")
async def compare_workflow_versions(
    workflow_id: str,
    version_a: int,
    version_b: int,
):
    """Compare two workflow versions"""
    try:
        diff = await CollaborationService.compare_versions(
            workflow_id, version_a, version_b
        )
        return diff
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/workflows/{workflow_id}/comments")
async def create_comment(
    workflow_id: str,
    author_id: str,
    author_name: str,
    content: str,
    node_id: Optional[str] = None,
    position: Optional[Dict[str, float]] = None,
    author_avatar: Optional[str] = None,
):
    """Create a new comment thread"""
    thread = await CollaborationService.create_comment_thread(
        workflow_id=workflow_id,
        author_id=author_id,
        author_name=author_name,
        content=content,
        node_id=node_id,
        position=position,
        author_avatar=author_avatar,
    )

    # Broadcast to active users
    await collab_manager.broadcast_to_workflow(
        workflow_id,
        {
            "type": "comment_added",
            "thread_id": thread.thread_id,
            "node_id": node_id,
            "author_name": author_name,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )

    return {
        "thread_id": thread.thread_id,
        "created_at": thread.created_at.isoformat(),
    }


@router.post("/comments/{thread_id}/replies")
async def add_comment_reply(
    thread_id: str,
    author_id: str,
    author_name: str,
    content: str,
    author_avatar: Optional[str] = None,
):
    """Add a reply to a comment thread"""
    try:
        thread = await CollaborationService.add_comment_to_thread(
            thread_id=thread_id,
            author_id=author_id,
            author_name=author_name,
            content=content,
            author_avatar=author_avatar,
        )

        # Broadcast to active users
        await collab_manager.broadcast_to_workflow(
            thread.workflow_id,
            {
                "type": "comment_reply",
                "thread_id": thread_id,
                "author_name": author_name,
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

        return {"success": True}

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/comments/{thread_id}/resolve")
async def resolve_comment(thread_id: str, resolved_by: str):
    """Mark a comment thread as resolved"""
    try:
        thread = await CollaborationService.resolve_comment_thread(
            thread_id, resolved_by
        )

        # Broadcast to active users
        await collab_manager.broadcast_to_workflow(
            thread.workflow_id,
            {
                "type": "comment_resolved",
                "thread_id": thread_id,
                "resolved_by": resolved_by,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

        return {"success": True}

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/workflows/{workflow_id}/comments")
async def get_workflow_comments(
    workflow_id: str,
    node_id: Optional[str] = None,
    status: Optional[CommentStatus] = None,
):
    """Get comments for a workflow"""
    comments = await CollaborationService.get_comments(
        workflow_id=workflow_id,
        node_id=node_id,
        status=status,
    )

    return {
        "workflow_id": workflow_id,
        "comments": comments,
        "count": len(comments),
    }


@router.get("/workflows/{workflow_id}/changes")
async def get_workflow_changes(
    workflow_id: str,
    limit: int = Query(100, ge=1, le=500),
):
    """Get change history for a workflow"""
    changes = await CollaborationService.get_change_history(
        workflow_id=workflow_id,
        limit=limit,
    )

    return {
        "workflow_id": workflow_id,
        "changes": changes,
        "count": len(changes),
    }


# Export router and manager
__all__ = ["router", "collab_manager"]
