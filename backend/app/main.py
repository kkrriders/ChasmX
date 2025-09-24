"""Main FastAPI application configuration# Ini# Initialize FastAPI application with lifespan handler
app = FastAPI(
    title="Backend API - Auth",
    version="1.0.0",
    description="Role-Based Access Control (RBAC) Authentication Service",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan)FastAPI application with lifespan handler
app = FastAPI(
    title="Backend API",
    version="1.0.0",
    description="Role-Based Access Control (RBAC) Authentication Service",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan)s module sets up the main FastAPI application with middleware, routes,
and database connection lifecycle management.
"""

import os
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from dotenv import load_dotenv

from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.config import settings
from app.routes import auth_router, users_router

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan events."""
    # Startup
    try:
        await connect_to_mongo()
        logger.info("Startup: MongoDB connected, Authentication service ready")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
    
    yield  # Application running
    
    # Shutdown
    try:
        await close_mongo_connection()
        logger.info("Shutdown: MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {str(e)}")

# Initialize FastAPI application with lifespan handler
app = FastAPI(
    title="No-Code AI Backend - Auth",
    version="1.0.0",
    description="Role-Based Access Control (RBAC) Authentication for No-Code Workflows",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for HTTP exceptions
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with proper logging."""
    logger.error(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Global exception handler for unexpected errors
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions with proper logging."""
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Include routers with prefixes
app.include_router(auth_router, prefix="/auth")  # /auth/login and /auth/register
app.include_router(users_router, prefix="/users")  # /users/me and /users/admin/users

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
                "login": "/auth/login"
            },
            "users": {
                "me": "/users/me",
                "admin": "/users/admin/users"
            }
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and Docker healthchecks."""
    from app.core.database import get_database
    try:
        db = await get_database()
        await db.command("ping")  # Test MongoDB connection
        return {
            "status": "healthy",
            "version": "1.0",
            "service": "backend-auth",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "degraded",
            "version": "1.0",
            "service": "backend-auth",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
