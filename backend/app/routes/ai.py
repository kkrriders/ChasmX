"""
API routes for AI and Agent services.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from loguru import logger

from ..services.ai_service_manager import ai_service_manager
from ..services.llm.base import LLMRequest, LLMResponse, LLMMessage, ModelRole
from ..services.agents.orchestrator import Agent, Task
from ..services.agents.acp import AgentPreferences, MemoryType

router = APIRouter(prefix="/ai", tags=["AI & Agents"])


# Request/Response Models

class ChatRequest(BaseModel):
    """Request for chat completion"""
    messages: List[Dict[str, str]] = Field(..., description="Chat messages")
    model_id: Optional[str] = Field(None, description="Model to use")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, gt=0)
    use_cache: bool = Field(default=True)


class ChatResponse(BaseModel):
    """Response from chat completion"""
    content: str
    model_id: str
    cached: bool
    usage: Optional[Dict[str, int]] = None
    latency_ms: Optional[float] = None


class RegisterAgentRequest(BaseModel):
    """Request to register a new agent"""
    agent_id: str
    agent_type: str
    name: str
    capabilities: List[str]
    preferred_model: Optional[str] = None


class CreateTaskRequest(BaseModel):
    """Request to create a new task"""
    name: str
    description: str
    required_capabilities: List[str]
    input_data: Dict[str, Any]
    priority: str = "medium"


class AddMemoryRequest(BaseModel):
    """Request to add memory to agent"""
    content: str
    memory_type: str
    importance: float = 0.5
    metadata: Optional[Dict[str, Any]] = None


class AddRuleRequest(BaseModel):
    """Request to add rule to agent"""
    name: str
    description: str
    condition: str
    action: str
    priority: int = 0


# Health Check

@router.get("/health")
async def health_check():
    """Check AI services health"""
    if not ai_service_manager._initialized:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI services not initialized"
        )

    stats = await ai_service_manager.get_stats()
    return {
        "status": "healthy",
        "services": {
            "llm": "operational",
            "cache": "operational" if stats.get("cache", {}).get("connected") else "unavailable",
            "orchestrator": "operational"
        },
        "stats": stats
    }


# LLM Endpoints

@router.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """
    Generate a chat completion using LLM.
    """
    try:
        llm_service = ai_service_manager.get_llm_service()

        # Convert messages to LLMMessage format
        messages = [
            LLMMessage(role=msg["role"], content=msg["content"])
            for msg in request.messages
        ]

        # Use default model if not specified
        model_id = request.model_id or "google/gemini-2.0-flash-exp:free"

        # Create LLM request
        llm_request = LLMRequest(
            messages=messages,
            model_id=model_id,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            use_cache=request.use_cache
        )

        # Get response
        response = await llm_service.complete(llm_request)

        return ChatResponse(
            content=response.content,
            model_id=response.model_id,
            cached=response.cached,
            usage=response.usage.model_dump() if response.usage else None,
            latency_ms=response.latency_ms
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat completion failed: {str(e)}"
        )


@router.get("/models")
async def list_models():
    """List available LLM models"""
    try:
        llm_service = ai_service_manager.get_llm_service()
        provider = llm_service.provider

        models = []
        for config in provider.model_configs.values():
            models.append({
                "model_id": config.model_id,
                "name": config.name,
                "role": config.role,
                "context_length": config.context_length,
                "description": config.description
            })

        return {"models": models}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list models: {str(e)}"
        )


# Agent Endpoints

@router.post("/agents/register", response_model=Agent)
async def register_agent(request: RegisterAgentRequest):
    """Register a new agent"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()

        agent = await orchestrator.register_agent(
            agent_id=request.agent_id,
            agent_type=request.agent_type,
            name=request.name,
            capabilities=request.capabilities,
            preferred_model=request.preferred_model
        )

        return agent

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register agent: {str(e)}"
        )


@router.get("/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    """Get agent details"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()
        agent = orchestrator.get_agent(agent_id)

        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent not found: {agent_id}"
            )

        return agent

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent: {str(e)}"
        )


@router.get("/agents")
async def list_agents():
    """List all registered agents"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()
        agents = list(orchestrator.agents.values())
        return {"agents": agents}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list agents: {str(e)}"
        )


@router.delete("/agents/{agent_id}")
async def unregister_agent(agent_id: str):
    """Unregister an agent"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()
        await orchestrator.unregister_agent(agent_id)
        return {"message": f"Agent {agent_id} unregistered"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unregister agent: {str(e)}"
        )


# Task Endpoints

@router.post("/tasks", response_model=Task)
async def create_task(request: CreateTaskRequest):
    """Create a new task"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()

        from ..services.agents.aap import MessagePriority
        priority = MessagePriority(request.priority.lower())

        task = await orchestrator.create_task(
            name=request.name,
            description=request.description,
            required_capabilities=request.required_capabilities,
            input_data=request.input_data,
            priority=priority
        )

        return task

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )


@router.post("/tasks/{task_id}/assign")
async def assign_task(task_id: str, agent_id: Optional[str] = None):
    """Assign a task to an agent"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()
        success = await orchestrator.assign_task(task_id, agent_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to assign task"
            )

        return {"message": "Task assigned successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign task: {str(e)}"
        )


@router.post("/tasks/{task_id}/execute")
async def execute_task(task_id: str):
    """Execute a task"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()
        result = await orchestrator.execute_task(task_id)

        return {"result": result}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Task execution failed: {str(e)}"
        )


@router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """Get task details"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()
        task = orchestrator.tasks.get(task_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task not found: {task_id}"
            )

        return task

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task: {str(e)}"
        )


