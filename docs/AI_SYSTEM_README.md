# AI Agent System Documentation

## Overview

The AI Agent System is a comprehensive framework for building intelligent, collaborative agents powered by multiple LLM models. It provides:

- **LLM Service**: Unified interface to multiple models via OpenRouter
- **Caching**: Redis-based response caching for cost optimization
- **Agent Context Protocol (ACP)**: Memory, rules, and preferences management
- **Agent-to-Agent Protocol (AAP)**: Inter-agent messaging via Redis Pub/Sub
- **Agent Orchestrator**: Central coordination and task delegation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Service Manager                        │
│  (Centralized initialization & lifecycle management)         │
└────────────────────┬────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
┌─────────┐    ┌──────────┐   ┌─────────────┐
│   LLM   │    │  Agent   │   │   Message   │
│ Service │    │ Context  │   │     Bus     │
│         │    │ Protocol │   │  (Pub/Sub)  │
└────┬────┘    └────┬─────┘   └──────┬──────┘
     │              │                 │
     ▼              ▼                 ▼
┌─────────────────────────────────────────────┐
│          Agent Orchestrator                  │
│  - Task delegation                           │
│  - Agent lifecycle management                │
│  - Coordination                              │
└─────────────────────────────────────────────┘
```

## Components

### 1. LLM Service

#### Models Available

| Model | Role | Best For | Context |
|-------|------|----------|---------|
| **Gemini 2.0 Flash** | Communication | Agent interactions, function calling | 1M tokens |
| **Llama 3.3 70B** | Reasoning | Complex decisions, orchestration | 128K tokens |
| **Qwen2.5 Coder 32B** | Code | Code generation, debugging | 32K tokens |
| **Qwen2.5 72B** | Structured | JSON generation, data exchange | 32K tokens |

#### Usage

```python
from app.services.ai_service_manager import ai_service_manager
from app.services.llm.base import LLMRequest, LLMMessage

# Initialize
await ai_service_manager.initialize()

# Get service
llm_service = ai_service_manager.get_llm_service()

# Create request
request = LLMRequest(
    messages=[
        LLMMessage(role="user", content="Hello!")
    ],
    model_id="google/gemini-2.0-flash-exp:free",
    temperature=0.7
)

# Get response
response = await llm_service.complete(request)
print(response.content)
```

### 2. Redis Caching

Automatic caching of LLM responses to reduce costs and latency.

#### Features
- Automatic cache key generation based on request parameters
- Configurable TTL (default: 1 hour)
- Pattern-based cache clearing
- Cache statistics and monitoring

#### Configuration

```python
# In .env or config_ai.py
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_DEFAULT_TTL=3600
CACHE_ENABLED=True
```

### 3. Agent Context Protocol (ACP)

Manages agent memory, rules, and preferences.

#### Memory Types
- **Short-term**: Current conversation/task context
- **Long-term**: Persistent knowledge
- **Working**: Temporary scratchpad
- **Episodic**: Specific events

#### Usage

```python
context_protocol = ai_service_manager.get_context_protocol()

# Create agent context
await context_protocol.create_agent_context(
    agent_id="agent-1",
    agent_type="assistant"
)

# Add memory
await context_protocol.add_memory(
    agent_id="agent-1",
    content="User prefers Python",
    memory_type=MemoryType.LONG_TERM,
    importance=0.8
)

# Add rule
await context_protocol.add_rule(
    agent_id="agent-1",
    name="Code Style",
    description="Follow PEP 8",
    condition="when writing Python code",
    action="apply PEP 8 guidelines",
    priority=10
)
```

### 4. Agent-to-Agent Protocol (AAP)

Redis Pub/Sub based messaging for agent communication.

#### Message Types
- **TASK_REQUEST**: Request task execution
- **TASK_RESPONSE**: Task completion response
- **TASK_UPDATE**: Progress updates
- **QUERY**: Information request
- **RESPONSE**: Query response
- **NOTIFICATION**: General notification
- **ERROR**: Error message
- **BROADCAST**: Message to all agents

#### Usage

```python
message_bus = ai_service_manager.get_message_bus()

# Send task request
message_id = await message_bus.send_task_request(
    from_agent="coordinator",
    to_agent="worker",
    task_description="Process data",
    task_data={"file": "data.csv"},
    priority=MessagePriority.HIGH
)

# Broadcast message
await message_bus.broadcast(
    from_agent="system",
    subject="Update",
    content={"version": "2.0"}
)

# Handle messages
async def handler(message: AgentMessage):
    print(f"Received: {message.subject}")

message_bus.register_handler(MessageType.TASK_REQUEST, handler)
```

### 5. Agent Orchestrator

Central coordinator for agents and tasks.

#### Features
- Agent registration and lifecycle
- Task creation and assignment
- Capability-based agent selection
- Task delegation and monitoring
- Statistics and reporting

#### Usage

```python
orchestrator = ai_service_manager.get_orchestrator()

# Register agent
agent = await orchestrator.register_agent(
    agent_id="worker-1",
    agent_type="processor",
    name="Data Processor",
    capabilities=["data_processing", "analysis"],
    preferred_model="qwen/qwen-2.5-coder-32b-instruct:free"
)

# Create task
task = await orchestrator.create_task(
    name="Process Dataset",
    description="Clean and analyze dataset",
    required_capabilities=["data_processing"],
    input_data={"file": "dataset.csv"}
)

