"""
Centralized error handling middleware for FastAPI

Features:
- Consistent error response format
- Automatic logging of errors
- Request ID tracking
- Environment-aware error messages (hide details in production)
- HTTP exception handling
- Validation error handling
- Unhandled exception catching
"""

import traceback
import uuid
from datetime import datetime
from typing import Union

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger
from pydantic import ValidationError

from src.core.config import settings


class ErrorResponse:
    """Standardized error response format"""

    def __init__(
        self,
        error: str,
        message: str,
        status_code: int,
        request_id: str,
        details: Union[dict, list, None] = None,
        path: str = "",
    ):
        self.error = error
        self.message = message
        self.status_code = status_code
        self.request_id = request_id
        self.details = details
        self.path = path
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON response"""
        response = {
            "error": self.error,
            "message": self.message,
            "request_id": self.request_id,
            "timestamp": self.timestamp,
            "path": self.path,
        }

        # Only include details if present
        if self.details:
            response["details"] = self.details

        # In development, include more details
        if settings.ENV == "development":
            response["environment"] = "development"

        return response


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle HTTP exceptions (400, 401, 403, 404, etc.)
    """
    request_id = request.state.request_id if hasattr(request.state, "request_id") else str(uuid.uuid4())

    # Log the error
    logger.warning(
        f"HTTP {exc.status_code}: {exc.detail}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code,
        }
    )

    error_response = ErrorResponse(
        error=get_error_name(exc.status_code),
        message=str(exc.detail),
        status_code=exc.status_code,
        request_id=request_id,
        path=request.url.path,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.to_dict(),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors (422 Unprocessable Entity)
    """
    request_id = request.state.request_id if hasattr(request.state, "request_id") else str(uuid.uuid4())

    # Format validation errors
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"],
        })

    # Log the validation error
    logger.warning(
        f"Validation error on {request.url.path}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method,
            "errors": errors,
        }
    )

    error_response = ErrorResponse(
        error="Validation Error",
        message="Request validation failed. Please check the provided data.",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        request_id=request_id,
        path=request.url.path,
        details=errors if settings.ENV == "development" else None,
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.to_dict(),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all handler for unhandled exceptions (500 Internal Server Error)
    """
    request_id = request.state.request_id if hasattr(request.state, "request_id") else str(uuid.uuid4())

    # Log the full exception with stack trace
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__,
            "traceback": traceback.format_exc(),
        }
    )

    # In production, hide internal error details
    if settings.ENV == "production":
        message = "An internal server error occurred. Please contact support if the issue persists."
        details = None
    else:
        message = f"{type(exc).__name__}: {str(exc)}"
        details = {
            "exception_type": type(exc).__name__,
            "traceback": traceback.format_exc().split("\n"),
        }

    error_response = ErrorResponse(
        error="Internal Server Error",
        message=message,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        request_id=request_id,
        path=request.url.path,
        details=details,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.to_dict(),
    )


def get_error_name(status_code: int) -> str:
    """Get a human-readable error name for a status code"""
    error_names = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout",
    }
    return error_names.get(status_code, f"HTTP {status_code}")


class RequestIdMiddleware:
    """
    Middleware to add a unique request ID to each request for tracing
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Generate request ID
            request_id = str(uuid.uuid4())

            # Add to scope so it's available in request.state
            scope["state"] = {"request_id": request_id}

            # Add response header with request ID
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    headers.append((b"x-request-id", request_id.encode()))
                    message["headers"] = headers
                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)


def setup_error_handlers(app):
    """
    Register all error handlers with the FastAPI app
    """
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    logger.info("Error handlers registered successfully")
