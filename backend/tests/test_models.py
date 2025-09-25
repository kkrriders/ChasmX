"""
Tests for Pydantic models and schemas.
Validates model constraints, schema transformations, and error handling.
"""

import pytest
from datetime import datetime
from pydantic import ValidationError, EmailStr

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut

# Test data
VALID_USER_DATA = {
    "email": "test@example.com",
    "password": "SecurePass123!",
    "roles": ["business_user", "compliance_officer"],
    "ai_persona": "Professional style",
}

# Generate a mock hashed password of correct length for bcrypt (60 chars)
MOCK_HASHED_PASSWORD = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdiYbNrVKuYTNJKvCpxy"

VALID_USER_MODEL_DATA = {
    "email": "test@example.com",
    "hashed_password": MOCK_HASHED_PASSWORD,
    "roles": ["business_user"],
    "created_at": datetime.utcnow(),
}


def test_valid_user_create():
    """Test UserCreate schema with valid data"""
    try:
        user = UserCreate.model_validate(VALID_USER_DATA)
        print("Schema validated successfully")
        assert user.email == VALID_USER_DATA["email"]
        assert user.password == VALID_USER_DATA["password"]
        assert user.roles == VALID_USER_DATA["roles"]
    except ValidationError as e:
        pytest.fail(f"Validation failed: {e}")


def test_invalid_email():
    """Test email validation in UserCreate"""
    invalid_data = VALID_USER_DATA.copy()
    invalid_data["email"] = "not_an_email"

    with pytest.raises(ValidationError) as exc_info:
        UserCreate.model_validate(invalid_data)

    assert "email" in str(exc_info.value)


def test_password_validation():
    """Test password length constraints"""
    # Test too short password
    short_pass_data = VALID_USER_DATA.copy()
    short_pass_data["password"] = "short"

    with pytest.raises(ValidationError) as exc_info:
        UserCreate.model_validate(short_pass_data)

    assert "password" in str(exc_info.value)


def test_roles_validation():
    """Test role validation and defaults"""
    # Test default role
    minimal_data = {"email": "test@example.com", "password": "SecurePass123!"}
    user = UserCreate.model_validate(minimal_data)
    assert user.roles is None  # Should use default from User model

    # Test invalid role
    invalid_role_data = VALID_USER_DATA.copy()
    invalid_role_data["roles"] = ["invalid_role"]

    with pytest.raises(ValueError) as exc_info:
        UserCreate.model_validate(invalid_role_data)
    assert "Invalid roles" in str(exc_info.value)


def test_user_out_excludes_sensitive():
    """Test UserOut schema excludes sensitive data"""
    # Create a full user model instance
    user_model = User.model_validate(VALID_USER_MODEL_DATA)

    # Convert to UserOut
    user_out = UserOut.model_validate(user_model)
    user_dict = user_out.model_dump()

    # Verify sensitive fields are excluded
    assert "hashed_password" not in user_dict
    assert user_dict["email"] == VALID_USER_MODEL_DATA["email"]
    assert user_dict["roles"] == VALID_USER_MODEL_DATA["roles"]


def test_empty_roles_validation():
    """Test that empty roles list is rejected"""
    invalid_data = VALID_USER_MODEL_DATA.copy()
    invalid_data["roles"] = []

    # The model validator should reject empty roles
    with pytest.raises(ValueError) as exc_info:
        User.model_validate(
            {**invalid_data, "roles": []}  # This should trigger the model_validator
        )

    assert "At least one role is required" in str(exc_info.value)


def test_user_login_validation():
    """Test UserLogin schema validation"""
    valid_login = {"email": "test@example.com", "password": "password123"}

    # Test valid login
    login = UserLogin.model_validate(valid_login)
    assert (
        login.email == valid_login["email"]
    )  # EmailStr validation happens during model_validate

    # Test missing password
    invalid_login = {"email": "test@example.com"}
    with pytest.raises(ValidationError):
        UserLogin.model_validate(invalid_login)


def test_ai_persona_validation():
    """Test AI persona field validation"""
    # Test valid AI persona
    data = VALID_USER_DATA.copy()
    user = UserCreate.model_validate(data)
    assert user.ai_persona == data["ai_persona"]

    # Test too long AI persona
    data["ai_persona"] = "x" * 501  # Exceeds max_length
    with pytest.raises(ValidationError) as exc_info:
        UserCreate.model_validate(data)
    assert "ai_persona" in str(exc_info.value)
