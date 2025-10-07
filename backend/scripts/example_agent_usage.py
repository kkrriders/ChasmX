"""
Example usage of the AI Agent System.
This demonstrates how to use the LLM services and agent orchestration.
"""
import asyncio
from app.services.ai_service_manager import ai_service_manager
from app.services.llm.base import LLMRequest, LLMMessage, ModelRole
from app.services.agents.acp import MemoryType
from app.services.agents.aap import MessageType, MessagePriority


async def example_1_basic_llm_completion():
    """Example 1: Basic LLM completion"""
    print("\n=== Example 1: Basic LLM Completion ===")

    # Initialize services
    await ai_service_manager.initialize()

    try:
        llm_service = ai_service_manager.get_llm_service()

        # Create a simple chat request
        messages = [
            LLMMessage(role="system", content="You are a helpful assistant."),
            LLMMessage(role="user", content="What is the capital of France?")
        ]

        request = LLMRequest(
            messages=messages,
            model_id="google/gemini-2.0-flash-exp:free",  # Fast communication model
            temperature=0.7,
            max_tokens=100
        )

        # Get response
        response = await llm_service.complete(request)

        print(f"Response: {response.content}")
        print(f"Model: {response.model_id}")
        print(f"Cached: {response.cached}")
        print(f"Latency: {response.latency_ms}ms")

    finally:
        await ai_service_manager.shutdown()


async def example_2_code_generation():
    """Example 2: Code generation with specialized model"""
    print("\n=== Example 2: Code Generation ===")

    await ai_service_manager.initialize()

    try:
        llm_service = ai_service_manager.get_llm_service()

        messages = [
            LLMMessage(
                role="system",
                content="You are an expert Python programmer."
            ),
            LLMMessage(
                role="user",
                content="Write a Python function to check if a number is prime."
            )
        ]

        request = LLMRequest(
            messages=messages,
            model_id="qwen/qwen-2.5-coder-32b-instruct:free",  # Code model
            temperature=0.3,  # Lower temperature for code
            max_tokens=500
        )

        response = await llm_service.complete(request)
        print(f"Generated Code:\n{response.content}")

    finally:
        await ai_service_manager.shutdown()


async def example_3_agent_registration():
    """Example 3: Register and manage agents"""
    print("\n=== Example 3: Agent Registration ===")

    await ai_service_manager.initialize()

    try:
        orchestrator = ai_service_manager.get_orchestrator()

        # Register a code generation agent
        code_agent = await orchestrator.register_agent(
            agent_id="code-agent-1",
            agent_type="code_generator",
            name="Python Code Generator",
            capabilities=["code_generation", "python", "debugging"],
            preferred_model="qwen/qwen-2.5-coder-32b-instruct:free"
        )

        print(f"Registered Agent: {code_agent.name}")
        print(f"Capabilities: {code_agent.capabilities}")
        print(f"Status: {code_agent.status}")

        # Register a reasoning agent
        reasoning_agent = await orchestrator.register_agent(
            agent_id="reasoning-agent-1",
            agent_type="reasoner",
            name="Complex Reasoner",
            capabilities=["reasoning", "decision_making", "analysis"],
            preferred_model="meta-llama/llama-3.3-70b-instruct:free"
        )

        print(f"\nRegistered Agent: {reasoning_agent.name}")
        print(f"Capabilities: {reasoning_agent.capabilities}")

        # List all agents
        stats = await orchestrator.get_orchestrator_stats()
        print(f"\nTotal Agents: {stats['agents']['total']}")
        print(f"Active Agents: {stats['agents']['active']}")

    finally:
        await ai_service_manager.shutdown()


async def example_4_agent_memory():
    """Example 4: Agent memory and context"""
    print("\n=== Example 4: Agent Memory ===")

    await ai_service_manager.initialize()

    try:
        orchestrator = ai_service_manager.get_orchestrator()
        context_protocol = ai_service_manager.get_context_protocol()

        # Register agent
        agent = await orchestrator.register_agent(
            agent_id="memory-agent-1",
            agent_type="assistant",
            name="Memory Assistant",
            capabilities=["conversation", "memory_recall"]
        )

        # Add memories to agent
        await context_protocol.add_memory(
            agent_id=agent.id,
            content="User prefers Python over JavaScript",
            memory_type=MemoryType.LONG_TERM,
            importance=0.8,
            metadata={"category": "preferences"}
        )

        await context_protocol.add_memory(
            agent_id=agent.id,
            content="User is working on a web application project",
            memory_type=MemoryType.SHORT_TERM,
            importance=0.7,
            metadata={"category": "context"}
        )

        # Retrieve agent context
        context = await context_protocol.get_agent_context(agent.id)
        print(f"Agent: {context.agent_id}")
        print(f"Total Memories: {len(context.memories)}")

        for memory in context.memories:
            print(f"\n- Type: {memory.type}")
            print(f"  Content: {memory.content}")
            print(f"  Importance: {memory.importance}")

    finally:
        await ai_service_manager.shutdown()


