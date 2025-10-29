# Workflow Validation System Design

## Overview
Enhanced validation system building on existing `workflow_validator.py` with additional validation rules, better error structure, and API integration.

## Current Implementation (v1.0)
Located in: `backend/app/services/workflow_validator.py`

### Existing Features ✓
- Circular dependency detection (DFS)
- Dead node detection (BFS)
- Required field validation
- Edge validation (invalid references)
- Start/End node validation
- Node compatibility checks
- Isolated node detection
- Variable reference validation

### Existing Models ✓
```python
ValidationSeverity: ERROR | WARNING | INFO
ValidationIssue: severity, code, message, node_id, details
ValidationResult: is_valid, errors, warnings, info
```

## Enhanced Validation System (v2.0)

### New Validation Rules to Add

#### 1. Node-Specific Schema Validation
**Status**: To Implement
**Purpose**: Validate node configurations against typed schemas

```python
NODE_SCHEMAS = {
    "http": {
        "required": ["url", "method"],
        "optional": ["headers", "body", "timeout"],
        "types": {
            "url": str,
            "method": ["GET", "POST", "PUT", "DELETE", "PATCH"],
            "timeout": int,
            "headers": dict
        }
    },
    "email": {
        "required": ["to", "subject"],
        "optional": ["body", "cc", "bcc", "attachments"],
        "types": {
            "to": [str, list],
            "subject": str,
            "body": str
        }
    }
    # ... more schemas
}
```

**Validation Checks**:
- Type checking for each field
- Enum validation for restricted values
- Range validation for numbers
- Format validation (URLs, emails, etc.)

#### 2. Enhanced Circular Dependency Detection
**Status**: Already Implemented ✓
**Enhancements**: Add cycle breaking suggestions

#### 3. Advanced Dead Node Detection
**Status**: Already Implemented ✓
**Enhancements**:
- Suggest connections for dead nodes
- Detect "almost dead" nodes (only 1 connection)

#### 4. Variable Type Compatibility
**Status**: To Implement
**Purpose**: Ensure variable references use correct types

```python
# Validate that node input types match variable output types
# Track data flow through the graph
```

**Example**:
- Node A outputs `number`
- Node B expects `string` input
- Validation ERROR if A → B without transformation

#### 5. Resource Limits Validation
**Status**: To Implement
**Purpose**: Prevent resource exhaustion

```python
LIMITS = {
    "max_nodes": 100,
    "max_edges": 500,
    "max_depth": 20,  # Max graph depth
    "max_loop_iterations": 1000,
    "max_variables": 50
}
```

#### 6. Security Validation
**Status**: To Implement
**Purpose**: Detect potential security issues

**Checks**:
- URL validation (no localhost/private IPs in production)
- Secret variable usage (marked as secret)
- Code injection patterns in expressions
- SQL injection patterns in queries

#### 7. Loop & Conditional Logic Validation
**Status**: Partial
**Enhancements**:

```python
# Loop nodes must have:
# - Items/collection to iterate
# - Loop body (subgraph)
# - Exit condition or max iterations

# Conditional nodes must have:
# - Condition expression
# - True and False branches
# - Both branches should eventually merge or end
```

#### 8. Data Flow Validation
**Status**: To Implement
**Purpose**: Track data dependencies

```python
# Ensure:
# - Required inputs are provided
# - Output references are valid
# - No undefined data access
# - Data transformations are valid
```

## Validation Error Structure

