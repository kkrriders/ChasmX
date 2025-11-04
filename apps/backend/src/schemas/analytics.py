"""
Analytics response schemas for enhanced analytics endpoints.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class RealtimeMetricsResponse(BaseModel):
    """Response for real-time aggregated metrics"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    active_users: int = Field(description="Number of currently active users")
    workflows_running: int = Field(description="Number of workflows currently running")
    api_calls_per_minute: int = Field(description="API calls in the last minute")
    total_requests_today: int = Field(description="Total requests since midnight")
    success_rate_percent: float = Field(description="Success rate in the last hour")
    avg_response_time_ms: float = Field(description="Average response time in milliseconds")
    cache_hit_rate_percent: float = Field(description="Cache hit rate percentage")
    total_cost_today_usd: float = Field(description="Total cost incurred today")
    system_health: str = Field(description="Overall system health status")


class ActiveWorkflowItem(BaseModel):
    """Individual active workflow information"""
    id: str = Field(description="Workflow execution ID")
    workflow_id: str = Field(description="Base workflow ID")
    name: str = Field(description="Workflow name")
    user_id: str = Field(description="User who initiated the workflow")
    status: str = Field(description="Current execution status")
    progress_percent: float = Field(description="Completion percentage (0-100)")
    started_at: datetime = Field(description="Workflow start time")
    estimated_completion: Optional[datetime] = Field(description="Estimated completion time")
    current_node: Optional[str] = Field(description="Currently executing node")
    total_nodes: int = Field(description="Total number of nodes in workflow")
    completed_nodes: int = Field(description="Number of completed nodes")


class ActiveWorkflowsResponse(BaseModel):
    """Response for active workflows with names and progress"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_active: int = Field(description="Total number of active workflows")
    workflows: List[ActiveWorkflowItem] = Field(description="List of active workflows")


class NodePerformanceItem(BaseModel):
    """Performance metrics for a specific node type"""
    node_type: str = Field(description="Type of node (e.g., 'llm', 'http', 'transform')")
    total_executions: int = Field(description="Total executions of this node type")
    avg_latency_ms: float = Field(description="Average execution latency in milliseconds")
    success_rate_percent: float = Field(description="Success rate percentage")
    error_rate_percent: float = Field(description="Error rate percentage")
    avg_cost_usd: float = Field(description="Average cost per execution")
    p95_latency_ms: float = Field(description="95th percentile latency")
    last_hour_executions: int = Field(description="Executions in the last hour")
    health_score: float = Field(description="Overall health score (0-100)")


class NodePerformanceResponse(BaseModel):
    """Response for node performance heatmap data"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_node_types: int = Field(description="Total number of different node types")
    nodes: List[NodePerformanceItem] = Field(description="Performance data for each node type")
    overall_health: float = Field(description="Overall system health score")


class QualityMetricsResponse(BaseModel):
    """Response for quality and safety metrics"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    period_hours: int = Field(default=24, description="Time period for metrics in hours")
    
    # Safety Metrics
    block_rate_percent: float = Field(description="Rate of blocked/filtered content")
    pii_incidents: int = Field(description="Number of PII detection incidents")
    pii_incidents_blocked: int = Field(description="Number of PII incidents successfully blocked")
    
    # Quality Metrics  
    hallucination_rate_percent: float = Field(description="Estimated hallucination rate")
    user_feedback_score: float = Field(description="Average user feedback score (1-5)")
    content_quality_score: float = Field(description="AI-assessed content quality score (0-100)")
    
    # Response Quality
    response_coherence_score: float = Field(description="Response coherence score (0-100)")
    response_relevance_score: float = Field(description="Response relevance score (0-100)")
    
    # Safety Breakdown
    safety_violations: Dict[str, int] = Field(description="Breakdown of safety violations by type")
    quality_trends: Dict[str, float] = Field(description="Quality metrics trends")
    
    # Overall Scores
    overall_safety_score: float = Field(description="Overall safety score (0-100)")
    overall_quality_score: float = Field(description="Overall quality score (0-100)")


class AnalyticsError(BaseModel):
    """Error response for analytics endpoints"""
    error: str = Field(description="Error message")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = Field(description="Additional error details")