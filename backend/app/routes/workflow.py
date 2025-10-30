from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
import uuid
import json
import os
from pathlib import Path

from ..models.workflow import (
    Workflow,
    Node,
    Edge,
    WorkflowVariable,
    WorkflowStatus,
    Metadata,
    WorkflowRun,
    ExecutionStatus
)
from ..services.workflow_executor import workflow_executor
from ..services.workflow_validator import workflow_validator, ValidationResult

router = APIRouter(
    prefix="/workflows",
    tags=["workflows"]
)

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None
    variables: Optional[List[WorkflowVariable]] = None
    status: Optional[WorkflowStatus] = None
    metadata: Optional[Metadata] = None

    class Config:
        from_attributes = True

class WorkflowSummary(BaseModel):
    id: str
    name: str
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_workflow(cls, workflow: Workflow) -> "WorkflowSummary":
        return cls(
            id=str(workflow.id),
            name=workflow.name,
            status=workflow.status.value,
            updated_at=workflow.updated_at
        )

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=Workflow)
async def create_workflow(workflow: Workflow) -> Workflow:
    await workflow.insert()
    return workflow

@router.get("/", response_model=List[WorkflowSummary])
async def list_workflows() -> List[WorkflowSummary]:
    workflows = await Workflow.find_all().to_list()
    return [WorkflowSummary.from_workflow(w) for w in workflows]

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str) -> Workflow:
    try:
        object_id = ObjectId(workflow_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )
    
    workflow = await Workflow.get(object_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow with ID {workflow_id} not found"
        )
    return workflow

@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(
    workflow_id: str,
    update_data: WorkflowUpdate,
    validate: bool = True
) -> Workflow:
    """
    Update a workflow. Optionally validate before saving.

    Args:
        workflow_id: ID of the workflow to update
        update_data: Fields to update
        validate: Whether to validate workflow before saving (default: True)

    Raises:
        HTTPException: If validation fails with errors
    """
    try:
        object_id = ObjectId(workflow_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )

    workflow = await Workflow.get(object_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow with ID {workflow_id} not found"
        )

    # Create update dictionary with only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)

    # Update the timestamp
    update_dict["updated_at"] = datetime.utcnow()

    # Apply updates to the workflow
    for key, value in update_dict.items():
        setattr(workflow, key, value)

    # Validate if requested
    if validate:
        validation_result = workflow_validator.validate_workflow(workflow)
        if validation_result.has_errors:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Workflow validation failed",
                    "validation_result": validation_result.model_dump()
                }
            )

    await workflow.save()
    return workflow

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str) -> Dict[str, str]:
    try:
        object_id = ObjectId(workflow_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )

    workflow = await Workflow.get(object_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow with ID {workflow_id} not found"
        )

    await workflow.delete()
    return {"message": f"Workflow {workflow_id} successfully deleted"}


# Workflow Execution Endpoints

class ExecuteWorkflowRequest(BaseModel):
    """Request model for workflow execution"""
    inputs: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Input variables for workflow")
    async_execution: bool = Field(default=False, description="Execute workflow asynchronously")

    class Config:
        from_attributes = True


class ExecutionResponse(BaseModel):
    """Response model for workflow execution"""
    execution_id: str
    workflow_id: str
    status: str
    message: str
    started_at: datetime

    class Config:
        from_attributes = True


class ExecutionStatusResponse(BaseModel):
    """Response model for execution status"""
    execution_id: str
    workflow_id: str
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    node_states: Dict[str, Any] = Field(default_factory=dict)
    logs: List[Dict[str, Any]] = Field(default_factory=list)
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    communication_log: List[Dict[str, Any]] = Field(default_factory=list, description="Inter-node communication log")

    class Config:
        from_attributes = True


