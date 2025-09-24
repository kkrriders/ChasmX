"""Test suite for JWT token creation and verification utilities"""

import pytest
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.auth.jwt import create_access_token, verify_token, get_current_timestamp
from app.core.config import settings
import time
import calendar
from unittest.mock import patch


@pytest.fixture
def test_user_data():
    """Fixture for test user data"""
    return {"sub": "test@example.com", "roles": ["business_user"]}


@pytest.fixture
def mock_time():
    """Fixture that provides a mocked timestamp"""
    current = int(time.time())
    with patch("app.auth.jwt.get_current_timestamp", return_value=current) as mock:
        yield mock


def test_create_access_token(test_user_data, mock_time):
    """Test token creation with valid data"""
    current_time = mock_time.return_value

    token = create_access_token(test_user_data)

    # Verify it's a non-empty string
    assert isinstance(token, str)
    assert len(token) > 0

    # Decode without verification to check contents
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        options={"verify_exp": False},
    )

    # Verify user data is preserved
    assert payload["sub"] == test_user_data["sub"]
    assert payload["roles"] == test_user_data["roles"]

    # Verify token timestamps
    assert payload["iat"] == current_time  # Issued at should match current time
    assert payload["exp"] == current_time + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


def test_create_access_token_custom_expiry(test_user_data, mock_time):
    """Test token creation with custom expiration time"""
    current_time = mock_time.return_value
    custom_delta = timedelta(hours=1)

    token = create_access_token(test_user_data, expires_delta=custom_delta)

    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        options={"verify_exp": False},
    )

    # Verify token timestamps
    assert payload["iat"] == current_time
    assert payload["exp"] == current_time + int(custom_delta.total_seconds())


def test_verify_token_valid(test_user_data, mock_time):
    """Test token verification with valid token"""
    current_time = mock_time.return_value

    # Create token that expires in 5 minutes
    token = create_access_token(test_user_data, expires_delta=timedelta(minutes=5))

    # Move time forward 1 minute (still valid)
    mock_time.return_value = current_time + 60

    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == test_user_data["sub"]
    assert payload["roles"] == test_user_data["roles"]


def test_verify_token_expired(mock_time):
    """Test token verification with expired token"""
    current_time = mock_time.return_value

    # Create token that expires in 1 minute
    token = create_access_token(
        {"sub": "test@example.com"}, expires_delta=timedelta(minutes=1)
    )

    # Move time forward 2 minutes (now expired)
    future_time = current_time + 120
    mock_time.return_value = future_time

    # Need to patch both time.time() and calendar.timegm() for jose's internal checks
    with patch("time.time", return_value=future_time), patch(
        "calendar.timegm", return_value=future_time
    ):
        payload = verify_token(token)
        assert payload is None


def test_verify_token_invalid_signature():
    """Test token verification with invalid signature"""
    # Create token with wrong secret
    token = jwt.encode(
        {"sub": "test@example.com", "exp": int(time.time()) + 300},
        "wrong_secret",
        algorithm=settings.JWT_ALGORITHM,
    )

    payload = verify_token(token)
    assert payload is None


def test_verify_token_invalid_algorithm():
    """Test token verification with invalid algorithm"""
    # Create token with unsupported algorithm
    token = jwt.encode(
        {"sub": "test@example.com", "exp": int(time.time()) + 300},
        settings.JWT_SECRET_KEY,
        algorithm="HS512",  # Different algorithm
    )

    payload = verify_token(token)
    assert payload is None


def test_verify_token_missing_sub(mock_time):
    """Test token verification with missing sub claim"""
    current_time = mock_time.return_value

    # Create token without 'sub' claim but with expiration
    token = jwt.encode(
        {"exp": current_time + 300},  # Valid for 5 minutes
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    payload = verify_token(token)
    assert payload is None


def test_create_access_token_missing_sub():
    """Test token creation with missing sub claim"""
    with pytest.raises(ValueError) as exc_info:
        create_access_token({"data": "test"})
    assert "sub" in str(exc_info.value)


def test_verify_token_malformed():
    """Test verification of malformed token"""
    payload = verify_token("not.a.token")
    assert payload is None


def test_token_content_security(test_user_data, mock_time):
    """Test that tokens don't contain sensitive information"""
    token = create_access_token(test_user_data)

    # Decode without verification to check raw content
    parts = token.split(".")
    import base64
    import json

    # Decode payload (middle part)
    padding = "=" * (4 - len(parts[1]) % 4)
    payload = json.loads(base64.urlsafe_b64decode(parts[1] + padding).decode())

    # Check no sensitive data is included
    sensitive_fields = ["password", "secret", "key", "token"]
    for field in sensitive_fields:
        assert all(field not in key.lower() for key in payload.keys())
