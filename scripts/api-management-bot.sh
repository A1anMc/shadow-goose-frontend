#!/bin/bash

# API MANAGEMENT BOT
# Manages and monitors all APIs and scrapers
# Responsible for API health, data quality, and scraper performance

set -e

# Configuration
BACKEND_URL="https://shadow-goose-api.onrender.com"
FRONTEND_URL="https://shadow-goose-frontend.onrender.com"
LOG_FILE="api-management.log"
REPORT_FILE="api-management-report.txt"
ALERT_FILE="api-alerts.txt"

# API Endpoints to monitor
declare -a API_ENDPOINTS=(
    "/api/grants"
    "/api/health"
    "/api/users"
    "/api/applications"
    "/api/analytics"
)

# External APIs to monitor
declare -a EXTERNAL_APIS=(
    "https://api.creative.gov.au"
    "https://api.vicscreen.vic.gov.au"
    "https://api.screenaustralia.gov.au"
)

# Scraper endpoints
declare -a SCRAPER_ENDPOINTS=(
    "/api/scrapers/grants"
    "/api/scrapers/creative-australia"
    "/api/scrapers/vicscreen"
    "/api/scrapers/screen-australia"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "🤖 API MANAGEMENT BOT STARTED - $TIMESTAMP" | tee -a $LOG_FILE
echo "==================================================" | tee -a $LOG_FILE

# Initialize files
cat > $REPORT_FILE << EOF
API MANAGEMENT REPORT
Generated: $TIMESTAMP
==================================================

EOF

cat > $ALERT_FILE << EOF
API ALERTS
Generated: $TIMESTAMP
==================================================

EOF

# Function to log with timestamp
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a $LOG_FILE
}

# Function to log results
log_result() {
    local status=$1
    local component=$2
    local message=$3
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $status in
        "PASS")
            echo -e "${GREEN}✅ $component: $message${NC}" | tee -a $LOG_FILE
            echo "[$timestamp] ✅ $component: $message" >> $REPORT_FILE
            ;;
        "FAIL")
            echo -e "${RED}❌ $component: $message${NC}" | tee -a $LOG_FILE
            echo "[$timestamp] ❌ $component: $message" >> $REPORT_FILE
            echo "[$timestamp] ALERT: $component - $message" >> $ALERT_FILE
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $component: $message${NC}" | tee -a $LOG_FILE
            echo "[$timestamp] ⚠️  $component: $message" >> $REPORT_FILE
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $component: $message${NC}" | tee -a $LOG_FILE
            echo "[$timestamp] ℹ️  $component: $message" >> $REPORT_FILE
            ;;
    esac
}

# Function to get authentication token
get_auth_token() {
    log "INFO" "Getting authentication token..."
    
    local auth_response=$(curl -s -X POST "$BACKEND_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username": "test", "password": "test"}' 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        log "FAIL" "Authentication failed"
        return 1
    fi
    
    local token=$(echo "$auth_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        log "FAIL" "No auth token received"
        return 1
    fi
    
    echo "$token"
    log "INFO" "Authentication successful"
}

# Function to check API endpoint health
check_api_endpoint() {
    local endpoint=$1
    local token=$2
    local component=$3
    
    log "INFO" "Checking $component API endpoint: $endpoint"
    
    local start_time=$(date +%s)
    local response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $token" \
        "$BACKEND_URL$endpoint" 2>/dev/null)
    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))
    
    local http_code="${response: -3}"
    local response_body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        if [ "$response_time" -lt 5 ]; then
            log_result "PASS" "$component" "API responding (${response_time}s)"
        else
            log_result "WARN" "$component" "API slow (${response_time}s)"
        fi
        return 0
    else
        log_result "FAIL" "$component" "HTTP $http_code - API not responding"
        return 1
    fi
}