@router.post("/{workflow_id}/execute", response_model=ExecutionResponse, status_code=status.HTTP_202_ACCEPTED)
async def execute_workflow(
    workflow_id: str,
    request: ExecuteWorkflowRequest,
    background_tasks: BackgroundTasks
) -> ExecutionResponse:
    """
    Execute a workflow.

    This endpoint triggers workflow execution. The workflow is executed node by node,
    with AI nodes using Redis-cached LLM calls for improved performance.

    Args:
        workflow_id: The ID of the workflow to execute
        request: Execution request with input variables
        background_tasks: FastAPI background tasks for async execution

    Returns:
        Execution response with execution ID and status

    Example:
        POST /workflows/{workflow_id}/execute
        {
          "inputs": {"user_name": "John", "email": "john@example.com"},
          "async_execution": true
        }
    """
    try:
        # Validate workflow ID
        try:
            object_id = ObjectId(workflow_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid workflow ID format"
            )

        # Load workflow from database
        workflow = await Workflow.get(object_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow with ID {workflow_id} not found"
            )

        # Check if workflow is active
        if workflow.status != WorkflowStatus.ACTIVE and workflow.status != WorkflowStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Workflow status is {workflow.status}, cannot execute"
            )

        # Create workflow run record
        execution_id = str(uuid.uuid4())
        workflow_run = WorkflowRun(
            workflow_id=object_id,
            execution_id=execution_id,
            status=ExecutionStatus.QUEUED,
            start_time=datetime.utcnow(),
            variables=request.inputs,
            node_states={},
            errors=[],
            logs=[]
        )
        await workflow_run.insert()

        # Execute workflow
        if request.async_execution:
            # Execute in background
            background_tasks.add_task(workflow_executor.execute, workflow, workflow_run)
            message = "Workflow execution started in background"
        else:
            # Execute synchronously (blocks until complete)
            try:
                workflow_run = await workflow_executor.execute(workflow, workflow_run)
                message = "Workflow execution completed"
            except Exception as e:
                message = f"Workflow execution failed: {str(e)}"

        return ExecutionResponse(
            execution_id=execution_id,
            workflow_id=workflow_id,
            status=workflow_run.status.value,
            message=message,
            started_at=workflow_run.start_time
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}"
        )


@router.get("/{workflow_id}/executions", response_model=List[ExecutionStatusResponse])
async def list_workflow_executions(workflow_id: str) -> List[ExecutionStatusResponse]:
    """
    List all executions for a workflow.

    Returns execution history including status, logs, and results.
    """
    try:
        object_id = ObjectId(workflow_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )

    # Query all runs for this workflow
    runs = await WorkflowRun.find(WorkflowRun.workflow_id == object_id).to_list()

    return [
        ExecutionStatusResponse(
            execution_id=run.execution_id,
            workflow_id=workflow_id,
            status=run.status.value,
            start_time=run.start_time,
            end_time=run.end_time,
            node_states=run.node_states,
            logs=run.logs or [],
            errors=run.errors or [],
            communication_log=run.communication_log or []
        )
        for run in runs
    ]


@router.get("/executions/{execution_id}", response_model=ExecutionStatusResponse)
async def get_execution_status(execution_id: str) -> ExecutionStatusResponse:
    """
    Get the status and results of a specific workflow execution.

    Returns detailed execution information including:
    - Current status (queued, running, success, error)
    - Node execution states
    - Logs and errors
    - Execution timing
    """
    try:
        # Find workflow run by execution ID
        run = await WorkflowRun.find_one(WorkflowRun.execution_id == execution_id)

        if not run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Execution with ID {execution_id} not found"
            )

        return ExecutionStatusResponse(
            execution_id=run.execution_id,
            workflow_id=str(run.workflow_id),
            status=run.status.value,
            start_time=run.start_time,
            end_time=run.end_time,
            node_states=run.node_states,
            logs=run.logs or [],
            errors=run.errors or [],
            communication_log=run.communication_log or []
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get execution status: {str(e)}"
        )


# Template Management Endpoints

@router.get("/templates/list", response_model=List[str])
async def list_workflow_templates() -> List[str]:
    """
    List all available workflow templates.

    Returns a list of template names that can be loaded.
    """
    try:
        templates_dir = Path(__file__).parent.parent / "templates"
        if not templates_dir.exists():
            return []

        templates = [
            f.stem for f in templates_dir.glob("*.json")
            if f.is_file()
        ]
        return templates
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list templates: {str(e)}"
        )


