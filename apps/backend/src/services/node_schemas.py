

from typing import Dict, List, Any, Union, Optional
from enum import Enum


class FieldType(str, Enum):
    STRING = "string"
    NUMBER = "number"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    OBJECT = "object"
    ARRAY = "array"
    URL = "url"
    EMAIL = "email"
    JSON = "json"
    CODE = "code"
    EXPRESSION = "expression"


class NodeSchema:
    """Schema definition for a node type"""
    def __init__(
        self,
        node_type: str,
        required_fields: List[str],
        optional_fields: List[str] = None,
        field_types: Dict[str, Union[FieldType, List[str]]] = None,
        field_descriptions: Dict[str, str] = None,
        field_defaults: Dict[str, Any] = None,
        input_schema: Optional[Dict[str, Any]] = None,
        output_schema: Optional[Dict[str, Any]] = None
    ):
        self.node_type = node_type
        self.required_fields = required_fields
        self.optional_fields = optional_fields or []
        self.field_types = field_types or {}
        self.field_descriptions = field_descriptions or {}
        self.field_defaults = field_defaults or {}
        self.input_schema = input_schema
        self.output_schema = output_schema

    def get_all_fields(self) -> List[str]:
        """Get all valid fields (required + optional)"""
        return self.required_fields + self.optional_fields


# Define base schemas
_HTTP_SCHEMA = NodeSchema(
    node_type="http",
    required_fields=["url", "method"],
    optional_fields=["headers", "body", "timeout", "retry_count", "auth"],
    field_types={
        "url": FieldType.URL,
        "method": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
        "headers": FieldType.OBJECT,
        "body": [FieldType.STRING, FieldType.OBJECT],
        "timeout": FieldType.INTEGER,
        "retry_count": FieldType.INTEGER,
        "auth": FieldType.OBJECT
    },
    field_descriptions={
        "url": "The URL to send the HTTP request to",
        "method": "HTTP method to use",
        "headers": "HTTP headers as key-value pairs",
        "body": "Request body (string or object)",
        "timeout": "Request timeout in seconds",
        "retry_count": "Number of retries on failure"
    },
    output_schema={
        "status": FieldType.INTEGER,
        "body": [FieldType.STRING, FieldType.OBJECT],
        "headers": FieldType.OBJECT
    }
)

