"""WebSocket routes for real-time workflow execution updates."""

from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger
import json
import asyncio

router = APIRouter(
    prefix="/ws",
    tags=["websocket"]
)


class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""

    def __init__(self):
        # Map of execution_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of WebSocket -> execution_id for cleanup
        self.connection_to_execution: Dict[WebSocket, str] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, execution_id: str):
        """Accept a new WebSocket connection for an execution."""
        await websocket.accept()

        async with self._lock:
            if execution_id not in self.active_connections:
                self.active_connections[execution_id] = set()

            self.active_connections[execution_id].add(websocket)
            self.connection_to_execution[websocket] = execution_id

        logger.info(f"WebSocket connected for execution {execution_id}. Total connections: {len(self.active_connections[execution_id])}")

    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        async with self._lock:
            execution_id = self.connection_to_execution.pop(websocket, None)

            if execution_id and execution_id in self.active_connections:
                self.active_connections[execution_id].discard(websocket)

                # Clean up empty execution groups
                if not self.active_connections[execution_id]:
                    del self.active_connections[execution_id]
                    logger.info(f"No more connections for execution {execution_id}, cleaned up")
                else:
                    logger.info(f"WebSocket disconnected for execution {execution_id}. Remaining: {len(self.active_connections[execution_id])}")

    async def broadcast_to_execution(self, execution_id: str, message: dict):
        """Broadcast a message to all connections watching an execution."""
        async with self._lock:
            connections = self.active_connections.get(execution_id, set()).copy()

        if not connections:
            logger.debug(f"No connections to broadcast to for execution {execution_id}")
            return

        # Serialize message once
        message_json = json.dumps(message)

        # Send to all connections
        disconnected = []
        for connection in connections:
            try:
                await connection.send_text(message_json)
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {e}")
                disconnected.append(connection)

        # Clean up disconnected connections
        for connection in disconnected:
            await self.disconnect(connection)

    async def send_to_execution(self, execution_id: str, event_type: str, data: dict):
        """Send a structured event to all connections watching an execution."""
        message = {
            "type": event_type,
            "execution_id": execution_id,
            "data": data,
            "timestamp": data.get("timestamp", None)
        }
        await self.broadcast_to_execution(execution_id, message)


# Global connection manager instance
manager = ConnectionManager()


@router.websocket("/executions/{execution_id}")
async def websocket_execution_endpoint(websocket: WebSocket, execution_id: str):
    """
    WebSocket endpoint for streaming workflow execution updates.

    Clients connect to this endpoint to receive real-time updates about
    a specific workflow execution, including:
    - Status changes (queued -> running -> success/error)
    - Node execution updates
    - Logs and errors
    - Progress updates

    Example client usage:
        const ws = new WebSocket('ws://localhost:8000/ws/executions/{execution_id}');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Execution update:', data);
        };
    """
    await manager.connect(websocket, execution_id)

    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "execution_id": execution_id,
            "message": "Connected to execution stream"
        })

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages from client (e.g., ping/pong)
                data = await websocket.receive_text()

                # Handle client messages if needed
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                except json.JSONDecodeError:
                    pass

            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {e}")
                break

    finally:
        await manager.disconnect(websocket)


# Export manager for use in workflow executor
__all__ = ["router", "manager"]
