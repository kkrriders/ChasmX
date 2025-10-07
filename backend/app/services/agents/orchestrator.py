"""
Agent Orchestrator Service.
Manages agent lifecycle, task delegation, and coordination.
"""
from typing import Dict, List, Optional, Any, Callable, Awaitable
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import asyncio
from loguru import logger

from .acp import AgentContext, AgentContextProtocol, MemoryType
from .aap import AgentMessageBus, AgentMessage, MessageType, MessagePriority
from ..llm.cached_llm_service import CachedLLMService
from ..llm.base import LLMRequest, LLMMessage, ModelRole


class AgentStatus(str, Enum):
    """Agent status states"""
    IDLE = "idle"
    BUSY = "busy"
    WAITING = "waiting"
    ERROR = "error"
    OFFLINE = "offline"


class TaskStatus(str, Enum):
    """Task execution status"""
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Agent(BaseModel):
    """Agent representation in the orchestrator"""
    id: str = Field(..., description="Agent identifier")
    type: str = Field(..., description="Agent type/role")
    name: str = Field(..., description="Agent name")
    capabilities: List[str] = Field(..., description="Agent capabilities")
    status: AgentStatus = Field(default=AgentStatus.IDLE)
    current_task_id: Optional[str] = Field(None, description="Current task being executed")
    preferred_model: Optional[str] = Field(None, description="Preferred LLM model")
    max_concurrent_tasks: int = Field(default=1, description="Max concurrent tasks")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True


class Task(BaseModel):
    """Task representation"""
    id: str = Field(..., description="Task identifier")
    name: str = Field(..., description="Task name")
    description: str = Field(..., description="Task description")
    required_capabilities: List[str] = Field(default_factory=list)
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Optional[Dict[str, Any]] = Field(None)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    assigned_agent_id: Optional[str] = Field(None)
    parent_task_id: Optional[str] = Field(None, description="Parent task if this is a subtask")
    priority: MessagePriority = Field(default=MessagePriority.MEDIUM)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(None)
    completed_at: Optional[datetime] = Field(None)
    error_message: Optional[str] = Field(None)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        use_enum_values = True