# Node Schema Registry
NODE_SCHEMAS: Dict[str, NodeSchema] = {
    # HTTP Request Node
    "http": _HTTP_SCHEMA,
    "httpRequestNode": _HTTP_SCHEMA,  # Alias

    # Email Node
    "email": NodeSchema(
        node_type="email",
        required_fields=["to", "subject"],
        optional_fields=["body", "cc", "bcc", "attachments", "from"],
        field_types={
            "to": [FieldType.EMAIL, FieldType.ARRAY],
            "subject": FieldType.STRING,
            "body": FieldType.STRING,
            "cc": [FieldType.EMAIL, FieldType.ARRAY],
            "bcc": [FieldType.EMAIL, FieldType.ARRAY],
            "from": FieldType.EMAIL,
            "attachments": FieldType.ARRAY
        },
        field_descriptions={
            "to": "Recipient email address(es)",
            "subject": "Email subject line",
            "body": "Email body content",
            "cc": "CC recipients",
            "bcc": "BCC recipients"
        }
    ),

    # Database Node
    "database": NodeSchema(
        node_type="database",
        required_fields=["connection", "query"],
        optional_fields=["parameters", "timeout"],
        field_types={
            "connection": FieldType.STRING,
            "query": FieldType.STRING,
            "parameters": [FieldType.OBJECT, FieldType.ARRAY],
            "timeout": FieldType.INTEGER
        },
        field_descriptions={
            "connection": "Database connection string or reference",
            "query": "SQL query to execute",
            "parameters": "Query parameters"
        }
    ),

    # Transform Node
    "transform": NodeSchema(
        node_type="transform",
        required_fields=["expression"],
        optional_fields=["input_schema", "output_schema"],
        field_types={
            "expression": FieldType.EXPRESSION,
            "input_schema": FieldType.OBJECT,
            "output_schema": FieldType.OBJECT
        },
        field_descriptions={
            "expression": "Transformation expression or script"
        },
        input_schema={"data": [FieldType.OBJECT, FieldType.ARRAY]},
        output_schema={"result": [FieldType.OBJECT, FieldType.ARRAY]}
    ),

    # Condition/Conditional Node
    "condition": NodeSchema(
        node_type="condition",
        required_fields=["condition"],
        optional_fields=["true_label", "false_label"],
        field_types={
            "condition": FieldType.EXPRESSION,
            "true_label": FieldType.STRING,
            "false_label": FieldType.STRING
        },
        field_descriptions={
            "condition": "Boolean expression to evaluate"
        },
        input_schema={"input": [FieldType.OBJECT, FieldType.STRING, FieldType.NUMBER]},
        output_schema={"result": FieldType.BOOLEAN}
    ),

    # Loop Node
    "loop": NodeSchema(
        node_type="loop",
        required_fields=["items"],
        optional_fields=["max_iterations", "break_condition", "item_name"],
        field_types={
            "items": [FieldType.ARRAY, FieldType.EXPRESSION],
            "max_iterations": FieldType.INTEGER,
            "break_condition": FieldType.EXPRESSION,
            "item_name": FieldType.STRING
        },
        field_descriptions={
            "items": "Array to iterate over or expression that returns an array",
            "max_iterations": "Maximum number of iterations (safety limit)",
            "break_condition": "Expression to break the loop early"
        }
    ),

    # Delay Node
    "delay": NodeSchema(
        node_type="delay",
        required_fields=["duration"],
        optional_fields=["unit"],
        field_types={
            "duration": FieldType.NUMBER,
            "unit": ["seconds", "minutes", "hours", "days"]
        },
        field_descriptions={
            "duration": "How long to delay",
            "unit": "Time unit for duration"
        },
        field_defaults={
            "unit": "seconds"
        }
    ),

    # Webhook Node
    "webhook": NodeSchema(
        node_type="webhook",
        required_fields=["url"],
        optional_fields=["method", "headers", "body", "auth"],
        field_types={
            "url": FieldType.URL,
            "method": ["GET", "POST", "PUT"],
            "headers": FieldType.OBJECT,
            "body": [FieldType.STRING, FieldType.OBJECT],
            "auth": FieldType.OBJECT
        }
    ),

    "webhook_trigger": NodeSchema(
        node_type="webhook_trigger",
        required_fields=[],
        optional_fields=["path", "method", "auth_required"],
        field_types={
            "path": FieldType.STRING,
            "method": ["GET", "POST", "PUT", "DELETE"],
            "auth_required": FieldType.BOOLEAN
        }
    ),

    # LLM/AI Processor Node
    "llm": NodeSchema(
        node_type="llm",
        required_fields=["prompt"],
        optional_fields=["model", "temperature", "max_tokens", "system_prompt"],
        field_types={
            "prompt": FieldType.STRING,
            "model": FieldType.STRING,
            "temperature": FieldType.NUMBER,
            "max_tokens": FieldType.INTEGER,
            "system_prompt": FieldType.STRING
        },
        field_descriptions={
            "prompt": "The prompt to send to the LLM",
            "model": "Model identifier",
            "temperature": "Sampling temperature (0-1)",
            "max_tokens": "Maximum tokens to generate"
        }
    ),

    # Code Executor Node
    "code": NodeSchema(
        node_type="code",
        required_fields=["code"],
        optional_fields=["language", "timeout", "allowed_imports"],
        field_types={
            "code": FieldType.CODE,
            "language": ["python", "javascript", "typescript"],
            "timeout": FieldType.INTEGER,
            "allowed_imports": FieldType.ARRAY
        },
        field_descriptions={
            "code": "Code to execute",
            "language": "Programming language",
            "timeout": "Execution timeout in seconds"
        }
    ),

    # Data Source Node
    "data-source": NodeSchema(
        node_type="data-source",
        required_fields=["source_type"],
        optional_fields=["config", "cache_duration"],
        field_types={
            "source_type": ["api", "database", "file", "webhook"],
            "config": FieldType.OBJECT,
            "cache_duration": FieldType.INTEGER
        }
    ),

    # Filter Node
    "filter": NodeSchema(
        node_type="filter",
        required_fields=["condition"],
        optional_fields=["mode"],
        field_types={
            "condition": FieldType.EXPRESSION,
            "mode": ["include", "exclude"]
        },
        field_defaults={
            "mode": "include"
        }
    ),

    # Calculator Node
    "calculator": NodeSchema(
        node_type="calculator",
        required_fields=["operation"],
        optional_fields=["operands"],
        field_types={
            "operation": ["add", "subtract", "multiply", "divide", "power", "modulo"],
            "operands": FieldType.ARRAY
        }
    ),

    # Split Node
    "splitNode": NodeSchema(
        node_type="splitNode",
        required_fields=["split_type"],
        optional_fields=["branches", "condition"],
        field_types={
            "split_type": ["parallel", "conditional", "percentage"],
            "branches": FieldType.INTEGER,
            "condition": FieldType.EXPRESSION
        }
    ),

    # Merge Node
    "mergeNode": NodeSchema(
        node_type="mergeNode",
        required_fields=["merge_strategy"],
        optional_fields=["timeout", "wait_for_all"],
        field_types={
            "merge_strategy": ["first", "all", "any", "race"],
            "timeout": FieldType.INTEGER,
            "wait_for_all": FieldType.BOOLEAN
        },
        field_defaults={
            "merge_strategy": "all",
            "wait_for_all": True
        }
    ),

    # Logger Node
    "loggerNode": NodeSchema(
        node_type="loggerNode",
        required_fields=["message"],
        optional_fields=["level", "metadata"],
        field_types={
            "message": FieldType.STRING,
            "level": ["debug", "info", "warn", "error"],
            "metadata": FieldType.OBJECT
        },
        field_defaults={
            "level": "info"
        }
    ),

    # File Writer Node
    "file-writer": NodeSchema(
        node_type="file-writer",
        required_fields=["path", "content"],
        optional_fields=["encoding", "mode"],
        field_types={
            "path": FieldType.STRING,
            "content": [FieldType.STRING, FieldType.OBJECT],
            "encoding": ["utf-8", "ascii", "base64"],
            "mode": ["write", "append", "overwrite"]
        },
        field_defaults={
            "encoding": "utf-8",
            "mode": "write"
        }
    ),

    # Schedule Trigger
    "schedule": NodeSchema(
        node_type="schedule",
        required_fields=["cron"],
        optional_fields=["timezone", "enabled"],
        field_types={
            "cron": FieldType.STRING,
            "timezone": FieldType.STRING,
            "enabled": FieldType.BOOLEAN
        },
        field_defaults={
            "enabled": True,
            "timezone": "UTC"
        }
    ),

    # Start/End/Manual nodes (minimal config)
    "start": NodeSchema(
        node_type="start",
        required_fields=[],
        optional_fields=["label"]
    ),

    "end": NodeSchema(
        node_type="end",
        required_fields=[],
        optional_fields=["label", "output"]
    ),

    "manual": NodeSchema(
        node_type="manual",
        required_fields=[],
        optional_fields=["label", "description"]
    ),

    "trigger": NodeSchema(
        node_type="trigger",
        required_fields=["trigger_type"],
        optional_fields=["config"],
        field_types={
            "trigger_type": ["manual", "schedule", "webhook", "event"],
            "config": FieldType.OBJECT
        }
    ),

    "output": NodeSchema(
        node_type="output",
        required_fields=["output"],
        optional_fields=["format"],
        field_types={
            "output": [FieldType.OBJECT, FieldType.STRING],
            "format": ["json", "text", "xml"]
        }
    ),

    "success": NodeSchema(
        node_type="success",
        required_fields=[],
        optional_fields=["message", "output"]
    ),

    "error": NodeSchema(
        node_type="error",
        required_fields=[],
        optional_fields=["message", "error_code"]
    ),
}

# Add aliases for alternative node type names
NODE_SCHEMAS["emailSendNode"] = NODE_SCHEMAS["email"]
NODE_SCHEMAS["transformer"] = NODE_SCHEMAS["transform"]
NODE_SCHEMAS["conditionalNode"] = NODE_SCHEMAS["condition"]
NODE_SCHEMAS["loopNode"] = NODE_SCHEMAS["loop"]
NODE_SCHEMAS["codeExecutorNode"] = NODE_SCHEMAS["code"]
NODE_SCHEMAS["ai-processor"] = NODE_SCHEMAS["llm"]


def get_node_schema(node_type: str) -> Optional[NodeSchema]:
    """Get schema for a node type"""
    return NODE_SCHEMAS.get(node_type.lower())


def get_all_node_types() -> List[str]:
    """Get list of all registered node types"""
    return list(NODE_SCHEMAS.keys())
