"""
Workflow Execution Engine

This service executes workflows node by node, handling different node types
and managing execution state. It integrates with:
- AI/LLM services (with Redis caching)
- MongoDB for state persistence
- External services (email, webhooks, etc.)
- Inter-node communication system (Simple & Redis Pub/Sub modes)
- WebSocket for real-time execution updates
"""
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from loguru import logger
import asyncio
import uuid
import json
import os
from enum import Enum
import ssl
import aiosmtplib
import aiohttp
from email.mime.text import MIMEText as MimeText
from email.mime.multipart import MIMEMultipart as MimeMultipart
from email.mime.base import MIMEBase as MimeBase
from email import encoders

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
        self.active_agents: Dict[str, Dict[str, str]] = {}  # execution_id -> {node_id -> agent_id}
        self.pending_responses: Dict[str, asyncio.Future] = {}  # message_id -> Future

    async def _broadcast_websocket_event(self, execution_id: str, event_type: str, data: dict):
        """Broadcast execution events to WebSocket clients."""
        try:
            # Import here to avoid circular dependency
            from ..routes.websocket import manager

            # Add timestamp
            data["timestamp"] = datetime.utcnow().isoformat()

            await manager.send_to_execution(execution_id, event_type, data)
        except Exception as e:
            # Don't fail execution if WebSocket broadcast fails
            logger.warning(f"Failed to broadcast WebSocket event: {e}")

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

            # Broadcast execution started
            await self._broadcast_websocket_event(
                run.execution_id,
                "execution_started",
                {
                    "status": run.status.value,
                    "workflow_id": str(workflow.id),
                    "workflow_name": workflow.name,
                    "start_time": run.start_time.isoformat()
                }
            )

            # Build node execution order (returns batches, flatten for sequential execution)
            execution_batches = self._build_execution_order(workflow.nodes, workflow.edges)
            execution_order = [node for batch in execution_batches for node in batch]
            logger.info(f"Execution order: {[node.id for node in execution_order]}")

            # Determine communication mode from workflow metadata
            comm_mode = CommunicationMode.SIMPLE  # default
            if hasattr(workflow, 'metadata') and workflow.metadata:
                # Check if metadata has communication_mode as a custom field
                metadata_dict = workflow.metadata.model_dump() if hasattr(workflow.metadata, 'model_dump') else {}
                comm_mode = CommunicationMode(metadata_dict.get("communication_mode", "simple"))
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

                    # Broadcast node started
                    await self._broadcast_websocket_event(
                        run.execution_id,
                        "node_started",
                        {
                            "node_id": node.id,
                            "node_type": node.type,
                            "node_label": node.id
                        }
                    )

                    # Add log entry
                    await self._add_log(run, node.id, f"Starting execution of {node.type} node")

                    # Execute node with timeout
                    result = await asyncio.wait_for(
                        self._execute_node_with_logging(node, context, run),
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

                    # Broadcast node completed
                    await self._broadcast_websocket_event(
                        run.execution_id,
                        "node_completed",
                        {
                            "node_id": node.id,
                            "node_type": node.type,
                            "cached": result.get('cached', False),
                            "output": str(result.get('output', ''))[:200]  # First 200 chars
                        }
                    )

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

            # Broadcast execution completed
            await self._broadcast_websocket_event(
                run.execution_id,
                "execution_completed",
                {
                    "status": run.status.value,
                    "end_time": run.end_time.isoformat(),
                    "duration_seconds": (run.end_time - run.start_time).total_seconds()
                }
            )

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

            # Broadcast execution error
            await self._broadcast_websocket_event(
                run.execution_id,
                "execution_error",
                {
                    "status": run.status.value,
                    "error": str(e),
                    "end_time": run.end_time.isoformat() if run.end_time else None
                }
            )

            # Cleanup agents on failure too
            if self.execution_context and self.execution_context.get("communication_mode") == CommunicationMode.PUBSUB:
                await self._cleanup_agents(run.execution_id)

            raise

    async def execute_distributed(self, workflow: Workflow, run: WorkflowRun, max_workers: int = 4) -> WorkflowRun:
        """
        Execute a workflow with distributed node execution across multiple workers.
        
        This method supports horizontal scaling by distributing node execution
        across multiple worker processes or containers.
        
        Args:
            workflow: The workflow definition to execute
            run: The workflow run record to track execution
            max_workers: Maximum number of concurrent workers for parallel execution
            
        Returns:
            Updated WorkflowRun with execution results
        """
        try:
            logger.info(f"Starting distributed workflow execution: {workflow.name} with {max_workers} max workers")
            
            # Build execution batches
            execution_batches = self._build_execution_order(workflow.nodes, workflow.edges)
            
            # Initialize distributed execution context
            distributed_context = {
                "workflow_id": str(workflow.id),
                "execution_id": run.execution_id,
                "max_workers": max_workers,
                "worker_pool": None,  # Could be integrated with Celery/RQ
                "distributed": True
            }
            
            # Set up semaphore for controlling concurrency
            semaphore = asyncio.Semaphore(max_workers)
            
            # Execute batches with controlled concurrency
            for batch_index, batch in enumerate(execution_batches):
                logger.info(f"Executing distributed batch {batch_index + 1}/{len(execution_batches)}")
                
                # Create tasks with semaphore control
                async def execute_with_semaphore(node):
                    async with semaphore:
                        return await self._execute_node_distributed(node, distributed_context, run)
                
                # Execute batch with concurrency control
                batch_tasks = [execute_with_semaphore(node) for node in batch]
                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                # Process results and check for errors
                for i, result in enumerate(batch_results):
                    node = batch[i]
                    if isinstance(result, Exception):
                        error_msg = f"Distributed execution failed for node {node.id}: {str(result)}"
                        logger.error(error_msg)
                        await self._add_error(run, node.id, error_msg)
                        raise WorkflowExecutionError(error_msg)
                    else:
                        run.node_states[node.id] = result
                        if isinstance(result, dict):
                            distributed_context[f"output_{node.id}"] = result.get("output")
                        else:
                            distributed_context[f"output_{node.id}"] = None
                
                await run.save()
            
            # Mark as successful
            run.status = ExecutionStatus.SUCCESS
            run.end_time = datetime.utcnow()
            await run.save()
            
            logger.info(f"Distributed workflow execution completed successfully")
            return run
            
        except Exception as e:
            logger.error(f"Distributed workflow execution failed: {str(e)}")
            run.status = ExecutionStatus.ERROR
            run.end_time = datetime.utcnow()
            await self._add_error(run, "workflow", f"Distributed execution failed: {str(e)}")
            await run.save()
            raise

    async def _execute_node_distributed(self, node: Node, context: Dict[str, Any], run: WorkflowRun) -> Dict[str, Any]:
        """
        Execute a single node in distributed mode.
        
        This method could be extended to dispatch node execution to remote workers.
        For now, it executes locally but with distributed-aware logging.
        
        Args:
            node: The node to execute
            context: Distributed execution context
            run: WorkflowRun for state tracking
            
        Returns:
            Dictionary with execution result
        """
        logger.info(f"Distributed execution of node: {node.id} (worker_id: {context.get('worker_id', 'local')})")
        
        # Add distributed execution metadata
        result = await self._execute_node(node, context, run)
        result["distributed"] = True
        result["worker_id"] = context.get("worker_id", "local")
        result["execution_mode"] = "distributed"
        
        return result

    def _build_execution_order(self, nodes: List[Node], edges: List) -> List[List[Node]]:
        """
        Build execution order using proper topological sort with parallel execution support.
        
        Returns:
            List of execution batches - nodes in each batch can run in parallel
        """
        # Build adjacency list and in-degree count
        node_map = {node.id: node for node in nodes}
        in_degree = {node.id: 0 for node in nodes}
        adjacency = {node.id: [] for node in nodes}
        
        # Process edges to build graph
        for edge in edges:
            if hasattr(edge, 'from_') and hasattr(edge, 'to'):
                from_id, to_id = edge.from_, edge.to
            elif hasattr(edge, 'source') and hasattr(edge, 'target'):
                from_id, to_id = edge.source, edge.target
            else:
                # Try to extract from dict-like edge
                from_id = edge.get('from', edge.get('source'))
                to_id = edge.get('to', edge.get('target'))
            
            if from_id and to_id and from_id in node_map and to_id in node_map:
                adjacency[from_id].append(to_id)
                in_degree[to_id] += 1
        
        # Detect cycles using DFS
        self._detect_cycles(nodes, adjacency)
        
        # Kahn's algorithm for topological sort with parallel batches
        execution_batches = []
        remaining_nodes = set(node_map.keys())
        
        while remaining_nodes:
            # Find all nodes with in-degree 0 (can execute in parallel)
            ready_nodes = [
                node_id for node_id in remaining_nodes 
                if in_degree[node_id] == 0
            ]
            
            if not ready_nodes:
                # This should not happen if cycle detection worked
                raise WorkflowExecutionError(
                    f"Circular dependency detected in workflow. Remaining nodes: {remaining_nodes}"
                )
            
            # Create execution batch
            batch = [node_map[node_id] for node_id in ready_nodes]
            execution_batches.append(batch)
            
            # Remove processed nodes and update in-degrees
            for node_id in ready_nodes:
                remaining_nodes.remove(node_id)
                # Reduce in-degree for dependent nodes
                for dependent_id in adjacency[node_id]:
                    if dependent_id in remaining_nodes:
                        in_degree[dependent_id] -= 1
        
        logger.info(f"Built {len(execution_batches)} execution batches for parallel execution")
        return execution_batches
    
    def _detect_cycles(self, nodes: List[Node], adjacency: Dict[str, List[str]]) -> None:
        """
        Detect cycles in the workflow DAG using DFS.
        
        Raises:
            WorkflowExecutionError: If a cycle is detected
        """
        # DFS-based cycle detection
        WHITE, GRAY, BLACK = 0, 1, 2
        colors = {node.id: WHITE for node in nodes}
        
        def dfs(node_id: str, path: List[str]) -> bool:
            if colors[node_id] == GRAY:
                # Back edge found - cycle detected
                cycle_start = path.index(node_id)
                cycle = path[cycle_start:] + [node_id]
                raise WorkflowExecutionError(
                    f"Cycle detected in workflow: {' -> '.join(cycle)}"
                )
            
            if colors[node_id] == BLACK:
                return False
            
            # Mark as being processed
            colors[node_id] = GRAY
            path.append(node_id)
            
            # Visit all adjacent nodes
            for neighbor_id in adjacency[node_id]:
                if dfs(neighbor_id, path):
                    return True
            
            # Mark as completely processed
            colors[node_id] = BLACK
            path.pop()
            return False
        
        # Check for cycles starting from each unvisited node
        for node in nodes:
            if colors[node.id] == WHITE:
                if dfs(node.id, []):
                    return  # Cycle found and exception raised
    
    def _get_execution_batches(self, nodes: List[Node], edges: List) -> List[List[Node]]:
        """
        Get execution batches - wrapper around _build_execution_order for backward compatibility.
        """
        return self._build_execution_order(nodes, edges)

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
        elif node_type == "loop":
            return await self._execute_loop_node(node, context)
        elif node_type == "end":
            return await self._execute_end_node(node, context)
        else:
            logger.warning(f"Unknown node type: {node_type}, skipping")
            return {"status": "skipped", "reason": f"Unknown node type: {node_type}"}

    async def _execute_node_with_logging(self, node: Node, context: Dict[str, Any], run: WorkflowRun) -> Dict[str, Any]:
        """
        Execute a single node with proper logging for parallel execution.
        
        Args:
            node: The node to execute
            context: Runtime context with variables and previous outputs
            run: WorkflowRun for state tracking
            
        Returns:
            Dictionary with execution result
        """
        try:
            logger.info(f"Starting execution of node: {node.id} (type: {node.type})")
            
            # Add log entry
            await self._add_log(run, node.id, f"Starting execution of {node.type} node")
            
            # Execute the node
            result = await self._execute_node(node, context, run)
            
            # Log successful completion
            await self._add_log(
                run,
                node.id,
                f"Completed successfully. Cached: {result.get('cached', False)}"
            )
            
            logger.info(f"Successfully completed node: {node.id}")
            return result
            
        except Exception as e:
            error_msg = f"Node {node.id} execution failed: {str(e)}"
            logger.error(error_msg)
            await self._add_error(run, node.id, error_msg)
            raise

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
            # Extract and interpolate email configuration
            to_email = self._interpolate_variables(node.config.get("to", ""), context)
            subject = self._interpolate_variables(node.config.get("subject", ""), context)
            body = self._interpolate_variables(node.config.get("body", ""), context)
            
            # Optional email fields
            from_email = self._interpolate_variables(
                node.config.get("from", os.getenv("SMTP_FROM_EMAIL", "noreply@chasmx.ai")), 
                context
            )
            cc = self._interpolate_variables(node.config.get("cc", ""), context)
            bcc = self._interpolate_variables(node.config.get("bcc", ""), context)
            
            # Email format (html or text)
            email_format = node.config.get("format", "text")  # 'html' or 'text'
            
            # Retry configuration
            max_retries = node.config.get("retries", 3)
            retry_delay = node.config.get("retry_delay", 1)  # seconds

            logger.info(f"Email Node: Sending to {to_email}")

            # Validate required fields
            if not to_email:
                raise ValueError("Recipient email address is required")
            if not subject:
                raise ValueError("Email subject is required")
            if not body:
                raise ValueError("Email body is required")

            # SMTP configuration from environment variables
            smtp_config = {
                "hostname": os.getenv("SMTP_HOST", "localhost"),
                "port": int(os.getenv("SMTP_PORT", 587)),
                "username": os.getenv("SMTP_USERNAME"),
                "password": os.getenv("SMTP_PASSWORD"),
                "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() == "true",
                "use_ssl": os.getenv("SMTP_USE_SSL", "false").lower() == "true",
            }

            # Allow node-specific SMTP override
            if "smtp" in node.config:
                smtp_override = node.config["smtp"]
                smtp_config.update({
                    "hostname": smtp_override.get("host", smtp_config["hostname"]),
                    "port": smtp_override.get("port", smtp_config["port"]),
                    "username": smtp_override.get("username", smtp_config["username"]),
                    "password": smtp_override.get("password", smtp_config["password"]),
                    "use_tls": smtp_override.get("use_tls", smtp_config["use_tls"]),
                    "use_ssl": smtp_override.get("use_ssl", smtp_config["use_ssl"]),
                })

            # Send email with retry logic
            last_error = None
            for attempt in range(max_retries + 1):
                try:
                    await self._send_email(
                        smtp_config=smtp_config,
                        from_email=from_email,
                        to_email=to_email,
                        cc=cc,
                        bcc=bcc,
                        subject=subject,
                        body=body,
                        email_format=email_format
                    )
                    
                    logger.info(f"Email sent successfully to {to_email} on attempt {attempt + 1}")
                    
                    return {
                        "status": "completed",
                        "output": f"Email sent to {to_email}",
                        "to": to_email,
                        "subject": subject,
                        "attempts": attempt + 1,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                except Exception as e:
                    last_error = e
                    if attempt < max_retries:
                        logger.warning(f"Email send attempt {attempt + 1} failed: {str(e)}. Retrying in {retry_delay}s...")
                        await asyncio.sleep(retry_delay)
                    else:
                        logger.error(f"Email send failed after {max_retries + 1} attempts: {str(e)}")

            # If we get here, all retries failed
            raise last_error or Exception("Email send failed")

        except Exception as e:
            logger.error(f"Email node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _send_email(
        self,
        smtp_config: Dict[str, Any],
        from_email: str,
        to_email: str,
        cc: str,
        bcc: str,
        subject: str,
        body: str,
        email_format: str = "text"
    ):
        """Send email using aiosmtplib"""
        # Create message
        if email_format.lower() == "html":
            msg = MimeMultipart("alternative")
            msg.attach(MimeText(body, "html"))
        else:
            msg = MimeText(body, "plain")
        
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        
        if cc:
            msg["Cc"] = cc
        if bcc:
            msg["Bcc"] = bcc

        # Prepare recipient list
        recipients = [to_email]
        if cc:
            recipients.extend([email.strip() for email in cc.split(",")])
        if bcc:
            recipients.extend([email.strip() for email in bcc.split(",")])

        # Configure SSL context
        if smtp_config["use_ssl"] or smtp_config["use_tls"]:
            ssl_context = ssl.create_default_context()
        else:
            ssl_context = None

        # Send email
        if smtp_config["use_ssl"]:
            # Use SSL from the start
            async with aiosmtplib.SMTP(
                hostname=smtp_config["hostname"],
                port=smtp_config["port"],
                use_tls=False,
                tls_context=ssl_context
            ) as smtp:
                await smtp.connect()
                if smtp_config["username"] and smtp_config["password"]:
                    await smtp.login(smtp_config["username"], smtp_config["password"])
                await smtp.send_message(msg, recipients=recipients)
        else:
            # Use STARTTLS or no encryption
            async with aiosmtplib.SMTP(
                hostname=smtp_config["hostname"],
                port=smtp_config["port"],
                use_tls=smtp_config["use_tls"],
                tls_context=ssl_context if smtp_config["use_tls"] else None
            ) as smtp:
                if smtp_config["username"] and smtp_config["password"]:
                    await smtp.login(smtp_config["username"], smtp_config["password"])
                await smtp.send_message(msg, recipients=recipients)

    async def _execute_data_source_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data source node - fetches data from databases/APIs"""
        try:
            source_type = node.config.get("source_type", "api")

            logger.info(f"Data Source Node: Fetching from {source_type}")

            # MongoDB data source
            if source_type == "mongodb":
                return await self._fetch_from_mongodb(node, context)

            # API data source (future implementation)
            elif source_type == "api":
                endpoint = node.config.get("endpoint", "")
                # TODO: Implement API fetching
                await asyncio.sleep(0.3)
                return {
                    "status": "completed",
                    "output": {"data": "mock_api_data", "count": 0},
                    "source_type": source_type,
                    "timestamp": datetime.utcnow().isoformat()
                }

            else:
                raise ValueError(f"Unsupported source type: {source_type}")

        except Exception as e:
            logger.error(f"Data source node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _fetch_from_mongodb(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch data from MongoDB Atlas"""
        try:
            from ..core.database import get_database

            # Get MongoDB configuration from node
            collection_name = node.config.get("collection", "users")
            query_filter = node.config.get("query", {})
            projection = node.config.get("projection", None)
            limit = node.config.get("limit", 100)
            sort_field = node.config.get("sort_field", None)
            sort_order = node.config.get("sort_order", 1)  # 1 for ascending, -1 for descending

            # Interpolate variables in query filter
            if isinstance(query_filter, dict):
                query_filter = self._interpolate_dict_values(query_filter, context)

            logger.info(f"Fetching from MongoDB collection: {collection_name}, limit: {limit}")

            # Get database connection
            db = await get_database()
            collection = db[collection_name]

            # Build query
            cursor = collection.find(query_filter, projection)

            # Apply sorting if specified
            if sort_field:
                cursor = cursor.sort(sort_field, sort_order)

            # Apply limit
            cursor = cursor.limit(limit)

            # Fetch results
            results = []
            async for doc in cursor:
                # Convert ObjectId to string for JSON serialization
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                results.append(doc)

            logger.info(f"Fetched {len(results)} documents from MongoDB")

            return {
                "status": "completed",
                "output": results,
                "count": len(results),
                "collection": collection_name,
                "source_type": "mongodb",
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"MongoDB fetch failed: {str(e)}")
            raise

    async def _execute_webhook_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute webhook node - makes HTTP request"""
        try:
            # Extract and interpolate webhook configuration
            url = self._interpolate_variables(node.config.get("url", ""), context)
            method = node.config.get("method", "POST").upper()
            
            # Request data/body
            body_data = node.config.get("body", {})
            if isinstance(body_data, str):
                body_data = self._interpolate_variables(body_data, context)
            elif isinstance(body_data, dict):
                # Recursively interpolate dictionary values
                body_data = self._interpolate_dict_values(body_data, context)
            
            # Headers configuration
            headers = node.config.get("headers", {})
            if isinstance(headers, dict):
                headers = self._interpolate_dict_values(headers, context)
            
            # Authentication
            auth_config = node.config.get("auth", {})
            
            # Query parameters
            params = node.config.get("params", {})
            if isinstance(params, dict):
                params = self._interpolate_dict_values(params, context)
            
            # Timeout and retry configuration
            timeout = node.config.get("timeout", 30)  # seconds
            max_retries = node.config.get("retries", 3)
            retry_delay = node.config.get("retry_delay", 1)  # seconds
            
            # Response validation
            expected_status = node.config.get("expected_status", [200, 201, 202, 204])
            if isinstance(expected_status, int):
                expected_status = [expected_status]

            logger.info(f"Webhook Node: {method} {url}")

            # Validate required fields
            if not url:
                raise ValueError("Webhook URL is required")

            # Execute webhook with retry logic
            last_error = None
            for attempt in range(max_retries + 1):
                try:
                    response_data = await self._execute_http_request(
                        url=url,
                        method=method,
                        headers=headers,
                        body_data=body_data,
                        params=params,
                        auth_config=auth_config,
                        timeout=timeout
                    )
                    
                    # Check if status code is expected
                    if response_data["status_code"] not in expected_status:
                        raise ValueError(
                            f"Unexpected status code {response_data['status_code']}. "
                            f"Expected one of: {expected_status}"
                        )
                    
                    logger.info(f"Webhook request successful on attempt {attempt + 1}")
                    
                    return {
                        "status": "completed",
                        "output": response_data,
                        "url": url,
                        "method": method,
                        "attempts": attempt + 1,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                except Exception as e:
                    last_error = e
                    if attempt < max_retries:
                        logger.warning(f"Webhook attempt {attempt + 1} failed: {str(e)}. Retrying in {retry_delay}s...")
                        await asyncio.sleep(retry_delay)
                    else:
                        logger.error(f"Webhook failed after {max_retries + 1} attempts: {str(e)}")

            # If we get here, all retries failed
            raise last_error or Exception("Webhook request failed")

        except Exception as e:
            logger.error(f"Webhook node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _execute_http_request(
        self,
        url: str,
        method: str,
        headers: Dict[str, str],
        body_data: Any,
        params: Dict[str, str],
        auth_config: Dict[str, Any],
        timeout: int
    ) -> Dict[str, Any]:
        """Execute HTTP request using aiohttp"""
        
        # Prepare request headers
        request_headers = {"User-Agent": "ChasmX-Workflow-Engine/1.0"}
        request_headers.update(headers)
        
        # Handle authentication
        auth = None
        if auth_config:
            auth_type = auth_config.get("type", "").lower()
            if auth_type == "basic":
                username = auth_config.get("username", "")
                password = auth_config.get("password", "")
                if username and password:
                    auth = aiohttp.BasicAuth(username, password)
            elif auth_type == "bearer":
                token = auth_config.get("token", "")
                if token:
                    request_headers["Authorization"] = f"Bearer {token}"
            elif auth_type == "api_key":
                key = auth_config.get("key", "")
                header_name = auth_config.get("header", "X-API-Key")
                if key:
                    request_headers[header_name] = key

        # Prepare request body
        json_data = None
        data = None
        
        if body_data:
            content_type = request_headers.get("Content-Type", "").lower()
            if content_type.startswith("application/json") or isinstance(body_data, dict):
                json_data = body_data
                if "Content-Type" not in request_headers:
                    request_headers["Content-Type"] = "application/json"
            else:
                data = body_data if isinstance(body_data, (str, bytes)) else str(body_data)

        # Configure timeout
        timeout_config = aiohttp.ClientTimeout(total=timeout)

        # Execute request
        async with aiohttp.ClientSession(timeout=timeout_config) as session:
            async with session.request(
                method=method,
                url=url,
                headers=request_headers,
                params=params,
                json=json_data,
                data=data,
                auth=auth
            ) as response:
                # Read response
                response_text = ""
                response_json = None
                try:
                    response_text = await response.text()
                    if response.content_type == "application/json":
                        response_json = await response.json()
                except Exception as e:
                    logger.warning(f"Failed to parse response: {e}")

                return {
                    "status_code": response.status,
                    "headers": dict(response.headers),
                    "text": response_text,
                    "json": response_json,
                    "content_type": response.content_type,
                    "size": len(response_text),
                    "url": str(response.url)
                }

    def _interpolate_dict_values(self, data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively interpolate dictionary values"""
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = self._interpolate_variables(value, context)
            elif isinstance(value, dict):
                result[key] = self._interpolate_dict_values(value, context)
            elif isinstance(value, list):
                result[key] = [
                    self._interpolate_variables(item, context) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                result[key] = value
        return result

    async def _execute_filter_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute filter node - filters data based on conditions"""
        try:
            filter_type = node.config.get("filter_type", "condition")
            input_data = context.get("input_data", context.get("variables", {}))
            
            logger.info(f"Filter Node: Applying {filter_type} filter")

            if filter_type == "condition":
                # Boolean condition filtering
                condition = node.config.get("condition", "true")
                condition = self._interpolate_variables(condition, context)
                
                # Safe condition evaluation
                result = self._evaluate_safe_condition(condition, context)
                
                if result:
                    filtered_data = input_data
                    status = "passed"
                else:
                    filtered_data = {}
                    status = "filtered_out"
                    
                return {
                    "status": "completed",
                    "output": filtered_data,
                    "filter_result": status,
                    "condition": condition,
                    "condition_result": result,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
            elif filter_type == "array":
                # Array element filtering
                array_path = node.config.get("array_path", "data")
                filter_condition = node.config.get("filter_condition", "")
                
                # Get array from context
                array_data = self._get_nested_value(input_data, array_path, [])
                if not isinstance(array_data, list):
                    array_data = []
                
                # Filter array elements
                filtered_array = []
                for item in array_data:
                    item_context = {**context, "item": item}
                    if self._evaluate_safe_condition(filter_condition, item_context):
                        filtered_array.append(item)
                
                # Update the filtered data
                filtered_data = self._set_nested_value(input_data.copy(), array_path, filtered_array)
                
                return {
                    "status": "completed",
                    "output": filtered_data,
                    "filter_result": "array_filtered",
                    "original_count": len(array_data),
                    "filtered_count": len(filtered_array),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
            elif filter_type == "object":
                # Object property filtering
                include_fields = node.config.get("include_fields", [])
                exclude_fields = node.config.get("exclude_fields", [])
                
                if isinstance(input_data, dict):
                    filtered_data = input_data.copy()
                    
                    # Apply include filter (whitelist)
                    if include_fields:
                        filtered_data = {k: v for k, v in filtered_data.items() if k in include_fields}
                    
                    # Apply exclude filter (blacklist)
                    if exclude_fields:
                        filtered_data = {k: v for k, v in filtered_data.items() if k not in exclude_fields}
                else:
                    filtered_data = input_data
                
                return {
                    "status": "completed",
                    "output": filtered_data,
                    "filter_result": "object_filtered",
                    "include_fields": include_fields,
                    "exclude_fields": exclude_fields,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
            else:
                raise ValueError(f"Unsupported filter type: {filter_type}")

        except Exception as e:
            logger.error(f"Filter node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
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
            input_data = context.get("input_data", context.get("variables", {}))

            logger.info(f"Transformer Node: Applying {transform_type} transformation")

            if transform_type == "map":
                # Field mapping transformation
                field_mappings = node.config.get("field_mappings", {})
                # field_mappings format: {"new_field": "old_field", "name": "full_name"}
                
                if isinstance(input_data, dict):
                    transformed_data = {}
                    for new_field, old_field in field_mappings.items():
                        # Support dot notation for nested fields
                        value = self._get_nested_value(input_data, old_field)
                        if value is not None:
                            # Support interpolation in field values
                            if isinstance(value, str):
                                value = self._interpolate_variables(value, context)
                            self._set_nested_value(transformed_data, new_field, value)
                    
                    # Copy unmapped fields if configured
                    if node.config.get("copy_unmapped", False):
                        for key, value in input_data.items():
                            if key not in field_mappings.values() and key not in transformed_data:
                                transformed_data[key] = value
                                
                elif isinstance(input_data, list):
                    # Apply mapping to each item in array
                    transformed_data = []
                    for item in input_data:
                        if isinstance(item, dict):
                            mapped_item = {}
                            for new_field, old_field in field_mappings.items():
                                value = self._get_nested_value(item, old_field)
                                if value is not None:
                                    if isinstance(value, str):
                                        value = self._interpolate_variables(value, context)
                                    self._set_nested_value(mapped_item, new_field, value)
                            transformed_data.append(mapped_item)
                        else:
                            transformed_data.append(item)
                else:
                    transformed_data = input_data

            elif transform_type == "aggregate":
                # Data aggregation
                operation = node.config.get("operation", "count")
                group_by = node.config.get("group_by")
                
                if isinstance(input_data, list):
                    if group_by:
                        # Group by field and aggregate
                        groups = {}
                        for item in input_data:
                            if isinstance(item, dict):
                                key = self._get_nested_value(item, group_by, "unknown")
                                if key not in groups:
                                    groups[key] = []
                                groups[key].append(item)
                        
                        transformed_data = {}
                        for key, items in groups.items():
                            transformed_data[key] = self._apply_aggregation(items, operation)
                    else:
                        # Aggregate all items
                        transformed_data = self._apply_aggregation(input_data, operation)
                else:
                    transformed_data = input_data

            elif transform_type == "flatten":
                # Flatten nested structures
                max_depth = node.config.get("max_depth", 1)
                transformed_data = self._flatten_data(input_data, max_depth)

            elif transform_type == "convert":
                # Data type conversion
                conversions = node.config.get("conversions", {})
                # conversions format: {"field_name": "target_type"}
                
                transformed_data = self._apply_type_conversions(input_data, conversions)

            elif transform_type == "merge":
                # Merge with additional data
                merge_data = node.config.get("merge_data", {})
                merge_strategy = node.config.get("merge_strategy", "update")  # update, overwrite, keep_original
                
                if isinstance(input_data, dict) and isinstance(merge_data, dict):
                    transformed_data = input_data.copy()
                    if merge_strategy == "update":
                        transformed_data.update(merge_data)
                    elif merge_strategy == "overwrite":
                        transformed_data = {**merge_data, **transformed_data}
                    elif merge_strategy == "keep_original":
                        for key, value in merge_data.items():
                            if key not in transformed_data:
                                transformed_data[key] = value
                else:
                    transformed_data = input_data

            elif transform_type == "extract":
                # Extract specific fields or nested values
                extract_paths = node.config.get("extract_paths", [])
                # extract_paths format: ["field1", "nested.field", "array.0.value"]
                
                transformed_data = {}
                for path in extract_paths:
                    value = self._get_nested_value(input_data, path)
                    if value is not None:
                        # Use the last part of the path as the key
                        key = path.split('.')[-1]
                        transformed_data[key] = value

            else:
                raise ValueError(f"Unsupported transform type: {transform_type}")

            return {
                "status": "completed",
                "output": transformed_data,
                "transform_type": transform_type,
                "input_size": len(str(input_data)) if input_data else 0,
                "output_size": len(str(transformed_data)) if transformed_data else 0,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Transformer node execution failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _apply_aggregation(self, data: List[Any], operation: str) -> Any:
        """Apply aggregation operation to data"""
        if not data:
            return None
            
        if operation == "count":
            return len(data)
        elif operation == "sum":
            return sum(float(x) for x in data if isinstance(x, (int, float, str)) and str(x).replace('.', '').isdigit())
        elif operation == "avg" or operation == "average":
            numbers = [float(x) for x in data if isinstance(x, (int, float, str)) and str(x).replace('.', '').isdigit()]
            return sum(numbers) / len(numbers) if numbers else 0
        elif operation == "min":
            numbers = [float(x) for x in data if isinstance(x, (int, float, str)) and str(x).replace('.', '').isdigit()]
            return min(numbers) if numbers else None
        elif operation == "max":
            numbers = [float(x) for x in data if isinstance(x, (int, float, str)) and str(x).replace('.', '').isdigit()]
            return max(numbers) if numbers else None
        elif operation == "first":
            return data[0] if data else None
        elif operation == "last":
            return data[-1] if data else None
        else:
            return data

    def _flatten_data(self, data: Any, max_depth: int, current_depth: int = 0) -> Any:
        """Recursively flatten nested data structures"""
        if current_depth >= max_depth:
            return data
            
        if isinstance(data, dict):
            result = {}
            for key, value in data.items():
                if isinstance(value, dict) and current_depth < max_depth:
                    # Flatten nested dict
                    flattened = self._flatten_data(value, max_depth, current_depth + 1)
                    if isinstance(flattened, dict):
                        for nested_key, nested_value in flattened.items():
                            result[f"{key}.{nested_key}"] = nested_value
                    else:
                        result[key] = flattened
                else:
                    result[key] = value
            return result
        elif isinstance(data, list):
            result = []
            for item in data:
                if isinstance(item, (dict, list)) and current_depth < max_depth:
                    flattened = self._flatten_data(item, max_depth, current_depth + 1)
                    if isinstance(flattened, list):
                        result.extend(flattened)
                    else:
                        result.append(flattened)
                else:
                    result.append(item)
            return result
        else:
            return data

    def _apply_type_conversions(self, data: Any, conversions: Dict[str, str]) -> Any:
        """Apply type conversions to data"""
        if isinstance(data, dict):
            result = data.copy()
            for field, target_type in conversions.items():
                value = self._get_nested_value(result, field)
                if value is not None:
                    converted_value = self._convert_value(value, target_type)
                    self._set_nested_value(result, field, converted_value)
            return result
        elif isinstance(data, list):
            return [self._apply_type_conversions(item, conversions) for item in data]
        else:
            return data

    def _convert_value(self, value: Any, target_type: str) -> Any:
        """Convert a single value to target type"""
        try:
            if target_type == "string" or target_type == "str":
                return str(value)
            elif target_type == "integer" or target_type == "int":
                return int(float(value))  # Handle string numbers
            elif target_type == "float" or target_type == "number":
                return float(value)
            elif target_type == "boolean" or target_type == "bool":
                if isinstance(value, str):
                    return value.lower() in ("true", "1", "yes", "on")
                return bool(value)
            elif target_type == "list" or target_type == "array":
                if isinstance(value, str):
                    # Try to parse as JSON array or split by comma
                    try:
                        import json
                        return json.loads(value)
                    except:
                        return [item.strip() for item in value.split(',')]
                elif not isinstance(value, list):
                    return [value]
                return value
            else:
                return value
        except (ValueError, TypeError):
            logger.warning(f"Failed to convert {value} to {target_type}")
            return value

    async def _execute_condition_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute condition node - branching logic"""
        try:
            condition_type = node.config.get("condition_type", "simple")
            
            logger.info(f"Condition Node: Evaluating {condition_type} condition")

            if condition_type == "simple":
                # Simple boolean condition
                condition = node.config.get("condition", "true")
                condition = self._interpolate_variables(condition, context)
                
                result = self._evaluate_safe_condition(condition, context)
                
                # Determine next path based on result
                true_path = node.config.get("true_path")
                false_path = node.config.get("false_path")
                next_node = true_path if result else false_path
                
                return {
                    "status": "completed",
                    "output": {
                        "condition_result": result,
                        "next_node": next_node,
                        "path_taken": "true" if result else "false"
                    },
                    "condition": condition,
                    "result": result,
                    "timestamp": datetime.utcnow().isoformat()
                }

            elif condition_type == "switch":
                # Multi-way switch based on value
                switch_value = node.config.get("switch_value", "")
                switch_value = self._interpolate_variables(switch_value, context)
                
                cases = node.config.get("cases", {})
                default_case = node.config.get("default_case")
                
                # Find matching case
                next_node = None
                matched_case = None
                
                for case_value, case_node in cases.items():
                    if str(switch_value) == str(case_value):
                        next_node = case_node
                        matched_case = case_value
                        break
                
                # Use default if no match found
                if next_node is None:
                    next_node = default_case
                    matched_case = "default"
                
                return {
                    "status": "completed",
                    "output": {
                        "switch_value": switch_value,
                        "matched_case": matched_case,
                        "next_node": next_node
                    },
                    "switch_value": switch_value,
                    "matched_case": matched_case,
                    "timestamp": datetime.utcnow().isoformat()
                }

            elif condition_type == "multi":
                # Multiple conditions with AND/OR logic
                conditions = node.config.get("conditions", [])
                logic_operator = node.config.get("logic_operator", "AND").upper()
                
                results = []
                for condition_config in conditions:
                    condition_expr = condition_config.get("condition", "true")
                    condition_expr = self._interpolate_variables(condition_expr, context)
                    
                    condition_result = self._evaluate_safe_condition(condition_expr, context)
                    results.append({
                        "condition": condition_expr,
                        "result": condition_result,
                        "weight": condition_config.get("weight", 1.0)
                    })
                
                # Apply logic operator
                if logic_operator == "AND":
                    final_result = all(r["result"] for r in results)
                elif logic_operator == "OR":
                    final_result = any(r["result"] for r in results)
                elif logic_operator == "WEIGHTED":
                    # Weighted voting
                    total_weight = sum(r["weight"] for r in results)
                    true_weight = sum(r["weight"] for r in results if r["result"])
                    threshold = node.config.get("threshold", 0.5)
                    final_result = (true_weight / total_weight) >= threshold if total_weight > 0 else False
                else:
                    final_result = False
                
                # Determine next path
                true_path = node.config.get("true_path")
                false_path = node.config.get("false_path")
                next_node = true_path if final_result else false_path
                
                return {
                    "status": "completed",
                    "output": {
                        "final_result": final_result,
                        "individual_results": results,
                        "logic_operator": logic_operator,
                        "next_node": next_node
                    },
                    "result": final_result,
                    "timestamp": datetime.utcnow().isoformat()
                }

            elif condition_type == "range":
                # Range-based condition (numeric ranges)
                value = node.config.get("value", "0")
                value = self._interpolate_variables(str(value), context)
                
                try:
                    numeric_value = float(value)
                except ValueError:
                    numeric_value = 0
                
                ranges = node.config.get("ranges", [])
                # ranges format: [{"min": 0, "max": 10, "node": "node1"}, ...]
                
                next_node = None
                matched_range = None
                
                for range_config in ranges:
                    min_val = range_config.get("min", float('-inf'))
                    max_val = range_config.get("max", float('inf'))
                    
                    if min_val <= numeric_value <= max_val:
                        next_node = range_config.get("node")
                        matched_range = f"{min_val}-{max_val}"
                        break
                
                # Use default if no range matched
                if next_node is None:
                    next_node = node.config.get("default_node")
                    matched_range = "default"
                
                return {
                    "status": "completed",
                    "output": {
                        "value": numeric_value,
                        "matched_range": matched_range,
                        "next_node": next_node
                    },
                    "value": numeric_value,
                    "matched_range": matched_range,
                    "timestamp": datetime.utcnow().isoformat()
                }

            else:
                raise ValueError(f"Unsupported condition type: {condition_type}")

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

    async def _execute_loop_node(self, node: Node, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute loop node - iteration and repeated execution"""
        try:
            loop_type = node.config.get("loop_type", "for")
            
            logger.info(f"Loop Node: Executing {loop_type} loop")

            if loop_type == "for":
                # For loop over array/range
                array_path = node.config.get("array_path", "items")
                iterator_name = node.config.get("iterator_name", "item")
                index_name = node.config.get("index_name", "index")
                
                # Get array data
                input_data = context.get("input_data", context.get("variables", {}))
                array_data = self._get_nested_value(input_data, array_path, [])
                
                if not isinstance(array_data, list):
                    array_data = []
                
                results = []
                loop_context = context.copy()
                
                for index, item in enumerate(array_data):
                    # Update loop context with current item and index
                    loop_context["variables"] = loop_context.get("variables", {}).copy()
                    loop_context["variables"][iterator_name] = item
                    loop_context["variables"][index_name] = index
                    
                    # Execute loop body (would need sub-workflow execution)
                    # For now, just collect the items
                    iteration_result = {
                        "index": index,
                        "item": item,
                        "iteration_context": {iterator_name: item, index_name: index}
                    }
                    
                    # Apply any transformations or conditions within loop
                    loop_action = node.config.get("loop_action", "collect")
                    if loop_action == "transform":
                        transform_expr = node.config.get("transform_expression", "{{item}}")
                        transformed_item = self._interpolate_variables(transform_expr, loop_context)
                        iteration_result["transformed"] = transformed_item
                    elif loop_action == "filter":
                        filter_condition = node.config.get("filter_condition", "true")
                        if self._evaluate_safe_condition(filter_condition, loop_context):
                            iteration_result["included"] = True
                        else:
                            iteration_result["included"] = False
                            continue  # Skip this iteration
                    
                    results.append(iteration_result)
                
                return {
                    "status": "completed",
                    "output": {
                        "results": results,
                        "iterations": len(array_data),
                        "successful_iterations": len(results)
                    },
                    "loop_type": loop_type,
                    "iterations": len(array_data),
                    "timestamp": datetime.utcnow().isoformat()
                }

            elif loop_type == "while":
                # While loop with condition
                condition = node.config.get("condition", "false")
                max_iterations = node.config.get("max_iterations", 100)
                
                results = []
                iteration_count = 0
                loop_context = context.copy()
                
                while iteration_count < max_iterations:
                    # Evaluate loop condition
                    current_condition = self._interpolate_variables(condition, loop_context)
                    if not self._evaluate_safe_condition(current_condition, loop_context):
                        break
                    
                    # Execute iteration
                    iteration_result = {
                        "iteration": iteration_count,
                        "condition": current_condition,
                        "context_snapshot": loop_context.get("variables", {}).copy()
                    }
                    
                    # Update loop variables
                    increment_var = node.config.get("increment_variable")
                    increment_value = node.config.get("increment_value", 1)
                    
                    if increment_var:
                        current_value = loop_context.get("variables", {}).get(increment_var, 0)
                        try:
                            new_value = float(current_value) + float(increment_value)
                            loop_context.setdefault("variables", {})[increment_var] = new_value
                        except (ValueError, TypeError):
                            break  # Break if can't increment
                    
                    results.append(iteration_result)
                    iteration_count += 1
                
                return {
                    "status": "completed",
                    "output": {
                        "results": results,
                        "iterations": iteration_count,
                        "terminated_by": "condition" if iteration_count < max_iterations else "max_iterations"
                    },
                    "loop_type": loop_type,
                    "iterations": iteration_count,
                    "timestamp": datetime.utcnow().isoformat()
                }

            elif loop_type == "range":
                # Numeric range loop
                start = node.config.get("start", 0)
                end = node.config.get("end", 10)
                step = node.config.get("step", 1)
                counter_name = node.config.get("counter_name", "counter")
                
                # Interpolate range values
                start = int(float(self._interpolate_variables(str(start), context)))
                end = int(float(self._interpolate_variables(str(end), context)))
                step = int(float(self._interpolate_variables(str(step), context)))
                
                if step == 0:
                    step = 1  # Prevent infinite loop
                
                results = []
                loop_context = context.copy()
                
                current = start
                iteration_count = 0
                max_iterations = abs(end - start) + 1
                
                while (step > 0 and current < end) or (step < 0 and current > end):
                    if iteration_count >= max_iterations:
                        break
                    
                    # Update loop context
                    loop_context["variables"] = loop_context.get("variables", {}).copy()
                    loop_context["variables"][counter_name] = current
                    
                    iteration_result = {
                        "iteration": iteration_count,
                        "counter_value": current,
                        "counter_name": counter_name
                    }
                    
                    results.append(iteration_result)
                    current += step
                    iteration_count += 1
                
                return {
                    "status": "completed",
                    "output": {
                        "results": results,
                        "iterations": iteration_count,
                        "range": {"start": start, "end": end, "step": step}
                    },
                    "loop_type": loop_type,
                    "iterations": iteration_count,
                    "timestamp": datetime.utcnow().isoformat()
                }

            else:
                raise ValueError(f"Unsupported loop type: {loop_type}")

        except Exception as e:
            logger.error(f"Loop node execution failed: {str(e)}")
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

    def _evaluate_safe_condition(self, condition: str, context: Dict[str, Any]) -> bool:
        """
        Safely evaluate a condition string with access to context variables.
        Only allows basic comparison operations for security.
        """
        if not condition:
            return True
            
        # Interpolate variables first
        condition = self._interpolate_variables(condition, context)
        
        # Simple condition evaluation - only allow basic comparisons
        try:
            # Remove extra whitespace
            condition = condition.strip()
            
            # Handle boolean literals
            if condition.lower() == "true":
                return True
            elif condition.lower() == "false":
                return False
            
            # Handle simple comparisons (==, !=, <, >, <=, >=)
            operators = ["==", "!=", "<=", ">=", "<", ">"]
            for op in operators:
                if op in condition:
                    left, right = condition.split(op, 1)
                    left = left.strip().strip('"\'')
                    right = right.strip().strip('"\'')
                    
                    # Try to convert to numbers if possible
                    try:
                        left_num = float(left)
                        right_num = float(right)
                        if op == "==": return left_num == right_num
                        elif op == "!=": return left_num != right_num
                        elif op == "<": return left_num < right_num
                        elif op == ">": return left_num > right_num
                        elif op == "<=": return left_num <= right_num
                        elif op == ">=": return left_num >= right_num
                    except ValueError:
                        # String comparison
                        if op == "==": return left == right
                        elif op == "!=": return left != right
                        elif op == "<": return left < right
                        elif op == ">": return left > right
                        elif op == "<=": return left <= right
                        elif op == ">=": return left >= right
                    break
            
            # If no operators found, try to evaluate as boolean
            return bool(condition)
            
        except Exception as e:
            logger.warning(f"Failed to evaluate condition '{condition}': {e}")
            return False

    def _get_nested_value(self, data: Any, path: str, default: Any = None) -> Any:
        """Get a nested value from a dictionary using dot notation"""
        if not path:
            return data
            
        try:
            keys = path.split('.')
            current = data
            for key in keys:
                if isinstance(current, dict):
                    current = current.get(key, default)
                elif isinstance(current, list) and key.isdigit():
                    idx = int(key)
                    current = current[idx] if 0 <= idx < len(current) else default
                else:
                    return default
            return current
        except (KeyError, IndexError, ValueError):
            return default

    def _set_nested_value(self, data: Dict[str, Any], path: str, value: Any) -> Dict[str, Any]:
        """Set a nested value in a dictionary using dot notation"""
        if not path:
            return data
            
        keys = path.split('.')
        current = data
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        current[keys[-1]] = value
        return data

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
        comm_mode = self.execution_context.get("communication_mode", CommunicationMode.SIMPLE) if self.execution_context else CommunicationMode.SIMPLE

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
        comm_mode = self.execution_context.get("communication_mode", CommunicationMode.SIMPLE) if self.execution_context else CommunicationMode.SIMPLE

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
        execution_id = self.execution_context.get("execution_id") if self.execution_context else None
        source_agent_id = self.active_agents.get(execution_id, {}).get(source_node_id) if execution_id else None
        target_agent_id = self.active_agents.get(execution_id, {}).get(target_node_id) if execution_id else None

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
            execution_id = self.execution_context.get("execution_id") if self.execution_context else None
            source_agent_id = self.active_agents.get(execution_id, {}).get(source_node_id) if execution_id else None

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
