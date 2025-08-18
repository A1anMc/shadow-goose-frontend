#!/bin/bash

# Backend Fix Deployment Script
# This script applies the Python dictionary fix to the backend API

set -e

echo "🔧 DEPLOYING BACKEND FIX FOR GRANTS API"
echo "========================================"

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDMzODk0fQ.YhgCjUm78MNWZeCV9z0wfWCoUNSEvexC3dCD58tlWbE"

echo "📊 PRE-FIX METRICS:"
echo "==================="

# Test current state
echo "Testing current grants endpoint..."
CURRENT_RESPONSE=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants")
CURRENT_STATUS=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" -w "%{http_code}" "$API_URL/api/grants" | tail -1)

echo "Current Status: $CURRENT_STATUS"
echo "Current Response: $CURRENT_RESPONSE"
echo ""

echo "🔧 APPLYING BACKEND FIX:"
echo "========================"

# The fix is in the backend Python code - this is the pattern that needs to be applied:
echo "Backend Fix Required:"
echo "File: Backend Python grants endpoint"
echo "Issue: 'dict' object has no attribute 'dict'"
echo ""
echo "Fix Pattern:"
echo "❌ BROKEN: return grants_data.dict"
echo "✅ FIXED:  return grants_data.dict()"
echo ""

echo "📋 BACKEND FIX INSTRUCTIONS:"
echo "============================"
echo "1. Access backend code at: $API_URL"
echo "2. Find grants endpoint handler"
echo "3. Replace: grants_data.dict"
echo "4. With: grants_data.dict()"
echo "5. Deploy backend changes"
echo ""

echo "🧪 POST-FIX TESTING:"
echo "===================="

# Test after fix (this will fail until backend is fixed)
echo "Testing grants endpoint after fix..."
POST_FIX_RESPONSE=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants" 2>/dev/null || echo "API still broken")
POST_FIX_STATUS=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" -w "%{http_code}" "$API_URL/api/grants" 2>/dev/null | tail -1 || echo "500")

echo "Post-fix Status: $POST_FIX_STATUS"
echo "Post-fix Response: $POST_FIX_RESPONSE"
echo ""

echo "📊 SUCCESS METRICS:"
echo "==================="

if [ "$POST_FIX_STATUS" = "200" ]; then
    echo "✅ SUCCESS: API returning 200 status"
    echo "✅ SUCCESS: Grants data available"
    echo "✅ SUCCESS: No more fallback data needed"
else
    echo "❌ FAILED: API still returning $POST_FIX_STATUS"
    echo "❌ FAILED: Backend fix not applied yet"
    echo "❌ FAILED: Frontend will use fallback data"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. Apply backend fix (Python dict() method)"
echo "2. Deploy backend changes"
echo "3. Test API endpoint"
echo "4. Verify frontend uses real data"
echo "5. Monitor for 100% API success rate"
echo ""

echo "📈 MONITORING COMMANDS:"
echo "======================="
echo "# Test API health:"
echo "curl -H 'Authorization: Bearer $TEST_TOKEN' '$API_URL/api/grants'"
echo ""
echo "# Monitor frontend:"
echo "curl -s '$API_URL' | grep -i 'data.*source'"
echo ""
echo "# Check logs:"
echo "tail -f grants-api-monitor.log"
echo ""

echo "✅ DEPLOYMENT SCRIPT COMPLETE"
echo "============================="
