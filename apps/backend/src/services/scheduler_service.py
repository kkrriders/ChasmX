"""
Workflow Scheduler Service
Handles scheduling and execution of workflows based on cron, interval, or one-time schedules
"""

import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.jobstores.mongodb import MongoDBJobStore
from bson import ObjectId
from loguru import logger

from src.models import (
    WorkflowSchedule,
    ScheduleExecutionLog,
    ScheduleStatus,
    ScheduleType,
    Workflow
)
from src.services.workflow_executor import WorkflowExecutor


class SchedulerService:
    """Service for managing and executing scheduled workflows"""

    def __init__(self):
        self.scheduler: Optional[AsyncIOScheduler] = None
        self.executor = WorkflowExecutor()
        self._initialized = False

    async def initialize(self, mongodb_uri: str, db_name: str):
        """Initialize the scheduler with MongoDB jobstore"""
        if self._initialized:
            logger.warning("Scheduler already initialized")
            return

        try:
            # Configure MongoDB jobstore for persistence
            jobstores = {
                'default': MongoDBJobStore(
                    database=db_name,
                    collection='apscheduler_jobs',
                    client=None,  # Will use existing connection
                    host=mongodb_uri
                )
            }

            # Configure scheduler with timezone support
            self.scheduler = AsyncIOScheduler(
                jobstores=jobstores,
                timezone='UTC'
            )

            self.scheduler.start()
            self._initialized = True
            logger.info("Scheduler service initialized successfully")

            # Load existing schedules from database
            await self._load_existing_schedules()

        except Exception as e:
            logger.error(f"Failed to initialize scheduler: {e}")
            raise

    async def _load_existing_schedules(self):
        """Load and reschedule all active schedules from database"""
        try:
            schedules = await WorkflowSchedule.find(
                WorkflowSchedule.enabled == True,
                WorkflowSchedule.status == ScheduleStatus.ACTIVE
            ).to_list()

            logger.info(f"Loading {len(schedules)} active schedules...")

            for schedule in schedules:
                try:
                    await self._add_job(schedule)
                    logger.info(f"Loaded schedule: {schedule.name} (ID: {schedule.id})")
                except Exception as e:
                    logger.error(f"Failed to load schedule {schedule.id}: {e}")

        except Exception as e:
            logger.error(f"Failed to load existing schedules: {e}")

    def _create_trigger(self, schedule: WorkflowSchedule):
        """Create APScheduler trigger from schedule configuration"""
        if schedule.schedule_type == ScheduleType.CRON:
            if not schedule.cron_expression:
                raise ValueError("CRON schedule requires cron_expression")

            # Parse cron expression (supports 5 or 6 parts)
            parts = schedule.cron_expression.split()
            if len(parts) == 5:
                minute, hour, day, month, day_of_week = parts
                return CronTrigger(
                    minute=minute,
                    hour=hour,
                    day=day,
                    month=month,
                    day_of_week=day_of_week,
                    timezone=schedule.timezone
                )
            elif len(parts) == 6:
                second, minute, hour, day, month, day_of_week = parts
                return CronTrigger(
                    second=second,
                    minute=minute,
                    hour=hour,
                    day=day,
                    month=month,
                    day_of_week=day_of_week,
                    timezone=schedule.timezone
                )
            else:
                raise ValueError("Invalid cron expression format")

        elif schedule.schedule_type == ScheduleType.INTERVAL:
            if not schedule.interval_seconds:
                raise ValueError("INTERVAL schedule requires interval_seconds")

            return IntervalTrigger(
                seconds=schedule.interval_seconds,
                timezone=schedule.timezone
            )

        elif schedule.schedule_type == ScheduleType.ONE_TIME:
            if not schedule.scheduled_time:
                raise ValueError("ONE_TIME schedule requires scheduled_time")

            return DateTrigger(
                run_date=schedule.scheduled_time,
                timezone=schedule.timezone
            )

        else:
            raise ValueError(f"Unknown schedule type: {schedule.schedule_type}")

    async def _add_job(self, schedule: WorkflowSchedule):
        """Add a job to the scheduler"""
        if not self._initialized or not self.scheduler:
            raise RuntimeError("Scheduler not initialized")

        job_id = str(schedule.id)
        trigger = self._create_trigger(schedule)

        # Check if job already exists
        existing_job = self.scheduler.get_job(job_id)
        if existing_job:
            # Update existing job
            existing_job.reschedule(trigger)
            logger.info(f"Rescheduled job: {job_id}")
        else:
            # Add new job
            self.scheduler.add_job(
                self._execute_scheduled_workflow,
                trigger=trigger,
                id=job_id,
                args=[schedule.id],
                replace_existing=True,
                max_instances=1,  # Prevent concurrent executions
                coalesce=True,  # If multiple runs are pending, only execute once
                misfire_grace_time=300  # 5 minutes grace period for missed executions
            )
            logger.info(f"Added job: {job_id}")

        # Update next_run_at in database
        next_run = self.scheduler.get_job(job_id).next_run_time if self.scheduler.get_job(job_id) else None
        if next_run:
            schedule.next_run_at = next_run
            await schedule.save()

    async def _execute_scheduled_workflow(self, schedule_id: ObjectId):
        """Execute a scheduled workflow"""
        logger.info(f"Executing scheduled workflow: {schedule_id}")
        scheduled_time = datetime.utcnow()
        start_time = datetime.utcnow()
        execution_id = None
        error_message = None
        retry_count = 0

        try:
            # Load schedule
            schedule = await WorkflowSchedule.get(schedule_id)
            if not schedule:
                logger.error(f"Schedule {schedule_id} not found")
                return

            # Check if schedule is still enabled
            if not schedule.enabled or schedule.status != ScheduleStatus.ACTIVE:
                logger.warning(f"Schedule {schedule_id} is disabled or not active")
                return

            # Check max_runs limit
            if schedule.max_runs and schedule.run_count >= schedule.max_runs:
                logger.info(f"Schedule {schedule_id} reached max_runs limit")
                schedule.enabled = False
                schedule.status = ScheduleStatus.DISABLED
                await schedule.save()
                return

            # Load workflow
            workflow = await Workflow.get(schedule.workflow_id)
            if not workflow:
                logger.error(f"Workflow {schedule.workflow_id} not found")
                error_message = "Workflow not found"
                return

            # Execute workflow with retries
            success = False
            for attempt in range(schedule.max_retries + 1):
                retry_count = attempt
                try:
                    # Execute workflow
                    run = await self.executor.execute_workflow(
                        workflow=workflow,
                        inputs=schedule.inputs
                    )
                    execution_id = run.execution_id
                    success = True
                    logger.info(
                        f"Successfully executed scheduled workflow. "
                        f"Schedule: {schedule_id}, Execution: {execution_id}"
                    )
                    break

                except Exception as exec_error:
                    error_message = str(exec_error)
                    logger.error(
                        f"Execution attempt {attempt + 1} failed for schedule {schedule_id}: {exec_error}"
                    )

                    if attempt < schedule.max_retries:
                        # Wait before retry
                        await asyncio.sleep(schedule.retry_delay_seconds)
                    else:
                        # Final attempt failed
                        logger.error(f"All retry attempts failed for schedule {schedule_id}")

            # Update schedule tracking
            schedule.last_run_at = scheduled_time
            schedule.last_run_status = "success" if success else "error"
            schedule.run_count += 1
            if not success:
                schedule.failure_count += 1

            # Update next_run_at
            job = self.scheduler.get_job(str(schedule_id))
            if job:
                schedule.next_run_at = job.next_run_time

            await schedule.save()

        except Exception as e:
            logger.error(f"Fatal error executing scheduled workflow {schedule_id}: {e}")
            error_message = str(e)

        finally:
            # Log execution
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()

            log = ScheduleExecutionLog(
                schedule_id=schedule_id,
                workflow_id=schedule.workflow_id,
                execution_id=execution_id or "error",
                scheduled_time=scheduled_time,
                actual_start_time=start_time,
                end_time=end_time,
                status="success" if execution_id else "error",
                error_message=error_message,
                duration_seconds=duration,
                retry_count=retry_count
            )
            await log.insert()

    async def create_schedule(self, schedule: WorkflowSchedule) -> WorkflowSchedule:
        """Create a new workflow schedule"""
        # Validate workflow exists
        workflow = await Workflow.get(schedule.workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {schedule.workflow_id} not found")

        # Save to database
        await schedule.insert()

        # Add to scheduler if enabled
        if schedule.enabled and schedule.status == ScheduleStatus.ACTIVE:
            await self._add_job(schedule)

        logger.info(f"Created schedule: {schedule.name} (ID: {schedule.id})")
        return schedule

    async def update_schedule(self, schedule_id: ObjectId, updates: Dict[str, Any]) -> Optional[WorkflowSchedule]:
        """Update an existing schedule"""
        schedule = await WorkflowSchedule.get(schedule_id)
        if not schedule:
            return None

        # Update fields
        for key, value in updates.items():
            if hasattr(schedule, key):
                setattr(schedule, key, value)

        schedule.updated_at = datetime.utcnow()
        await schedule.save()

        # Reschedule if active and enabled
        if schedule.enabled and schedule.status == ScheduleStatus.ACTIVE:
            await self._add_job(schedule)
        else:
            # Remove from scheduler if disabled
            self._remove_job(schedule)

        logger.info(f"Updated schedule: {schedule_id}")
        return schedule

    def _remove_job(self, schedule: WorkflowSchedule):
        """Remove a job from the scheduler"""
        if not self._initialized or not self.scheduler:
            return

        job_id = str(schedule.id)
        self.scheduler.remove_job(job_id)
        logger.info(f"Removed job: {job_id}")

    async def delete_schedule(self, schedule_id: ObjectId) -> bool:
        """Delete a schedule"""
        schedule = await WorkflowSchedule.get(schedule_id)
        if not schedule:
            return False

        # Remove from scheduler
        self._remove_job(schedule)

        # Delete from database
        await schedule.delete()

        logger.info(f"Deleted schedule: {schedule_id}")
        return True

    async def pause_schedule(self, schedule_id: ObjectId) -> Optional[WorkflowSchedule]:
        """Pause a schedule"""
        return await self.update_schedule(schedule_id, {
            "status": ScheduleStatus.PAUSED,
            "enabled": False
        })

    async def resume_schedule(self, schedule_id: ObjectId) -> Optional[WorkflowSchedule]:
        """Resume a paused schedule"""
        return await self.update_schedule(schedule_id, {
            "status": ScheduleStatus.ACTIVE,
            "enabled": True
        })

    async def get_schedule(self, schedule_id: ObjectId) -> Optional[WorkflowSchedule]:
        """Get a schedule by ID"""
        return await WorkflowSchedule.get(schedule_id)

    async def list_schedules(
        self,
        workflow_id: Optional[ObjectId] = None,
        status: Optional[ScheduleStatus] = None,
        enabled: Optional[bool] = None
    ) -> list[WorkflowSchedule]:
        """List schedules with optional filters"""
        query = {}

        if workflow_id:
            query["workflow_id"] = workflow_id
        if status:
            query["status"] = status
        if enabled is not None:
            query["enabled"] = enabled

        if query:
            return await WorkflowSchedule.find(query).to_list()
        else:
            return await WorkflowSchedule.find_all().to_list()

    async def get_execution_logs(
        self,
        schedule_id: Optional[ObjectId] = None,
        limit: int = 50
    ) -> list[ScheduleExecutionLog]:
        """Get execution logs for a schedule"""
        query = {}
        if schedule_id:
            query["schedule_id"] = schedule_id

        if query:
            return await ScheduleExecutionLog.find(query).sort(-ScheduleExecutionLog.scheduled_time).limit(limit).to_list()
        else:
            return await ScheduleExecutionLog.find_all().sort(-ScheduleExecutionLog.scheduled_time).limit(limit).to_list()

    async def shutdown(self):
        """Shutdown the scheduler gracefully"""
        if self.scheduler and self._initialized:
            self.scheduler.shutdown(wait=True)
            self._initialized = False
            logger.info("Scheduler service shut down")


# Global scheduler instance
scheduler_service = SchedulerService()
