# app/routers/workflow.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_workflow():
    return {"message": "Workflow router is working"}
