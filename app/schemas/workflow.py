from pydantic import BaseModel
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
    from_node: str
    to_node: str

# Full workflow definition
class Workflow(BaseModel):
    name: str
    description: Optional[str] = ""
    version: int = 1
    nodes: List[Node] = []
    edges: List[Edge] = []
    is_template: bool = False  # mark common workflows as templates
    created_by: Optional[str] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
