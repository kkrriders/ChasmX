from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

from src.models import WebhookStatus, WebhookAuthType, WebhookMethod


# Request Schemas
class CreateWebhookRequest(BaseModel):
    workflow_id: str
    name: str
    description: Optional[str] = None

    # HTTP configuration
    allowed_methods: List[WebhookMethod] = Field(default_factory=lambda: [WebhookMethod.POST])
    allowed_ips: List[str] = Field(default_factory=list)
    allowed_origins: List[str] = Field(default_factory=list)

    # Authentication
    auth_type: WebhookAuthType = WebhookAuthType.SECRET

    # Payload configuration
    input_mapping: Dict[str, str] = Field(default_factory=dict)
    custom_headers: Dict[str, str] = Field(default_factory=dict)

    # Rate limiting
    rate_limit_enabled: bool = True
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000

    # Retry configuration
    retry_enabled: bool = True
    max_retries: int = 3
    retry_delay_seconds: int = 60

    enabled: bool = True

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "workflow_id": "507f1f77bcf86cd799439011",
                    "name": "GitHub Push Webhook",
                    "description": "Triggered when code is pushed to repository",
                    "allowed_methods": ["POST"],
                    "auth_type": "secret",
                    "input_mapping": {
                        "repository": "$.repository.name",
                        "branch": "$.ref",
                        "author": "$.pusher.name"
                    },
                    "rate_limit_per_minute": 60,
                    "enabled": True
                }
            ]
        }
    }


class UpdateWebhookRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    allowed_methods: Optional[List[WebhookMethod]] = None
    allowed_ips: Optional[List[str]] = None
    allowed_origins: Optional[List[str]] = None

    auth_type: Optional[WebhookAuthType] = None

    input_mapping: Optional[Dict[str, str]] = None
    custom_headers: Optional[Dict[str, str]] = None

    rate_limit_enabled: Optional[bool] = None
    rate_limit_per_minute: Optional[int] = None
    rate_limit_per_hour: Optional[int] = None

    retry_enabled: Optional[bool] = None
    max_retries: Optional[int] = None
    retry_delay_seconds: Optional[int] = None

    enabled: Optional[bool] = None
    status: Optional[WebhookStatus] = None


# Response Schemas
class WebhookResponse(BaseModel):
    id: str
    workflow_id: str
    name: str
    description: Optional[str]

    # Webhook URL info
    webhook_id: str
    webhook_url: str  # Full URL
    enabled: bool
    status: WebhookStatus

    # HTTP configuration
    allowed_methods: List[WebhookMethod]
    allowed_ips: List[str]
    allowed_origins: List[str]

    # Authentication
    auth_type: WebhookAuthType
    secret_token: Optional[str]  # Only shown on creation/regeneration
    signature_key: Optional[str]  # Only shown on creation/regeneration

    # Payload configuration
    input_mapping: Dict[str, str]
    custom_headers: Dict[str, str]

    # Rate limiting
    rate_limit_enabled: bool
    rate_limit_per_minute: int
    rate_limit_per_hour: int

    # Retry configuration
    retry_enabled: bool
    max_retries: int
    retry_delay_seconds: int

    # Statistics
    total_requests: int
    successful_executions: int
    failed_executions: int
    last_triggered_at: Optional[datetime]
    last_success_at: Optional[datetime]
    last_failure_at: Optional[datetime]

    # Metadata
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class WebhookExecutionResponse(BaseModel):
    id: str
    webhook_id: str
    workflow_id: str
    execution_id: Optional[str]

    # Request details
    method: str
    source_ip: Optional[str]
    user_agent: Optional[str]

    # Authentication
    auth_validated: bool
    auth_method: Optional[str]

    # Execution result
    status: str
    response_code: int
    response_message: Optional[str]
    error_message: Optional[str]

    # Timing
    received_at: datetime
    processed_at: Optional[datetime]
    duration_ms: Optional[float]

    # Retry tracking
    retry_count: int
    is_retry: bool

    model_config = {
        "from_attributes": True
    }


class WebhookListResponse(BaseModel):
    webhooks: list[WebhookResponse]
    total: int


class WebhookExecutionListResponse(BaseModel):
    executions: list[WebhookExecutionResponse]
    total: int


class WebhookSecretResponse(BaseModel):
    """Response when regenerating secrets"""
    webhook_id: str
    secret_token: str
    signature_key: str
    message: str = "Secrets regenerated successfully. Save these securely - they won't be shown again."
