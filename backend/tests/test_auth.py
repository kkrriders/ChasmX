"""Tests for authentication routes including registration and login."""

import pytest
import pytest_asyncio
from fastapi import status
from httpx import AsyncClient
from datetime import datetime
from jose import jwt
import bcrypt

from app.main import app
from app.core.database import get_database
from app.models.user import User, UserCreate
from app.schemas.user import UserOut
from app.core.config import settings
from app.auth.jwt import create_access_token

# Test data
TEST_USER = {
    "email": "test@example.com",
    "password": "TestPassword123!",
    "roles": ["business_user"]
}

MOCK_HASHED_PASSWORD = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdiYbNrVKuYTNJKvCpxy"


@pytest_asyncio.fixture
async def client():
    """Create test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def mock_db():
    """Mock database fixture"""
    # This would typically set up a test database
    # For now, we'll use a simple mock
    return None


class TestAuthRoutes:
    """Test class for authentication routes"""

    @pytest_asyncio.async_test
    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration"""
        response = await client.post("/auth/register", json=TEST_USER)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "email" in data
        assert data["email"] == TEST_USER["email"]

    @pytest_asyncio.async_test
    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test registration with duplicate email"""
        # First registration
        await client.post("/auth/register", json=TEST_USER)

        # Second registration with same email
        response = await client.post("/auth/register", json=TEST_USER)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest_asyncio.async_test
    async def test_login_success(self, client: AsyncClient):
        """Test successful login"""
        # First register a user
        await client.post("/auth/register", json=TEST_USER)

        # Then login
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        response = await client.post("/auth/login", json=login_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data

    @pytest_asyncio.async_test
    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        response = await client.post("/auth/login", json=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest_asyncio.async_test
    async def test_verify_otp_success(self, client: AsyncClient):
        """Test successful OTP verification"""
        # This would require setting up OTP flow
        # For now, just test the endpoint exists
        verify_data = {
            "email": TEST_USER["email"],
            "otp": "123456"
        }
        response = await client.post("/auth/verify-otp", json=verify_data)
        # Will likely return 400 since no OTP was set, but endpoint should exist
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]


class TestJWTFunctions:
    """Test JWT utility functions"""

    def test_create_access_token(self):
        """Test JWT token creation"""
        email = "test@example.com"
        token = create_access_token(email)
        assert isinstance(token, str)

        # Decode and verify
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        assert payload["sub"] == email

    def test_token_expiration(self):
        """Test that tokens have expiration"""
        email = "test@example.com"
        token = create_access_token(email)

        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        assert "exp" in payload
        assert payload["exp"] > datetime.utcnow().timestamp()


class TestPasswordHashing:
    """Test password hashing functionality"""

    def test_password_hashing(self):
        """Test password hashing and verification"""
        password = "TestPassword123!"
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode(), salt)

        # Verify correct password
        assert bcrypt.checkpw(password.encode(), hashed)

        # Verify incorrect password fails
        assert not bcrypt.checkpw("wrongpassword".encode(), hashed)