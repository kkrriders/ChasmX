# Email and Webhook Node Implementation Guide

## Overview

The ChasmX workflow executor now supports real email sending via SMTP and HTTP webhook calls, replacing the previous simulated implementations. This guide covers how to configure and use these enhanced features.

## Email Node Configuration

### Basic Configuration

```json
{
  "id": "email1",
  "type": "email",
  "config": {
    "to": "recipient@example.com",
    "subject": "Workflow Notification",
    "body": "Your workflow has completed successfully!"
  }
}
```

### Advanced Configuration

```json
{
  "id": "email_advanced",
  "type": "email", 
  "config": {
    "to": "{{user_email}}",
    "cc": "manager@company.com,team@company.com",
    "bcc": "audit@company.com",
    "from": "workflows@mycompany.com",
    "subject": "{{workflow_name}} - {{status}}",
    "body": "Hello {{user_name}},\n\nYour workflow '{{workflow_name}}' has completed with result: {{outputs.ai_processor}}",
    "format": "html",
    "retries": 3,
    "retry_delay": 2,
    "smtp": {
      "host": "smtp.company.com",
      "port": 587,
      "username": "workflows@company.com",
      "password": "app-password",
      "use_tls": true,
      "use_ssl": false
    }
  }
}
```

### Email Configuration Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `to` | string | Recipient email address (required) | - |
| `subject` | string | Email subject (required) | - |
| `body` | string | Email body content (required) | - |
| `from` | string | Sender email address | `SMTP_FROM_EMAIL` env var |
| `cc` | string | CC recipients (comma-separated) | - |
| `bcc` | string | BCC recipients (comma-separated) | - |
| `format` | string | Email format: "text" or "html" | "text" |
| `retries` | number | Maximum retry attempts | 3 |
| `retry_delay` | number | Delay between retries (seconds) | 1 |
| `smtp` | object | Override SMTP configuration | Global config |

## Webhook Node Configuration

### Basic Configuration

```json
{
  "id": "webhook1",
  "type": "webhook",
  "config": {
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "body": {
      "message": "Workflow completed",
      "data": "{{outputs.ai_processor}}"
    }
  }
}
```

### Advanced Configuration

```json
{
  "id": "webhook_advanced",
  "type": "webhook",
  "config": {
    "url": "https://api.example.com/v1/notifications",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "X-Workflow-ID": "{{workflow_id}}",
      "X-Custom-Header": "ChasmX-Workflow"
    },
    "body": {
      "workflow_id": "{{workflow_id}}",
      "execution_id": "{{execution_id}}",
      "timestamp": "{{timestamp}}",
      "results": {
        "ai_output": "{{outputs.ai_processor}}",
        "user_data": "{{user_name}}"
      },
      "metadata": {
        "source": "chasmx",
        "version": "1.0"
      }
    },
    "params": {
      "source": "workflow",
      "version": "v1"
    },
    "auth": {
      "type": "bearer",
      "token": "{{api_token}}"
    },
    "timeout": 30,
    "retries": 3,
    "retry_delay": 2,
    "expected_status": [200, 201, 202]
  }
}
```

### Webhook Configuration Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `url` | string | Target URL (required) | - |
| `method` | string | HTTP method (GET, POST, PUT, PATCH, DELETE) | "POST" |
| `headers` | object | HTTP headers | `{"User-Agent": "ChasmX-Workflow-Engine/1.0"}` |
| `body` | string/object | Request body (JSON object or string) | - |
| `params` | object | Query parameters | - |
| `auth` | object | Authentication configuration | - |
| `timeout` | number | Request timeout (seconds) | 30 |
| `retries` | number | Maximum retry attempts | 3 |
| `retry_delay` | number | Delay between retries (seconds) | 1 |
| `expected_status` | number/array | Expected HTTP status codes | [200, 201, 202, 204] |

## Authentication Options

### Bearer Token Authentication

```json
{
  "auth": {
    "type": "bearer",
    "token": "your-bearer-token"
  }
}
```

### Basic Authentication

```json
{
  "auth": {
    "type": "basic",
    "username": "your-username",
    "password": "your-password"
  }
}
```

### API Key Authentication

```json
{
  "auth": {
    "type": "api_key",
    "key": "your-api-key",
    "header": "X-API-Key"
  }
}
```

## Environment Variables

### SMTP Configuration

Set these environment variables for default SMTP configuration:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@yourcompany.com
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

### Common SMTP Providers

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

## Variable Interpolation

Both email and webhook nodes support variable interpolation using `{{variable}}` syntax:

