"""Tests for authentication routes including registration and login."""

Tests for authentication routes including registration and login

Tests user registration and login endpoints with mock database and fixtures."""

"""

import pytest

import pytestimport pytest_asyncio

import pytest_asynciofrom fastapi import status

from unittest.mock import patchfrom httpx import AsyncClient

from datetime import datetimeimport mongomock_motor

from fastapi import statusfrom datetime import datetime

from httpx import AsyncClientfrom jose import jwt

import bcryptimport bcrypt

from jose import jwt

from app.main import app

from app.main import appfrom app.core.database import get_database

from app.core.database import get_databasefrom app.models.auth import UserOut, LoginResponse

from app.models.user import User, UserCreatefrom app.core.config import settings

from app.core.config import settings

from app.auth.jwt import create_access_token# Test data

TEST_USER = {

# Mark all tests as async    "email": "test@example.com",

pytestmark = pytest.mark.asyncio    "password": "secretPassword123!",

    "roles": ["business_user"]

# Test data}

TEST_USERS = {

    "existing": {TEST_ADMIN = {

        "email": "test@example.com",    "email": "admin@example.com",

        "password": "TestPass123!",    "password": "adminPass123!",

        "hashed_password": bcrypt.hashpw("TestPass123!".encode(), bcrypt.gensalt()).decode(),    "roles": ["business_user", "admin"]

        "roles": ["business_user"],}

        "failed_attempts": 0,

        "created_at": datetime.utcnow()@pytest_asyncio.fixture(scope="function")

    },async def mock_db():

    "admin": {    """Create a mock MongoDB database using mongomock-motor"""

        "email": "admin@example.com",    client = mongomock_motor.AsyncMongoMockClient()

        "password": "AdminPass123!",    db = client.test_db

        "hashed_password": bcrypt.hashpw("AdminPass123!".encode(), bcrypt.gensalt()).decode(),    

        "roles": ["business_user", "admin"],    async def get_test_db():

        "failed_attempts": 0,        return db

        "created_at": datetime.utcnow()    

    }    # Store original dependency

}    original_get_db = app.dependency_overrides.get(get_database)

    

NEW_USER_DATA = {    # Override the database dependency

    "email": "new@test.com",    app.dependency_overrides[get_database] = get_test_db

    "password": "NewPass123!",    

    "roles": ["compliance_officer"]    yield db

}    

    # Cleanup

@pytest_asyncio.fixture(autouse=True)    await db.users.delete_many({})

async def mock_db():    

    """Setup mock database with test users"""    # Restore original dependency

    from mongomock_motor import AsyncMongoMockClient    if original_get_db:

    client = AsyncMongoMockClient()        app.dependency_overrides[get_database] = original_get_db

    db = client.test_db    else:

            del app.dependency_overrides[get_database]

    # Insert test users

    for user_data in TEST_USERS.values():@pytest_asyncio.fixture(scope="function")

        await db.users.insert_one(user_data)async def test_client(mock_db):

        """Create a test client with a mocked database"""

    return db    async with AsyncClient(app=app, base_url="http://test") as ac:

        yield ac

@pytest_asyncio.fixture

async def test_client(mock_db):@pytest.mark.asyncio

    """Create test client with mocked database"""async def test_register_success(test_client, mock_db):

    app.dependency_overrides[get_database] = lambda: mock_db    """Test successful user registration"""

        response = await test_client.post(

    async with AsyncClient(app=app, base_url="http://test") as client:        "/auth/register",

        yield client        json=TEST_USER

        )

    # Clear overrides after test    

    app.dependency_overrides.clear()    assert response.status_code == status.HTTP_201_CREATED

    user_out = UserOut(**response.json())

@pytest.mark.asyncio    assert user_out.email == TEST_USER["email"]

async def test_register_valid(test_client, mock_db):    assert user_out.roles == TEST_USER["roles"]

    """Test successful user registration"""    assert "hashed_password" not in response.json()

    response = await test_client.post(    

        "/auth/register",    # Verify DB insert

        json=NEW_USER_DATA    db_user = await mock_db.users.find_one({"email": TEST_USER["email"]})

    )    assert db_user is not None

        assert bcrypt.checkpw(

    assert response.status_code == status.HTTP_201_CREATED        TEST_USER["password"].encode(),

            db_user["hashed_password"].encode()

    # Verify response format    )

    user_data = response.json()

    assert user_data["email"] == NEW_USER_DATA["email"]@pytest.mark.asyncio

    assert set(user_data["roles"]) == set(["business_user", "compliance_officer"])async def test_register_duplicate_email(test_client, mock_db):

    assert "hashed_password" not in user_data    """Test registration with duplicate email"""

        # First registration

    # Verify database insert    await test_client.post("/auth/register", json=TEST_USER)

    db_user = await mock_db.users.find_one({"email": NEW_USER_DATA["email"]})    

    assert db_user is not None    # Duplicate registration

    assert bcrypt.checkpw(    response = await test_client.post("/auth/register", json=TEST_USER)

        NEW_USER_DATA["password"].encode(),    assert response.status_code == status.HTTP_400_BAD_REQUEST

        db_user["hashed_password"].encode()    assert "already registered" in response.json()["detail"].lower()

    )

@pytest.mark.asyncio

@pytest.mark.asyncioasync def test_login_success(test_client, mock_db):

async def test_register_duplicate(test_client, mock_db):    """Test successful login"""

    """Test registration with duplicate email"""    # Register user first

    response = await test_client.post(    await test_client.post("/auth/register", json=TEST_USER)

        "/auth/register",    

        json={    # Login

            "email": TEST_USERS["existing"]["email"],    response = await test_client.post(

            "password": "DifferentPass123!"        "/auth/login",

        }        json={

    )            "email": TEST_USER["email"],

                "password": TEST_USER["password"]

    assert response.status_code == status.HTTP_400_BAD_REQUEST        }

    assert "already registered" in response.json()["detail"].lower()    )

        

    # Verify no new insert    assert response.status_code == status.HTTP_200_OK

    users_count = await mock_db.users.count_documents({})    login_response = LoginResponse(**response.json())

    assert users_count == len(TEST_USERS)    

    # Verify token

@pytest.mark.asyncio    payload = jwt.decode(

async def test_register_invalid(test_client):        login_response.access_token,

    """Test registration with invalid data"""        settings.JWT_SECRET_KEY,

    invalid_data = [        algorithms=[settings.JWT_ALGORITHM]

        {"email": "not-an-email", "password": "ValidPass123!"},  # Invalid email    )

        {"email": "valid@test.com", "password": "short"},  # Invalid password    assert payload["sub"] == TEST_USER["email"]

        {"email": "valid@test.com", "password": "nouppercasepass1!"},  # No uppercase    

        {"email": "valid@test.com", "password": "NOLOWERCASE123!"},  # No lowercase    # Check failed attempts reset

        {"email": "valid@test.com", "password": "NoNumbers!"},  # No numbers    db_user = await mock_db.users.find_one({"email": TEST_USER["email"]})

        {"email": "valid@test.com", "password": "NoSpecialChars123"}  # No special chars    assert db_user["failed_attempts"] == 0

    ]    assert "last_login" in db_user

    

    for data in invalid_data:@pytest.mark.asyncio

        response = await test_client.post("/auth/register", json=data)async def test_login_wrong_password(test_client, mock_db):

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY    """Test login with wrong password"""

        errors = response.json()["detail"]    # Register user first

        assert len(errors) > 0    await test_client.post("/auth/register", json=TEST_USER)

    

@pytest.mark.asyncio    # Login with wrong password

async def test_login_valid(test_client, mock_db):    response = await test_client.post(

    """Test successful login"""        "/auth/login",

    user_data = TEST_USERS["existing"]        json={

    response = await test_client.post(            "email": TEST_USER["email"],

        "/auth/login",            "password": "wrongpassword"

        json={        }

            "email": user_data["email"],    )

            "password": user_data["password"]    

        }    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    )    assert "invalid credentials" in response.json()["detail"].lower()

        

    assert response.status_code == status.HTTP_200_OK    # Check failed attempts increment

    data = response.json()    db_user = await mock_db.users.find_one({"email": TEST_USER["email"]})

        assert db_user["failed_attempts"] == 1

    # Verify token

    assert "access_token" in data@pytest.mark.asyncio

    token_payload = jwt.decode(async def test_login_validation_error(test_client):

        data["access_token"],    """Test login with invalid JSON"""

        settings.JWT_SECRET_KEY,    response = await test_client.post(

        algorithms=[settings.JWT_ALGORITHM]        "/auth/login",

    )        json={

    assert token_payload["sub"] == user_data["email"]            "email": "notanemail",  # Invalid email format

    assert token_payload["roles"] == user_data["roles"]            "password": ""  # Empty password

            }

    # Verify user data    )

    assert data["user"]["email"] == user_data["email"]    

    assert "hashed_password" not in data["user"]    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        errors = response.json()["detail"]

    # Verify last_login updated and failed_attempts reset    assert any("email" in error["loc"] for error in errors)

    db_user = await mock_db.users.find_one({"email": user_data["email"]})    assert any("password" in error["loc"] for error in errors)

    assert db_user["last_login"] is not None

    assert db_user["failed_attempts"] == 0@pytest.mark.asyncio

async def test_register_with_compliance_role(test_client, mock_db):

@pytest.mark.asyncio    """Test registration with compliance officer role"""

async def test_login_invalid_password(test_client, mock_db):    compliance_user = {

    """Test login with wrong password"""        "email": "compliance@example.com",

    user_data = TEST_USERS["existing"]        "password": "CompliancePass123!",

    response = await test_client.post(        "roles": ["business_user", "compliance_officer"]

        "/auth/login",    }

        json={    

            "email": user_data["email"],    response = await test_client.post(

            "password": "WrongPass123!"        "/auth/register",

        }        json=compliance_user

    )    )

        

    assert response.status_code == status.HTTP_401_UNAUTHORIZED    assert response.status_code == status.HTTP_201_CREATED

    assert "invalid credentials" in response.json()["detail"].lower()    user_out = UserOut(**response.json())

        assert "compliance_officer" in user_out.roles

    # Verify failed_attempts incremented    assert "business_user" in user_out.roles  # Base role always included

    db_user = await mock_db.users.find_one({"email": user_data["email"]})
    assert db_user["failed_attempts"] == 1

@pytest.mark.asyncio
async def test_login_nonexistent(test_client, mock_db):
    """Test login with non-existent email"""
    response = await test_client.post(
        "/auth/login",
        json={
            "email": "nonexistent@test.com",
            "password": "AnyPass123!"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "invalid credentials" in response.json()["detail"].lower()
    
    # Verify no failed_attempts record created
    user = await mock_db.users.find_one({"email": "nonexistent@test.com"})
    assert user is None

@pytest.mark.asyncio
async def test_register_invalid_json(test_client):
    """Test registration with invalid JSON"""
    response = await test_client.post(
        "/auth/register",
        json={"invalid": "data"}  # Missing required fields
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

@pytest.mark.asyncio
async def test_login_invalid_json(test_client):
    """Test login with invalid JSON"""
    response = await test_client.post(
        "/auth/login",
        json={"invalid": "data"}  # Missing required fields
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY