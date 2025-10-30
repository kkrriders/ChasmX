from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime
from beanie import Document
from pydantic import Field, field_validator
from bson import ObjectId


class ScheduleStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DISABLED = "disabled"


class ScheduleType(str, Enum):
    CRON = "cron"  # Cron expression (e.g., "0 0 * * *")
    INTERVAL = "interval"  # Interval in seconds
    ONE_TIME = "one_time"  # Run once at specific datetime


class WorkflowSchedule(Document):
    """Schedule configuration for workflow automation"""

    workflow_id: ObjectId
    name: str
    description: Optional[str] = None

    # Schedule configuration
    schedule_type: ScheduleType
    cron_expression: Optional[str] = None  # For CRON type: "0 9 * * 1-5" (9 AM weekdays)
    interval_seconds: Optional[int] = None  # For INTERVAL type: 3600 (every hour)
    scheduled_time: Optional[datetime] = None  # For ONE_TIME type
    timezone: str = "UTC"

    # Execution configuration
    inputs: Dict[str, Any] = Field(default_factory=dict)  # Default inputs for scheduled execution
    enabled: bool = True
    status: ScheduleStatus = ScheduleStatus.ACTIVE

    # Tracking
    last_run_at: Optional[datetime] = None
    last_run_status: Optional[str] = None
    next_run_at: Optional[datetime] = None
    run_count: int = 0
    failure_count: int = 0

    # Limits and retry
    max_retries: int = 3
    retry_delay_seconds: int = 60
    max_runs: Optional[int] = None  # None = unlimited

    # Metadata
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('cron_expression')
    @classmethod
    def validate_cron(cls, v: Optional[str], info) -> Optional[str]:
        """Validate cron expression format"""
        if v is not None:
            parts = v.split()
            if len(parts) not in [5, 6]:  # 5 parts (standard) or 6 parts (with seconds)
                raise ValueError(
                    "Cron expression must have 5 or 6 parts "
                    "(minute hour day month weekday [second])"
                )
        return v

    @field_validator('interval_seconds')
    @classmethod
    def validate_interval(cls, v: Optional[int]) -> Optional[int]:
        """Validate interval is positive"""
        if v is not None and v <= 0:
            raise ValueError("Interval must be greater than 0 seconds")
        return v

    class Settings:
        name = "workflow_schedules"
        indexes = [
            "workflow_id",
            "status",
            "enabled",
            "next_run_at",
            [("workflow_id", 1), ("enabled", 1)],  # Compound index
        ]

    model_config = {
        "arbitrary_types_allowed": True
    }


class ScheduleExecutionLog(Document):
    """Log of scheduled workflow executions"""

    schedule_id: ObjectId
    workflow_id: ObjectId
    execution_id: str

    scheduled_time: datetime  # When it was supposed to run
    actual_start_time: datetime  # When it actually started
    end_time: Optional[datetime] = None

    status: str  # success, error, timeout
    error_message: Optional[str] = None

    # Performance metrics
    duration_seconds: Optional[float] = None
    retry_count: int = 0

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "schedule_execution_logs"
        indexes = [
            "schedule_id",
            "workflow_id",
            "execution_id",
            "scheduled_time",
            [("schedule_id", 1), ("scheduled_time", -1)],  # Most recent first
        ]

    model_config = {
        "arbitrary_types_allowed": True
    }
