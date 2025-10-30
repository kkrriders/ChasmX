

from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.config import settings
from app.routes import auth_router, users_router, workflow_router
from app.routes.ai import router as ai_router
from app.routes.websocket import router as websocket_router
from app.routes.schedule import router as schedule_router
from app.routes.webhook import router as webhook_router
from app.routes.usage import router as usage_router
from app.services.ai_service_manager import ai_service_manager
from app.services.scheduler_service import scheduler_service

# Initialize FastAPI application
app = FastAPI(
    title="Backend API",
    version="1.0.0",
    description="Role-Based Access Control (RBAC) and Workflow Management Service",
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

        # Initialize AI services
        await ai_service_manager.initialize()
        logger.info("Startup: AI services initialized")

        # Initialize scheduler service
        await scheduler_service.initialize(
            mongodb_uri=settings.MONGODB_URL,
            db_name=settings.DATABASE_NAME
        )
        logger.info("Startup: Scheduler service initialized")

        yield
    finally:
        # Shutdown scheduler service
        await scheduler_service.shutdown()
        logger.info("Shutdown: Scheduler service closed")

        # Shutdown AI services
        await ai_service_manager.shutdown()
        logger.info("Shutdown: AI services closed")

        await close_mongo_connection()
        logger.info("Shutdown: MongoDB connection closed")

# Set up lifespan events
app.router.lifespan_context = lifespan

# Include routers with prefixes
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(workflow_router)
app.include_router(ai_router)
app.include_router(usage_router)
app.include_router(websocket_router)
app.include_router(schedule_router)
app.include_router(webhook_router)

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
