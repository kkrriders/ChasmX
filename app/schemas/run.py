from pydantic import BaseModel
from typing import Any, Dict, List

class Step(BaseModel):
    step_id: int
    type: str
    name: str
    params: Dict[str, Any]

class Workflow(BaseModel):
    name: str
    description: str
    steps: List[Step]

# Example workflow object
workflow = Workflow(
    name="sample_wf",
    description="test sample",
    steps=[
        {"step_id": 1, "type": "task", "name": "copy input", "params": {"action": "copy_input_to_data"}},
        {"step_id": 2, "type": "call_model", "name": "model echo", "params": {"input_key": None}},
        {"step_id": 3, "type": "decision", "name": "check valid", "params": {
            "condition": {"condition_key": "data.flag", "equals": True},
            "next": 4,
            "else": 5
        }}
    ]
)

print(workflow)
