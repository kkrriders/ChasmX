# AI Agent System - Quick Reference Guide

## 🚀 Quick Start (3 Steps)

```bash
# 1. Setup
cd backend
./setup_ai_system.sh

# 2. Start
uvicorn app.main:app --reload --port 8000

# 3. Test
curl http://localhost:8000/ai/health
```

---

## 📦 Import Services

```python
from app.services.ai_service_manager import ai_service_manager

# Initialize once at startup (done automatically in main.py)
await ai_service_manager.initialize()

# Get services
llm_service = ai_service_manager.get_llm_service()
orchestrator = ai_service_manager.get_orchestrator()
message_bus = ai_service_manager.get_message_bus()
context_protocol = ai_service_manager.get_context_protocol()
```

---

## 💬 LLM Completion

### Basic Usage
```python
from app.services.llm.base import LLMRequest, LLMMessage

request = LLMRequest(
    messages=[
        LLMMessage(role="system", content="You are helpful"),
        LLMMessage(role="user", content="Hello!")
    ],
    model_id="google/gemini-2.0-flash-exp:free"
)

response = await llm_service.complete(request)
print(response.content)
```

### With Options
```python
request = LLMRequest(
    messages=[...],
    model_id="qwen/qwen-2.5-coder-32b-instruct:free",
    temperature=0.3,
    max_tokens=1000,
    use_cache=True,
    cache_ttl=3600
)
```

---

## 🤖 Register Agent

```python
agent = await orchestrator.register_agent(
    agent_id="my-agent",
    agent_type="worker",
    name="My Worker",
    capabilities=["coding", "testing"],
    preferred_model="qwen/qwen-2.5-coder-32b-instruct:free"
)
```

---

## 📝 Create & Assign Task

```python
from app.services.agents.aap import MessagePriority

# Create task
task = await orchestrator.create_task(
    name="Process Data",
    description="Clean and analyze data",
    required_capabilities=["data_processing"],
    input_data={"file": "data.csv"},
    priority=MessagePriority.HIGH
)

# Assign (auto-selects best agent)
await orchestrator.assign_task(task.id)

# Or assign to specific agent
await orchestrator.assign_task(task.id, agent_id="my-agent")
```

---

## 🧠 Add Memory

```python
from app.services.agents.acp import MemoryType

await context_protocol.add_memory(
    agent_id="my-agent",
    content="User prefers Python over JavaScript",
    memory_type=MemoryType.LONG_TERM,
    importance=0.8,
    metadata={"category": "preferences"}
)
```

---

## 📋 Add Rule

```python
await context_protocol.add_rule(
    agent_id="my-agent",
    name="Code Style",
    description="Follow PEP 8 guidelines",
    condition="when writing Python code",
    action="apply PEP 8 formatting",
    priority=10
)
```

---

## 💌 Send Message

### Point-to-Point
```python
message_id = await message_bus.send_task_request(
    from_agent="agent-1",
    to_agent="agent-2",
    task_description="Process data",
    task_data={"file": "data.csv"},
    priority=MessagePriority.HIGH
)
```

### Broadcast
```python
await message_bus.broadcast(
    from_agent="system",
    subject="Update Available",
    content={"version": "2.0.0"}
)
```

---

## 🎯 Models Reference

| Model | ID | Role | Use For |
|-------|-----|------|---------|
| Gemini 2.0 Flash | `google/gemini-2.0-flash-exp:free` | Communication | Fast responses, agent chat |
| Llama 3.3 70B | `meta-llama/llama-3.3-70b-instruct:free` | Reasoning | Complex decisions |
| Qwen Coder 32B | `qwen/qwen-2.5-coder-32b-instruct:free` | Code | Code generation |
| Qwen 72B | `qwen/qwen-2.5-72b-instruct:free` | Structured | JSON, data exchange |

---

## 🔗 API Endpoints

### Health
```bash
curl http://localhost:8000/ai/health
curl http://localhost:8000/ai/stats
```

### Chat
```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hi"}],
    "model_id": "google/gemini-2.0-flash-exp:free"
  }'
```

### Register Agent
```bash
curl -X POST http://localhost:8000/ai/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent-1",
    "agent_type": "worker",
    "name": "Worker 1",
    "capabilities": ["coding"]
  }'
```

### Create Task
```bash
curl -X POST http://localhost:8000/ai/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Task 1",
    "description": "Process data",
    "required_capabilities": ["coding"],
    "input_data": {}
  }'
```

---

## ⚙️ Configuration (.env)

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cache
CACHE_DEFAULT_TTL=3600
CACHE_ENABLED=True

# Defaults
DEFAULT_COMMUNICATION_MODEL=google/gemini-2.0-flash-exp:free
DEFAULT_REASONING_MODEL=meta-llama/llama-3.3-70b-instruct:free
DEFAULT_CODE_MODEL=qwen/qwen-2.5-coder-32b-instruct:free
DEFAULT_STRUCTURED_MODEL=qwen/qwen-2.5-72b-instruct:free
```

---

## 🧪 Testing

```bash
# Run all tests
pytest tests/test_ai_services.py -v

# Run specific test
pytest tests/test_ai_services.py::TestLLMProvider -v

