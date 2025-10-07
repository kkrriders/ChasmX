# app/routers/workflow.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/", summary="List demo workflows")
async def list_workflows():
    return {"workflows": []}

@router.post("/run", summary="Start a workflow run")
async def run_workflow(payload: dict):
    # placeholder - actual execution engine will process payload
    return {"status": "started", "payload": payload}
