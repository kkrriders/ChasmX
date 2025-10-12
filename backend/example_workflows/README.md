# Example Workflows - Node Communication

This directory contains example workflows demonstrating the node-to-node communication features of ChasmX.

## Workflows

### 1. Simple Q&A (`01_simple_qa.json`)
**Purpose:** Demonstrates basic node communication

A student node asks a teacher node to explain photosynthesis. This showcases:
- Basic `ask_node()` functionality
- Simple two-node communication
- Educational use case

**How to run:**
```bash
# Import the workflow
curl -X POST http://localhost:8000/workflows/ \
  -H "Content-Type: application/json" \
  -d @01_simple_qa.json

# Execute (replace {workflow_id} with actual ID)
curl -X POST http://localhost:8000/workflows/{workflow_id}/execute \
  -H "Content-Type: application/json" \
  -d '{"inputs": {}, "async_execution": false}'
```

### 2. Collaborative ETL (`02_collaborative_etl.json`)
**Purpose:** Real-world data processing pipeline with collaboration

Three nodes work together to extract, transform, and load data:
- **Extractor:** Parses raw data and validates schema with Transformer
- **Transformer:** Transforms data and confirms format with Loader
- **Loader:** Validates final data and broadcasts success

Demonstrates:
- Multi-node coordination
- `ask_node()` for validation
- `set_shared_context()` for passing data
- `broadcast_message()` for status updates
- Error handling and corrections

**How to run:**
```bash
curl -X POST http://localhost:8000/workflows/ \
  -H "Content-Type: application/json" \
  -d @02_collaborative_etl.json
```

### 3. Content Creation Team (`03_content_creation_team.json`)
**Purpose:** Multi-agent content creation workflow

A team of AI specialists collaborate to create content:
- **Researcher:** Gathers facts and stores them in shared context
- **Writer:** Retrieves research and writes article draft
- **Editor:** Reviews content and provides feedback

Demonstrates:
- Complex multi-agent workflows
- Shared context for data passing
- Broadcast messaging for team updates
- Role-based AI agents
- Iterative feedback loops

**How to run:**
```bash
curl -X POST http://localhost:8000/workflows/ \
  -H "Content-Type: application/json" \
  -d @03_content_creation_team.json
```

### 4. Redis Pub/Sub Q&A Demo (`04_pubsub_collaborative_qa.json`)
**Purpose:** Demonstrates Redis Pub/Sub async communication mode

Uses Redis Pub/Sub for async node-to-node messaging:
- **Student Agent:** Asks questions via Redis Pub/Sub
- **Teacher Agent:** Responds asynchronously via message bus
- **Coordinator:** Broadcasts session summary to all agents

Demonstrates:
- Redis Pub/Sub communication mode
- Async message passing
- Agent registration and orchestration
- Redis channel-based messaging
- Automatic fallback to simple mode if Redis unavailable

**How to run:**
```bash
curl -X POST http://localhost:8000/workflows/ \
  -H "Content-Type: application/json" \
  -d @04_pubsub_collaborative_qa.json
```

**Note:** Requires Redis to be running. If Redis is unavailable, the system automatically falls back to simple mode.

## Communication Modes

### Simple Mode (Default)
- **In-memory communication** - Direct LLM calls between nodes
- **Sequential execution** - Nodes execute in order
- **No Redis required** - Works out of the box
- **Best for:** Development, testing, simple workflows

**Enable:**
```json
{
  "metadata": {
    "communication_mode": "simple"
  }
}
```

### Redis Pub/Sub Mode
- **Async messaging** - Redis Pub/Sub channels for communication
- **Agent-based** - Nodes registered as agents with orchestrator
- **Scalable** - Can handle complex parallel workflows
- **Requires Redis** - Falls back to simple mode if unavailable
- **Best for:** Production, complex workflows, real-time coordination

**Enable:**
```json
{
  "metadata": {
    "communication_mode": "pubsub"
  }
}
```

## Communication Features

### `ask_node(target_id, question)`
Ask another AI node a specific question and get a response.

**Usage in prompts:**
```
CALL: ask_node('calculator', 'What is 2+2?')
```

**Simple Mode:** Direct LLM call to target node
**Pub/Sub Mode:** Sends QUERY message via Redis, waits for RESPONSE

### `broadcast_message(message, target_types)`
Broadcast a message to all nodes or specific node types.

**Usage in prompts:**
```
CALL: broadcast_message('Processing complete')
CALL: broadcast_message('Alert: High priority task', ['ai-processor'])
```

**Simple Mode:** Stores in shared context for later retrieval
**Pub/Sub Mode:** Publishes to Redis broadcast channel

### `set_shared_context(key, value)`
Store data in shared context accessible to all nodes.

**Usage in prompts:**
```
CALL: set_shared_context('project_name', 'ChasmX')
```

**Both modes:** Stores in shared context dictionary

### `get_shared_context(key, default)`
Retrieve data from shared context.

**Usage in prompts:**
```
Get the project name from shared context
```

**Both modes:** Retrieves from shared context dictionary

## Viewing Communication Logs

After workflow execution, check the communication log:

```bash
curl http://localhost:8000/workflows/executions/{execution_id}
```

The response includes a `communication_log` array showing all inter-node communications:

```json
{
  "communication_log": [
    {
      "timestamp": "2025-01-12T20:30:00Z",
      "from_node": "student",
      "to_node": "teacher",
      "type": "ask",
      "content": "Can you explain photosynthesis?",
      "metadata": {}
    },
    {
      "timestamp": "2025-01-12T20:30:02Z",
      "from_node": "teacher",
      "to_node": "student",
      "type": "response",
      "content": "Photosynthesis is the process...",
      "metadata": {}
    }
  ]
}
```

## Testing

Run the automated test suite:

```bash
cd backend
python test_communication.py
```

This will:
1. Create test workflows
2. Execute them
3. Verify communication logs
4. Report results

## Configuration

### Enabling Communication

Add to any AI processor node config:

```json
{
  "type": "ai-processor",
  "config": {
    "can_communicate": true,
    "prompt": "Your prompt with CALL: statements..."
  }
}
```

### Best Practices

1. **Clear Intent:** Make questions specific and clear
2. **Error Handling:** Nodes should handle communication failures gracefully
3. **Context Management:** Use shared context for persistent data
4. **Broadcasts:** Use for status updates that multiple nodes need
5. **Targeted Asks:** Use ask_node() for specific node-to-node queries

## Next Steps

1. Try modifying the example workflows
2. Create your own collaborative workflows
3. Experiment with different communication patterns
4. Test with various LLM models (Gemini, Qwen, etc.)

## Support

For issues or questions:
- Check the main documentation: `docs/NODE_COMMUNICATION_IMPLEMENTATION.md`
- Review test script: `test_communication.py`
- Open an issue on GitHub
