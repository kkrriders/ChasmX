"""
Workflow Execution Engine

This service executes workflows node by node, handling different node types
and managing execution state. It integrates with:
- AI/LLM services (with Redis caching)
- MongoDB for state persistence
- External services (email, webhooks, etc.)
- Inter-node communication system (Simple & Redis Pub/Sub modes)
"""
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from loguru import logger
import asyncio
import uuid
import json
from enum import Enum

from ..models.workflow import (
    Workflow,
    WorkflowRun,
    ExecutionStatus,
    Node
)
from .ai_service_manager import ai_service_manager
from .llm.base import LLMRequest, LLMMessage
from .agents.aap import AgentMessage, MessageType, MessagePriority


class WorkflowExecutionError(Exception):
    """Custom exception for workflow execution errors"""
    pass


class CommunicationMode(str, Enum):
    """Node communication modes"""
    SIMPLE = "simple"  # Simple in-memory communication (sequential)
    PUBSUB = "pubsub"  # Redis Pub/Sub based (async, parallel-capable)


class WorkflowExecutor:
    """
    Executes workflows by processing nodes in topological order.

    Features:
    - Sequential and parallel node execution
    - Error handling and rollback
    - Real-time state updates
    - Redis-cached LLM calls
    - Inter-node communication (ask_node, broadcast, shared context)
    """

    def __init__(self):
        self.max_retries = 3
        self.node_timeout = 300  # 5 minutes per node

        # Node communication state (Simple mode)
        self.shared_context: Dict[str, Any] = {}
        self.node_registry: Dict[str, Node] = {}
        self.current_run: Optional[WorkflowRun] = None
        self.execution_context: Optional[Dict[str, Any]] = None

        # Redis Pub/Sub communication state
        self.message_bus = None
        self.orchestrator = None
        self.active_agents: Dict[str, str] = {}  # execution_id -> {node_id -> agent_id}
        self.pending_responses: Dict[str, asyncio.Future] = {}  # message_id -> Future

    async def execute(self, workflow: Workflow, run: WorkflowRun) -> WorkflowRun:
        """
        Execute a complete workflow.

        Args:
            workflow: The workflow definition to execute
            run: The workflow run record to track execution

        Returns:
            Updated WorkflowRun with execution results
        """
        try:
            logger.info(f"Starting workflow execution: {workflow.name} (ID: {workflow.id})")

            # Update status to running
            run.status = ExecutionStatus.RUNNING
            run.start_time = datetime.utcnow()
            await run.save()

            # Build node execution order
            execution_order = self._build_execution_order(workflow.nodes, workflow.edges)
            logger.info(f"Execution order: {[node.id for node in execution_order]}")

            # Determine communication mode from workflow metadata
            comm_mode = CommunicationMode(
                workflow.metadata.get("communication_mode", "simple")
                if hasattr(workflow, 'metadata') and workflow.metadata
                else "simple"
            )
            logger.info(f"Using communication mode: {comm_mode}")

            # Initialize communication system
            self.shared_context = {}
            self.node_registry = {node.id: node for node in workflow.nodes}
            self.current_run = run

            # Initialize communication log
            if run.communication_log is None:
                run.communication_log = []

            # Initialize message bus and orchestrator for PUBSUB mode
            if comm_mode == CommunicationMode.PUBSUB:
                try:
                    self.message_bus = ai_service_manager.get_message_bus()
                    self.orchestrator = ai_service_manager.get_orchestrator()

                    # Register message handlers for node communication
                    self.message_bus.register_handler(
                        MessageType.QUERY,
                        self._handle_query_message
                    )
                    self.message_bus.register_handler(
                        MessageType.RESPONSE,
                        self._handle_response_message
                    )

                    logger.info("Initialized Redis Pub/Sub communication")
                except Exception as e:
                    logger.warning(f"Failed to initialize Pub/Sub mode, falling back to simple: {e}")
                    comm_mode = CommunicationMode.SIMPLE

            # Initialize runtime context
            context = {
                "workflow_id": str(workflow.id),
                "execution_id": run.execution_id,
                "variables": run.variables.copy(),
                "outputs": {},  # Store node outputs for downstream nodes
                "shared": self.shared_context,  # Shared context for inter-node communication
                "communication_mode": comm_mode
            }
            self.execution_context = context

            # Register nodes as agents for PUBSUB mode
            if comm_mode == CommunicationMode.PUBSUB:
                self.active_agents[run.execution_id] = {}
                for node in workflow.nodes:
                    if node.type == "ai-processor" and node.config.get("can_communicate"):
                        await self._register_node_agent(node, run.execution_id)

            # Execute nodes in order
            for node in execution_order:
                try:
                    logger.info(f"Executing node: {node.id} (type: {node.type})")

                    # Add log entry
                    await self._add_log(run, node.id, f"Starting execution of {node.type} node")

                    # Execute node with timeout
                    result = await asyncio.wait_for(
                        self._execute_node(node, context, run),
                        timeout=self.node_timeout
                    )

                    # Store result
                    run.node_states[node.id] = result
                    context["outputs"][node.id] = result.get("output")

                    await self._add_log(
                        run,
                        node.id,
                        f"Completed successfully. Cached: {result.get('cached', False)}"
                    )
                    await run.save()

                except asyncio.TimeoutError:
                    error_msg = f"Node {node.id} execution timeout after {self.node_timeout}s"
                    logger.error(error_msg)
                    await self._add_error(run, node.id, error_msg)
                    raise WorkflowExecutionError(error_msg)

                except Exception as e:
                    error_msg = f"Node {node.id} execution failed: {str(e)}"
                    logger.error(error_msg)
                    await self._add_error(run, node.id, error_msg)
                    raise WorkflowExecutionError(error_msg)

            # Mark as successful
            run.status = ExecutionStatus.SUCCESS
            run.end_time = datetime.utcnow()
            await run.save()

            # Cleanup: Unregister agents if using PUBSUB mode
            if context.get("communication_mode") == CommunicationMode.PUBSUB:
                await self._cleanup_agents(run.execution_id)

            logger.info(f"Workflow execution completed successfully: {run.execution_id}")
            return run

        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            run.status = ExecutionStatus.ERROR
            run.end_time = datetime.utcnow()
            await self._add_error(run, "workflow", f"Workflow execution failed: {str(e)}")
            await run.save()

            # Cleanup agents on failure too
            if self.execution_context and self.execution_context.get("communication_mode") == CommunicationMode.PUBSUB:
                await self._cleanup_agents(run.execution_id)

            raise

    def _build_execution_order(self, nodes: List[Node], edges: List) -> List[Node]:
        """
        Build execution order using topological sort.

        For now, uses simple sequential order based on node position.
        TODO: Implement proper topological sort for complex workflows
        """
        # Find start node
        start_nodes = [n for n in nodes if n.type == "start"]
        if not start_nodes:
            # If no start node, use first node
            return nodes

        # Simple approach: execute in order of connections
        # In production, implement proper topological sort
        visited = set()
        order = []

        def visit(node_id: str):
            if node_id in visited:
                return
            visited.add(node_id)

            # Find the node
            node = next((n for n in nodes if n.id == node_id), None)
            if node:
                order.append(node)

                # Find outgoing edges
                for edge in edges:
                    if edge.from_ == node_id:
                        visit(edge.to)

        # Start from start node
        visit(start_nodes[0].id)

        # Add any remaining nodes
        for node in nodes:
            if node not in order:
                order.append(node)

        return order

    async def _execute_node(self, node: Node, context: Dict[str, Any], run: WorkflowRun) -> Dict[str, Any]:
        """
        Execute a single node based on its type.

        Args:
            node: The node to execute
            context: Runtime context with variables and previous outputs
            run: WorkflowRun for state tracking

        Returns:
            Dictionary with execution result
        """
        node_type = node.type.lower()

        # Route to appropriate handler
        if node_type == "start":
            return await self._execute_start_node(node, context)
        elif node_type == "ai-processor":
            return await self._execute_ai_node(node, context)
        elif node_type == "email":
            return await self._execute_email_node(node, context)
        elif node_type == "data-source":
            return await self._execute_data_source_node(node, context)
        elif node_type == "webhook":
            return await self._execute_webhook_node(node, context)
        elif node_type == "filter":
            return await self._execute_filter_node(node, context)
        elif node_type == "transformer":
            return await self._execute_transformer_node(node, context)
        elif node_type == "condition":
            return await self._execute_condition_node(node, context)
        elif node_type == "delay":
            return await self._execute_delay_node(node, context)
        elif node_type == "end":
            return await self._execute_end_node(node, context)
        else:
            logger.warning(f"Unknown node type: {node_type}, skipping")
            return {"status": "skipped", "reason": f"Unknown node type: {node_type}"}

    async def _execute_start_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute start node - initializes workflow execution"""
        return {
            "status": "completed",
            "output": "Workflow started",
            "timestamp": datetime.utcnow().isoformat()
        }

    async def _execute_ai_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute AI processor node - Uses LLM with Redis caching.

        This is where the magic happens:
        1. Builds prompt from node config and context
        2. Calls LLM service (which checks Redis cache first)
        3. If cached, returns instantly
        4. If not cached, calls OpenRouter and caches result
        5. Supports inter-node communication if enabled
        """
        try:
            llm_service = ai_service_manager.get_llm_service()

            # Get prompt from config
            prompt_template = node.config.get("prompt", "")
            model_id = node.config.get("model", "google/gemini-2.0-flash-exp:free")
            temperature = node.config.get("temperature", 0.7)
            max_tokens = node.config.get("max_tokens", 2048)

            # Check if node communication is enabled
            can_communicate = node.config.get("can_communicate", False)

            # Replace variables in prompt
            prompt = self._interpolate_variables(prompt_template, context)

            # Add broadcast messages to prompt if communication enabled
            if can_communicate:
                broadcasts = self.get_broadcasts_for_node(node.id, node.type)
                if broadcasts:
                    broadcast_text = "\n\n=== Broadcast Messages ===\n"
                    for bc in broadcasts:
                        broadcast_text += f"From {bc['from']} at {bc['timestamp']}:\n{bc['message']}\n\n"
                    prompt = broadcast_text + prompt
                    logger.info(f"Added {len(broadcasts)} broadcast messages to prompt")

            logger.info(f"AI Node: Calling LLM with prompt (length: {len(prompt)}), Communication: {can_communicate}")

            # Build messages
            messages = [LLMMessage(role="user", content=prompt)]

            # Add system message if provided
            system_prompt = node.config.get("system_prompt", "")
            if can_communicate:
                # Add communication capabilities to system prompt
                comm_instructions = """

You have access to inter-node communication functions:
- ask_node(target_node_id, question, context): Ask another AI node a question
- broadcast_message(message, target_types): Broadcast a message to other nodes
- set_shared_context(key, value): Store data in shared context
- get_shared_context(key, default): Retrieve data from shared context

Use these functions when you need to coordinate with other nodes in the workflow."""
                if system_prompt:
                    system_prompt += comm_instructions
                else:
                    system_prompt = "You are an AI node in a collaborative workflow." + comm_instructions

            if system_prompt:
                messages.insert(0, LLMMessage(
                    role="system",
                    content=system_prompt
                ))

            # Create LLM request
            llm_request = LLMRequest(
                messages=messages,
                model_id=model_id,
                temperature=temperature,
                max_tokens=max_tokens,
                use_cache=True  # Enable Redis caching
            )

            # Execute LLM call
            start_time = datetime.utcnow()
            response = await llm_service.complete(llm_request)
            end_time = datetime.utcnow()

            execution_time = (end_time - start_time).total_seconds() * 1000

            logger.info(
                f"AI Node completed. Cached: {response.cached}, "
                f"Time: {execution_time:.2f}ms"
            )

            # Parse response for communication function calls if enabled
            communications_used = []
            if can_communicate:
                # Check if response contains function call requests
                # This is a simplified implementation - in production, you'd want
                # to use structured output or tool calling APIs
                communications_used = await self._process_communication_requests(
                    node.id,
                    response.content
                )

            return {
                "status": "completed",
                "output": response.content,
                "cached": response.cached,
                "model": response.model_id,
                "latency_ms": response.latency_ms,
                "usage": response.usage.model_dump() if response.usage else None,
                "timestamp": end_time.isoformat(),
                "can_communicate": can_communicate,
                "communications_used": communications_used
            }

        except Exception as e:
            logger.error(f"AI node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _process_communication_requests(self, node_id: str, response_text: str) -> List[str]:
        """
        Process any communication function calls in the AI response.

        This is a simplified parser - in production, use structured outputs or tool calling.

        Args:
            node_id: Current node ID
            response_text: The AI response to parse

        Returns:
            List of communication functions that were called
        """
        communications = []

        # Simple pattern matching for function calls
        # Format: CALL: function_name(args)
        import re

        # Pattern for ask_node calls
        ask_pattern = r'CALL:\s*ask_node\(["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\)'
        for match in re.finditer(ask_pattern, response_text):
            target_node = match.group(1)
            question = match.group(2)
            try:
                await self.ask_node(node_id, target_node, question)
                communications.append(f"ask_node({target_node})")
            except Exception as e:
                logger.error(f"Failed to execute ask_node: {str(e)}")

        # Pattern for broadcast calls
        broadcast_pattern = r'CALL:\s*broadcast_message\(["\']([^"\']+)["\']\)'
        for match in re.finditer(broadcast_pattern, response_text):
            message = match.group(1)
            try:
                await self.broadcast_message(node_id, message)
                communications.append("broadcast_message")
            except Exception as e:
                logger.error(f"Failed to execute broadcast_message: {str(e)}")

        # Pattern for set_shared_context calls
        context_pattern = r'CALL:\s*set_shared_context\(["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\)'
        for match in re.finditer(context_pattern, response_text):
            key = match.group(1)
            value = match.group(2)
            try:
                await self.set_shared_context(node_id, key, value)
                communications.append(f"set_shared_context({key})")
            except Exception as e:
                logger.error(f"Failed to execute set_shared_context: {str(e)}")

        return communications

    async def _execute_email_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute email node - sends email via SMTP"""
        try:
            to_email = self._interpolate_variables(node.config.get("to", ""), context)
            subject = self._interpolate_variables(node.config.get("subject", ""), context)
            body = self._interpolate_variables(node.config.get("body", ""), context)

            logger.info(f"Email Node: Sending to {to_email}")

            # TODO: Implement actual email sending via aiosmtplib
            # For now, simulate
            await asyncio.sleep(0.5)

            return {
                "status": "completed",
                "output": f"Email sent to {to_email}",
                "to": to_email,
                "subject": subject,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Email node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_data_source_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data source node - fetches data from databases/APIs"""
        try:
            source_type = node.config.get("source_type", "api")
            endpoint = node.config.get("endpoint", "")

            logger.info(f"Data Source Node: Fetching from {source_type}")

            # TODO: Implement actual data fetching
            # For now, return mock data
            await asyncio.sleep(0.3)

            return {
                "status": "completed",
                "output": {"data": "mock_data", "count": 10},
                "source_type": source_type,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Data source node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_webhook_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute webhook node - makes HTTP request"""
        try:
            url = self._interpolate_variables(node.config.get("url", ""), context)
            method = node.config.get("method", "POST")

            logger.info(f"Webhook Node: {method} {url}")

            # TODO: Implement actual HTTP request using aiohttp
            await asyncio.sleep(0.5)

            return {
                "status": "completed",
                "output": {"status_code": 200, "response": "success"},
                "url": url,
                "method": method,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Webhook node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_filter_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute filter node - filters data based on conditions"""
        try:
            condition = node.config.get("condition", "true")

            logger.info(f"Filter Node: Evaluating condition")

            # TODO: Implement safe condition evaluation
            # For now, pass through

            return {
                "status": "completed",
                "output": "Filter passed",
                "condition": condition,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Filter node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_transformer_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute transformer node - transforms data structure"""
        try:
            transform_type = node.config.get("transform_type", "map")

            logger.info(f"Transformer Node: Applying {transform_type} transformation")

            # TODO: Implement data transformation logic

            return {
                "status": "completed",
                "output": "Data transformed",
                "transform_type": transform_type,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Transformer node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_condition_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute condition node - branching logic"""
        try:
            condition = node.config.get("condition", "true")

            logger.info(f"Condition Node: Evaluating branching logic")

            # TODO: Implement condition evaluation and branching

            return {
                "status": "completed",
                "output": "Condition evaluated",
                "result": True,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Condition node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_delay_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute delay node - waits for specified duration"""
        try:
            delay_seconds = node.config.get("delay_seconds", 1)

            logger.info(f"Delay Node: Waiting {delay_seconds}s")

            await asyncio.sleep(delay_seconds)

            return {
                "status": "completed",
                "output": f"Delayed {delay_seconds}s",
                "delay_seconds": delay_seconds,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Delay node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_end_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute end node - marks workflow completion"""
        return {
            "status": "completed",
            "output": "Workflow completed",
            "timestamp": datetime.utcnow().isoformat()
        }

    def _interpolate_variables(self, template: str, context: Dict[str, Any]) -> str:
        """
        Replace variable placeholders in template with actual values.

        Supports: {{variable_name}} and {{outputs.node_id}}
        """
        if not template:
            return ""

        result = template

        # Replace workflow variables
        for key, value in context.get("variables", {}).items():
            placeholder = f"{{{{{key}}}}}"
            result = result.replace(placeholder, str(value))

        # Replace node outputs
        for node_id, output in context.get("outputs", {}).items():
            placeholder = f"{{{{outputs.{node_id}}}}}"
            result = result.replace(placeholder, str(output))

        return result

    async def _add_log(self, run: WorkflowRun, node_id: str, message: str):
        """Add log entry to workflow run"""
        if run.logs is None:
            run.logs = []

        run.logs.append({
            "timestamp": datetime.utcnow().isoformat(),
            "node_id": node_id,
            "message": message
        })

    async def _add_error(self, run: WorkflowRun, node_id: str, error: str):
        """Add error entry to workflow run"""
        if run.errors is None:
            run.errors = []

        run.errors.append({
            "timestamp": datetime.utcnow().isoformat(),
            "node_id": node_id,
            "error": error
        })

    # ==================== NODE COMMUNICATION METHODS ====================

    async def _add_communication_log(
        self,
        from_node: str,
        to_node: str,
        message_type: str,
        content: Any,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Add entry to communication log.

        Args:
            from_node: Source node ID
            to_node: Target node ID (or "broadcast" for broadcast messages)
            message_type: Type of communication (ask, response, broadcast, context_update)
            content: Message content
            metadata: Optional metadata about the communication
        """
        if self.current_run and self.current_run.communication_log is not None:
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "from_node": from_node,
                "to_node": to_node,
                "type": message_type,
                "content": content,
                "metadata": metadata or {}
            }
            self.current_run.communication_log.append(log_entry)
            logger.info(f"Communication logged: {from_node} -> {to_node} ({message_type})")

    async def ask_node(
        self,
        source_node_id: str,
        target_node_id: str,
        question: str,
        context_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Ask another node a question using its AI processor.

        This enables inter-node communication where one node can query another.
        Supports both simple (direct LLM call) and Redis Pub/Sub modes.

        Args:
            source_node_id: ID of the node asking the question
            target_node_id: ID of the node being asked
            question: The question to ask
            context_data: Optional context data to include

        Returns:
            The response from the target node's AI processor

        Raises:
            WorkflowExecutionError: If target node doesn't exist or can't be queried
        """
        logger.info(f"Node {source_node_id} asking node {target_node_id}: {question[:100]}...")

        # Check communication mode
        comm_mode = self.execution_context.get("communication_mode", CommunicationMode.SIMPLE)

        if comm_mode == CommunicationMode.PUBSUB:
            return await self._ask_node_pubsub(source_node_id, target_node_id, question, context_data)
        else:
            return await self._ask_node_simple(source_node_id, target_node_id, question, context_data)

    async def _ask_node_simple(
        self,
        source_node_id: str,
        target_node_id: str,
        question: str,
        context_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Simple mode: Direct LLM call (original implementation)"""

        # Log the question
        await self._add_communication_log(
            from_node=source_node_id,
            to_node=target_node_id,
            message_type="ask",
            content=question,
            metadata={"context_provided": context_data is not None}
        )

        # Find the target node
        target_node = self.node_registry.get(target_node_id)
        if not target_node:
            raise WorkflowExecutionError(f"Target node {target_node_id} not found")

        # Check if target node is an AI processor
        if target_node.type.lower() != "ai-processor":
            raise WorkflowExecutionError(
                f"Target node {target_node_id} is not an AI processor (type: {target_node.type})"
            )

        # Check if target has already been executed (has output available)
        has_output = False
        response_text = ""

        if self.execution_context and target_node_id in self.execution_context.get("outputs", {}):
            # Node already executed, use its previous output
            output = self.execution_context["outputs"][target_node_id]
            response_text = str(output)
            has_output = True
            logger.info(f"Using existing output from {target_node_id}")
        else:
            # Execute the target node with the question as input
            try:
                llm_service = ai_service_manager.get_llm_service()

                # Build context-aware prompt
                full_prompt = question
                if context_data:
                    context_str = json.dumps(context_data, indent=2)
                    full_prompt = f"Context:\n{context_str}\n\nQuestion: {question}"

                # Get node configuration
                model_id = target_node.config.get("model", "google/gemini-2.0-flash-exp:free")
                temperature = target_node.config.get("temperature", 0.7)
                max_tokens = target_node.config.get("max_tokens", 2048)

                # Build messages
                messages = [LLMMessage(role="user", content=full_prompt)]

                # Add system prompt if configured
                if "system_prompt" in target_node.config:
                    messages.insert(0, LLMMessage(
                        role="system",
                        content=target_node.config["system_prompt"]
                    ))

                # Create and execute request
                llm_request = LLMRequest(
                    messages=messages,
                    model_id=model_id,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    use_cache=True
                )

                response = await llm_service.complete(llm_request)
                response_text = response.content

                logger.info(
                    f"ask_node completed. Cached: {response.cached}, "
                    f"Response length: {len(response_text)}"
                )

            except Exception as e:
                logger.error(f"ask_node failed: {str(e)}")
                raise WorkflowExecutionError(f"Failed to get response from {target_node_id}: {str(e)}")

        # Log the response
        await self._add_communication_log(
            from_node=target_node_id,
            to_node=source_node_id,
            message_type="response",
            content=response_text,
            metadata={"used_existing_output": has_output}
        )

        return response_text

    async def broadcast_message(
        self,
        source_node_id: str,
        message: str,
        target_types: Optional[List[str]] = None
    ):
        """
        Broadcast a message to all nodes (or nodes of specific types).

        Supports both simple (in-memory) and Redis Pub/Sub modes.

        Args:
            source_node_id: ID of the node broadcasting
            message: The message to broadcast
            target_types: Optional list of node types to target (e.g., ["ai-processor"])
        """
        # Check communication mode
        comm_mode = self.execution_context.get("communication_mode", CommunicationMode.SIMPLE)

        if comm_mode == CommunicationMode.PUBSUB:
            await self._broadcast_pubsub(source_node_id, message, target_types)
        else:
            # Simple mode implementation
            logger.info(f"Node {source_node_id} broadcasting message (length: {len(message)})")

            if "broadcasts" not in self.shared_context:
                self.shared_context["broadcasts"] = []

            broadcast_entry = {
                "from": source_node_id,
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
                "target_types": target_types
            }
            self.shared_context["broadcasts"].append(broadcast_entry)

            await self._add_communication_log(
                from_node=source_node_id,
                to_node="broadcast",
                message_type="broadcast",
                content=message,
                metadata={
                    "target_types": target_types,
                    "broadcast_count": len(self.shared_context["broadcasts"])
                }
            )

            logger.info(f"Broadcast stored in shared context (total: {len(self.shared_context['broadcasts'])})")

    def get_shared_context(self, key: str, default: Any = None) -> Any:
        """
        Get a value from the shared context.

        Args:
            key: The key to retrieve
            default: Default value if key doesn't exist

        Returns:
            The value from shared context or default
        """
        return self.shared_context.get(key, default)

    async def set_shared_context(self, node_id: str, key: str, value: Any):
        """
        Set a value in the shared context.

        Args:
            node_id: ID of the node setting the value
            key: The key to set
            value: The value to store
        """
        logger.info(f"Node {node_id} setting shared context: {key}")

        self.shared_context[key] = value

        # Log the context update
        await self._add_communication_log(
            from_node=node_id,
            to_node="shared_context",
            message_type="context_update",
            content={"key": key, "value_type": type(value).__name__},
            metadata={"key": key}
        )

    def get_broadcasts_for_node(self, node_id: str, node_type: str) -> List[Dict[str, Any]]:
        """
        Get all broadcast messages relevant to a specific node.

        Args:
            node_id: The node requesting broadcasts
            node_type: The type of the requesting node

        Returns:
            List of relevant broadcast messages
        """
        broadcasts = self.shared_context.get("broadcasts", [])
        relevant = []

        for broadcast in broadcasts:
            # Check if broadcast targets this node type
            target_types = broadcast.get("target_types")
            if target_types is None or node_type in target_types:
                # Don't include broadcasts from this node itself
                if broadcast.get("from") != node_id:
                    relevant.append(broadcast)

        return relevant

    def create_communication_functions(self, current_node_id: str) -> Dict[str, Callable]:
        """
        Create communication functions bound to a specific node.

        These functions can be provided to AI nodes for function calling.

        Args:
            current_node_id: The ID of the current node

        Returns:
            Dictionary of function name to callable
        """
        async def ask_node_wrapper(target_node_id: str, question: str, context: Optional[Dict] = None):
            return await self.ask_node(current_node_id, target_node_id, question, context)

        async def broadcast_wrapper(message: str, target_types: Optional[List[str]] = None):
            return await self.broadcast_message(current_node_id, message, target_types)

        async def set_context_wrapper(key: str, value: Any):
            return await self.set_shared_context(current_node_id, key, value)

        def get_context_wrapper(key: str, default: Any = None):
            return self.get_shared_context(key, default)

        return {
            "ask_node": ask_node_wrapper,
            "broadcast_message": broadcast_wrapper,
            "set_shared_context": set_context_wrapper,
            "get_shared_context": get_context_wrapper
        }

    # ==================== REDIS PUB/SUB COMMUNICATION METHODS ====================

    async def _register_node_agent(self, node: Node, execution_id: str):
        """Register a node as an agent in the orchestrator for Pub/Sub communication"""
        agent_id = f"node-{execution_id}-{node.id}"

        capabilities = ["ai-processing"]
        if node.config.get("can_communicate", False):
            capabilities.append("communication")

        await self.orchestrator.register_agent(
            agent_id=agent_id,
            agent_type="workflow_node",
            name=node.config.get("name", f"Node {node.id}"),
            capabilities=capabilities,
            preferred_model=node.config.get("model", "google/gemini-2.0-flash-exp:free")
        )

        self.active_agents[execution_id][node.id] = agent_id
        logger.info(f"Registered agent: {agent_id} for node {node.id}")

    async def _cleanup_agents(self, execution_id: str):
        """Unregister all agents for this execution"""
        if execution_id not in self.active_agents:
            return

        for node_id, agent_id in self.active_agents[execution_id].items():
            try:
                await self.orchestrator.unregister_agent(agent_id)
                logger.info(f"Unregistered agent: {agent_id}")
            except Exception as e:
                logger.error(f"Failed to unregister agent {agent_id}: {e}")

        del self.active_agents[execution_id]

    async def _ask_node_pubsub(
        self,
        source_node_id: str,
        target_node_id: str,
        question: str,
        context_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Pub/Sub mode: Use Redis Pub/Sub to ask another node a question.

        This sends a QUERY message via Redis and waits for a RESPONSE.
        """
        # Log the question
        await self._add_communication_log(
            from_node=source_node_id,
            to_node=target_node_id,
            message_type="ask",
            content=question,
            metadata={"context_provided": context_data is not None, "mode": "pubsub"}
        )

        # Get agent IDs
        execution_id = self.execution_context.get("execution_id")
        source_agent_id = self.active_agents.get(execution_id, {}).get(source_node_id)
        target_agent_id = self.active_agents.get(execution_id, {}).get(target_node_id)

        if not target_agent_id:
            # Fall back to simple mode if target not registered as agent
            logger.warning(f"Target node {target_node_id} not registered as agent, falling back to simple mode")
            return await self._ask_node_simple(source_node_id, target_node_id, question, context_data)

        # Create message ID
        message_id = f"query:{source_node_id}:{target_node_id}:{datetime.utcnow().timestamp()}"

        # Create future for response
        response_future = asyncio.Future()
        self.pending_responses[message_id] = response_future

        try:
            # Send query message
            query_content = {
                "question": question,
                "context": context_data or {}
            }

            query_message = AgentMessage(
                id=message_id,
                type=MessageType.QUERY,
                from_agent=source_agent_id or source_node_id,
                to_agent=target_agent_id,
                subject=f"Query from {source_node_id}",
                content=query_content,
                priority=MessagePriority.HIGH,
                requires_response=True
            )

            # Publish message
            await self.message_bus.publish(query_message)
            logger.info(f"Sent Pub/Sub query from {source_node_id} to {target_node_id}")

            # Wait for response with timeout
            try:
                response_text = await asyncio.wait_for(response_future, timeout=30)
            except asyncio.TimeoutError:
                raise WorkflowExecutionError(f"Timeout waiting for response from {target_node_id}")

            # Log the response
            await self._add_communication_log(
                from_node=target_node_id,
                to_node=source_node_id,
                message_type="response",
                content=response_text,
                metadata={"mode": "pubsub"}
            )

            return response_text

        finally:
            # Clean up pending response
            if message_id in self.pending_responses:
                del self.pending_responses[message_id]

    async def _handle_query_message(self, message: "AgentMessage"):
        """Handle incoming query message via Pub/Sub"""
        try:
            # Extract target node ID from agent ID
            target_agent_id = message.to_agent
            target_node_id = None

            # Find node ID from agent ID
            execution_id = self.execution_context.get("execution_id") if self.execution_context else None
            if execution_id and execution_id in self.active_agents:
                for node_id, agent_id in self.active_agents[execution_id].items():
                    if agent_id == target_agent_id:
                        target_node_id = node_id
                        break

            if not target_node_id:
                logger.warning(f"Could not find node for agent {target_agent_id}")
                return

            # Get the target node
            target_node = self.node_registry.get(target_node_id)
            if not target_node:
                logger.error(f"Target node {target_node_id} not found")
                return

            # Execute LLM call
            question = message.content.get("question", "")
            context_data = message.content.get("context", {})

            llm_service = ai_service_manager.get_llm_service()

            # Build prompt
            full_prompt = question
            if context_data:
                context_str = json.dumps(context_data, indent=2)
                full_prompt = f"Context:\n{context_str}\n\nQuestion: {question}"

            # Build messages
            messages = [LLMMessage(role="user", content=full_prompt)]

            if "system_prompt" in target_node.config:
                messages.insert(0, LLMMessage(
                    role="system",
                    content=target_node.config["system_prompt"]
                ))

            # Create and execute request
            llm_request = LLMRequest(
                messages=messages,
                model_id=target_node.config.get("model", "google/gemini-2.0-flash-exp:free"),
                temperature=target_node.config.get("temperature", 0.7),
                max_tokens=target_node.config.get("max_tokens", 2048),
                use_cache=True
            )

            response = await llm_service.complete(llm_request)
            response_text = response.content

            logger.info(f"Generated response for query {message.id}")

            # Send response back
            await self.message_bus.send_task_response(
                from_agent=target_agent_id,
                to_agent=message.from_agent,
                reply_to=message.id,
                result={"response": response_text},
                success=True
            )

        except Exception as e:
            logger.error(f"Failed to handle query message: {e}")

    async def _handle_response_message(self, message: "AgentMessage"):
        """Handle incoming response message via Pub/Sub"""
        try:
            reply_to = message.reply_to
            if not reply_to:
                logger.warning("Response message has no reply_to field")
                return

            # Find pending response future
            future = self.pending_responses.get(reply_to)
            if not future:
                logger.warning(f"No pending response for message {reply_to}")
                return

            # Extract response
            result = message.content.get("result", {})
            response_text = result.get("response", "")

            # Set future result
            if not future.done():
                future.set_result(response_text)
                logger.info(f"Received response for message {reply_to}")

        except Exception as e:
            logger.error(f"Failed to handle response message: {e}")

    async def _broadcast_pubsub(
        self,
        source_node_id: str,
        message: str,
        target_types: Optional[List[str]] = None
    ):
        """
        Pub/Sub mode: Broadcast message via Redis Pub/Sub.

        Uses Redis broadcast channel to send to all subscribed nodes.
        """
        logger.info(f"Node {source_node_id} broadcasting via Pub/Sub (length: {len(message)})")

        # Store in shared context (for nodes not yet executed)
        if "broadcasts" not in self.shared_context:
            self.shared_context["broadcasts"] = []

        broadcast_entry = {
            "from": source_node_id,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "target_types": target_types
        }
        self.shared_context["broadcasts"].append(broadcast_entry)

        # Send via Redis Pub/Sub
        try:
            execution_id = self.execution_context.get("execution_id")
            source_agent_id = self.active_agents.get(execution_id, {}).get(source_node_id)

            await self.message_bus.broadcast(
                from_agent=source_agent_id or source_node_id,
                subject=f"Broadcast from {source_node_id}",
                content={
                    "message": message,
                    "target_types": target_types
                },
                priority=MessagePriority.LOW
            )

            logger.info(f"Sent Pub/Sub broadcast from {source_node_id}")

        except Exception as e:
            logger.error(f"Failed to send Pub/Sub broadcast: {e}")

        # Log the broadcast
        await self._add_communication_log(
            from_node=source_node_id,
            to_node="broadcast",
            message_type="broadcast",
            content=message,
            metadata={
                "target_types": target_types,
                "broadcast_count": len(self.shared_context["broadcasts"]),
                "mode": "pubsub"
            }
        )


# Global singleton instance
workflow_executor = WorkflowExecutor()
