"""
API routes for webhook management and receiving
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request, Header
from bson import ObjectId
from loguru import logger

from app.models import Webhook, WebhookStatus
from app.schemas.webhook import (
    CreateWebhookRequest,
    UpdateWebhookRequest,
    WebhookResponse,
    WebhookListResponse,
    WebhookExecutionResponse,
    WebhookExecutionListResponse,
    WebhookSecretResponse
)
from app.services.webhook_service import webhook_service
from app.core.config import settings


router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def webhook_to_response(webhook: Webhook, include_secrets: bool = False) -> WebhookResponse:
    """Convert Webhook model to response schema"""
    # Build full webhook URL
    base_url = settings.WEBHOOK_BASE_URL if hasattr(settings, 'WEBHOOK_BASE_URL') else "http://localhost:8000"
    webhook_url = f"{base_url}/webhooks/trigger/{webhook.webhook_id}"

    return WebhookResponse(
        id=str(webhook.id),
        workflow_id=str(webhook.workflow_id),
        name=webhook.name,
        description=webhook.description,
        webhook_id=webhook.webhook_id,
        webhook_url=webhook_url,
        enabled=webhook.enabled,
        status=webhook.status,
        allowed_methods=webhook.allowed_methods,
        allowed_ips=webhook.allowed_ips,
        allowed_origins=webhook.allowed_origins,
        auth_type=webhook.auth_type,
        secret_token=webhook.secret_token if include_secrets else None,
        signature_key=webhook.signature_key if include_secrets else None,
        input_mapping=webhook.input_mapping,
        custom_headers=webhook.custom_headers,
        rate_limit_enabled=webhook.rate_limit_enabled,
        rate_limit_per_minute=webhook.rate_limit_per_minute,
        rate_limit_per_hour=webhook.rate_limit_per_hour,
        retry_enabled=webhook.retry_enabled,
        max_retries=webhook.max_retries,
        retry_delay_seconds=webhook.retry_delay_seconds,
        total_requests=webhook.total_requests,
        successful_executions=webhook.successful_executions,
        failed_executions=webhook.failed_executions,
        last_triggered_at=webhook.last_triggered_at,
        last_success_at=webhook.last_success_at,
        last_failure_at=webhook.last_failure_at,
        created_by=webhook.created_by,
        created_at=webhook.created_at,
        updated_at=webhook.updated_at
    )


# Webhook Management Endpoints

@router.post("", response_model=WebhookResponse, status_code=201)
async def create_webhook(request: CreateWebhookRequest):
    """
    Create a new webhook for a workflow

    The webhook will receive a unique URL that can be used to trigger the workflow.
    Secrets (token and signature key) are shown only on creation.
    """
    try:
        webhook = Webhook(
            workflow_id=ObjectId(request.workflow_id),
            name=request.name,
            description=request.description,
            allowed_methods=request.allowed_methods,
            allowed_ips=request.allowed_ips,
            allowed_origins=request.allowed_origins,
            auth_type=request.auth_type,
            input_mapping=request.input_mapping,
            custom_headers=request.custom_headers,
            rate_limit_enabled=request.rate_limit_enabled,
            rate_limit_per_minute=request.rate_limit_per_minute,
            rate_limit_per_hour=request.rate_limit_per_hour,
            retry_enabled=request.retry_enabled,
            max_retries=request.max_retries,
            retry_delay_seconds=request.retry_delay_seconds,
            enabled=request.enabled
        )

        created_webhook = await webhook_service.create_webhook(webhook)
        return webhook_to_response(created_webhook, include_secrets=True)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create webhook: {e}")
        raise HTTPException(status_code=500, detail="Failed to create webhook")


@router.get("", response_model=WebhookListResponse)
async def list_webhooks(
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    status: Optional[WebhookStatus] = Query(None, description="Filter by status"),
    enabled: Optional[bool] = Query(None, description="Filter by enabled status")
):
    """List all webhooks with optional filters"""
    try:
        workflow_obj_id = ObjectId(workflow_id) if workflow_id else None

        webhooks = await webhook_service.list_webhooks(
            workflow_id=workflow_obj_id,
            status=status,
            enabled=enabled
        )

        return WebhookListResponse(
            webhooks=[webhook_to_response(w, include_secrets=False) for w in webhooks],
            total=len(webhooks)
        )

    except Exception as e:
        logger.error(f"Failed to list webhooks: {e}")
        raise HTTPException(status_code=500, detail="Failed to list webhooks")


@router.get("/{webhook_id}", response_model=WebhookResponse)
async def get_webhook(webhook_id: str):
    """Get a specific webhook by ID"""
    try:
        webhook = await webhook_service.get_webhook(ObjectId(webhook_id))

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        return webhook_to_response(webhook, include_secrets=False)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get webhook: {e}")
        raise HTTPException(status_code=500, detail="Failed to get webhook")


@router.put("/{webhook_id}", response_model=WebhookResponse)
async def update_webhook(webhook_id: str, request: UpdateWebhookRequest):
    """Update an existing webhook"""
    try:
        updates = {}
        for field, value in request.model_dump(exclude_unset=True).items():
            if value is not None:
                updates[field] = value

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        updated_webhook = await webhook_service.update_webhook(
            ObjectId(webhook_id),
            updates
        )

        if not updated_webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        return webhook_to_response(updated_webhook, include_secrets=False)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update webhook: {e}")
        raise HTTPException(status_code=500, detail="Failed to update webhook")


@router.delete("/{webhook_id}", status_code=204)
async def delete_webhook(webhook_id: str):
    """Delete a webhook"""
    try:
        success = await webhook_service.delete_webhook(ObjectId(webhook_id))

        if not success:
            raise HTTPException(status_code=404, detail="Webhook not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete webhook: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete webhook")


@router.post("/{webhook_id}/regenerate-secret", response_model=WebhookSecretResponse)
async def regenerate_webhook_secret(webhook_id: str):
    """
    Regenerate webhook secret token and signature key

    **Warning**: This will invalidate the old secrets. Update your webhook clients immediately.
    """
    try:
        webhook = await webhook_service.regenerate_secret(ObjectId(webhook_id))

        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        return WebhookSecretResponse(
            webhook_id=webhook.webhook_id,
            secret_token=webhook.secret_token or "",
            signature_key=webhook.signature_key or ""
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to regenerate webhook secret: {e}")
        raise HTTPException(status_code=500, detail="Failed to regenerate webhook secret")


@router.get("/{webhook_id}/executions", response_model=WebhookExecutionListResponse)
async def get_webhook_executions(
    webhook_id: str,
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of logs to return")
):
    """Get execution logs for a specific webhook"""
    try:
        executions = await webhook_service.get_webhook_executions(
            webhook_id=ObjectId(webhook_id),
            status=status,
            limit=limit
        )

        return WebhookExecutionListResponse(
            executions=[
                WebhookExecutionResponse(
                    id=str(exec.id),
                    webhook_id=str(exec.webhook_id),
                    workflow_id=str(exec.workflow_id),
                    execution_id=exec.execution_id,
                    method=exec.method,
                    source_ip=exec.source_ip,
                    user_agent=exec.user_agent,
                    auth_validated=exec.auth_validated,
                    auth_method=exec.auth_method,
                    status=exec.status,
                    response_code=exec.response_code,
                    response_message=exec.response_message,
                    error_message=exec.error_message,
                    received_at=exec.received_at,
                    processed_at=exec.processed_at,
                    duration_ms=exec.duration_ms,
                    retry_count=exec.retry_count,
                    is_retry=exec.is_retry
                )
                for exec in executions
            ],
            total=len(executions)
        )

    except Exception as e:
        logger.error(f"Failed to get webhook executions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get webhook executions")


# Webhook Receiver Endpoint

@router.api_route("/trigger/{webhook_id}", methods=["GET", "POST", "PUT", "PATCH"], include_in_schema=True)
async def receive_webhook(
    webhook_id: str,
    request: Request,
    x_webhook_secret: Optional[str] = Header(None),
    x_webhook_signature: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    user_agent: Optional[str] = Header(None)
):
    """
    Webhook receiver endpoint

    This is the URL that external services will call to trigger workflows.

    **Authentication**:
    - Secret Token: Pass in `X-Webhook-Secret` or `Authorization` header
    - HMAC Signature: Pass in `X-Webhook-Signature` or `X-Hub-Signature-256` header

    **Example**:
    ```bash
    curl -X POST https://api.example.com/webhooks/trigger/abc123... \\
      -H "X-Webhook-Secret: your-secret-token" \\
      -H "Content-Type: application/json" \\
      -d '{"repository": "my-repo", "branch": "main"}'
    ```
    """
    try:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"

        # Get headers
        headers = dict(request.headers)

        # Get query parameters
        query_params = dict(request.query_params)

        # Get body
        try:
            raw_body = (await request.body()).decode('utf-8')
            if request.headers.get("content-type") == "application/json":
                payload = await request.json()
            else:
                payload = {"raw": raw_body}
        except:
            raw_body = ""
            payload = {}

        # Process webhook
        status_code, response = await webhook_service.process_webhook_request(
            webhook_id=webhook_id,
            method=request.method,
            headers=headers,
            query_params=query_params,
            payload=payload,
            raw_body=raw_body,
            client_ip=client_ip,
            user_agent=user_agent
        )

        return response

    except Exception as e:
        logger.error(f"Webhook receiver error: {e}")
        return {"error": "Internal server error"}, 500
