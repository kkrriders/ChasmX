# ChasmX Workflow Structure Analysis

## 1. KEY WORKFLOW COMPONENT FILES

### Backend Files:
- `/mnt/c/Users/karti/ChasmX/backend/app/models/workflow.py` - MongoDB models
- `/mnt/c/Users/karti/ChasmX/backend/app/schemas/workflow.py` - Pydantic schemas
- `/mnt/c/Users/karti/ChasmX/backend/app/routes/workflow.py` - FastAPI endpoints
- `/mnt/c/Users/karti/ChasmX/backend/app/services/workflow_executor.py` - Execution engine
- `/mnt/c/Users/karti/ChasmX/backend/app/services/workflow_validator.py` - Validation service (EXISTING)
- `/mnt/c/Users/karti/ChasmX/backend/app/templates/email_automation_template.json` - Template example

### Frontend Files:
- `/mnt/c/Users/karti/ChasmX/Client/types/workflow.ts` - TypeScript interfaces
- `/mnt/c/Users/karti/ChasmX/Client/lib/workflows.ts` - API client library
- `/mnt/c/Users/karti/ChasmX/Client/lib/workflow-execution-engine.ts` - Frontend execution engine
- `/mnt/c/Users/karti/ChasmX/Client/components/builder/workflow-validation.tsx` - Frontend validation (EXISTING)
- `/mnt/c/Users/karti/ChasmX/Client/components/builder/component-library.tsx` - Node type definitions
- `/mnt/c/Users/karti/ChasmX/Client/components/builder/custom-node.tsx` - Node rendering component

---

## 2. WORKFLOW DATA STRUCTURE

### Workflow Core Schema
```typescript
// Frontend (Client/types/workflow.ts)
interface Workflow extends WorkflowSummary {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: WorkflowVariable[]
  metadata: WorkflowMetadata
  status: 'draft' | 'active'
  created_at: string
  updated_at: string
}

// Backend (Beanie/MongoDB model)
class Workflow(Document):
  name: str
  nodes: List[Node]
  edges: List[Edge]
  variables: List[WorkflowVariable]
  status: WorkflowStatus (DRAFT/ACTIVE)
  metadata: Metadata
  created_at: datetime
  updated_at: datetime
```

### Nodes
```typescript
interface WorkflowNode {
  id: string                      // Unique identifier (e.g., "start-1", "email-welcome-1")
  type: string                    // Node type (see Node Types section)
  position: Record<string, number> // Canvas position { x, y }
  config: Record<string, unknown>  // Node-specific configuration (flexible)
}
```

### Edges (Connections)
```typescript
interface WorkflowEdge {
  from: string    // Source node ID
  to: string      // Target node ID
  [key: string]: unknown  // Additional metadata allowed
}

// Backend uses alias: from_ to avoid Python keyword conflict
class Edge(BaseModel):
  from_: str = Field(..., alias="from")
  to: str
```

### Variables
```typescript
interface WorkflowVariable {
  id: string
  name: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
  secret?: boolean       // Sensitive data flag
  scope: 'global' | 'workflow' | 'environment'
}
```

### Metadata
```typescript
interface WorkflowMetadata {
  description?: string
  tags?: string[]
  author?: string
  version?: string
}
```

---

## 3. NODE TYPES AND SCHEMAS

### Available Node Types (from component-library.tsx)

#### Data Sources (4 types)
1. **data-source** - Connect to databases, APIs, files
   - Config: source_type, query, limit, sort_field, projection
2. **webhook** - Receive data from external services
3. **file-writer** - Write data to files or storage
4. **database** - Execute SQL queries directly

#### Processing (5 types)
1. **ai-processor** - Process data with AI models
   - Config: model, temperature, max_tokens, prompt, system_prompt
2. **filter** - Filter data based on conditions
3. **transformer** / **transformNode** - Transform data structure
4. **calculator** - Perform mathematical operations
5. **transform** (JSONata) - Advanced data transformation

#### Logic & Control Flow (4 types)
1. **conditionalNode** - If/Else/Switch logic with branches
2. **loopNode** - For Each / While iteration
3. **splitNode** - Execute multiple paths in parallel
4. **mergeNode** - Wait for and combine multiple streams

#### Actions & Integration (5 types)
1. **httpRequestNode** - Make HTTP requests (GET, POST, PUT, DELETE)
2. **email** / **emailSendNode** - Send emails
3. **codeExecutorNode** - Execute Python/JavaScript code
4. **loggerNode** - Log data for debugging
5. **delay** - Add time delays between steps

