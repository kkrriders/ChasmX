"""
Usage Tracking and Analytics API Routes.
Provides endpoints for viewing token usage, costs, and analytics.
"""
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from loguru import logger

from ..services.usage_tracker import usage_tracker
from ..models.usage import UsageBudget

router = APIRouter(prefix="/usage", tags=["Usage & Analytics"])


# Request/Response Models

class UsageSummaryResponse(BaseModel):
    """Response for usage summary"""
    period: dict
    total_requests: int
    total_tokens: int
    total_prompt_tokens: int
    total_completion_tokens: int
    total_cost_usd: float
    cache_statistics: dict
    performance: dict
    model_breakdown: dict
    scope: dict


class DailyUsageItem(BaseModel):
    """Daily usage statistics"""
    date: str
    requests: int
    tokens: int
    cost_usd: float
    cache_hits: int


class CreateBudgetRequest(BaseModel):
    """Request to create a budget"""
    scope_type: str = Field(..., description="Budget scope (user, organization, workflow)")
    scope_id: str = Field(..., description="ID of the scoped entity")
    budget_usd: float = Field(..., gt=0, description="Budget limit in USD")
    period_type: str = Field(default="monthly", description="Budget period (daily, weekly, monthly)")
    alert_threshold_percent: float = Field(default=80.0, ge=0, le=100, description="Alert at this % of budget")


# Endpoints

@router.get("/summary", response_model=UsageSummaryResponse)
async def get_usage_summary(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    organization_id: Optional[str] = Query(None, description="Filter by organization ID"),
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    model_id: Optional[str] = Query(None, description="Filter by model ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days to include")
):
    """
    Get usage summary for a specific scope and time range.

    Returns aggregated statistics including:
    - Total requests, tokens, and costs
    - Cache hit rates
    - Performance metrics
    - Per-model breakdown
    """
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        end_date = datetime.utcnow()

        summary = await usage_tracker.get_usage_summary(
            user_id=user_id,
            organization_id=organization_id,
            workflow_id=workflow_id,
            start_date=start_date,
            end_date=end_date,
            model_id=model_id
        )

        return summary

    except Exception as e:
        logger.error(f"Failed to get usage summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get usage summary: {str(e)}"
        )


@router.get("/daily", response_model=List[DailyUsageItem])
async def get_daily_usage(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    organization_id: Optional[str] = Query(None, description="Filter by organization ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days to include")
):
    """
    Get daily usage breakdown.

    Returns daily statistics for the last N days, useful for charts and graphs.
    """
    try:
        daily_stats = await usage_tracker.get_daily_usage(
            user_id=user_id,
            organization_id=organization_id,
            days=days
        )

        return daily_stats

    except Exception as e:
        logger.error(f"Failed to get daily usage: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get daily usage: {str(e)}"
        )


@router.post("/budgets", response_model=dict)
async def create_budget(request: CreateBudgetRequest):
    """
    Create a usage budget.

    Budgets allow you to set spending limits at user, organization, or workflow level.
    Alerts will be sent when reaching the configured threshold.
    """
    try:
        budget = await usage_tracker.create_budget(
            scope_type=request.scope_type,
            scope_id=request.scope_id,
            budget_usd=request.budget_usd,
            period_type=request.period_type,
            alert_threshold_percent=request.alert_threshold_percent
        )

        return {
            "budget_id": str(budget.id),
            "scope_type": budget.scope_type,
            "scope_id": budget.scope_id,
            "budget_usd": budget.budget_usd,
            "period_type": budget.period_type,
            "period_start": budget.period_start.isoformat(),
            "period_end": budget.period_end.isoformat(),
            "alert_threshold_percent": budget.alert_threshold_percent,
            "is_active": budget.is_active
        }

    except Exception as e:
        logger.error(f"Failed to create budget: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create budget: {str(e)}"
        )


@router.get("/budgets/{scope_type}/{scope_id}", response_model=dict)
async def get_budget(
    scope_type: str,
    scope_id: str
):
    """
    Get current budget for a scope.

    Returns the active budget with current usage information.
    """
    try:
        budget = await UsageBudget.find_one({
            "scope_type": scope_type,
            "scope_id": scope_id,
            "is_active": True
        })

        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active budget found for {scope_type} {scope_id}"
            )

        usage_percent = (budget.current_usage_usd / budget.budget_usd) * 100 if budget.budget_usd > 0 else 0

        return {
            "budget_id": str(budget.id),
            "scope_type": budget.scope_type,
            "scope_id": budget.scope_id,
            "budget_usd": budget.budget_usd,
            "current_usage_usd": budget.current_usage_usd,
            "usage_percent": round(usage_percent, 2),
            "period_type": budget.period_type,
            "period_start": budget.period_start.isoformat(),
            "period_end": budget.period_end.isoformat(),
            "is_exceeded": budget.is_exceeded,
            "alert_sent": budget.alert_sent,
            "alert_threshold_percent": budget.alert_threshold_percent
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get budget: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get budget: {str(e)}"
        )


@router.get("/cost-comparison")
async def compare_model_costs(
    prompt_tokens: int = Query(..., ge=1, description="Number of prompt tokens"),
    completion_tokens: int = Query(..., ge=1, description="Number of completion tokens"),
    models: Optional[str] = Query(None, description="Comma-separated list of model IDs to compare")
):
    """
    Compare costs across different models.

    Useful for cost optimization - see which model would be cheapest for a given workload.
    """
    try:
        from ..services.llm.cost_calculator import cost_calculator

        model_list = models.split(",") if models else None

        costs = cost_calculator.compare_costs(
            input_tokens=prompt_tokens,
            output_tokens=completion_tokens,
            models=model_list
        )

        # Format response
        result = []
        for model_id, cost in costs.items():
            pricing = cost_calculator.get_model_pricing(model_id)
            result.append({
                "model_id": model_id,
                "cost_usd": round(cost, 6),
                "input_cost_per_1m": pricing.input_cost_per_1m if pricing else 0,
                "output_cost_per_1m": pricing.output_cost_per_1m if pricing else 0
            })

        return {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "models": result
        }

    except Exception as e:
        logger.error(f"Failed to compare costs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare costs: {str(e)}"
        )
