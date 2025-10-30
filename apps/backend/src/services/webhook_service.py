"""
Webhook Service
Handles webhook validation, rate limiting, and workflow triggering
"""

import hmac
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from bson import ObjectId
from loguru import logger
from jsonpath_ng import parse

from src.models import (
    Webhook,
    WebhookExecution,
    WebhookRateLimit,
    WebhookStatus,
    WebhookAuthType,
    Workflow
)
from src.services.workflow_executor import WorkflowExecutor


class WebhookService:
    """Service for managing and processing webhooks"""

    def __init__(self):
        self.executor = WorkflowExecutor()

    async def create_webhook(self, webhook: Webhook) -> Webhook:
        """Create a new webhook"""
        # Validate workflow exists
        workflow = await Workflow.get(webhook.workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {webhook.workflow_id} not found")

        # Save webhook
        await webhook.insert()
        logger.info(f"Created webhook: {webhook.name} (ID: {webhook.id})")
        return webhook

    async def get_webhook_by_id(self, webhook_id: str) -> Optional[Webhook]:
        """Get webhook by webhook_id (URL identifier)"""
        return await Webhook.find_one(Webhook.webhook_id == webhook_id)

    async def get_webhook(self, id: ObjectId) -> Optional[Webhook]:
        """Get webhook by database ID"""
        return await Webhook.get(id)

    async def list_webhooks(
        self,
        workflow_id: Optional[ObjectId] = None,
        status: Optional[WebhookStatus] = None,
        enabled: Optional[bool] = None
    ) -> list[Webhook]:
        """List webhooks with filters"""
        query = {}
        if workflow_id:
            query["workflow_id"] = workflow_id
        if status:
            query["status"] = status
        if enabled is not None:
            query["enabled"] = enabled

        if query:
            return await Webhook.find(query).to_list()
        else:
            return await Webhook.find_all().to_list()

    async def update_webhook(self, id: ObjectId, updates: Dict[str, Any]) -> Optional[Webhook]:
        """Update a webhook"""
        webhook = await Webhook.get(id)
        if not webhook:
            return None

        # Update fields
        for key, value in updates.items():
            if hasattr(webhook, key):
                setattr(webhook, key, value)

        webhook.updated_at = datetime.utcnow()
        await webhook.save()

        logger.info(f"Updated webhook: {id}")
        return webhook

    async def delete_webhook(self, id: ObjectId) -> bool:
        """Delete a webhook"""
        webhook = await Webhook.get(id)
        if not webhook:
            return False

        await webhook.delete()
        logger.info(f"Deleted webhook: {id}")
        return True

    async def regenerate_secret(self, id: ObjectId) -> Optional[Webhook]:
        """Regenerate webhook secret token"""
        import secrets
        webhook = await Webhook.get(id)
        if not webhook:
            return None

        webhook.secret_token = secrets.token_urlsafe(32)
        webhook.signature_key = secrets.token_urlsafe(32)
        webhook.updated_at = datetime.utcnow()
        await webhook.save()

        logger.info(f"Regenerated secrets for webhook: {id}")
        return webhook

    def _validate_signature(self, webhook: Webhook, payload: str, signature: str) -> bool:
        """Validate HMAC signature"""
        if not webhook.signature_key:
            return False

        expected_signature = hmac.new(
            webhook.signature_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(signature, expected_signature)

    def _validate_secret_token(self, webhook: Webhook, token: str) -> bool:
        """Validate secret token"""
        if not webhook.secret_token:
            return False

        return hmac.compare_digest(token, webhook.secret_token)

    async def _check_rate_limit(self, webhook: Webhook, client_ip: str) -> Tuple[bool, Optional[str]]:
        """Check if request is within rate limits"""
        if not webhook.rate_limit_enabled:
            return True, None

        # Get or create rate limit record
        rate_limit = await WebhookRateLimit.find_one(
            WebhookRateLimit.webhook_id == webhook.id,
            WebhookRateLimit.client_ip == client_ip
        )

        now = datetime.utcnow()

        if not rate_limit:
            # Create new rate limit record
            rate_limit = WebhookRateLimit(
                webhook_id=webhook.id,
                client_ip=client_ip,
                requests_this_minute=1,
                requests_this_hour=1,
                minute_window_start=now,
                hour_window_start=now,
                last_request_at=now
            )
            await rate_limit.insert()
            return True, None

        # Check if blocked
        if rate_limit.is_blocked and rate_limit.blocked_until:
            if now < rate_limit.blocked_until:
                return False, f"Rate limit exceeded. Try again after {rate_limit.blocked_until.isoformat()}"
            else:
                # Unblock
                rate_limit.is_blocked = False
                rate_limit.blocked_until = None

        # Reset minute window if needed
        if (now - rate_limit.minute_window_start).total_seconds() >= 60:
            rate_limit.requests_this_minute = 0
            rate_limit.minute_window_start = now

        # Reset hour window if needed
        if (now - rate_limit.hour_window_start).total_seconds() >= 3600:
            rate_limit.requests_this_hour = 0
            rate_limit.hour_window_start = now

        # Check limits
        rate_limit.requests_this_minute += 1
        rate_limit.requests_this_hour += 1
        rate_limit.last_request_at = now

        if rate_limit.requests_this_minute > webhook.rate_limit_per_minute:
            rate_limit.is_blocked = True
            rate_limit.blocked_until = now + timedelta(minutes=1)
            rate_limit.block_reason = "Minute rate limit exceeded"
            await rate_limit.save()
            return False, "Rate limit exceeded: too many requests per minute"

        if rate_limit.requests_this_hour > webhook.rate_limit_per_hour:
            rate_limit.is_blocked = True
            rate_limit.blocked_until = now + timedelta(hours=1)
            rate_limit.block_reason = "Hour rate limit exceeded"
            await rate_limit.save()
            return False, "Rate limit exceeded: too many requests per hour"

        await rate_limit.save()
        return True, None

    def _extract_inputs_from_payload(self, webhook: Webhook, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Extract workflow inputs from webhook payload using JSONPath"""
        inputs = {}

        for workflow_input_name, jsonpath_expr in webhook.input_mapping.items():
            try:
                # Parse JSONPath expression
                jsonpath_parser = parse(jsonpath_expr)
                matches = jsonpath_parser.find(payload)

                if matches:
                    # Take the first match
                    inputs[workflow_input_name] = matches[0].value
                else:
                    logger.warning(f"JSONPath '{jsonpath_expr}' found no matches in payload")
            except Exception as e:
                logger.error(f"Failed to extract input '{workflow_input_name}' with path '{jsonpath_expr}': {e}")

        return inputs

    async def process_webhook_request(
        self,
        webhook_id: str,
        method: str,
        headers: Dict[str, str],
        query_params: Dict[str, Any],
        payload: Dict[str, Any],
        raw_body: str,
        client_ip: str,
        user_agent: Optional[str]
    ) -> Tuple[int, Dict[str, Any]]:
        """
        Process incoming webhook request
        Returns: (status_code, response_body)
        """
        start_time = datetime.utcnow()

        # Create execution log
        execution_log = WebhookExecution(
            webhook_id=ObjectId(),  # Will be updated if webhook found
            workflow_id=ObjectId(),  # Will be updated if webhook found
            method=method,
            headers=headers,
            query_params=query_params,
            payload=payload,
            raw_body=raw_body,
            source_ip=client_ip,
            user_agent=user_agent,
            status="received",
            received_at=start_time
        )

        try:
            # Find webhook
            webhook = await self.get_webhook_by_id(webhook_id)
            if not webhook:
                execution_log.status = "rejected"
                execution_log.response_code = 404
                execution_log.error_message = "Webhook not found"
                await execution_log.insert()
                return 404, {"error": "Webhook not found"}

            execution_log.webhook_id = webhook.id
            execution_log.workflow_id = webhook.workflow_id

            # Check if webhook is enabled
            if not webhook.enabled or webhook.status != WebhookStatus.ACTIVE:
                execution_log.status = "rejected"
                execution_log.response_code = 403
                execution_log.error_message = "Webhook is disabled"
                await execution_log.insert()
                return 403, {"error": "Webhook is disabled"}

            # Validate HTTP method
            if method not in [m.value for m in webhook.allowed_methods]:
                execution_log.status = "rejected"
                execution_log.response_code = 405
                execution_log.error_message = f"Method {method} not allowed"
                await execution_log.insert()
                return 405, {"error": f"Method {method} not allowed"}

            # Check IP whitelist
            if webhook.allowed_ips and client_ip not in webhook.allowed_ips:
                execution_log.status = "rejected"
                execution_log.response_code = 403
                execution_log.error_message = "IP address not allowed"
                await execution_log.insert()
                return 403, {"error": "IP address not allowed"}

            # Check rate limits
            rate_limit_ok, rate_limit_msg = await self._check_rate_limit(webhook, client_ip)
            if not rate_limit_ok:
                execution_log.status = "rejected"
                execution_log.response_code = 429
                execution_log.error_message = rate_limit_msg
                await execution_log.insert()
                return 429, {"error": rate_limit_msg}

            # Validate authentication
            auth_validated = False
            auth_method = "none"

            if webhook.auth_type == WebhookAuthType.SECRET:
                auth_header = headers.get("X-Webhook-Secret") or headers.get("Authorization")
                if auth_header:
                    # Handle Bearer token format
                    token = auth_header.replace("Bearer ", "").strip()
                    auth_validated = self._validate_secret_token(webhook, token)
                    auth_method = "secret"

            elif webhook.auth_type == WebhookAuthType.SIGNATURE:
                signature_header = headers.get("X-Webhook-Signature") or headers.get("X-Hub-Signature-256")
                if signature_header:
                    # Remove algorithm prefix if present (e.g., "sha256=...")
                    signature = signature_header.split("=")[-1]
                    auth_validated = self._validate_signature(webhook, raw_body, signature)
                    auth_method = "signature"

            elif webhook.auth_type == WebhookAuthType.NONE:
                auth_validated = True
                auth_method = "none"

            execution_log.auth_validated = auth_validated
            execution_log.auth_method = auth_method

            if not auth_validated and webhook.auth_type != WebhookAuthType.NONE:
                execution_log.status = "rejected"
                execution_log.response_code = 401
                execution_log.error_message = "Authentication failed"
                await execution_log.insert()
                return 401, {"error": "Authentication failed"}

            # Extract inputs from payload
            execution_log.status = "processing"
            await execution_log.insert()

            inputs = self._extract_inputs_from_payload(webhook, payload)

            # Load workflow
            workflow = await Workflow.get(webhook.workflow_id)
            if not workflow:
                execution_log.status = "failed"
                execution_log.response_code = 500
                execution_log.error_message = "Associated workflow not found"
                await execution_log.save()
                return 500, {"error": "Associated workflow not found"}

            # Execute workflow
            run = await self.executor.execute_workflow(
                workflow=workflow,
                inputs=inputs
            )

            # Update execution log
            execution_log.execution_id = run.execution_id
            execution_log.status = "success"
            execution_log.response_code = 200
            execution_log.response_message = "Workflow triggered successfully"
            execution_log.processed_at = datetime.utcnow()
            execution_log.duration_ms = (execution_log.processed_at - start_time).total_seconds() * 1000
            await execution_log.save()

            # Update webhook stats
            webhook.total_requests += 1
            webhook.successful_executions += 1
            webhook.last_triggered_at = datetime.utcnow()
            webhook.last_success_at = datetime.utcnow()
            await webhook.save()

            return 200, {
                "success": True,
                "message": "Workflow triggered successfully",
                "execution_id": run.execution_id,
                "workflow_id": str(workflow.id)
            }

        except Exception as e:
            logger.error(f"Webhook processing error: {e}")
            execution_log.status = "failed"
            execution_log.response_code = 500
            execution_log.error_message = str(e)
            execution_log.processed_at = datetime.utcnow()
            execution_log.duration_ms = (execution_log.processed_at - start_time).total_seconds() * 1000
            await execution_log.save()

            # Update webhook stats
            if webhook:
                webhook.total_requests += 1
                webhook.failed_executions += 1
                webhook.last_triggered_at = datetime.utcnow()
                webhook.last_failure_at = datetime.utcnow()
                await webhook.save()

            return 500, {"error": "Internal server error", "message": str(e)}

    async def get_webhook_executions(
        self,
        webhook_id: Optional[ObjectId] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> list[WebhookExecution]:
        """Get webhook execution logs"""
        query = {}
        if webhook_id:
            query["webhook_id"] = webhook_id
        if status:
            query["status"] = status

        if query:
            return await WebhookExecution.find(query).sort(-WebhookExecution.received_at).limit(limit).to_list()
        else:
            return await WebhookExecution.find_all().sort(-WebhookExecution.received_at).limit(limit).to_list()


# Global webhook service instance
webhook_service = WebhookService()
