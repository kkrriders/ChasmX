"""
Comprehensive tests for AI and Agent services.
"""
import pytest
import asyncio
from datetime import datetime

from app.services.llm.base import (
    LLMRequest,
    LLMMessage,
    ModelRole,
    ModelConfig
)
from app.services.llm.openrouter_provider import OpenRouterProvider
from app.services.cache.redis_cache import RedisCache, CacheConfig
from app.services.llm.cached_llm_service import CachedLLMService
from app.services.agents.acp import (
    AgentContext,
    AgentContextProtocol,
    ContextStore,
    MemoryType,
    AgentPreferences
)
from app.services.agents.aap import (
    AgentMessageBus,
    AgentMessage,
    MessageType,
    MessagePriority
)
from app.services.agents.orchestrator import (
    AgentOrchestrator,
    Agent,
    AgentStatus
)


# Fixtures

@pytest.fixture
async def redis_cache():
    """Redis cache fixture"""
    config = CacheConfig(
        host="localhost",
        port=6379,
        db=1,  # Use separate DB for testing
        default_ttl=60
    )
    cache = RedisCache(config)
    await cache.connect()
    yield cache
    await cache.clear_pattern("*")  # Clean up test data
    await cache.disconnect()


@pytest.fixture
def llm_provider():
    """LLM provider fixture"""
    api_key = "test-key"
    return OpenRouterProvider(api_key=api_key, timeout=30, max_retries=1)


@pytest.fixture
async def llm_service(llm_provider, redis_cache):
    """LLM service with caching fixture"""
    return CachedLLMService(provider=llm_provider, cache=redis_cache)


@pytest.fixture
async def context_store(redis_cache):
    """Context store fixture"""
    return ContextStore(cache=redis_cache)


@pytest.fixture
async def context_protocol(context_store):
    """Context protocol fixture"""
    return AgentContextProtocol(store=context_store)


@pytest.fixture
async def message_bus():
    """Message bus fixture"""
    bus = AgentMessageBus(redis_url="redis://localhost:6379/1")
    await bus.connect()
    yield bus
    await bus.disconnect()


@pytest.fixture
async def orchestrator(llm_service, context_protocol, message_bus):
    """Orchestrator fixture"""
    return AgentOrchestrator(
        llm_service=llm_service,
        context_protocol=context_protocol,
        message_bus=message_bus
    )


# LLM Provider Tests

@pytest.mark.asyncio
class TestLLMProvider:
    """Test LLM provider functionality"""

    def test_provider_initialization(self, llm_provider):
        """Test provider initialization with default models"""
        assert llm_provider.api_key == "test-key"
        assert len(llm_provider.model_configs) == 4
        assert "google/gemini-2.0-flash-exp:free" in llm_provider.model_configs

    def test_get_model_config(self, llm_provider):
        """Test getting model configuration"""
        config = llm_provider.get_model_config("google/gemini-2.0-flash-exp:free")
        assert config is not None
        assert config.role == ModelRole.COMMUNICATION
        assert config.context_length == 1000000

    def test_get_models_by_role(self, llm_provider):
        """Test getting models by role"""
        code_models = llm_provider.get_models_by_role(ModelRole.CODE)
        assert len(code_models) == 1
        assert code_models[0].model_id == "qwen/qwen-2.5-coder-32b-instruct:free"

    def test_register_model(self, llm_provider):
        """Test registering a new model"""
        new_model = ModelConfig(
            model_id="test/model:free",
            name="Test Model",
            role=ModelRole.REASONING,
            max_tokens=1024,
            temperature=0.5,
            context_length=4096
        )
        llm_provider.register_model(new_model)
        assert "test/model:free" in llm_provider.model_configs


# Redis Cache Tests

