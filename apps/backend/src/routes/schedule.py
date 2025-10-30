"""
API routes for workflow scheduling
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from loguru import logger

from src.models import WorkflowSchedule, ScheduleStatus, ScheduleType
from src.schemas.schedule import (
    CreateScheduleRequest,
    UpdateScheduleRequest,
    ScheduleResponse,
    ScheduleListResponse,
    ScheduleExecutionLogResponse,
    ExecutionLogListResponse
)
from src.services.scheduler_service import scheduler_service


router = APIRouter(prefix="/schedules", tags=["schedules"])


def schedule_to_response(schedule: WorkflowSchedule) -> ScheduleResponse:
    """Convert WorkflowSchedule model to response schema"""
    return ScheduleResponse(
        id=str(schedule.id),
        workflow_id=str(schedule.workflow_id),
        name=schedule.name,
        description=schedule.description,
        schedule_type=schedule.schedule_type,
        cron_expression=schedule.cron_expression,
        interval_seconds=schedule.interval_seconds,
        scheduled_time=schedule.scheduled_time,
        timezone=schedule.timezone,
        inputs=schedule.inputs,
        enabled=schedule.enabled,
        status=schedule.status,
        last_run_at=schedule.last_run_at,
        last_run_status=schedule.last_run_status,
        next_run_at=schedule.next_run_at,
        run_count=schedule.run_count,
        failure_count=schedule.failure_count,
        max_retries=schedule.max_retries,
        retry_delay_seconds=schedule.retry_delay_seconds,
        max_runs=schedule.max_runs,
        created_by=schedule.created_by,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at
    )


@router.post("", response_model=ScheduleResponse, status_code=201)
async def create_schedule(request: CreateScheduleRequest):
    """
    Create a new workflow schedule

    Supported schedule types:
    - **CRON**: Use cron expression (e.g., "0 9 * * *" for 9 AM daily)
    - **INTERVAL**: Use interval_seconds (e.g., 3600 for hourly)
    - **ONE_TIME**: Use scheduled_time for specific datetime
    """
    try:
        # Convert workflow_id string to ObjectId
        workflow_id = ObjectId(request.workflow_id)

        # Create schedule model
        schedule = WorkflowSchedule(
            workflow_id=workflow_id,
            name=request.name,
            description=request.description,
            schedule_type=request.schedule_type,
            cron_expression=request.cron_expression,
            interval_seconds=request.interval_seconds,
            scheduled_time=request.scheduled_time,
            timezone=request.timezone,
            inputs=request.inputs,
            enabled=request.enabled,
            max_retries=request.max_retries,
            retry_delay_seconds=request.retry_delay_seconds,
            max_runs=request.max_runs
        )

        # Create schedule in service
        created_schedule = await scheduler_service.create_schedule(schedule)

        return schedule_to_response(created_schedule)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to create schedule")


@router.get("", response_model=ScheduleListResponse)
async def list_schedules(
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    status: Optional[ScheduleStatus] = Query(None, description="Filter by status"),
    enabled: Optional[bool] = Query(None, description="Filter by enabled status")
):
    """
    List all workflow schedules with optional filters
    """
    try:
        workflow_obj_id = ObjectId(workflow_id) if workflow_id else None

        schedules = await scheduler_service.list_schedules(
            workflow_id=workflow_obj_id,
            status=status,
            enabled=enabled
        )

        return ScheduleListResponse(
            schedules=[schedule_to_response(s) for s in schedules],
            total=len(schedules)
        )

    except Exception as e:
        logger.error(f"Failed to list schedules: {e}")
        raise HTTPException(status_code=500, detail="Failed to list schedules")


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: str):
    """
    Get a specific schedule by ID
    """
    try:
        schedule = await scheduler_service.get_schedule(ObjectId(schedule_id))

        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")

        return schedule_to_response(schedule)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to get schedule")


@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(schedule_id: str, request: UpdateScheduleRequest):
    """
    Update an existing schedule
    """
    try:
        # Build updates dict (only include fields that were provided)
        updates = {}
        for field, value in request.model_dump(exclude_unset=True).items():
            if value is not None:
                updates[field] = value

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        updated_schedule = await scheduler_service.update_schedule(
            ObjectId(schedule_id),
            updates
        )

        if not updated_schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")

        return schedule_to_response(updated_schedule)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to update schedule")


@router.delete("/{schedule_id}", status_code=204)
async def delete_schedule(schedule_id: str):
    """
    Delete a schedule
    """
    try:
        success = await scheduler_service.delete_schedule(ObjectId(schedule_id))

        if not success:
            raise HTTPException(status_code=404, detail="Schedule not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete schedule")


@router.post("/{schedule_id}/pause", response_model=ScheduleResponse)
async def pause_schedule(schedule_id: str):
    """
    Pause a schedule (stop running but keep configuration)
    """
    try:
        schedule = await scheduler_service.pause_schedule(ObjectId(schedule_id))

        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")

        return schedule_to_response(schedule)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to pause schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to pause schedule")


@router.post("/{schedule_id}/resume", response_model=ScheduleResponse)
async def resume_schedule(schedule_id: str):
    """
    Resume a paused schedule
    """
    try:
        schedule = await scheduler_service.resume_schedule(ObjectId(schedule_id))

        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")

        return schedule_to_response(schedule)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resume schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to resume schedule")


@router.get("/{schedule_id}/logs", response_model=ExecutionLogListResponse)
async def get_schedule_execution_logs(
    schedule_id: str,
    limit: int = Query(50, ge=1, le=500, description="Maximum number of logs to return")
):
    """
    Get execution logs for a specific schedule
    """
    try:
        logs = await scheduler_service.get_execution_logs(
            schedule_id=ObjectId(schedule_id),
            limit=limit
        )

        return ExecutionLogListResponse(
            logs=[
                ScheduleExecutionLogResponse(
                    id=str(log.id),
                    schedule_id=str(log.schedule_id),
                    workflow_id=str(log.workflow_id),
                    execution_id=log.execution_id,
                    scheduled_time=log.scheduled_time,
                    actual_start_time=log.actual_start_time,
                    end_time=log.end_time,
                    status=log.status,
                    error_message=log.error_message,
                    duration_seconds=log.duration_seconds,
                    retry_count=log.retry_count,
                    created_at=log.created_at
                )
                for log in logs
            ],
            total=len(logs)
        )

    except Exception as e:
        logger.error(f"Failed to get execution logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get execution logs")


@router.get("/workflow/{workflow_id}", response_model=ScheduleListResponse)
async def get_workflow_schedules(workflow_id: str):
    """
    Get all schedules for a specific workflow
    """
    try:
        schedules = await scheduler_service.list_schedules(
            workflow_id=ObjectId(workflow_id)
        )

        return ScheduleListResponse(
            schedules=[schedule_to_response(s) for s in schedules],
            total=len(schedules)
        )

    except Exception as e:
        logger.error(f"Failed to get workflow schedules: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workflow schedules")
