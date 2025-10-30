"""
Advanced Validation Rules
Additional validation logic for workflows
"""

import re
from typing import Dict, Any, List, Set, Optional
from urllib.parse import urlparse
from loguru import logger

from .node_schemas import get_node_schema, FieldType


class ValidationRules:
    """Collection of validation rules"""

    # Resource limits
    LIMITS = {
        "max_nodes": 100,
        "max_edges": 500,
        "max_depth": 20,
        "max_loop_iterations": 10000,
        "max_variables": 100,
        "max_config_size": 1024 * 10,  # 10KB per config
    }

    # Security patterns
    SECURITY_PATTERNS = {
        "sql_injection": [
            r"(\bUNION\b.*\bSELECT\b)",
            r"(\bDROP\b.*\bTABLE\b)",
            r"(;.*--)",
            r"('.*OR.*'=')",
        ],
        "code_injection": [
            r"(__import__|eval|exec)\s*\(",
            r"os\.system\s*\(",
            r"subprocess\.(call|run|Popen)",
        ],
        "command_injection": [
            r"[;&|`$]",
            r"\$\(.*\)",
            r"`.*`",
        ]
    }

    @staticmethod
    def validate_field_type(value: Any, expected_type: Any) -> tuple[bool, Optional[str]]:
        """
        Validate that a field value matches the expected type
        Returns (is_valid, error_message)
        """
        # Handle enum types (list of allowed values)
        if isinstance(expected_type, list):
            if value not in expected_type:
                return False, f"Value must be one of: {', '.join(map(str, expected_type))}"
            return True, None

        # Handle FieldType enum
        if isinstance(expected_type, FieldType):
            if expected_type == FieldType.STRING:
                if not isinstance(value, str):
                    return False, "Must be a string"

            elif expected_type == FieldType.NUMBER:
                if not isinstance(value, (int, float)):
                    return False, "Must be a number"

            elif expected_type == FieldType.INTEGER:
                if not isinstance(value, int):
                    return False, "Must be an integer"

            elif expected_type == FieldType.BOOLEAN:
                if not isinstance(value, bool):
                    return False, "Must be a boolean"

            elif expected_type == FieldType.OBJECT:
                if not isinstance(value, dict):
                    return False, "Must be an object"

            elif expected_type == FieldType.ARRAY:
                if not isinstance(value, list):
                    return False, "Must be an array"

            elif expected_type == FieldType.URL:
                is_valid, error = ValidationRules.validate_url(value)
                if not is_valid:
                    return False, error

            elif expected_type == FieldType.EMAIL:
                is_valid, error = ValidationRules.validate_email(value)
                if not is_valid:
                    return False, error

            elif expected_type in [FieldType.JSON, FieldType.CODE, FieldType.EXPRESSION]:
                if not isinstance(value, str):
                    return False, "Must be a string"

        return True, None

    @staticmethod
    def validate_url(url: str) -> tuple[bool, Optional[str]]:
        """Validate URL format"""
        if not isinstance(url, str):
            return False, "URL must be a string"

        # Allow variable references
        if url.startswith("{{") or url.startswith("${"):
            return True, None

        try:
            result = urlparse(url)
            if not result.scheme:
                return False, "URL must have a scheme (http:// or https://)"
            if not result.netloc:
                return False, "URL must have a domain"
            if result.scheme not in ["http", "https", "ws", "wss"]:
                return False, f"Unsupported URL scheme: {result.scheme}"
            return True, None
        except Exception as e:
            return False, f"Invalid URL format: {str(e)}"

    @staticmethod
    def validate_email(email: str) -> tuple[bool, Optional[str]]:
        """Validate email format"""
        if not isinstance(email, str):
            return False, "Email must be a string"

        # Allow variable references
        if email.startswith("{{") or email.startswith("${"):
            return True, None

        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            return False, "Invalid email format"
        return True, None

    @staticmethod
    def check_security_patterns(value: str, context: str = "general") -> List[str]:
        """
        Check for security patterns in string values
        Returns list of detected issues
        """
        issues = []

        if not isinstance(value, str):
            return issues

        # Check SQL injection patterns
        if context in ["database", "query", "general"]:
            for pattern in ValidationRules.SECURITY_PATTERNS["sql_injection"]:
                if re.search(pattern, value, re.IGNORECASE):
                    issues.append("Potential SQL injection pattern detected")
                    break

        # Check code injection patterns
        if context in ["code", "expression", "general"]:
            for pattern in ValidationRules.SECURITY_PATTERNS["code_injection"]:
                if re.search(pattern, value, re.IGNORECASE):
                    issues.append("Potential code injection pattern detected")
                    break

        # Check command injection patterns
        if context in ["code", "command", "general"]:
            for pattern in ValidationRules.SECURITY_PATTERNS["command_injection"]:
                if re.search(pattern, value):
                    issues.append("Potential command injection pattern detected")
                    break

        return issues

    @staticmethod
    def check_private_ip(url: str) -> bool:
        """Check if URL points to private IP"""
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname

            if not hostname:
                return False

            # Check for localhost variants
            localhost_patterns = ["localhost", "127.0.0.1", "0.0.0.0", "::1"]
            if hostname.lower() in localhost_patterns:
                return True

            # Check for private IP ranges
            import ipaddress
            try:
                ip = ipaddress.ip_address(hostname)
                return ip.is_private or ip.is_loopback
            except ValueError:
                # Not an IP address, could be a domain
                pass

        except Exception:
            pass

        return False

    @staticmethod
    def validate_cron(cron: str) -> tuple[bool, Optional[str]]:
        """Validate cron expression"""
        if not isinstance(cron, str):
            return False, "Cron expression must be a string"

        # Allow variable references
        if cron.startswith("{{") or cron.startswith("${"):
            return True, None

        parts = cron.split()
        if len(parts) not in [5, 6]:
            return False, "Cron expression must have 5 or 6 fields"

        # Basic validation (not exhaustive)
        for part in parts:
            if part not in ["*", "?"] and not re.match(r'^[\d\-,/]+$', part):
                return False, f"Invalid cron field: {part}"

        return True, None

    @staticmethod
    def validate_json(value: str) -> tuple[bool, Optional[str]]:
        """Validate JSON string"""
        if not isinstance(value, str):
            return False, "JSON must be a string"

        # Allow variable references
        if value.startswith("{{") or value.startswith("${"):
            return True, None

        try:
            import json
            json.loads(value)
            return True, None
        except json.JSONDecodeError as e:
            return False, f"Invalid JSON: {str(e)}"

    @staticmethod
    def calculate_graph_depth(nodes: List[Any], edges: List[Any]) -> int:
        """Calculate maximum depth of the workflow graph"""
        if not nodes or not edges:
            return 0

        # Build adjacency list
        graph: Dict[str, List[str]] = {node.id: [] for node in nodes}
        in_degree: Dict[str, int] = {node.id: 0 for node in nodes}

        for edge in edges:
            if edge.from_ in graph:
                graph[edge.from_].append(edge.to)
            if edge.to in in_degree:
                in_degree[edge.to] += 1

        # Find start nodes (nodes with no incoming edges)
        start_nodes = [node_id for node_id, degree in in_degree.items() if degree == 0]

        if not start_nodes:
            return 0

        # BFS to calculate max depth
        max_depth = 0
        queue = [(node_id, 0) for node_id in start_nodes]
        visited = set()

        while queue:
            node_id, depth = queue.pop(0)

            if node_id in visited:
                continue

            visited.add(node_id)
            max_depth = max(max_depth, depth)

            for neighbor in graph.get(node_id, []):
                queue.append((neighbor, depth + 1))

        return max_depth

    @staticmethod
    def detect_potential_infinite_loops(nodes: List[Any], edges: List[Any]) -> List[Dict[str, Any]]:
        """
        Detect potential infinite loops
        Returns list of suspicious loop configurations
        """
        issues = []

        # Build adjacency list
        graph: Dict[str, List[str]] = {node.id: [] for node in nodes}
        for edge in edges:
            if edge.from_ in graph:
                graph[edge.from_].append(edge.to)

        # Find loop nodes
        loop_nodes = [node for node in nodes if node.type.lower() in ["loop", "loopnode"]]

        for loop_node in loop_nodes:
            config = loop_node.config or {}

            # Check if loop has max_iterations set
            if "max_iterations" not in config:
                issues.append({
                    "node_id": loop_node.id,
                    "issue": "Loop node has no max_iterations limit",
                    "suggestion": "Set max_iterations to prevent infinite loops"
                })
            else:
                max_iter = config.get("max_iterations")
                if isinstance(max_iter, int) and max_iter > ValidationRules.LIMITS["max_loop_iterations"]:
                    issues.append({
                        "node_id": loop_node.id,
                        "issue": f"max_iterations ({max_iter}) exceeds limit ({ValidationRules.LIMITS['max_loop_iterations']})",
                        "suggestion": f"Reduce max_iterations to {ValidationRules.LIMITS['max_loop_iterations']} or less"
                    })

            # Check if loop has break condition
            if "break_condition" not in config and "max_iterations" not in config:
                issues.append({
                    "node_id": loop_node.id,
                    "issue": "Loop has neither break_condition nor max_iterations",
                    "suggestion": "Add break_condition or max_iterations to ensure loop termination"
                })

        return issues

    @staticmethod
    def validate_node_schema(node: Any) -> List[Dict[str, Any]]:
        """
        Validate node configuration against its schema
        Returns list of validation issues
        """
        issues = []
        schema = get_node_schema(node.type)

        if not schema:
            # Unknown node type - return info
            return [{
                "severity": "info",
                "message": f"No schema defined for node type: {node.type}",
                "suggestion": "This node type may not be validated"
            }]

        config = node.config or {}

        # Check required fields
        for field in schema.required_fields:
            if field not in config or config[field] is None or config[field] == "":
                issues.append({
                    "severity": "error",
                    "message": f"Missing required field: {field}",
                    "suggestion": f"Add '{field}' to node configuration"
                })

        # Validate field types
        for field, value in config.items():
            if value is None or value == "":
                continue

            expected_type = schema.field_types.get(field)
            if expected_type:
                # Handle union types (list of types)
                if isinstance(expected_type, list) and not isinstance(expected_type[0], str):
                    # List of FieldTypes
                    valid = False
                    errors = []
                    for field_type in expected_type:
                        is_valid, error = ValidationRules.validate_field_type(value, field_type)
                        if is_valid:
                            valid = True
                            break
                        errors.append(error)

                    if not valid:
                        issues.append({
                            "severity": "error",
                            "message": f"Invalid type for field '{field}': {errors[0]}",
                            "suggestion": f"Accepted types: {', '.join(str(t) for t in expected_type)}"
                        })
                else:
                    is_valid, error = ValidationRules.validate_field_type(value, expected_type)
                    if not is_valid:
                        issues.append({
                            "severity": "error",
                            "message": f"Invalid value for field '{field}': {error}",
                            "suggestion": schema.field_descriptions.get(field, "Check field documentation")
                        })

        # Check for unknown fields (warning)
        all_valid_fields = set(schema.get_all_fields())
        for field in config.keys():
            if field not in all_valid_fields:
                issues.append({
                    "severity": "warning",
                    "message": f"Unknown field: {field}",
                    "suggestion": f"Valid fields: {', '.join(schema.get_all_fields())}"
                })

        # Security checks for specific field types
        for field, value in config.items():
            if isinstance(value, str):
                # Determine context based on field name
                context = "general"
                if field in ["query", "sql"]:
                    context = "database"
                elif field in ["code", "script"]:
                    context = "code"
                elif field in ["command", "cmd"]:
                    context = "command"

                security_issues = ValidationRules.check_security_patterns(value, context)
                for issue in security_issues:
                    issues.append({
                        "severity": "warning",
                        "message": f"Security concern in field '{field}': {issue}",
                        "suggestion": "Review and sanitize this value"
                    })

        # Special validation for URL fields
        url_fields = ["url", "webhook", "endpoint"]
        for field in url_fields:
            if field in config:
                url = config[field]
                if isinstance(url, str) and not url.startswith(("{{", "${")):
                    if ValidationRules.check_private_ip(url):
                        issues.append({
                            "severity": "warning",
                            "message": f"URL points to private/local address: {url}",
                            "suggestion": "Ensure this is intentional for development/testing"
                        })

        return issues
