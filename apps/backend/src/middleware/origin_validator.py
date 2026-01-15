"""Origin validation middleware for additional CSRF-like protection.

While Bearer token authentication (Authorization header) is naturally resistant
to traditional CSRF attacks, this middleware provides defense-in-depth by:

1. Validating Origin/Referer headers on state-changing requests
2. Preventing requests from untrusted origins
3. Blocking requests with suspicious or missing origin information
4. Providing additional protection if tokens are ever stored in cookies

Note: This is a secondary defense layer. The primary CSRF protection comes
from using Bearer tokens in Authorization headers (not cookies).
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from loguru import logger
from typing import Callable, List
from urllib.parse import urlparse


class OriginValidatorMiddleware(BaseHTTPMiddleware):
    """Validate Origin/Referer headers to prevent cross-origin attacks."""

    # Methods that modify state (should validate origin)
    STATE_CHANGING_METHODS = ["POST", "PUT", "PATCH", "DELETE"]

    # Paths that should skip origin validation (public endpoints)
    SKIP_VALIDATION_PATHS = [
        "/docs",
        "/redoc",
        "/openapi.json",
        "/health",
        "/",
    ]

    # Paths that require strict origin validation
    STRICT_VALIDATION_PATHS = [
        "/auth/change-password",
        "/auth/reset-password",
        "/users",
        "/workflows",
        "/api-keys",
        "/teams",
    ]

    def __init__(self, app, allowed_origins: List[str]):
        """Initialize origin validator.

        Args:
            app: The ASGI application
            allowed_origins: List of allowed origin URLs (e.g., ['http://localhost:3000'])
        """
        super().__init__(app)
        self.allowed_origins = set(allowed_origins)
        logger.info(f"OriginValidator initialized with origins: {allowed_origins}")

    def _normalize_origin(self, origin: str) -> str:
        """Normalize origin URL for comparison.

        Args:
            origin: Origin URL

        Returns:
            Normalized origin (scheme + netloc)
        """
        if not origin:
            return ""

        # Handle relative URLs
        if origin.startswith("/"):
            return ""

        parsed = urlparse(origin)
        # Return scheme://host:port (without path)
        port = f":{parsed.port}" if parsed.port else ""
        return f"{parsed.scheme}://{parsed.hostname}{port}"

    def _is_allowed_origin(self, origin: str) -> bool:
        """Check if origin is in allowed list.

        Args:
            origin: Origin to check

        Returns:
            True if origin is allowed
        """
        if "*" in self.allowed_origins:
            return True  # Allow all (dev mode only)

        normalized = self._normalize_origin(origin)
        return normalized in self.allowed_origins

    def _should_skip_validation(self, path: str) -> bool:
        """Check if path should skip origin validation.

        Args:
            path: Request path

        Returns:
            True if validation should be skipped
        """
        for skip_path in self.SKIP_VALIDATION_PATHS:
            if path.startswith(skip_path):
                return True
        return False

    def _requires_strict_validation(self, path: str) -> bool:
        """Check if path requires strict origin validation.

        Args:
            path: Request path

        Returns:
            True if strict validation required
        """
        for strict_path in self.STRICT_VALIDATION_PATHS:
            if path.startswith(strict_path):
                return True
        return False

    async def dispatch(self, request: Request, call_next: Callable):
        """Validate origin headers on state-changing requests.

        Args:
            request: The incoming request
            call_next: The next middleware/handler

        Returns:
            Response or error
        """
        # Skip validation for safe methods and public paths
        if request.method not in self.STATE_CHANGING_METHODS:
            return await call_next(request)

        if self._should_skip_validation(request.url.path):
            return await call_next(request)

        # Get Origin or Referer header
        origin = request.headers.get("origin")
        referer = request.headers.get("referer")

        # For strict validation paths, require origin/referer
        requires_strict = self._requires_strict_validation(request.url.path)

        if requires_strict and not origin and not referer:
            logger.warning(
                f"Blocked request to {request.url.path} - missing Origin/Referer header"
            )
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "Forbidden",
                    "detail": "Origin validation failed: missing Origin or Referer header"
                }
            )

        # Validate origin if present
        if origin:
            if not self._is_allowed_origin(origin):
                logger.warning(
                    f"Blocked request from unauthorized origin: {origin} to {request.url.path}"
                )
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={
                        "error": "Forbidden",
                        "detail": f"Origin '{origin}' not allowed"
                    }
                )

        # Validate referer if present (and no origin)
        elif referer:
            referer_origin = self._normalize_origin(referer)
            if referer_origin and not self._is_allowed_origin(referer_origin):
                logger.warning(
                    f"Blocked request from unauthorized referer: {referer} to {request.url.path}"
                )
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={
                        "error": "Forbidden",
                        "detail": f"Referer origin '{referer_origin}' not allowed"
                    }
                )

        # Origin validation passed or not required
        return await call_next(request)
