#!/bin/bash

# Grants API Monitoring Bot
# Continuously monitors API health, data quality, and performance
# Ensures 100% real data with no fallbacks

set -e

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
FRONTEND_URL="https://sge-enhanced-dashboard.onrender.com"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDMzODk0fQ.YhgCjUm78MNWZeCV9z0wfWCoUNSEvexC3dCD58tlWbE"
LOG_FILE="grants-api-monitor.log"
ALERT_FILE="grants-api-alerts.log"
CHECK_INTERVAL=300  # 5 minutes
MAX_RESPONSE_TIME=2.0  # 2 seconds
MIN_SUCCESS_RATE=95  # 95%

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize monitoring
echo "🤖 GRANTS API MONITORING BOT STARTED"
echo "====================================="
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Check Interval: $CHECK_INTERVAL seconds"
echo "Max Response Time: $MAX_RESPONSE_TIME seconds"
echo "Min Success Rate: $MIN_SUCCESS_RATE%"
echo "Log File: $LOG_FILE"
echo "Alert File: $ALERT_FILE"
echo ""

# Function to log messages
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to send alert
send_alert() {
    local alert_type=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [ALERT] [$alert_type] $message" | tee -a "$ALERT_FILE"

    # Add visual alert
    case $alert_type in
        "CRITICAL")
            echo -e "${RED}🚨 CRITICAL ALERT: $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  WARNING: $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO: $message${NC}"
            ;;
    esac
}

# Function to test API health
test_api_health() {
    local start_time=$(date +%s.%N)
    local response=$(curl -s -H "Authorization: Bearer $TEST_TOKEN" -w "%{http_code}|%{time_total}" "$API_URL/api/grants" 2>/dev/null)
    local end_time=$(date +%s.%N)

    local http_code=$(echo "$response" | tail -1 | cut -d'|' -f1)
    local response_time=$(echo "$response" | tail -1 | cut -d'|' -f2)
    local response_body=$(echo "$response" | head -n -1)

    echo "$http_code|$response_time|$response_body"
}

# Function to validate data quality
validate_data_quality() {
    local response_body=$1

    # Check if response contains valid JSON
    if ! echo "$response_body" | jq . >/dev/null 2>&1; then
        echo "INVALID_JSON"
        return
    fi

    # Check if response has grants array
    if ! echo "$response_body" | jq -e '.grants' >/dev/null 2>&1; then
        echo "NO_GRANTS_ARRAY"
        return
    fi

    # Check if all grants have data_source === "api"
    local non_api_grants=$(echo "$response_body" | jq -r '.grants[] | select(.data_source != "api") | .id' 2>/dev/null | wc -l)

    if [ "$non_api_grants" -gt 0 ]; then
        echo "NON_API_DATA:$non_api_grants"
        return
    fi

    # Check if grants array is not empty
    local grant_count=$(echo "$response_body" | jq '.grants | length' 2>/dev/null)

    if [ "$grant_count" -eq 0 ]; then
        echo "EMPTY_GRANTS"
        return
    fi

    echo "VALID:$grant_count"
}

# Function to test frontend connection
test_frontend() {
    local response=$(curl -s -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | head -n -1)

    echo "$http_code|$body"
}

