"""
Agent Context Protocol (ACP).
Manages agent memory, rules, and preferences.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import json
from loguru import logger

from ..cache.redis_cache import RedisCache


class MemoryType(str, Enum):
    """Types of agent memory"""
    SHORT_TERM = "short_term"  # Current conversation/task context
    LONG_TERM = "long_term"  # Persistent knowledge and experiences
    WORKING = "working"  # Temporary scratchpad for computations
    EPISODIC = "episodic"  # Specific events and interactions


class MemoryEntry(BaseModel):
    """A single memory entry"""
    id: str = Field(..., description="Unique memory identifier")
    type: MemoryType = Field(..., description="Type of memory")
    content: str = Field(..., description="Memory content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    importance: float = Field(default=0.5, ge=0.0, le=1.0, description="Memory importance score")
    access_count: int = Field(default=0, description="Number of times accessed")
    last_accessed: Optional[datetime] = Field(None, description="Last access time")

    class Config:
        use_enum_values = True


class AgentRule(BaseModel):
    """Rules that govern agent behavior"""
    id: str = Field(..., description="Rule identifier")
    name: str = Field(..., description="Rule name")
    description: str = Field(..., description="Rule description")
    condition: str = Field(..., description="When this rule applies")
    action: str = Field(..., description="What to do when triggered")
    priority: int = Field(default=0, description="Rule priority (higher = more important)")
    enabled: bool = Field(default=True, description="Whether rule is active")


class AgentPreferences(BaseModel):
    """Agent preferences and settings"""
    communication_style: str = Field(default="professional", description="How agent communicates")
    verbosity: str = Field(default="medium", description="Detail level: low, medium, high")
    risk_tolerance: str = Field(default="medium", description="Risk appetite: low, medium, high")
    decision_making: str = Field(default="balanced", description="analytical, creative, or balanced")
    custom_settings: Dict[str, Any] = Field(default_factory=dict, description="Custom preferences")


class AgentContext(BaseModel):
    """Complete context for an agent"""
    agent_id: str = Field(..., description="Agent identifier")
    agent_type: str = Field(..., description="Type/role of agent")
    memories: List[MemoryEntry] = Field(default_factory=list, description="Agent memories")
    rules: List[AgentRule] = Field(default_factory=list, description="Behavioral rules")
    preferences: AgentPreferences = Field(default_factory=AgentPreferences)
    state: Dict[str, Any] = Field(default_factory=dict, description="Current agent state")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def add_memory(self, memory: MemoryEntry):
        """Add a new memory entry"""
        self.memories.append(memory)
        self.updated_at = datetime.utcnow()

    def get_memories(
        self,
        memory_type: Optional[MemoryType] = None,
        limit: Optional[int] = None,
        min_importance: float = 0.0
    ) -> List[MemoryEntry]:
        """Retrieve memories with filtering"""
        filtered = self.memories

        if memory_type:
            filtered = [m for m in filtered if m.type == memory_type]

        filtered = [m for m in filtered if m.importance >= min_importance]

        # Sort by importance and recency
        filtered.sort(key=lambda m: (m.importance, m.timestamp), reverse=True)

        if limit:
            filtered = filtered[:limit]

        return filtered

    def add_rule(self, rule: AgentRule):
        """Add a new behavioral rule"""
        self.rules.append(rule)
        self.rules.sort(key=lambda r: r.priority, reverse=True)
        self.updated_at = datetime.utcnow()

    def get_active_rules(self) -> List[AgentRule]:
        """Get all enabled rules sorted by priority"""
        return [r for r in self.rules if r.enabled]

    def update_state(self, key: str, value: Any):
        """Update agent state"""
        self.state[key] = value
        self.updated_at = datetime.utcnow()


class ContextStore:
    """Storage backend for agent contexts"""

    def __init__(self, cache: RedisCache):
        """
        Initialize context store.

        Args:
            cache: Redis cache instance
        """
        self.cache = cache

    def _get_context_key(self, agent_id: str) -> str:
        """Generate cache key for agent context"""
        return f"agent:context:{agent_id}"

    async def save_context(self, context: AgentContext) -> bool:
        """
        Save agent context to storage.

        Args:
            context: Agent context to save

        Returns:
            True if successful
        """
        try:
            key = self._get_context_key(context.agent_id)
            context.updated_at = datetime.utcnow()

            context_dict = context.model_dump()
            # Convert datetime objects to ISO format strings
            context_dict = self._serialize_datetimes(context_dict)

            await self.cache.set(key, context_dict, ttl=86400)  # 24 hour TTL
            logger.debug(f"Saved context for agent {context.agent_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to save context for agent {context.agent_id}: {e}")
            return False

    async def load_context(self, agent_id: str) -> Optional[AgentContext]:
        """
        Load agent context from storage.

        Args:
            agent_id: Agent identifier

        Returns:
            Agent context or None if not found
        """
        try:
            key = self._get_context_key(agent_id)
            context_dict = await self.cache.get(key)

            if context_dict:
                # Convert ISO strings back to datetime objects
                context_dict = self._deserialize_datetimes(context_dict)
                return AgentContext(**context_dict)

            logger.debug(f"No context found for agent {agent_id}")
            return None
        except Exception as e:
            logger.error(f"Failed to load context for agent {agent_id}: {e}")
            return None

    async def delete_context(self, agent_id: str) -> bool:
        """
        Delete agent context.

        Args:
            agent_id: Agent identifier

        Returns:
            True if deleted
        """
        try:
            key = self._get_context_key(agent_id)
            return await self.cache.delete(key)
        except Exception as e:
            logger.error(f"Failed to delete context for agent {agent_id}: {e}")
            return False

    def _serialize_datetimes(self, obj: Any) -> Any:
        """Convert datetime objects to ISO strings recursively"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, dict):
            return {k: self._serialize_datetimes(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._serialize_datetimes(item) for item in obj]
        return obj

    def _deserialize_datetimes(self, obj: Any) -> Any:
        """Convert ISO strings to datetime objects recursively"""
        if isinstance(obj, str):
            try:
                return datetime.fromisoformat(obj)
            except (ValueError, AttributeError):
                return obj
        elif isinstance(obj, dict):
            result = {}
            for k, v in obj.items():
                # Convert datetime fields
                if k in ['timestamp', 'created_at', 'updated_at', 'last_accessed']:
                    if isinstance(v, str):
                        try:
                            result[k] = datetime.fromisoformat(v)
                        except (ValueError, AttributeError):
                            result[k] = v
                    else:
                        result[k] = v
                else:
                    result[k] = self._deserialize_datetimes(v)
            return result
        elif isinstance(obj, list):
            return [self._deserialize_datetimes(item) for item in obj]
        return obj


class AgentContextProtocol:
    """
    Agent Context Protocol implementation.
    Provides high-level interface for managing agent contexts.
    """

    def __init__(self, store: ContextStore):
        """
        Initialize ACP.

        Args:
            store: Context storage backend
        """
        self.store = store

    async def create_agent_context(
        self,
        agent_id: str,
        agent_type: str,
        preferences: Optional[AgentPreferences] = None
    ) -> AgentContext:
        """
        Create a new agent context.

        Args:
            agent_id: Agent identifier
            agent_type: Type/role of agent
            preferences: Agent preferences

        Returns:
            New agent context
        """
        context = AgentContext(
            agent_id=agent_id,
            agent_type=agent_type,
            preferences=preferences or AgentPreferences()
        )

        await self.store.save_context(context)
        logger.info(f"Created context for agent {agent_id} ({agent_type})")
        return context

    async def get_agent_context(self, agent_id: str) -> Optional[AgentContext]:
        """Get agent context"""
        return await self.store.load_context(agent_id)

    async def update_agent_context(self, context: AgentContext) -> bool:
        """Update agent context"""
        return await self.store.save_context(context)

    async def delete_agent_context(self, agent_id: str) -> bool:
        """Delete agent context"""
        return await self.store.delete_context(agent_id)

    async def add_memory(
        self,
        agent_id: str,
        content: str,
        memory_type: MemoryType,
        importance: float = 0.5,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add a memory to agent's context.

        Args:
            agent_id: Agent identifier
            content: Memory content
            memory_type: Type of memory
            importance: Importance score (0-1)
            metadata: Additional metadata

        Returns:
            True if successful
        """
        context = await self.get_agent_context(agent_id)
        if not context:
            logger.warning(f"No context found for agent {agent_id}")
            return False

        memory = MemoryEntry(
            id=f"{agent_id}:{datetime.utcnow().timestamp()}",
            type=memory_type,
            content=content,
            importance=importance,
            metadata=metadata or {}
        )

        context.add_memory(memory)
        return await self.update_agent_context(context)

    async def add_rule(
        self,
        agent_id: str,
        name: str,
        description: str,
        condition: str,
        action: str,
        priority: int = 0
    ) -> bool:
        """
        Add a behavioral rule to agent's context.

        Args:
            agent_id: Agent identifier
            name: Rule name
            description: Rule description
            condition: When rule applies
            action: What to do
            priority: Rule priority

        Returns:
            True if successful
        """
        context = await self.get_agent_context(agent_id)
        if not context:
            logger.warning(f"No context found for agent {agent_id}")
            return False

        rule = AgentRule(
            id=f"{agent_id}:rule:{len(context.rules)}",
            name=name,
            description=description,
            condition=condition,
            action=action,
            priority=priority
        )

        context.add_rule(rule)
        return await self.update_agent_context(context)
