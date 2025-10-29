# Redis Pub/Sub for Node Communication - Explained

## 🎯 How It Works (Simple Explanation)

Think of Redis Pub/Sub like a **radio station system**:
- Each AI node is like a person with a **walkie-talkie** (can send and receive)
- Redis is the **radio tower** that routes messages
- Each node has its **own frequency** (channel) to receive messages
- There's also a **broadcast channel** where everyone listens

---

## 📡 The Complete Flow

### 1. **Workflow Starts with Pub/Sub Mode**

```
User creates workflow with:
{
  "metadata": {
    "communication_mode": "pubsub"  ← Tells system to use Redis
  }
}
```

### 2. **System Initialization**

When workflow starts:

```
WorkflowExecutor.execute()
│
├─ Detects mode = "pubsub"
│
├─ Connects to Redis
│   ├─ Creates message_bus (for sending messages)
│   └─ Creates orchestrator (manages agents)
│
├─ Registers Message Handlers
│   ├─ QUERY handler → _handle_query_message()
│   └─ RESPONSE handler → _handle_response_message()
│
└─ Registers Each AI Node as an Agent
    └─ agent_id = "node-exec123-student"
    └─ Subscribes to channel: "agent:messages:node-exec123-student"
```

### 3. **When Node Asks Another Node (ask_node)**

