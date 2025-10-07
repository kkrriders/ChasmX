# ChasmX - Project Structure

Complete overview of the organized project structure.

## 📁 Directory Layout

```
ChasmX/
├── README.md                          # Main project documentation
├── PROJECT_STRUCTURE.md               # This file
├── docker-compose.yml                 # (Future) Docker orchestration
│
├── backend/                           # Backend application
│   ├── app/                          # Main application code
│   │   ├── auth/                     # Authentication logic
│   │   ├── core/                     # Core configs (database, settings)
│   │   ├── crud/                     # CRUD operations
│   │   ├── models/                   # Database models (Beanie/MongoDB)
│   │   ├── routes/                   # API endpoints
│   │   │   ├── ai.py                # AI & LLM endpoints
│   │   │   ├── auth.py              # Authentication
│   │   │   ├── users.py             # User management
│   │   │   └── workflow.py          # Workflow CRUD & execution
│   │   ├── schemas/                  # Pydantic schemas
│   │   ├── services/                 # Business logic
│   │   │   ├── agents/              # Agent orchestration (ACP, AAP)
│   │   │   ├── cache/               # Redis cache
│   │   │   ├── llm/                 # LLM providers (OpenRouter)
│   │   │   ├── ai_service_manager.py  # AI service manager
│   │   │   └── workflow_executor.py   # Workflow execution engine
│   │   ├── utils/                    # Utility functions
│   │   └── main.py                   # FastAPI application entry
│   │
│   ├── tests/                        # Test suite
│   │   ├── test_auth.py             # Auth tests
│   │   ├── test_workflows.py        # Workflow tests
│   │   ├── test_ai_services.py      # AI service tests
│   │   ├── test_workflow_execution.py  # Execution tests
│   │   └── ...                       # Other tests
│   │
│   ├── scripts/                      # Utility scripts
│   │   └── example_agent_usage.py   # Agent usage examples
│   │
│   ├── docs/                         # Documentation
│   │   ├── AI_SYSTEM_README.md      # AI system overview
│   │   ├── AI_SYSTEM_STRUCTURE.md   # Architecture details
│   │   ├── IMPLEMENTATION_SUMMARY.md # Implementation summary
│   │   ├── QUICK_REFERENCE.md       # Quick reference guide
│   │   └── WORKFLOW_EXECUTION_GUIDE.md  # Execution guide
│   │
│   ├── requirements.txt              # Python dependencies
│   ├── .env.template                 # Environment template
│   ├── .gitignore                    # Git ignore rules
│   └── README.md                     # Backend documentation
│
└── Client/                           # Frontend application
    ├── app/                          # Next.js 13+ App Router
    │   ├── dashboard/               # Dashboard page
    │   ├── workflows/               # Workflow pages
    │   │   ├── new/                # New workflow builder
    │   │   ├── enhanced/           # Enhanced builder
    │   │   └── page.tsx            # Workflow list
    │   ├── about/                   # About page
    │   ├── privacy/                 # Privacy policy
    │   ├── terms/                   # Terms of service
    │   ├── layout.tsx               # Root layout
    │   └── page.tsx                 # Home page
    │
    ├── components/                   # React components
    │   ├── auth/                    # Auth components
    │   ├── builder/                 # Workflow builder
    │   │   ├── builder-canvas.tsx  # Main canvas
    │   │   ├── enhanced-builder-canvas.tsx
    │   │   ├── custom-node.tsx     # Node renderer
    │   │   ├── custom-edge.tsx     # Edge renderer
    │   │   └── ...                  # Other builder components
    │   ├── layout/                  # Layout components
    │   ├── ui/                      # UI components (shadcn/ui)
    │   └── ...                       # Other components
    │
    ├── lib/                          # Utilities
    │   ├── api.ts                   # API client
    │   ├── config.ts                # Configuration
    │   └── ...                       # Other utilities
    │
    ├── docs/                         # Documentation
    │   ├── QUICK_START.md           # Quick start guide
    │   ├── ROUTES.md                # Routing documentation
    │   ├── ROUTING_FIXES.md         # Routing fixes
    │   └── FIXES_SUMMARY.md         # Fixes summary
    │
    ├── public/                       # Static assets
    ├── package.json                  # Dependencies
    ├── next.config.js               # Next.js config
    ├── tsconfig.json                # TypeScript config
    ├── tailwind.config.ts           # Tailwind config
    └── README.md                     # Frontend documentation
```

