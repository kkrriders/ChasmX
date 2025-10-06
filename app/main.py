# app/main.py
from fastapi import FastAPI, HTTPException, Path
from app.schemas.models import UserRegister, UserLogin
from app.schemas.workflow import Workflow, WorkflowUpdate, WorkflowStep
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import users_collection, workflows_collection, workflow_runs_collection
from app.utils.validators import validate_password_strength
from app.core.execution import execute_workflow_by_name  # <-- execution import
from bson import ObjectId
from datetime import datetime

app = FastAPI(title="ChasmX Backend")

# -----------------------------
# User Endpoints
# -----------------------------
@app.post("/register")
async def register(user: UserRegister):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if not validate_password_strength(user.password):
        raise HTTPException(status_code=400, detail="Weak password")
    hashed_pw = hash_password(user.password)
    users_collection.insert_one({
        "email": user.email,
        "hashed_password": hashed_pw,
        "full_name": getattr(user, "full_name", "")
    })
    return {"msg": "User registered successfully"}

@app.post("/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# -----------------------------
# Workflow Endpoints
# -----------------------------
@app.post("/workflow")
async def create_workflow(workflow: Workflow):
    if workflows_collection.find_one({"name": workflow.name}):
        raise HTTPException(status_code=400, detail="Workflow already exists")
    doc = workflow.dict()
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    doc["version"] = 1
    workflows_collection.insert_one(doc)
    return {"msg": "Workflow created successfully", "workflow_name": workflow.name}

@app.get("/workflow/{workflow_id}")
async def get_workflow(workflow_id: str = Path(..., description="Workflow ID")):
    wf = workflows_collection.find_one({"_id": ObjectId(workflow_id)})
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf["_id"] = str(wf["_id"])
    return wf

@app.get("/workflow")
async def list_workflows():
    wfs = list(workflows_collection.find())
    for wf in wfs:
        wf["_id"] = str(wf["_id"])
    return wfs

@app.put("/workflow/{workflow_id}")
async def update_workflow(workflow_id: str, payload: WorkflowUpdate):
    wf = workflows_collection.find_one({"_id": ObjectId(workflow_id)})
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    update_fields = {}
    if payload.description is not None:
        update_fields["description"] = payload.description
    if payload.steps is not None:
        update_fields["steps"] = [s.dict() for s in payload.steps]
        update_fields["version"] = wf.get("version", 1) + 1
    if payload.version is not None:
        update_fields["version"] = payload.version
    update_fields["updated_at"] = datetime.utcnow()

    workflows_collection.update_one({"_id": wf["_id"]}, {"$set": update_fields})
    return {"msg": "Workflow updated successfully"}

@app.delete("/workflow/{workflow_id}")
async def delete_workflow(workflow_id: str):
    result = workflows_collection.delete_one({"_id": ObjectId(workflow_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"msg": "Workflow deleted successfully"}

# -----------------------------
# Workflow Execution Endpoint
# -----------------------------
@app.post("/workflow/{workflow_id}/execute")
async def execute_workflow_endpoint(workflow_id: str, input_data: dict = {}):
    wf = workflows_collection.find_one({"_id": ObjectId(workflow_id)})
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    run_result = execute_workflow_by_name(wf["name"], input_data)
    
    # Save run to DB
    run_doc = {
        "workflow_id": workflow_id,
        "workflow_name": wf["name"],
        "input_data": input_data,
        "output_data": run_result,
        "started_at": datetime.utcnow()
    }
    workflow_runs_collection.insert_one(run_doc)
    run_doc["_id"] = str(run_doc["_id"])
    return run_doc

# -----------------------------
# Workflow Run Endpoints
# -----------------------------
@app.get("/runs/{run_id}")
async def get_run(run_id: str):
    run = workflow_runs_collection.find_one({"_id": ObjectId(run_id)})
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    run["_id"] = str(run["_id"])
    return run

@app.get("/runs")
async def list_runs():
    runs = list(workflow_runs_collection.find().sort("started_at", -1).limit(50))
    for r in runs:
        r["_id"] = str(r["_id"])
    return runs