@pytest.mark.asyncio
class TestRedisCache:
    """Test Redis cache functionality"""

    async def test_cache_set_get(self, redis_cache):
        """Test setting and getting values"""
        key = "test:key"
        value = {"data": "test value"}

        success = await redis_cache.set(key, value, ttl=60)
        assert success

        retrieved = await redis_cache.get(key)
        assert retrieved == value

    async def test_cache_exists(self, redis_cache):
        """Test checking key existence"""
        key = "test:exists"
        await redis_cache.set(key, "value")

        exists = await redis_cache.exists(key)
        assert exists

        non_exists = await redis_cache.exists("test:nonexistent")
        assert not non_exists

    async def test_cache_delete(self, redis_cache):
        """Test deleting keys"""
        key = "test:delete"
        await redis_cache.set(key, "value")

        deleted = await redis_cache.delete(key)
        assert deleted

        exists = await redis_cache.exists(key)
        assert not exists

    async def test_llm_response_caching(self, redis_cache):
        """Test LLM response caching"""
        model_id = "test-model"
        messages = [{"role": "user", "content": "Hello"}]
        response = {"content": "Hi there!", "model_id": model_id}

        success = await redis_cache.set_llm_response(
            model_id=model_id,
            messages=messages,
            response=response,
            ttl=60
        )
        assert success

        cached = await redis_cache.get_llm_response(model_id, messages)
        assert cached == response


# Agent Context Protocol Tests

@pytest.mark.asyncio
class TestAgentContextProtocol:
    """Test Agent Context Protocol"""

    async def test_create_agent_context(self, context_protocol):
        """Test creating agent context"""
        context = await context_protocol.create_agent_context(
            agent_id="test-agent-1",
            agent_type="test_type"
        )

        assert context.agent_id == "test-agent-1"
        assert context.agent_type == "test_type"
        assert len(context.memories) == 0
        assert len(context.rules) == 0

    async def test_add_memory(self, context_protocol):
        """Test adding memories to agent"""
        await context_protocol.create_agent_context(
            agent_id="test-agent-2",
            agent_type="test_type"
        )

        success = await context_protocol.add_memory(
            agent_id="test-agent-2",
            content="Test memory content",
            memory_type=MemoryType.SHORT_TERM,
            importance=0.8
        )
        assert success

        context = await context_protocol.get_agent_context("test-agent-2")
        assert len(context.memories) == 1
        assert context.memories[0].content == "Test memory content"
        assert context.memories[0].importance == 0.8

    async def test_add_rule(self, context_protocol):
        """Test adding rules to agent"""
        await context_protocol.create_agent_context(
            agent_id="test-agent-3",
            agent_type="test_type"
        )

        success = await context_protocol.add_rule(
            agent_id="test-agent-3",
            name="Test Rule",
            description="A test rule",
            condition="when X happens",
            action="do Y",
            priority=10
        )
        assert success

        context = await context_protocol.get_agent_context("test-agent-3")
        assert len(context.rules) == 1
        assert context.rules[0].name == "Test Rule"
        assert context.rules[0].priority == 10

    async def test_context_persistence(self, context_protocol):
        """Test context persistence across loads"""
        # Create and save context
        await context_protocol.create_agent_context(
            agent_id="test-agent-4",
            agent_type="test_type"
        )

        await context_protocol.add_memory(
            agent_id="test-agent-4",
            content="Persistent memory",
            memory_type=MemoryType.LONG_TERM,
            importance=0.9
        )

        # Load context again
        loaded_context = await context_protocol.get_agent_context("test-agent-4")
        assert loaded_context is not None
        assert len(loaded_context.memories) == 1
        assert loaded_context.memories[0].content == "Persistent memory"


# Agent Message Bus Tests

@pytest.mark.asyncio
class TestAgentMessageBus:
    """Test Agent Message Bus"""

    async def test_publish_subscribe(self, message_bus):
        """Test message publishing and subscription"""
        received_messages = []

        async def handler(message: AgentMessage):
            received_messages.append(message)

        # Subscribe to agent messages
        agent_id = "test-agent-5"
        await message_bus.subscribe(agent_id)
        message_bus.register_handler(MessageType.NOTIFICATION, handler)
        await message_bus.start_listening()

        # Publish a message
        message = AgentMessage(
            id="test-msg-1",
            type=MessageType.NOTIFICATION,
            from_agent="sender",
            to_agent=agent_id,
            subject="Test Message",
            content={"data": "test"}
        )

        await message_bus.publish(message)

        # Wait for message processing
        await asyncio.sleep(0.5)

        assert len(received_messages) >= 1

    async def test_broadcast_message(self, message_bus):
        """Test broadcasting messages"""
        received_messages = []

        async def handler(message: AgentMessage):
            received_messages.append(message)

        # Subscribe two agents
        await message_bus.subscribe("agent-6")
        await message_bus.subscribe("agent-7")
        message_bus.register_handler(MessageType.BROADCAST, handler)
        await message_bus.start_listening()

        # Broadcast message
        await message_bus.broadcast(
            from_agent="broadcaster",
            subject="Broadcast Test",
            content={"message": "Hello everyone"}
        )

        # Wait for message processing
        await asyncio.sleep(0.5)

        # Both agents should receive the broadcast
        assert len(received_messages) >= 1


