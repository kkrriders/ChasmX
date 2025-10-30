"""
Token Usage Tracking Models.
Stores LLM usage for analytics, billing, and cost optimization.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import Field
from beanie import Document


class TokenUsageRecord(Document):
    """
    Track LLM token usage for billing and analytics.

    This model stores every LLM API call for:
    - Cost tracking and attribution
    - Usage analytics and insights
    - Budget monitoring and alerts
    - Performance optimization
    """

    # Request metadata
    user_id: Optional[str] = Field(None, description="User who made the request")
    organization_id: Optional[str] = Field(None, description="Organization ID")
    workflow_id: Optional[str] = Field(None, description="Associated workflow ID")
    workflow_execution_id: Optional[str] = Field(None, description="Workflow execution ID")
    agent_id: Optional[str] = Field(None, description="Agent that made the request")

    # Model information
    model_id: str = Field(..., description="LLM model identifier")
    model_role: Optional[str] = Field(None, description="Model role (COMMUNICATION, REASONING, CODE, STRUCTURED)")

    # Token usage
    prompt_tokens: int = Field(..., description="Number of input/prompt tokens")
    completion_tokens: int = Field(..., description="Number of output/completion tokens")
    total_tokens: int = Field(..., description="Total tokens (prompt + completion)")

    # Cost information
    cost_usd: float = Field(..., description="Cost in USD for this request")
    estimated_value_usd: Optional[float] = Field(None, description="Estimated value if using paid model")

    # Cache information
    cached: bool = Field(default=False, description="Whether response was cached")
    cache_hit_type: Optional[str] = Field(None, description="Type of cache hit (exact, semantic)")
    similarity_score: Optional[float] = Field(None, description="Similarity score for semantic cache")

    # Performance metrics
    latency_ms: Optional[float] = Field(None, description="Response latency in milliseconds")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the request was made")

    # Request context
    endpoint: Optional[str] = Field(None, description="API endpoint called")
    request_id: Optional[str] = Field(None, description="Unique request identifier")

    # Additional metadata
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

    class Settings:
        name = "token_usage_records"
        indexes = [
            "user_id",
            "organization_id",
            "workflow_id",
            "workflow_execution_id",
            "agent_id",
            "model_id",
            "timestamp",
            [("user_id", 1), ("timestamp", -1)],  # Compound index for user queries
            [("organization_id", 1), ("timestamp", -1)],  # Compound index for org queries
            [("workflow_id", 1), ("timestamp", -1)]  # Compound index for workflow queries
        ]


class UsageAggregation(Document):
    """
    Aggregated usage statistics for faster queries.

    This model stores pre-aggregated data to avoid expensive queries on raw records.
    Aggregated by: hour, day, week, month
    """

    # Aggregation metadata
    period_type: str = Field(..., description="Aggregation period (hour, day, week, month)")
    period_start: datetime = Field(..., description="Start of the aggregation period")
    period_end: datetime = Field(..., description="End of the aggregation period")

    # Scope
    user_id: Optional[str] = Field(None, description="User ID (if user-level aggregation)")
    organization_id: Optional[str] = Field(None, description="Organization ID (if org-level)")
    workflow_id: Optional[str] = Field(None, description="Workflow ID (if workflow-level)")
    model_id: Optional[str] = Field(None, description="Model ID (if model-level)")

    # Aggregated metrics
    total_requests: int = Field(default=0, description="Total number of requests")
    total_tokens: int = Field(default=0, description="Total tokens used")
    total_prompt_tokens: int = Field(default=0, description="Total prompt tokens")
    total_completion_tokens: int = Field(default=0, description="Total completion tokens")
    total_cost_usd: float = Field(default=0.0, description="Total cost in USD")

    # Cache statistics
    cache_hits: int = Field(default=0, description="Number of cache hits")
    cache_misses: int = Field(default=0, description="Number of cache misses")
    cache_hit_rate: float = Field(default=0.0, description="Cache hit rate percentage")

    # Performance statistics
    avg_latency_ms: Optional[float] = Field(None, description="Average latency")
    p50_latency_ms: Optional[float] = Field(None, description="P50 latency")
    p95_latency_ms: Optional[float] = Field(None, description="P95 latency")
    p99_latency_ms: Optional[float] = Field(None, description="P99 latency")

    # Model breakdown (optional)
    model_breakdown: Optional[Dict[str, Dict[str, Any]]] = Field(
        default_factory=dict,
        description="Per-model statistics"
    )

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "usage_aggregations"
        indexes = [
            [("period_type", 1), ("period_start", -1)],
            [("user_id", 1), ("period_type", 1), ("period_start", -1)],
            [("organization_id", 1), ("period_type", 1), ("period_start", -1)],
            [("workflow_id", 1), ("period_type", 1), ("period_start", -1)]
        ]


class UsageBudget(Document):
    """
    Usage budgets and limits for cost control.

    Allows setting spending limits at user/org/workflow level.
    """

    # Scope
    scope_type: str = Field(..., description="Budget scope (user, organization, workflow)")
    scope_id: str = Field(..., description="ID of the scoped entity")

    # Budget configuration
    period_type: str = Field(..., description="Budget period (daily, weekly, monthly)")
    budget_usd: float = Field(..., description="Budget limit in USD")

    # Current usage
    current_usage_usd: float = Field(default=0.0, description="Current period usage")
    current_tokens: int = Field(default=0, description="Current period tokens")

    # Period tracking
    period_start: datetime = Field(..., description="Start of current period")
    period_end: datetime = Field(..., description="End of current period")

    # Alert configuration
    alert_threshold_percent: float = Field(default=80.0, description="Alert at this % of budget")
    alert_sent: bool = Field(default=False, description="Whether alert has been sent")

    # Status
    is_exceeded: bool = Field(default=False, description="Whether budget is exceeded")
    is_active: bool = Field(default=True, description="Whether budget is active")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "usage_budgets"
        indexes = [
            [("scope_type", 1), ("scope_id", 1)],
            "is_active",
            [("scope_id", 1), ("is_active", 1)]
        ]
