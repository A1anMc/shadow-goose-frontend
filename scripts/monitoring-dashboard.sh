#!/bin/bash

# COMPREHENSIVE MONITORING DASHBOARD
# Runs all monitoring bots and displays unified results

set -e

# Configuration
DASHBOARD_LOG="monitoring-dashboard.log"
DASHBOARD_REPORT="monitoring-dashboard-report.txt"
ALERT_SUMMARY="alert-summary.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "${CYAN}🎛️  COMPREHENSIVE MONITORING DASHBOARD${NC}"
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}Started: $TIMESTAMP${NC}"
echo ""

# Initialize dashboard report
cat > $DASHBOARD_REPORT << EOF
COMPREHENSIVE MONITORING DASHBOARD REPORT
Generated: $TIMESTAMP
==========================================

EOF

# Function to log dashboard events
log_dashboard() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a $DASHBOARD_LOG
}

# Function to display status
display_status() {
    local status=$1
    local message=$2
    
    case $status in
        "RUNNING")
            echo -e "${BLUE}🔄 $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "FAILED")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
    esac
}

# Function to run system monitor
run_system_monitor() {
    echo -e "${PURPLE}🔍 Running System Monitor...${NC}"
    display_status "RUNNING" "System Monitor"
    
    if ./scripts/system-monitor-bot.sh > system-monitor-output.txt 2>&1; then
        display_status "SUCCESS" "System Monitor completed"
        log_dashboard "INFO" "System monitor completed successfully"
        return 0
    else
        display_status "FAILED" "System Monitor failed"
        log_dashboard "ERROR" "System monitor failed"
        return 1
    fi
}

# Function to run API management bot
run_api_management() {
    echo -e "${PURPLE}🔍 Running API Management Bot...${NC}"
    display_status "RUNNING" "API Management Bot"
    
    if ./scripts/api-management-bot.sh > api-management-output.txt 2>&1; then
        display_status "SUCCESS" "API Management Bot completed"
        log_dashboard "INFO" "API management bot completed successfully"
        return 0
    else
        display_status "FAILED" "API Management Bot failed"
        log_dashboard "ERROR" "API management bot failed"
        return 1
    fi
}

