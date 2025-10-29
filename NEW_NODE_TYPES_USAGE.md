# New Node Types Implementation - Usage Examples

This document provides examples of how to use the newly implemented node types in your workflows.

## Filter Nodes

Filter nodes provide conditional logic and data filtering capabilities.

### 1. Condition Filter
```json
{
  "id": "filter1",
  "type": "filter",
  "config": {
    "filter_type": "condition",
    "condition": "{{user_age}} >= 18"
  }
}
```

### 2. Array Filter
```json
{
  "id": "filter2", 
  "type": "filter",
  "config": {
    "filter_type": "array",
    "array_path": "users",
    "filter_condition": "{{item.score}} > 80"
  }
}
```

### 3. Object Field Filter
```json
{
  "id": "filter3",
  "type": "filter",
  "config": {
    "filter_type": "object",
    "include_fields": ["name", "email", "id"],
    "exclude_fields": ["password", "internal_data"]
  }
}
```

## Transformer Nodes

Transformer nodes handle data manipulation and restructuring.

### 1. Field Mapping
```json
{
  "id": "transform1",
  "type": "transformer",
  "config": {
    "transform_type": "map",
    "field_mappings": {
      "full_name": "name",
      "email_address": "email",
      "user_age": "age"
    },
    "copy_unmapped": false
  }
}
```

### 2. Type Conversion
```json
{
  "id": "transform2",
  "type": "transformer",
  "config": {
    "transform_type": "convert",
    "conversions": {
      "age": "integer",
      "score": "float",
      "active": "boolean",
      "tags": "array"
    }
  }
}
```

### 3. Data Aggregation
```json
{
  "id": "transform3",
  "type": "transformer",
  "config": {
    "transform_type": "aggregate",
    "operation": "count",
    "group_by": "department"
  }
}
```

### 4. Structure Flattening
```json
{
  "id": "transform4",
  "type": "transformer",
  "config": {
    "transform_type": "flatten",
    "max_depth": 2
  }
}
```

### 5. Data Merging
```json
{
  "id": "transform5",
  "type": "transformer",
  "config": {
    "transform_type": "merge",
    "merge_data": {"created_at": "{{timestamp}}", "version": "1.0"},
    "merge_strategy": "update"
  }
}
```

### 6. Field Extraction
```json
{
  "id": "transform6",
  "type": "transformer",
  "config": {
    "transform_type": "extract",
    "extract_paths": ["user.profile.name", "user.settings.theme", "metadata.version"]
  }
}
```

## Condition Nodes

Condition nodes provide branching logic for workflow control.

### 1. Simple Boolean Condition
```json
{
  "id": "condition1",
  "type": "condition",
  "config": {
    "condition_type": "simple",
    "condition": "{{user_age}} >= 18",
    "true_path": "adult_workflow",
    "false_path": "minor_workflow"
  }
}
```

### 2. Switch/Case Logic
```json
{
  "id": "condition2",
  "type": "condition",
  "config": {
    "condition_type": "switch",
    "switch_value": "{{user_role}}",
    "cases": {
      "admin": "admin_flow",
      "moderator": "mod_flow",
      "user": "user_flow"
    },
    "default_case": "guest_flow"
  }
}
```

### 3. Multi-Condition Logic
```json
{
  "id": "condition3",
  "type": "condition",
  "config": {
    "condition_type": "multi",
    "logic_operator": "AND",
    "conditions": [
      {"condition": "{{age}} >= 18", "weight": 1.0},
      {"condition": "{{verified}} == true", "weight": 1.0},
      {"condition": "{{score}} > 50", "weight": 0.5}
    ],
    "true_path": "approved",
    "false_path": "rejected"
  }
}
```

### 4. Range-Based Condition
```json
{
  "id": "condition4",
  "type": "condition",
  "config": {
    "condition_type": "range",
    "value": "{{score}}",
    "ranges": [
      {"min": 90, "max": 100, "node": "excellent"},
      {"min": 70, "max": 89, "node": "good"},
      {"min": 50, "max": 69, "node": "average"}
    ],
    "default_node": "poor"
  }
}
```

## Loop Nodes

Loop nodes provide iteration capabilities for repeated processing.

### 1. For Loop (Array Iteration)
```json
{
  "id": "loop1",
  "type": "loop",
  "config": {
    "loop_type": "for",
    "array_path": "users",
    "iterator_name": "current_user",
    "index_name": "user_index",
    "loop_action": "transform",
    "transform_expression": "Processing {{current_user.name}}"
  }
}
```

### 2. While Loop (Condition-Based)
```json
{
  "id": "loop2",
  "type": "loop",
  "config": {
    "loop_type": "while",
    "condition": "{{counter}} < {{max_items}}",
    "max_iterations": 100,
    "increment_variable": "counter",
    "increment_value": 1
  }
}
```

### 3. Range Loop (Numeric Range)
```json
{
  "id": "loop3",
  "type": "loop",
  "config": {
    "loop_type": "range",
    "start": 1,
    "end": 10,
    "step": 2,
    "counter_name": "i"
  }
}
```

## Example Workflow Using All New Node Types

```json
{
  "name": "Data Processing Pipeline",
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "config": {}
    },
    {
      "id": "filter_adults",
      "type": "filter",
      "config": {
        "filter_type": "array",
        "array_path": "users",
        "filter_condition": "{{item.age}} >= 18"
      }
    },
    {
      "id": "transform_users",
      "type": "transformer", 
      "config": {
        "transform_type": "map",
        "field_mappings": {
          "full_name": "name",
          "email_address": "email",
          "user_age": "age"
        }
      }
    },
    {
      "id": "check_role",
      "type": "condition",
      "config": {
        "condition_type": "switch",
        "switch_value": "{{user_role}}",
        "cases": {
          "premium": "premium_processing",
          "basic": "basic_processing"
        },
        "default_case": "default_processing"
      }
    },
    {
      "id": "process_batch",
      "type": "loop",
      "config": {
        "loop_type": "for",
        "array_path": "filtered_users",
        "iterator_name": "user",
        "loop_action": "transform"
      }
    },
    {
      "id": "end",
      "type": "end",
      "config": {}
    }
  ],
  "edges": [
    {"from": "start", "to": "filter_adults"},
    {"from": "filter_adults", "to": "transform_users"},
    {"from": "transform_users", "to": "check_role"},
    {"from": "check_role", "to": "process_batch"},
    {"from": "process_batch", "to": "end"}
  ]
}
```

## Features Implemented

### Security Features
- **Safe Expression Evaluation**: Only basic comparison operators allowed
- **Variable Interpolation**: Support for `{{variable}}` and `{{outputs.node_id}}` syntax
- **Input Validation**: Type checking and bounds checking for all operations

### Data Manipulation
- **Nested Path Support**: Use dot notation like `user.profile.name`
- **Type Conversion**: Automatic conversion between string, int, float, boolean, array
- **Aggregation Operations**: count, sum, average, min, max, first, last
- **Structure Operations**: flatten, merge, extract fields

### Control Flow
- **Conditional Logic**: Simple boolean, multi-condition with AND/OR/WEIGHTED
- **Branching**: Switch/case, range-based conditions
- **Iteration**: For loops, while loops, range loops with break conditions
- **Error Handling**: Graceful error handling with detailed error messages

All node types are now fully integrated into the workflow execution engine and ready for use!