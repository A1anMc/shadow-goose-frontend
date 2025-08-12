#!/bin/bash

# Deployment Monitoring Script
# Monitors the backend deployment and tests when complete

set -e

echo "📊 MONITORING BACKEND DEPLOYMENT"
echo "================================"

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
TOKEN="${FRESH_TOKEN:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDM3MTU3fQ.B5upejmDj-y2wFbl-pdtqUa5RJQSUWD2ibhmBLflxzM}"
CHECK_INTERVAL=30  # Check every 30 seconds
MAX_CHECKS=20      # Maximum 10 minutes of monitoring

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔧 DEPLOYMENT STATUS:"
echo "===================="
echo "API URL: $API_URL"
echo "Check Interval: $CHECK_INTERVAL seconds"
echo "Max Duration: $((CHECK_INTERVAL * MAX_CHECKS / 60)) minutes"
echo ""

# Function to test the API
test_api() {
    local response=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/grants" 2>/dev/null || echo "FAILED")
    echo "$response"
}

# Function to check deployment status
check_deployment() {
    local check_number=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo -e "${BLUE}[$timestamp] Check #$check_number - Testing API...${NC}"

    local response=$(test_api)

    if echo "$response" | grep -q "'dict' object has no attribute 'dict'"; then
        echo -e "${YELLOW}⏳ Still deploying... (Python error still present)${NC}"
        return 1
    elif echo "$response" | grep -q '"grants"' && echo "$response" | grep -q '"data_source":"api"'; then
        echo -e "${GREEN}✅ DEPLOYMENT COMPLETE! API is working correctly!${NC}"
        echo -e "${GREEN}✅ Python dictionary error is FIXED!${NC}"
        echo -e "${GREEN}✅ Data source validation is working!${NC}"
        return 0
    elif echo "$response" | grep -q '"grants"'; then
        echo -e "${YELLOW}⚠️  Partially deployed... (Grants working but missing data_source)${NC}"
        return 2
    elif echo "$response" | grep -q "Token expired"; then
        echo -e "${YELLOW}⚠️  Token expired, but API is responding (good sign)${NC}"
        return 3
    else
        echo -e "${RED}❌ Unexpected response: $response${NC}"
        return 4
    fi
}

echo "🚀 STARTING DEPLOYMENT MONITORING..."
echo "===================================="

for i in $(seq 1 $MAX_CHECKS); do
    if check_deployment $i; then
        echo ""
        echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
        echo "================================"
        echo "✅ Python dictionary error is FIXED"
        echo "✅ API endpoints are working"
        echo "✅ Data source validation is active"
        echo ""
        echo "🧪 RUNNING FULL TEST SUITE..."
        echo "============================="
        ./scripts/test-all-endpoints.sh
        exit 0
    fi

    if [ $i -lt $MAX_CHECKS ]; then
        echo -e "${BLUE}Waiting $CHECK_INTERVAL seconds before next check...${NC}"
        sleep $CHECK_INTERVAL
    fi
done

echo ""
echo -e "${RED}⏰ DEPLOYMENT MONITORING TIMEOUT${NC}"
echo "====================================="
echo "❌ Deployment may still be in progress"
echo "❌ Check Render dashboard for deployment status"
echo "❌ Manual verification may be needed"
echo ""
echo "🔧 MANUAL VERIFICATION COMMANDS:"
echo "================================"
echo "curl -H \"Authorization: Bearer \$FRESH_TOKEN\" \"$API_URL/api/grants\""
echo "./scripts/test-all-endpoints.sh"

exit 1
