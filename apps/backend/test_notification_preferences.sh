#!/bin/bash

# Notification Preferences API Test Script
# This script tests the new notification preferences endpoints

BASE_URL="http://localhost:8000"
EMAIL="test@example.com"
PASSWORD="TestPass123!"

echo "🧪 Testing Notification Preferences API"
echo "========================================"

# Step 1: Register user (may already exist)
echo ""
echo "📝 Step 1: Registering test user..."
REGISTER_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "roles": ["business_user"]
  }')

REGISTER_STATUS="${REGISTER_RESPONSE: -3}"
echo "Registration Status: $REGISTER_STATUS"

# Step 2: Login to get OTP
echo ""
echo "🔐 Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Step 3: Verify OTP (using development default)
echo ""
echo "🔑 Step 3: Verifying OTP..."
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "otp_code": "123456"
  }')

echo "Verify Response: $VERIFY_RESPONSE"

# Extract token (basic parsing - would need jq for robust parsing)
TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get access token"
    exit 1
fi

echo "✅ Got access token: ${TOKEN:0:20}..."

# Step 4: Test GET notification preferences
echo ""
echo "📋 Step 4: Getting notification preferences..."
GET_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/users/me/preferences/notifications" \
  -H "Authorization: Bearer $TOKEN")

GET_STATUS="${GET_RESPONSE: -3}"
GET_BODY="${GET_RESPONSE%???}"

echo "GET Status: $GET_STATUS"
echo "GET Response: $GET_BODY"

# Step 5: Test PUT notification preferences
echo ""
echo "📝 Step 5: Updating notification preferences..."
PUT_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/users/me/preferences/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_notifications": false,
    "workflow_alerts": true,
    "security_alerts": true,
    "marketing_updates": true
  }')

PUT_STATUS="${PUT_RESPONSE: -3}"
PUT_BODY="${PUT_RESPONSE%???}"

echo "PUT Status: $PUT_STATUS"
echo "PUT Response: $PUT_BODY"

# Step 6: Verify the update
echo ""
echo "🔍 Step 6: Verifying the update..."
VERIFY_GET_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/users/me/preferences/notifications" \
  -H "Authorization: Bearer $TOKEN")

VERIFY_GET_STATUS="${VERIFY_GET_RESPONSE: -3}"
VERIFY_GET_BODY="${VERIFY_GET_RESPONSE%???}"

echo "Verify GET Status: $VERIFY_GET_STATUS"
echo "Verify GET Response: $VERIFY_GET_BODY"

echo ""
echo "🎉 Test completed!"
echo "========================================"