### Error Codes (Expanded)
```python
# Structure
"EMPTY_WORKFLOW"              # ERROR
"CIRCULAR_DEPENDENCY"         # ERROR
"DEAD_NODE"                   # WARNING
"MISSING_REQUIRED_FIELD"      # ERROR
"INVALID_EDGE_SOURCE"         # ERROR
"INVALID_EDGE_TARGET"         # ERROR
"SELF_LOOP"                   # WARNING
"NO_START_NODE"               # ERROR
"UNUSUAL_START_NODE"          # WARNING
"NO_END_NODE"                 # WARNING
"UNUSUAL_END_NODE"            # INFO
"INCOMPLETE_CONDITION"        # WARNING
"ISOLATED_NODE"               # WARNING
"UNDEFINED_VARIABLE"          # WARNING

# New Codes
"INVALID_FIELD_TYPE"          # ERROR
"INVALID_FIELD_VALUE"         # ERROR
"INVALID_URL_FORMAT"          # ERROR
"SECURITY_RISK"               # WARNING/ERROR
"RESOURCE_LIMIT_EXCEEDED"     # ERROR
"TYPE_MISMATCH"               # ERROR
"INVALID_LOOP_CONFIG"         # ERROR
"MISSING_LOOP_EXIT"           # WARNING
"DATA_DEPENDENCY_ERROR"       # ERROR
"INFINITE_LOOP_RISK"          # WARNING
```

### Enhanced ValidationIssue
```python
class ValidationIssue(BaseModel):
    severity: ValidationSeverity
    code: str
    message: str
    node_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

    # NEW FIELDS
    suggestion: Optional[str] = None  # How to fix
    affected_nodes: Optional[List[str]] = None  # Related nodes
    line_number: Optional[int] = None  # For code/expression errors
    documentation_url: Optional[str] = None  # Help link
```

## API Integration

### New Endpoints

#### 1. Validate Workflow
```python
POST /api/workflows/{id}/validate
GET /api/workflows/{id}/validate  # Get last validation result

Response:
{
    "is_valid": bool,
    "errors": [...],
    "warnings": [...],
    "info": [...],
    "timestamp": "ISO datetime",
    "validator_version": "2.0"
}
```

#### 2. Validate Before Save
```python
PUT /api/workflows/{id}
# Automatically validates before saving
# Returns validation results in response
```

#### 3. Validation Settings
```python
GET /api/workflows/validation/config
PUT /api/workflows/validation/config

{
    "enable_strict_mode": bool,
    "treat_warnings_as_errors": bool,
    "disabled_rules": ["UNUSUAL_END_NODE", ...],
    "resource_limits": {...}
}
```

## Implementation Plan

### Phase 1: Enhanced Error Structure ✓
- Add suggestion field
- Add affected_nodes field
- Add documentation_url field

### Phase 2: Node Schema Validation
- Define schemas for all node types
- Implement type checking
- Implement format validation
- Add to main validator

### Phase 3: Advanced Validations
- Variable type compatibility
- Data flow tracking
- Loop/conditional validation
- Resource limits

### Phase 4: Security Validation
- URL validation
- Secret detection
- Injection pattern detection

### Phase 5: API Integration
- Add validation endpoints
- Integrate with save/update
- Add validation caching
- WebSocket notifications

### Phase 6: Frontend Integration
- Display validation results in UI
- Highlight problematic nodes
- Show suggestions
- Real-time validation

## Testing Strategy

### Unit Tests
- Test each validation rule independently
- Test edge cases
- Test performance with large workflows

### Integration Tests
- Test full workflow validation
- Test API endpoints
- Test with real workflow data

### Performance Tests
- Validate workflows with 100+ nodes
- Measure validation time
- Optimize slow validators

## Files to Modify/Create

### Backend
- ✓ `backend/app/services/workflow_validator.py` (enhance)
- `backend/app/services/node_schemas.py` (new)
- `backend/app/services/validation_rules.py` (new)
- `backend/app/routes/workflow.py` (add endpoints)
- `backend/app/routes/validation.py` (new)

### Frontend
- `Client/components/builder/workflow-validation.tsx` (enhance)
- `Client/types/validation.ts` (new)
- `Client/hooks/useWorkflowValidation.ts` (new)

### Tests
- `backend/tests/test_workflow_validator.py` (new)
- `backend/tests/test_validation_rules.py` (new)

## Success Criteria
- ✓ All existing validations still work
- All new validation rules implemented
- API endpoints functional
- Frontend displays results
- Tests pass with >90% coverage
- Documentation complete
