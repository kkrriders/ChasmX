from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime

# Represents a single step in the workflow
class Step(BaseModel):
    step_id: int
    type: str  # e.g., task, call_model, decision, email, agent
    name: str
    params: Dict[str, Any]
    status: Optional[str] = "pending"  # pending, running, completed, failed
    output: Optional[Any] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# Response when starting a workflow run
class RunStartResponse(BaseModel):
    run_id: str
    workflow_id: str
    status: str = "running"

# Represents an entire workflow execution
class WorkflowRun(BaseModel):
    run_id: str
    workflow_id: str
    workflow_name: str
    version: Optional[int] = 1
    input_variables: Dict[str, Any] = {}
    steps: List[Step] = []
    status: str = "running"  # running, completed, failed, cancelled
    started_at: datetime = datetime.now()
    completed_at: Optional[datetime] = None
    total_duration: Optional[float] = None

if __name__ == "__main__":
    sample_run = WorkflowRun(
        run_id="run_001",
        workflow_id="wf_001",
        workflow_name="Sample Workflow",
        input_variables={"topic": "AI Agents"},
        steps=[]
    )
    print(sample_run)

