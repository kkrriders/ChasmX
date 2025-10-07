# app/routers/llm.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def test_llm():
    return {"message": "LLM router is working"}
