#!/bin/bash

# 🧪 END-TO-END GRANT APPLICATION FLOW TEST
# ==========================================

echo "🧪 END-TO-END GRANT APPLICATION FLOW TEST"
echo "=========================================="
echo "Date: $(date)"
echo ""

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
FRONTEND_URL="https://sge-enhanced-dashboard.onrender.com"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDU2ODg5fQ.-E9edxbXl6de68Hb524OEsx0vGV628uUfC08XiYDHIE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"

    echo -e "${BLUE}🔍 Testing: $test_name${NC}"

    if eval "$test_command" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# 1. Backend Health Check
echo "📊 1. BACKEND HEALTH CHECK"
echo "=========================="
run_test "Backend Health" \
    "curl -s '$API_URL/health'" \
    '"status"'

# 2. Authentication Test
echo "🔐 2. AUTHENTICATION TEST"
echo "========================"
run_test "Token Validation" \
    "curl -s -H 'Authorization: Bearer $TOKEN' '$API_URL/auth/user'" \
    '"username"'

# 3. Grants API Test
echo "💰 3. GRANTS API TEST"
echo "===================="
run_test "Get All Grants" \
    "curl -s -H 'Authorization: Bearer $TOKEN' '$API_URL/api/grants'" \
    '"grants"'

run_test "Grant Search" \
    "curl -s -X POST -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"keywords\": \"creative\"}' '$API_URL/api/grants/search'" \
    '"total_results"'

# 4. Grant Applications Test
echo "📝 4. GRANT APPLICATIONS TEST"
echo "============================="
run_test "Get Applications" \
    "curl -s -H 'Authorization: Bearer $TOKEN' '$API_URL/api/grant-applications'" \
    '"applications"'

# 5. Frontend Accessibility Test
echo "🌐 5. FRONTEND ACCESSIBILITY TEST"
echo "================================"
run_test "Frontend Homepage" \
    "curl -s '$FRONTEND_URL'" \
    "Shadow Goose Entertainment"

run_test "Frontend Grants Page" \
    "curl -s '$FRONTEND_URL/grants'" \
    "DOCTYPE html"

# 6. API Endpoints Test
echo "🔗 6. API ENDPOINTS TEST"
echo "======================="
run_test "OpenAPI Documentation" \
    "curl -s '$API_URL/docs'" \
    "Swagger UI"

run_test "API Endpoints List" \
    "curl -s -H 'Authorization: Bearer $TOKEN' '$API_URL/openapi.json'" \
    '"paths"'

# 7. Data Pipeline Test
echo "🔄 7. DATA PIPELINE TEST"
echo "======================="
run_test "Grants Categories" \
    "curl -s -H 'Authorization: Bearer $TOKEN' '$API_URL/api/grants/categories'" \
    '"categories"'

run_test "Grant Recommendations" \
    "curl -s -H 'Authorization: Bearer $TOKEN' '$API_URL/api/grants/recommendations'" \
    '"recommendations"'

# 8. Success Metrics Test
echo "📈 8. SUCCESS METRICS TEST"
echo "=========================="
run_test "System Metrics" \
    "curl -s '$API_URL/metrics'" \
    "http_requests_total"

# Summary
echo "📊 TEST SUMMARY"
echo "==============="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! End-to-end flow is operational.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
