# Workflow Validation System - Quick Start Guide

## Overview
The validation system checks workflows for errors, security issues, and best practices before execution.

## Quick API Reference

### 1. Validate Existing Workflow
```bash
POST /api/workflows/{workflow_id}/validate
```

**Response:**
```json
{
  "is_valid": true,
  "errors": [],
  "warnings": [
    {
      "severity": "warning",
      "code": "DEAD_NODE",
      "message": "Node 'node-5' is unreachable",
      "node_id": "node-5",
      "suggestion": "Connect this node to the workflow or remove it"
    }
  ],
  "info": []
}
```

### 2. Real-time Validation (No Save)
```bash
POST /api/workflows/validate
Content-Type: application/json

{
  "name": "My Workflow",
  "nodes": [...],
  "edges": [...],
  "variables": [],
  "metadata": {}
}
```

### 3. Get Validation Config
```bash
GET /api/workflows/validation/config
```

**Response:**
```json
{
  "limits": {
    "max_nodes": 100,
    "max_edges": 500,
    "max_depth": 20,
    "max_loop_iterations": 10000,
    "max_variables": 100,
    "max_config_size": 10240
  },
  "supported_node_types": ["http", "email", "database", ...],
  "validation_rules": ["circular_dependency", "dead_nodes", ...]
}
```

## Frontend Integration

### Using the Hook
```tsx
import { useWorkflowValidation } from '@/hooks/useWorkflowValidation'

function MyComponent() {
  const {
    validationResult,
    isValidating,
    validateWorkflow,
    isValid,
    hasErrors,
    hasWarnings
  } = useWorkflowValidation(workflow, {
    autoValidate: true,  // Auto-validate on changes
    debounceMs: 500      // Wait 500ms after last change
  })

  return (
    <div>
      {isValidating && <div>Validating...</div>}
      {hasErrors && <div>❌ Workflow has errors</div>}
      {hasWarnings && <div>⚠️ Workflow has warnings</div>}
      {isValid && <div>✅ Workflow is valid</div>}
    </div>
  )
}
```

### Using the Component
```tsx
import { ValidationPanel } from '@/components/validation/ValidationPanel'

function WorkflowBuilder() {
  const { validationResult } = useWorkflowValidation(workflow)

  return (
    <div>
      <ValidationPanel
        validationResult={validationResult}
        onNodeClick={(nodeId) => {
          // Focus the problematic node in the canvas
          focusNode(nodeId)
        }}
        onClose={() => {
          // Close the panel
        }}
      />
    </div>
  )
}
```

## Common Validation Issues

### 1. Missing Required Fields
**Error**: "Node 'http-1' (http) is missing required fields: url"
**Fix**: Add the required field to node config
```json
{
  "id": "http-1",
  "type": "http",
  "config": {
    "url": "https://api.example.com",  // ✅ Add this
    "method": "GET"
  }
}
```

### 2. Circular Dependency
**Error**: "Circular dependency detected: node-1 -> node-2 -> node-1"
**Fix**: Remove the circular connection or add a condition to break the loop

### 3. Dead Nodes
**Warning**: "Node 'node-5' is unreachable"
**Fix**: Connect the node to the workflow or remove it

### 4. Infinite Loop Risk
**Warning**: "Loop node has no max_iterations limit"
**Fix**: Add max_iterations to prevent infinite loops
```json
{
  "id": "loop-1",
  "type": "loop",
  "config": {
    "items": "{{data}}",
    "max_iterations": 1000  // ✅ Add this
  }
}
```

### 5. Undefined Variable
**Warning**: "Node 'http-1' references undefined variables: api_key"
**Fix**: Define the variable or fix the reference
```json
{
  "variables": [
    {
      "id": "var-1",
      "name": "api_key",  // ✅ Define this
      "value": "secret-key",
      "type": "string",
      "scope": "workflow"
    }
  ]
}
```

### 6. Invalid URL Format
**Error**: "Invalid value for field 'url': URL must have a scheme"
**Fix**: Use proper URL format
```json
{
  "url": "https://api.example.com"  // ✅ Include https://
}
```

### 7. Invalid Email Format
**Error**: "Invalid value for field 'to': Invalid email format"
**Fix**: Use proper email format
```json
{
  "to": "user@example.com"  // ✅ Valid email
}
```

## Supported Node Types

The system validates 30+ node types. Each has specific required fields:

| Node Type | Required Fields | Optional Fields |
|-----------|----------------|-----------------|
| `http`, `httpRequestNode` | url, method | headers, body, timeout |
| `email`, `emailSendNode` | to, subject | body, cc, bcc |
| `database` | connection, query | parameters, timeout |
| `transform`, `transformer` | expression | input_schema, output_schema |
| `condition`, `conditionalNode` | condition | true_label, false_label |
| `loop`, `loopNode` | items | max_iterations, break_condition |
| `delay` | duration | unit |
| `llm`, `ai-processor` | prompt | model, temperature, max_tokens |
| `code`, `codeExecutorNode` | code | language, timeout |

See `backend/app/services/node_schemas.py` for complete list.

## Resource Limits

Default limits (configurable):
- **Max Nodes**: 100 nodes per workflow
- **Max Edges**: 500 connections per workflow
- **Max Depth**: 20 levels of nesting
- **Max Loop Iterations**: 10,000 per loop
- **Max Variables**: 100 variables per workflow
- **Max Config Size**: 10KB per node config

## Security Checks

The validator detects potential security issues:
- ✅ SQL injection patterns
- ✅ Code injection patterns
- ✅ Command injection patterns
- ✅ Private IP/localhost in production URLs
- ✅ Unsanitized user input

## Validation Modes

### 1. On-Save Validation (Default)
Workflows are validated automatically when saved via PUT endpoint.

Disable with query parameter:
```bash
PUT /api/workflows/{id}?validate=false
```

### 2. Manual Validation
Validate anytime without saving:
```bash
POST /api/workflows/{id}/validate
```

### 3. Real-time Validation
Validate as users build workflows:
```tsx
useWorkflowValidation(workflow, { autoValidate: true })
```

## Error Severity Levels

### Error (🔴 Red)
Blocks workflow execution. Must be fixed.
- Missing required fields
- Invalid edges
- Circular dependencies
- Resource limit exceeded

### Warning (🟡 Yellow)
Allows execution but may cause issues.
- Dead nodes
- Undefined variables
- Infinite loop risks
- Security concerns

### Info (🔵 Blue)
Informational only. No action required.
- Unusual node types
- Node has no configuration

## Tips for Best Results

1. **Enable Auto-Validation**: Catch issues early while building
2. **Fix Errors First**: Warnings can wait, but fix errors immediately
3. **Review Suggestions**: Every issue includes actionable suggestions
4. **Check Security Warnings**: Don't ignore security-related warnings
5. **Stay Within Limits**: Keep workflows under resource limits for best performance
6. **Test Loops**: Always set max_iterations on loop nodes
7. **Define Variables**: Define all variables before referencing them

## Need Help?

- **Design Doc**: See `VALIDATION_DESIGN.md` for architecture details
- **Implementation**: See `VALIDATION_IMPLEMENTATION_SUMMARY.md` for complete implementation details
- **Source Code**:
  - Backend: `backend/app/services/workflow_validator.py`
  - Schemas: `backend/app/services/node_schemas.py`
  - Rules: `backend/app/services/validation_rules.py`
  - Frontend: `Client/hooks/useWorkflowValidation.ts`
  - UI: `Client/components/validation/ValidationPanel.tsx`
