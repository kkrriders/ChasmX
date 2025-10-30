"""
PyTest configuration and shared fixtures.
"""

import pytest
import pytest_asyncio
import os
from dotenv import load_dotenv
from mongomock_motor import AsyncMongoMockClient

# Test environment variables
TEST_ENV = {
    "MONGODB_URL": "mongodb://localhost:27017",
    "DATABASE_NAME": "test_db",
    "JWT_SECRET_KEY": "test_secret_key",
    "JWT_ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
    "MIN_PASSWORD_LENGTH": "8",
    "MAX_FAILED_ATTEMPTS": "5",
    "SMTP_HOST": "smtp.gmail.com",
    "SMTP_PORT": "587",
    "SMTP_USER": "test@example.com",
    "SMTP_PASSWORD": "test_password",
    "SMTP_TLS": "True"
}

@pytest.fixture(autouse=True)
def env_setup():
    """
    Set up test environment variables.
    This runs before each test.
    """
    # Set test environment variables
    for key, value in TEST_ENV.items():
        os.environ[key] = value

    yield

    # Clean up after tests
    for key in TEST_ENV:
        if key in os.environ:
            del os.environ[key]
