from enum import Enum
from typing import Optional, Dict, Any, List
from datetime import datetime
from beanie import Document
from pydantic import Field
from bson import ObjectId
import secrets


class WebhookStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"


class WebhookAuthType(str, Enum):
    NONE = "none"  # No authentication
    SECRET = "secret"  # Secret token in header
    SIGNATURE = "signature"  # HMAC signature validation


class WebhookMethod(str, Enum):
    POST = "POST"
    GET = "GET"
    PUT = "PUT"
    PATCH = "PATCH"


class Webhook(Document):
    """Webhook configuration for workflow triggers"""

    workflow_id: ObjectId
    name: str
    description: Optional[str] = None

    # Webhook URL configuration
    webhook_id: str = Field(default_factory=lambda: secrets.token_urlsafe(32))  # Unique URL identifier
    enabled: bool = True
    status: WebhookStatus = WebhookStatus.ACTIVE

    # HTTP configuration
    allowed_methods: List[WebhookMethod] = Field(default_factory=lambda: [WebhookMethod.POST])
    allowed_ips: List[str] = Field(default_factory=list)  # Empty = allow all
    allowed_origins: List[str] = Field(default_factory=list)  # CORS origins

    # Authentication
    auth_type: WebhookAuthType = WebhookAuthType.SECRET
    secret_token: Optional[str] = Field(default_factory=lambda: secrets.token_urlsafe(32))
    signature_key: Optional[str] = Field(default_factory=lambda: secrets.token_urlsafe(32))

    # Payload configuration
    input_mapping: Dict[str, str] = Field(default_factory=dict)  # Map webhook payload to workflow inputs
    # Example: {"user_email": "$.data.email", "user_name": "$.data.name"}

    custom_headers: Dict[str, str] = Field(default_factory=dict)  # Custom headers to expect

    # Rate limiting
    rate_limit_enabled: bool = True
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000

    # Retry configuration for failed executions
    retry_enabled: bool = True
    max_retries: int = 3
    retry_delay_seconds: int = 60

    # Tracking
    total_requests: int = 0
    successful_executions: int = 0
    failed_executions: int = 0
    last_triggered_at: Optional[datetime] = None
    last_success_at: Optional[datetime] = None
    last_failure_at: Optional[datetime] = None

    # Metadata
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "webhooks"
        indexes = [
            "workflow_id",
            "webhook_id",  # For fast URL lookup
            "status",
            "enabled",
            [("workflow_id", 1), ("enabled", 1)],
        ]

    model_config = {
        "arbitrary_types_allowed": True
    }


class WebhookExecution(Document):
    """Log of webhook-triggered workflow executions"""

    webhook_id: ObjectId
    workflow_id: ObjectId
    execution_id: Optional[str] = None  # Workflow execution ID if successful

    # Request details
    method: str
    headers: Dict[str, str] = Field(default_factory=dict)
    query_params: Dict[str, Any] = Field(default_factory=dict)
    payload: Dict[str, Any] = Field(default_factory=dict)
    raw_body: Optional[str] = None

    # Client info
    source_ip: Optional[str] = None
    user_agent: Optional[str] = None

    # Authentication
    auth_validated: bool = False
    auth_method: Optional[str] = None

    # Execution result
    status: str  # received, processing, success, failed, rejected
    response_code: int = 200
    response_message: Optional[str] = None
    error_message: Optional[str] = None

    # Timing
    received_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    duration_ms: Optional[float] = None

    # Retry tracking
    retry_count: int = 0
    is_retry: bool = False

    class Settings:
        name = "webhook_executions"
        indexes = [
            "webhook_id",
            "workflow_id",
            "execution_id",
            "status",
            "received_at",
            [("webhook_id", 1), ("received_at", -1)],  # Recent requests first
        ]

    model_config = {
        "arbitrary_types_allowed": True
    }


class WebhookRateLimit(Document):
    """Rate limiting tracking for webhooks"""

    webhook_id: ObjectId
    client_ip: str

    # Counters
    requests_this_minute: int = 0
    requests_this_hour: int = 0

    # Tracking windows
    minute_window_start: datetime = Field(default_factory=datetime.utcnow)
    hour_window_start: datetime = Field(default_factory=datetime.utcnow)

    # Blocked status
    is_blocked: bool = False
    blocked_until: Optional[datetime] = None
    block_reason: Optional[str] = None

    last_request_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "webhook_rate_limits"
        indexes = [
            [("webhook_id", 1), ("client_ip", 1)],  # Composite unique
            "is_blocked",
            "blocked_until",
        ]

    model_config = {
        "arbitrary_types_allowed": True
    }
