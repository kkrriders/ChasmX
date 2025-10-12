# Node Communication Architecture

Visual guide to the dual-mode node communication system in ChasmX.

---

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    ChasmX Workflow Executor                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           Communication Mode Selector                    │ │
│  │  (from workflow.metadata.communication_mode)             │ │
│  └──────────────────┬───────────────────────────────────────┘ │
│                     │                                          │
│         ┌───────────┴───────────┐                             │
│         │                       │                             │
│    ┌────▼─────┐           ┌────▼────────┐                    │
│    │  SIMPLE  │           │   PUBSUB    │                    │
│    │   MODE   │           │    MODE     │                    │
│    └────┬─────┘           └────┬────────┘                    │
│         │                      │                              │
│    In-Memory              Redis Pub/Sub                       │
│    Direct LLM             Agent-Based                         │
│    Sequential             Async Capable                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Simple Mode Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIMPLE MODE                             │
│                    (Default - No Redis)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Workflow Executor                                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │         Shared Context (In-Memory Dict)            │  │ │
│  │  │  - broadcasts: []                                  │  │ │
│  │  │  - custom_keys: {}                                 │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  Node Execution (Sequential)                              │ │
│  │                                                           │ │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐              │ │
│  │  │ Node 1  │───▶│ Node 2  │───▶│ Node 3  │              │ │
│  │  │ Student │    │ Teacher │    │  End    │              │ │
│  │  └────┬────┘    └────▲────┘    └─────────┘              │ │
│  │       │              │                                    │ │
│  │       │ ask_node()   │                                    │ │
│  │       └──────────────┘                                    │ │
│  │    Direct LLM Call                                        │ │
│  │    (llm_service.complete)                                 │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Communication Methods:                                         │
│  • ask_node() → _ask_node_simple() → Direct LLM call          │
│  • broadcast_message() → Store in shared_context              │
│  • set_shared_context() → shared_context[key] = value         │
│  • get_shared_context() → shared_context.get(key)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Redis Pub/Sub Mode Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PUBSUB MODE                                    │
│                   (Redis-Based, Agent-Driven)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Agent Orchestrator                           │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │  Registered Agents                                      │   │   │
│  │  │  - node-exec123-student (agent_id)                      │   │   │
│  │  │  - node-exec123-teacher (agent_id)                      │   │   │
│  │  │  - node-exec123-coordinator (agent_id)                  │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────┬──────────────────────────────────────┘   │
│                             │                                           │
│  ┌──────────────────────────▼──────────────────────────────────────┐   │
│  │                   Redis Message Bus                             │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │  Pub/Sub Channels                                         │  │   │
│  │  │  • agent:node-exec123-student:messages                    │  │   │
│  │  │  • agent:node-exec123-teacher:messages                    │  │   │
│  │  │  • broadcast:all                                          │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  Message Types:                                                  │   │
│  │  • QUERY (ask_node requests)                                    │   │
│  │  • RESPONSE (ask_node replies)                                  │   │
│  │  • BROADCAST (broadcast_message)                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Workflow Executor                                  │   │
│  │                                                                 │   │
│  │  Message Handlers:                                              │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │  _handle_query_message(message)                         │   │   │
│  │  │  → Extract target node                                  │   │   │
│  │  │  → Execute LLM call                                     │   │   │
│  │  │  → Send RESPONSE back                                   │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │  _handle_response_message(message)                      │   │   │
│  │  │  → Match to pending Future                              │   │   │
│  │  │  → Resolve Future with response                         │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  Pending Responses:                                             │   │
│  │  {                                                              │   │
│  │    "query:student:teacher:123.456": Future<response_text>      │   │
│  │  }                                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ask_node() Sequence Diagram - Simple Mode

```
Student Node                 WorkflowExecutor               Teacher Node
     │                              │                              │
     │ CALL: ask_node('teacher')    │                              │
     ├─────────────────────────────▶│                              │
     │                              │                              │
     │                              │ _ask_node_simple()           │
     │                              │ ┌──────────────────────────┐ │
     │                              │ │ 1. Find target node      │ │
     │                              │ │ 2. Build LLM request     │ │
     │                              │ │ 3. Call llm_service      │ │
     │                              │ └──────────────────────────┘ │
     │                              │                              │
     │                              │  llm_service.complete()      │
     │                              ├──────────────────────────────▶
     │                              │                              │
     │                              │      Response Text           │
     │                              ◀──────────────────────────────┤
     │                              │                              │
     │      Response Text           │                              │
     ◀─────────────────────────────┤                              │
     │                              │                              │
```

