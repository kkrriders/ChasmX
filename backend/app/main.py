"""Main FastAPI application configuration.

This module sets up the main FastAPI application with middleware, routes,
and database connection lifecycle management.
"""

from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from dotenv import load_dotenv

from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.config import settings
from app.routes import auth_router, users_router

# Load environment variables
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="Backend API",
    version="1.0.0",
    description="Role-Based Access Control (RBAC) Authentication Service",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan events."""
    try:
        await connect_to_mongo()
        logger.info("Startup: MongoDB connected, Authentication service ready")
        yield
    finally:
        await close_mongo_connection()
        logger.info("Shutdown: MongoDB connection closed")

# Set up lifespan events
app.router.lifespan_context = lifespan

# Include routers with prefixes
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "auth": {
                "register": "/auth/register",
                "login": "/auth/login",
                "verify_otp": "/auth/verify-otp"
            },
            "users": {
                "me": "/users/me",
                "admin": "/users/admin/users"
            }
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        db = await get_database()
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "degraded",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
