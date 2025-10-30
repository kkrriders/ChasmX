# Configuration

This directory contains shared configuration files for the ChasmX platform.

## Files

### docker-compose.yml
Docker Compose configuration for running all services locally:
- **Redis:** Cache and message broker
- **Backend:** FastAPI application
- **Frontend:** Next.js application

## Usage

### Starting All Services

From the config directory:
```bash
cd config
docker-compose up
```

Or from the root directory:
```bash
docker-compose -f config/docker-compose.yml up
```

### Starting Specific Services

```bash
# Start only Redis
docker-compose up redis

# Start backend and its dependencies
docker-compose up backend

# Start everything except frontend
docker-compose up redis backend
```

### Development Mode

For development with hot reloading:
```bash
docker-compose up
```

Both backend and frontend are configured with volume mounts for live code reloading.

### Production Mode

For production deployment, consider:
1. Using separate docker-compose.prod.yml
2. Removing volume mounts
3. Using environment-specific .env files
4. Configuring proper networking and security

## Environment Variables

Each service requires its own .env file:
- Backend: `../apps/backend/.env`
- Frontend: `../apps/web/.env.local`

See respective `.env.example` files for required variables.

## Network

All services run on the default bridge network created by Docker Compose, allowing them to communicate using service names as hostnames.

## Volumes

- **redis-data:** Persistent storage for Redis data

## Port Mappings

- **3000:** Frontend (Next.js)
- **8000:** Backend (FastAPI)
- **6379:** Redis

## Health Checks

Services include health checks for proper startup orchestration:
- Redis: `redis-cli ping`
- Backend depends on Redis being healthy
- Frontend depends on Backend being available
