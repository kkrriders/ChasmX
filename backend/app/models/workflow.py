from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
from beanie import Document
from pydantic import BaseModel, Field
from bson import ObjectId

# Enums
class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"

class VariableType(str, Enum):
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    OBJECT = "object"
    ARRAY = "array"

class VariableScope(str, Enum):
    GLOBAL = "global"
    WORKFLOW = "workflow"
    ENVIRONMENT = "environment"

class ExecutionStatus(str, Enum):
    IDLE = "idle"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"
    PAUSED = "paused"

# Nested Models
class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, Any]
    config: Dict[str, Any]

class Edge(BaseModel):
    from_: str = Field(..., alias="from")
    to: str

    model_config = {
        "populate_by_name": True
    }

class WorkflowVariable(BaseModel):
    id: str
    name: str
    value: Any
    type: VariableType
    description: Optional[str] = None
    secret: Optional[bool] = False
    scope: VariableScope

class Metadata(BaseModel):
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    author: Optional[str] = None
    version: Optional[str] = None

# Main Document Models
class Workflow(Document):
    name: str
    nodes: List[Node]
    edges: List[Edge]
    variables: List[WorkflowVariable]
    status: WorkflowStatus = WorkflowStatus.DRAFT
    metadata: Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "workflows"
        indexes = [
            "name"
        ]

class WorkflowRun(Document):
    workflow_id: ObjectId
    execution_id: str
    status: ExecutionStatus = ExecutionStatus.IDLE
    start_time: datetime
    end_time: Optional[datetime] = None
    variables: Dict[str, Any]
    node_states: Dict[str, Any]
    errors: Optional[List[Dict[str, Any]]] = []
    logs: Optional[List[Dict[str, Any]]] = []

    class Settings:
        name = "workflow_runs"
        indexes = [
            "workflow_id",
            "execution_id"
        ]

    model_config = {
        "arbitrary_types_allowed": True
    }