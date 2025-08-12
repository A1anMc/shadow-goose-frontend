#!/bin/bash

# Backend Health Check Script
# Monitors the shadow-goose-api service for the indentation error fix

set -e

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDMzODk0fQ.YhgCjUm78MNWZeCV9z0wfWCoUNSEvexC3dCD58tlWbE"
LOG_FILE="backend-health-check.log"

echo "🔍 BACKEND HEALTH CHECK - $(date)"
echo "=================================="
echo "API URL: $API_URL"
echo ""

# Function to log results
log_result() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Test 1: Basic Health Endpoint
echo "1. Health Endpoint Check:"
HEALTH_RESPONSE=$(curl -s "$API_URL/health" 2>/dev/null || echo "CONNECTION_FAILED")
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "   ✅ Health: OK ($HEALTH_STATUS)"
    log_result "HEALTH: SUCCESS - Status $HEALTH_STATUS"
else
    echo "   ❌ Health: FAILED ($HEALTH_STATUS)"
    echo "   Response: $HEALTH_RESPONSE"
    log_result "HEALTH: FAILED - Status $HEALTH_STATUS - Response: $HEALTH_RESPONSE"
fi

# Test 2: Grants API Endpoint
echo ""
echo "2. Grants API Check:"
GRANTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants" 2>/dev/null || echo "CONNECTION_FAILED")
GRANTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants" 2>/dev/null || echo "000")

if [ "$GRANTS_STATUS" = "200" ]; then
    echo "   ✅ Grants API: OK ($GRANTS_STATUS)"
    # Check if response contains real data
    if echo "$GRANTS_RESPONSE" | grep -q "Sample Grant Program"; then
        echo "   ⚠️  WARNING: Still using fallback/mock data"
        log_result "GRANTS: SUCCESS but using FALLBACK DATA"
    else
        echo "   ✅ SUCCESS: Using real grants data"
        log_result "GRANTS: SUCCESS with REAL DATA"
    fi
else
    echo "   ❌ Grants API: FAILED ($GRANTS_STATUS)"
    echo "   Response: $GRANTS_RESPONSE"
    log_result "GRANTS: FAILED - Status $GRANTS_STATUS - Response: $GRANTS_RESPONSE"
fi

# Test 3: Indentation Error Check
echo ""
echo "3. Indentation Error Check:"
if echo "$GRANTS_RESPONSE" | grep -q "IndentationError"; then
    echo "   ❌ INDENTATION ERROR DETECTED"
    echo "   Backend needs fix at line 1196 in app/grants.py"
    log_result "ERROR: IndentationError still present"
elif echo "$GRANTS_RESPONSE" | grep -q "unexpected unindent"; then
    echo "   ❌ INDENTATION ERROR DETECTED"
    echo "   Backend needs fix at line 1196 in app/grants.py"
    log_result "ERROR: unexpected unindent still present"
else
    echo "   ✅ No indentation errors detected"
    log_result "SUCCESS: No indentation errors found"
fi

# Test 4: Response Time
echo ""
echo "4. Performance Check:"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants" 2>/dev/null || echo "0")
echo "   ⏱️  Response time: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 2" | bc -l) )); then
    echo "   ✅ Performance: Good (< 2s)"
    log_result "PERFORMANCE: GOOD - ${RESPONSE_TIME}s"
else
    echo "   ⚠️  Performance: Slow (> 2s)"
    log_result "PERFORMANCE: SLOW - ${RESPONSE_TIME}s"
fi

# Overall Status
echo ""
echo "📊 OVERALL STATUS:"
echo "=================="

if [ "$HEALTH_STATUS" = "200" ] && [ "$GRANTS_STATUS" = "200" ]; then
    if echo "$GRANTS_RESPONSE" | grep -q "Sample Grant Program"; then
        echo "🟡 PARTIAL SUCCESS: Backend working but using fallback data"
        echo "   Next step: Ensure real data integration"
        log_result "STATUS: PARTIAL SUCCESS - Backend working, fallback data"
    else
        echo "🎉 FULL SUCCESS: Backend fully operational with real data!"
        echo "   ✅ All endpoints responding"
        echo "   ✅ Real grants data available"
        echo "   ✅ Ready for production use"
        log_result "STATUS: FULL SUCCESS - Backend operational with real data"
    fi
else
    echo "❌ FAILURE: Backend needs attention"
    echo "   🔧 Fix indentation error in app/grants.py line 1196"
    echo "   🔧 Deploy backend changes"
    log_result "STATUS: FAILURE - Backend needs fix"
fi

echo ""
echo "📈 MONITORING COMMANDS:"
echo "======================="
echo "# Continuous monitoring:"
echo "watch -n 30 './scripts/check-backend-health.sh'"
echo ""
echo "# Check logs:"
echo "tail -f $LOG_FILE"
echo ""
echo "# Quick status:"
echo "curl -s '$API_URL/health'"
echo ""

echo "✅ Health check complete - $(date)"
echo "Log saved to: $LOG_FILE"
