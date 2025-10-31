# Configuration Directory

This directory contains Docker configuration files for the ChasmX platform.

## Files

### docker-compose.yml
**Production** Docker Compose configuration:
- **Redis:** Cache and message broker
- **Backend:** FastAPI application (production build)
- **Frontend:** Next.js application (optimized build)

### docker-compose.dev.yml
**Development** Docker Compose configuration:
- Same services as production but with hot-reload enabled
- Volume mounts for live code changes
- Debug logging enabled

### .env.example
Template for Docker environment variables (mainly Redis config)

## Usage

### Quick Start Scripts (from project root)

```bash
# Development
./scripts/dev-start.sh          # Start with hot-reload
./scripts/dev-stop.sh           # Stop development
./scripts/logs.sh dev           # View dev logs

# Production
./scripts/prod-start.sh         # Start production
./scripts/prod-stop.sh          # Stop production
./scripts/logs.sh prod          # View prod logs
```

### Manual Commands

**Development Mode:**
```bash
# From project root
docker-compose -f config/docker-compose.dev.yml up --build

# From config directory
cd config
docker-compose -f docker-compose.dev.yml up --build
```

**Production Mode:**
```bash
# From project root
docker-compose -f config/docker-compose.yml up -d --build

# From config directory
cd config
docker-compose up -d --build
```

### Starting Specific Services

```bash
# Start only Redis (dev)
docker-compose -f config/docker-compose.dev.yml up redis

# Start backend with dependencies (dev)
docker-compose -f config/docker-compose.dev.yml up backend

# Rebuild single service
docker-compose -f config/docker-compose.dev.yml up --build backend
```

## Environment Variables

### Required Files:
1. **config/.env** (Docker config)
   ```bash
   cp .env.example .env
   # Edit REDIS_PASSWORD
   ```

2. **apps/backend/.env** (Backend config)
   ```bash
   cp ../apps/backend/.env.example ../apps/backend/.env
   # Edit with MongoDB Atlas URL, SMTP, API keys
   ```

3. **apps/web/.env.local** (Frontend config - optional for Docker)
   ```bash
   cp ../apps/web/.env.example ../apps/web/.env.local
   # Edit API URLs if needed
   ```

## Architecture

### Networks
- **Production:** `chasmx-network`
- **Development:** `chasmx-dev-network`

All services communicate using service names as hostnames (e.g., `redis`, `backend`, `frontend`).

### Volumes

**Production:**
- `chasmx-redis-data` - Redis persistent data

**Development:**
- `chasmx-redis-dev-data` - Redis data
- `chasmx-backend-dev-cache` - Python cache
- `chasmx-frontend-dev-modules` - Node modules
- `chasmx-frontend-dev-cache` - Next.js build cache

### Port Mappings

- **3000:** Frontend (Next.js)
- **8000:** Backend API (FastAPI)
- **8000/docs:** Swagger API documentation
- **6379:** Redis

### Health Checks

Services include health checks for proper startup:
- **Redis:** `redis-cli ping` (10s interval)
- **Backend:** HTTP check on `/docs` (30s interval)
- **Frontend:** HTTP check on root (30s interval)

## Database

**MongoDB:** Uses MongoDB Atlas (cloud) - no local MongoDB container
- Connection string configured in `apps/backend/.env`
- Ensure IP whitelist is configured in Atlas
