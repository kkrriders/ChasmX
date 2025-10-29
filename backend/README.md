# ChasmX Backend

AI-powered workflow automation platform with LLM integration, Redis caching, and MongoDB persistence.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Docker (for Redis)
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set up environment
cp .env.template .env
# Edit .env with your credentials

# 3. Start Redis
docker run -d -p 6379:6379 --name redis redis:latest

# 4. Run the server
uvicorn app.main:app --reload
```

Server runs at: http://localhost:8000

## 📁 Project Structure

```
backend/
├── app/
│   ├── auth/              # Authentication & JWT
│   ├── core/              # Core configurations
│   ├── crud/              # Database CRUD operations
│   ├── models/            # Database models (Beanie/MongoDB)
│   ├── routes/            # API endpoints
│   │   ├── ai.py          # AI & LLM endpoints
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── users.py       # User management
│   │   └── workflow.py    # Workflow CRUD & execution
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic services
│   │   ├── agents/        # Agent orchestration
│   │   ├── cache/         # Redis cache
│   │   ├── llm/           # LLM providers
│   │   ├── ai_service_manager.py
│   │   └── workflow_executor.py  # Workflow execution engine
│   ├── utils/             # Utility functions
│   └── main.py            # FastAPI application
├── tests/                 # Test suite
├── scripts/               # Utility scripts
├── docs/                  # Documentation
├── requirements.txt       # Python dependencies
├── .env.template          # Environment template
└── README.md             # This file
```

## 🔧 Key Features

### ✅ Authentication System
- JWT-based authentication
- Email/password registration
- OTP verification
- Role-based access control (RBAC)

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - OTP verification

### ✅ AI & LLM Integration
- OpenRouter API integration
- 4 specialized models (communication, reasoning, code, structured)
- Redis-cached responses (20-50x faster on repeated queries)
- Agent orchestration system

**Endpoints:**
- `POST /ai/chat` - Chat completion
- `GET /ai/models` - List available models
- `POST /ai/agents/register` - Register AI agent
- `POST /ai/tasks` - Create agent task

### ✅ Workflow System
- Visual workflow builder support
- 9+ node types (AI, Email, Webhook, Data Source, etc.)
- Workflow execution engine
- Real-time execution tracking
- Execution history & logs

**Endpoints:**
- `POST /workflows/` - Create workflow
- `GET /workflows/` - List workflows
- `GET /workflows/{id}` - Get workflow details
- `PUT /workflows/{id}` - Update workflow
- `DELETE /workflows/{id}` - Delete workflow
- `POST /workflows/{id}/execute` - Execute workflow
- `GET /workflows/executions/{id}` - Get execution status

### ✅ Workflow Execution Engine
Executes workflows node-by-node with:
- Sequential execution with topological sorting
- Redis caching for AI nodes
- Variable interpolation (`{{variable_name}}`)
- Error handling & retry logic
- Comprehensive logging

**Supported Node Types:**
1. **start** - Entry point
2. **ai-processor** - LLM processing (cached)
3. **email** - Send emails
4. **webhook** - HTTP requests
5. **data-source** - Database/API queries
6. **filter** - Conditional filtering
7. **transformer** - Data transformation
8. **condition** - Branching logic
9. **delay** - Wait/pause
10. **end** - Exit point

## 🗄️ Data Storage

### MongoDB Collections
- `users` - User accounts
- `workflows` - Workflow definitions
- `workflow_runs` - Execution history

### Redis Keys
- `llm:cache:{hash}` - LLM response cache (TTL: 1 hour)
- `agent:context:{agent_id}` - Agent memory
- `workflow:run:{execution_id}` - Execution state

## 🧪 Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_workflows.py

# Run with coverage
pytest --cov=app tests/

# Run workflow execution test
python tests/test_workflow_execution.py
```

## 📚 Documentation

Detailed documentation available in `/docs`:

- [AI System Overview](docs/AI_SYSTEM_README.md)
- [AI System Architecture](docs/AI_SYSTEM_STRUCTURE.md)
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)
- [Quick Reference](docs/QUICK_REFERENCE.md)
- [Workflow Execution Guide](docs/WORKFLOW_EXECUTION_GUIDE.md)

## 🔐 Environment Variables

Required environment variables (see `.env.template`):

```bash
# Database
MONGODB_URL=mongodb+srv://...
DATABASE_NAME=chasm_db

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OTP
OTP_SECRET_KEY=your-otp-secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# AI Services
OPENROUTER_API_KEY=your-api-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t chasmx-backend .

# Run container
docker run -p 8000:8000 \
  --env-file .env \
  chasmx-backend
```

Or use Docker Compose (from project root):
```bash
docker-compose up
```

## 📊 API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🛠️ Development

### Running Locally
```bash
# Development mode with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Code Quality
```bash
# Format code
black app/

# Lint
flake8 app/

# Type checking
mypy app/
```

## 🔄 Workflow Execution Example

```python
import httpx

# Create a workflow
workflow = {
    "name": "AI Email Generator",
    "nodes": [
        {"id": "start", "type": "start", "config": {}},
        {
            "id": "ai1",
            "type": "ai-processor",
            "config": {
                "prompt": "Generate a welcome email for {{user_name}}",
                "model": "google/gemini-2.0-flash-exp:free"
            }
        },
        {
            "id": "email1",
            "type": "email",
            "config": {
                "to": "{{email}}",
                "subject": "Welcome!",
                "body": "{{outputs.ai1}}"
            }
        },
        {"id": "end", "type": "end", "config": {}}
    ],
    "edges": [
        {"from": "start", "to": "ai1"},
        {"from": "ai1", "to": "email1"},
        {"from": "email1", "to": "end"}
    ],
    "status": "active"
}

# Execute workflow
response = httpx.post(
    "http://localhost:8000/workflows/{workflow_id}/execute",
    json={
        "inputs": {"user_name": "Alice", "email": "alice@example.com"},
        "async_execution": False
    }
)

print(response.json())
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## 📝 License

MIT License

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: See `/docs` folder

---

**Built with:** FastAPI, MongoDB, Redis, OpenRouter, Beanie ODM
