# app/routers/agent.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_agent():
    return {"message": "Agent router is working"}