# Function to check for test data violations
check_test_data_violations() {
    echo -e "${PURPLE}🔍 Checking for Test Data Violations...${NC}"
    display_status "RUNNING" "Test Data Check"
    
    # Check frontend for test data
    local frontend_content=$(curl -s https://shadow-goose-frontend.onrender.com 2>/dev/null)
    
    if echo "$frontend_content" | grep -q "51.*Active Users\|19.*Applications\|109.*Predictions\|85\.6.*Success"; then
        display_status "FAILED" "Test data violations found"
        log_dashboard "CRITICAL" "Test data violations detected in frontend"
        echo "🚨 TEST DATA VIOLATIONS DETECTED" >> $DASHBOARD_REPORT
        echo "Frontend contains hardcoded test data" >> $DASHBOARD_REPORT
        return 1
    else
        display_status "SUCCESS" "No test data violations"
        log_dashboard "INFO" "No test data violations found"
        return 0
    fi
}

# Function to check grants system
check_grants_system() {
    echo -e "${PURPLE}🔍 Checking Grants System...${NC}"
    display_status "RUNNING" "Grants System Check"
    
    # Get auth token
    local auth_response=$(curl -s -X POST https://shadow-goose-api.onrender.com/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username": "test", "password": "test"}' 2>/dev/null)
    
    local token=$(echo "$auth_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        display_status "FAILED" "Cannot authenticate for grants check"
        log_dashboard "ERROR" "Authentication failed for grants check"
        return 1
    fi
    
    # Check grants endpoint
    local grants_response=$(curl -s -H "Authorization: Bearer $token" \
        https://shadow-goose-api.onrender.com/api/grants 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$grants_response" | grep -q '"grants"'; then
        local grant_count=$(echo "$grants_response" | grep -o '"id"' | wc -l)
        if [ "$grant_count" -gt 0 ]; then
            display_status "SUCCESS" "Grants system working ($grant_count grants)"
            log_dashboard "INFO" "Grants system operational with $grant_count grants"
            return 0
        else
            display_status "WARNING" "Grants API responding but no grants found"
            log_dashboard "WARNING" "Grants API responding but no grants found"
            return 0
        fi
    else
        display_status "FAILED" "Grants system not responding"
        log_dashboard "ERROR" "Grants system not responding"
        return 1
    fi
}

# Function to generate unified summary
generate_unified_summary() {
    echo ""
    echo -e "${CYAN}📊 UNIFIED MONITORING SUMMARY${NC}"
    echo -e "${CYAN}=============================${NC}"
    
    # Count total issues
    local total_alerts=$(grep -c "ALERT\|❌\|FAILED" system-monitor-output.txt api-management-output.txt 2>/dev/null | awk '{sum += $1} END {print sum+0}')
    local total_warnings=$(grep -c "⚠️\|WARNING" system-monitor-output.txt api-management-output.txt 2>/dev/null | awk '{sum += $1} END {print sum+0}')
    local total_success=$(grep -c "✅\|SUCCESS" system-monitor-output.txt api-management-output.txt 2>/dev/null | awk '{sum += $1} END {print sum+0}')
    
    echo "Total Alerts: $total_alerts"
    echo "Total Warnings: $total_warnings"
    echo "Total Success: $total_success"
    
    # Generate alert summary
    cat > $ALERT_SUMMARY << EOF
ALERT SUMMARY
Generated: $TIMESTAMP
==========================================

Total Alerts: $total_alerts
Total Warnings: $total_warnings
Total Success: $total_success

CRITICAL ISSUES:
EOF
    
    # Extract critical issues
    grep -i "alert\|❌\|failed\|critical" system-monitor-output.txt api-management-output.txt 2>/dev/null | head -10 >> $ALERT_SUMMARY || true
    
    echo "" >> $ALERT_SUMMARY
    echo "WARNINGS:" >> $ALERT_SUMMARY
    grep -i "warning\|⚠️" system-monitor-output.txt api-management-output.txt 2>/dev/null | head -5 >> $ALERT_SUMMARY || true
    
    # Display summary
    if [ "$total_alerts" -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL SYSTEMS OPERATIONAL${NC}"
        log_dashboard "SUCCESS" "All systems operational"
        exit 0
    else
        echo -e "${RED}🚨 CRITICAL ISSUES DETECTED${NC}"
        echo "Check $ALERT_SUMMARY for details"
        log_dashboard "CRITICAL" "Critical issues detected - $total_alerts alerts"
        exit 1
    fi
}

# Function to display real-time status
display_real_time_status() {
    echo ""
    echo -e "${CYAN}🔄 REAL-TIME STATUS${NC}"
    echo -e "${CYAN}==================${NC}"
    
    # Frontend status
    if curl -s -f https://shadow-goose-frontend.onrender.com > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: Online${NC}"
    else
        echo -e "${RED}❌ Frontend: Offline${NC}"
    fi
    
    # Backend status
    if curl -s -f https://shadow-goose-api.onrender.com > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: Online${NC}"
    else
        echo -e "${RED}❌ Backend: Offline${NC}"
    fi
    
    # Database connectivity (via API)
    local auth_response=$(curl -s -X POST https://shadow-goose-api.onrender.com/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username": "test", "password": "test"}' 2>/dev/null)
    
    local token=$(echo "$auth_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$token" ]; then
        if curl -s -H "Authorization: Bearer $token" https://shadow-goose-api.onrender.com/api/grants > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Database: Connected${NC}"
        else
            echo -e "${RED}❌ Database: Disconnected${NC}"
        fi
    else
        echo -e "${RED}❌ Database: Cannot verify${NC}"
    fi
}

# Main dashboard sequence
main() {
    log_dashboard "INFO" "Starting comprehensive monitoring dashboard"
    
    echo -e "${CYAN}🎛️  Starting Comprehensive System Check...${NC}"
    echo ""
    
    # Run all monitoring bots
    local system_monitor_result=0
    local api_management_result=0
    local test_data_result=0
    local grants_result=0
    
    run_system_monitor || system_monitor_result=1
    echo ""
    
    run_api_management || api_management_result=1
    echo ""
    
    check_test_data_violations || test_data_result=1
    echo ""
    
    check_grants_system || grants_result=1
    echo ""
    
    # Display real-time status
    display_real_time_status
    
    # Generate unified summary
    generate_unified_summary
    
    # Log final status
    local total_failures=$((system_monitor_result + api_management_result + test_data_result + grants_result))
    
    if [ "$total_failures" -eq 0 ]; then
        log_dashboard "SUCCESS" "All monitoring checks passed"
    else
        log_dashboard "CRITICAL" "Monitoring checks failed - $total_failures failures"
    fi
}

# Run the dashboard
main "$@"
