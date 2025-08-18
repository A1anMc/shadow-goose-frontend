#!/bin/bash

# SYSTEM MONITORING BOT
# Monitors all environments and reports issues

set -e

# Configuration
FRONTEND_URL="https://shadow-goose-frontend.onrender.com"
BACKEND_URL="https://shadow-goose-api.onrender.com"
REPORT_FILE="system-monitor-report.txt"
LOG_FILE="system-monitor.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "🤖 SYSTEM MONITORING BOT STARTED - $TIMESTAMP" | tee -a $LOG_FILE
echo "==================================================" | tee -a $LOG_FILE

# Initialize report
cat > $REPORT_FILE << EOF
SYSTEM MONITORING REPORT
Generated: $TIMESTAMP
==================================================

EOF

# Function to log results
log_result() {
    local status=$1
    local component=$2
    local message=$3
    
    case $status in
        "PASS")
            echo -e "${GREEN}✅ $component: $message${NC}" | tee -a $LOG_FILE
            echo "✅ $component: $message" >> $REPORT_FILE
            ;;
        "FAIL")
            echo -e "${RED}❌ $component: $message${NC}" | tee -a $LOG_FILE
            echo "❌ $component: $message" >> $REPORT_FILE
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $component: $message${NC}" | tee -a $LOG_FILE
            echo "⚠️  $component: $message" >> $REPORT_FILE
            ;;
    esac
}

# Function to check URL health
check_url() {
    local url=$1
    local component=$2
    
    echo -e "${BLUE}🔍 Checking $component...${NC}"
    
    if curl -s -f --max-time 10 "$url" > /dev/null 2>&1; then
        log_result "PASS" "$component" "URL accessible"
        return 0
    else
        log_result "FAIL" "$component" "URL not accessible"
        return 1
    fi
}

# Function to check API endpoints
check_api() {
    local endpoint=$1
    local component=$2
    
    echo -e "${BLUE}🔍 Checking $component API...${NC}"
    
    # Get auth token first
    local auth_response=$(curl -s -X POST "$BACKEND_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username": "test", "password": "test"}' 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        log_result "FAIL" "$component" "Authentication failed"
        return 1
    fi
    
    local token=$(echo "$auth_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        log_result "FAIL" "$component" "No auth token received"
        return 1
    fi
    
    # Test the endpoint
    local response=$(curl -s -H "Authorization: Bearer $token" "$BACKEND_URL$endpoint" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        log_result "PASS" "$component" "API responding"
        return 0
    else
        log_result "FAIL" "$component" "API not responding"
        return 1
    fi
}

# Function to check for test data
check_test_data() {
    echo -e "${BLUE}🔍 Checking for test data violations...${NC}"
    
    # Check frontend for hardcoded test data
    local frontend_content=$(curl -s "$FRONTEND_URL" 2>/dev/null)
    
    if echo "$frontend_content" | grep -q "51.*Active Users\|19.*Applications\|109.*Predictions\|85\.6.*Success"; then
        log_result "FAIL" "Test Data" "Hardcoded test data found in frontend"
        return 1
    else
        log_result "PASS" "Test Data" "No hardcoded test data found"
        return 0
    fi
}

# Function to check grants system
check_grants() {
    echo -e "${BLUE}🔍 Checking grants system...${NC}"
    
    # Get auth token
    local auth_response=$(curl -s -X POST "$BACKEND_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username": "test", "password": "test"}' 2>/dev/null)
    
    local token=$(echo "$auth_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        log_result "FAIL" "Grants System" "Cannot authenticate for grants check"
        return 1
    fi
    
    # Check grants endpoint
    local grants_response=$(curl -s -H "Authorization: Bearer $token" "$BACKEND_URL/api/grants" 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$grants_response" | grep -q '"grants"'; then
        local grant_count=$(echo "$grants_response" | grep -o '"grants"' | wc -l)
        if [ "$grant_count" -gt 0 ]; then
            log_result "PASS" "Grants System" "Grants API working ($grant_count grants available)"
            return 0
        else
            log_result "WARN" "Grants System" "Grants API responding but no grants found"
            return 0
        fi
    else
        log_result "FAIL" "Grants System" "Grants API not responding"
        return 1
    fi
}

# Function to check deployment status
check_deployment() {
    echo -e "${BLUE}🔍 Checking deployment status...${NC}"
    
    # Check if frontend is accessible
    if check_url "$FRONTEND_URL" "Frontend Deployment"; then
        log_result "PASS" "Deployment" "Frontend deployed and accessible"
    else
        log_result "FAIL" "Deployment" "Frontend deployment failed"
        return 1
    fi
    
    # Check if backend is accessible
    if check_url "$BACKEND_URL" "Backend Deployment"; then
        log_result "PASS" "Deployment" "Backend deployed and accessible"
    else
        log_result "FAIL" "Deployment" "Backend deployment failed"
        return 1
    fi
}

# Function to generate summary
generate_summary() {
    echo "" | tee -a $LOG_FILE
    echo "📊 MONITORING SUMMARY" | tee -a $LOG_FILE
    echo "=====================" | tee -a $LOG_FILE
    
    local total_checks=$(grep -c "✅\|❌\|⚠️" $REPORT_FILE)
    local passed=$(grep -c "✅" $REPORT_FILE)
    local failed=$(grep -c "❌" $REPORT_FILE)
    local warnings=$(grep -c "⚠️" $REPORT_FILE)
    
    echo "Total Checks: $total_checks" | tee -a $LOG_FILE
    echo "Passed: $passed" | tee -a $LOG_FILE
    echo "Failed: $failed" | tee -a $LOG_FILE
    echo "Warnings: $warnings" | tee -a $LOG_FILE
    
    echo "" >> $REPORT_FILE
    echo "SUMMARY" >> $REPORT_FILE
    echo "=======" >> $REPORT_FILE
    echo "Total Checks: $total_checks" >> $REPORT_FILE
    echo "Passed: $passed" >> $REPORT_FILE
    echo "Failed: $failed" >> $REPORT_FILE
    echo "Warnings: $warnings" >> $REPORT_FILE
    
    if [ "$failed" -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL SYSTEMS OPERATIONAL${NC}" | tee -a $LOG_FILE
        echo "🎉 ALL SYSTEMS OPERATIONAL" >> $REPORT_FILE
        exit 0
    else
        echo -e "${RED}🚨 CRITICAL ISSUES DETECTED${NC}" | tee -a $LOG_FILE
        echo "🚨 CRITICAL ISSUES DETECTED" >> $REPORT_FILE
        exit 1
    fi
}

# Main monitoring sequence
main() {
    echo "Starting comprehensive system check..." | tee -a $LOG_FILE
    
    # Check deployments
    check_deployment
    
    # Check API endpoints
    check_api "/api/grants" "Grants API"
    check_api "/health" "Health API"
    
    # Check for test data violations
    check_test_data
    
    # Check grants system specifically
    check_grants
    
    # Generate summary
    generate_summary
}

# Run the monitoring
main "$@"
