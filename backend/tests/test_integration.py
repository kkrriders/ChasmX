"""Integration tests for the complete authentication flow.

Tests the full integration of authentication, user management, and RBAC.
"""

import pytest
from datetime import datetime
from unittest.mock import patch
from fastapi import status
from jose import jwt

from app.core.config import settings
from app.core.database import connect_to_mongo
from .conftest import TEST_USERS

# Mark all tests as async
pytestmark = pytest.mark.asyncio

# Test data for new users
NEW_USERS = {
    "compliance": {
        "email": "compliance@example.com",
        "password": "CompPass123!",
        "roles": ["compliance_officer"]
    }
}

async def test_health(test_client):
    """Test health check endpoint."""
    response = await test_client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0"

async def test_startup_event(app, caplog):
    """Test application startup event."""
    with patch("app.core.database.connect_to_mongo") as mock_connect:
        # Trigger startup event
        await app.router.startup()
        
        # Verify connection attempt
        mock_connect.assert_called_once()
        assert "Startup: MongoDB connected" in caplog.text

async def test_shutdown_event(app, caplog):
    """Test application shutdown event."""
    with patch("app.core.database.close_mongo_connection") as mock_close:
        # Trigger shutdown event
        await app.router.shutdown()
        
        # Verify connection closed
        mock_close.assert_called_once()
        assert "Shutdown: MongoDB connection closed" in caplog.text

async def test_full_auth_flow(test_client, mock_db):
    """Test complete authentication and authorization flow."""
    # 1. Register new compliance officer
    register_data = NEW_USERS["compliance"]
    response = await test_client.post(
        "/auth/register",
        json=register_data
    )
    assert response.status_code == status.HTTP_201_CREATED
    user_data = response.json()
    assert user_data["email"] == register_data["email"]
    assert "compliance_officer" in user_data["roles"]
    
    # 2. Login with new user
    login_response = await test_client.post(
        "/auth/login",
        json={
            "email": register_data["email"],
            "password": register_data["password"]
        }
    )
    assert login_response.status_code == status.HTTP_200_OK
    login_data = login_response.json()
    
    # Verify token
    token = login_data["access_token"]
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM]
    )
    assert payload["sub"] == register_data["email"]
    assert "compliance_officer" in payload["roles"]
    
    # 3. Access profile with token
    headers = {"Authorization": f"Bearer {token}"}
    profile_response = await test_client.get("/users/me", headers=headers)
    assert profile_response.status_code == status.HTTP_200_OK
    profile = profile_response.json()
    assert profile["email"] == register_data["email"]
    
    # 4. Access admin users list (compliance officer has access)
    users_response = await test_client.get("/users/admin/users", headers=headers)
    assert users_response.status_code == status.HTTP_200_OK
    users_data = users_response.json()
    assert "users" in users_data
    assert users_data["count"] > 0

async def test_authentication_failures(test_client, mock_db):
    """Test various authentication failure scenarios."""
    # 1. Register with duplicate email
    duplicate_data = {
        "email": TEST_USERS["business"]["email"],
        "password": "NewPass123!",
        "roles": ["business_user"]
    }
    response = await test_client.post("/auth/register", json=duplicate_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"].lower()
    
    # 2. Login with wrong password
    wrong_login = {
        "email": TEST_USERS["business"]["email"],
        "password": "WrongPass123!"
    }
    response = await test_client.post("/auth/login", json=wrong_login)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # Verify failed attempts incremented
    user = await mock_db.users.find_one({"email": TEST_USERS["business"]["email"]})
    assert user["failed_attempts"] == 1
    
    # 3. Access protected route without token
    response = await test_client.get("/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

async def test_role_based_access(test_client, auth_headers):
    """Test role-based access control."""
    # Business user can't access admin routes
    response = await test_client.get(
        "/users/admin/users",
        headers=auth_headers["business"]
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # Admin can access admin routes
    response = await test_client.get(
        "/users/admin/users",
        headers=auth_headers["admin"]
    )
    assert response.status_code == status.HTTP_200_OK

async def test_database_connection_error(app, caplog):
    """Test handling of database connection errors."""
    with patch(
        "app.core.database.connect_to_mongo",
        side_effect=Exception("Connection failed")
    ):
        # Trigger startup event
        await app.router.startup()
        
        # Verify error logged but application didn't crash
        assert "Failed to connect to MongoDB" in caplog.text

async def test_cors_configuration(test_client):
    """Test CORS configuration."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    
    response = await test_client.options("/auth/register", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert "access-control-allow-origin" in response.headers
    assert "access-control-allow-methods" in response.headers
    assert "access-control-allow-headers" in response.headers