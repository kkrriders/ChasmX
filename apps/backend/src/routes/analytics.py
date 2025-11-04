"""
Enhanced Analytics API Routes.
Provides endpoints for real-time metrics, active workflow monitoring, 
node performance tracking, and quality & safety metrics.
"""
from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import Optional
from loguru import logger

from ..schemas.analytics import (
    RealtimeMetricsResponse,
    ActiveWorkflowsResponse,
    NodePerformanceResponse,
    QualityMetricsResponse,
    AnalyticsError
)
from ..services.analytics_service import analytics_service
from ..auth.dependencies import get_current_user_optional
from ..models.user import User

router = APIRouter(prefix="/analytics", tags=["Enhanced Analytics"])


@router.get("/metrics/realtime", response_model=RealtimeMetricsResponse)
async def get_realtime_metrics(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get real-time aggregated metrics.
    
    Returns:
    - Active users count
    - Currently running workflows
    - API calls per minute
    - Total requests today
    - Success rate percentage
    - Average response time
    - Cache hit rate
    - Total cost today
    - System health status
    
    Metrics are cached for 30 seconds for performance.
    """
    try:
        logger.info("Fetching real-time metrics")
        metrics = await analytics_service.get_realtime_metrics()
        return metrics
        
    except Exception as e:
        logger.error(f"Failed to get realtime metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve real-time metrics: {str(e)}"
        )


@router.get("/workflows/active", response_model=ActiveWorkflowsResponse)
async def get_active_workflows(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get active workflows with names and progress.
    
    Returns detailed information about all currently running or queued workflows:
    - Workflow ID and name
    - User who initiated the workflow
    - Current execution status
    - Progress percentage (0-100)
    - Start time and estimated completion
    - Current node being executed
    - Total and completed node counts
    
    Useful for monitoring active system workload and user activity.
    """
    try:
        logger.info("Fetching active workflows")
        active_workflows = await analytics_service.get_active_workflows()
        return active_workflows
        
    except Exception as e:
        logger.error(f"Failed to get active workflows: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve active workflows: {str(e)}"
        )


@router.get("/nodes/performance", response_model=NodePerformanceResponse)
async def get_node_performance(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get node performance heatmap data.
    
    Returns performance metrics for each node type in the system:
    - Average latency and P95 latency
    - Success and error rates
    - Average cost per execution
    - Total and recent execution counts
    - Health score (0-100)
    
    Data covers the last 24 hours and is useful for:
    - Identifying performance bottlenecks
    - Optimizing workflow design
    - Monitoring system health
    - Cost optimization insights
    """
    try:
        logger.info("Fetching node performance metrics")
        performance = await analytics_service.get_node_performance()
        return performance
        
    except Exception as e:
        logger.error(f"Failed to get node performance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve node performance metrics: {str(e)}"
        )


@router.get("/quality", response_model=QualityMetricsResponse)
async def get_quality_metrics(
    period_hours: int = Query(
        24, 
        ge=1, 
        le=168,  # Max 1 week
        description="Time period in hours to analyze (1-168)"
    ),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get quality and safety metrics.
    
    Returns comprehensive quality and safety analytics:
    
    **Safety Metrics:**
    - Content block rate (filtered/inappropriate content)
    - PII detection incidents and prevention
    - Safety violation breakdown by type
    
    **Quality Metrics:**
    - Estimated hallucination rate
    - User feedback scores
    - AI-assessed content quality
    - Response coherence and relevance scores
    
    **Overall Scores:**
    - Overall safety score (0-100)
    - Overall quality score (0-100)
    - Quality trends over time
    
    This data is essential for:
    - Ensuring content safety and compliance
    - Monitoring AI output quality
    - Identifying areas for improvement
    - Maintaining user trust and satisfaction
    """
    try:
        logger.info(f"Fetching quality metrics for {period_hours} hours")
        quality = await analytics_service.get_quality_metrics(period_hours)
        return quality
        
    except Exception as e:
        logger.error(f"Failed to get quality metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve quality metrics: {str(e)}"
        )


# Health check for analytics service
@router.get("/health")
async def analytics_health_check():
    """
    Check analytics service health.
    
    Returns the operational status of the analytics service
    and its ability to access required data sources.
    """
    try:
        # Try to get a simple metric to verify service health
        metrics = await analytics_service.get_realtime_metrics()
        
        return {
            "status": "healthy",
            "timestamp": metrics.timestamp,
            "cache_entries": len(analytics_service._cache),
            "service": "analytics"
        }
        
    except Exception as e:
        logger.error(f"Analytics health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "service": "analytics"
        }


# Debug endpoint for cache inspection (useful during development)
@router.get("/debug/cache")
async def get_cache_status(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get analytics cache status (debug endpoint).
    
    Returns information about cached analytics data for debugging purposes.
    """
    try:
        cache_info = {}
        for key, value in analytics_service._cache.items():
            cache_info[key] = {
                "timestamp": value["timestamp"].isoformat(),
                "age_seconds": (analytics_service._cache[key]['timestamp'] - value["timestamp"]).seconds,
                "valid": analytics_service._is_cache_valid(key)
            }
        
        return {
            "cache_entries": len(analytics_service._cache),
            "cache_duration_seconds": analytics_service.cache_duration,
            "entries": cache_info
        }
        
    except Exception as e:
        logger.error(f"Failed to get cache status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve cache status: {str(e)}"
        )