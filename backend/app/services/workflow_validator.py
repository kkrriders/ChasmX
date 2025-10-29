"""
Workflow Validation Service
Validates workflow integrity before execution
"""

from typing import List, Dict, Set, Optional, Tuple, Any
from enum import Enum
from pydantic import BaseModel
from loguru import logger

from app.models import Workflow, Node, Edge
from .validation_rules import ValidationRules


class ValidationSeverity(str, Enum):
    ERROR = "error"  # Blocks execution
    WARNING = "warning"  # Allows execution but shows warning
    INFO = "info"  # Informational only


class ValidationIssue(BaseModel):
    """Represents a validation issue"""
    severity: ValidationSeverity
    code: str
    message: str
    node_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    suggestion: Optional[str] = None  # How to fix the issue
    affected_nodes: Optional[List[str]] = None  # Other nodes affected by this issue
    documentation_url: Optional[str] = None  # Link to documentation


class ValidationResult(BaseModel):
    """Result of workflow validation"""
    is_valid: bool
    errors: List[ValidationIssue] = []
    warnings: List[ValidationIssue] = []
    info: List[ValidationIssue] = []

    @property
    def has_errors(self) -> bool:
        return len(self.errors) > 0

    @property
    def has_warnings(self) -> bool:
        return len(self.warnings) > 0

    @property
    def total_issues(self) -> int:
        return len(self.errors) + len(self.warnings) + len(self.info)


