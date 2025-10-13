#!/bin/bash
# Quick start script for ChasmX backend

echo "🚀 Starting ChasmX Backend..."
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "🧪 Testing database connections..."
python test_database_connections.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All systems ready!"
    echo ""
    echo "🌐 Starting FastAPI server on http://localhost:8000"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo ""
    uvicorn app.main:app --reload --port 8000
else
    echo ""
    echo "❌ Database connection test failed. Please check the issues above."
    exit 1
fi
