# Workflow Validation System Reference Guide

## Quick Reference: File Locations

### Primary Files
| File | Purpose | Language | Status |
|------|---------|----------|--------|
| `/backend/app/services/workflow_validator.py` | Core validation logic | Python | EXISTING |
| `/Client/components/builder/workflow-validation.tsx` | UI validation display | TypeScript/React | EXISTING |
| `/backend/app/routes/workflow.py` | API endpoints | Python | Calls validator |
| `/Client/types/workflow.ts` | Type definitions | TypeScript | Interfaces |

---

## Validation Flow Diagram

```
User Creates/Updates Workflow
    ↓
Frontend (React)
├─ workflow-validation.tsx validates basic structure
│  ├─ Check nodes exist
│  ├─ Check edges valid
│  ├─ Detect cycles (DFS)
│  └─ Display validation UI
    ↓
User Executes Workflow
    ↓
POST /workflows/{id}/execute
    ↓
Backend (FastAPI)
├─ workflow.py route handler
├─ Call workflow_validator.validate_workflow()
│  ├─ Basic structure check
│  ├─ Circular dependency detection (DFS)
│  ├─ Dead node detection (BFS)
│  ├─ Node config validation
│  ├─ Edge validation
│  ├─ Start/end node validation
│  ├─ Node compatibility checks
│  ├─ Isolated node detection
│  └─ Variable reference validation
│
├─ If has_errors: Return 400 Bad Request
└─ Else: Continue to workflow_executor.execute()
    ↓
WorkflowRun created and executed
```

---

## Validation Classes & Structures

### ValidationSeverity (Python Enum)
```python
class ValidationSeverity(str, Enum):
    ERROR = "error"      # Blocks execution
    WARNING = "warning"  # Allows execution
    INFO = "info"        # Informational
```

### ValidationIssue (Pydantic Model)
```python
class ValidationIssue(BaseModel):
    severity: ValidationSeverity
    code: str                          # Machine-readable code
    message: str                       # Human-readable message
    node_id: Optional[str] = None      # Which node (if applicable)
    details: Optional[Dict[str, Any]] = None  # Additional info
```

### ValidationResult (Pydantic Model)
```python
class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[ValidationIssue] = []
    warnings: List[ValidationIssue] = []
    info: List[ValidationIssue] = []
    
    # Properties
    has_errors: bool          # True if errors > 0
    has_warnings: bool        # True if warnings > 0
    total_issues: int         # Count of all issues
```

---

## Validation Error Codes

### Structural Errors
| Code | Severity | Meaning |
|------|----------|---------|
| `EMPTY_WORKFLOW` | ERROR | Workflow has no nodes |
| `CIRCULAR_DEPENDENCY` | ERROR | Cycle detected in graph |
| `INVALID_EDGE_SOURCE` | ERROR | Edge references non-existent source |
| `INVALID_EDGE_TARGET` | ERROR | Edge references non-existent target |
| `NO_START_NODE` | ERROR | No start nodes found |

### Configuration Errors
| Code | Severity | Meaning |
|------|----------|---------|
| `MISSING_REQUIRED_FIELD` | ERROR | Node missing required config field |
| `EMPTY_CONFIG` | INFO | Node has empty config |

### Structural Warnings
| Code | Severity | Meaning |
|------|----------|---------|
| `SELF_LOOP` | WARNING | Node has self-loop edge |
| `DEAD_NODE` | WARNING | Node unreachable from start |
| `ISOLATED_NODE` | WARNING | Node has no connections |
| `NO_END_NODE` | WARNING | Workflow has no end node |
| `UNDEFINED_VARIABLE` | WARNING | Config references undefined variable |

### Node-Specific Warnings
| Code | Severity | Meaning |
|------|----------|---------|
| `UNUSUAL_START_NODE` | WARNING | Start node not in VALID_START_NODES list |
| `UNUSUAL_END_NODE` | INFO | End node not in VALID_END_NODES list |
| `INCOMPLETE_CONDITION` | WARNING | Condition node has < 2 outgoing edges |

### Metadata Warnings
| Code | Severity | Meaning |
|------|----------|---------|
| `MISSING_NAME` | WARNING | Workflow has no name |

---

## Required Node Configurations

Current validation checks for these required fields:

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

**To extend this**, add more node types to the dictionary in `workflow_validator.py` line 53-64.

---

## Valid Start & End Nodes

### Valid Start Nodes (line 67-73)
```python
VALID_START_NODES = [
    "trigger",
    "manual",
    "schedule",
    "webhook_trigger",
    "http",
]
```

### Valid End Nodes (line 76-85)
```python
VALID_END_NODES = [
    "http",
    "email",
    "database",
    "webhook",
    "transform",
    "output",
    "success",
    "error",
]
```

---

## Variable Interpolation Patterns

The validator detects variable references using regex:

```python
patterns = [
    r'\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}',      # ${var_name}
    r'\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}',    # {{var_name}}
]
```

**Example valid references:**
- `${batch_size}`
- `{{user_name}}`
- `${outputs.node-id}`
- `{{metadata.version}}`

---

## How to Extend Validation

### Adding a New Validation Check

1. **Create a new method** in `WorkflowValidator` class:
   ```python
   def _validate_new_check(self, workflow: Workflow, result: ValidationResult):
       """Description of what this checks"""
       for node in workflow.nodes:
           # Your validation logic
           if error_condition:
               result.errors.append(ValidationIssue(
                   severity=ValidationSeverity.ERROR,
                   code="ERROR_CODE",
                   message="Human-readable message",
                   node_id=node.id,
                   details={"key": "value"}
               ))
   ```