## 🎯 Key Components

### Backend Services

#### Core Services (`app/services/`)
- **ai_service_manager.py** - Central AI service manager
- **workflow_executor.py** - Workflow execution engine
- **agents/** - Agent orchestration (ACP, AAP, Orchestrator)
- **cache/** - Redis caching layer
- **llm/** - LLM provider integrations

#### API Routes (`app/routes/`)
- **ai.py** - AI chat, models, agents, tasks
- **auth.py** - Register, login, OTP verification
- **users.py** - User management
- **workflow.py** - Workflow CRUD & execution

### Frontend Components

#### Builder Components (`components/builder/`)
- **builder-canvas.tsx** - Visual workflow builder
- **enhanced-builder-canvas.tsx** - Enhanced version
- **custom-node.tsx** - Node renderer
- **workflow-toolbar.tsx** - Toolbar
- **node-config-panel.tsx** - Node configuration
- **template-library.tsx** - Workflow templates

#### Pages (`app/`)
- **workflows/** - Workflow management
- **dashboard/** - Main dashboard
- **about/**, **privacy/**, **terms/** - Static pages

## 📦 Clean Structure Benefits

### ✅ Backend
- ✅ All docs in `/docs` folder
- ✅ All tests in `/tests` folder
- ✅ Scripts in `/scripts` folder
- ✅ Removed backup files
- ✅ Removed `__pycache__` directories
- ✅ Added comprehensive `.gitignore`
- ✅ Clean `README.md` with examples

### ✅ Frontend
- ✅ All docs in `/docs` folder
- ✅ Removed backup files
- ✅ Clean component organization
- ✅ Proper TypeScript setup
- ✅ Clean `README.md`

### ✅ Root
- ✅ Comprehensive main `README.md`
- ✅ Clear project overview
- ✅ Quick start guide
- ✅ Architecture documentation

## 🔍 Finding Things

### Documentation
```bash
# Backend docs
backend/docs/WORKFLOW_EXECUTION_GUIDE.md  # Workflow execution
backend/docs/AI_SYSTEM_README.md          # AI system overview

# Frontend docs
Client/docs/QUICK_START.md                # Frontend quick start
Client/docs/ROUTES.md                     # Routing guide

# Main docs
README.md                                  # Project overview
```

### Tests
```bash
# Backend tests
backend/tests/test_workflows.py           # Workflow tests
backend/tests/test_workflow_execution.py  # Execution tests
backend/tests/test_ai_services.py         # AI tests

# Run all backend tests
cd backend && pytest
```

### Key Files
```bash
# Backend entry point
backend/app/main.py

# Workflow execution engine
backend/app/services/workflow_executor.py

# Frontend workflow builder
Client/components/builder/builder-canvas.tsx

# API client
Client/lib/api.ts
```

## 🚀 Quick Commands

### Development
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd Client
npm run dev

# Redis
docker start redis
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd Client
npm run test
```

### Building
```bash
# Backend (no build needed for Python)

# Frontend
cd Client
npm run build
```

## 📊 File Counts

- **Backend Python files**: ~40+
- **Frontend TypeScript/React files**: ~100+
- **Documentation files**: 12 markdown files
- **Test files**: 15+ test files

## 🎉 Organization Complete!

The project is now well-organized with:
- ✅ Clear directory structure
- ✅ Comprehensive documentation
- ✅ No backup/unnecessary files
- ✅ Proper `.gitignore` files
- ✅ Clean READMEs at all levels
- ✅ Tests organized in dedicated folder
- ✅ Scripts and examples organized
- ✅ Documentation centralized in `/docs`

**Ready for development, deployment, and collaboration!**
