"""
Agent-to-Agent Protocol (AAP).
Implements inter-agent messaging using Redis Pub/Sub.
"""
from typing import Optional, Dict, Any, Callable, Awaitable
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import json
import asyncio
from loguru import logger
import redis.asyncio as redis


class MessageType(str, Enum):
    """Types of agent messages"""
    TASK_REQUEST = "task_request"  # Request another agent to perform a task
    TASK_RESPONSE = "task_response"  # Response to a task request
    TASK_UPDATE = "task_update"  # Progress update on a task
    QUERY = "query"  # Query for information
    RESPONSE = "response"  # Response to a query
    NOTIFICATION = "notification"  # General notification
    ERROR = "error"  # Error message
    BROADCAST = "broadcast"  # Message to all agents


class MessagePriority(str, Enum):
    """Message priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class AgentMessage(BaseModel):
    """Message exchanged between agents"""
    id: str = Field(..., description="Unique message identifier")
    type: MessageType = Field(..., description="Message type")
    from_agent: str = Field(..., description="Sender agent ID")
    to_agent: Optional[str] = Field(None, description="Recipient agent ID (None for broadcast)")
    subject: str = Field(..., description="Message subject")
    content: Dict[str, Any] = Field(..., description="Message content")
    priority: MessagePriority = Field(default=MessagePriority.MEDIUM)
    requires_response: bool = Field(default=False, description="Whether response is expected")
    reply_to: Optional[str] = Field(None, description="Message ID this is replying to")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(None, description="Message expiration time")
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        use_enum_values = True


class AgentMessageBus:
    """
    Message bus for agent-to-agent communication using Redis Pub/Sub.
    """

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """
        Initialize message bus.

        Args:
            redis_url: Redis connection URL
        """
        self.redis_url = redis_url
        self.publisher: Optional[redis.Redis] = None
        self.subscriber: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.client.PubSub] = None
        self.message_handlers: Dict[str, Callable[[AgentMessage], Awaitable[None]]] = {}
        self.listening = False
        self.listen_task: Optional[asyncio.Task] = None

    async def connect(self):
        """Establish connection to Redis for pub/sub"""
        try:
            self.publisher = await redis.from_url(
                self.redis_url,
                decode_responses=True
            )
            self.subscriber = await redis.from_url(
                self.redis_url,
                decode_responses=True
            )
            self.pubsub = self.subscriber.pubsub()

            # Test connection
            await self.publisher.ping()
            logger.info(f"Connected to Redis message bus at {self.redis_url}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis message bus: {e}")
            raise

    async def disconnect(self):
        """Close Redis connections"""
        self.listening = False

        if self.listen_task:
            self.listen_task.cancel()
            try:
                await self.listen_task
            except asyncio.CancelledError:
                pass

        if self.pubsub:
            await self.pubsub.close()

        if self.publisher:
            await self.publisher.close()

        if self.subscriber:
            await self.subscriber.close()

        logger.info("Disconnected from Redis message bus")

    def _get_channel_name(self, agent_id: Optional[str] = None) -> str:
        """Get channel name for agent or broadcast"""
        if agent_id:
            return f"agent:messages:{agent_id}"
        return "agent:messages:broadcast"

    async def publish(self, message: AgentMessage) -> bool:
        """
        Publish a message to an agent or broadcast channel.

        Args:
            message: Message to publish

        Returns:
            True if published successfully
        """
        if not self.publisher:
            logger.error("Publisher not connected")
            return False

        try:
            # Determine channel
            if message.type == MessageType.BROADCAST or not message.to_agent:
                channel = self._get_channel_name()
            else:
                channel = self._get_channel_name(message.to_agent)

            # Serialize message
            message_dict = message.model_dump()
            message_dict['timestamp'] = message.timestamp.isoformat()
            if message.expires_at:
                message_dict['expires_at'] = message.expires_at.isoformat()

            message_json = json.dumps(message_dict)

            # Publish to channel
            await self.publisher.publish(channel, message_json)

            logger.debug(
                f"Published message {message.id} from {message.from_agent} "
                f"to {message.to_agent or 'broadcast'} on channel {channel}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to publish message {message.id}: {e}")
            return False

    async def subscribe(self, agent_id: str):
        """
        Subscribe to messages for a specific agent.

        Args:
            agent_id: Agent identifier
        """
        if not self.pubsub:
            logger.error("PubSub not initialized")
            return

        try:
            # Subscribe to agent-specific channel
            agent_channel = self._get_channel_name(agent_id)
            await self.pubsub.subscribe(agent_channel)

            # Subscribe to broadcast channel
            broadcast_channel = self._get_channel_name()
            await self.pubsub.subscribe(broadcast_channel)

            logger.info(f"Agent {agent_id} subscribed to channels: {agent_channel}, {broadcast_channel}")

        except Exception as e:
            logger.error(f"Failed to subscribe agent {agent_id}: {e}")
            raise

    async def unsubscribe(self, agent_id: str):
        """
        Unsubscribe from agent channels.

        Args:
            agent_id: Agent identifier
        """
        if not self.pubsub:
            return

        try:
            agent_channel = self._get_channel_name(agent_id)
            broadcast_channel = self._get_channel_name()

            await self.pubsub.unsubscribe(agent_channel)
            await self.pubsub.unsubscribe(broadcast_channel)

            logger.info(f"Agent {agent_id} unsubscribed from channels")

        except Exception as e:
            logger.error(f"Failed to unsubscribe agent {agent_id}: {e}")

    def register_handler(
        self,
        message_type: MessageType,
        handler: Callable[[AgentMessage], Awaitable[None]]
    ):
        """
        Register a handler for a specific message type.

        Args:
            message_type: Type of message to handle
            handler: Async function to handle the message
        """
        self.message_handlers[message_type] = handler
        logger.debug(f"Registered handler for message type: {message_type}")

    async def start_listening(self):
        """Start listening for messages"""
        if not self.pubsub:
            logger.error("PubSub not initialized")
            return

        self.listening = True
        self.listen_task = asyncio.create_task(self._listen_loop())
        logger.info("Started listening for messages")

    async def stop_listening(self):
        """Stop listening for messages"""
        self.listening = False
        if self.listen_task:
            self.listen_task.cancel()
            try:
                await self.listen_task
            except asyncio.CancelledError:
                pass
        logger.info("Stopped listening for messages")

    async def _listen_loop(self):
        """Internal loop for listening to messages"""
        try:
            while self.listening:
                try:
                    message = await self.pubsub.get_message(
                        ignore_subscribe_messages=True,
                        timeout=1.0
                    )

                    if message and message['type'] == 'message':
                        await self._handle_message(message['data'])

                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Error in listen loop: {e}")
                    await asyncio.sleep(1)

        except asyncio.CancelledError:
            logger.debug("Listen loop cancelled")

    async def _handle_message(self, message_data: str):
        """Handle incoming message"""
        try:
            # Parse message
            message_dict = json.loads(message_data)

            # Convert ISO strings back to datetime
            if 'timestamp' in message_dict:
                message_dict['timestamp'] = datetime.fromisoformat(message_dict['timestamp'])
            if message_dict.get('expires_at'):
                message_dict['expires_at'] = datetime.fromisoformat(message_dict['expires_at'])

            message = AgentMessage(**message_dict)

            # Check if message has expired
            if message.expires_at and datetime.utcnow() > message.expires_at:
                logger.debug(f"Message {message.id} has expired, ignoring")
                return

            # Find and call handler
            handler = self.message_handlers.get(message.type)
            if handler:
                await handler(message)
            else:
                logger.debug(f"No handler registered for message type: {message.type}")

        except Exception as e:
            logger.error(f"Failed to handle message: {e}")

    async def send_task_request(
        self,
        from_agent: str,
        to_agent: str,
        task_description: str,
        task_data: Dict[str, Any],
        priority: MessagePriority = MessagePriority.MEDIUM
    ) -> str:
        """
        Send a task request to another agent.

        Args:
            from_agent: Sender agent ID
            to_agent: Recipient agent ID
            task_description: Description of the task
            task_data: Task data
            priority: Message priority

        Returns:
            Message ID
        """
        message_id = f"{from_agent}:{to_agent}:{datetime.utcnow().timestamp()}"

        message = AgentMessage(
            id=message_id,
            type=MessageType.TASK_REQUEST,
            from_agent=from_agent,
            to_agent=to_agent,
            subject=task_description,
            content=task_data,
            priority=priority,
            requires_response=True
        )

        await self.publish(message)
        return message_id

    async def send_task_response(
        self,
        from_agent: str,
        to_agent: str,
        reply_to: str,
        result: Dict[str, Any],
        success: bool = True
    ):
        """
        Send a task response.

        Args:
            from_agent: Sender agent ID
            to_agent: Recipient agent ID
            reply_to: Original task request message ID
            result: Task result
            success: Whether task was successful
        """
        message_id = f"response:{reply_to}"

        message = AgentMessage(
            id=message_id,
            type=MessageType.TASK_RESPONSE,
            from_agent=from_agent,
            to_agent=to_agent,
            subject="Task Response",
            content={"success": success, "result": result},
            reply_to=reply_to
        )

        await self.publish(message)

    async def broadcast(
        self,
        from_agent: str,
        subject: str,
        content: Dict[str, Any],
        priority: MessagePriority = MessagePriority.LOW
    ):
        """
        Broadcast a message to all agents.

        Args:
            from_agent: Sender agent ID
            subject: Message subject
            content: Message content
            priority: Message priority
        """
        message_id = f"broadcast:{from_agent}:{datetime.utcnow().timestamp()}"

        message = AgentMessage(
            id=message_id,
            type=MessageType.BROADCAST,
            from_agent=from_agent,
            to_agent=None,
            subject=subject,
            content=content,
            priority=priority
        )

        await self.publish(message)