2. **Call it from `validate_workflow()`** (line 90):
   ```python
   self._validate_new_check(workflow, result)
   ```

### Adding Required Fields for a Node Type

Add to `REQUIRED_CONFIGS` (line 53-64):
```python
"your_node_type": ["required_field1", "required_field2"],
```

### Adding a New Start Node Type

Add to `VALID_START_NODES` (line 67-73):
```python
"your_trigger_type",
```

---

## Frontend ValidationIssue Type

The frontend has its own simpler structure:

```typescript
interface ValidationIssue {
  type: "error" | "warning" | "info"
  nodeId?: string
  message: string
}
```

This is simpler than the backend version. When integrating backend validation responses, map:
- Backend `severity` → Frontend `type`
- Backend `node_id` → Frontend `nodeId`
- Backend `message` → Frontend `message`

---

## Validation in API Execution

### Current Flow (workflow.py route handler)

```python
@router.post("/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, request: ExecuteWorkflowRequest):
    # ... load workflow ...
    
    # Currently: No explicit validation call
    # Validation happens implicitly through model validation
    
    workflow_run = WorkflowRun(...)
    
    if request.async_execution:
        background_tasks.add_task(workflow_executor.execute, workflow, workflow_run)
    else:
        workflow_run = await workflow_executor.execute(workflow, workflow_run)
```

### Recommended: Add Explicit Validation

```python
from ..services.workflow_validator import workflow_validator

@router.post("/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, request: ExecuteWorkflowRequest):
    # ... load workflow ...
    
    # Add validation
    validation_result = workflow_validator.validate_workflow(workflow)
    if validation_result.has_errors:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Workflow validation failed",
                "errors": [e.model_dump() for e in validation_result.errors]
            }
        )
    
    # Continue with execution
    workflow_run = await workflow_executor.execute(workflow, workflow_run)
```

---

## Testing Validation

### Test Cases to Cover

1. Empty workflow
2. Workflow with cycles
3. Nodes with missing required fields
4. Invalid edge references
5. No start/end nodes
6. Variable references to undefined variables
7. Isolated nodes
8. Valid workflows should pass all checks

### Example Test

```python
async def test_validation_circular_dependency():
    # Create workflow with cycle: A -> B -> A
    workflow = Workflow(
        name="Test",
        nodes=[
            Node(id="a", type="start", config={}),
            Node(id="b", type="end", config={}),
        ],
        edges=[
            Edge(from_="a", to="b"),
            Edge(from_="b", to="a"),  # Creates cycle
        ],
        variables=[],
        status=WorkflowStatus.DRAFT,
        metadata=Metadata()
    )
    
    result = workflow_validator.validate_workflow(workflow)
    assert not result.is_valid
    assert result.has_errors
    assert any(issue.code == "CIRCULAR_DEPENDENCY" for issue in result.errors)
```

---

## Performance Considerations

### Complexity Analysis

| Check | Algorithm | Complexity |
|-------|-----------|-----------|
| Circular dependency | DFS | O(V + E) |
| Dead node detection | BFS | O(V + E) |
| Edge validation | Iteration | O(E) |
| Config validation | Nested loop | O(N * F) |
| Variable reference | Regex + iteration | O(N * C) |

Where:
- V = number of nodes (vertices)
- E = number of edges
- N = number of nodes
- F = average fields per config
- C = average config size

For typical workflows (< 100 nodes), all checks complete instantly.

---

## Integration Points

### Where Validation is Called

1. **Frontend** - Real-time as user builds workflow
   - File: `workflow-validation.tsx`
   - Called: On nodes/edges change
   - Blocking: UI feedback only

2. **Backend** - Before execution
   - File: `workflow_validator.py` (service)
   - Called: Could be added to route handler
   - Blocking: Should block execution if errors

3. **Template Loading** - When loading templates
   - File: `workflow.py` route (templates endpoint)
   - Called: Could validate after parsing template JSON
   - Blocking: Currently not blocking (gap)

---

## Data Structure for Validation Results

When returning validation results via API:

```json
{
  "is_valid": false,
  "total_issues": 3,
  "errors": [
    {
      "severity": "error",
      "code": "CIRCULAR_DEPENDENCY",
      "message": "Circular dependency detected: node-1 -> node-2 -> node-1",
      "node_id": null,
      "details": {
        "cycle": ["node-1", "node-2", "node-1"]
      }
    }
  ],
  "warnings": [
    {
      "severity": "warning",
      "code": "DEAD_NODE",
      "message": "Node 'node-3' is unreachable",
      "node_id": "node-3",
      "details": null
    }
  ],
  "info": []
}
```

---

## Validation System Usage Examples

### Example 1: Validate a Workflow

```python
from app.services.workflow_validator import workflow_validator

workflow = await Workflow.get(object_id)
result = workflow_validator.validate_workflow(workflow)

if not result.is_valid:
    print("Validation failed!")
    for error in result.errors:
        print(f"  - {error.code}: {error.message}")
```

### Example 2: Check Specific Issues

```python
result = workflow_validator.validate_workflow(workflow)

# Check for circular dependencies
has_cycles = any(
    issue.code == "CIRCULAR_DEPENDENCY"
    for issue in result.errors
)

# Check for dead nodes
dead_nodes = [
    issue.node_id
    for issue in result.warnings
    if issue.code == "DEAD_NODE"
]
```

### Example 3: Frontend Display

```typescript
import { WorkflowValidation } from '@/components/builder/workflow-validation'

<WorkflowValidation 
  nodes={nodes} 
  edges={edges}
  onFixIssue={(issue) => {
    // Handle fix request
    if (issue.nodeId) {
      // Remove/reconnect the node
    }
  }}
/>
```

