# Docker Commands Reference

You don't need the scripts! Here are the direct Docker commands you can use.

## 🚀 Starting Services

### Development (with hot-reload)
```bash
docker-compose -f config/docker-compose.dev.yml up
```

### Production
```bash
docker-compose -f config/docker-compose.yml up -d
```

## 🛑 Stopping Services

### Development
```bash
docker-compose -f config/docker-compose.dev.yml down
```

### Production
```bash
docker-compose -f config/docker-compose.yml down
```

## 📊 Viewing Logs

### All services
```bash
docker-compose -f config/docker-compose.dev.yml logs -f
```

### Specific service
```bash
docker-compose -f config/docker-compose.dev.yml logs -f backend
docker-compose -f config/docker-compose.dev.yml logs -f frontend
```

## 🔨 Building/Rebuilding

### Build all services
```bash
docker-compose -f config/docker-compose.dev.yml build
```

### Build specific service
```bash
docker-compose -f config/docker-compose.dev.yml build backend
```

### Build with no cache (fresh build)
```bash
docker-compose -f config/docker-compose.dev.yml build --no-cache
```

### Build and start
```bash
docker-compose -f config/docker-compose.dev.yml up --build
```

## 🧹 Cleanup

### Stop and remove containers
```bash
docker-compose -f config/docker-compose.dev.yml down
```

### Stop and remove containers + volumes
```bash
docker-compose -f config/docker-compose.dev.yml down -v
```

### Remove specific containers
```bash
docker rm -f chasmx-backend-dev chasmx-frontend-dev chasmx-redis-dev
```

### Remove ChasmX images
```bash
docker images | grep chasmx
docker rmi <image-id>
```

### Remove all unused Docker resources
```bash
docker system prune -a
```

## 🔍 Checking Status

### See running containers
```bash
docker ps
```

### See all containers (including stopped)
```bash
docker ps -a
```

### See images
```bash
docker images
```

### See volumes
```bash
docker volume ls
```

## 🐚 Shell Access

### Backend shell
```bash
docker exec -it chasmx-backend-dev bash
```

### Frontend shell
```bash
docker exec -it chasmx-frontend-dev sh
```

### Redis CLI
```bash
docker exec -it chasmx-redis-dev redis-cli
```

## 🔄 Restart Services

### Restart specific service
```bash
docker-compose -f config/docker-compose.dev.yml restart backend
```

### Restart all services
```bash
docker-compose -f config/docker-compose.dev.yml restart
```

## 💡 Most Common Workflows

### Fresh Start (Clean Rebuild)
```bash
# Stop everything
docker-compose -f config/docker-compose.dev.yml down -v

# Remove old images
docker images | grep chasmx

# Rebuild from scratch
docker-compose -f config/docker-compose.dev.yml build --no-cache

# Start
docker-compose -f config/docker-compose.dev.yml up
```

### Quick Restart After Code Changes
```bash
# If volumes are mounted, just restart
docker-compose -f config/docker-compose.dev.yml restart

# Or rebuild specific service
docker-compose -f config/docker-compose.dev.yml up --build backend
```

### Switch from Dev to Prod
```bash
# Stop dev
docker-compose -f config/docker-compose.dev.yml down

# Start prod
docker-compose -f config/docker-compose.yml up -d
```

## 📝 Notes

- The scripts in `scripts/` are just wrappers around these commands
- You can use Docker commands directly from any directory
- `-f` flag specifies which compose file to use
- `-d` flag runs in detached mode (background)
- `--build` flag rebuilds before starting
- `--no-cache` flag forces complete rebuild

**Choose what works best for you!**
- Scripts = convenient, less typing
- Direct commands = more control, no extra files