class AgentOrchestrator:
    """
    Central orchestrator for managing agents and task delegation.
    """

    def __init__(
        self,
        llm_service: CachedLLMService,
        context_protocol: AgentContextProtocol,
        message_bus: AgentMessageBus
    ):
        """
        Initialize orchestrator.

        Args:
            llm_service: LLM service for agent intelligence
            context_protocol: Agent context protocol
            message_bus: Message bus for inter-agent communication
        """
        self.llm_service = llm_service
        self.context_protocol = context_protocol
        self.message_bus = message_bus

        self.agents: Dict[str, Agent] = {}
        self.tasks: Dict[str, Task] = {}
        self.task_handlers: Dict[str, Callable[[Task], Awaitable[Dict[str, Any]]]] = {}

        # Register message handlers
        self.message_bus.register_handler(MessageType.TASK_REQUEST, self._handle_task_request)
        self.message_bus.register_handler(MessageType.TASK_RESPONSE, self._handle_task_response)
        self.message_bus.register_handler(MessageType.TASK_UPDATE, self._handle_task_update)

    async def register_agent(
        self,
        agent_id: str,
        agent_type: str,
        name: str,
        capabilities: List[str],
        preferred_model: Optional[str] = None
    ) -> Agent:
        """
        Register a new agent with the orchestrator.

        Args:
            agent_id: Agent identifier
            agent_type: Agent type/role
            name: Agent name
            capabilities: List of agent capabilities
            preferred_model: Preferred LLM model

        Returns:
            Registered agent
        """
        agent = Agent(
            id=agent_id,
            type=agent_type,
            name=name,
            capabilities=capabilities,
            preferred_model=preferred_model
        )

        self.agents[agent_id] = agent

        # Create agent context
        await self.context_protocol.create_agent_context(agent_id, agent_type)

        # Subscribe to messages
        await self.message_bus.subscribe(agent_id)

        logger.info(f"Registered agent: {name} ({agent_id}) with capabilities: {capabilities}")
        return agent

    async def unregister_agent(self, agent_id: str):
        """Unregister an agent"""
        if agent_id in self.agents:
            await self.message_bus.unsubscribe(agent_id)
            self.agents[agent_id].status = AgentStatus.OFFLINE
            logger.info(f"Unregistered agent: {agent_id}")

    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get agent by ID"""
        return self.agents.get(agent_id)

    def get_agents_by_capability(self, capability: str) -> List[Agent]:
        """Get all agents with a specific capability"""
        return [
            agent for agent in self.agents.values()
            if capability in agent.capabilities and agent.status != AgentStatus.OFFLINE
        ]

    def get_available_agents(self) -> List[Agent]:
        """Get all available (idle) agents"""
        return [
            agent for agent in self.agents.values()
            if agent.status == AgentStatus.IDLE
        ]

    async def create_task(
        self,
        name: str,
        description: str,
        required_capabilities: List[str],
        input_data: Dict[str, Any],
        priority: MessagePriority = MessagePriority.MEDIUM,
        parent_task_id: Optional[str] = None
    ) -> Task:
        """
        Create a new task.

        Args:
            name: Task name
            description: Task description
            required_capabilities: Required agent capabilities
            input_data: Task input data
            priority: Task priority
            parent_task_id: Parent task ID if this is a subtask

        Returns:
            Created task
        """
        task_id = f"task:{datetime.utcnow().timestamp()}"

        task = Task(
            id=task_id,
            name=name,
            description=description,
            required_capabilities=required_capabilities,
            input_data=input_data,
            priority=priority,
            parent_task_id=parent_task_id
        )

        self.tasks[task_id] = task
        logger.info(f"Created task: {name} ({task_id})")

        return task

    async def assign_task(self, task_id: str, agent_id: Optional[str] = None) -> bool:
        """
        Assign a task to an agent.

        Args:
            task_id: Task identifier
            agent_id: Specific agent ID (auto-select if None)

        Returns:
            True if assigned successfully
        """
        task = self.tasks.get(task_id)
        if not task:
            logger.error(f"Task not found: {task_id}")
            return False

        # Auto-select agent if not specified
        if not agent_id:
            agent_id = await self._select_agent_for_task(task)
            if not agent_id:
                logger.warning(f"No suitable agent found for task: {task_id}")
                return False

        agent = self.agents.get(agent_id)
        if not agent:
            logger.error(f"Agent not found: {agent_id}")
            return False

        # Check if agent is available
        if agent.status != AgentStatus.IDLE:
            logger.warning(f"Agent {agent_id} is not available (status: {agent.status})")
            return False

        # Assign task
        task.assigned_agent_id = agent_id
        task.status = TaskStatus.ASSIGNED
        agent.current_task_id = task_id
        agent.status = AgentStatus.BUSY

        # Send task request to agent
        await self.message_bus.send_task_request(
            from_agent="orchestrator",
            to_agent=agent_id,
            task_description=task.description,
            task_data={
                "task_id": task_id,
                "input": task.input_data,
                "metadata": task.metadata
            },
            priority=task.priority
        )

        logger.info(f"Assigned task {task_id} to agent {agent_id}")
        return True

    async def execute_task(self, task_id: str) -> Dict[str, Any]:
        """
        Execute a task (assign and wait for completion).

        Args:
            task_id: Task identifier

        Returns:
            Task result
        """
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task not found: {task_id}")

        # Assign task
        success = await self.assign_task(task_id)
        if not success:
            raise RuntimeError(f"Failed to assign task: {task_id}")

        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.utcnow()

        # Wait for task completion (with timeout)
        timeout = 300  # 5 minutes
        start_time = datetime.utcnow()

        while task.status in [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS]:
            await asyncio.sleep(1)

            # Check timeout
            elapsed = (datetime.utcnow() - start_time).total_seconds()
            if elapsed > timeout:
                task.status = TaskStatus.FAILED
                task.error_message = "Task execution timeout"
                break

        if task.status == TaskStatus.COMPLETED:
            return task.output_data or {}
        else:
            raise RuntimeError(f"Task failed: {task.error_message}")

    async def _select_agent_for_task(self, task: Task) -> Optional[str]:
        """
        Select the best agent for a task based on capabilities and availability.

        Args:
            task: Task to assign

        Returns:
            Selected agent ID or None
        """
        # Find agents with required capabilities
        suitable_agents = []

        for agent in self.agents.values():
            if agent.status != AgentStatus.IDLE:
                continue

            # Check if agent has all required capabilities
            has_all_capabilities = all(
                cap in agent.capabilities
                for cap in task.required_capabilities
            )

            if has_all_capabilities:
                suitable_agents.append(agent)

        if not suitable_agents:
            return None

        # Select agent with least recent activity (load balancing)
        selected_agent = min(suitable_agents, key=lambda a: a.last_active)
        return selected_agent.id

    async def _handle_task_request(self, message: AgentMessage):
        """Handle incoming task request"""
        logger.debug(f"Orchestrator received task request: {message.id}")

        # This would be handled by individual agents
        # The orchestrator mainly routes and manages, not executes
        pass

    async def _handle_task_response(self, message: AgentMessage):
        """Handle task response from an agent"""
        content = message.content
        task_id = content.get("task_id")
        success = content.get("success", False)
        result = content.get("result", {})

        task = self.tasks.get(task_id)
        if not task:
            logger.warning(f"Task not found for response: {task_id}")
            return

        agent = self.agents.get(message.from_agent)

        if success:
            task.status = TaskStatus.COMPLETED
            task.output_data = result
            task.completed_at = datetime.utcnow()
            logger.info(f"Task {task_id} completed by agent {message.from_agent}")
        else:
            task.status = TaskStatus.FAILED
            task.error_message = result.get("error", "Unknown error")
            logger.error(f"Task {task_id} failed: {task.error_message}")

        # Update agent status
        if agent:
            agent.status = AgentStatus.IDLE
            agent.current_task_id = None
            agent.last_active = datetime.utcnow()

    async def _handle_task_update(self, message: AgentMessage):
        """Handle task progress update"""
        content = message.content
        task_id = content.get("task_id")
        progress = content.get("progress", 0)

        logger.debug(f"Task {task_id} progress: {progress}%")

    async def get_agent_intelligence(
        self,
        agent_id: str,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Get LLM response for an agent.

        Args:
            agent_id: Agent identifier
            prompt: User prompt
            system_prompt: System prompt (optional)

        Returns:
            LLM response content
        """
        agent = self.agents.get(agent_id)
        if not agent:
            raise ValueError(f"Agent not found: {agent_id}")

        # Get agent context
        context = await self.context_protocol.get_agent_context(agent_id)

        messages = []

        # Add system prompt
        if system_prompt:
            messages.append(LLMMessage(role="system", content=system_prompt))

        # Add context from memory
        if context:
            recent_memories = context.get_memories(limit=5, min_importance=0.3)
            if recent_memories:
                memory_text = "\n".join([m.content for m in recent_memories])
                messages.append(
                    LLMMessage(
                        role="system",
                        content=f"Recent context:\n{memory_text}"
                    )
                )

        # Add user prompt
        messages.append(LLMMessage(role="user", content=prompt))

        # Select model
        model_id = agent.preferred_model or "google/gemini-2.0-flash-exp:free"

        # Create request
        request = LLMRequest(
            messages=messages,
            model_id=model_id,
            temperature=0.7
        )

        # Get response
        response = await self.llm_service.complete(request)

        # Store interaction in memory
        if context:
            await self.context_protocol.add_memory(
                agent_id=agent_id,
                content=f"Q: {prompt}\nA: {response.content}",
                memory_type=MemoryType.EPISODIC,
                importance=0.5
            )

        return response.content

    async def get_orchestrator_stats(self) -> Dict[str, Any]:
        """Get orchestrator statistics"""
        total_agents = len(self.agents)
        active_agents = len([a for a in self.agents.values() if a.status != AgentStatus.OFFLINE])
        idle_agents = len([a for a in self.agents.values() if a.status == AgentStatus.IDLE])

        total_tasks = len(self.tasks)
        completed_tasks = len([t for t in self.tasks.values() if t.status == TaskStatus.COMPLETED])
        failed_tasks = len([t for t in self.tasks.values() if t.status == TaskStatus.FAILED])
        pending_tasks = len([t for t in self.tasks.values() if t.status == TaskStatus.PENDING])

        return {
            "agents": {
                "total": total_agents,
                "active": active_agents,
                "idle": idle_agents
            },
            "tasks": {
                "total": total_tasks,
                "completed": completed_tasks,
                "failed": failed_tasks,
                "pending": pending_tasks
            }
        }
