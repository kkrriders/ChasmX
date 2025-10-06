# app/core/execution.py
import time
import uuid
from datetime import datetime
from bson import ObjectId
from typing import Dict, Any
from app.core.database import workflows_collection, workflow_runs_collection
import traceback

def _serialize(obj):
    # Helper to convert ObjectId to str where needed (used in returns)
    try:
        return str(obj)
    except Exception:
        return obj

def _evaluate_decision(condition: Dict[str, Any], context: Dict[str, Any]) -> bool:
    """
    Very simple evaluator: supports checking a key path equals a value.
    condition example:
      {"condition_key": "data.is_valid", "equals": True}
    """
    key = condition.get("condition_key")
    expected = condition.get("equals")
    if not key:
        return False
    # traverse context
    parts = key.split(".")
    val = context
    for p in parts:
        if isinstance(val, dict) and p in val:
            val = val[p]
        else:
            return False
    return val == expected

def execute_workflow_by_name(name: str, input_data: Dict[str, Any] = None) -> Dict[str, Any]:
    wf = workflows_collection.find_one({"name": name})
    if not wf:
        return {"error": "workflow_not_found"}

    return execute_workflow(wf["_id"], input_data)

def execute_workflow(workflow_id, input_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Executes the workflow sequentially. Stores a run document in workflow_runs_collection.
    Returns run id and final status.
    """
    if isinstance(workflow_id, str):
        try:
            workflow_obj = workflows_collection.find_one({"_id": ObjectId(workflow_id)})
        except Exception:
            return {"error": "invalid_workflow_id"}
    else:
        workflow_obj = workflows_collection.find_one({"_id": workflow_id})

    if not workflow_obj:
        return {"error": "workflow_not_found"}

    workflow_id_str = str(workflow_obj["_id"])
    run_id = str(uuid.uuid4())
    start_time = datetime.utcnow()

    # initialize run doc
    run_doc = {
        "run_id": run_id,
        "workflow_id": workflow_id_str,
        "status": "running",
        "started_at": start_time,
        "current_step": None,
        "steps": [],
        "input": input_data or {},
        "output": {},
        "logs": []
    }
    workflow_runs_collection.insert_one(run_doc)

    # execution context (shared across steps)
    context = {"input": input_data or {}, "data": {}, "results": {}}

    try:
        for step in workflow_obj.get("steps", []):
            step_id = step.get("step_id")
            step_type = step.get("type")
            step_name = step.get("name")
            params = step.get("params") or {}

            # update current step in DB
            workflow_runs_collection.update_one({"run_id": run_id}, {"$set": {"current_step": step_id}})
            log_prefix = f"[step {step_id} - {step_name}]"

            # simulate simple task execution
            if step_type == "task":
                # Example: task could transform input and store in context['data']
                # We'll support simple built-in tasks by name in params
                action = params.get("action")
                if action == "copy_input_to_data":
                    context["data"].update(context["input"])
                    workflow_runs_collection.update_one(
                        {"run_id": run_id},
                        {"$push": {"steps": {"step_id": step_id, "status": "completed", "output": context["data"]}}}
                    )
                else:
                    # generic dummy task: sleep to simulate work
                    time.sleep(0.1)
                    workflow_runs_collection.update_one(
                        {"run_id": run_id},
                        {"$push": {"steps": {"step_id": step_id, "status": "completed", "output": {}}}}
                    )

            elif step_type == "call_model":
                # Placeholder - just record that model was called
                # params might include "model_id" and "input_key" -> fetch data for model
                # We'll echo input back as result to keep it simple
                model_input_key = params.get("input_key")
                model_input = context["data"].get(model_input_key) if model_input_key else context["data"]
                # simulate model latency
                time.sleep(0.1)
                model_output = {"model_echo": model_input}
                context["results"][step_id] = model_output
                workflow_runs_collection.update_one(
                    {"run_id": run_id},
                    {"$push": {"steps": {"step_id": step_id, "status": "completed", "output": model_output}}}
                )

            elif step_type == "decision":
                # conditional branch based on context
                condition = params.get("condition") or {}
                yes_next = params.get("next")
                no_next = params.get("else")
                outcome = _evaluate_decision(condition, {"input": context["input"], "data": context["data"], "results": context["results"]})
                workflow_runs_collection.update_one(
                    {"run_id": run_id},
                    {"$push": {"steps": {"step_id": step_id, "status": "completed", "output": {"outcome": outcome}}}}
                )
                # decision branching: we won't change loop order here, but we can log outcome.
                # Advanced engine would change execution pointer; this minimal engine logs the outcome.

            else:
                # unknown step type: mark as failed
                workflow_runs_collection.update_one(
                    {"run_id": run_id},
                    {"$push": {"steps": {"step_id": step_id, "status": "skipped", "output": {"reason": "unknown_step_type"}}}}
                )

        # finished
        end_time = datetime.utcnow()
        workflow_runs_collection.update_one(
            {"run_id": run_id},
            {"$set": {"status": "completed", "finished_at": end_time}}
        )
        return {"run_id": run_id, "status": "completed"}

    except Exception as e:
        # log error and mark run failed
        tb = traceback.format_exc()
        workflow_runs_collection.update_one(
            {"run_id": run_id},
            {"$set": {"status": "failed", "error": str(e), "traceback": tb, "finished_at": datetime.utcnow()}}
        )
        # Rollback: a simple rollback approach: set status to 'rolled_back' if steps requested rollback_on_fail
        try:
            # check if any earlier step requested rollback_on_fail
            steps = workflow_obj.get("steps", [])
            rollback_steps = [s for s in steps if s.get("rollback_on_fail")]
            if rollback_steps:
                # for minimal rollback we add a log and mark rolled_back
                workflow_runs_collection.update_one(
                    {"run_id": run_id},
                    {"$push": {"logs": {"msg": "rollback executed", "time": datetime.utcnow().isoformat()}}}
                )
                workflow_runs_collection.update_one({"run_id": run_id}, {"$set": {"status": "rolled_back"}})
        except Exception:
            pass

        return {"run_id": run_id, "status": "failed", "error": str(e)}