- Workflow variables: `{{user_name}}`, `{{email}}`
- Node outputs: `{{outputs.node_id}}`
- System variables: `{{workflow_id}}`, `{{execution_id}}`, `{{timestamp}}`

### Example Workflow

```json
{
  "name": "User Notification Workflow",
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "config": {}
    },
    {
      "id": "ai_processor",
      "type": "ai-processor",
      "config": {
        "prompt": "Generate a personalized message for {{user_name}}",
        "model": "google/gemini-2.0-flash-exp:free"
      }
    },
    {
      "id": "send_email",
      "type": "email",
      "config": {
        "to": "{{user_email}}",
        "subject": "Your Personalized Message",
        "body": "{{outputs.ai_processor}}",
        "format": "text"
      }
    },
    {
      "id": "webhook_notification",
      "type": "webhook",
      "config": {
        "url": "https://api.analytics.com/events",
        "method": "POST",
        "body": {
          "event": "email_sent",
          "user": "{{user_name}}",
          "timestamp": "{{timestamp}}"
        },
        "auth": {
          "type": "bearer",
          "token": "{{analytics_api_token}}"
        }
      }
    }
  ],
  "edges": [
    {"from": "start", "to": "ai_processor"},
    {"from": "ai_processor", "to": "send_email"},
    {"from": "send_email", "to": "webhook_notification"}
  ]
}
```

## Error Handling

Both email and webhook nodes include comprehensive error handling:

### Retry Logic
- Configurable retry attempts and delays
- Exponential backoff can be implemented by increasing retry_delay
- All failed attempts are logged

### Error Responses
```json
{
  "status": "error",
  "error": "Error description",
  "timestamp": "2025-01-13T10:30:00Z"
}
```

### Success Responses

#### Email Success
```json
{
  "status": "completed",
  "output": "Email sent to user@example.com",
  "to": "user@example.com",
  "subject": "Test Subject",
  "attempts": 1,
  "timestamp": "2025-01-13T10:30:00Z"
}
```

#### Webhook Success
```json
{
  "status": "completed",
  "output": {
    "status_code": 200,
    "headers": {"content-type": "application/json"},
    "text": "{\"success\": true}",
    "json": {"success": true},
    "content_type": "application/json",
    "size": 17,
    "url": "https://api.example.com/webhook"
  },
  "url": "https://api.example.com/webhook",
  "method": "POST",
  "attempts": 1,
  "timestamp": "2025-01-13T10:30:00Z"
}
```

## Security Considerations

1. **Email Security**: Use app passwords or OAuth for Gmail/Outlook
2. **Webhook Security**: Always use HTTPS endpoints when possible
3. **Authentication**: Store sensitive tokens in environment variables
4. **Input Validation**: URL and email validation is performed automatically
5. **Timeouts**: Configure appropriate timeouts to prevent hanging requests

## Testing

### Email Testing
```python
# Test email configuration
import asyncio
from app.services.workflow_executor import workflow_executor

# Mock node and context for testing
test_node = Node(
    id="test_email",
    type="email",
    config={
        "to": "test@example.com",
        "subject": "Test Email",
        "body": "This is a test email",
        "format": "text"
    }
)

context = {"variables": {}, "outputs": {}}
result = await workflow_executor._execute_email_node(test_node, context)
print(result)
```

### Webhook Testing
```python
# Test webhook configuration
test_node = Node(
    id="test_webhook",
    type="webhook",
    config={
        "url": "https://httpbin.org/post",
        "method": "POST",
        "body": {"test": "data"},
        "headers": {"Content-Type": "application/json"}
    }
)

context = {"variables": {}, "outputs": {}}
result = await workflow_executor._execute_webhook_node(test_node, context)
print(result)
```

## Troubleshooting

### Common Email Issues
1. **Authentication Error**: Check SMTP credentials and app passwords
2. **Connection Timeout**: Verify SMTP host and port settings
3. **TLS/SSL Issues**: Ensure correct TLS/SSL configuration

### Common Webhook Issues
1. **Connection Refused**: Check URL and network connectivity
2. **Authentication Failed**: Verify API tokens and authentication method
3. **Unexpected Status Code**: Check expected_status configuration
4. **Timeout**: Increase timeout value for slow APIs

### Debug Mode
Enable debug logging to see detailed request/response information:

```python
import logging
logging.getLogger("aiosmtplib").setLevel(logging.DEBUG)
logging.getLogger("aiohttp").setLevel(logging.DEBUG)
```