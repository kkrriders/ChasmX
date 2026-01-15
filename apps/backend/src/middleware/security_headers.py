"""Security headers middleware for comprehensive protection.

Implements best-practice HTTP security headers to protect against:
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME sniffing
- Information leakage
- Man-in-the-middle attacks
- And more...
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from typing import Callable
from loguru import logger


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses.

    Headers added:
    - Content-Security-Policy: Prevents XSS and injection attacks
    - X-Frame-Options: Prevents clickjacking
    - X-Content-Type-Options: Prevents MIME sniffing
    - Strict-Transport-Security: Forces HTTPS (production only)
    - X-XSS-Protection: Enables XSS filter
    - Referrer-Policy: Controls referrer information
    - Permissions-Policy: Controls browser features
    - X-Permitted-Cross-Domain-Policies: Restricts cross-domain policies
    """

    def __init__(self, app: ASGIApp, environment: str = "development"):
        """Initialize security headers middleware.

        Args:
            app: The ASGI application
            environment: Environment name (development/production)
        """
        super().__init__(app)
        self.environment = environment
        self.is_production = environment.lower() in ["production", "prod"]
        logger.info(f"SecurityHeaders initialized for {environment} environment")

    def _get_csp_header(self) -> str:
        """Get Content-Security-Policy header value.

        Returns:
            CSP header value appropriate for environment
        """
        # For API, CSP is less critical than for web apps serving HTML
        # But still provides defense-in-depth

        if self.is_production:
            # Strict production CSP
            return (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "  # Allow inline styles for API docs
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self'; "
                "frame-ancestors 'none'; "  # Prevent framing
                "base-uri 'self'; "
                "form-action 'self'; "
                "upgrade-insecure-requests"  # Upgrade HTTP to HTTPS
            )
        else:
            # More permissive for development (allows Swagger UI to work)
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "  # Swagger needs eval
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' http://localhost:* ws://localhost:*; "
                "frame-ancestors 'none'"
            )

    def _get_hsts_header(self) -> str:
        """Get Strict-Transport-Security header value.

        Returns:
            HSTS header value (production only)
        """
        if self.is_production:
            # Max age: 1 year, include subdomains, allow preloading
            return "max-age=31536000; includeSubDomains; preload"
        else:
            # Don't force HTTPS in development
            return ""

    def _get_permissions_policy(self) -> str:
        """Get Permissions-Policy header value.

        Returns:
            Permissions-Policy header value
        """
        # Disable unnecessary browser features
        # This is an API, so we don't need most browser features
        return (
            "accelerometer=(), "
            "camera=(), "
            "geolocation=(), "
            "gyroscope=(), "
            "magnetometer=(), "
            "microphone=(), "
            "payment=(), "
            "usb=()"
        )

    async def dispatch(self, request: Request, call_next: Callable):
        """Add security headers to response.

        Args:
            request: The incoming request
            call_next: The next middleware/handler

        Returns:
            Response with security headers added
        """
        response = await call_next(request)

        # Add security headers
        headers = {
            # Prevent clickjacking
            "X-Frame-Options": "DENY",

            # Prevent MIME sniffing
            "X-Content-Type-Options": "nosniff",

            # Enable XSS filter (legacy, but still useful)
            "X-XSS-Protection": "1; mode=block",

            # Control referrer information
            "Referrer-Policy": "strict-origin-when-cross-origin",

            # Content Security Policy
            "Content-Security-Policy": self._get_csp_header(),

            # Permissions Policy (Feature-Policy replacement)
            "Permissions-Policy": self._get_permissions_policy(),

            # Restrict cross-domain policies
            "X-Permitted-Cross-Domain-Policies": "none",

            # Remove server version information
            "X-Powered-By": "",  # Remove if present
            "Server": "ChasmX",  # Generic server name

            # Cache control for sensitive data
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "Pragma": "no-cache",
            "Expires": "0",
        }

        # Add HSTS only in production
        hsts = self._get_hsts_header()
        if hsts:
            headers["Strict-Transport-Security"] = hsts

        # Apply headers to response
        for header, value in headers.items():
            if value:  # Only add non-empty values
                response.headers[header] = value

        # Remove headers that leak information
        if "Server" in response.headers:
            del response.headers["Server"]
        if "X-Powered-By" in response.headers:
            del response.headers["X-Powered-By"]

        return response


class CORPHeadersMiddleware(BaseHTTPMiddleware):
    """Add Cross-Origin Resource Policy headers.

    This provides additional protection against Spectre-like attacks
    by preventing cross-origin resource access.
    """

    async def dispatch(self, request: Request, call_next: Callable):
        """Add CORP headers to response.

        Args:
            request: The incoming request
            call_next: The next middleware/handler

        Returns:
            Response with CORP headers
        """
        response = await call_next(request)

        # Add CORP headers
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"

        return response