#### Special (5 types)
1. **start** - Workflow start point
2. **end** - Workflow end point
3. **webhook_trigger** - Webhook trigger
4. **schedule** - Scheduled execution
5. **manual** - Manual trigger

---

## 4. EXISTING VALIDATION LOGIC

### Backend Validation (workflow_validator.py)
Located: `/mnt/c/Users/karti/ChasmX/backend/app/services/workflow_validator.py`

#### Validation Severity Levels:
- **ERROR** - Blocks execution
- **WARNING** - Allows execution but shows warning
- **INFO** - Informational only

#### Validation Checks Implemented:

1. **Basic Structure**
   - Workflow name presence
   - Null/empty edge and variable lists

2. **Circular Dependency Detection**
   - DFS-based cycle detection
   - Returns cycle path in error details

3. **Dead Node Detection**
   - BFS to find unreachable nodes
   - Reports nodes not accessible from start nodes

4. **Node Configuration Validation**
   - Validates required fields per node type:
     ```python
     REQUIRED_CONFIGS = {
       "http": ["url", "method"],
       "email": ["to", "subject"],
       "database": ["connection", "query"],
       "transform": ["expression"],
       "condition": ["condition"],
       "loop": ["items"],
       "delay": ["duration"],
       "webhook": ["url"],
       "llm": ["prompt"],
       "code": ["code"],
     }
     ```

5. **Edge Validation**
   - Validates source/target node existence
   - Detects self-loops
   - Reports invalid edge references

6. **Start Node Validation**
   - Checks workflow has start node(s)
   - Warns about non-standard start node types:
     ```python
     VALID_START_NODES = ["trigger", "manual", "schedule", "webhook_trigger", "http"]
     ```

7. **End Node Validation**
   - Checks workflow has end node(s)
   - Warns about non-standard end nodes:
     ```python
     VALID_END_NODES = ["http", "email", "database", "webhook", "transform", "output", "success", "error"]
     ```

8. **Node Compatibility**
   - Validates conditional nodes have 2+ outgoing edges

9. **Isolated Node Detection**
   - Finds nodes with no incoming/outgoing connections

10. **Variable Reference Validation**
    - Pattern matching: `${var_name}` and `{{var_name}}`
    - Warns about undefined variable references

### Frontend Validation (workflow-validation.tsx)
Located: `/mnt/c/Users/karti/ChasmX/Client/components/builder/workflow-validation.tsx`

#### Client-Side Checks:
1. Disconnected nodes detection
2. Cycle detection using DFS
3. Start node validation
4. End node validation
5. Multi-start point detection

#### Validation Result Structure:
```typescript
interface ValidationIssue {
  type: "error" | "warning" | "info"
  nodeId?: string
  message: string
}
```

---

## 5. API STRUCTURE FOR WORKFLOWS

### Base Endpoints
Prefix: `/workflows`

#### CRUD Operations:
- `POST /workflows/` - Create workflow
- `GET /workflows/` - List all workflows (returns WorkflowSummary[])
- `GET /workflows/{workflow_id}` - Get single workflow
- `PUT /workflows/{workflow_id}` - Update workflow
- `DELETE /workflows/{workflow_id}` - Delete workflow

#### Execution Endpoints:
- `POST /workflows/{workflow_id}/execute` - Execute workflow
  - Request body:
    ```json
    {
      "inputs": { "key": "value" },
      "async_execution": true
    }
    ```
  - Response (202 Accepted):
    ```json
    {
      "execution_id": "uuid",
      "workflow_id": "id",
      "status": "queued|running|success|error",
      "message": "string",
      "started_at": "datetime"
    }
    ```

- `GET /workflows/{workflow_id}/executions` - List workflow executions
- `GET /workflows/executions/{execution_id}` - Get execution status
  - Returns ExecutionStatusResponse with node_states, logs, errors

#### Template Endpoints:
- `GET /workflows/templates/list` - List available templates
- `POST /workflows/templates/{template_name}/load` - Load template and create workflow

### Request/Response Models

#### ExecuteWorkflowRequest:
```python
inputs: Optional[Dict[str, Any]] = {}
async_execution: bool = False
```

#### ExecutionStatusResponse:
```python
execution_id: str
workflow_id: str
status: str
start_time: Optional[datetime]
end_time: Optional[datetime]
node_states: Dict[str, Any]        # Per-node execution state
logs: List[Dict[str, Any]]         # Execution logs
errors: List[Dict[str, Any]]       # Error stack
communication_log: List[Dict[str, Any]]  # Inter-node communication
```

