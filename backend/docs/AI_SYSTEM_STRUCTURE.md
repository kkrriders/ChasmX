# AI Agent System - File Structure

## Directory Structure

```
backend/
├── app/
│   ├── core/
│   │   └── config_ai.py                    # AI system configuration
│   ├── services/
│   │   ├── ai_service_manager.py           # Central service manager
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                     # LLM interfaces and abstractions
│   │   │   ├── openrouter_provider.py      # OpenRouter API implementation
│   │   │   └── cached_llm_service.py       # LLM service with caching
│   │   ├── cache/
│   │   │   ├── __init__.py
│   │   │   └── redis_cache.py              # Redis caching implementation
│   │   └── agents/
│   │       ├── __init__.py
│   │       ├── acp.py                      # Agent Context Protocol
│   │       ├── aap.py                      # Agent-to-Agent Protocol
│   │       └── orchestrator.py             # Agent orchestration
│   ├── routes/
│   │   └── ai.py                           # AI API endpoints
│   └── main.py                             # Main application (updated)
├── tests/
│   └── test_ai_services.py                 # Comprehensive tests
├── examples/
│   └── example_agent_usage.py              # Usage examples
├── requirements.txt                         # Dependencies (updated)
├── AI_SYSTEM_README.md                     # Complete documentation
└── AI_SYSTEM_STRUCTURE.md                  # This file
```

## Component Overview

### Core Services (backend/app/services/)

#### 1. AI Service Manager (`ai_service_manager.py`)
- Centralized initialization and lifecycle management
- Provides easy access to all AI services
- Handles startup and shutdown coordination

**Key Functions:**
```python
await ai_service_manager.initialize()
llm_service = ai_service_manager.get_llm_service()
orchestrator = ai_service_manager.get_orchestrator()
await ai_service_manager.shutdown()
```

#### 2. LLM Service (`llm/`)

**base.py** - Core abstractions:
- `LLMProvider`: Abstract base class for LLM providers
- `LLMRequest`: Request format
- `LLMResponse`: Response format
- `ModelConfig`: Model configuration
- `ModelRole`: Model role enumeration

**openrouter_provider.py** - OpenRouter implementation:
- Connects to 4 specialized models
- Handles retries and timeouts
- Supports streaming responses
- Request/response transformation

**cached_llm_service.py** - Caching layer:
- Wraps LLM provider with caching
- Automatic cache key generation
- Configurable TTL
- Cache hit/miss tracking

#### 3. Cache Service (`cache/`)

**redis_cache.py**:
- Redis connection management
- Generic key-value caching
- LLM-specific caching methods
- Pattern-based cache clearing
- Statistics and monitoring

#### 4. Agent Services (`agents/`)

**acp.py** - Agent Context Protocol:
- `AgentContext`: Complete agent context
- `MemoryEntry`: Individual memories
- `AgentRule`: Behavioral rules
- `AgentPreferences`: Agent preferences
- `ContextStore`: Redis-backed storage
- `AgentContextProtocol`: High-level API

**aap.py** - Agent-to-Agent Protocol:
- `AgentMessage`: Message format
- `MessageType`: Message type enumeration
- `AgentMessageBus`: Redis Pub/Sub implementation
- Message handlers and routing
- Broadcast support

**orchestrator.py** - Agent Orchestrator:
- `Agent`: Agent representation
- `Task`: Task representation
- `AgentOrchestrator`: Central coordinator
- Agent registration and lifecycle
- Task creation and assignment
- Capability-based agent selection

### API Layer (backend/app/routes/)

**ai.py** - REST API endpoints:

**Health & Stats:**
- `GET /ai/health` - Service health check
- `GET /ai/stats` - System statistics

**LLM:**
- `POST /ai/chat` - Chat completion
- `GET /ai/models` - List models

**Agents:**
- `POST /ai/agents/register` - Register agent
- `GET /ai/agents/{agent_id}` - Get agent
- `GET /ai/agents` - List agents
- `DELETE /ai/agents/{agent_id}` - Unregister agent

**Tasks:**
- `POST /ai/tasks` - Create task
- `POST /ai/tasks/{task_id}/assign` - Assign task
- `POST /ai/tasks/{task_id}/execute` - Execute task
- `GET /ai/tasks/{task_id}` - Get task
- `GET /ai/tasks` - List tasks

**Context:**
- `POST /ai/agents/{agent_id}/memory` - Add memory
- `POST /ai/agents/{agent_id}/rules` - Add rule
- `GET /ai/agents/{agent_id}/context` - Get context

### Configuration (backend/app/core/)

**config_ai.py**:
- OpenRouter API key
- Redis configuration
- Cache settings
- Agent settings
- Model defaults
- LLM parameters

### Testing (backend/tests/)

**test_ai_services.py**:
- LLM provider tests
- Cache tests
- ACP tests
- AAP tests
- Orchestrator tests
- Integration tests

### Examples (backend/examples/)

**example_agent_usage.py**:
1. Basic LLM completion
2. Code generation
3. Agent registration
4. Agent memory
5. Task management
6. Agent communication
7. Agent rules
8. Complete workflow

## Data Flow

