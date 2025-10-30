# ChasmX

AI-powered workflow automation platform with visual workflow builder, LLM integration, and intelligent caching.

## 🎯 Overview

ChasmX is a modern workflow automation platform that allows users to:
- Build workflows visually with drag-and-drop interface
- Integrate AI/LLM processing with Redis caching (20-50x faster!)
- Execute workflows with real-time tracking
- Manage users with role-based access control
- Generate workflows from natural language (coming soon)

## 🏗️ Architecture

- **Backend**: FastAPI + MongoDB + Redis + OpenRouter LLM
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + ReactFlow
- **Database**: MongoDB Atlas (workflows, users, execution history)
- **Cache**: Redis (LLM responses, agent context)
- **Authentication**: JWT + OTP via email

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (for Redis)
- MongoDB Atlas account

### 1. Start Redis
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### 2. Backend Setup
```bash
cd apps/backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run server
uvicorn src.main:app --reload
```
→ Backend runs at http://localhost:8000

### 3. Frontend Setup
```bash
cd apps/web

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit with backend URL

# Run development server
npm run dev
```
→ Frontend runs at http://localhost:3000

## ✨ Key Features

### 🤖 AI Integration
- **OpenRouter LLM** - Multiple AI models (Gemini, Llama, Qwen)
- **Redis Caching** - 20-50x faster on repeated queries
- **Agent System** - Multi-agent orchestration
- **Smart Caching** - Automatic LLM response caching

### 🔄 Workflow Engine
- **Visual Builder** - Drag-and-drop workflow creation
- **9+ Node Types** - AI, Email, Webhook, Data Source, Filter, etc.
- **Execution Engine** - Sequential node execution with logging
- **Variable System** - Dynamic data flow between nodes
- **History Tracking** - Complete execution logs and history

### 🔐 Authentication
- **JWT Tokens** - Secure authentication
- **OTP Verification** - Email-based verification
- **RBAC** - Role-based access control

## 📚 Documentation

- [Backend Documentation](apps/backend/README.md)
- [Frontend Documentation](apps/web/README.md)
- [Architecture Documentation](docs/architecture/)
- [Development Guides](docs/development/)
- [API Documentation](docs/api/)

## 🔧 API Endpoints

### Authentication
```
POST /auth/register      - Register user
POST /auth/login         - Login user
POST /auth/verify-otp    - Verify OTP
```

### Workflows
```
GET    /workflows/              - List workflows
POST   /workflows/              - Create workflow
POST   /workflows/{id}/execute  - Execute workflow
GET    /workflows/executions/{id} - Get execution status
```

### AI
```
POST /ai/chat         - Chat completion
GET  /ai/models       - List models
POST /ai/tasks        - Create task
```

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
pytest

# Frontend tests
cd apps/web
npm run test
```

## 🐳 Docker Deployment

```bash
# Start all services (from config directory)
cd config
docker-compose up

# Or from root with -f flag
docker-compose -f config/docker-compose.yml up

# Services:
# - Redis: localhost:6379
# - Backend: localhost:8000
# - Frontend: localhost:3000
```

## 📊 Project Structure

```
ChasmX/
├── apps/                     # Application code (monorepo)
│   ├── backend/             # FastAPI backend
│   │   ├── src/            # Source code
│   │   │   ├── core/       # Core configuration
│   │   │   ├── routes/     # API routes
│   │   │   ├── services/   # Business logic
│   │   │   ├── models/     # Database models
│   │   │   ├── schemas/    # Pydantic schemas
│   │   │   └── main.py     # Entry point
│   │   ├── tests/          # Test suite
│   │   └── requirements.txt
│   └── web/                # Next.js frontend
│       ├── src/            # Source code
│       │   ├── app/        # Next.js app router
│       │   ├── components/ # React components
│       │   ├── hooks/      # Custom hooks
│       │   ├── lib/        # Utilities
│       │   └── types/      # TypeScript types
│       ├── public/         # Static assets
│       └── package.json
├── docs/                    # Documentation
│   ├── architecture/       # System architecture
│   ├── api/               # API documentation
│   ├── development/       # Development guides
│   └── planning/          # Project planning
├── config/                 # Configuration files
│   └── docker-compose.yml
├── tools/                  # Development tools
└── README.md              # This file
```

## 🛣️ Roadmap

**Completed** ✅
- Authentication (JWT + OTP)
- Workflow CRUD
- Visual workflow builder
- Workflow execution engine
- AI/LLM integration with caching
- Agent orchestration

**In Progress** 🚧
- AI workflow generation
- Frontend-backend integration
- Real-time updates

**Planned** 📋
- Workflow templates
- Workflow scheduling
- Analytics dashboard
- Collaboration features

## 📝 License

MIT License

---

**Built with ❤️ using FastAPI, Next.js, MongoDB, and Redis**