# Agent Orchestrator Tests

@pytest.mark.asyncio
class TestAgentOrchestrator:
    """Test Agent Orchestrator"""

    async def test_register_agent(self, orchestrator):
        """Test registering an agent"""
        agent = await orchestrator.register_agent(
            agent_id="test-agent-8",
            agent_type="test_worker",
            name="Test Worker",
            capabilities=["task1", "task2"]
        )

        assert agent.id == "test-agent-8"
        assert agent.status == AgentStatus.IDLE
        assert "task1" in agent.capabilities

    async def test_get_agents_by_capability(self, orchestrator):
        """Test finding agents by capability"""
        await orchestrator.register_agent(
            agent_id="agent-9",
            agent_type="worker",
            name="Worker 1",
            capabilities=["coding", "testing"]
        )

        await orchestrator.register_agent(
            agent_id="agent-10",
            agent_type="worker",
            name="Worker 2",
            capabilities=["testing", "deployment"]
        )

        coding_agents = orchestrator.get_agents_by_capability("coding")
        assert len(coding_agents) == 1
        assert coding_agents[0].id == "agent-9"

        testing_agents = orchestrator.get_agents_by_capability("testing")
        assert len(testing_agents) == 2

    async def test_create_task(self, orchestrator):
        """Test creating a task"""
        task = await orchestrator.create_task(
            name="Test Task",
            description="A test task",
            required_capabilities=["testing"],
            input_data={"key": "value"}
        )

        assert task.name == "Test Task"
        assert task.status.value == "pending"
        assert "testing" in task.required_capabilities

    async def test_task_assignment(self, orchestrator):
        """Test task assignment to agent"""
        # Register agent
        await orchestrator.register_agent(
            agent_id="agent-11",
            agent_type="worker",
            name="Worker",
            capabilities=["task_execution"]
        )

        # Create task
        task = await orchestrator.create_task(
            name="Execution Task",
            description="Task to execute",
            required_capabilities=["task_execution"],
            input_data={}
        )

        # Assign task
        success = await orchestrator.assign_task(task.id, "agent-11")
        assert success

        # Check task and agent status
        updated_task = orchestrator.tasks[task.id]
        assert updated_task.assigned_agent_id == "agent-11"
        assert updated_task.status.value == "assigned"

        agent = orchestrator.get_agent("agent-11")
        assert agent.status == AgentStatus.BUSY
        assert agent.current_task_id == task.id

    async def test_orchestrator_stats(self, orchestrator):
        """Test getting orchestrator statistics"""
        # Register some agents
        await orchestrator.register_agent(
            agent_id="agent-12",
            agent_type="worker",
            name="Worker 1",
            capabilities=["test"]
        )

        # Create some tasks
        await orchestrator.create_task(
            name="Task 1",
            description="First task",
            required_capabilities=["test"],
            input_data={}
        )

        stats = await orchestrator.get_orchestrator_stats()

        assert stats["agents"]["total"] >= 1
        assert stats["tasks"]["total"] >= 1


@pytest.mark.asyncio
async def test_integration_full_flow(orchestrator):
    """Test complete integration flow"""
    # 1. Register an agent
    agent = await orchestrator.register_agent(
        agent_id="integration-agent",
        agent_type="worker",
        name="Integration Worker",
        capabilities=["processing"]
    )

    # 2. Add memory to agent
    await orchestrator.context_protocol.add_memory(
        agent_id=agent.id,
        content="Integration test memory",
        memory_type=MemoryType.SHORT_TERM,
        importance=0.7
    )

    # 3. Create and assign task
    task = await orchestrator.create_task(
        name="Integration Task",
        description="Full integration test",
        required_capabilities=["processing"],
        input_data={"test": "data"}
    )

    success = await orchestrator.assign_task(task.id)
    assert success

    # 4. Verify everything is connected
    agent_context = await orchestrator.context_protocol.get_agent_context(agent.id)
    assert len(agent_context.memories) >= 1

    updated_agent = orchestrator.get_agent(agent.id)
    assert updated_agent.status == AgentStatus.BUSY

    updated_task = orchestrator.tasks[task.id]
    assert updated_task.assigned_agent_id == agent.id


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
