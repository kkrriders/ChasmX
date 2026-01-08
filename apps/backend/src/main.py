
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from src.core.database import connect_to_mongo, close_mongo_connection, get_database
from src.core.config import settings
from src.middleware.rate_limiter import RateLimiterMiddleware
from src.middleware.error_handler import setup_error_handlers, RequestIdMiddleware
from src.routes import auth_router, users_router, workflow_router
from src.routes.ai import router as ai_router
from src.routes.websocket import router as websocket_router
from src.routes.schedule import router as schedule_router
from src.routes.webhook import router as webhook_router
from src.routes.usage import router as usage_router
from src.routes.template import router as template_router
from src.routes.api_keys import router as api_keys_router
from src.routes.analytics import router as analytics_router
from src.routes.security import router as security_router
from src.routes.teams import router as teams_router
from src.services.ai_service_manager import ai_service_manager
from src.services.scheduler_service import scheduler_service
from src.services.quota_service import quota_service

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI application
app = FastAPI(
    title="Backend API",
    version="1.0.0",
    description="Role-Based Access Control (RBAC) and Workflow Management Service",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add rate limiter to app state
app.state.limiter = limiter

# Custom rate limit exception handler
async def rate_limit_handler(request: Request, exc: Exception):
    """Handle rate limit exceeded exceptions"""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "detail": "Too many requests. Please try again later.",
        }
    )

app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(RateLimiterMiddleware)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan events."""
    try:
        # Validate configuration on startup
        logger.info("Startup: Validating configuration...")
        try:
            settings.validate_required_settings()
            logger.info("Startup: Configuration validation passed")
        except ValueError as e:
            logger.error(f"Configuration validation failed: {e}")
            if settings.ENV == "production":
                raise
            logger.warning("Continuing in development mode despite validation errors")

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

        # Initialize quota service
        await quota_service.connect()
        logger.info("Startup: Quota service initialized")

        yield
    finally:
        # Shutdown quota service
        await quota_service.disconnect()
        logger.info("Shutdown: Quota service closed")

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
app.include_router(template_router)
app.include_router(api_keys_router)
app.include_router(analytics_router)
app.include_router(security_router)
app.include_router(teams_router)

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
                "verify_otp": "/auth/verify-otp",
                "resend_otp": "/auth/resend-otp",
                "check_user": "/auth/check-user",
                "change_password": "/auth/change-password",
                "forgot_password": "/auth/forgot-password",
                "reset_password": "/auth/reset-password"
            },
            "users": {
                "me": "/users/me",
                "admin": "/users/admin/users"
            },
            "workflows": {
                "list": "/workflows",
                "create": "/workflows",
                "templates": "/workflows/templates"
            },
            "templates": {
                "list": "/templates",
                "create": "/templates",
                "categories": "/templates/categories",
                "featured": "/templates/featured",
                "search": "/templates/search"
            },
            "ai": {
                "chat": "/ai/chat", 
                "workflows": "/ai/workflows/generate"
            },
            "analytics": {
                "realtime_metrics": "/analytics/metrics/realtime",
                "active_workflows": "/analytics/workflows/active",
                "node_performance": "/analytics/nodes/performance",
                "quality_metrics": "/analytics/quality"
            }
        }
    }

@app.get("/health")
async def health_check():
    """Basic health check endpoint - returns 200 if service is running."""
    return {
        "status": "healthy",
        "service": "Backend API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/readiness")
async def readiness_check():
    """
    Comprehensive readiness check - verifies all dependencies are healthy.

    Checks:
    - MongoDB connection
    - Redis connection
    - AI services initialization
    - Scheduler service status

    Returns 200 if all services are ready, 503 if any service is down.
    """
    checks = {
        "mongodb": {"status": "unknown", "message": ""},
        "redis": {"status": "unknown", "message": ""},
        "ai_services": {"status": "unknown", "message": ""},
        "scheduler": {"status": "unknown", "message": ""},
    }

    overall_status = "healthy"

    # Check MongoDB
    try:
        db = await get_database()
        await db.command("ping")
        checks["mongodb"] = {"status": "healthy", "message": "Connected"}
    except Exception as e:
        checks["mongodb"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "degraded"

    # Check Redis
    try:
        from src.services.cache.redis_cache import redis_cache
        if redis_cache.redis:
            await redis_cache.redis.ping()
            checks["redis"] = {"status": "healthy", "message": "Connected"}
        else:
            checks["redis"] = {"status": "degraded", "message": "Not initialized"}
            overall_status = "degraded"
    except Exception as e:
        checks["redis"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "degraded"

    # Check AI Services
    try:
        if ai_service_manager.is_initialized:
            checks["ai_services"] = {"status": "healthy", "message": "Initialized"}
        else:
            checks["ai_services"] = {"status": "degraded", "message": "Not initialized"}
            overall_status = "degraded"
    except Exception as e:
        checks["ai_services"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "degraded"

    # Check Scheduler
    try:
        if scheduler_service.is_running:
            checks["scheduler"] = {"status": "healthy", "message": "Running"}
        else:
            checks["scheduler"] = {"status": "degraded", "message": "Not running"}
            overall_status = "degraded"
    except Exception as e:
        checks["scheduler"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "degraded"

    status_code = 200 if overall_status == "healthy" else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": checks
        }
    )
