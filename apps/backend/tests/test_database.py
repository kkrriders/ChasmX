"""
Tests for MongoDB client configuration and operations.
Uses mongomock-motor for async MongoDB mocking.
"""

import os
import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from mongomock_motor import AsyncMongoMockClient
from pymongo.errors import ConnectionFailure
from unittest.mock import patch, MagicMock
from loguru import logger

# Import our database client module
from app.database.client import (
    connect_to_mongo,
    close_mongo_connection,
    get_database,
    get_users_collection,
    client,
)

# Test data
TEST_USER = {
    "email": "test@example.com",
    "hashed_password": "dummy_hashed_password",
    "roles": ["user"],
}


@pytest.fixture
def mock_logger():
    """Mock logger to capture log messages"""
    with patch("app.database.client.logger") as mock_log:
        mock_log.info = MagicMock()  # Explicitly create info method
        mock_log.error = MagicMock()  # Explicitly create error method
        yield mock_log


@pytest.fixture
async def mock_mongo():
    """
    Setup mock MongoDB using mongomock-motor.
    Patches the AsyncIOMotorClient with AsyncMongoMockClient.
    """
    with patch("app.database.client.AsyncIOMotorClient", AsyncMongoMockClient):
        await connect_to_mongo()
        yield
        await close_mongo_connection()


@pytest.fixture(autouse=True)
async def reset_client():
    """Reset the global client before each test"""
    import app.database.client as client_module

    client_module.client = None
    yield
    client_module.client = None


@pytest.mark.asyncio
async def test_successful_connection(mock_mongo, mock_logger):
    """Test successful MongoDB connection and logging"""
    # Import client module to get the latest client value
    import app.database.client as client_module

    # We need to call connect_to_mongo again since it's mocked
    await connect_to_mongo()

    # Verify that success was logged
    mock_logger.info.assert_called_with("Successfully connected to MongoDB")

    # Verify client is initialized
    assert client_module.client is not None


@pytest.mark.asyncio
async def test_database_operations(mock_mongo):
    """Test database and collection operations"""
    # First connect to MongoDB
    await connect_to_mongo()

    # Get users collection
    users = get_users_collection()

    # Insert test user
    await users.insert_one(TEST_USER)

    # Query the user
    found_user = await users.find_one({"email": TEST_USER["email"]})

    # Verify user was inserted and retrieved correctly
    assert found_user is not None
    assert found_user["email"] == TEST_USER["email"]
    assert found_user["roles"] == TEST_USER["roles"]


@pytest.mark.asyncio
async def test_connection_failure():
    """Test handling of connection failures"""
    # Mock AsyncIOMotorClient to raise ConnectionFailure
    mock_client = MagicMock()
    mock_client.admin.command.side_effect = ConnectionFailure("Connection refused")

    with patch("app.database.client.AsyncIOMotorClient", return_value=mock_client):
        with pytest.raises(ConnectionFailure):
            await connect_to_mongo()


@pytest.mark.asyncio
async def test_invalid_uri(mock_logger):
    """Test handling of invalid MongoDB URI"""
    # Set invalid MongoDB URI
    os.environ["MONGO_URI"] = "mongodb://invalid:27017"

    # Mock client to raise ConnectionFailure on ping
    mock_client = MagicMock()
    mock_client.admin.command.side_effect = ConnectionFailure("Invalid URI")

    with patch("app.database.client.AsyncIOMotorClient", return_value=mock_client):
        with pytest.raises(ConnectionFailure):
            await connect_to_mongo()

        # Verify error was logged
        mock_logger.error.assert_called()


def test_get_database_without_connection():
    """Test get_database when client is not initialized"""
    with patch("app.database.client.client", None):
        with pytest.raises(RuntimeError) as exc_info:
            get_database()
        assert "MongoDB client not initialized" in str(exc_info.value)


@pytest.mark.asyncio
async def test_close_connection(mock_mongo, mock_logger):
    """Test MongoDB connection closure"""
    await close_mongo_connection()
    mock_logger.info.assert_called_with("MongoDB connection closed")
    assert client is None