---

## ask_node() Sequence Diagram - Pub/Sub Mode

```
Student Node          WorkflowExecutor          Redis           Teacher Node
     │                      │                     │                    │
     │ CALL: ask_node()     │                     │                    │
     ├─────────────────────▶│                     │                    │
     │                      │                     │                    │
     │                      │ _ask_node_pubsub()  │                    │
     │                      │ ┌────────────────┐  │                    │
     │                      │ │ Create Future  │  │                    │
     │                      │ │ Build QUERY    │  │                    │
     │                      │ └────────────────┘  │                    │
     │                      │                     │                    │
     │                      │  Publish QUERY      │                    │
     │                      ├────────────────────▶│                    │
     │                      │                     │                    │
     │                      │                     │  Route to handler  │
     │                      │                     ├───────────────────▶│
     │                      │                     │                    │
     │                      │                     │  _handle_query     │
     │                      │                     │  Execute LLM       │
     │                      │                     │                    │
     │                      │                     │  Send RESPONSE     │
     │                      │                     ◀───────────────────┤
     │                      │                     │                    │
     │                      │  Route to handler   │                    │
     │                      ◀────────────────────┤                    │
     │                      │                     │                    │
     │                      │ _handle_response    │                    │
     │                      │ Resolve Future      │                    │
     │                      │                     │                    │
     │    Return response   │                     │                    │
     ◀─────────────────────┤                     │                    │
     │                      │                     │                    │
```

---

## broadcast_message() Flow - Both Modes

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROADCAST MESSAGE FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Coordinator Node                                               │
│  CALL: broadcast_message('Task complete')                       │
│                                                                 │
│         ┌────────────────┴───────────────┐                     │
│         │                                │                     │
│    SIMPLE MODE                      PUBSUB MODE                │
│         │                                │                     │
│         ▼                                ▼                     │
│  ┌──────────────────┐          ┌───────────────────┐          │
│  │ shared_context   │          │ Redis Broadcast   │          │
│  │ .broadcasts[]    │          │ Channel           │          │
│  │ .append(message) │          │ publish(message)  │          │
│  └──────┬───────────┘          └────────┬──────────┘          │
│         │                               │                     │
│         │                               │                     │
│  Later nodes read                All subscribed               │
│  from broadcasts[]               agents receive               │
│  when executed                   immediately                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Communication Mode Decision Tree

```
                    Start Workflow Execution
                              │
                              ▼
          ┌───────────────────────────────────────┐
          │ Check workflow.metadata               │
          │ .communication_mode                   │
          └───────────────┬───────────────────────┘
                          │
           ┌──────────────┴──────────────┐
           │                             │
      "pubsub"                      Not specified
           │                        or "simple"
           ▼                             │
    ┌─────────────────┐                 │
    │ Try Initialize  │                 │
    │ Redis & Agents  │                 │
    └────────┬────────┘                 │
             │                           │
        ┌────┴────┐                     │
        │         │                     │
    Success    Failed                   │
        │         │                     │
        ▼         ▼                     ▼
    ┌────────────────────────────────────┐
    │        Use Simple Mode             │
    │  (In-memory, Sequential)           │
    └────────────────────────────────────┘
             │
             ▼
    Execute Workflow with
    selected communication mode
```

---

