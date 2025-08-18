#!/bin/bash

# API Contract Validation Script
# This script validates that TypeScript interfaces match actual API responses

set -e

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
TS_INTERFACE_FILE="src/lib/types/grants.ts"

echo "🔍 API Contract Validation"
echo "=========================="

# 1. Get authentication token
echo "1. Getting authentication token..."
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}')

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get authentication token"
    exit 1
fi

echo "✅ Authentication successful"

# 2. Fetch actual API response
echo "2. Fetching API response..."
API_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/grants")

# Check if we got a valid response
if [ -z "$API_RESPONSE" ]; then
    echo "❌ No response from API"
    exit 1
fi

# 3. Extract field names from API response
echo "3. Extracting field names from API response..."
ACTUAL_FIELDS=$(echo "$API_RESPONSE" | jq -r '.grants[0] | keys[]' | sort)

if [ -z "$ACTUAL_FIELDS" ]; then
    echo "❌ No fields found in API response"
    exit 1
fi

echo "API fields found:"
echo "$ACTUAL_FIELDS" | sed 's/^/  - /'

# 4. Extract field names from TypeScript interface
echo "4. Extracting field names from TypeScript interface..."
TS_FIELDS=$(grep -A 50 "export interface Grant" "$TS_INTERFACE_FILE" | grep -o '[a-zA-Z_][a-zA-Z0-9_]*:' | sed 's/://' | grep -v "^[A-Z]" | sort | uniq)

if [ -z "$TS_FIELDS" ]; then
    echo "❌ No fields found in TypeScript interface"
    exit 1
fi

echo "TypeScript fields found:"
echo "$TS_FIELDS" | sed 's/^/  - /'

# 5. Compare and report mismatches
echo "5. Comparing fields..."

# Find fields in API but not in TypeScript
MISSING_IN_TS=$(comm -23 <(echo "$ACTUAL_FIELDS") <(echo "$TS_FIELDS"))

# Find fields in TypeScript but not in API
MISSING_IN_API=$(comm -13 <(echo "$ACTUAL_FIELDS") <(echo "$TS_FIELDS"))

# Report results
if [ -n "$MISSING_IN_TS" ]; then
    echo "❌ FIELDS IN API BUT MISSING IN TYPESCRIPT:"
    echo "$MISSING_IN_TS" | sed 's/^/  - /'
    echo ""
fi

if [ -n "$MISSING_IN_API" ]; then
    echo "⚠️ FIELDS IN TYPESCRIPT BUT NOT IN API:"
    echo "$MISSING_IN_API" | sed 's/^/  - /'
    echo ""
fi

if [ -z "$MISSING_IN_TS" ] && [ -z "$MISSING_IN_API" ]; then
    echo "✅ PERFECT MATCH! All fields align"
    exit 0
elif [ -z "$MISSING_IN_TS" ]; then
    echo "✅ API CONTRACT VALID - All API fields are defined in TypeScript"
    exit 0
else
    echo "❌ API CONTRACT MISMATCH - Fix TypeScript interface to match API"
    exit 1
fi
