"""
Tests for OTP generation, verification, and email functionality.
"""

import pytest
import pytest_asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
from mongomock_motor import AsyncMongoMockClient
from bson import ObjectId

from app.utils.otp import (
    generate_otp,
    verify_otp,
    update_user_otp,
    clear_user_otp,
    OTP_SECRET
)
from app.utils.email import send_otp_email
from app.models.user import User

# Test data
TEST_EMAIL = "test@example.com"
TEST_USER = {
    "_id": ObjectId(),
    "email": TEST_EMAIL,
    "hashed_password": "dummy_hashed_password",
    "roles": ["business_user"],
    "created_at": datetime.utcnow(),
    "otp_code": None,
    "otp_expiry": None
}

@pytest_asyncio.fixture
async def mock_db():
    """Create mock database for testing."""
    client = AsyncMongoMockClient()
    db = client.test_db
    # Create users collection
    await db.users.insert_one(TEST_USER.copy())
    yield db

@pytest.mark.asyncio
async def test_generate_otp():
    """Test OTP generation."""
    # Generate OTP
    plain_otp, hashed_otp = await generate_otp(TEST_EMAIL)
    
    # Verify OTP format
    assert len(plain_otp) == 6  # TOTP generates 6-digit codes
    assert plain_otp.isdigit()  # OTP should be numeric
    assert len(hashed_otp) > 0  # Hashed OTP should not be empty
    assert plain_otp != hashed_otp  # Hash should be different from plain OTP

@pytest.mark.asyncio
async def test_update_user_otp(mock_db: AsyncIOMotorDatabase):
    """Test updating user's OTP in database."""
    # Generate and update OTP
    plain_otp, hashed_otp = await generate_otp(TEST_EMAIL)
    result = await update_user_otp(TEST_EMAIL, hashed_otp, mock_db)
    
    # Verify update
    assert result is True
    user_doc = await mock_db.users.find_one({"email": TEST_EMAIL})
    assert user_doc is not None
    assert user_doc.get("otp_code") == hashed_otp
    assert user_doc.get("otp_expiry") is not None
    assert user_doc.get("otp_expiry") > datetime.utcnow()
    assert user_doc.get("otp_expiry") < datetime.utcnow() + timedelta(minutes=6)

@pytest.mark.asyncio
async def test_verify_otp_success(mock_db: AsyncIOMotorDatabase):
    """Test successful OTP verification."""
    # Generate and store OTP
    plain_otp, hashed_otp = await generate_otp(TEST_EMAIL)
    await update_user_otp(TEST_EMAIL, hashed_otp, mock_db)
    
    # Verify OTP
    result = await verify_otp(TEST_EMAIL, plain_otp, mock_db)
    assert result is True
    
    # Check OTP was cleared after verification
    user_doc = await mock_db.users.find_one({"email": TEST_EMAIL})
    assert user_doc is not None
    assert user_doc.get("otp_code") is None
    assert user_doc.get("otp_expiry") is None

@pytest.mark.asyncio
async def test_verify_otp_expired(mock_db: AsyncIOMotorDatabase):
    """Test OTP verification with expired code."""
    # Update test user with expired OTP
    expired_time = datetime.utcnow() - timedelta(minutes=6)
    await mock_db.users.update_one(
        {"email": TEST_EMAIL},
        {"$set": {
            "otp_code": "dummy_hashed_otp",
            "otp_expiry": expired_time
        }}
    )
    
    # Attempt to verify expired OTP
    with pytest.raises(HTTPException) as exc_info:
        await verify_otp(TEST_EMAIL, "123456", mock_db)
    
    assert exc_info.value.status_code == 400
    assert "expired" in str(exc_info.value.detail).lower()
    
    # Verify OTP was cleared
    user_doc = await mock_db.users.find_one({"email": TEST_EMAIL})
    assert user_doc is not None
    assert user_doc.get("otp_code") is None
    assert user_doc.get("otp_expiry") is None

@pytest.mark.asyncio
async def test_verify_otp_invalid(mock_db: AsyncIOMotorDatabase):
    """Test OTP verification with invalid code."""
    # Generate OTP and update user
    plain_otp, hashed_otp = await generate_otp(TEST_EMAIL)
    await mock_db.users.update_one(
        {"email": TEST_EMAIL},
        {"$set": {
            "otp_code": hashed_otp,
            "otp_expiry": datetime.utcnow() + timedelta(minutes=5)
        }}
    )
    
    # Attempt to verify with wrong OTP
    with pytest.raises(HTTPException) as exc_info:
        await verify_otp(TEST_EMAIL, "000000", mock_db)
    
    assert exc_info.value.status_code == 400
    assert "invalid" in str(exc_info.value.detail).lower()
    
    # Verify OTP was not cleared after failed attempt
    user_doc = await mock_db.users.find_one({"email": TEST_EMAIL})
    assert user_doc is not None
    assert user_doc.get("otp_code") == hashed_otp

@pytest.mark.asyncio
async def test_clear_user_otp(mock_db: AsyncIOMotorDatabase):
    """Test clearing user's OTP."""
    # Set up test user with OTP
    plain_otp, hashed_otp = await generate_otp(TEST_EMAIL)
    await mock_db.users.update_one(
        {"email": TEST_EMAIL},
        {"$set": {
            "otp_code": hashed_otp,
            "otp_expiry": datetime.utcnow() + timedelta(minutes=5)
        }}
    )
    
    # Clear OTP
    result = await clear_user_otp(TEST_EMAIL, mock_db)
    
    # Verify OTP was cleared
    assert result is True
    user_doc = await mock_db.users.find_one({"email": TEST_EMAIL})
    assert user_doc is not None
    assert user_doc.get("otp_code") is None
    assert user_doc.get("otp_expiry") is None

@pytest.mark.asyncio
async def test_send_otp_email_success():
    """Test successful OTP email sending."""
    with patch('app.utils.email.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
        mock_send.return_value = True
        result = await send_otp_email(TEST_EMAIL, "123456")
        
        assert result is True
        mock_send.assert_called_once()
        
        # Verify email parameters
        call_args = mock_send.call_args[1]
        assert call_args["hostname"] == "smtp.gmail.com"
        assert call_args["port"] == 587
        assert call_args["use_tls"] is True

@pytest.mark.asyncio
async def test_send_otp_email_failure():
    """Test OTP email sending failure."""
    with patch('app.utils.email.aiosmtplib.send', new_callable=AsyncMock) as mock_send:
        mock_send.side_effect = Exception("SMTP error")
        result = await send_otp_email(TEST_EMAIL, "123456")
        
        assert result is False
        mock_send.assert_called_once()