**Step-by-Step Example:** Student asks Teacher a question

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Student Node Executes                                  │
├─────────────────────────────────────────────────────────────────┤
│ Prompt: "CALL: ask_node('teacher', 'What is quantum physics?')"│
│                                                                 │
│ ↓ Parsed by _process_communication_requests()                  │
│ ↓ Calls ask_node(source='student', target='teacher', ...)      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Create Query Message                                   │
├─────────────────────────────────────────────────────────────────┤
│ message_id = "query:student:teacher:1705099200.123"            │
│                                                                 │
│ Creates asyncio.Future() to wait for response                  │
│ Stores in: pending_responses[message_id] = Future              │
│                                                                 │
│ Builds AgentMessage:                                            │
│   {                                                             │
│     "id": "query:student:teacher:1705099200.123",              │
│     "type": "QUERY",                                           │
│     "from_agent": "node-exec123-student",                      │
│     "to_agent": "node-exec123-teacher",                        │
│     "content": {                                               │
│       "question": "What is quantum physics?",                  │
│       "context": {}                                            │
│     }                                                           │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Publish to Redis                                       │
├─────────────────────────────────────────────────────────────────┤
│ message_bus.publish(query_message)                             │
│                                                                 │
│ ↓ Redis publishes to channel:                                  │
│   "agent:messages:node-exec123-teacher"                        │
│                                                                 │
│ ✓ Message now in Redis, waiting for subscriber                 │
│                                                                 │
│ Student node now waits:                                         │
│   await asyncio.wait_for(future, timeout=30)                   │
│   (Execution paused, waiting for teacher's response)           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Redis Routes to Teacher                                │
├─────────────────────────────────────────────────────────────────┤
│ Redis sees: "agent:messages:node-exec123-teacher" has message  │
│                                                                 │
│ ↓ Teacher's subscription receives it                           │
│ ↓ Triggers: _handle_query_message(message)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Teacher Processes Query                                │
├─────────────────────────────────────────────────────────────────┤
│ _handle_query_message() extracts:                              │
│   - question = "What is quantum physics?"                      │
│   - target_node = teacher node                                 │
│                                                                 │
│ ↓ Calls LLM with teacher's config:                             │
│   llm_service.complete({                                        │
│     "messages": [                                              │
│       {                                                         │
│         "role": "system",                                      │
│         "content": "You are a physics teacher..."             │
│       },                                                        │
│       {                                                         │
│         "role": "user",                                        │
│         "content": "What is quantum physics?"                  │
│       }                                                         │
│     ]                                                           │
│   })                                                            │
│                                                                 │
│ ✓ LLM returns: "Quantum physics is the study of..."            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Teacher Sends Response Back                            │
├─────────────────────────────────────────────────────────────────┤
│ message_bus.send_task_response(                                │
│   from_agent="node-exec123-teacher",                           │
│   to_agent="node-exec123-student",                             │
│   reply_to="query:student:teacher:1705099200.123",            │
│   result={"response": "Quantum physics is..."}                 │
│ )                                                               │
│                                                                 │
│ ↓ Creates RESPONSE message                                     │
│ ↓ Publishes to Redis channel:                                  │
│   "agent:messages:node-exec123-student"                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 7: Student Receives Response                              │
├─────────────────────────────────────────────────────────────────┤
│ Redis routes RESPONSE to student's channel                     │
│                                                                 │
│ ↓ Triggers: _handle_response_message(response)                 │
│                                                                 │
│ _handle_response_message() does:                               │
│   1. Looks up reply_to = "query:student:teacher:1705099200.123"│
│   2. Finds pending_responses[message_id] = Future              │
│   3. Extracts response text = "Quantum physics is..."          │
│   4. Resolves Future: future.set_result(response_text)         │
│                                                                 │
│ ✓ Future resolves! Student's wait is over                      │
│ ✓ ask_node() returns response to student                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Visual Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                         REDIS PUB/SUB SYSTEM                          │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────┐                 ┌─────────────────────────┐
│ Workflow        │                 │         REDIS           │
│ Executor        │                 │                         │
│                 │                 │  Channels:              │
│ • message_bus ──────publish()────▶│  ┌─────────────────┐   │
│ • orchestrator  │                 │  │ agent:messages: │   │
│ • active_agents │                 │  │ :student        │   │
│ • pending_      │                 │  └─────────────────┘   │
│   responses     │                 │  ┌─────────────────┐   │
│                 │◀────subscribe───│  │ agent:messages: │   │
└─────────────────┘                 │  │ :teacher        │   │
         │                          │  └─────────────────┘   │
         │                          │  ┌─────────────────┐   │
         │                          │  │ agent:messages: │   │
         │                          │  │ :broadcast      │   │
         │                          │  └─────────────────┘   │
         │                          └─────────────────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Message Handlers                         │
│                                                             │
│  QUERY Handler (_handle_query_message)                     │
│  ├─ Extracts target node                                   │
│  ├─ Calls LLM                                              │
│  └─ Sends RESPONSE back                                    │
│                                                             │
│  RESPONSE Handler (_handle_response_message)               │
│  ├─ Matches reply_to with pending Future                   │
│  └─ Resolves Future with response text                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Components

### 1. **AgentMessageBus** (`backend/app/services/agents/aap.py`)

The communication infrastructure:

```python
class AgentMessageBus:
    # Connects to Redis
    # Publishes messages to channels
    # Subscribes to channels
    # Routes incoming messages to handlers
```

**Methods Used:**
- `publish(message)` - Send message to a channel
- `subscribe(agent_id)` - Listen to agent's channel
- `register_handler(type, handler)` - Register message handler
- `send_task_response(...)` - Send response message
- `broadcast(...)` - Send to all agents

### 2. **Agent Registration**

Each node becomes an agent:

```python
async def _register_node_agent(self, node, execution_id):
    agent_id = f"node-{execution_id}-{node.id}"

    # Tell orchestrator about this agent
    await self.orchestrator.register_agent(
        agent_id=agent_id,
        agent_type="workflow_node",
        ...
    )

    # Subscribe to Redis channel
    await self.message_bus.subscribe(agent_id)

    # Store mapping: node.id → agent_id
    self.active_agents[execution_id][node.id] = agent_id
```

### 3. **Message Flow with Futures**

Python asyncio.Future is used for async waiting:

```python
# Create Future to wait for response
response_future = asyncio.Future()
self.pending_responses[message_id] = response_future

# Send query
await message_bus.publish(query_message)

# Wait for response (with timeout)
response = await asyncio.wait_for(response_future, timeout=30)

# When response arrives, _handle_response_message() does:
future = self.pending_responses[message_id]
future.set_result(response_text)  # Unblocks the wait!
```

---

## ❓ Will Docker Rebuild Cause Errors?

### **Answer: NO - It's Safe! ✅**

Here's why:

### 1. **Automatic Fallback Built-In**

```python
# In execute() method
if comm_mode == CommunicationMode.PUBSUB:
    try:
        self.message_bus = ai_service_manager.get_message_bus()
        self.orchestrator = ai_service_manager.get_orchestrator()
        # ... setup code ...
    except Exception as e:
        logger.warning(f"Failed to initialize Pub/Sub, falling back to simple: {e}")
        comm_mode = CommunicationMode.SIMPLE  # ← Automatic fallback!
```

**What happens:**
- If Redis not available → Falls back to simple mode
- Workflow continues normally
- No errors, just a warning in logs

### 2. **Default is Simple Mode**

```python
# If user doesn't specify mode, uses simple
comm_mode = CommunicationMode(
    workflow.metadata.get("communication_mode", "simple")  # ← Default
    if hasattr(workflow, 'metadata') and workflow.metadata
    else "simple"
)
```

**What happens:**
- Existing workflows automatically use simple mode
- No Redis needed for simple mode
- Zero breaking changes

### 3. **Redis in Docker Compose**

Your `docker-compose.yml` includes Redis:

```yaml
services:
  redis:
    image: redis:latest
    container_name: chasmx-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  backend:
    depends_on:
      redis:
        condition: service_healthy  # ← Waits for Redis
    environment:
      - REDIS_URL=redis://redis:6379/0
```

**What happens:**
- Redis starts before backend
- Backend can connect to Redis
- Pub/Sub mode will work if you enable it

---

## 🚦 Three Scenarios After Rebuild

### Scenario 1: Redis Running + Simple Mode Workflow
```
✅ WORKS PERFECTLY
- Workflow uses simple mode (default)
- Redis is running but not used
- No overhead, no issues
```

### Scenario 2: Redis Running + Pub/Sub Mode Workflow
```
✅ WORKS PERFECTLY
- Workflow specifies "communication_mode": "pubsub"
- Connects to Redis
- Uses Pub/Sub for communication
- Full async messaging works
```

### Scenario 3: Redis NOT Running + Pub/Sub Mode Workflow
```
✅ WORKS WITH FALLBACK
- Workflow specifies "communication_mode": "pubsub"
- Tries to connect to Redis → FAILS
- Catches exception
- Falls back to simple mode
- Logs warning: "Failed to initialize Pub/Sub, falling back to simple"
- Workflow executes successfully in simple mode
```

---

## 📊 Testing After Rebuild

### Test 1: Verify Redis is Running

```bash
docker-compose up -d
docker ps | grep redis
# Should show: chasmx-redis
```

### Test 2: Test Simple Mode (Default)

```bash
# Import and run any existing workflow
curl -X POST http://localhost:8000/workflows/ \
  -H "Content-Type: application/json" \
  -d @backend/example_workflows/01_simple_qa.json

# Execute it
curl -X POST http://localhost:8000/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"inputs": {}, "async_execution": false}'

# ✅ Should work perfectly (uses simple mode)
```

### Test 3: Test Pub/Sub Mode

```bash
# Import Pub/Sub workflow
curl -X POST http://localhost:8000/workflows/ \
  -H "Content-Type: application/json" \
  -d @backend/example_workflows/04_pubsub_collaborative_qa.json

# Execute it
curl -X POST http://localhost:8000/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"inputs": {}, "async_execution": false}'

# Check logs
docker logs backend | grep "pubsub"
# Should show:
# INFO - Using communication mode: pubsub
# INFO - Initialized Redis Pub/Sub communication
# INFO - Registered agent: node-exec123-student
```

### Test 4: Test Fallback (Stop Redis)

```bash
# Stop Redis
docker stop chasmx-redis

# Try to run Pub/Sub workflow
curl -X POST http://localhost:8000/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"inputs": {}, "async_execution": false}'

# Check logs
docker logs backend | tail -20
# Should show:
# WARNING - Failed to initialize Pub/Sub mode, falling back to simple
# INFO - Using communication mode: simple

# ✅ Workflow still completes successfully!
```

---

## 🎯 Summary

### How It Works:
1. **Workflow specifies mode** → "simple" or "pubsub"
2. **System detects mode** → Reads from workflow.metadata
3. **If pubsub:** Connects to Redis, registers agents, uses channels
4. **If simple:** Uses in-memory direct LLM calls (no Redis)

### Redis Pub/Sub Technique:
- Each node = agent with unique channel
- Messages published to specific channels
- Handlers process incoming messages
- Futures enable async waiting
- 30-second timeout prevents hanging

### After Docker Rebuild:
- **✅ No errors will occur**
- **✅ Automatic fallback to simple mode**
- **✅ Redis ready if you want Pub/Sub**
- **✅ Existing workflows continue working**
- **✅ Zero breaking changes**

### When to Use Each Mode:
- **Simple Mode:** Development, testing, simple workflows
- **Pub/Sub Mode:** Production, complex workflows, need scalability

---

**You're safe to rebuild! The system is designed to handle all scenarios gracefully.** 🎉