# With coverage
pytest tests/test_ai_services.py --cov=app/services
```

---

## 📊 Get Stats

```python
# Orchestrator stats
stats = await orchestrator.get_orchestrator_stats()
# Returns: agents (total, active, idle), tasks (total, completed, failed, pending)

# Cache stats
stats = await redis_cache.get_stats()
# Returns: connected, used_memory, total_keys, hits, misses

# All stats
stats = await ai_service_manager.get_stats()
# Returns: cache + orchestrator stats
```

---

## 🔍 Common Patterns

### Pattern 1: Simple LLM Call
```python
llm_service = ai_service_manager.get_llm_service()
request = LLMRequest(
    messages=[LLMMessage(role="user", content="Your prompt")],
    model_id="google/gemini-2.0-flash-exp:free"
)
response = await llm_service.complete(request)
result = response.content
```

### Pattern 2: Agent with Memory
```python
orchestrator = ai_service_manager.get_orchestrator()
context_protocol = ai_service_manager.get_context_protocol()

# Register agent
agent = await orchestrator.register_agent(...)

# Add memory
await context_protocol.add_memory(
    agent_id=agent.id,
    content="Important info",
    memory_type=MemoryType.LONG_TERM,
    importance=0.8
)

# Use agent with context
response = await orchestrator.get_agent_intelligence(
    agent_id=agent.id,
    prompt="Do something using your memory"
)
```

### Pattern 3: Task Workflow
```python
orchestrator = ai_service_manager.get_orchestrator()

# Register agents
agent1 = await orchestrator.register_agent(...)
agent2 = await orchestrator.register_agent(...)

# Create tasks
task1 = await orchestrator.create_task(...)
task2 = await orchestrator.create_task(parent_task_id=task1.id)

# Assign and execute
await orchestrator.assign_task(task1.id)
result = await orchestrator.execute_task(task1.id)
```

---

## 🐛 Debugging

### Check Services
```bash
# Redis
redis-cli ping

# API
curl http://localhost:8000/ai/health

# Logs
tail -f logs/app.log
```

### Enable Debug Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Common Issues

**Redis not connected:**
```bash
# Check Redis
redis-cli ping

# Start Redis
redis-server
# or
docker run -d -p 6379:6379 redis:latest
```

**API key error:**
```bash
# Check environment
echo $OPENROUTER_API_KEY

# Or in .env file
cat .env | grep OPENROUTER_API_KEY
```

**Import errors:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `AI_SYSTEM_README.md` | Complete guide |
| `AI_SYSTEM_STRUCTURE.md` | Architecture & files |
| `IMPLEMENTATION_SUMMARY.md` | Feature checklist |
| `QUICK_REFERENCE.md` | This file |
| `examples/example_agent_usage.py` | Working examples |

---

## 🎯 Best Practices

1. **Choose the Right Model:**
   - Fast responses → Gemini Flash
   - Complex logic → Llama 70B
   - Code → Qwen Coder
   - JSON → Qwen 72B

2. **Use Caching:**
   - Enable for repeated queries
   - Set appropriate TTL
   - Monitor hit rates

3. **Agent Design:**
   - Specific capabilities
   - Clear responsibilities
   - Appropriate memory types

4. **Error Handling:**
   - Always use try-except
   - Check service availability
   - Handle timeouts

5. **Performance:**
   - Batch operations
   - Use async/await
   - Monitor stats

---

## 🚨 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Redis error | Check if Redis is running: `redis-cli ping` |
| Import error | Install deps: `pip install -r requirements.txt` |
| API key error | Check .env file has correct key |
| Timeout | Increase LLM_TIMEOUT in config |
| Cache miss | Normal on first request, check TTL |
| Agent offline | Check agent status: `GET /ai/agents/{id}` |
| Task stuck | Check timeout, view task status |

---

## 💡 Pro Tips

1. **Reuse Agents:** Register once, use multiple times
2. **Cache Everything:** Enable caching for cost savings
3. **Monitor Stats:** Check `/ai/stats` regularly
4. **Use Right Model:** Match model to task type
5. **Set Priorities:** Use HIGH for critical tasks
6. **Add Context:** Use memories and rules for better results
7. **Test Locally:** Use free models for development
8. **Handle Errors:** Implement retry logic
9. **Scale Horizontal:** Run multiple workers with shared Redis
10. **Document Agents:** Add descriptions to agent types

---

## 🎓 Learn More

**Examples:**
```bash
python -m examples.example_agent_usage
```

**Tests:**
```bash
pytest tests/test_ai_services.py -v
```

**API Docs:**
```
http://localhost:8000/docs
```

---

## ✅ Checklist for New Feature

- [ ] Choose appropriate model for task
- [ ] Register agent with correct capabilities
- [ ] Define memory and rules if needed
- [ ] Create tasks with priorities
- [ ] Handle errors and timeouts
- [ ] Add tests
- [ ] Update documentation
- [ ] Monitor performance

---

## 🆘 Get Help

1. Check error logs
2. Review documentation
3. Test with examples
4. Check service health
5. Verify configuration

**Still stuck?** Check:
- Redis connection
- API key validity
- Service initialization
- Network connectivity

---

Made with ❤️ for ChasmX Agent System