# Main monitoring loop
monitor_loop() {
    local success_count=0
    local total_checks=0
    local consecutive_failures=0
    local last_success_time=""

    while true; do
        total_checks=$((total_checks + 1))
        local check_start=$(date '+%Y-%m-%d %H:%M:%S')

        log_message "INFO" "Starting health check #$total_checks"

        # Test API health
        local api_result=$(test_api_health)
        local http_code=$(echo "$api_result" | cut -d'|' -f1)
        local response_time=$(echo "$api_result" | cut -d'|' -f2)
        local response_body=$(echo "$api_result" | cut -d'|' -f3-)

        # Test frontend
        local frontend_result=$(test_frontend)
        local frontend_code=$(echo "$frontend_result" | cut -d'|' -f1)
        local frontend_body=$(echo "$frontend_result" | cut -d'|' -f2-)

        # Analyze results
        local api_status="UNKNOWN"
        local data_quality="UNKNOWN"
        local alert_needed=false

        # Check HTTP status
        if [ "$http_code" = "200" ]; then
            api_status="HEALTHY"
            consecutive_failures=0
            last_success_time=$(date '+%Y-%m-%d %H:%M:%S')

            # Validate data quality
            data_quality=$(validate_data_quality "$response_body")

            case $data_quality in
                "INVALID_JSON")
                    api_status="DEGRADED"
                    alert_needed=true
                    send_alert "WARNING" "API returning invalid JSON"
                    ;;
                "NO_GRANTS_ARRAY")
                    api_status="DEGRADED"
                    alert_needed=true
                    send_alert "WARNING" "API response missing grants array"
                    ;;
                "EMPTY_GRANTS")
                    api_status="DEGRADED"
                    alert_needed=true
                    send_alert "WARNING" "API returning empty grants array"
                    ;;
                "NON_API_DATA"*)
                    api_status="CRITICAL"
                    alert_needed=true
                    local non_api_count=$(echo "$data_quality" | cut -d':' -f2)
                    send_alert "CRITICAL" "Found $non_api_count grants with non-API data source"
                    ;;
                "VALID"*)
                    api_status="HEALTHY"
                    local grant_count=$(echo "$data_quality" | cut -d':' -f2)
                    log_message "INFO" "API healthy with $grant_count grants"
                    ;;
            esac

            # Check response time
            if (( $(echo "$response_time > $MAX_RESPONSE_TIME" | bc -l) )); then
                api_status="DEGRADED"
                alert_needed=true
                send_alert "WARNING" "API response time ($response_time s) exceeds threshold ($MAX_RESPONSE_TIME s)"
            fi

        elif [ "$http_code" = "401" ]; then
            api_status="AUTH_ERROR"
            alert_needed=true
            send_alert "WARNING" "API authentication failed"
        elif [ "$http_code" = "500" ]; then
            api_status="CRITICAL"
            consecutive_failures=$((consecutive_failures + 1))
            alert_needed=true
            send_alert "CRITICAL" "API server error (500) - consecutive failures: $consecutive_failures"
        elif [ "$http_code" = "404" ]; then
            api_status="CRITICAL"
            consecutive_failures=$((consecutive_failures + 1))
            alert_needed=true
            send_alert "CRITICAL" "API endpoint not found (404)"
        else
            api_status="ERROR"
            consecutive_failures=$((consecutive_failures + 1))
            alert_needed=true
            send_alert "WARNING" "API returned unexpected status: $http_code"
        fi

        # Check frontend status
        local frontend_status="UNKNOWN"
        if [ "$frontend_code" = "200" ]; then
            frontend_status="HEALTHY"
        else
            frontend_status="ERROR"
            alert_needed=true
            send_alert "WARNING" "Frontend returned status: $frontend_code"
        fi

        # Update success count
        if [ "$api_status" = "HEALTHY" ] && [ "$data_quality" = "VALID"* ]; then
            success_count=$((success_count + 1))
        fi

        # Calculate success rate
        local success_rate=0
        if [ $total_checks -gt 0 ]; then
            success_rate=$((success_count * 100 / total_checks))
        fi

        # Log results
        log_message "INFO" "Check #$total_checks completed"
        log_message "INFO" "  API Status: $api_status (HTTP: $http_code, Time: ${response_time}s)"
        log_message "INFO" "  Data Quality: $data_quality"
        log_message "INFO" "  Frontend Status: $frontend_status (HTTP: $frontend_code)"
        log_message "INFO" "  Success Rate: $success_count/$total_checks ($success_rate%)"
        log_message "INFO" "  Consecutive Failures: $consecutive_failures"

        # Send alerts for critical issues
        if [ $consecutive_failures -ge 3 ]; then
            send_alert "CRITICAL" "API has failed $consecutive_failures times consecutively"
        fi

        if [ $success_rate -lt $MIN_SUCCESS_RATE ] && [ $total_checks -ge 10 ]; then
            send_alert "WARNING" "Success rate ($success_rate%) below threshold ($MIN_SUCCESS_RATE%)"
        fi

        # Success message for healthy state
        if [ "$api_status" = "HEALTHY" ] && [ "$data_quality" = "VALID"* ]; then
            echo -e "${GREEN}✅ API HEALTHY - Real data confirmed${NC}"
        else
            echo -e "${RED}❌ API ISSUES DETECTED${NC}"
        fi

        echo ""

        # Wait for next check
        sleep $CHECK_INTERVAL
    done
}

# Start monitoring
echo "🚀 Starting monitoring loop..."
monitor_loop