async def example_5_task_creation_and_assignment():
    """Example 5: Create and assign tasks"""
    print("\n=== Example 5: Task Management ===")

    await ai_service_manager.initialize()

    try:
        orchestrator = ai_service_manager.get_orchestrator()

        # Register agents
        await orchestrator.register_agent(
            agent_id="task-agent-1",
            agent_type="worker",
            name="Data Processor",
            capabilities=["data_processing", "analysis"]
        )

        await orchestrator.register_agent(
            agent_id="task-agent-2",
            agent_type="worker",
            name="Report Generator",
            capabilities=["reporting", "visualization"]
        )

        # Create tasks
        task1 = await orchestrator.create_task(
            name="Process Sales Data",
            description="Analyze and process monthly sales data",
            required_capabilities=["data_processing"],
            input_data={"file": "sales_data.csv", "month": "January"},
            priority=MessagePriority.HIGH
        )

        task2 = await orchestrator.create_task(
            name="Generate Sales Report",
            description="Create visual sales report",
            required_capabilities=["reporting"],
            input_data={"processed_data": "output.json"},
            priority=MessagePriority.MEDIUM
        )

        print(f"Created Task: {task1.name}")
        print(f"Status: {task1.status}")
        print(f"Priority: {task1.priority}")

        # Assign task (auto-select agent)
        success = await orchestrator.assign_task(task1.id)
        print(f"\nTask Assignment: {'Success' if success else 'Failed'}")

        # Check task status
        updated_task = orchestrator.tasks[task1.id]
        print(f"Assigned to: {updated_task.assigned_agent_id}")
        print(f"Task Status: {updated_task.status}")

        # Get stats
        stats = await orchestrator.get_orchestrator_stats()
        print(f"\nTotal Tasks: {stats['tasks']['total']}")
        print(f"Pending Tasks: {stats['tasks']['pending']}")

    finally:
        await ai_service_manager.shutdown()


async def example_6_agent_communication():
    """Example 6: Agent-to-agent communication"""
    print("\n=== Example 6: Agent Communication ===")

    await ai_service_manager.initialize()

    try:
        orchestrator = ai_service_manager.get_orchestrator()
        message_bus = ai_service_manager.get_message_bus()

        # Register agents
        agent1 = await orchestrator.register_agent(
            agent_id="comm-agent-1",
            agent_type="coordinator",
            name="Coordinator",
            capabilities=["coordination", "task_delegation"]
        )

        agent2 = await orchestrator.register_agent(
            agent_id="comm-agent-2",
            agent_type="executor",
            name="Executor",
            capabilities=["execution", "processing"]
        )

        # Send task request from agent1 to agent2
        message_id = await message_bus.send_task_request(
            from_agent=agent1.id,
            to_agent=agent2.id,
            task_description="Process user data",
            task_data={
                "operation": "transform",
                "data": [1, 2, 3, 4, 5]
            },
            priority=MessagePriority.HIGH
        )

        print(f"Sent task request: {message_id}")
        print(f"From: {agent1.name}")
        print(f"To: {agent2.name}")

        # Broadcast message
        await message_bus.broadcast(
            from_agent=agent1.id,
            subject="System Update",
            content={"message": "New version deployed", "version": "2.0.0"}
        )

        print("\nBroadcast sent to all agents")

    finally:
        await ai_service_manager.shutdown()