# Assign task (auto-selects best agent)
await orchestrator.assign_task(task.id)

# Get stats
stats = await orchestrator.get_orchestrator_stats()
```

## API Endpoints

### Health & Stats

```bash
GET /ai/health          # Service health check
GET /ai/stats           # System statistics
```

### LLM

```bash
POST /ai/chat           # Chat completion
GET /ai/models          # List available models
```

### Agents

```bash
POST /ai/agents/register           # Register agent
GET /ai/agents/{agent_id}          # Get agent details
GET /ai/agents                     # List all agents
DELETE /ai/agents/{agent_id}       # Unregister agent
```

### Tasks

```bash
POST /ai/tasks                     # Create task
POST /ai/tasks/{task_id}/assign    # Assign task
POST /ai/tasks/{task_id}/execute   # Execute task
GET /ai/tasks/{task_id}            # Get task details
GET /ai/tasks                      # List all tasks
```

### Context

```bash
POST /ai/agents/{agent_id}/memory  # Add memory
POST /ai/agents/{agent_id}/rules   # Add rule
GET /ai/agents/{agent_id}/context  # Get context
```

## Example API Requests

### Chat Completion

```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Write a Python function to sort a list"}
    ],
    "model_id": "qwen/qwen-2.5-coder-32b-instruct:free",
    "temperature": 0.3
  }'
```

### Register Agent

```bash
curl -X POST http://localhost:8000/ai/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "coder-1",
    "agent_type": "coder",
    "name": "Code Generator",
    "capabilities": ["coding", "python"],
    "preferred_model": "qwen/qwen-2.5-coder-32b-instruct:free"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:8000/ai/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Generate API",
    "description": "Generate REST API code",
    "required_capabilities": ["coding"],
    "input_data": {"endpoint": "/users", "method": "GET"},
    "priority": "high"
  }'
```

## Setup & Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Redis

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

### 3. Configure Environment

The `.env` file already contains the AI configuration:

```env
# AI Services Configuration
OPENROUTER_API_KEY=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
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_DEFAULT_TTL=3600
CACHE_ENABLED=True
```

The API key is loaded from environment variables using Pydantic settings.

### 4. Run Application

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Test Services

```bash
# Health check
curl http://localhost:8000/ai/health

# List models
curl http://localhost:8000/ai/models
```

## Running Tests

```bash
# Run all tests
pytest backend/tests/test_ai_services.py -v

# Run specific test
pytest backend/tests/test_ai_services.py::TestLLMProvider -v

# Run with coverage
pytest backend/tests/test_ai_services.py --cov=app/services
```

## Examples

See `backend/examples/example_agent_usage.py` for comprehensive examples:

```bash
cd backend
python -m examples.example_agent_usage
```

## Best Practices

### Model Selection
- Use **Gemini 2.0 Flash** for fast agent communication
- Use **Llama 3.3 70B** for complex reasoning and decisions
- Use **Qwen Coder** for code generation and debugging
- Use **Qwen 72B** for structured outputs and JSON

### Caching
- Enable caching for repeated queries
- Use appropriate TTL based on data freshness needs
- Clear cache patterns when data changes

### Agent Design
- Keep agent capabilities specific and focused
- Use appropriate memory types (short-term vs long-term)
- Set rule priorities to control behavior
- Monitor agent status and task completion

### Task Management
- Break complex tasks into subtasks
- Set appropriate priorities
- Use parent_task_id to create task dependencies
- Monitor task status and handle failures

## Architecture Decisions

### Why Redis?
- Fast in-memory caching
- Built-in Pub/Sub for messaging
- Easy to scale horizontally
- Atomic operations for concurrency

### Why OpenRouter?
- Access to multiple models via single API
- Cost-effective free tier
- Unified interface
- Automatic failover

### Why Separate Protocols?
- **ACP**: Manages agent state (memory, rules)
- **AAP**: Handles agent communication
- Separation of concerns allows independent scaling

## Performance Considerations

### Caching Hit Rates
- Monitor cache hit rates via `/ai/stats`
- Adjust TTL based on use case
- Clear stale cache patterns regularly

### Redis Optimization
- Use connection pooling
- Set appropriate max_connections
- Monitor memory usage
- Consider Redis Cluster for scale

### LLM Optimization
- Use streaming for long responses
- Set appropriate timeouts
- Implement retry logic
- Choose right model for task

## Troubleshooting

### Redis Connection Issues
```python
# Check Redis status
redis-cli ping

# Check connections
redis-cli client list
```

### LLM API Errors
```python
# Check API key
echo $OPENROUTER_API_KEY

# Test with curl
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Agent Not Responding
- Check agent status via API
- Verify message bus connection
- Check agent capabilities match task requirements
- Review agent logs

## Future Enhancements

- [ ] Agent learning from task outcomes
- [ ] Multi-agent collaboration workflows
- [ ] Advanced task scheduling
- [ ] Agent performance metrics
- [ ] WebSocket support for real-time updates
- [ ] Agent marketplace for pre-built agents
- [ ] Visual agent workflow designer
- [ ] Agent simulation and testing tools

## Support

For issues and questions:
- Check documentation
- Review example code
- Check system logs
- Monitor `/ai/health` and `/ai/stats`

## License

MIT License - See LICENSE file for details
