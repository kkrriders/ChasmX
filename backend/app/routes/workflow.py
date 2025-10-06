from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from ..models.workflow import (
    Workflow,
    Node,
    Edge,
    WorkflowVariable,
    WorkflowStatus,
    Metadata
)

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
    except:
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
async def update_workflow(workflow_id: str, update_data: WorkflowUpdate) -> Workflow:
    try:
        object_id = ObjectId(workflow_id)
    except:
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
    
    await workflow.save()
    return workflow

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str) -> Dict[str, str]:
    try:
        object_id = ObjectId(workflow_id)
    except:
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