---

## 6. WORKFLOW EXECUTION FLOW

### Execution State Management
```python
class WorkflowRun(Document):
  workflow_id: ObjectId
  execution_id: str
  status: ExecutionStatus (IDLE/QUEUED/RUNNING/SUCCESS/ERROR/PAUSED)
  start_time: datetime
  end_time: Optional[datetime]
  variables: Dict[str, Any]         # Runtime variable values
  node_states: Dict[str, Any]       # Per-node execution tracking
  errors: List[Dict]                # Collected errors
  logs: List[Dict]                  # Execution logs
  communication_log: List[Dict]     # Inter-node messages
```

### Node Execution State
```typescript
interface WorkflowNodeState {
  status: ExecutionStatus
  start_time?: string
  end_time?: string
  duration?: number
  input?: unknown
  output?: unknown
  error?: ExecutionError
  retry_count?: number
  logs?: string[]
}
```

### Execution Modes
- **Synchronous** - Client waits for completion
- **Asynchronous** - Background execution with WebSocket updates

### Communication Modes (from executor):
- **SIMPLE** - Sequential, in-memory communication
- **PUBSUB** - Redis-based, async parallel-capable

---

## 7. KEY IMPLEMENTATION PATTERNS

### Node Configuration Pattern
Nodes use flexible `config` objects. Each node type can define its own required/optional fields:

**Example (Email Node):**
```json
{
  "id": "email-1",
  "type": "email",
  "config": {
    "to": "{{outputs.mongodb-fetch-1.email}}",
    "subject": "Welcome!",
    "body": "Hi {{outputs.mongodb-fetch-1.name}}",
    "format": "html",
    "from": "sender@email.com",
    "retries": 3,
    "retry_delay": 2
  }
}
```

**Example (AI Processor Node):**
```json
{
  "id": "ai-processor-1",
  "type": "ai-processor",
  "config": {
    "model": "google/gemini-2.0-flash-exp:free",
    "temperature": 0.7,
    "max_tokens": 500,
    "system_prompt": "You are...",
    "prompt": "Based on: {{outputs.prev-node}}"
  }
}
```

### Variable Interpolation
Supports template syntax in node configs:
- `{{outputs.node-id}}` or `{{outputs.node-id.field}}`
- `${variable_name}`

### Workflow Normalization (Frontend)
Client normalizes MongoDB ObjectIds and different field naming conventions:
- MongoDB `_id` → `id`
- `from_` (Python) → `from` (frontend)

---

## 8. VALIDATION GAPS & OPPORTUNITIES

### Current Gaps:
1. **Node-specific schema validation** - Config flexibility allows invalid configs
2. **Type checking for variable references** - No type compatibility check
3. **Resource limit validation** - No max nodes, edges, or payload size checks
4. **Template integrity** - No validation when loading templates
5. **Advanced node compatibility** - Limited logic/loop parameter validation
6. **Async/parallel execution rules** - No validation for split/merge patterns
7. **Retry policy validation** - No checks for retry configurations
8. **API call security** - No URL validation or blocked URL lists

### Recommended Validation Additions:
1. Schema validation per node type
2. Variable type consistency checking
3. Branching pattern validation (if/else, split/merge)
4. Resource constraints validation
5. Template schema validation on load
6. Loop/recursion depth limits
7. Payload size limits
8. Security checks (URL patterns, secrets management)

---

## 9. SUMMARY OF DATA FLOW

```
User Input
    ↓
[Frontend Validation] ← workflow-validation.tsx
    ↓
API Request → POST /workflows/execute
    ↓
[Backend Validation] ← workflow_validator.py
    ↓
[Workflow Executor] ← workflow_executor.py
    ├─ Initialize execution context
    ├─ Process nodes in order
    ├─ Update node_states
    ├─ Collect logs & errors
    └─ Broadcast WebSocket updates
    ↓
[Execution Result]
    └─ Stored in WorkflowRun document
```

---

## 10. TEMPLATE EXAMPLE STRUCTURE

File: `/mnt/c/Users/karti/ChasmX/backend/app/templates/email_automation_template.json`

Real-world template with:
- 8 nodes (start, data-source, ai-processor, email, delay, ai-processor, email, end)
- 7 sequential edges
- 2 workflow variables
- Complex variable interpolation patterns
- Metadata with tags and version

This template demonstrates:
- Data source fetching (MongoDB)
- AI processing (content generation)
- Email sending
- Delay insertion
- Chained operations

