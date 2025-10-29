from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from datetime import datetime

# Represents a single node in the workflow
class Node(BaseModel):
    id: str
    type: str  # start, llm, email, agent, decision, end
    config: Dict[str, Any] = {}
    position: Optional[Dict[str, int]] = None

# Represents the connection between two nodes
class Edge(BaseModel):
    from_: str = Field(..., alias="from")
    to: str

    model_config = {
        "populate_by_name": True
    }

# Full workflow definition
class Workflow(BaseModel):
    name: str
    description: Optional[str] = ""
    version: int = 1
    nodes: List[Node] = []
    edges: List[Edge] = []
    is_template: bool = False  # mark common workflows as templates
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
