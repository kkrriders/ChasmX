"""Test authentication flow script."""

import asyncio
import aiohttp
import json

async def test_auth_flow():
    """Test user registration and login."""
    base_url = "http://localhost:8080"
    
    # Test data
    test_user = {
        "email": "testuser@example.com",
        "password": "TestPass123!",
        "roles": ["business_user"]
    }
    
    async with aiohttp.ClientSession() as session:
        # 1. Register new user
        print("\nAttempting to register user...")
        try:
            async with session.post(
                f"{base_url}/auth/register",
                json=test_user
            ) as response:
                print(f"Register Status: {response.status}")
                result = await response.json()
                print(f"Register Response: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return
            
        # 2. Try to login
        print("\nAttempting to login...")
        try:
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            async with session.post(
                f"{base_url}/auth/login",
                json=login_data
            ) as response:
                print(f"Login Status: {response.status}")
                result = await response.json()
                print(f"Login Response: {json.dumps(result, indent=2)}")
        except Exception as e:
            print(f"Login error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())