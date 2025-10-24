# 🗄️ ChasmX Database Setup Guide

## ✅ Current Status

Your databases are configured! Here's what's set up:

### MongoDB Atlas ✓
- **Connection String**: Configured in `backend/.env`
- **Database Name**: `chasm_db`
- **Status**: Ready to use

### Redis ✓
- **Host**: `localhost` (for local development)
- **Port**: `6379`
- **Status**: Configured for Windows

---

## 🚀 Quick Start

### Option 1: Using Docker (Easiest - Recommended)

Docker will automatically start MongoDB (using your Atlas connection) and Redis:

```bash
# From project root
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f backend
```

**That's it!** Docker handles everything.

---

### Option 2: Local Development (Without Docker)

#### Step 1: Start Redis on Windows

Open PowerShell as Administrator and run:

```powershell
# If Redis is installed as a service
redis-server

# Or if you have Redis installed from MSI:
# It should already be running as a Windows service
# Check in Services (services.msc)
```

**Verify Redis is running:**
```bash
# Should show redis-server.exe in Task Manager
# Or open another terminal and try:
redis-cli ping
# Should respond: PONG
```

#### Step 2: Install Python Dependencies

```bash
cd backend

# Install all required packages
pip install -r requirements.txt

# This installs:
# - motor (MongoDB async driver)
# - redis (Redis client)
# - beanie (MongoDB ODM)
# - And all other dependencies
```

#### Step 3: Test Connections

```bash
# Run the connection test script
python test_database_connections.py
```

You should see:
```
✓ MongoDB connected successfully
✓ Redis connected successfully
🎉 All database connections are working!
```

#### Step 4: Start the Backend

```bash
# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

Access the API:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

---

## 📝 Configuration Details

### Backend .env File

Your `backend/.env` is configured with:

```ini
# MongoDB Atlas
MONGODB_URL=mongodb+srv://[username]:[password]@cluster0.zsrnvhv.mongodb.net/...
DATABASE_NAME=chasm_db

# Redis (Local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379/0

# OpenRouter API (Already configured)
OPENROUTER_API_KEY=sk-or-v1-...
```

### Docker Configuration

For Docker, the `.env` automatically switches to:
- `REDIS_HOST=redis` (uses Docker service name)

The `docker-compose.yml` handles this automatically via environment variables.

---

## 🔍 Troubleshooting

### MongoDB Issues

**Connection Timeout:**
```bash
# 1. Check MongoDB Atlas Network Access
#    - Go to Atlas Dashboard > Network Access
#    - Add IP: 0.0.0.0/0 (for testing)
#    - Or add your current IP address

# 2. Verify credentials in .env
#    - Username and password are correct
#    - Special characters are URL-encoded
```

**Database Not Found:**
- This is normal! MongoDB creates databases automatically when you first write data
- Collections (`workflows`, `workflow_runs`) will be created on first use

### Redis Issues

**Connection Refused:**
```bash
# 1. Check if Redis is running
# In PowerShell:
Get-Process redis-server

# If not running, start it:
redis-server

# 2. Check Redis is listening on port 6379
netstat -an | findstr "6379"
```

**Redis Not Installed:**
```bash
# Download Redis for Windows:
# https://github.com/microsoftarchive/redis/releases
# Install the MSI package
# Start redis-server from Start Menu or Services
```

### Docker Issues

**Redis Not Connecting:**
```yaml
# docker-compose.yml already has health checks
# Redis must be healthy before backend starts
# Check with:
docker-compose logs redis
```

---

## 🧪 Testing Database Connections

### Quick Health Check

```bash
# After starting the backend
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-13T..."
}
```

### MongoDB Test

```python
# In Python terminal
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test():
    client = AsyncIOMotorClient("your-mongodb-url")
    await client.admin.command('ping')
    print("MongoDB connected!")

asyncio.run(test())
```

### Redis Test

```python
# In Python terminal
from redis import asyncio as aioredis
import asyncio

async def test():
    redis = await aioredis.from_url("redis://localhost:6379")
    await redis.ping()
    print("Redis connected!")

asyncio.run(test())
```

---

## 📊 Database Schema

ChasmX uses two main collections:

### 1. `workflows`
Stores workflow definitions:
- nodes (workflow steps)
- edges (connections)
- variables
- metadata

### 2. `workflow_runs`
Stores execution history:
- execution status
- node states
- logs and errors
- timing information

Both are created automatically by Beanie ODM on first use.

---

## 🎯 Next Steps

1. ✅ **MongoDB Atlas**: Already configured
2. ✅ **Redis**: Configured for localhost
3. ⏳ **Install Dependencies**: Run `pip install -r requirements.txt`
4. ⏳ **Test Connections**: Run `python test_database_connections.py`
5. ⏳ **Start Backend**: Run `uvicorn app.main:app --reload`

Or simply use Docker:
```bash
docker-compose up -d
```

---

## 💡 Pro Tips

### For Development:
- Use **local setup** with `--reload` for hot reloading
- Keep MongoDB Atlas for production-like data
- Use Redis for caching and real-time features

### For Production:
- Use **Docker** for consistent deployments
- Set `REDIS_HOST=redis` in docker-compose
- Consider Redis Cloud for production Redis

### Environment Switching:
```bash
# Local development
REDIS_HOST=localhost

# Docker development
REDIS_HOST=redis

# Production (in docker-compose.yml)
environment:
  - REDIS_HOST=redis
```

---

## ✅ Verification Checklist

- [x] MongoDB Atlas connection string in `.env`
- [x] Redis configured for localhost
- [ ] Redis running on Windows
- [ ] Python dependencies installed
- [ ] Connection test passes
- [ ] Backend starts successfully

**Your databases are properly configured! Just install the dependencies and you're ready to go!** 🚀