async def example_7_agent_with_rules():
    """Example 7: Agent with behavioral rules"""
    print("\n=== Example 7: Agent Rules ===")

    await ai_service_manager.initialize()

    try:
        orchestrator = ai_service_manager.get_orchestrator()
        context_protocol = ai_service_manager.get_context_protocol()

        # Register agent
        agent = await orchestrator.register_agent(
            agent_id="rules-agent-1",
            agent_type="moderator",
            name="Content Moderator",
            capabilities=["moderation", "filtering"]
        )

        # Add behavioral rules
        await context_protocol.add_rule(
            agent_id=agent.id,
            name="Profanity Filter",
            description="Filter out profane content",
            condition="when content contains profanity",
            action="flag and filter the content",
            priority=100
        )

        await context_protocol.add_rule(
            agent_id=agent.id,
            name="Spam Detection",
            description="Detect and block spam",
            condition="when content matches spam patterns",
            action="mark as spam and block",
            priority=90
        )

        # Retrieve rules
        context = await context_protocol.get_agent_context(agent.id)
        active_rules = context.get_active_rules()

        print(f"Agent: {agent.name}")
        print(f"Total Rules: {len(active_rules)}")

        for rule in active_rules:
            print(f"\n- Rule: {rule.name}")
            print(f"  Priority: {rule.priority}")
            print(f"  Condition: {rule.condition}")
            print(f"  Action: {rule.action}")

    finally:
        await ai_service_manager.shutdown()


async def example_8_complete_workflow():
    """Example 8: Complete workflow with multiple agents"""
    print("\n=== Example 8: Complete Workflow ===")

    await ai_service_manager.initialize()

    try:
        orchestrator = ai_service_manager.get_orchestrator()
        context_protocol = ai_service_manager.get_context_protocol()

        # Register specialized agents
        agents = [
            {
                "id": "planner-agent",
                "type": "planner",
                "name": "Task Planner",
                "capabilities": ["planning", "strategy"],
                "model": "meta-llama/llama-3.3-70b-instruct:free"
            },
            {
                "id": "coder-agent",
                "type": "coder",
                "name": "Code Developer",
                "capabilities": ["coding", "implementation"],
                "model": "qwen/qwen-2.5-coder-32b-instruct:free"
            },
            {
                "id": "reviewer-agent",
                "type": "reviewer",
                "name": "Code Reviewer",
                "capabilities": ["review", "quality_assurance"],
                "model": "qwen/qwen-2.5-72b-instruct:free"
            }
        ]

        for agent_config in agents:
            await orchestrator.register_agent(
                agent_id=agent_config["id"],
                agent_type=agent_config["type"],
                name=agent_config["name"],
                capabilities=agent_config["capabilities"],
                preferred_model=agent_config["model"]
            )
            print(f"Registered: {agent_config['name']}")

        # Create workflow tasks
        planning_task = await orchestrator.create_task(
            name="Plan Feature",
            description="Plan implementation of user authentication",
            required_capabilities=["planning"],
            input_data={"feature": "authentication", "requirements": ["OAuth", "JWT"]},
            priority=MessagePriority.HIGH
        )

        coding_task = await orchestrator.create_task(
            name="Implement Feature",
            description="Implement the planned authentication feature",
            required_capabilities=["coding"],
            input_data={"plan": "from_planning_task"},
            priority=MessagePriority.HIGH,
            parent_task_id=planning_task.id
        )

        review_task = await orchestrator.create_task(
            name="Review Code",
            description="Review implemented authentication code",
            required_capabilities=["review"],
            input_data={"code": "from_coding_task"},
            priority=MessagePriority.MEDIUM,
            parent_task_id=coding_task.id
        )

        print(f"\nCreated {len(orchestrator.tasks)} tasks")

        # Assign tasks
        await orchestrator.assign_task(planning_task.id, "planner-agent")
        await orchestrator.assign_task(coding_task.id, "coder-agent")
        await orchestrator.assign_task(review_task.id, "reviewer-agent")

        print("\nWorkflow tasks assigned:")
        for task_id, task in orchestrator.tasks.items():
            print(f"- {task.name} → {task.assigned_agent_id}")

        # Get final stats
        stats = await orchestrator.get_orchestrator_stats()
        print(f"\n=== Workflow Statistics ===")
        print(f"Total Agents: {stats['agents']['total']}")
        print(f"Total Tasks: {stats['tasks']['total']}")
        print(f"Completed: {stats['tasks']['completed']}")
        print(f"Pending: {stats['tasks']['pending']}")

    finally:
        await ai_service_manager.shutdown()


async def main():
    """Run all examples"""
    print("=" * 60)
    print("AI Agent System - Example Usage")
    print("=" * 60)

    examples = [
        example_1_basic_llm_completion,
        example_2_code_generation,
        example_3_agent_registration,
        example_4_agent_memory,
        example_5_task_creation_and_assignment,
        example_6_agent_communication,
        example_7_agent_with_rules,
        example_8_complete_workflow
    ]

    for i, example in enumerate(examples, 1):
        try:
            await example()
            print("\n" + "=" * 60)
        except Exception as e:
            print(f"\nExample {i} failed: {e}")
            print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
