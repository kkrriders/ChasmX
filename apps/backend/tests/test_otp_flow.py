"""Test script for OTP flow."""

import asyncio
import aiohttp
import json
from datetime import datetime

async def test_otp_flow():
    """Test the complete OTP authentication flow."""
    base_url = "http://localhost:8080"
    async with aiohttp.ClientSession() as session:
        # 1. Register a new user
        register_data = {
            "email": "test@example.com",
            "password": "TestPass123!",
            "roles": ["business_user"]
        }
        
        print("\n1. Registering new user...")
        async with session.post(
            f"{base_url}/auth/register",
            json=register_data
        ) as response:
            print(f"Register Status: {response.status}")
            result = await response.json()
            print(f"Register Response: {json.dumps(result, indent=2)}")
            
        # 2. Login to get OTP
        login_data = {
            "email": "test@example.com",
            "password": "TestPass123!"
        }
        
        print("\n2. Logging in to get OTP...")
        async with session.post(
            f"{base_url}/auth/login",
            json=login_data
        ) as response:
            print(f"Login Status: {response.status}")
            result = await response.json()
            print(f"Login Response: {json.dumps(result, indent=2)}")
            
            if response.status == 200:
                print("\nOTP has been sent to your email. Check your inbox.")
                otp = input("Enter the OTP you received: ")
                
                # 3. Verify OTP
                verify_data = {
                    "email": "test@example.com",
                    "otp": otp
                }
                
                print("\n3. Verifying OTP...")
                async with session.post(
                    f"{base_url}/auth/verify-otp",
                    json=verify_data
                ) as response:
                    print(f"Verify Status: {response.status}")
                    result = await response.json()
                    print(f"Verify Response: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    asyncio.run(test_otp_flow())