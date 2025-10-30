from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId

from src.models import ScheduleStatus, ScheduleType


# Request Schemas
class CreateScheduleRequest(BaseModel):
    workflow_id: str
    name: str
    description: Optional[str] = None

    # Schedule configuration
    schedule_type: ScheduleType
    cron_expression: Optional[str] = None
    interval_seconds: Optional[int] = None
    scheduled_time: Optional[datetime] = None
    timezone: str = "UTC"

    # Execution configuration
    inputs: Dict[str, Any] = Field(default_factory=dict)
    enabled: bool = True

    # Limits and retry
    max_retries: int = 3
    retry_delay_seconds: int = 60
    max_runs: Optional[int] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "workflow_id": "507f1f77bcf86cd799439011",
                    "name": "Daily Report Generation",
                    "description": "Generate and send daily reports every morning at 9 AM",
                    "schedule_type": "cron",
                    "cron_expression": "0 9 * * *",
                    "timezone": "America/New_York",
                    "inputs": {"report_type": "daily"},
                    "enabled": True,
                    "max_retries": 3
                }
            ]
        }
    }


class UpdateScheduleRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    # Schedule configuration
    schedule_type: Optional[ScheduleType] = None
    cron_expression: Optional[str] = None
    interval_seconds: Optional[int] = None
    scheduled_time: Optional[datetime] = None
    timezone: Optional[str] = None

    # Execution configuration
    inputs: Optional[Dict[str, Any]] = None
    enabled: Optional[bool] = None
    status: Optional[ScheduleStatus] = None

    # Limits and retry
    max_retries: Optional[int] = None
    retry_delay_seconds: Optional[int] = None
    max_runs: Optional[int] = None


# Response Schemas
class ScheduleResponse(BaseModel):
    id: str
    workflow_id: str
    name: str
    description: Optional[str]

    schedule_type: ScheduleType
    cron_expression: Optional[str]
    interval_seconds: Optional[int]
    scheduled_time: Optional[datetime]
    timezone: str

    inputs: Dict[str, Any]
    enabled: bool
    status: ScheduleStatus

    last_run_at: Optional[datetime]
    last_run_status: Optional[str]
    next_run_at: Optional[datetime]
    run_count: int
    failure_count: int

    max_retries: int
    retry_delay_seconds: int
    max_runs: Optional[int]

    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class ScheduleExecutionLogResponse(BaseModel):
    id: str
    schedule_id: str
    workflow_id: str
    execution_id: str

    scheduled_time: datetime
    actual_start_time: datetime
    end_time: Optional[datetime]

    status: str
    error_message: Optional[str]

    duration_seconds: Optional[float]
    retry_count: int

    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ScheduleListResponse(BaseModel):
    schedules: list[ScheduleResponse]
    total: int


class ExecutionLogListResponse(BaseModel):
    logs: list[ScheduleExecutionLogResponse]
    total: int