# Function to check external API health
check_external_api() {
    local url=$1
    local component=$2
    
    log "INFO" "Checking external API: $component"
    
    local start_time=$(date +%s)
    local response=$(curl -s -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
        if [ "$response_time" -lt 10 ]; then
            log_result "PASS" "$component" "External API accessible (${response_time}s)"
        else
            log_result "WARN" "$component" "External API slow (${response_time}s)"
        fi
        return 0
    else
        log_result "FAIL" "$component" "HTTP $http_code - External API not accessible"
        return 1
    fi
}

# Function to check scraper health
check_scraper() {
    local endpoint=$1
    local token=$2
    local component=$3
    
    log "INFO" "Checking scraper: $component"
    
    local response=$(curl -s -H "Authorization: Bearer $token" \
        "$BACKEND_URL$endpoint/status" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        # Check if scraper is running
        if echo "$response" | grep -q '"status":"running"'; then
            log_result "PASS" "$component" "Scraper running"
            return 0
        elif echo "$response" | grep -q '"status":"idle"'; then
            log_result "WARN" "$component" "Scraper idle"
            return 0
        else
            log_result "FAIL" "$component" "Scraper not responding"
            return 1
        fi
    else
        log_result "FAIL" "$component" "Scraper endpoint not accessible"
        return 1
    fi
}

# Function to check data quality
check_data_quality() {
    local token=$1
    
    log "INFO" "Checking data quality..."
    
    # Get grants data
    local grants_response=$(curl -s -H "Authorization: Bearer $token" \
        "$BACKEND_URL/api/grants" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$grants_response" ]; then
        # Check for required fields
        local grant_count=$(echo "$grants_response" | grep -o '"id"' | wc -l)
        local title_count=$(echo "$grants_response" | grep -o '"title"' | wc -l)
        local amount_count=$(echo "$grants_response" | grep -o '"amount"' | wc -l)
        
        if [ "$grant_count" -gt 0 ] && [ "$title_count" -gt 0 ] && [ "$amount_count" -gt 0 ]; then
            log_result "PASS" "Data Quality" "Grants data structure valid ($grant_count grants)"
            
            # Check for test data patterns
            if echo "$grants_response" | grep -q "test.*data\|mock.*data\|fake.*data"; then
                log_result "FAIL" "Data Quality" "Test data detected in grants"
                return 1
            else
                log_result "PASS" "Data Quality" "No test data detected"
            fi
        else
            log_result "FAIL" "Data Quality" "Invalid grants data structure"
            return 1
        fi
    else
        log_result "FAIL" "Data Quality" "Cannot fetch grants data"
        return 1
    fi
}

# Function to check API rate limits
check_rate_limits() {
    local token=$1
    
    log "INFO" "Checking API rate limits..."
    
    # Make multiple rapid requests to test rate limiting
    local success_count=0
    local total_requests=5
    
    for i in {1..5}; do
        local response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $token" \
            "$BACKEND_URL/api/grants" 2>/dev/null)
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            ((success_count++))
        fi
        
        sleep 0.5
    done
    
    local success_rate=$((success_count * 100 / total_requests))
    
    if [ "$success_rate" -ge 80 ]; then
        log_result "PASS" "Rate Limits" "API handling load well ($success_rate% success)"
    else
        log_result "WARN" "Rate Limits" "API rate limiting detected ($success_rate% success)"
    fi
}

# Function to restart failed services
restart_service() {
    local service=$1
    
    log "INFO" "Attempting to restart $service..."
    
    # This would typically trigger a deployment or service restart
    # For now, we'll log the attempt
    log_result "INFO" "Service Management" "Restart requested for $service"
    
    # In a real implementation, this might:
    # - Trigger a GitHub Action to redeploy
    # - Send a webhook to restart the service
    # - Call a management API
}

# Function to generate API management summary
generate_summary() {
    echo "" | tee -a $LOG_FILE
    echo "📊 API MANAGEMENT SUMMARY" | tee -a $LOG_FILE
    echo "=========================" | tee -a $LOG_FILE
    
    local total_checks=$(grep -c "✅\|❌\|⚠️" $REPORT_FILE)
    local passed=$(grep -c "✅" $REPORT_FILE)
    local failed=$(grep -c "❌" $REPORT_FILE)
    local warnings=$(grep -c "⚠️" $REPORT_FILE)
    
    echo "Total API Checks: $total_checks" | tee -a $LOG_FILE
    echo "Passed: $passed" | tee -a $LOG_FILE
    echo "Failed: $failed" | tee -a $LOG_FILE
    echo "Warnings: $warnings" | tee -a $LOG_FILE
    
    echo "" >> $REPORT_FILE
    echo "API MANAGEMENT SUMMARY" >> $REPORT_FILE
    echo "======================" >> $REPORT_FILE
    echo "Total API Checks: $total_checks" >> $REPORT_FILE
    echo "Passed: $passed" >> $REPORT_FILE
    echo "Failed: $failed" >> $REPORT_FILE
    echo "Warnings: $warnings" >> $REPORT_FILE
    
    # Check for critical failures
    if [ "$failed" -gt 0 ]; then
        echo -e "${RED}🚨 CRITICAL API ISSUES DETECTED${NC}" | tee -a $LOG_FILE
        echo "🚨 CRITICAL API ISSUES DETECTED" >> $REPORT_FILE
        
        # List failed services
        echo "Failed services:" | tee -a $LOG_FILE
        grep "❌" $REPORT_FILE | tail -5 | tee -a $LOG_FILE
        
        # Attempt to restart failed services
        echo "Attempting to restart failed services..." | tee -a $LOG_FILE
        grep "❌" $REPORT_FILE | while read line; do
            service=$(echo "$line" | cut -d':' -f2 | xargs)
            restart_service "$service"
        done
        
        exit 1
    else
        echo -e "${GREEN}🎉 ALL APIs OPERATIONAL${NC}" | tee -a $LOG_FILE
        echo "🎉 ALL APIs OPERATIONAL" >> $REPORT_FILE
        exit 0
    fi
}

# Function to manage scrapers
manage_scrapers() {
    local token=$1
    
    log "INFO" "Managing scrapers..."
    
    for scraper in "${SCRAPER_ENDPOINTS[@]}"; do
        local component=$(basename "$scraper")
        
        # Check scraper status
        if check_scraper "$scraper" "$token" "$component"; then
            # If scraper is idle, try to start it
            local status_response=$(curl -s -H "Authorization: Bearer $token" \
                "$BACKEND_URL$scraper/status" 2>/dev/null)
            
            if echo "$status_response" | grep -q '"status":"idle"'; then
                log "INFO" "Starting idle scraper: $component"
                
                # Start the scraper
                local start_response=$(curl -s -X POST -H "Authorization: Bearer $token" \
                    "$BACKEND_URL$scraper/start" 2>/dev/null)
                
                if [ $? -eq 0 ]; then
                    log_result "PASS" "$component" "Scraper started successfully"
                else
                    log_result "FAIL" "$component" "Failed to start scraper"
                fi
            fi
        fi
    done
}

# Main API management sequence
main() {
    log "INFO" "Starting comprehensive API management..."
    
    # Get authentication token
    local token=$(get_auth_token)
    if [ $? -ne 0 ]; then
        log "FAIL" "Cannot proceed without authentication"
        exit 1
    fi
    
    # Check internal API endpoints
    log "INFO" "Checking internal API endpoints..."
    for endpoint in "${API_ENDPOINTS[@]}"; do
        local component=$(basename "$endpoint")
        check_api_endpoint "$endpoint" "$token" "$component"
    done
    
    # Check external APIs
    log "INFO" "Checking external APIs..."
    for api in "${EXTERNAL_APIS[@]}"; do
        local component=$(basename "$api")
        check_external_api "$api" "$component"
    done
    
    # Check scrapers
    log "INFO" "Checking scrapers..."
    for scraper in "${SCRAPER_ENDPOINTS[@]}"; do
        local component=$(basename "$scraper")
        check_scraper "$scraper" "$token" "$component"
    done
    
    # Check data quality
    check_data_quality "$token"
    
    # Check rate limits
    check_rate_limits "$token"
    
    # Manage scrapers
    manage_scrapers "$token"
    
    # Generate summary
    generate_summary
}

# Run the API management bot
main "$@"