class WorkflowValidator:
    """Validates workflow structure and configuration"""

    # Node types that require specific configurations
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

    # Node types that are valid starting points
    VALID_START_NODES = [
        "trigger",
        "manual",
        "schedule",
        "webhook_trigger",
        "http",
    ]

    # Node types that are valid ending points
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

    def __init__(self):
        pass

    def validate_workflow(self, workflow: Workflow) -> ValidationResult:
        """
        Comprehensive workflow validation
        Returns ValidationResult with all issues found
        """
        result = ValidationResult(is_valid=True)

        # Basic structure validation
        self._validate_basic_structure(workflow, result)

        # Check for empty workflow
        if not workflow.nodes or len(workflow.nodes) == 0:
            result.errors.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                code="EMPTY_WORKFLOW",
                message="Workflow has no nodes"
            ))
            result.is_valid = False
            return result

        # Circular dependency detection
        self._detect_circular_dependencies(workflow, result)

        # Dead node detection (unreachable nodes)
        self._detect_dead_nodes(workflow, result)

        # Validate node configurations (basic)
        self._validate_node_configs(workflow, result)

        # Validate node schemas (advanced)
        self._validate_node_schemas(workflow, result)

        # Validate edges
        self._validate_edges(workflow, result)

        # Check for start nodes
        self._validate_start_nodes(workflow, result)

        # Check for end nodes
        self._validate_end_nodes(workflow, result)

        # Validate node compatibility
        self._validate_node_compatibility(workflow, result)

        # Check for isolated nodes (no incoming or outgoing edges)
        self._detect_isolated_nodes(workflow, result)

        # Validate variable references
        self._validate_variable_references(workflow, result)

        # Validate resource limits
        self._validate_resource_limits(workflow, result)

        # Check for potential infinite loops
        self._check_infinite_loops(workflow, result)

        # Set overall validity
        result.is_valid = not result.has_errors

        return result

    def _validate_basic_structure(self, workflow: Workflow, result: ValidationResult):
        """Validate basic workflow structure"""
        if not workflow.name or len(workflow.name.strip()) == 0:
            result.warnings.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                code="MISSING_NAME",
                message="Workflow has no name"
            ))

        if workflow.edges is None:
            workflow.edges = []

        if workflow.variables is None:
            workflow.variables = []

    def _detect_circular_dependencies(self, workflow: Workflow, result: ValidationResult):
        """Detect circular dependencies using DFS"""
        # Build adjacency list
        graph: Dict[str, List[str]] = {node.id: [] for node in workflow.nodes}
        for edge in workflow.edges:
            if edge.from_ in graph:
                graph[edge.from_].append(edge.to)

        # Track visited nodes and recursion stack
        visited: Set[str] = set()
        rec_stack: Set[str] = set()
        cycle_path: List[str] = []

        def dfs(node_id: str, path: List[str]) -> bool:
            """DFS to detect cycles"""
            visited.add(node_id)
            rec_stack.add(node_id)
            path.append(node_id)

            # Check all neighbors
            for neighbor in graph.get(node_id, []):
                if neighbor not in visited:
                    if dfs(neighbor, path):
                        return True
                elif neighbor in rec_stack:
                    # Found a cycle
                    cycle_start = path.index(neighbor)
                    cycle_path.extend(path[cycle_start:])
                    cycle_path.append(neighbor)
                    return True

            rec_stack.remove(node_id)
            path.pop()
            return False

        # Check each node
        for node in workflow.nodes:
            if node.id not in visited:
                if dfs(node.id, []):
                    result.errors.append(ValidationIssue(
                        severity=ValidationSeverity.ERROR,
                        code="CIRCULAR_DEPENDENCY",
                        message=f"Circular dependency detected: {' -> '.join(cycle_path)}",
                        details={"cycle": cycle_path}
                    ))
                    break

    def _detect_dead_nodes(self, workflow: Workflow, result: ValidationResult):
        """Detect nodes that are unreachable from start nodes"""
        # Find all start nodes (nodes with no incoming edges)
        incoming_edges: Dict[str, int] = {node.id: 0 for node in workflow.nodes}
        for edge in workflow.edges:
            if edge.to in incoming_edges:
                incoming_edges[edge.to] += 1

        start_nodes = [node_id for node_id, count in incoming_edges.items() if count == 0]

        if not start_nodes:
            result.warnings.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                code="NO_START_NODE",
                message="No start node found (all nodes have incoming edges)"
            ))
            return

        # Build adjacency list
        graph: Dict[str, List[str]] = {node.id: [] for node in workflow.nodes}
        for edge in workflow.edges:
            if edge.from_ in graph:
                graph[edge.from_].append(edge.to)

        # BFS from all start nodes to find reachable nodes
        reachable: Set[str] = set()
        queue = start_nodes.copy()

        while queue:
            node_id = queue.pop(0)
            if node_id in reachable:
                continue

            reachable.add(node_id)

            # Add all neighbors to queue
            for neighbor in graph.get(node_id, []):
                if neighbor not in reachable:
                    queue.append(neighbor)

        # Find dead nodes
        all_node_ids = {node.id for node in workflow.nodes}
        dead_nodes = all_node_ids - reachable

        for node_id in dead_nodes:
            node = next((n for n in workflow.nodes if n.id == node_id), None)
            node_label = node_id if not node else f"{node_id} ({node.type})"

            result.warnings.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                code="DEAD_NODE",
                message=f"Node '{node_label}' is unreachable",
                node_id=node_id
            ))

    def _validate_node_configs(self, workflow: Workflow, result: ValidationResult):
        """Validate that nodes have required configuration fields"""
        for node in workflow.nodes:
            node_type = node.type.lower()

            # Check if node type requires specific config
            if node_type in self.REQUIRED_CONFIGS:
                required_fields = self.REQUIRED_CONFIGS[node_type]
                missing_fields = []

                for field in required_fields:
                    if field not in node.config or not node.config[field]:
                        missing_fields.append(field)

                if missing_fields:
                    result.errors.append(ValidationIssue(
                        severity=ValidationSeverity.ERROR,
                        code="MISSING_REQUIRED_FIELD",
                        message=f"Node '{node.id}' ({node.type}) is missing required fields: {', '.join(missing_fields)}",
                        node_id=node.id,
                        details={"missing_fields": missing_fields}
                    ))

            # Check for empty config
            if not node.config:
                result.info.append(ValidationIssue(
                    severity=ValidationSeverity.INFO,
                    code="EMPTY_CONFIG",
                    message=f"Node '{node.id}' ({node.type}) has no configuration",
                    node_id=node.id
                ))

    def _validate_edges(self, workflow: Workflow, result: ValidationResult):
        """Validate that all edges connect to existing nodes"""
        node_ids = {node.id for node in workflow.nodes}

        for i, edge in enumerate(workflow.edges):
            # Check if source node exists
            if edge.from_ not in node_ids:
                result.errors.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    code="INVALID_EDGE_SOURCE",
                    message=f"Edge {i} references non-existent source node: {edge.from_}",
                    details={"edge_index": i, "from": edge.from_, "to": edge.to}
                ))

            # Check if target node exists
            if edge.to not in node_ids:
                result.errors.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    code="INVALID_EDGE_TARGET",
                    message=f"Edge {i} references non-existent target node: {edge.to}",
                    details={"edge_index": i, "from": edge.from_, "to": edge.to}
                ))

            # Check for self-loops
            if edge.from_ == edge.to:
                result.warnings.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    code="SELF_LOOP",
                    message=f"Node '{edge.from_}' has a self-loop edge",
                    node_id=edge.from_
                ))

    def _validate_start_nodes(self, workflow: Workflow, result: ValidationResult):
        """Validate that workflow has appropriate start nodes"""
        # Find nodes with no incoming edges
        incoming_edges: Dict[str, int] = {node.id: 0 for node in workflow.nodes}
        for edge in workflow.edges:
            if edge.to in incoming_edges:
                incoming_edges[edge.to] += 1

        start_nodes = [
            node for node in workflow.nodes
            if incoming_edges[node.id] == 0
        ]

        if not start_nodes:
            result.errors.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                code="NO_START_NODE",
                message="Workflow has no start node (all nodes have incoming edges)"
            ))

        # Warn about non-standard start nodes
        for node in start_nodes:
            if node.type.lower() not in self.VALID_START_NODES:
                result.warnings.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    code="UNUSUAL_START_NODE",
                    message=f"Node '{node.id}' ({node.type}) is used as a start node but is not a typical starting point",
                    node_id=node.id
                ))

    def _validate_end_nodes(self, workflow: Workflow, result: ValidationResult):
        """Validate that workflow has appropriate end nodes"""
        # Find nodes with no outgoing edges
        outgoing_edges: Dict[str, int] = {node.id: 0 for node in workflow.nodes}
        for edge in workflow.edges:
            if edge.from_ in outgoing_edges:
                outgoing_edges[edge.from_] += 1

        end_nodes = [
            node for node in workflow.nodes
            if outgoing_edges[node.id] == 0
        ]

        if not end_nodes:
            result.warnings.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                code="NO_END_NODE",
                message="Workflow has no end node (all nodes have outgoing edges)"
            ))

        # Info about non-standard end nodes
        for node in end_nodes:
            if node.type.lower() not in self.VALID_END_NODES:
                result.info.append(ValidationIssue(
                    severity=ValidationSeverity.INFO,
                    code="UNUSUAL_END_NODE",
                    message=f"Node '{node.id}' ({node.type}) is used as an end node",
                    node_id=node.id
                ))

    def _validate_node_compatibility(self, workflow: Workflow, result: ValidationResult):
        """Validate that connected nodes are compatible"""
        # Build node map
        node_map: Dict[str, Node] = {node.id: node for node in workflow.nodes}

        # Check each edge for compatibility
        for edge in workflow.edges:
            source = node_map.get(edge.from_)
            target = node_map.get(edge.to)

            if not source or not target:
                continue  # Already reported in edge validation

            # Check specific incompatibilities
            source_type = source.type.lower()
            target_type = target.type.lower()

            # Example: condition nodes should have 2 outgoing edges (true/false paths)
            if source_type == "condition":
                outgoing_count = sum(1 for e in workflow.edges if e.from_ == source.id)
                if outgoing_count < 2:
                    result.warnings.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        code="INCOMPLETE_CONDITION",
                        message=f"Condition node '{source.id}' should have 2 outgoing edges (true/false paths)",
                        node_id=source.id
                    ))

    def _detect_isolated_nodes(self, workflow: Workflow, result: ValidationResult):
        """Detect nodes with no incoming or outgoing edges"""
        if not workflow.edges:
            # All nodes are isolated if there are no edges
            for node in workflow.nodes:
                result.warnings.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    code="ISOLATED_NODE",
                    message=f"Node '{node.id}' ({node.type}) has no connections",
                    node_id=node.id
                ))
            return

        # Count connections
        connections: Dict[str, Dict[str, int]] = {
            node.id: {"incoming": 0, "outgoing": 0}
            for node in workflow.nodes
        }

        for edge in workflow.edges:
            if edge.from_ in connections:
                connections[edge.from_]["outgoing"] += 1
            if edge.to in connections:
                connections[edge.to]["incoming"] += 1

        # Find isolated nodes
        for node in workflow.nodes:
            conn = connections[node.id]
            if conn["incoming"] == 0 and conn["outgoing"] == 0:
                result.warnings.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    code="ISOLATED_NODE",
                    message=f"Node '{node.id}' ({node.type}) has no connections",
                    node_id=node.id
                ))

    def _validate_variable_references(self, workflow: Workflow, result: ValidationResult):
        """Validate that variable references in node configs are valid"""
        # Get all defined variable names
        defined_vars = {var.name for var in workflow.variables}

        # Check each node's config for variable references
        for node in workflow.nodes:
            if not node.config:
                continue

            # Look for variable references (e.g., ${var_name} or {{var_name}})
            config_str = str(node.config)

            # Simple pattern matching for common variable syntaxes
            import re
            patterns = [
                r'\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}',  # ${var_name}
                r'\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}',  # {{var_name}}
            ]

            referenced_vars = set()
            for pattern in patterns:
                matches = re.findall(pattern, config_str)
                referenced_vars.update(matches)

            # Check if referenced variables are defined
            undefined_vars = referenced_vars - defined_vars
            if undefined_vars:
                result.warnings.append(ValidationIssue(
                    severity=ValidationSeverity.WARNING,
                    code="UNDEFINED_VARIABLE",
                    message=f"Node '{node.id}' references undefined variables: {', '.join(undefined_vars)}",
                    node_id=node.id,
                    details={"undefined_variables": list(undefined_vars)},
                    suggestion=f"Define these variables: {', '.join(undefined_vars)}"
                ))

    def _validate_node_schemas(self, workflow: Workflow, result: ValidationResult):
        """Validate node configurations against their schemas"""
        for node in workflow.nodes:
            issues = ValidationRules.validate_node_schema(node)

            for issue in issues:
                severity_str = issue.get("severity", "error")
                if severity_str == "error":
                    severity = ValidationSeverity.ERROR
                elif severity_str == "warning":
                    severity = ValidationSeverity.WARNING
                else:
                    severity = ValidationSeverity.INFO

                validation_issue = ValidationIssue(
                    severity=severity,
                    code="INVALID_NODE_SCHEMA",
                    message=issue["message"],
                    node_id=node.id,
                    suggestion=issue.get("suggestion"),
                    details=issue.get("details")
                )

                if severity == ValidationSeverity.ERROR:
                    result.errors.append(validation_issue)
                elif severity == ValidationSeverity.WARNING:
                    result.warnings.append(validation_issue)
                else:
                    result.info.append(validation_issue)

    def _validate_resource_limits(self, workflow: Workflow, result: ValidationResult):
        """Validate that workflow doesn't exceed resource limits"""
        limits = ValidationRules.LIMITS

        # Check node count
        node_count = len(workflow.nodes)
        if node_count > limits["max_nodes"]:
            result.errors.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                code="RESOURCE_LIMIT_EXCEEDED",
                message=f"Workflow has {node_count} nodes, exceeds limit of {limits['max_nodes']}",
                suggestion=f"Reduce number of nodes to {limits['max_nodes']} or less",
                details={"count": node_count, "limit": limits["max_nodes"]}
            ))

        # Check edge count
        edge_count = len(workflow.edges)
        if edge_count > limits["max_edges"]:
            result.errors.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                code="RESOURCE_LIMIT_EXCEEDED",
                message=f"Workflow has {edge_count} edges, exceeds limit of {limits['max_edges']}",
                suggestion=f"Reduce number of edges to {limits['max_edges']} or less",
                details={"count": edge_count, "limit": limits["max_edges"]}
            ))

        # Check variable count
        variable_count = len(workflow.variables)
        if variable_count > limits["max_variables"]:
            result.warnings.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                code="RESOURCE_LIMIT_EXCEEDED",
                message=f"Workflow has {variable_count} variables, exceeds recommended limit of {limits['max_variables']}",
                suggestion=f"Consider reducing number of variables",
                details={"count": variable_count, "limit": limits["max_variables"]}
            ))

        # Check graph depth
        depth = ValidationRules.calculate_graph_depth(workflow.nodes, workflow.edges)
        if depth > limits["max_depth"]:
            result.warnings.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                code="RESOURCE_LIMIT_EXCEEDED",
                message=f"Workflow depth is {depth}, exceeds recommended limit of {limits['max_depth']}",
                suggestion="Consider breaking workflow into smaller sub-workflows",
                details={"depth": depth, "limit": limits["max_depth"]}
            ))

        # Check config sizes
        for node in workflow.nodes:
            if node.config:
                import json
                config_size = len(json.dumps(node.config))
                if config_size > limits["max_config_size"]:
                    result.warnings.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        code="RESOURCE_LIMIT_EXCEEDED",
                        message=f"Node '{node.id}' config size ({config_size} bytes) exceeds recommended limit",
                        node_id=node.id,
                        suggestion="Consider storing large data in variables instead of node config",
                        details={"size": config_size, "limit": limits["max_config_size"]}
                    ))

    def _check_infinite_loops(self, workflow: Workflow, result: ValidationResult):
        """Check for potential infinite loops"""
        loop_issues = ValidationRules.detect_potential_infinite_loops(workflow.nodes, workflow.edges)

        for issue_data in loop_issues:
            result.warnings.append(ValidationIssue(
                severity=ValidationSeverity.WARNING,
                code="INFINITE_LOOP_RISK",
                message=issue_data["issue"],
                node_id=issue_data["node_id"],
                suggestion=issue_data["suggestion"]
            ))


# Global validator instance
workflow_validator = WorkflowValidator()
