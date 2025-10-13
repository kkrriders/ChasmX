@echo off
REM Quick start script for ChasmX backend on Windows

echo.
echo 🚀 Starting ChasmX Backend...
echo.

cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo 🧪 Testing database connections...
python test_database_connections.py

if %errorlevel% equ 0 (
    echo.
    echo ✅ All systems ready!
    echo.
    echo 🌐 Starting FastAPI server on http://localhost:8000
    echo 📚 API Documentation: http://localhost:8000/docs
    echo.
    uvicorn app.main:app --reload --port 8000
) else (
    echo.
    echo ❌ Database connection test failed. Please check the issues above.
    pause
    exit /b 1
)
