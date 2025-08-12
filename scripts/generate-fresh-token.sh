#!/bin/bash

# Generate Fresh Authentication Token Script
# This script helps create a new JWT token for testing the fixed API

set -e

echo "🔑 GENERATING FRESH AUTHENTICATION TOKEN"
echo "========================================"

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
LOGIN_ENDPOINT="/auth/login"

echo "📋 TOKEN GENERATION OPTIONS:"
echo "============================"
echo "1. Use test credentials (if available)"
echo "2. Use your actual login credentials"
echo "3. Check if there's a token endpoint"
echo ""

echo "🔍 CHECKING AVAILABLE AUTH ENDPOINTS:"
echo "====================================="

# Check if login endpoint exists
echo "Testing login endpoint..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$LOGIN_ENDPOINT" 2>/dev/null || echo "404")

if [ "$LOGIN_STATUS" = "405" ]; then
    echo "✅ Login endpoint exists (POST method required)"
elif [ "$LOGIN_STATUS" = "404" ]; then
    echo "❌ Login endpoint not found"
else
    echo "ℹ️  Login endpoint status: $LOGIN_STATUS"
fi

echo ""
echo "🧪 TESTING TOKEN GENERATION:"
echo "============================"

# Try to generate a token with test credentials
echo "Attempting to generate token with test credentials..."

# Test with common test credentials
TEST_CREDENTIALS='{"username": "test", "password": "test"}'
TOKEN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$TEST_CREDENTIALS" \
    "$API_URL$LOGIN_ENDPOINT" 2>/dev/null || echo "FAILED")

if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Token generated successfully!"
    TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "Token: $TOKEN"
    echo ""
    echo "📋 SAVE THIS TOKEN FOR TESTING:"
    echo "==============================="
    echo "export FRESH_TOKEN=\"$TOKEN\""
    echo ""
    echo "🧪 TEST COMMANDS:"
    echo "================="
    echo "curl -H \"Authorization: Bearer $TOKEN\" \"$API_URL/api/grants\""
    echo "curl -X POST -H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\" -d '{\"keywords\":\"documentary\"}' \"$API_URL/api/grants/search\""
else
    echo "❌ Token generation failed"
    echo "Response: $TOKEN_RESPONSE"
    echo ""
    echo "📋 MANUAL TOKEN GENERATION:"
    echo "==========================="
    echo "1. Go to your application login page"
    echo "2. Login with your credentials"
    echo "3. Check browser dev tools -> Network tab"
    echo "4. Look for the login request and copy the token"
    echo "5. Use the token in your test commands"
fi

echo ""
echo "🔧 ALTERNATIVE TOKEN SOURCES:"
echo "============================="
echo "1. Check browser localStorage for 'sge_auth_token'"
echo "2. Check if there's a /auth/refresh endpoint"
echo "3. Check if there's a /auth/register endpoint"
echo "4. Look for environment variables in your deployment"

echo ""
echo "✅ TOKEN GENERATION SCRIPT COMPLETE"
echo "==================================="
