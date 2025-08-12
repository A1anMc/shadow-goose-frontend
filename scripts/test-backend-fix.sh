#!/bin/bash

# Backend Fix Validation Script
# Tests all API endpoints after the fix is applied

set -e

echo "🧪 BACKEND FIX VALIDATION SCRIPT"
echo "================================="

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDMzODk0fQ.YhgCjUm78MNWZeCV9z0wfWCoUNSEvexC3dCD58tlWbE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}Testing: $test_name${NC}"

    # Run the test
    local response=$(eval "$test_command" 2>/dev/null || echo "FAILED")
    local http_code=$(echo "$response" | tail -1)
    local response_body=$(echo "$response" | head -n -1)

    # Check if test passed
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED: $test_name (Status: $http_code)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name (Expected: $expected_status, Got: $http_code)${NC}"
        echo "Response: $response_body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

echo "🔍 TESTING ALL API ENDPOINTS"
echo "============================"

# Test 1: Main grants endpoint (should return 200 after fix)
run_test "Main Grants Endpoint" \
    "curl -s -H 'Authorization: Bearer $TEST_TOKEN' -w '%{http_code}' '$API_URL/api/grants'" \
    "200"

# Test 2: Search endpoint (should return 200)
run_test "Search Endpoint" \
    "curl -s -X POST -H 'Authorization: Bearer $TEST_TOKEN' -H 'Content-Type: application/json' -d '{\"keywords\":\"documentary\"}' -w '%{http_code}' '$API_URL/api/grants/search'" \
    "200"

# Test 3: Recommendations endpoint (should return 422 - missing body, but endpoint exists)
run_test "Recommendations Endpoint" \
    "curl -s -X POST -H 'Authorization: Bearer $TEST_TOKEN' -w '%{http_code}' '$API_URL/api/grants/recommendations'" \
    "422"

# Test 4: Categories endpoint (if it exists)
run_test "Categories Endpoint" \
    "curl -s -H 'Authorization: Bearer $TEST_TOKEN' -w '%{http_code}' '$API_URL/api/grants/categories'" \
    "200"

# Test 5: Applications endpoint (if it exists)
run_test "Applications Endpoint" \
    "curl -s -H 'Authorization: Bearer $TEST_TOKEN' -w '%{http_code}' '$API_URL/api/grant-applications'" \
    "200"

echo "📊 VALIDATION RESULTS"
echo "====================="

# Calculate success rate
SUCCESS_RATE=0
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))
fi

echo "Total Tests: $TOTAL_TESTS"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "Success Rate: $SUCCESS_RATE%"

echo ""
echo "🎯 SUCCESS CRITERIA"
echo "==================="

# Check if main grants endpoint is working
MAIN_GRANTS_STATUS=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" -w "%{http_code}" "$API_URL/api/grants" | tail -1)

if [ "$MAIN_GRANTS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ CRITICAL SUCCESS: Main grants endpoint working${NC}"
    echo -e "${GREEN}✅ CRITICAL SUCCESS: Python dictionary error fixed${NC}"
    echo -e "${GREEN}✅ CRITICAL SUCCESS: Real API data accessible${NC}"

    # Test data quality
    GRANTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants")
    if echo "$GRANTS_RESPONSE" | grep -q '"grants"' && echo "$GRANTS_RESPONSE" | grep -q '"data_source"' && echo "$GRANTS_RESPONSE" | grep -q '"api"'; then
        echo -e "${GREEN}✅ DATA QUALITY: Valid grants data structure${NC}"
        echo -e "${GREEN}✅ DATA QUALITY: API data source confirmed${NC}"
    else
        echo -e "${YELLOW}⚠️  DATA QUALITY: Response structure needs verification${NC}"
    fi
else
    echo -e "${RED}❌ CRITICAL FAILURE: Main grants endpoint still broken${NC}"
    echo -e "${RED}❌ CRITICAL FAILURE: Python dictionary error not fixed${NC}"
    echo -e "${RED}❌ CRITICAL FAILURE: Backend fix not applied${NC}"
fi

echo ""
echo "📈 NEXT STEPS"
echo "============="

if [ "$MAIN_GRANTS_STATUS" = "200" ]; then
    echo "1. ✅ Backend fix successful"
    echo "2. 🔄 Update frontend to use real API data"
    echo "3. 🧪 Test complete user workflow"
    echo "4. 📊 Monitor API performance for 24 hours"
    echo "5. 📝 Update documentation"
else
    echo "1. ❌ Backend fix not applied yet"
    echo "2. 🔧 Apply Python dictionary fix to backend"
    echo "3. 🚀 Deploy backend changes"
    echo "4. 🧪 Re-run this validation script"
    echo "5. 📊 Monitor until 100% success rate"
fi

echo ""
echo "🔧 BACKEND FIX INSTRUCTIONS"
echo "==========================="
echo "File: Backend Python grants endpoint handler"
echo "Issue: 'dict' object has no attribute 'dict'"
echo ""
echo "Find this line in the backend code:"
echo "❌ return grants_data.dict"
echo ""
echo "Replace with:"
echo "✅ return grants_data.dict()"
echo ""
echo "Deploy the changes and re-run this script."

echo ""
echo "✅ VALIDATION SCRIPT COMPLETE"
echo "============================="
