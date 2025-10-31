
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from loguru import logger
import json
import re

from ..llm.base import LLMRequest, LLMMessage, ModelRole


class WorkflowIntent(BaseModel):
    """Parsed intent from user's description"""
    goal: str = Field(..., description="Primary goal of the workflow")
    trigger_type: str = Field(..., description="How the workflow starts")
    actions: List[str] = Field(..., description="List of actions to perform")
    conditions: List[str] = Field(default_factory=list, description="Conditional logic")
    data_transformations: List[str] = Field(default_factory=list, description="Data transformations needed")
    integrations: List[str] = Field(default_factory=list, description="External services to integrate")


class NodeCandidate(BaseModel):
    """Candidate node for the workflow"""
    id: str
    type: str
    label: str
    description: str
    config: Dict[str, Any]
    requirements: List[str] = Field(default_factory=list)
    position: Dict[str, int]


class WorkflowPlan(BaseModel):
    """Complete workflow plan before generation"""
    name: str
    description: str
    intent: WorkflowIntent
    nodes: List[NodeCandidate]
    edges: List[Dict[str, str]]
    validation_notes: List[str] = Field(default_factory=list)
    optimization_suggestions: List[str] = Field(default_factory=list)


class WorkflowGeneratorAgent:
    """
    Advanced workflow generation agent with multi-step reasoning.

    Process:
    1. Analyze intent from user prompt
    2. Select appropriate nodes
    3. Configure each node
    4. Create edges (connections)
    5. Validate the workflow
    6. Optimize and suggest improvements
    """

    # Available node types and their descriptions
    NODE_TYPES = {
        "trigger": {
            "webhook": "Receives HTTP requests from external services",
            "schedule": "Runs on a schedule (cron, interval)",
            "email": "Triggers when email is received",
            "file_watch": "Monitors file/folder for changes",
            "database_watch": "Monitors database for changes",
            "manual": "Manual trigger by user"
        },
        "action": {
            "http_request": "Makes HTTP/API calls",
            "send_email": "Sends emails via SMTP",
            "slack_message": "Sends Slack messages",
            "discord_message": "Sends Discord messages",
            "database_query": "Queries database (read/write)",
            "file_operation": "File read/write/delete",
            "run_code": "Executes custom code (Python/JS)",
            "llm_call": "Calls LLM for AI processing",
            "transform_data": "Transforms/maps data",
            "wait": "Waits for specified duration"
        },
        "condition": {
            "if_else": "Conditional branching",
            "switch": "Multi-way branching",
            "filter": "Filters data based on criteria",
            "loop": "Iterates over items"
        },
        "transform": {
            "json_parser": "Parses JSON data",
            "xml_parser": "Parses XML data",
            "csv_parser": "Parses CSV data",
            "aggregate": "Aggregates/reduces data",
            "merge": "Merges multiple data sources",
            "split": "Splits data into parts"
        }
    }

    def __init__(self, llm_service):
        """
        Initialize workflow generator agent.

        Args:
            llm_service: LLM service for AI generation
        """
        self.llm_service = llm_service

    async def generate_workflow(
        self,
        prompt: str,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], str, str]:
        """
        Generate workflow using multi-step reasoning.

        Args:
            prompt: User's natural language description
            user_context: Optional context (previous workflows, preferences, etc.)

        Returns:
            Tuple of (workflow_dict, summary, reasoning)
        """
        logger.info(f"Starting workflow generation for prompt: {prompt[:100]}...")

        try:
            # Step 1: Analyze Intent
            intent = await self._analyze_intent(prompt)
            logger.info(f"Intent analyzed: goal={intent.goal}, trigger={intent.trigger_type}")

            # Step 2: Create Workflow Plan
            plan = await self._create_workflow_plan(prompt, intent)
            logger.info(f"Workflow plan created with {len(plan.nodes)} nodes")

            # Step 3: Generate Node Configurations
            configured_nodes = await self._configure_nodes(plan.nodes, prompt, intent)
            logger.info(f"Configured {len(configured_nodes)} nodes")

            # Step 4: Create Edges (Connections)
            edges = await self._create_edges(configured_nodes, intent)
            logger.info(f"Created {len(edges)} edges")

            # Step 5: Validate Workflow
            validation_notes = await self._validate_workflow(configured_nodes, edges, intent)
            logger.info(f"Validation complete: {len(validation_notes)} notes")

            # Step 6: Optimize and Generate Summary
            optimization_suggestions = await self._optimize_workflow(configured_nodes, edges, intent)
            summary, reasoning = self._generate_summary(prompt, intent, configured_nodes, edges, validation_notes, optimization_suggestions)

            # Build final workflow structure
            workflow = {
                "name": plan.name,
                "description": plan.description,
                "nodes": [self._node_to_dict(node) for node in configured_nodes],
                "edges": edges,
                "metadata": {
                    "generated_by": "workflow_generator_agent",
                    "intent": intent.dict(),
                    "validation_notes": validation_notes,
                    "optimization_suggestions": optimization_suggestions
                }
            }

            logger.info("Workflow generation complete")
            return workflow, summary, reasoning

        except Exception as e:
            logger.error(f"Workflow generation failed: {e}", exc_info=True)
            raise

    async def _analyze_intent(self, prompt: str) -> WorkflowIntent:
        """
        Step 1: Analyze user's intent from the prompt.

        Args:
            prompt: User's description

        Returns:
            Parsed WorkflowIntent
        """
        system_message = LLMMessage(
            role="system",
            content="""You are an expert at analyzing workflow requirements. Analyze the user's prompt and extract:
1. The primary goal
2. How the workflow should be triggered
3. What actions should be performed
4. Any conditional logic needed
5. Data transformations required
6. External services/integrations mentioned

Return ONLY valid JSON in this format:
{
  "goal": "brief description of primary goal",
  "trigger_type": "webhook|schedule|email|manual|file_watch",
  "actions": ["action1", "action2"],
  "conditions": ["condition1"],
  "data_transformations": ["transform1"],
  "integrations": ["service1", "service2"]
}"""
        )

        user_message = LLMMessage(
            role="user",
            content=f"Analyze this workflow requirement: {prompt}"
        )

        llm_request = LLMRequest(
            messages=[system_message, user_message],
            model_id="meta-llama/llama-3.3-70b-instruct:free",  # Use reasoning model
            temperature=0.3,  # Lower for more focused analysis
            max_tokens=1000,
            use_cache=True
        )

        response = await self.llm_service.complete(llm_request)

        # Parse JSON from response
        try:
            # Extract JSON
            json_match = re.search(r'\{[\s\S]*\}', response.content)
            if json_match:
                intent_data = json.loads(json_match.group(0))
                return WorkflowIntent(**intent_data)
        except Exception as e:
            logger.warning(f"Failed to parse intent JSON: {e}")

        # Fallback intent
        return WorkflowIntent(
            goal=prompt[:100],
            trigger_type="manual",
            actions=["process_request"],
            conditions=[],
            data_transformations=[],
            integrations=[]
        )

    async def _create_workflow_plan(self, prompt: str, intent: WorkflowIntent) -> WorkflowPlan:
        """
        Step 2: Create a high-level plan for the workflow.

        Args:
            prompt: Original prompt
            intent: Analyzed intent

        Returns:
            WorkflowPlan
        """
        # Determine workflow name and description
        name = self._generate_workflow_name(intent.goal)
        description = prompt[:200]

        # Select nodes based on intent
        nodes = []
        x_pos = 100
        y_pos = 100

        # Add trigger node
        trigger_node = NodeCandidate(
            id="trigger_1",
            type="trigger",
            label=f"{intent.trigger_type.title()} Trigger",
            description=f"Starts workflow via {intent.trigger_type}",
            config={},
            position={"x": x_pos, "y": y_pos}
        )
        nodes.append(trigger_node)
        y_pos += 150

        # Add action nodes
        for i, action in enumerate(intent.actions, 1):
            action_node = NodeCandidate(
                id=f"action_{i}",
                type="action",
                label=action.title(),
                description=f"Performs: {action}",
                config={},
                position={"x": x_pos, "y": y_pos}
            )
            nodes.append(action_node)
            y_pos += 150

        # Add condition nodes if needed
        for i, condition in enumerate(intent.conditions, 1):
            condition_node = NodeCandidate(
                id=f"condition_{i}",
                type="condition",
                label=f"Check: {condition}",
                description=f"Conditional logic: {condition}",
                config={},
                position={"x": x_pos + 200, "y": y_pos}
            )
            nodes.append(condition_node)

        # Add transform nodes if needed
        for i, transform in enumerate(intent.data_transformations, 1):
            transform_node = NodeCandidate(
                id=f"transform_{i}",
                type="transform",
                label=f"Transform: {transform}",
                description=f"Data transformation: {transform}",
                config={},
                position={"x": x_pos, "y": y_pos}
            )
            nodes.append(transform_node)
            y_pos += 150

        # Create basic edges (will be refined later)
        edges = []
        for i in range(len(nodes) - 1):
            edges.append({
                "id": f"edge_{i+1}",
                "from": nodes[i].id,
                "to": nodes[i+1].id
            })

        return WorkflowPlan(
            name=name,
            description=description,
            intent=intent,
            nodes=nodes,
            edges=edges
        )

    async def _configure_nodes(
        self,
        nodes: List[NodeCandidate],
        prompt: str,
        intent: WorkflowIntent
    ) -> List[NodeCandidate]:
        """
        Step 3: Configure each node with specific settings.

        Args:
            nodes: List of node candidates
            prompt: Original prompt
            intent: Workflow intent

        Returns:
            List of configured nodes
        """
        configured_nodes = []

        for node in nodes:
            # Use LLM to generate configuration for each node
            config = await self._generate_node_config(node, prompt, intent)
            node.config = config
            configured_nodes.append(node)

        return configured_nodes

    async def _generate_node_config(
        self,
        node: NodeCandidate,
        prompt: str,
        intent: WorkflowIntent
    ) -> Dict[str, Any]:
        """
        Generate configuration for a specific node using LLM.

        Args:
            node: Node to configure
            prompt: Original prompt
            intent: Workflow intent

        Returns:
            Configuration dictionary
        """
        # Create context-aware prompt for node configuration
        system_message = LLMMessage(
            role="system",
            content=f"""You are configuring a {node.type} node named "{node.label}".
Generate appropriate configuration based on the workflow requirements.

Return ONLY valid JSON with configuration parameters.
For example, for an HTTP request node:
{{"method": "POST", "url": "https://api.example.com", "headers": {{}}, "body": {{}}}}

For a Slack message node:
{{"channel": "#general", "message": "Hello from workflow"}}

Keep it simple and practical."""
        )

        user_message = LLMMessage(
            role="user",
            content=f"Configure this node:\nType: {node.type}\nLabel: {node.label}\nDescription: {node.description}\n\nWorkflow context: {prompt}"
        )

        llm_request = LLMRequest(
            messages=[system_message, user_message],
            model_id="qwen/qwen-2.5-72b-instruct:free",  # Use structured output model
            temperature=0.5,
            max_tokens=500,
            use_cache=True
        )

        try:
            response = await self.llm_service.complete(llm_request)
            json_match = re.search(r'\{[\s\S]*\}', response.content)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception as e:
            logger.warning(f"Failed to generate config for {node.id}: {e}")

        # Return default config
        return {
            "type": node.type,
            "description": node.description
        }

    async def _create_edges(
        self,
        nodes: List[NodeCandidate],
        intent: WorkflowIntent
    ) -> List[Dict[str, str]]:
        """
        Step 4: Create edges (connections) between nodes.

        Supports:
        - Sequential flow for regular nodes
        - Conditional branching for if/else nodes
        - Multi-way branching for switch nodes
        - Parallel execution for split nodes
        - Merge points for converging paths

        Args:
            nodes: Configured nodes
            intent: Workflow intent

        Returns:
            List of edges
        """
        edges = []
        edge_counter = 1
        processed_indices = set()

        for i, node in enumerate(nodes):
            if i in processed_indices:
                continue

            # Handle different node types for branching
            if node.type == "condition":
                condition_type = node.config.get("condition_type", "simple")

                if condition_type in ["simple", "if_else"]:
                    # Create true and false branches
                    true_path = node.config.get("true_path")
                    false_path = node.config.get("false_path")

                    # Find the next nodes for true and false paths
                    true_node_idx = self._find_node_by_id(nodes, true_path) if true_path else i + 1
                    false_node_idx = self._find_node_by_id(nodes, false_path) if false_path else i + 2

                    # Create true branch edge
                    if true_node_idx < len(nodes):
                        edges.append({
                            "id": f"edge_{edge_counter}",
                            "from": node.id,
                            "to": nodes[true_node_idx].id,
                            "label": "true",
                            "condition": "true"
                        })
                        edge_counter += 1

                    # Create false branch edge
                    if false_node_idx < len(nodes):
                        edges.append({
                            "id": f"edge_{edge_counter}",
                            "from": node.id,
                            "to": nodes[false_node_idx].id,
                            "label": "false",
                            "condition": "false"
                        })
                        edge_counter += 1

                elif condition_type == "switch":
                    # Create edges for each case
                    cases = node.config.get("cases", {})
                    default_case = node.config.get("default_case")

                    for case_value, case_target in cases.items():
                        target_idx = self._find_node_by_id(nodes, case_target)
                        if target_idx < len(nodes):
                            edges.append({
                                "id": f"edge_{edge_counter}",
                                "from": node.id,
                                "to": nodes[target_idx].id,
                                "label": f"case: {case_value}",
                                "condition": f"value == {case_value}"
                            })
                            edge_counter += 1

                    # Add default case edge
                    if default_case:
                        default_idx = self._find_node_by_id(nodes, default_case)
                        if default_idx < len(nodes):
                            edges.append({
                                "id": f"edge_{edge_counter}",
                                "from": node.id,
                                "to": nodes[default_idx].id,
                                "label": "default",
                                "condition": "default"
                            })
                            edge_counter += 1

                elif condition_type == "multi":
                    # Multi-condition branching
                    next_node_idx = i + 1
                    if next_node_idx < len(nodes):
                        edges.append({
                            "id": f"edge_{edge_counter}",
                            "from": node.id,
                            "to": nodes[next_node_idx].id,
                            "label": ""
                        })
                        edge_counter += 1

            elif node.type == "loop":
                # Loop node - create edge to loop body and exit
                loop_body = node.config.get("loop_body")
                exit_node = node.config.get("exit_node")

                # Edge to loop body
                if loop_body:
                    body_idx = self._find_node_by_id(nodes, loop_body)
                    if body_idx < len(nodes):
                        edges.append({
                            "id": f"edge_{edge_counter}",
                            "from": node.id,
                            "to": nodes[body_idx].id,
                            "label": "iterate",
                            "loop": True
                        })
                        edge_counter += 1

                # Edge to exit
                if exit_node:
                    exit_idx = self._find_node_by_id(nodes, exit_node)
                    if exit_idx < len(nodes):
                        edges.append({
                            "id": f"edge_{edge_counter}",
                            "from": node.id,
                            "to": nodes[exit_idx].id,
                            "label": "exit"
                        })
                        edge_counter += 1
                elif i + 1 < len(nodes):
                    # Default exit to next node
                    edges.append({
                        "id": f"edge_{edge_counter}",
                        "from": node.id,
                        "to": nodes[i + 1].id,
                        "label": "exit"
                    })
                    edge_counter += 1

            elif node.type == "split":
                # Parallel execution - create multiple outgoing edges
                parallel_branches = node.config.get("branches", [])
                for branch_target in parallel_branches:
                    branch_idx = self._find_node_by_id(nodes, branch_target)
                    if branch_idx < len(nodes):
                        edges.append({
                            "id": f"edge_{edge_counter}",
                            "from": node.id,
                            "to": nodes[branch_idx].id,
                            "label": "parallel",
                            "parallel": True
                        })
                        edge_counter += 1

            else:
                # Regular sequential flow
                if i + 1 < len(nodes):
                    edges.append({
                        "id": f"edge_{edge_counter}",
                        "from": node.id,
                        "to": nodes[i + 1].id,
                        "label": ""
                    })
                    edge_counter += 1

        return edges

    def _find_node_by_id(self, nodes: List[NodeCandidate], node_id: Optional[str]) -> int:
        """
        Find the index of a node by its ID.

        Args:
            nodes: List of nodes
            node_id: ID to search for

        Returns:
            Index of the node, or len(nodes) if not found
        """
        if not node_id:
            return len(nodes)

        for i, node in enumerate(nodes):
            if node.id == node_id:
                return i

        return len(nodes)

    async def _validate_workflow(
        self,
        nodes: List[NodeCandidate],
        edges: List[Dict[str, str]],
        intent: WorkflowIntent
    ) -> List[str]:
        """
        Step 5: Validate the workflow structure.

        Args:
            nodes: Workflow nodes
            edges: Workflow edges
            intent: Original intent

        Returns:
            List of validation notes/warnings
        """
        notes = []

        # Check if workflow has at least one trigger
        triggers = [n for n in nodes if n.type == "trigger"]
        if not triggers:
            notes.append("WARNING: No trigger node found. Workflow needs a starting point.")

        # Check if all nodes are connected
        node_ids = {n.id for n in nodes}
        connected_nodes = set()
        for edge in edges:
            connected_nodes.add(edge["from"])
            connected_nodes.add(edge["to"])

        orphaned = node_ids - connected_nodes
        if orphaned:
            notes.append(f"WARNING: Orphaned nodes: {', '.join(orphaned)}")

        # Check for circular dependencies (simple check)
        if len(edges) >= len(nodes):
            notes.append("WARNING: Possible circular dependency detected")

        if not notes:
            notes.append("Workflow structure is valid")

        return notes

    async def _optimize_workflow(
        self,
        nodes: List[NodeCandidate],
        edges: List[Dict[str, str]],
        intent: WorkflowIntent
    ) -> List[str]:
        """
        Step 6: Suggest optimizations for the workflow.

        Args:
            nodes: Workflow nodes
            edges: Workflow edges
            intent: Original intent

        Returns:
            List of optimization suggestions
        """
        suggestions = []

        # Check for parallel execution opportunities
        sequential_actions = [n for n in nodes if n.type == "action"]
        if len(sequential_actions) > 2:
            suggestions.append("Consider parallelizing independent actions to improve performance")

        # Check for caching opportunities
        if any("http" in n.id.lower() or "api" in n.label.lower() for n in nodes):
            suggestions.append("Consider adding caching for API calls to reduce costs")

        # Check for error handling
        if not any(n.type == "condition" for n in nodes):
            suggestions.append("Consider adding error handling with conditional nodes")

        # Check for data transformation needs
        if len(nodes) > 3 and not any(n.type == "transform" for n in nodes):
            suggestions.append("Consider adding data transformation nodes for better data flow")

        return suggestions

    def _generate_summary(
        self,
        prompt: str,
        intent: WorkflowIntent,
        nodes: List[NodeCandidate],
        edges: List[Dict[str, str]],
        validation_notes: List[str],
        optimization_suggestions: List[str]
    ) -> Tuple[str, str]:
        """
        Generate summary and reasoning for the workflow.

        Args:
            prompt: Original prompt
            intent: Analyzed intent
            nodes: Generated nodes
            edges: Generated edges
            validation_notes: Validation results
            optimization_suggestions: Optimization suggestions

        Returns:
            Tuple of (summary, reasoning)
        """
        summary = f"Generated workflow with {len(nodes)} nodes and {len(edges)} connections. "
        summary += f"Starts with {intent.trigger_type} trigger and performs {len(intent.actions)} actions."

        reasoning_parts = [
            f"**Intent Analysis:**",
            f"- Goal: {intent.goal}",
            f"- Trigger: {intent.trigger_type}",
            f"- Actions: {', '.join(intent.actions) if intent.actions else 'None'}",
            f"",
            f"**Generated Structure:**",
            f"- Total nodes: {len(nodes)}",
            f"- Trigger nodes: {len([n for n in nodes if n.type == 'trigger'])}",
            f"- Action nodes: {len([n for n in nodes if n.type == 'action'])}",
            f"- Condition nodes: {len([n for n in nodes if n.type == 'condition'])}",
            f"- Transform nodes: {len([n for n in nodes if n.type == 'transform'])}",
            f"",
            f"**Validation:**"
        ]
        reasoning_parts.extend([f"- {note}" for note in validation_notes])

        if optimization_suggestions:
            reasoning_parts.append("")
            reasoning_parts.append("**Optimization Suggestions:**")
            reasoning_parts.extend([f"- {sugg}" for sugg in optimization_suggestions])

        reasoning = "\n".join(reasoning_parts)

        return summary, reasoning

    def _generate_workflow_name(self, goal: str) -> str:
        """Generate a workflow name from the goal."""
        # Simple name generation
        name = goal[:50].strip()
        if not name:
            name = "Generated Workflow"
        # Capitalize first letter
        name = name[0].upper() + name[1:]
        return name

    def _node_to_dict(self, node: NodeCandidate) -> Dict[str, Any]:
        """Convert NodeCandidate to dictionary for JSON serialization."""
        return {
            "id": node.id,
            "type": node.type,
            "label": node.label,
            "data": {
                "config": node.config,
                "description": node.description
            },
            "position": node.position
        }
