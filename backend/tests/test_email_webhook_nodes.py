"""
Test cases for real email and webhook implementation in workflow executor.

This module tests the new SMTP email sending and HTTP webhook functionality
that replaces the previous simulated implementations.
"""

import pytest
import asyncio
import os
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from app.models.workflow import Node
from app.services.workflow_executor import workflow_executor


class TestEmailNode:
    """Test cases for email node functionality"""

    @pytest.fixture
    def email_node(self):
        """Basic email node fixture"""
        return Node(
            id="test_email",
            type="email",
            position={"x": 0, "y": 0},
            config={
                "to": "test@example.com",
                "subject": "Test Subject",
                "body": "Test body content",
                "format": "text"
            }
        )

    @pytest.fixture
    def email_context(self):
        """Basic context fixture"""
        return {
            "variables": {
                "user_name": "John Doe",
                "user_email": "john@example.com"
            },
            "outputs": {
                "ai_processor": "Generated AI content"
            }
        }

    @pytest.mark.asyncio
    async def test_email_variable_interpolation(self, email_context):
        """Test that variables are properly interpolated in email fields"""
        node = Node(
            id="test_email_vars",
            type="email",
            position={"x": 0, "y": 0},
            config={
                "to": "{{user_email}}",
                "subject": "Hello {{user_name}}",
                "body": "AI says: {{outputs.ai_processor}}",
                "format": "text"
            }
        )

        # Mock the actual email sending
        with patch.object(workflow_executor, '_send_email', new_callable=AsyncMock) as mock_send:
            result = await workflow_executor._execute_email_node(node, email_context)
            
            # Verify interpolation happened correctly
            mock_send.assert_called_once()
            args, kwargs = mock_send.call_args
            
            # Check that variables were interpolated
            assert "john@example.com" in str(kwargs) or "john@example.com" in str(args)
            assert "Hello John Doe" in str(kwargs) or "Hello John Doe" in str(args)
            assert "Generated AI content" in str(kwargs) or "Generated AI content" in str(args)
            
            # Check result structure
            assert result["status"] == "completed"
            assert result["to"] == "john@example.com"
            assert result["subject"] == "Hello John Doe"

    @pytest.mark.asyncio
    async def test_email_html_format(self, email_context):
        """Test HTML email format"""
        html_body = "<h1>Hello {{user_name}}</h1><p>{{outputs.ai_processor}}</p>"
        
        node = Node(
            id="test_email_html",
            type="email",
            position={"x": 0, "y": 0},
            config={
                "to": "{{user_email}}",
                "subject": "HTML Test",
                "body": html_body,
                "format": "html"
            }
        )

        with patch.object(workflow_executor, '_send_email', new_callable=AsyncMock) as mock_send:
            result = await workflow_executor._execute_email_node(node, email_context)
            
            mock_send.assert_called_once()
            assert result["status"] == "completed"

    @pytest.mark.asyncio
    async def test_email_retry_logic(self, email_node, email_context):
        """Test email retry logic on failure"""
        email_node.config.update({
            "retries": 2,
            "retry_delay": 0.1  # Fast retry for testing
        })

        # Mock send_email to fail twice, then succeed
        with patch.object(workflow_executor, '_send_email', new_callable=AsyncMock) as mock_send:
            mock_send.side_effect = [
                Exception("SMTP connection failed"),
                Exception("Temporary server error"),
                None  # Success on third attempt
            ]
            
            result = await workflow_executor._execute_email_node(email_node, email_context)
            
            # Should have been called 3 times (2 failures + 1 success)
            assert mock_send.call_count == 3
            assert result["status"] == "completed"
            assert result["attempts"] == 3

    @pytest.mark.asyncio
    async def test_email_max_retries_exceeded(self, email_node, email_context):
        """Test behavior when max retries are exceeded"""
        email_node.config.update({
            "retries": 1,
            "retry_delay": 0.1
        })

        with patch.object(workflow_executor, '_send_email', new_callable=AsyncMock) as mock_send:
            mock_send.side_effect = Exception("Persistent SMTP error")
            
            result = await workflow_executor._execute_email_node(email_node, email_context)
            
            # Should have been called 2 times (initial + 1 retry)
            assert mock_send.call_count == 2
            assert result["status"] == "error"
            assert "Persistent SMTP error" in result["error"]

    @pytest.mark.asyncio
    async def test_email_validation(self):
        """Test email field validation"""
        # Test missing required fields
        invalid_configs = [
            {"subject": "Test", "body": "Test"},  # Missing 'to'
            {"to": "test@example.com", "body": "Test"},  # Missing 'subject'
            {"to": "test@example.com", "subject": "Test"},  # Missing 'body'
        ]

        context = {"variables": {}, "outputs": {}}

        for config in invalid_configs:
            node = Node(
                id="test_invalid",
                type="email",
                position={"x": 0, "y": 0},
                config=config
            )
            
            result = await workflow_executor._execute_email_node(node, context)
            assert result["status"] == "error"


