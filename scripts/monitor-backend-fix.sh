#!/bin/bash

# Monitor Backend Fix Progress
# Tracks the status while RulesEngine fix is being applied

set -e

echo "🔍 MONITORING BACKEND FIX PROGRESS"
echo "=================================="
echo "Target: Fix RulesEngine get_all_rules() method"
echo "Goal: Change status from 'degraded' to 'ok'"
echo ""

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
LOG_FILE="backend-fix-monitor.log"

# Function to log results
log_result() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check status
check_status() {
    local status=$(curl -s "$API_URL/health" 2>/dev/null | jq -r '.status' 2>/dev/null || echo "ERROR")
    local rules_engine=$(curl -s "$API_URL/health" 2>/dev/null | jq -r '.checks.rules_engine' 2>/dev/null || echo "ERROR")
    local rules_error=$(curl -s "$API_URL/health" 2>/dev/null | jq -r '.dependencies.rules_error' 2>/dev/null || echo "ERROR")

    echo "📊 STATUS CHECK - $(date '+%H:%M:%S')"
    echo "=================="
    echo "Overall Status: $status"
    echo "Rules Engine: $rules_engine"
    echo "Rules Error: $rules_error"
    echo ""

    # Log the check
    log_result "STATUS: $status, RULES_ENGINE: $rules_engine, ERROR: $rules_error"

    # Check for success
    if [ "$status" = "ok" ] && [ "$rules_engine" = "healthy" ]; then
        echo "🎉 SUCCESS: Backend fix completed!"
        echo "✅ Overall Status: $status"
        echo "✅ Rules Engine: $rules_engine"
        echo "✅ No more errors"
        log_result "SUCCESS: Fix completed - Status: $status, Rules Engine: $rules_engine"
        return 0
    elif [ "$status" = "ERROR" ] || [ "$rules_engine" = "ERROR" ]; then
        echo "❌ ERROR: Cannot connect to backend"
        echo "   Check if deployment is in progress"
        log_result "ERROR: Cannot connect to backend"
        return 1
    else
        echo "⏳ WAITING: Fix still in progress..."
        echo "   Current: $status (target: ok)"
        echo "   Rules Engine: $rules_engine (target: healthy)"
        log_result "WAITING: Status $status, Rules Engine $rules_engine"
        return 2
    fi
}

# Main monitoring loop
echo "🚀 STARTING MONITORING..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
    check_status
    result=$?

    if [ $result -eq 0 ]; then
        echo "✅ FIX COMPLETED SUCCESSFULLY!"
        echo "🎉 Backend is now fully operational"
        break
    elif [ $result -eq 1 ]; then
        echo "⚠️  Connection error - retrying in 30 seconds..."
        sleep 30
    else
        echo "⏳ Waiting 60 seconds before next check..."
        sleep 60
    fi
done

echo ""
echo "📈 MONITORING COMPLETE"
echo "======================"
echo "Log saved to: $LOG_FILE"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Verify all endpoints are working"
echo "2. Test grants API functionality"
echo "3. Run full health check: ./scripts/check-backend-health.sh"
