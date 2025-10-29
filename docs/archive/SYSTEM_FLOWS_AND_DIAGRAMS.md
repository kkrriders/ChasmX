# 📊 SYSTEM FLOWS & INTERACTION DIAGRAMS
## ChasmX Workflow Automation Platform

**Document Version:** 1.0
**Last Updated:** 2025-10-22

---

## 📋 TABLE OF CONTENTS

1. [User Authentication Flow](#user-authentication-flow)
2. [Workflow Creation Flow](#workflow-creation-flow)
3. [Workflow Execution Flow](#workflow-execution-flow)
4. [AI-Powered Workflow Generation](#ai-powered-workflow-generation)
5. [Real-Time Updates Flow](#real-time-updates-flow)
6. [Error Handling & Recovery](#error-handling--recovery)
7. [Scaling & Load Balancing](#scaling--load-balancing)
8. [Data Synchronization](#data-synchronization)
9. [Payment & Billing Flow](#payment--billing-flow)
10. [Monitoring & Alerting Flow](#monitoring--alerting-flow)

---

## 🔐 USER AUTHENTICATION FLOW

### Registration & Login Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Navigate to /auth/register
     ▼
┌─────────────────────────┐
│   Frontend (Next.js)    │
│  ┌──────────────────┐   │
│  │ Registration Form│   │
│  │ - Email          │   │
│  │ - Password       │   │
│  │ - Name           │   │
│  └──────────────────┘   │
└────────┬────────────────┘
         │
         │ 2. POST /api/v1/auth/register
         │    { email, password, name }
         ▼
┌─────────────────────────────────────────┐
│         API Gateway (Kong)              │
│  ┌───────────────────────────────────┐  │
│  │ 1. Rate limit check (5/min)      │  │
│  │ 2. Request validation             │  │
│  │ 3. WAF inspection                 │  │
│  └───────────────────────────────────┘  │
└────────┬────────────────────────────────┘
         │
         │ 3. Forward request
         ▼
┌─────────────────────────────────────────┐
│      Backend (FastAPI)                  │
│  ┌───────────────────────────────────┐  │
│  │ AuthService.register()            │  │
│  │ 1. Validate email format          │  │
│  │ 2. Check password strength        │  │
│  │ 3. Check email uniqueness         │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ 4. Check if user exists
               ▼
┌─────────────────────────────────────────┐
│       MongoDB (Users Collection)        │
│  ┌───────────────────────────────────┐  │
│  │ db.users.findOne({email})         │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ 5. User not found (OK)
               ▼
┌─────────────────────────────────────────┐
│      Backend (FastAPI)                  │
│  ┌───────────────────────────────────┐  │
│  │ 1. Hash password (bcrypt)         │  │
│  │ 2. Generate OTP (6 digits)        │  │
│  │ 3. Set OTP expiry (10 min)        │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               ├─────────────────────────────┐
               │                             │
               │ 6. Save user                │ 7. Send OTP email
               ▼                             ▼
┌────────────────────────────┐  ┌────────────────────────────┐
│  MongoDB                   │  │  Email Service (AWS SES)   │
│  ┌──────────────────────┐  │  │  ┌──────────────────────┐  │
│  │ db.users.insertOne() │  │  │  │ Send OTP to email    │  │
│  │ - email              │  │  │  │ Template: OTP_VERIFY │  │
│  │ - password_hash      │  │  │  └──────────────────────┘  │
│  │ - otp_code (hashed)  │  │  └────────────────────────────┘
│  │ - otp_expiry         │  │
│  │ - verified: false    │  │
│  └──────────────────────┘  │
└────────────────────────────┘
               │
               │ 8. Return success
               ▼
┌─────────────────────────────────────────┐
│   Frontend (Next.js)                    │
│  ┌───────────────────────────────────┐  │
│  │ Redirect to /auth/verify-otp      │  │
│  │ Show OTP input form               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
               │
               │ 9. User enters OTP
               ▼
┌─────────────────────────────────────────┐
│      Backend (FastAPI)                  │
│  ┌───────────────────────────────────┐  │
│  │ AuthService.verify_otp()          │  │
│  │ 1. Constant-time comparison       │  │
│  │ 2. Check expiry                   │  │
│  │ 3. Mark user as verified          │  │
│  │ 4. Generate JWT tokens            │  │
│  │    - Access token (15 min)        │  │
│  │    - Refresh token (7 days)       │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ 10. Store session
               ▼
┌─────────────────────────────────────────┐
│       Redis (Session Store)             │
│  ┌───────────────────────────────────┐  │
│  │ SET session:{user_id}             │  │
│  │   {                               │  │
│  │     refresh_token,                │  │
│  │     created_at,                   │  │
│  │     user_agent,                   │  │
│  │     ip_address                    │  │
│  │   }                               │  │
│  │ EXPIRE 7 days                     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
               │
               │ 11. Return tokens
               ▼
┌─────────────────────────────────────────┐
│   Frontend (Next.js)                    │
│  ┌───────────────────────────────────┐  │
│  │ 1. Store access token (memory)    │  │
│  │ 2. Store refresh token (httpOnly  │  │
│  │    cookie)                        │  │
│  │ 3. Redirect to /dashboard         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Token Refresh Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Access token expired (15 min)
     ▼
┌─────────────────────────────────────────┐
│   Frontend (Next.js)                    │
│  ┌───────────────────────────────────┐  │
│  │ API Request interceptor           │  │
│  │ - Detects 401 Unauthorized        │  │
│  │ - Triggers token refresh          │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ POST /api/v1/auth/refresh
               │ Cookie: refresh_token
               ▼
┌─────────────────────────────────────────┐
│      Backend (FastAPI)                  │
│  ┌───────────────────────────────────┐  │
│  │ 1. Validate refresh token         │  │
│  │ 2. Check if token blacklisted     │  │
│  │ 3. Verify user still exists       │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ Check session
               ▼
┌─────────────────────────────────────────┐
│       Redis (Session Store)             │
│  ┌───────────────────────────────────┐  │
│  │ GET session:{user_id}             │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ Session valid
               ▼
┌─────────────────────────────────────────┐
│      Backend (FastAPI)                  │
│  ┌───────────────────────────────────┐  │
│  │ 1. Generate new access token      │  │
│  │ 2. Rotate refresh token           │  │
│  │ 3. Blacklist old refresh token    │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ Return new tokens
               ▼
┌─────────────────────────────────────────┐
│   Frontend (Next.js)                    │
│  ┌───────────────────────────────────┐  │
│  │ 1. Update access token            │  │
│  │ 2. Retry original request         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🔨 WORKFLOW CREATION FLOW

### Visual Builder Interaction

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Opens Workflow Builder
     ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - Workflow Builder Canvas              │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ReactFlow Canvas                                  │  │
│  │                                                   │  │
│  │  ┌──────────┐      ┌──────────┐      ┌────────┐  │  │
│  │  │ Trigger  │─────▶│  Action  │─────▶│ Action │  │  │
│  │  │  Node    │      │   Node   │      │  Node  │  │  │
│  │  └──────────┘      └──────────┘      └────────┘  │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────┘
         │
         │ 2. User adds nodes via drag-drop
         │    - Select from node palette
         │    - Connect nodes with edges
         │    - Configure each node
         ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - State Management (Zustand)           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ workflowStore                                     │  │
│  │ {                                                 │  │
│  │   nodes: [...],                                   │  │
│  │   edges: [...],                                   │  │
│  │   isDirty: true,                                  │  │
│  │   validationErrors: []                            │  │
│  │ }                                                 │  │
│  └───────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────┘
         │
         │ 3. Client-side validation
         │    - Check for cycles
         │    - Validate connections
         │    - Check required fields
         ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - Validation Layer                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ validateWorkflow()                                │  │
│  │ ✓ No cycles detected                             │  │
│  │ ✓ All nodes configured                           │  │
│  │ ✓ Valid connections                              │  │
│  │ ✓ Required fields filled                         │  │
│  └───────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────┘
         │
         │ 4. User clicks "Save Workflow"
         │    POST /api/v1/workflows
         ▼
┌─────────────────────────────────────────────────────────┐
│         Backend - Workflow Service                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ WorkflowService.create_workflow()                 │  │
│  │                                                   │  │
│  │ 1. Validate schema (Pydantic)                    │  │
│  │ 2. Check user permissions                        │  │
│  │ 3. Build DAG representation                      │  │
│  │ 4. Perform topological sort                      │  │
│  │ 5. Validate node configurations                  │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 5. Construct workflow object
               ▼
┌─────────────────────────────────────────────────────────┐
│         Backend - DAG Builder                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ build_dag()                                       │  │
│  │                                                   │  │
│  │ Graph Structure:                                 │  │
│  │   node_1 → [node_2, node_3]                      │  │
│  │   node_2 → [node_4]                              │  │
│  │   node_3 → [node_4]                              │  │
│  │   node_4 → []                                    │  │
│  │                                                   │  │
│  │ Execution Order: [node_1, node_2, node_3, node_4]│  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 6. Save to database
               ▼
┌─────────────────────────────────────────────────────────┐
│         MongoDB - Workflows Collection                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ db.workflows.insertOne({                          │  │
│  │   _id: ObjectId(),                                │  │
│  │   user_id: "...",                                 │  │
│  │   name: "Email Automation",                       │  │
│  │   description: "...",                             │  │
│  │   nodes: [...],                                   │  │
│  │   edges: [...],                                   │  │
│  │   dag: {...},                                     │  │
│  │   status: "draft",                                │  │
│  │   created_at: ISODate(),                          │  │
│  │   updated_at: ISODate(),                          │  │
│  │   version: 1                                      │  │
│  │ })                                                │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               ├─────────────────────────────────────┐
               │                                     │
               │ 7. Emit event                       │ 8. Audit log
               ▼                                     ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  RabbitMQ - Event Bus       │  │  MongoDB - Audit Logs       │
│  ┌───────────────────────┐  │  │  ┌───────────────────────┐  │
│  │ workflow.created      │  │  │  │ {                     │  │
│  │ {                     │  │  │  │   event: "CREATE",    │  │
│  │   workflow_id,        │  │  │  │   resource: "workflow"│  │
│  │   user_id,            │  │  │  │   user_id,            │  │
│  │   timestamp           │  │  │  │   timestamp,          │  │
│  │ }                     │  │  │  │   ip_address          │  │
│  └───────────────────────┘  │  │  │ }                     │  │
└─────────────────────────────┘  │  └───────────────────────┘  │
                                 └─────────────────────────────┘
               │
               │ 9. Return workflow
               ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - Update UI                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. Update workflow list                           │  │
│  │ 2. Show success notification                      │  │
│  │ 3. Mark workflow as saved (isDirty = false)       │  │
│  │ 4. Enable "Publish" button                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ WORKFLOW EXECUTION FLOW

### Distributed Execution with Temporal.io

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Clicks "Run Workflow"
     ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend                                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ POST /api/v1/workflows/{id}/execute               │  │
│  │ { input_data: {...} }                             │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│         Backend - API Layer                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. Authenticate user (JWT)                        │  │
│  │ 2. Check workflow ownership                       │  │
│  │ 3. Validate input data                            │  │
│  │ 4. Check rate limits (30/min)                     │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 2. Load workflow
               ▼
┌─────────────────────────────────────────────────────────┐
│         MongoDB                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ db.workflows.findOne({ _id, user_id })            │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 3. Create execution record
               ▼
┌─────────────────────────────────────────────────────────┐
│         MongoDB - Executions Collection                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │ execution = {                                     │  │
│  │   _id: ObjectId(),                                │  │
│  │   workflow_id: "...",                             │  │
│  │   workflow_snapshot: {...},  // Immutable copy   │  │
│  │   status: "pending",                              │  │
│  │   input_data: {...},                              │  │
│  │   started_at: ISODate(),                          │  │
│  │   node_results: {}                                │  │
│  │ }                                                 │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 4. Start Temporal workflow
               ▼
┌─────────────────────────────────────────────────────────┐
│         Temporal.io - Workflow Engine                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ client.start_workflow(                            │  │
│  │   workflow_id=execution._id,                      │  │
│  │   task_queue="workflow-execution",                │  │
│  │   input=execution                                 │  │
│  │ )                                                 │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 5. Workflow scheduled
               ▼
┌─────────────────────────────────────────────────────────┐
│         Temporal Worker - Orchestrator                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ @workflow.run                                     │  │
│  │ async def execute_workflow(execution):            │  │
│  │                                                   │  │
│  │   # Get execution order from DAG                 │  │
│  │   execution_order = topological_sort(dag)        │  │
│  │   # [node_1, node_2, node_3, node_4]             │  │
│  │                                                   │  │
│  │   for node_id in execution_order:                │  │
│  │     # Schedule activity for this node            │  │
│  │     result = await workflow.execute_activity(    │  │
│  │       execute_node,                              │  │
│  │       args=[node_id, node_config, context],      │  │
│  │       start_to_close_timeout=timedelta(min=5),   │  │
│  │       retry_policy=RetryPolicy(max_attempts=3)   │  │
│  │     )                                            │  │
│  │                                                   │  │
│  │     # Store result for dependent nodes           │  │
│  │     context[node_id] = result                    │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 6. Execute each node as activity
               ▼
┌─────────────────────────────────────────────────────────┐
│         Temporal Worker - Activity Worker               │
│  ┌───────────────────────────────────────────────────┐  │
│  │ @activity.defn                                    │  │
│  │ async def execute_node(node_id, config, context): │  │
│  │                                                   │  │
│  │   # Update execution status                      │  │
│  │   await update_node_status(node_id, "running")   │  │
│  │                                                   │  │
│  │   # Route to appropriate executor                │  │
│  │   if node.type == "email":                       │  │
│  │     result = await EmailNodeExecutor.run()       │  │
│  │   elif node.type == "webhook":                   │  │
│  │     result = await WebhookExecutor.run()         │  │
│  │   elif node.type == "ai":                        │  │
│  │     result = await AINodeExecutor.run()          │  │
│  │                                                   │  │
│  │   # Store result                                 │  │
│  │   await update_node_result(node_id, result)      │  │
│  │                                                   │  │
│  │   return result                                  │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 7. Execute node logic
               │    (Example: Email Node)
               ▼
┌─────────────────────────────────────────────────────────┐
│         Email Node Executor                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. Resolve variables from context                │  │
│  │    to_email = resolve(config.to, context)        │  │
│  │    subject = resolve(config.subject, context)    │  │
│  │    body = resolve(config.body, context)          │  │
│  │                                                   │  │
│  │ 2. Validate email addresses                      │  │
│  │ 3. Render template                               │  │
│  │ 4. Send via AWS SES                              │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 8. Send email
               ▼
┌─────────────────────────────────────────────────────────┐
│         AWS SES                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ses.send_email(                                   │  │
│  │   from: "noreply@chasmx.com",                     │  │
│  │   to: resolved_email,                             │  │
│  │   subject: resolved_subject,                      │  │
│  │   body: resolved_body                             │  │
│  │ )                                                 │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 9. Return message_id
               ▼
┌─────────────────────────────────────────────────────────┐
│         Temporal Worker - Update State                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Store node result in MongoDB                      │  │
│  │ {                                                 │  │
│  │   node_id: "email_1",                             │  │
│  │   status: "completed",                            │  │
│  │   output: {                                       │  │
│  │     message_id: "...",                            │  │
│  │     sent_at: "..."                                │  │
│  │   },                                              │  │
│  │   duration_ms: 245                                │  │
│  │ }                                                 │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 10. Emit real-time update
               ▼
┌─────────────────────────────────────────────────────────┐
│         Redis Pub/Sub                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ PUBLISH execution:{execution_id}                  │  │
│  │ {                                                 │  │
│  │   type: "node_completed",                         │  │
│  │   node_id: "email_1",                             │  │
│  │   status: "completed"                             │  │
│  │ }                                                 │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 11. WebSocket push to client
               ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - Real-time Updates                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │ WebSocket message received:                       │  │
│  │                                                   │  │
│  │ Update UI:                                        │  │
│  │   ┌──────────┐                                    │  │
│  │   │ Email    │ ✓ Completed                        │  │
│  │   │  Node    │   Duration: 245ms                  │  │
│  │   └──────────┘                                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
               │
               │ 12. Continue with next nodes...
               │     Repeat steps 6-11 for each node
               │
               │ 13. All nodes completed
               ▼
┌─────────────────────────────────────────────────────────┐
│         Temporal Workflow - Completion                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ # All activities completed                        │  │
│  │ # Update execution status                         │  │
│  │ await update_execution(                           │  │
│  │   execution_id,                                   │  │
│  │   status="completed",                             │  │
│  │   completed_at=datetime.utcnow(),                 │  │
│  │   duration_ms=total_duration                      │  │
│  │ )                                                 │  │
│  │                                                   │  │
│  │ # Emit completion event                           │  │
│  │ emit_event("execution.completed")                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 AI-POWERED WORKFLOW GENERATION

### Natural Language to Workflow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ "Create a workflow that sends a welcome
     │  email when a new user signs up"
     ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - AI Generator UI                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Prompt input field                                │  │
│  │ POST /api/v1/ai/generate-workflow                 │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│         Backend - AI Service                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. Rate limit check (10/min)                      │  │
│  │ 2. Input sanitization                             │  │
│  │ 3. Check LLM cache (semantic similarity)          │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ Cache miss
               ▼
┌─────────────────────────────────────────────────────────┐
│         AI Service - Prompt Engineering                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │ System Prompt:                                    │  │
│  │ "You are an expert workflow automation engineer. │  │
│  │  Convert natural language into workflow JSON."   │  │
│  │                                                   │  │
│  │ User Prompt: {user_input}                         │  │
│  │                                                   │  │
│  │ Available Nodes:                                  │  │
│  │ - trigger (webhook, schedule, email)              │  │
│  │ - action (email, http, database)                  │  │
│  │ - condition (if/else)                             │  │
│  │ - transformer (data manipulation)                 │  │
│  │                                                   │  │
│  │ Output Format: JSON workflow schema               │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ Call LLM
               ▼
┌─────────────────────────────────────────────────────────┐
│         LLM Provider (OpenRouter)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Model: anthropic/claude-3.5-sonnet                │  │
│  │ Temperature: 0.2 (more deterministic)             │  │
│  │ Max tokens: 4000                                  │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ LLM Response
               ▼
┌─────────────────────────────────────────────────────────┐
│         AI Service - Response Processing                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Generated Workflow:                               │  │
│  │ {                                                 │  │
│  │   "name": "Welcome Email Workflow",               │  │
│  │   "nodes": [                                      │  │
│  │     {                                             │  │
│  │       "id": "trigger_1",                          │  │
│  │       "type": "webhook",                          │  │
│  │       "config": {                                 │  │
│  │         "path": "/webhooks/user-signup"           │  │
│  │       }                                           │  │
│  │     },                                            │  │
│  │     {                                             │  │
│  │       "id": "email_1",                            │  │
│  │       "type": "email",                            │  │
│  │       "config": {                                 │  │
│  │         "to": "{{trigger.email}}",                │  │
│  │         "subject": "Welcome to ChasmX!",          │  │
│  │         "template": "welcome_email"               │  │
│  │       }                                           │  │
│  │     }                                             │  │
│  │   ],                                              │  │
│  │   "edges": [                                      │  │
│  │     {"from": "trigger_1", "to": "email_1"}        │  │
│  │   ]                                               │  │
│  │ }                                                 │  │
│  │                                                   │  │
│  │ 1. Validate JSON structure                        │  │
│  │ 2. Validate against workflow schema               │  │
│  │ 3. Check for security issues                      │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ Cache result
               ▼
┌─────────────────────────────────────────────────────────┐
│         Redis - LLM Cache                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Key: hash(prompt + model)                         │  │
│  │ Value: {workflow_json, confidence_score}          │  │
│  │ TTL: 7 days                                       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
               │
               │ Return to frontend
               ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - Preview & Edit                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Show generated workflow in builder                │  │
│  │ User can:                                         │  │
│  │ - Review generated workflow                       │  │
│  │ - Edit nodes/connections                          │  │
│  │ - Accept and save                                 │  │
│  │ - Regenerate with different prompt                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 REAL-TIME UPDATES FLOW

### WebSocket Architecture

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Navigate to workflow execution page
     ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - WebSocket Client                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ socket = io("wss://api.chasmx.com", {             │  │
│  │   auth: { token: jwt_token },                     │  │
│  │   transports: ["websocket"]                       │  │
│  │ })                                                │  │
│  │                                                   │  │
│  │ socket.emit("subscribe", {                        │  │
│  │   channel: "execution:{execution_id}"             │  │
│  │ })                                                │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 2. WebSocket connection
               ▼
┌─────────────────────────────────────────────────────────┐
│         Backend - WebSocket Server (Socket.IO)          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ @socketio.on("connect")                           │  │
│  │ async def handle_connect(auth):                   │  │
│  │   # Validate JWT token                            │  │
│  │   user = verify_token(auth["token"])              │  │
│  │   # Store connection                              │  │
│  │   connections[user.id] = request.sid              │  │
│  │                                                   │  │
│  │ @socketio.on("subscribe")                         │  │
│  │ async def handle_subscribe(data):                 │  │
│  │   channel = data["channel"]                       │  │
│  │   # Check permissions                             │  │
│  │   if can_access(user, channel):                   │  │
│  │     join_room(channel)                            │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 3. Subscribe to Redis Pub/Sub
               ▼
┌─────────────────────────────────────────────────────────┐
│         Redis Pub/Sub - Channel Subscription            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ SUBSCRIBE execution:{execution_id}                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
               │
               │ 4. Workflow execution updates published
               │    (from Temporal workers)
               ▼
┌─────────────────────────────────────────────────────────┐
│         Redis Pub/Sub - Message                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ PUBLISH execution:abc123 {                        │  │
│  │   "type": "node_completed",                       │  │
│  │   "node_id": "email_1",                           │  │
│  │   "status": "completed",                          │  │
│  │   "timestamp": "2025-10-22T10:30:00Z"             │  │
│  │ }                                                 │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 5. Backend receives message
               ▼
┌─────────────────────────────────────────────────────────┐
│         Backend - Redis Subscriber                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ @redis.on_message                                 │  │
│  │ async def handle_redis_message(channel, message): │  │
│  │   # Parse message                                 │  │
│  │   data = json.loads(message)                      │  │
│  │                                                   │  │
│  │   # Emit to WebSocket room                        │  │
│  │   await socketio.emit(                            │  │
│  │     "update",                                     │  │
│  │     data,                                         │  │
│  │     room=channel                                  │  │
│  │   )                                               │  │
│  └───────────┬───────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────┘
               │
               │ 6. Push to connected clients
               ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend - Handle Update                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ socket.on("update", (data) => {                   │  │
│  │   if (data.type === "node_completed") {           │  │
│  │     // Update node visual status                  │  │
│  │     updateNode(data.node_id, {                    │  │
│  │       status: "completed",                        │  │
│  │       timestamp: data.timestamp                   │  │
│  │     })                                            │  │
│  │                                                   │  │
│  │     // Show animation                             │  │
│  │     animateNodeCompletion(data.node_id)           │  │
│  │                                                   │  │
│  │     // Update execution log                       │  │
│  │     addLogEntry(data)                             │  │
│  │   }                                               │  │
│  │ })                                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ ERROR HANDLING & RECOVERY

### Automatic Retry Logic

```
┌──────────────────────────────────────────────┐
│  Temporal Activity - Node Execution          │
│  ┌────────────────────────────────────────┐  │
│  │ @activity.defn                         │  │
│  │ async def execute_node():              │  │
│  │   # Attempt execution                  │  │
│  │   result = await node.execute()        │  │
│  └────────────┬───────────────────────────┘  │
└───────────────┼──────────────────────────────┘
                │
                │ Execution fails
                ▼
┌──────────────────────────────────────────────┐
│  Error: NetworkError                         │
│  "Failed to connect to webhook endpoint"     │
└────────────┬─────────────────────────────────┘
             │
             │ Temporal handles retry
             ▼
┌──────────────────────────────────────────────┐
│  Retry Policy                                │
│  ┌────────────────────────────────────────┐  │
│  │ initial_interval: 1s                   │  │
│  │ backoff_coefficient: 2.0               │  │
│  │ maximum_interval: 60s                  │  │
│  │ maximum_attempts: 5                    │  │
│  │ non_retryable_errors: [               │  │
│  │   "ValidationError",                   │  │
│  │   "PermissionDenied"                   │  │
│  │ ]                                      │  │
│  └────────────┬───────────────────────────┘  │
└───────────────┼──────────────────────────────┘
                │
                │ Retry Schedule:
                │ Attempt 1: Immediate (failed)
                │ Attempt 2: Wait 1s
                │ Attempt 3: Wait 2s
                │ Attempt 4: Wait 4s
                │ Attempt 5: Wait 8s
                │ Attempt 6: Failed (max attempts)
                ▼
┌──────────────────────────────────────────────┐
│  Error Handler                               │
│  ┌────────────────────────────────────────┐  │
│  │ 1. Log error details                   │  │
│  │ 2. Update execution status to "failed" │  │
│  │ 3. Send notification to user           │  │
│  │ 4. Trigger compensating transactions   │  │
│  │    (rollback previous actions)         │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Compensating Transactions (Saga Pattern)

```
Workflow: Send Email → Charge Payment → Update Database

Success Path:
  Node 1: Send Email ✓
  Node 2: Charge Payment ✓
  Node 3: Update Database ✓

Failure Path (Payment fails):
  Node 1: Send Email ✓
  Node 2: Charge Payment ✗

Compensation:
  Compensate Node 1: Send "Error Notification" email
  Mark execution as failed
  Log incident
```

---

## 📈 SCALING & LOAD BALANCING

### Auto-Scaling Strategy

```
┌─────────────────────────────────────────────────────┐
│  Monitoring - Prometheus                            │
│  ┌───────────────────────────────────────────────┐  │
│  │ Metrics Collection:                           │  │
│  │ - CPU: 75% (high)                             │  │
│  │ - Memory: 60%                                 │  │
│  │ - Request Queue: 100 requests                 │  │
│  │ - Response Time: 800ms (p95)                  │  │
│  └───────────┬───────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────┘
               │
               │ Trigger scaling rule
               ▼
┌─────────────────────────────────────────────────────┐
│  Kubernetes HPA (Horizontal Pod Autoscaler)         │
│  ┌───────────────────────────────────────────────┐  │
│  │ Rules:                                        │  │
│  │ - Scale up if CPU > 70%                       │  │
│  │ - Scale up if request queue > 50              │  │
│  │ - Scale up if p95 latency > 500ms             │  │
│  │                                               │  │
│  │ Decision: Scale from 3 to 6 pods              │  │
│  └───────────┬───────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────┘
               │
               │ Create new pods
               ▼
┌─────────────────────────────────────────────────────┐
│  Kubernetes Cluster                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ Before:                                       │  │
│  │ [Pod 1] [Pod 2] [Pod 3]                       │  │
│  │                                               │  │
│  │ After:                                        │  │
│  │ [Pod 1] [Pod 2] [Pod 3]                       │  │
│  │ [Pod 4] [Pod 5] [Pod 6]                       │  │
│  └───────────┬───────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────┘
               │
               │ Update load balancer
               ▼
┌─────────────────────────────────────────────────────┐
│  Load Balancer (Kong)                               │
│  ┌───────────────────────────────────────────────┐  │
│  │ Distribute traffic across 6 pods:             │  │
│  │ - Round-robin algorithm                       │  │
│  │ - Health check before routing                 │  │
│  │ - Sticky sessions for WebSocket               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 💳 PAYMENT & BILLING FLOW

### Subscription Management

```
User selects "Pro Plan" ($49/month)

┌──────────────────────────────────────┐
│  Frontend - Pricing Page             │
│  User clicks "Subscribe to Pro"      │
└────────┬─────────────────────────────┘
         │
         │ POST /api/v1/billing/subscribe
         ▼
┌──────────────────────────────────────┐
│  Backend - Billing Service           │
│  1. Create Stripe checkout session   │
│  2. Return checkout URL               │
└────────┬─────────────────────────────┘
         │
         │ Redirect to Stripe
         ▼
┌──────────────────────────────────────┐
│  Stripe Checkout Page                │
│  User enters payment details          │
│  Completes payment                    │
└────────┬─────────────────────────────┘
         │
         │ Webhook: checkout.session.completed
         ▼
┌──────────────────────────────────────┐
│  Backend - Webhook Handler           │
│  1. Verify webhook signature          │
│  2. Extract session data              │
│  3. Update user subscription          │
└────────┬─────────────────────────────┘
         │
         │ Update database
         ▼
┌──────────────────────────────────────┐
│  PostgreSQL - Subscriptions          │
│  {                                    │
│    user_id: "...",                    │
│    plan: "pro",                       │
│    status: "active",                  │
│    stripe_subscription_id: "...",     │
│    current_period_end: "2025-11-22"   │
│  }                                    │
└────────┬─────────────────────────────┘
         │
         │ Grant permissions
         ▼
┌──────────────────────────────────────┐
│  User Model Update                   │
│  permissions: [                       │
│    "unlimited_workflows",             │
│    "ai_generation",                   │
│    "priority_support"                 │
│  ]                                    │
└────────┬─────────────────────────────┘
         │
         │ Send confirmation email
         ▼
┌──────────────────────────────────────┐
│  Email Service                       │
│  "Welcome to Pro! Your subscription  │
│   is now active."                    │
└──────────────────────────────────────┘
```

---

## 🔔 MONITORING & ALERTING FLOW

### Alert Pipeline

```
┌──────────────────────────────────────┐
│  Application - Error Occurs          │
│  Error Rate: 5% (threshold: 1%)      │
└────────┬─────────────────────────────┘
         │
         │ Metrics exported
         ▼
┌──────────────────────────────────────┐
│  Prometheus - Metrics Collection     │
│  Query: rate(errors[5m]) > 0.01      │
│  Result: True (alert condition met)  │
└────────┬─────────────────────────────┘
         │
         │ Trigger alert
         ▼
┌──────────────────────────────────────┐
│  Alertmanager - Alert Routing        │
│  Severity: Critical                  │
│  Route to: PagerDuty, Slack          │
└────────┬─────────────────────────────┘
         │
         ├────────────────┬─────────────┐
         │                │             │
         ▼                ▼             ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PagerDuty  │  │    Slack    │  │    Email    │
│  Page       │  │  #incidents │  │  On-call    │
│  On-call    │  │   channel   │  │   team      │
│  Engineer   │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

**This document provides complete flow diagrams for all major system interactions in ChasmX, ensuring clarity for implementation and troubleshooting.**
