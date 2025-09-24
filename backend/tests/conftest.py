"""
PyTest configuration and shared fixtures.
"""

import pytest
import os
from dotenv import load_dotenv


@pytest.fixture(autouse=True)
def env_setup():
    """
    Automatically set up test environment variables.
    This runs before each test.
    """
    # Load environment variables from .env file
    load_dotenv()

    # Set test-specific environment variables
    os.environ["MONGO_URI"] = "mongodb://localhost:27017/test_db"

    yield

    # Clean up after tests
    if "MONGO_URI" in os.environ:
        del os.environ["MONGO_URI"]
