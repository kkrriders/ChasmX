"""Tests for protected user routes.

Tests user profile access and admin user listing with role-based access control.
"""

import pytest
import pytest_asyncio
from datetime import datetime
from typing import Dict, Any
from unittest.mock import patch
from fastapi import status
from httpx import AsyncClient

from app.main import app
from app.core.database import get_database
from app.auth.jwt import create_access_token
from app.models.user import User

# Mark all tests as async
pytestmark = pytest.mark.asyncio

# Test data
TEST_USERS = {
    "business": {
        "email": "user@example.com",
        "hashed_password": "hashed_password",
        "roles": ["business_user"],
        "created_at": datetime.utcnow(),
        "last_login": None,
        "failed_attempts": 0
    },
    "admin": {
        "email": "admin@example.com",
        "hashed_password": "hashed_password",
        "roles": ["business_user", "admin"],
        "created_at": datetime.utcnow(),
        "last_login": None,
        "failed_attempts": 0
    },
    "compliance": {
        "email": "compliance@example.com",
        "hashed_password": "hashed_password",
        "roles": ["business_user", "compliance_officer"],
        "created_at": datetime.utcnow(),
        "last_login": None,
        "failed_attempts": 0
    }
}

@pytest_asyncio.fixture(autouse=True)
async def mock_db():
    """Setup mock database with test users"""
    from mongomock_motor import AsyncMongoMockClient
    client = AsyncMongoMockClient()
    db = client.test_db
    
    # Insert test users
    for user_data in TEST_USERS.values():
        await db.users.insert_one(user_data)
    
    return db

@pytest.fixture
def auth_headers() -> Dict[str, Dict[str, str]]:
    """Create authorization headers with tokens for different roles"""
    headers = {}
    for role, user in TEST_USERS.items():
        token = create_access_token({"sub": user["email"], "roles": user["roles"]})
        headers[role] = {"Authorization": f"Bearer {token}"}
    return headers

@pytest_asyncio.fixture
async def test_client(mock_db):
    """Create test client with mocked database"""
    app.dependency_overrides[get_database] = lambda: mock_db
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    
    # Clear overrides after test
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_me_valid(test_client, auth_headers):
    """Test successful profile access with valid token"""
    for role, headers in auth_headers.items():
        response = await test_client.get("/users/me", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        user_data = response.json()
        
        # Verify response format
        assert user_data["email"] == TEST_USERS[role]["email"]
        assert user_data["roles"] == TEST_USERS[role]["roles"]
        assert "hashed_password" not in user_data
        assert "failed_attempts" not in user_data

@pytest.mark.asyncio
async def test_me_no_token(test_client):
    """Test profile access without token"""
    response = await test_client.get("/users/me")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Not authenticated" in response.json()["detail"]

@pytest.mark.asyncio
async def test_admin_users_valid(test_client, auth_headers):
    """Test admin user listing with admin token"""
    response = await test_client.get(
        "/users/admin/users",
        headers=auth_headers["admin"]
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify response format
    assert "users" in data
    assert "count" in data
    assert data["count"] == len(TEST_USERS)
    
    # Verify user data format
    for user in data["users"]:
        assert "email" in user
        assert "roles" in user
        assert "hashed_password" not in user
        assert "failed_attempts" not in user

@pytest.mark.asyncio
async def test_admin_users_compliance(test_client, auth_headers):
    """Test admin user listing with compliance officer token"""
    response = await test_client.get(
        "/users/admin/users",
        headers=auth_headers["compliance"]
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["count"] == len(TEST_USERS)
    assert len(data["users"]) == len(TEST_USERS)

@pytest.mark.asyncio
async def test_admin_users_insufficient(test_client, auth_headers):
    """Test admin user listing with business user token"""
    response = await test_client.get(
        "/users/admin/users",
        headers=auth_headers["business"]
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Insufficient permissions" in response.json()["detail"]

@pytest.mark.asyncio
async def test_empty_list(test_client, mock_db, auth_headers):
    """Test admin user listing with empty database"""
    # Clear all users
    await mock_db.users.delete_many({})
    
    response = await test_client.get(
        "/users/admin/users",
        headers=auth_headers["admin"]
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    assert data["users"] == []
    assert data["count"] == 0

@pytest.mark.asyncio
async def test_me_invalid_token(test_client):
    """Test profile access with invalid token"""
    headers = {"Authorization": "Bearer invalid.token.here"}
    response = await test_client.get("/users/me", headers=headers)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid or expired token" in response.json()["detail"]

@pytest.mark.asyncio
async def test_admin_users_pagination(test_client, mock_db, auth_headers):
    """Test admin user listing with pagination"""
    # Add more test users
    extra_users = [
        {
            "email": f"test{i}@example.com",
            "hashed_password": "hashed_password",
            "roles": ["business_user"],
            "created_at": datetime.utcnow(),
            "last_login": None,
            "failed_attempts": 0
        }
        for i in range(10)
    ]
    await mock_db.users.insert_many(extra_users)
    
    # Test with different limit values
    for limit in [5, 10, 100]:
        response = await test_client.get(
            f"/users/admin/users?limit={limit}",
            headers=auth_headers["admin"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert len(data["users"]) <= limit
        assert data["count"] == len(data["users"])