class TestWebhookNode:
    """Test cases for webhook node functionality"""

    @pytest.fixture
    def webhook_node(self):
        """Basic webhook node fixture"""
        return Node(
            id="test_webhook",
            type="webhook",
            position={"x": 0, "y": 0},
            config={
                "url": "https://httpbin.org/post",
                "method": "POST",
                "body": {"test": "data"},
                "headers": {"Content-Type": "application/json"}
            }
        )

    @pytest.fixture
    def webhook_context(self):
        """Webhook context fixture"""
        return {
            "variables": {
                "api_token": "test-token-123",
                "user_id": "12345"
            },
            "outputs": {
                "processing_result": "Success: 100 records processed"
            }
        }

    @pytest.mark.asyncio
    async def test_webhook_variable_interpolation(self, webhook_context):
        """Test variable interpolation in webhook configuration"""
        node = Node(
            id="test_webhook_vars",
            type="webhook",
            position={"x": 0, "y": 0},
            config={
                "url": "https://api.example.com/users/{{user_id}}/notify",
                "method": "POST",
                "headers": {
                    "Authorization": "Bearer {{api_token}}",
                    "Content-Type": "application/json"
                },
                "body": {
                    "user_id": "{{user_id}}",
                    "message": "{{outputs.processing_result}}"
                }
            }
        )

        with patch.object(workflow_executor, '_execute_http_request', new_callable=AsyncMock) as mock_request:
            mock_request.return_value = {
                "status_code": 200,
                "headers": {},
                "text": '{"success": true}',
                "json": {"success": True},
                "content_type": "application/json",
                "size": 17,
                "url": "https://api.example.com/users/12345/notify"
            }
            
            result = await workflow_executor._execute_webhook_node(node, webhook_context)
            
            # Verify the request was made with interpolated values
            mock_request.assert_called_once()
            args, kwargs = mock_request.call_args
            
            # Check URL interpolation
            assert kwargs["url"] == "https://api.example.com/users/12345/notify"
            
            # Check header interpolation
            assert kwargs["headers"]["Authorization"] == "Bearer test-token-123"
            
            # Check body interpolation
            expected_body = {
                "user_id": "12345",
                "message": "Success: 100 records processed"
            }
            assert kwargs["body_data"] == expected_body
            
            assert result["status"] == "completed"

    @pytest.mark.asyncio
    async def test_webhook_authentication_methods(self, webhook_context):
        """Test different webhook authentication methods"""
        auth_configs = [
            {
                "type": "bearer",
                "token": "bearer-token-123"
            },
            {
                "type": "basic",
                "username": "testuser",
                "password": "testpass"
            },
            {
                "type": "api_key",
                "key": "api-key-456",
                "header": "X-API-Key"
            }
        ]

        for auth_config in auth_configs:
            node = Node(
                id=f"test_webhook_{auth_config['type']}",
                type="webhook",
                position={"x": 0, "y": 0},
                config={
                    "url": "https://httpbin.org/post",
                    "method": "POST",
                    "auth": auth_config
                }
            )

            with patch.object(workflow_executor, '_execute_http_request', new_callable=AsyncMock) as mock_request:
                mock_request.return_value = {
                    "status_code": 200,
                    "headers": {},
                    "text": "{}",
                    "json": {},
                    "content_type": "application/json",
                    "size": 2,
                    "url": "https://httpbin.org/post"
                }
                
                result = await workflow_executor._execute_webhook_node(node, webhook_context)
                
                mock_request.assert_called_once()
                args, kwargs = mock_request.call_args
                
                # Check that auth config was passed
                assert kwargs["auth_config"] == auth_config
                assert result["status"] == "completed"

    @pytest.mark.asyncio
    async def test_webhook_retry_logic(self, webhook_node, webhook_context):
        """Test webhook retry logic"""
        webhook_node.config.update({
            "retries": 2,
            "retry_delay": 0.1,
            "expected_status": [200]
        })

        with patch.object(workflow_executor, '_execute_http_request', new_callable=AsyncMock) as mock_request:
            # Fail twice with different status codes, then succeed
            mock_request.side_effect = [
                {"status_code": 500, "text": "Server Error"},
                {"status_code": 502, "text": "Bad Gateway"},
                {
                    "status_code": 200,
                    "headers": {},
                    "text": '{"success": true}',
                    "json": {"success": True},
                    "content_type": "application/json",
                    "size": 17,
                    "url": "https://httpbin.org/post"
                }
            ]
            
            result = await workflow_executor._execute_webhook_node(webhook_node, webhook_context)
            
            # Should have been called 3 times
            assert mock_request.call_count == 3
            assert result["status"] == "completed"
            assert result["attempts"] == 3

    @pytest.mark.asyncio
    async def test_webhook_status_code_validation(self, webhook_node, webhook_context):
        """Test webhook status code validation"""
        webhook_node.config["expected_status"] = [200, 201]

        with patch.object(workflow_executor, '_execute_http_request', new_callable=AsyncMock) as mock_request:
            # Return unexpected status code
            mock_request.return_value = {
                "status_code": 404,
                "headers": {},
                "text": "Not Found",
                "json": None,
                "content_type": "text/plain",
                "size": 9,
                "url": "https://httpbin.org/post"
            }
            
            result = await workflow_executor._execute_webhook_node(webhook_node, webhook_context)
            
            assert result["status"] == "error"
            assert "Unexpected status code 404" in result["error"]

    @pytest.mark.asyncio
    async def test_webhook_url_validation(self, webhook_context):
        """Test webhook URL validation"""
        node = Node(
            id="test_invalid_webhook",
            type="webhook",
            position={"x": 0, "y": 0},
            config={
                "method": "POST",
                # Missing URL
            }
        )
        
        result = await workflow_executor._execute_webhook_node(node, webhook_context)
        assert result["status"] == "error"
        assert "URL is required" in result["error"]

    @pytest.mark.asyncio
    async def test_webhook_dict_interpolation(self):
        """Test the _interpolate_dict_values helper method"""
        test_data = {
            "simple": "{{var1}}",
            "nested": {
                "inner": "{{var2}}",
                "list": ["{{var1}}", "static", "{{var3}}"]
            },
            "static": "no_interpolation"
        }
        
        context = {
            "variables": {
                "var1": "value1",
                "var2": "value2", 
                "var3": "value3"
            },
            "outputs": {}
        }
        
        result = workflow_executor._interpolate_dict_values(test_data, context)
        
        expected = {
            "simple": "value1",
            "nested": {
                "inner": "value2",
                "list": ["value1", "static", "value3"]
            },
            "static": "no_interpolation"
        }
        
        assert result == expected


@pytest.mark.integration
class TestEmailWebhookIntegration:
    """Integration tests for email and webhook functionality"""

    @pytest.mark.asyncio
    async def test_email_webhook_workflow_sequence(self):
        """Test a workflow with both email and webhook nodes"""
        # This would be an integration test that creates a full workflow
        # and tests the sequence of email -> webhook execution
        pass

    @pytest.mark.skipif(
        not os.getenv("SMTP_HOST"), 
        reason="SMTP configuration required for live email testing"
    )
    @pytest.mark.asyncio
    async def test_real_email_sending(self):
        """Test actual email sending (requires SMTP configuration)"""
        node = Node(
            id="test_real_email",
            type="email",
            position={"x": 0, "y": 0},
            config={
                "to": os.getenv("TEST_EMAIL", "test@example.com"),
                "subject": "ChasmX Test Email",
                "body": "This is a real test email from ChasmX workflow executor.",
                "format": "text"
            }
        )
        
        context = {"variables": {}, "outputs": {}}
        
        # This will attempt real email sending
        result = await workflow_executor._execute_email_node(node, context)
        
        # With proper SMTP config, this should succeed
        if os.getenv("SMTP_HOST"):
            assert result["status"] == "completed"
        else:
            assert result["status"] == "error"