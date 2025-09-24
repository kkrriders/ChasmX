"""Tests for authentication and RBAC dependencies.

Tests JWT token authentication and role-based access control using
mongomo        with patch("app.auth.jwt.verify_token") as mock_verify:
            # Mock verify_token to return None for invalid token
            mock_verify.return_value = None

            with pytest.raises(HTTPException) as exc:
                await get_current_user(creds, mock_db)

            assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert "Invalid or expired token" in str(exc.value.detail)database mocking and pytest-asyncio for async testing.
"""

import pytest
import pytest_asyncio
from datetime import datetime, timedelta
from typing import Dict, Any
from unittest.mock import patch, AsyncMock
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from httpx import AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app.auth.dependencies import get_current_user, verify_role
from jose import jwt, JWTError
from app.core.config import settings
from app.auth.jwt import create_access_token
from app.models.user import User
from app.core.database import get_database

# Mark all tests as async
pytestmark = pytest.mark.asyncio

# Test data
TEST_USER: Dict[str, Any] = {
    "email": "test@example.com",
    "hashed_password": "hashed_dummy_password",
    "roles": ["business_user"],
    "created_at": datetime.utcnow(),
    "last_login": None,
}


@pytest.fixture
def user() -> User:
    """Create a test user object"""
    return User(**TEST_USER)


@pytest.fixture
def token() -> str:
    """Create a valid JWT token for test user"""
    return create_access_token(
        data={"sub": TEST_USER["email"]}, expires_delta=timedelta(minutes=15)
    )


@pytest.fixture
def auth_headers(token: str) -> Dict[str, str]:
    """Create authorization headers with test token"""
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(autouse=True)
async def mock_db():
    """Setup mock database with mongomock-motor for all tests"""
    client = AsyncMongoMockClient()
    db = client["test_db"]

    # Prepare test user in database
    await db["users"].insert_one(TEST_USER)

    # Patch database dependencies
    async def mock_get_db():
        return db

    with patch("app.core.database.get_database", new=mock_get_db), patch(
        "app.auth.dependencies.get_database", new=mock_get_db
    ), patch("app.crud.user.get_database", new=mock_get_db):
        yield db

        # Cleanup
        await db["users"].delete_many({})


@pytest_asyncio.fixture
async def app(mock_db) -> FastAPI:
    """Create test FastAPI app with authenticated routes"""
    app = FastAPI()

    async def mock_get_db():
        return mock_db

    app.dependency_overrides[get_database] = mock_get_db

    @app.get("/users/me")
    async def read_me(user: User = Depends(get_current_user)):
        return user

    @app.get("/admin/users")
    async def list_users(user: User = Depends(verify_role(["admin"]))):
        return {"users": []}

    return app


async def test_get_current_user_valid_token(token: str, mock_db):
    """Test get_current_user with valid token returns user"""
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    user = await get_current_user(creds, mock_db)

    assert user.email == TEST_USER["email"]
    assert user.roles == TEST_USER["roles"]
    
    # Verify last_login was updated in DB
    db_user = await mock_db["users"].find_one({"email": TEST_USER["email"]})
    assert db_user is not None
    assert db_user["last_login"] is not None


async def test_get_current_user_invalid_token(mock_db):
    """Test get_current_user with invalid token raises 401"""
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_token")

    with pytest.raises(HTTPException) as exc:
        await get_current_user(creds, mock_db)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid or expired token" in str(exc.value.detail)


async def test_get_current_user_missing_sub(mock_db):
    """Test get_current_user with token missing sub claim raises 401"""
    expires = datetime.utcnow() + timedelta(hours=24)
    token = jwt.encode(
        {
            "exp": int(expires.timestamp()),
            "iat": int(datetime.utcnow().timestamp()),
            "test_scope": "api"
        },
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    creds = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token
    )
    
    with pytest.raises(HTTPException) as exc:
        await get_current_user(creds, mock_db)
    
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == "Invalid token: Missing 'sub' claim"
async def test_get_current_user_not_found(mock_db):
    """Test get_current_user with non-existent user raises 404"""
    # Create token for non-existent user
    token = create_access_token(data={"sub": "missing@example.com"})
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    with pytest.raises(HTTPException) as exc:
        await get_current_user(creds, mock_db)

    assert exc.value.status_code == status.HTTP_404_NOT_FOUND


async def test_verify_role_insufficient_permissions():
    """Test verify_role dependency with insufficient permissions"""
    user = User(**TEST_USER)  # business_user role only
    role_dep = verify_role(["admin"])

    with pytest.raises(HTTPException) as exc:
        await role_dep(user)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "Insufficient permissions" in str(exc.value.detail)


async def test_verify_role_correct_permissions():
    """Test verify_role dependency with correct permissions"""
    admin_user = User(**{**TEST_USER, "roles": ["admin"]})
    role_dep = verify_role(["admin"])

    result = await role_dep(admin_user)
    assert result == admin_user


async def test_verify_role_compliance_officer():
    """Test verify_role dependency with compliance_officer role"""
    compliance_user = User(**{**TEST_USER, "roles": ["compliance_officer"]})
    role_dep = verify_role(["compliance_officer"])

    result = await role_dep(compliance_user)
    assert result == compliance_user


async def test_integration_protected_routes(app: FastAPI, auth_headers: Dict[str, str], mock_db):
    """Test integration with FastAPI routes"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test successful authentication
        resp = await client.get("/users/me", headers=auth_headers)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["email"] == TEST_USER["email"]
        
        # Verify last_login was updated in DB
        db_user = await mock_db["users"].find_one({"email": TEST_USER["email"]})
        assert db_user is not None
        assert db_user["last_login"] is not None
        
        # Test insufficient role
        resp = await client.get("/admin/users", headers=auth_headers)
        assert resp.status_code == status.HTTP_403_FORBIDDEN
        
        # Test invalid authentication with wrong token format
        resp = await client.get("/users/me", headers={"Authorization": "Basic test"})
        assert resp.status_code == status.HTTP_403_FORBIDDEN
        
        # Test token that fails validation
        resp = await client.get("/users/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Test token for non-existent user
        admin_token = create_access_token(
            data={"sub": "admin@example.com"}, expires_delta=timedelta(minutes=15)
        )
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.get("/users/me", headers=admin_headers)
        assert resp.status_code == status.HTTP_404_NOT_FOUND