@router.get("/tasks")
async def list_tasks():
    """List all tasks"""
    try:
        orchestrator = ai_service_manager.get_orchestrator()
        tasks = list(orchestrator.tasks.values())
        return {"tasks": tasks}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tasks: {str(e)}"
        )


# Agent Context Endpoints

@router.post("/agents/{agent_id}/memory")
async def add_agent_memory(agent_id: str, request: AddMemoryRequest):
    """Add memory to agent context"""
    try:
        context_protocol = ai_service_manager.get_context_protocol()

        memory_type = MemoryType(request.memory_type.lower())

        success = await context_protocol.add_memory(
            agent_id=agent_id,
            content=request.content,
            memory_type=memory_type,
            importance=request.importance,
            metadata=request.metadata
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add memory"
            )

        return {"message": "Memory added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add memory: {str(e)}"
        )


@router.post("/agents/{agent_id}/rules")
async def add_agent_rule(agent_id: str, request: AddRuleRequest):
    """Add rule to agent context"""
    try:
        context_protocol = ai_service_manager.get_context_protocol()

        success = await context_protocol.add_rule(
            agent_id=agent_id,
            name=request.name,
            description=request.description,
            condition=request.condition,
            action=request.action,
            priority=request.priority
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add rule"
            )

        return {"message": "Rule added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add rule: {str(e)}"
        )


@router.get("/agents/{agent_id}/context")
async def get_agent_context(agent_id: str):
    """Get agent context"""
    try:
        context_protocol = ai_service_manager.get_context_protocol()
        context = await context_protocol.get_agent_context(agent_id)

        if not context:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Context not found for agent: {agent_id}"
            )

        return context

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get context: {str(e)}"
        )


# Workflow Generation Endpoints

class WorkflowGenerationRequest(BaseModel):
    """Request to generate a workflow from a prompt"""
    prompt: str = Field(..., description="Natural language description of the workflow")


class WorkflowGenerationResponse(BaseModel):
    """Response from workflow generation"""
    workflow: Optional[Dict[str, Any]] = Field(None, description="Generated workflow structure")
    summary: str = Field(..., description="Summary of the generated workflow")
    reasoning: Optional[str] = Field(None, description="Reasoning behind workflow design")


@router.post("/workflows/generate", response_model=WorkflowGenerationResponse)
async def generate_workflow(request: WorkflowGenerationRequest):
    """
    Generate a workflow structure from a natural language prompt using AI.
    """
    try:
        llm_service = ai_service_manager.get_llm_service()

        # Create a system prompt for workflow generation
        system_message = LLMMessage(
            role="system",
            content="""You are an expert workflow designer. Given a user's description, generate a workflow structure with nodes and edges.

The workflow should have this structure:
{
  "name": "Workflow Name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "unique_id",
      "type": "trigger|action|condition|transform",
      "label": "Node Label",
      "data": {
        "config": {}
      },
      "position": {"x": 0, "y": 0}
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "from": "source_node_id",
      "to": "target_node_id"
    }
  ]
}

Available node types:
- trigger: Starts the workflow (webhook, schedule, email)
- action: Performs an action (send_email, http_request, slack_message)
- condition: Branching logic
- transform: Data transformation

Return ONLY valid JSON. After the JSON, add a line break and provide a brief summary and reasoning."""
        )

        user_message = LLMMessage(
            role="user",
            content=f"Create a workflow for: {request.prompt}"
        )

        # Generate workflow using LLM
        llm_request = LLMRequest(
            messages=[system_message, user_message],
            model_id="google/gemini-2.0-flash-exp:free",
            temperature=0.7,
            max_tokens=2000,
            use_cache=False
        )

        response = await llm_service.complete(llm_request)

        # Parse the response to extract JSON and text
        content = response.content.strip()

        # Try to extract JSON from response
        import json as json_lib
        import re

        # Find JSON object in response
        json_match = re.search(r'\{[\s\S]*\}', content)
        workflow_data = None
        summary = ""
        reasoning = ""

        if json_match:
            try:
                workflow_data = json_lib.loads(json_match.group(0))
                # Get text after JSON as summary/reasoning
                remaining_text = content[json_match.end():].strip()
                if remaining_text:
                    lines = remaining_text.split('\n')
                    summary = lines[0] if lines else ""
                    reasoning = '\n'.join(lines[1:]) if len(lines) > 1 else ""
            except json_lib.JSONDecodeError:
                pass

        # If no valid JSON found, create a simple workflow
        if not workflow_data:
            workflow_data = {
                "name": "Generated Workflow",
                "description": request.prompt,
                "nodes": [
                    {
                        "id": "start",
                        "type": "trigger",
                        "label": "Start",
                        "data": {"config": {}},
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "id": "action1",
                        "type": "action",
                        "label": "Action",
                        "data": {"config": {}},
                        "position": {"x": 300, "y": 100}
                    }
                ],
                "edges": [
                    {
                        "id": "edge1",
                        "from": "start",
                        "to": "action1"
                    }
                ]
            }
            summary = "Generated a basic workflow structure"
            reasoning = "Created a simple two-node workflow as a starting point"

        if not summary:
            summary = f"Generated workflow based on: {request.prompt[:100]}"

        return WorkflowGenerationResponse(
            workflow=workflow_data,
            summary=summary,
            reasoning=reasoning if reasoning else None
        )

    except Exception as e:
        logger.error(f"Workflow generation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow generation failed: {str(e)}"
        )


# Statistics

@router.get("/stats")
async def get_ai_stats():
    """Get AI system statistics"""
    try:
        stats = await ai_service_manager.get_stats()
        return stats

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )
