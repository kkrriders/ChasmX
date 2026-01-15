"""Request body size limiting middleware for DoS protection."""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from loguru import logger
from typing import Callable


class RequestSizeLimiterMiddleware(BaseHTTPMiddleware):
    """Middleware to limit request body sizes and prevent DoS attacks.

    Different endpoints have different size limits:
    - Default: 1MB for most endpoints
    - Workflows: 5MB for complex workflow definitions
    - Webhooks: 2MB for webhook payloads
    - Templates: 5MB for template definitions
    """

    # Size limits in bytes
    DEFAULT_MAX_SIZE = 1 * 1024 * 1024  # 1MB
    WORKFLOW_MAX_SIZE = 5 * 1024 * 1024  # 5MB
    WEBHOOK_MAX_SIZE = 2 * 1024 * 1024  # 2MB
    TEMPLATE_MAX_SIZE = 5 * 1024 * 1024  # 5MB

    # Path-specific size limits (path prefix -> size in bytes)
    PATH_LIMITS = {
        "/workflows": WORKFLOW_MAX_SIZE,
        "/webhooks": WEBHOOK_MAX_SIZE,
        "/templates": TEMPLATE_MAX_SIZE,
        "/api/workflows": WORKFLOW_MAX_SIZE,
        "/api/webhooks": WEBHOOK_MAX_SIZE,
        "/api/templates": TEMPLATE_MAX_SIZE,
    }

    async def dispatch(self, request: Request, call_next: Callable):
        """Check request size before processing.

        Args:
            request: The incoming request
            call_next: The next middleware/handler in the chain

        Returns:
            Response from the next handler or error response
        """
        # Skip size check for GET, HEAD, OPTIONS (no body expected)
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return await call_next(request)

        # Get Content-Length header
        content_length = request.headers.get("content-length")

        if content_length is None:
            # No Content-Length header - FastAPI will handle empty bodies
            # For security, we could enforce Content-Length header for POST/PUT/PATCH
            return await call_next(request)

        try:
            content_length = int(content_length)
        except ValueError:
            logger.warning(f"Invalid Content-Length header: {content_length}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "Invalid request",
                    "detail": "Invalid Content-Length header"
                }
            )

        # Determine size limit for this path
        max_size = self.DEFAULT_MAX_SIZE
        request_path = request.url.path

        for path_prefix, limit in self.PATH_LIMITS.items():
            if request_path.startswith(path_prefix):
                max_size = limit
                break

        # Check if request exceeds size limit
        if content_length > max_size:
            max_size_mb = max_size / (1024 * 1024)
            logger.warning(
                f"Request size {content_length} bytes exceeds limit of {max_size} bytes "
                f"for path {request_path}"
            )
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "error": "Request too large",
                    "detail": f"Request body size ({content_length} bytes) exceeds maximum allowed size ({max_size_mb:.1f}MB)"
                }
            )

        # Size is within limit, continue processing
        return await call_next(request)