## Data Flow - Shared Context

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED CONTEXT SYSTEM                        │
│                    (Used in Both Modes)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           shared_context: Dict[str, Any]               │    │
│  │                                                         │    │
│  │  {                                                      │    │
│  │    "broadcasts": [                                     │    │
│  │      {                                                  │    │
│  │        "from": "coordinator",                           │    │
│  │        "message": "Task complete",                      │    │
│  │        "timestamp": "2025-01-12T20:30:00Z",            │    │
│  │        "target_types": null                             │    │
│  │      }                                                   │    │
│  │    ],                                                    │    │
│  │    "project_name": "ChasmX",                            │    │
│  │    "research_facts": "...",                             │    │
│  │    "article_draft": "...",                              │    │
│  │    "custom_key": "custom_value"                         │    │
│  │  }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Operations:                                                    │
│                                                                 │
│  ┌─────────────────────┐   ┌────────────────────┐             │
│  │ set_shared_context  │   │ get_shared_context │             │
│  │ (key, value)        │   │ (key, default)     │             │
│  └──────────┬──────────┘   └─────────┬──────────┘             │
│             │                         │                        │
│             ▼                         ▼                        │
│   shared_context[key] = value   return shared_context.get()   │
│                                                                 │
│  Available to all nodes during workflow execution              │
│  Persists for entire workflow run                              │
│  Reset on new execution                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Communication Log Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMMUNICATION LOG                             │
│           (Stored in WorkflowRun.communication_log)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [                                                              │
│    {                                                            │
│      "timestamp": "2025-01-12T20:30:00.123Z",                   │
│      "from_node": "student",                                    │
│      "to_node": "teacher",                                      │
│      "type": "ask",                                             │
│      "content": "Can you explain quantum entanglement?",        │
│      "metadata": {                                              │
│        "context_provided": false,                               │
│        "mode": "pubsub"                                         │
│      }                                                           │
│    },                                                           │
│    {                                                            │
│      "timestamp": "2025-01-12T20:30:02.456Z",                   │
│      "from_node": "teacher",                                    │
│      "to_node": "student",                                      │
│      "type": "response",                                        │
│      "content": "Quantum entanglement is when...",              │
│      "metadata": {                                              │
│        "mode": "pubsub"                                         │
│      }                                                           │
│    },                                                           │
│    {                                                            │
│      "timestamp": "2025-01-12T20:30:05.789Z",                   │
│      "from_node": "coordinator",                                │
│      "to_node": "broadcast",                                    │
│      "type": "broadcast",                                       │
│      "content": "Learning session complete",                    │
│      "metadata": {                                              │
│        "target_types": null,                                    │
│        "broadcast_count": 1,                                    │
│        "mode": "pubsub"                                         │
│      }                                                           │
│    }                                                            │
│  ]                                                              │
│                                                                 │
│  Message Types:                                                 │
│  • "ask" - Question from one node to another                    │
│  • "response" - Answer to a question                            │
│  • "broadcast" - Message to all nodes                           │
│  • "context_update" - Shared context modification               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent Lifecycle - Pub/Sub Mode

