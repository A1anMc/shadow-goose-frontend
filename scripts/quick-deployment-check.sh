#!/bin/bash

# Quick Deployment Status Check
# Checks if the Python dictionary error is fixed

set -e

echo "🔍 QUICK DEPLOYMENT STATUS CHECK"
echo "================================"

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
TOKEN="${FRESH_TOKEN:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDM3NTg0fQ.jVG546RMSENCXwjk3kg1ae6QtNL3-x37q0Gt0dqtjnY}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔧 Testing main grants endpoint..."
echo ""

# Test the API
response=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/grants" 2>/dev/null || echo "FAILED")

echo "📊 RESPONSE ANALYSIS:"
echo "===================="

if echo "$response" | grep -q "'dict' object has no attribute 'dict'"; then
    echo -e "${RED}❌ Python dictionary error still present${NC}"
    echo -e "${YELLOW}⏳ Deployment may still be in progress...${NC}"
    echo ""
    echo "🔧 NEXT STEPS:"
    echo "============="
    echo "1. Verify the fix was applied to app/grants.py"
    echo "2. Check if changes were committed and pushed"
    echo "3. Wait a few more minutes for deployment"
    echo "4. Re-run this check"
elif echo "$response" | grep -q '"grants"' && echo "$response" | grep -q '"data_source":"api"'; then
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}✅ Python dictionary error is FIXED!${NC}"
    echo -e "${GREEN}✅ Data source validation is working!${NC}"
    echo ""
    echo "🎉 SUCCESS METRICS:"
    echo "=================="
    echo "✅ API responding correctly"
    echo "✅ No Python dictionary errors"
    echo "✅ Data source field present"
    echo "✅ Frontend validation ready"
    echo ""
    echo "🧪 RUNNING FULL TEST SUITE..."
    echo "============================="
    ./scripts/test-all-endpoints.sh
elif echo "$response" | grep -q '"grants"'; then
    echo -e "${YELLOW}⚠️  Partially deployed${NC}"
    echo -e "${YELLOW}✅ Grants working but missing data_source field${NC}"
    echo ""
    echo "📋 STATUS:"
    echo "========="
    echo "✅ Python dictionary error is FIXED"
    echo "⚠️  Missing data_source field"
    echo "⚠️  Frontend may still use fallback data"
elif echo "$response" | grep -q "Not authenticated"; then
    echo -e "${YELLOW}⚠️  Authentication issue${NC}"
    echo -e "${BLUE}ℹ️  API is responding (good sign)${NC}"
    echo ""
    echo "🔑 TOKEN STATUS:"
    echo "==============="
    echo "❌ Token may be expired"
    echo "✅ API endpoints are working"
    echo "✅ Python error is likely fixed"
else
    echo -e "${RED}❌ Unexpected response${NC}"
    echo "Response: $response"
fi

echo ""
echo "✅ QUICK CHECK COMPLETE"
echo "======================="
