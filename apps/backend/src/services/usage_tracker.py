
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from loguru import logger

from ..models.usage import TokenUsageRecord, UsageAggregation, UsageBudget
from ..utils.email import send_budget_alert_email


class UsageTracker:
    """
    Service for tracking and analyzing LLM usage.

    Features:
    - Record every LLM API call
    - Track costs and token usage
    - Monitor budgets and send alerts
    - Generate usage analytics
    """

    @staticmethod
    async def record_usage(
        model_id: str,
        prompt_tokens: int,
        completion_tokens: int,
        cost_usd: float,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workflow_id: Optional[str] = None,
        workflow_execution_id: Optional[str] = None,
        agent_id: Optional[str] = None,
        model_role: Optional[str] = None,
        cached: bool = False,
        cache_hit_type: Optional[str] = None,
        similarity_score: Optional[float] = None,
        latency_ms: Optional[float] = None,
        endpoint: Optional[str] = None,
        request_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> TokenUsageRecord:
        """
        Record a single LLM usage event.

        Args:
            model_id: LLM model identifier
            prompt_tokens: Number of input tokens
            completion_tokens: Number of output tokens
            cost_usd: Cost in USD
            user_id: User who made the request
            organization_id: Organization ID
            workflow_id: Workflow ID
            workflow_execution_id: Workflow execution ID
            agent_id: Agent ID
            model_role: Model role (COMMUNICATION, REASONING, etc.)
            cached: Whether response was cached
            cache_hit_type: Type of cache hit
            similarity_score: Similarity score for semantic cache
            latency_ms: Response latency
            endpoint: API endpoint
            request_id: Request ID
            metadata: Additional metadata

        Returns:
            Created TokenUsageRecord
        """
        try:
            record = TokenUsageRecord(
                user_id=user_id,
                organization_id=organization_id,
                workflow_id=workflow_id,
                workflow_execution_id=workflow_execution_id,
                agent_id=agent_id,
                model_id=model_id,
                model_role=model_role,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
                cost_usd=cost_usd,
                cached=cached,
                cache_hit_type=cache_hit_type,
                similarity_score=similarity_score,
                latency_ms=latency_ms,
                timestamp=datetime.utcnow(),
                endpoint=endpoint,
                request_id=request_id,
                metadata=metadata or {}
            )

            await record.insert()

            logger.debug(
                f"Recorded usage: model={model_id}, tokens={record.total_tokens}, "
                f"cost=${cost_usd:.6f}, cached={cached}"
            )

            # Check budgets if user/org specified
            if user_id:
                await UsageTracker._check_budget("user", user_id, cost_usd)
            if organization_id:
                await UsageTracker._check_budget("organization", organization_id, cost_usd)
            if workflow_id:
                await UsageTracker._check_budget("workflow", workflow_id, cost_usd)

            return record

        except Exception as e:
            logger.error(f"Failed to record usage: {e}")
            raise

    @staticmethod
    async def get_usage_summary(
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        workflow_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        model_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get usage summary for a specific scope and time range.

        Args:
            user_id: Filter by user
            organization_id: Filter by organization
            workflow_id: Filter by workflow
            start_date: Start date (default: 30 days ago)
            end_date: End date (default: now)
            model_id: Filter by model

        Returns:
            Dictionary with usage statistics
        """
        try:
            # Default to last 30 days if not specified
            if not start_date:
                start_date = datetime.utcnow() - timedelta(days=30)
            if not end_date:
                end_date = datetime.utcnow()

            # Build query
            query = {"timestamp": {"$gte": start_date, "$lte": end_date}}

            if user_id:
                query["user_id"] = user_id
            if organization_id:
                query["organization_id"] = organization_id
            if workflow_id:
                query["workflow_id"] = workflow_id
            if model_id:
                query["model_id"] = model_id

            # Aggregate usage
            records = await TokenUsageRecord.find(query).to_list()

            total_requests = len(records)
            total_tokens = sum(r.total_tokens for r in records)
            total_prompt_tokens = sum(r.prompt_tokens for r in records)
            total_completion_tokens = sum(r.completion_tokens for r in records)
            total_cost = sum(r.cost_usd for r in records)

            cache_hits = sum(1 for r in records if r.cached)
            cache_misses = total_requests - cache_hits
            cache_hit_rate = (cache_hits / total_requests * 100) if total_requests > 0 else 0

            # Model breakdown
            model_breakdown = {}
            for record in records:
                if record.model_id not in model_breakdown:
                    model_breakdown[record.model_id] = {
                        "requests": 0,
                        "tokens": 0,
                        "cost": 0.0
                    }
                model_breakdown[record.model_id]["requests"] += 1
                model_breakdown[record.model_id]["tokens"] += record.total_tokens
                model_breakdown[record.model_id]["cost"] += record.cost_usd

            # Latency stats
            latencies = [r.latency_ms for r in records if r.latency_ms is not None]
            avg_latency = sum(latencies) / len(latencies) if latencies else None

            return {
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "total_requests": total_requests,
                "total_tokens": total_tokens,
                "total_prompt_tokens": total_prompt_tokens,
                "total_completion_tokens": total_completion_tokens,
                "total_cost_usd": round(total_cost, 6),
                "cache_statistics": {
                    "hits": cache_hits,
                    "misses": cache_misses,
                    "hit_rate_percent": round(cache_hit_rate, 2)
                },
                "performance": {
                    "avg_latency_ms": round(avg_latency, 2) if avg_latency else None
                },
                "model_breakdown": model_breakdown,
                "scope": {
                    "user_id": user_id,
                    "organization_id": organization_id,
                    "workflow_id": workflow_id,
                    "model_id": model_id
                }
            }

        except Exception as e:
            logger.error(f"Failed to get usage summary: {e}")
            raise

    @staticmethod
    async def get_daily_usage(
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get daily usage breakdown for the last N days.

        Args:
            user_id: Filter by user
            organization_id: Filter by organization
            days: Number of days to fetch

        Returns:
            List of daily usage statistics
        """
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            end_date = datetime.utcnow()

            query = {"timestamp": {"$gte": start_date, "$lte": end_date}}
            if user_id:
                query["user_id"] = user_id
            if organization_id:
                query["organization_id"] = organization_id

            records = await TokenUsageRecord.find(query).to_list()

            # Group by day
            daily_stats = {}
            for record in records:
                day_key = record.timestamp.strftime("%Y-%m-%d")

                if day_key not in daily_stats:
                    daily_stats[day_key] = {
                        "date": day_key,
                        "requests": 0,
                        "tokens": 0,
                        "cost_usd": 0.0,
                        "cache_hits": 0
                    }

                daily_stats[day_key]["requests"] += 1
                daily_stats[day_key]["tokens"] += record.total_tokens
                daily_stats[day_key]["cost_usd"] += record.cost_usd
                if record.cached:
                    daily_stats[day_key]["cache_hits"] += 1

            # Convert to sorted list
            result = sorted(daily_stats.values(), key=lambda x: x["date"])

            return result

        except Exception as e:
            logger.error(f"Failed to get daily usage: {e}")
            raise

    @staticmethod
    async def _check_budget(
        scope_type: str,
        scope_id: str,
        cost_usd: float
    ):
        """
        Check if usage is within budget and update budget tracking.

        Args:
            scope_type: Budget scope (user, organization, workflow)
            scope_id: ID of the scoped entity
            cost_usd: Cost to add to current usage
        """
        try:
            # Find active budget
            budget = await UsageBudget.find_one({
                "scope_type": scope_type,
                "scope_id": scope_id,
                "is_active": True
            })

            if not budget:
                return  # No budget configured

            # Update current usage
            budget.current_usage_usd += cost_usd
            budget.updated_at = datetime.utcnow()

            # Check if budget exceeded
            if budget.current_usage_usd >= budget.budget_usd:
                budget.is_exceeded = True
                logger.warning(
                    f"Budget exceeded for {scope_type} {scope_id}: "
                    f"${budget.current_usage_usd:.2f} / ${budget.budget_usd:.2f}"
                )

                # Send budget exceeded alert
                await UsageTracker._send_budget_alert(
                    scope_type=scope_type,
                    scope_id=scope_id,
                    alert_type="exceeded",
                    current_usage=budget.current_usage_usd,
                    budget_limit=budget.budget_usd,
                    percentage=100.0
                )

            # Check alert threshold
            elif not budget.alert_sent:
                usage_percent = (budget.current_usage_usd / budget.budget_usd) * 100
                if usage_percent >= budget.alert_threshold_percent:
                    budget.alert_sent = True
                    logger.warning(
                        f"Budget alert threshold reached for {scope_type} {scope_id}: "
                        f"{usage_percent:.1f}% of budget used"
                    )

                    # Send threshold alert
                    await UsageTracker._send_budget_alert(
                        scope_type=scope_type,
                        scope_id=scope_id,
                        alert_type="threshold",
                        current_usage=budget.current_usage_usd,
                        budget_limit=budget.budget_usd,
                        percentage=usage_percent
                    )

            await budget.save()

        except Exception as e:
            logger.error(f"Failed to check budget: {e}")
            # Don't raise - budget checking shouldn't block requests

    @staticmethod
    async def _send_budget_alert(
        scope_type: str,
        scope_id: str,
        alert_type: str,
        current_usage: float,
        budget_limit: float,
        percentage: float
    ):
        """
        Send budget alert notification to user.

        Args:
            scope_type: Budget scope (user, organization, workflow)
            scope_id: ID of the scoped entity
            alert_type: Type of alert ('threshold' or 'exceeded')
            current_usage: Current usage amount in USD
            budget_limit: Budget limit in USD
            percentage: Usage percentage
        """
        try:
            # Get user email based on scope
            user_email = None

            if scope_type == "user":
                # Import here to avoid circular imports
                from ..models.user import User
                from bson import ObjectId

                try:
                    # Find user by ObjectId
                    user = await User.get(ObjectId(scope_id))
                    if user:
                        user_email = user.email
                except Exception as e:
                    logger.error(f"Failed to get user {scope_id}: {e}")
                    return

            elif scope_type == "organization":
                # For organization scope, get admin emails
                # This would require organization model implementation
                logger.info(f"Organization-level alerts not yet implemented for {scope_id}")
                return

            elif scope_type == "workflow":
                # For workflow scope, get the workflow owner's email
                logger.info(f"Workflow-level alerts not yet implemented for {scope_id}")
                return

            if not user_email:
                logger.warning(f"Could not find email for {scope_type} {scope_id}")
                return

            # Prepare alert details
            details = {
                "scope_type": scope_type,
                "scope_id": scope_id,
                "current_usage_usd": current_usage,
                "budget_usd": budget_limit,
                "percentage": percentage
            }

            # Send the alert email
            success = await send_budget_alert_email(
                to_email=user_email,
                alert_type=alert_type,
                details=details
            )

            if success:
                logger.info(f"Budget alert sent to {user_email} for {scope_type} {scope_id}")
            else:
                logger.error(f"Failed to send budget alert to {user_email}")

        except Exception as e:
            logger.error(f"Error sending budget alert: {e}")
            # Don't raise - alert sending shouldn't block the main flow

    @staticmethod
    async def create_budget(
        scope_type: str,
        scope_id: str,
        budget_usd: float,
        period_type: str = "monthly",
        alert_threshold_percent: float = 80.0
    ) -> UsageBudget:
        """
        Create a usage budget.

        Args:
            scope_type: Budget scope (user, organization, workflow)
            scope_id: ID of the scoped entity
            budget_usd: Budget limit in USD
            period_type: Budget period (daily, weekly, monthly)
            alert_threshold_percent: Alert at this % of budget

        Returns:
            Created UsageBudget
        """
        try:
            # Calculate period dates
            now = datetime.utcnow()

            if period_type == "daily":
                period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                period_end = period_start + timedelta(days=1)
            elif period_type == "weekly":
                period_start = now - timedelta(days=now.weekday())
                period_start = period_start.replace(hour=0, minute=0, second=0, microsecond=0)
                period_end = period_start + timedelta(days=7)
            else:  # monthly
                period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                # Next month
                if now.month == 12:
                    period_end = period_start.replace(year=now.year + 1, month=1)
                else:
                    period_end = period_start.replace(month=now.month + 1)

            budget = UsageBudget(
                scope_type=scope_type,
                scope_id=scope_id,
                period_type=period_type,
                budget_usd=budget_usd,
                period_start=period_start,
                period_end=period_end,
                alert_threshold_percent=alert_threshold_percent
            )

            await budget.insert()

            logger.info(
                f"Created budget for {scope_type} {scope_id}: "
                f"${budget_usd:.2f} per {period_type}"
            )

            return budget

        except Exception as e:
            logger.error(f"Failed to create budget: {e}")
            raise


# Global usage tracker instance
usage_tracker = UsageTracker()
