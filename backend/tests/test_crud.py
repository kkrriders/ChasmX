"""
Tests for CRUD operations in the authentication system.
Uses mongomock-motor for async MongoDB mocking.
"""

import pytest
from datetime import datetime
from unittest.mock import patch
from pydantic import ValidationError
from pymongo.errors import PyMongoError
from motor.motor_asyncio import AsyncIOMotorCollection

from app.database.crud import (
    create_user,
    get_user_by_email,
    verify_password,
    update_last_login,
    increment_failed_attempts,
)
from app.schemas.user import UserCreate
from app.models.user import User

# Test data
TEST_USER_DATA = {
    "email": "test@example.com",
    "password": "SecurePass123!",
    "roles": ["business_user"],
}

TEST_INVALID_EMAIL = {
    "email": "notanemail",
    "password": "SecurePass123!",
    "roles": ["business_user"],
}


@pytest.fixture(name="mock_users_collection")
def mock_users_collection_fixture(monkeypatch):
    """
    Create a mock MongoDB collection using mongomock-motor.
    This provides async operations that mimic the real MongoDB.
    """
    from mongomock_motor import AsyncMongoMockClient

    # Create a mock client and get the collection
    client = AsyncMongoMockClient()
    collection = client.db.users

    def mock_get_collection(*args, **kwargs):
        return collection

    # Mock both the client initialization check and collection getter
    monkeypatch.setattr("app.database.client.client", client)  # Mock the real client
    monkeypatch.setattr("app.database.crud.get_users_collection", mock_get_collection)
    return collection


@pytest.mark.asyncio
async def test_create_user_success(mock_users_collection):
    """Test successful user creation with password hashing"""
    # Create user with valid data
    user_in = UserCreate(**TEST_USER_DATA)
    user = await create_user(user_in)

    # Assert user was created with correct data
    assert user.email == TEST_USER_DATA["email"]
    assert user.roles == TEST_USER_DATA["roles"]
    assert user.hashed_password != TEST_USER_DATA["password"]  # Password was hashed
    assert await verify_password(TEST_USER_DATA["password"], user.hashed_password)

    # Verify the document in the mock collection
    doc = await mock_users_collection.find_one({"email": TEST_USER_DATA["email"]})
    assert doc is not None
    assert doc["email"] == TEST_USER_DATA["email"]
    assert doc["roles"] == TEST_USER_DATA["roles"]
    assert "created_at" in doc
    assert "updated_at" in doc
    assert doc["failed_login_attempts"] == 0


@pytest.mark.asyncio
async def test_create_user_duplicate_email(mock_users_collection):
    """Test that creating a user with duplicate email raises ValueError"""
    # Create first user
    user_in = UserCreate(**TEST_USER_DATA)
    await create_user(user_in)

    # Attempt to create duplicate user
    with pytest.raises(ValueError) as exc_info:
        await create_user(user_in)
    assert (
        str(exc_info.value)
        == f"User with email {TEST_USER_DATA['email']} already exists"
    )


@pytest.mark.asyncio
async def test_create_user_invalid_email():
    """Test that invalid email validation works"""
    with pytest.raises(ValidationError):
        UserCreate(**TEST_INVALID_EMAIL)


@pytest.mark.asyncio
async def test_get_user_by_email(mock_users_collection):
    """Test retrieving a user by email"""
    # Create a user first
    user_in = UserCreate(**TEST_USER_DATA)
    created_user = await create_user(user_in)

    # Retrieve the user
    user = await get_user_by_email(TEST_USER_DATA["email"])
    assert user is not None
    assert user.email == created_user.email
    assert user.roles == created_user.roles
    assert user.hashed_password == created_user.hashed_password

    # Try to get non-existent user
    non_existent = await get_user_by_email("nonexistent@example.com")
    assert non_existent is None


@pytest.mark.asyncio
async def test_verify_password(mock_users_collection):
    """Test password verification"""
    # Create a user with known password
    user_in = UserCreate(**TEST_USER_DATA)
    user = await create_user(user_in)

    # Test correct password
    assert await verify_password(TEST_USER_DATA["password"], user.hashed_password)

    # Test wrong password
    assert not await verify_password("WrongPassword123!", user.hashed_password)


@pytest.mark.asyncio
async def test_update_last_login(mock_users_collection):
    """Test updating user's last login timestamp"""
    # Create a user first
    user_in = UserCreate(**TEST_USER_DATA)
    await create_user(user_in)

    # Get initial login attempt count
    initial_doc = await mock_users_collection.find_one(
        {"email": TEST_USER_DATA["email"]}
    )
    initial_attempts = initial_doc["failed_login_attempts"]

    # Update last login
    success = await update_last_login(TEST_USER_DATA["email"])
    assert success is True

    # Verify the update
    user_doc = await mock_users_collection.find_one({"email": TEST_USER_DATA["email"]})
    assert user_doc["last_login"] is not None
    assert user_doc["failed_login_attempts"] == 0  # Should be reset
    assert (
        user_doc["failed_login_attempts"] <= initial_attempts
    )  # Should never increase
    assert user_doc["failed_login_attempts"] == 0  # Should be reset


@pytest.mark.asyncio
async def test_increment_failed_attempts(mock_users_collection):
    """Test incrementing failed login attempts"""
    # Create a user first
    user_in = UserCreate(**TEST_USER_DATA)
    await create_user(user_in)

    # Increment failed attempts
    success = await increment_failed_attempts(TEST_USER_DATA["email"])
    assert success is True

    # Verify the increment
    user_doc = await mock_users_collection.find_one({"email": TEST_USER_DATA["email"]})
    assert user_doc["failed_login_attempts"] == 1

    # Increment again
    await increment_failed_attempts(TEST_USER_DATA["email"])
    user_doc = await mock_users_collection.find_one({"email": TEST_USER_DATA["email"]})
    assert user_doc["failed_login_attempts"] == 2


@pytest.mark.asyncio
async def test_database_error_handling(mock_users_collection):
    """Test handling of PyMongoError"""
    user_in = UserCreate(**TEST_USER_DATA)

    # Mock PyMongoError on insert
    async def mock_insert_one(*args, **kwargs):
        raise PyMongoError("Database error")

    # Replace insert_one with our mock
    mock_users_collection.insert_one = mock_insert_one

    # Attempt to create user
    with pytest.raises(PyMongoError):
        await create_user(user_in)
