# Email Automation Template - Quick Start Guide

## Overview
Functional email automation workflow that fetches user data from MongoDB Atlas and sends personalized welcome emails and meeting invitations using AI-generated content.

## Features
- MongoDB Atlas integration for user data
- AI-powered email personalization (Gemini 2.0 Flash)
- Automated welcome email sequence
- Meeting invitation scheduling
- Built-in retry logic for email delivery
- Full execution tracking and logging

## API Endpoints

### 1. List Available Templates
```bash
GET /api/workflows/templates/list
```

### 2. Load Email Automation Template
```bash
POST /api/workflows/templates/email_automation_template/load
```
Returns: Created workflow with ID

### 3. Execute Workflow
```bash
POST /api/workflows/{workflow_id}/execute
Content-Type: application/json

{
  "inputs": {},
  "async_execution": true
}
```

### 4. Check Execution Status
```bash
GET /api/workflows/executions/{execution_id}
```

## Setup Requirements

### 1. MongoDB Collection Setup
Create a `users` collection in your MongoDB Atlas with documents like:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "company": "Acme Corp",
  "status": "active",
  "created_at": "2025-10-14T00:00:00Z"
}
```

### 2. SMTP Configuration
Set these environment variables in `backend/.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

### 3. OpenRouter API Key
Required for AI personalization:
```bash
OPENROUTER_API_KEY=your-key-here
```

## Usage Example

```bash
# 1. Load the template
curl -X POST http://localhost:8000/api/workflows/templates/email_automation_template/load

# Response: { "id": "67abc123...", "name": "Email Automation - Welcome & Meeting Scheduler", ... }

# 2. Execute the workflow
curl -X POST http://localhost:8000/api/workflows/67abc123.../execute \
  -H "Content-Type: application/json" \
  -d '{"async_execution": true}'

# Response: { "execution_id": "uuid-here", "status": "queued", ... }

# 3. Check status
curl http://localhost:8000/api/workflows/executions/uuid-here
```

## Workflow Flow

1. **Start** - Initiates workflow
2. **MongoDB Fetch** - Queries users collection for:
   - Users without `email_sent` flag
   - Status = "active"
   - Sorted by created_at (newest first)
   - Limit: 50 users
3. **AI Personalization** - Generates personalized welcome content
4. **Welcome Email** - Sends email to each user
5. **Delay** - Waits 5 seconds
6. **AI Meeting Generator** - Creates meeting invitation content
7. **Meeting Email** - Sends meeting invitation
8. **End** - Completes workflow

## MongoDB Node Configuration

The data-source node now supports:
- **collection**: Collection name (default: "users")
- **query**: MongoDB filter query
- **projection**: Fields to return
- **limit**: Max documents (default: 100)
- **sort_field**: Field to sort by
- **sort_order**: 1 (ascending) or -1 (descending)

## Variable Interpolation

Use these in email templates:
- `{{outputs.mongodb-fetch-1.email}}` - User email
- `{{outputs.mongodb-fetch-1.name}}` - User name
- `{{outputs.mongodb-fetch-1.company}}` - Company name
- `{{outputs.ai-personalize-1}}` - AI-generated content

## Monitoring

View execution logs:
```bash
GET /api/workflows/executions/{execution_id}
```

Returns:
- Execution status (queued, running, success, error)
- Node states and outputs
- Detailed logs per node
- Error messages if any
- Timing information

## Notes

- Free tier: Uses `google/gemini-2.0-flash-exp:free` (no cost)
- Emails sent via configured SMTP server
- Supports HTML and plain text formats
- Automatic retry on failure (3 attempts)
- All data stored in MongoDB Atlas
- Execution history preserved for auditing

## Customization

Edit template at: `backend/app/templates/email_automation_template.json`

Modify:
- MongoDB query filters
- AI prompts and models
- Email content and styling
- Delay durations
- Retry logic
- Target collection names