### LLM Request Flow
```
User Request
    ↓
API Endpoint (/ai/chat)
    ↓
CachedLLMService
    ↓
Check Cache → [Cache Hit] → Return Cached Response
    ↓ [Cache Miss]
OpenRouterProvider
    ↓
OpenRouter API
    ↓
LLM Model (Gemini/Llama/Qwen)
    ↓
Response
    ↓
Cache Response
    ↓
Return to User
```

### Agent Task Flow
```
Create Task
    ↓
AgentOrchestrator
    ↓
Find Capable Agent (by capabilities)
    ↓
Assign Task to Agent
    ↓
Update Agent Status (BUSY)
    ↓
Send Task via MessageBus
    ↓
Agent Receives Task (Pub/Sub)
    ↓
Agent Processes (uses LLM if needed)
    ↓
Agent Sends Response
    ↓
Update Task Status (COMPLETED/FAILED)
    ↓
Update Agent Status (IDLE)
    ↓
Store Results
```

### Agent Context Flow
```
Create Agent
    ↓
AgentContextProtocol.create_agent_context()
    ↓
Store in Redis (via ContextStore)
    ↓
Add Memories/Rules
    ↓
Update Context in Redis
    ↓
Agent Retrieves Context
    ↓
Use in LLM Prompts
    ↓
Agent Acts Based on Context
```

## Key Design Patterns

### 1. Factory Pattern
- `AIServiceManager` creates and manages service instances
- Centralized initialization

### 2. Strategy Pattern
- `LLMProvider` base class with different implementations
- Easy to add new providers

### 3. Observer Pattern
- `AgentMessageBus` Pub/Sub for agent communication
- Decoupled agent interactions

### 4. Repository Pattern
- `ContextStore` abstracts storage layer
- Redis implementation can be swapped

### 5. Facade Pattern
- `AIServiceManager` provides simple interface to complex subsystems
- Single point of access

## Dependencies

### Required Packages
```
redis>=5.0.0          # Redis client
aiohttp>=3.8.0        # Async HTTP for OpenRouter
pydantic>=2.4.2       # Data validation
loguru>=0.7.2         # Logging
fastapi>=0.104.1      # API framework
```

### External Services
- **Redis**: Caching and Pub/Sub
- **OpenRouter**: LLM API gateway

## Environment Variables

```env
# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Cache
CACHE_DEFAULT_TTL=3600
CACHE_ENABLED=True

# Agent
MAX_AGENTS=100
AGENT_TIMEOUT=300

# LLM
LLM_TIMEOUT=120
LLM_MAX_RETRIES=3
```

## Quick Start Commands

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Start Redis
docker run -d -p 6379:6379 redis:latest

# Run application
uvicorn app.main:app --reload --port 8000

# Run tests
pytest tests/test_ai_services.py -v

# Run examples
python -m examples.example_agent_usage
```

## Integration Points

### 1. Main Application
- `app/main.py` imports and initializes AI services
- Lifespan events handle startup/shutdown
- AI router added to FastAPI app

### 2. Existing Services
- Can use `ai_service_manager` from any route/service
- Independent from auth/workflow systems
- Shared Redis instance possible

### 3. Frontend Integration
- REST API endpoints for all AI features
- WebSocket support can be added for real-time updates
- Standard JSON request/response format

## Performance Characteristics

### Latency
- **Cache hit**: <10ms
- **Cache miss**: 1-5 seconds (depends on model)
- **Agent assignment**: <100ms
- **Message bus**: <50ms

### Scalability
- **Horizontal**: Multiple workers share Redis
- **Vertical**: Redis memory determines cache size
- **Concurrent agents**: Limited by Redis connections
- **Tasks**: Queued in Redis, processed async

## Monitoring & Observability

### Health Checks
```bash
curl http://localhost:8000/ai/health
```

### Statistics
```bash
curl http://localhost:8000/ai/stats
```

### Logs
- All services use `loguru` for logging
- Structured logging with context
- Log levels: DEBUG, INFO, WARNING, ERROR

### Metrics to Monitor
- Cache hit rate
- LLM response times
- Active agents count
- Task completion rate
- Redis memory usage
- API error rates

## Security Considerations

### API Key Management
- Store in environment variables
- Never commit to version control
- Rotate periodically

### Redis Security
- Use password authentication
- Limit network access
- Use TLS for production

### Agent Isolation
- Each agent has separate context
- Memory isolated between agents
- Rules enforced per agent

## Maintenance

### Cache Management
```python
# Clear all cache
await redis_cache.clear_pattern("*")

# Clear LLM cache only
await redis_cache.clear_pattern("llm:*")
```

### Agent Cleanup
```python
# Unregister inactive agents
for agent_id, agent in orchestrator.agents.items():
    if agent.status == AgentStatus.OFFLINE:
        await orchestrator.unregister_agent(agent_id)
```

### Task Cleanup
```python
# Clean old completed tasks
old_tasks = [
    t.id for t in orchestrator.tasks.values()
    if t.status == TaskStatus.COMPLETED
    and (datetime.utcnow() - t.completed_at).days > 7
]
for task_id in old_tasks:
    del orchestrator.tasks[task_id]
```

## Next Steps

1. **Setup**: Install dependencies and Redis
2. **Configure**: Set environment variables
3. **Test**: Run test suite
4. **Examples**: Try example scripts
5. **Integrate**: Add to your workflows
6. **Extend**: Build custom agents
7. **Deploy**: Production deployment
8. **Monitor**: Set up monitoring and alerts
