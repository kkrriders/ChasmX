# Quick Commands Reference

Essential commands for working with ChasmX project.

---

## 🚀 Start Everything

```bash
# Start Redis
docker start redis

# Start Backend (Terminal 1)
cd backend
uvicorn app.main:app --reload

# Start Frontend (Terminal 2)
cd Client
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest                                    # All tests
pytest tests/test_workflows.py          # Specific test
pytest --cov=app tests/                  # With coverage

# Frontend tests
cd Client
npm run test                             # Run tests
npm run build                            # Build check
npm run lint                             # Linting
```

---

## 📦 Installation

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd Client
npm install
```

---

## 🐳 Docker

```bash
# Redis
docker run -d -p 6379:6379 --name redis redis:latest
docker start redis
docker stop redis

# Check Redis
docker exec redis redis-cli ping
```

---

## 🔍 Useful Commands

```bash
# Find files
find . -name "*.tsx" -type f

# Count lines
wc -l backend/app/**/*.py

# Git status
git status --short

# Search code
grep -r "workflow_executor" backend/
```

---

## 📊 Project Stats

```bash
# Count Python files
find backend -name "*.py" | wc -l

# Count TypeScript files
find Client -name "*.tsx" -o -name "*.ts" | wc -l

# Total lines of code
find . -name "*.py" -o -name "*.tsx" -o -name "*.ts" | xargs wc -l
```

---

## 🔧 Development

```bash
# Backend hot reload
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend hot reload
cd Client
npm run dev

# Check ports
lsof -i :3000
lsof -i :8000
lsof -i :6379
```

---

## 📝 Documentation

```bash
# View docs
ls -la backend/docs/
ls -la Client/docs/

# Read specific doc
cat backend/docs/WORKFLOW_EXECUTION_GUIDE.md
```

---

## 🎯 Quick Tests

```bash
# Test backend health
curl http://localhost:8000/health

# Test AI endpoints
curl http://localhost:8000/ai/health

# List workflows
curl http://localhost:8000/workflows/

# Test Redis
docker exec redis redis-cli ping
```

---

**Save this file for quick reference!**