@router.post("/templates/{template_name}/load", response_model=Workflow, status_code=status.HTTP_201_CREATED)
async def load_workflow_template(template_name: str) -> Workflow:
    """
    Load a workflow template and create a new workflow from it.

    This endpoint loads a pre-defined workflow template (like email automation)
    and creates a new workflow instance in the database.

    Args:
        template_name: Name of the template to load (e.g., "email_automation_template")

    Returns:
        The created workflow

    Example:
        POST /workflows/templates/email_automation_template/load
    """
    try:
        # Find template file
        templates_dir = Path(__file__).parent.parent / "templates"
        template_path = templates_dir / f"{template_name}.json"

        if not template_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template '{template_name}' not found"
            )

        # Load template JSON
        with open(template_path, 'r') as f:
            template_data = json.load(f)

        # Parse template data into workflow model
        nodes = [Node(**node) for node in template_data.get("nodes", [])]
        edges = [Edge(**edge) for edge in template_data.get("edges", [])]
        variables = [WorkflowVariable(**var) for var in template_data.get("variables", [])]
        metadata = Metadata(**template_data.get("metadata", {}))

        # Create workflow from template
        workflow = Workflow(
            name=template_data.get("name", template_name),
            nodes=nodes,
            edges=edges,
            variables=variables,
            status=WorkflowStatus.DRAFT,
            metadata=metadata,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Save to database
        await workflow.insert()

        return workflow

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load template: {str(e)}"
        )


# Validation Endpoints

@router.post("/{workflow_id}/validate", response_model=ValidationResult)
async def validate_workflow_endpoint(workflow_id: str) -> ValidationResult:
    """
    Validate a workflow without saving it.

    Returns comprehensive validation results including errors, warnings, and info messages.

    Args:
        workflow_id: ID of the workflow to validate

    Returns:
        ValidationResult with all validation issues

    Example:
        POST /workflows/{workflow_id}/validate

        Response:
        {
            "is_valid": false,
            "errors": [
                {
                    "severity": "error",
                    "code": "MISSING_REQUIRED_FIELD",
                    "message": "Node 'node-1' (http) is missing required fields: url",
                    "node_id": "node-1",
                    "suggestion": "Add 'url' to node configuration"
                }
            ],
            "warnings": [...],
            "info": [...]
        }
    """
    try:
        object_id = ObjectId(workflow_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )

    workflow = await Workflow.get(object_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow with ID {workflow_id} not found"
        )

    # Validate workflow
    validation_result = workflow_validator.validate_workflow(workflow)

    return validation_result


class ValidateWorkflowRequest(BaseModel):
    """Request model for validating workflow data without saving"""
    name: str
    nodes: List[Node]
    edges: List[Edge]
    variables: List[WorkflowVariable]
    status: WorkflowStatus = WorkflowStatus.DRAFT
    metadata: Metadata

    class Config:
        from_attributes = True


@router.post("/validate", response_model=ValidationResult)
async def validate_workflow_data(request: ValidateWorkflowRequest) -> ValidationResult:
    """
    Validate workflow data without creating/updating a workflow.

    This endpoint is useful for real-time validation in the UI before saving.

    Args:
        request: Workflow data to validate

    Returns:
        ValidationResult with all validation issues

    Example:
        POST /workflows/validate
        {
            "name": "My Workflow",
            "nodes": [...],
            "edges": [...],
            "variables": [...],
            "metadata": {...}
        }
    """
    # Create temporary workflow object for validation
    workflow = Workflow(
        name=request.name,
        nodes=request.nodes,
        edges=request.edges,
        variables=request.variables,
        status=request.status,
        metadata=request.metadata,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Validate workflow
    validation_result = workflow_validator.validate_workflow(workflow)

    return validation_result


class ValidationConfigResponse(BaseModel):
    """Response model for validation configuration"""
    limits: Dict[str, Any]
    supported_node_types: List[str]
    validation_rules: List[str]

    class Config:
        from_attributes = True


@router.get("/validation/config", response_model=ValidationConfigResponse)
async def get_validation_config() -> ValidationConfigResponse:
    """
    Get validation configuration including limits and supported node types.

    Returns:
        Validation configuration

    Example:
        GET /workflows/validation/config

        Response:
        {
            "limits": {
                "max_nodes": 100,
                "max_edges": 500,
                ...
            },
            "supported_node_types": ["http", "email", ...],
            "validation_rules": [
                "circular_dependency",
                "dead_nodes",
                ...
            ]
        }
    """
    from ..services.validation_rules import ValidationRules
    from ..services.node_schemas import get_all_node_types

    return ValidationConfigResponse(
        limits=ValidationRules.LIMITS,
        supported_node_types=get_all_node_types(),
        validation_rules=[
            "circular_dependency",
            "dead_nodes",
            "required_fields",
            "node_schemas",
            "edge_validation",
            "start_nodes",
            "end_nodes",
            "node_compatibility",
            "isolated_nodes",
            "variable_references",
            "resource_limits",
            "infinite_loops",
            "security_patterns"
        ]
    )