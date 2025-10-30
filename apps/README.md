# Applications

This directory contains all application code for the ChasmX platform, organized as a monorepo.

## Structure

### Backend (`apps/backend/`)
FastAPI-based backend service providing:
- RESTful API endpoints
- Authentication & authorization (JWT + OTP)
- Workflow execution engine
- AI/LLM integration with caching
- MongoDB database management
- Redis caching layer

**Tech Stack:** Python, FastAPI, MongoDB, Redis, OpenRouter

[Backend Documentation →](./backend/README.md)

### Web (`apps/web/`)
Next.js frontend application featuring:
- Visual workflow builder (ReactFlow)
- User authentication & management
- Real-time workflow execution monitoring
- Responsive UI with Tailwind CSS
- TypeScript for type safety

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, ReactFlow

[Web Documentation →](./web/README.md)

## Development

### Running Both Applications

From the root directory:

```bash
# Terminal 1 - Backend
cd apps/backend
pip install -r requirements.txt
uvicorn src.main:app --reload

# Terminal 2 - Frontend
cd apps/web
npm install
npm run dev
```

### Using Docker

```bash
# From root directory
docker-compose -f config/docker-compose.yml up
```

## Key Features

- **Monorepo Structure:** Clean separation of frontend and backend
- **Independent Deployment:** Each app can be deployed separately
- **Shared Types:** TypeScript types shared between apps (future)
- **Unified Documentation:** Centralized docs in `/docs`

## Environment Variables

Both applications require environment configuration:

- Backend: `apps/backend/.env`
- Web: `apps/web/.env.local`

See respective `.env.example` files for required variables.