```
┌─────────────────────────────────────────────────────────────────┐
│              AGENT LIFECYCLE (Pub/Sub Mode)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Workflow Start                                                 │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────────────────────────────────┐                  │
│  │  1. INITIALIZATION                       │                  │
│  │  For each AI node with can_communicate:  │                  │
│  │                                           │                  │
│  │  await _register_node_agent(node, exec)  │                  │
│  │  ┌────────────────────────────────────┐  │                  │
│  │  │ agent_id = node-{exec_id}-{node}  │  │                  │
│  │  │ capabilities = ["ai-processing"]   │  │                  │
│  │  │ orchestrator.register_agent(...)   │  │                  │
│  │  │ active_agents[exec][node] = agent  │  │                  │
│  │  └────────────────────────────────────┘  │                  │
│  └──────────────────┬───────────────────────┘                  │
│                     │                                           │
│                     ▼                                           │
│  ┌──────────────────────────────────────────┐                  │
│  │  2. EXECUTION                            │                  │
│  │  Agents subscribed to Redis channels     │                  │
│  │  Can send/receive messages               │                  │
│  │  Execute LLM calls on demand             │                  │
│  └──────────────────┬───────────────────────┘                  │
│                     │                                           │
│                     ▼                                           │
│  ┌──────────────────────────────────────────┐                  │
│  │  3. CLEANUP (finally block)              │                  │
│  │                                           │                  │
│  │  await _cleanup_agents(execution_id)     │                  │
│  │  ┌────────────────────────────────────┐  │                  │
│  │  │ For each registered agent:         │  │                  │
│  │  │   orchestrator.unregister_agent()  │  │                  │
│  │  │ Clear active_agents[execution_id]  │  │                  │
│  │  └────────────────────────────────────┘  │                  │
│  └──────────────────┬───────────────────────┘                  │
│                     │                                           │
│                     ▼                                           │
│  Workflow Complete                                              │
│  (Agents removed from orchestrator)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Handling & Fallback

```
┌─────────────────────────────────────────────────────────────────┐
│              ERROR HANDLING & FALLBACK LOGIC                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Scenario 1: Redis Unavailable                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Try to initialize message_bus                          │    │
│  │         │                                               │    │
│  │    Exception caught                                     │    │
│  │         │                                               │    │
│  │         ▼                                               │    │
│  │  Log warning: "Failed to initialize Pub/Sub"           │    │
│  │  comm_mode = CommunicationMode.SIMPLE                   │    │
│  │  Continue with simple mode                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Scenario 2: Target Agent Not Registered                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ask_node('target') in pubsub mode                       │    │
│  │         │                                               │    │
│  │  target_agent_id not found                              │    │
│  │         │                                               │    │
│  │         ▼                                               │    │
│  │  Log warning: "Target not registered as agent"          │    │
│  │  return await _ask_node_simple(...)                     │    │
│  │  (Fallback to direct LLM call)                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Scenario 3: Response Timeout                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ await asyncio.wait_for(response_future, timeout=30)    │    │
│  │         │                                               │    │
│  │  asyncio.TimeoutError                                   │    │
│  │         │                                               │    │
│  │         ▼                                               │    │
│  │  raise WorkflowExecutionError("Timeout waiting...")     │    │
│  │  Workflow execution fails                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Scenario 4: Agent Cleanup Failure                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ try: orchestrator.unregister_agent(agent_id)            │    │
│  │ except Exception as e:                                  │    │
│  │     Log error but continue cleanup                      │    │
│  │     (Don't fail entire workflow)                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance Characteristics

```
┌──────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE PROFILE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Simple Mode                                                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  ask_node() latency breakdown:                         │     │
│  │  • Lookup target node:        ~1ms                     │     │
│  │  • Build LLM request:          ~1ms                     │     │
│  │  • LLM call (with caching):    ~500-1000ms             │     │
│  │  • Log communication:          ~1ms                     │     │
│  │  ────────────────────────────────────                  │     │
│  │  Total:                        ~503-1003ms             │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  Pub/Sub Mode                                                    │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  ask_node() latency breakdown:                         │     │
│  │  • Create Future & message:    ~1ms                     │     │
│  │  • Redis publish:              ~1-5ms                   │     │
│  │  • Redis routing:              ~1-5ms                   │     │
│  │  • Handler processing:         ~1ms                     │     │
│  │  • LLM call (with caching):    ~500-1000ms             │     │
│  │  • Response via Redis:         ~1-5ms                   │     │
│  │  • Future resolution:          ~1ms                     │     │
│  │  ────────────────────────────────────────              │     │
│  │  Total:                        ~506-1018ms             │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  Overhead: Pub/Sub adds ~3-15ms overhead compared to Simple     │
│                                                                  │
│  Benefits of Pub/Sub Mode:                                      │
│  • Can handle parallel execution (when implemented)             │
│  • Scales horizontally with Redis clustering                    │
│  • Supports cross-process communication                         │
│  • Better for complex workflows with many communications        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Configuration Summary

```yaml
# Simple Mode (Default)
workflow:
  name: "My Workflow"
  # No metadata needed, or:
  metadata:
    communication_mode: "simple"

# Pub/Sub Mode
workflow:
  name: "My Advanced Workflow"
  metadata:
    communication_mode: "pubsub"  # Requires Redis

# Node Configuration (Same for Both Modes)
node:
  type: "ai-processor"
  config:
    can_communicate: true  # Enable communication
    system_prompt: "You are an AI assistant..."
    prompt: "Your task... CALL: ask_node('target', 'question')"
    model: "google/gemini-2.0-flash-exp:free"
```

---

This architecture enables flexible, scalable node-to-node communication with graceful fallback and comprehensive error handling.
