#!/bin/bash

# Project Manager Monitoring Script
# This script runs all validation checks and provides a comprehensive report

set -e

echo "🔍 Running Project Manager Validation..."
echo "========================================"
echo ""

# Initialize status variables
CONTRACT_STATUS=0
TYPE_STATUS=0
INTEGRATION_STATUS=0
HEALTH_STATUS=0

# 1. API Contract Validation
echo "1. API Contract Validation..."
echo "----------------------------"
if ./scripts/validate-api-contract.sh; then
    echo "✅ API Contract: PASSED"
    CONTRACT_STATUS=0
else
    echo "❌ API Contract: FAILED"
    CONTRACT_STATUS=1
fi
echo ""

# 2. Type Safety Validation
echo "2. Type Safety Validation..."
echo "---------------------------"
if ./scripts/validate-type-safety.sh; then
    echo "✅ Type Safety: PASSED"
    TYPE_STATUS=0
else
    echo "❌ Type Safety: FAILED"
    TYPE_STATUS=1
fi
echo ""

# 3. TypeScript Compilation
echo "3. TypeScript Compilation..."
echo "---------------------------"
if npm run typecheck > /dev/null 2>&1; then
    echo "✅ TypeScript: PASSED (0 errors)"
    TS_STATUS=0
else
    echo "❌ TypeScript: FAILED"
    echo "Running typecheck to show errors:"
    npm run typecheck
    TS_STATUS=1
fi
echo ""

# 4. Build Validation
echo "4. Build Validation..."
echo "--------------------"
if npm run build > /dev/null 2>&1; then
    echo "✅ Build: PASSED"
    BUILD_STATUS=0
else
    echo "❌ Build: FAILED"
    echo "Running build to show errors:"
    npm run build
    BUILD_STATUS=1
fi
echo ""

# 5. Integration Test (Basic)
echo "5. Integration Test..."
echo "--------------------"
# Test authentication
AUTH_RESPONSE=$(curl -s -X POST "https://shadow-goose-api.onrender.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}')

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    # Test grants API
    GRANTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "https://shadow-goose-api.onrender.com/api/grants")
    GRANTS_COUNT=$(echo "$GRANTS_RESPONSE" | jq '.grants | length')
    
    if [ "$GRANTS_COUNT" -gt 0 ]; then
        echo "✅ Integration: PASSED ($GRANTS_COUNT grants available)"
        INTEGRATION_STATUS=0
    else
        echo "❌ Integration: FAILED (No grants returned)"
        INTEGRATION_STATUS=1
    fi
else
    echo "❌ Integration: FAILED (Authentication failed)"
    INTEGRATION_STATUS=1
fi
echo ""

# Summary Report
echo "📊 VALIDATION SUMMARY"
echo "===================="
echo "API Contract: $([ $CONTRACT_STATUS -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
echo "Type Safety:  $([ $TYPE_STATUS -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
echo "TypeScript:   $([ $TS_STATUS -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
echo "Build:        $([ $BUILD_STATUS -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
echo "Integration:  $([ $INTEGRATION_STATUS -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')"
echo ""

# Overall status
TOTAL_FAILURES=$((CONTRACT_STATUS + TYPE_STATUS + TS_STATUS + BUILD_STATUS + INTEGRATION_STATUS))

if [ $TOTAL_FAILURES -eq 0 ]; then
    echo "🎉 ALL SYSTEMS HEALTHY - READY FOR DEPLOYMENT"
    echo ""
    echo "✅ No issues detected"
    echo "✅ All validations passed"
    echo "✅ System is production-ready"
    exit 0
else
    echo "🚨 ISSUES DETECTED - FIX BEFORE DEPLOYMENT"
    echo ""
    echo "❌ $TOTAL_FAILURES validation(s) failed"
    echo "❌ System is NOT ready for deployment"
    echo "❌ Review and fix the issues above"
    exit 1
fi
