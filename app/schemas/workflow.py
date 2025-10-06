# app/schemas/workflow.py
from pydantic import BaseModel
from typing import List, Optional

class WorkflowStep(BaseModel):
    step_name: str
    step_type: str
    parameters: Optional[dict] = {}

class Workflow(BaseModel):
    name: str
    description: str
    steps: Optional[List[WorkflowStep]] = []

class WorkflowUpdate(BaseModel):
    description: Optional[str] = None
    steps: Optional[List[WorkflowStep]] = None
    version: Optional[int] = None






