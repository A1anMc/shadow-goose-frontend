#!/bin/bash

# SGE Enhanced Dashboard - Automated Deployment Monitor
# Monitors deployment status, CSS loading, and content rendering

set -e

# Configuration
URL="https://sge-enhanced-dashboard.onrender.com/dashboard"
CSS_URL="https://sge-enhanced-dashboard.onrender.com/_next/static/css"
EXPECTED_BUILD_ID=""
MAX_RETRIES=30
RETRY_INTERVAL=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if URL is accessible
check_url_accessibility() {
    log "Checking URL accessibility..."
    if curl -s -f "$URL" > /dev/null; then
        success "URL is accessible"
        return 0
    else
        error "URL is not accessible"
        return 1
    fi
}

# Get current build ID
get_build_id() {
    local build_id=$(curl -s "$URL" | grep -o 'buildId":"[^"]*"' | cut -d'"' -f3)
    echo "$build_id"
}

# Check if build has been updated
check_build_update() {
    local current_build_id=$(get_build_id)
    log "Current build ID: $current_build_id"
    
    if [ "$current_build_id" != "$EXPECTED_BUILD_ID" ]; then
        success "Build updated to: $current_build_id"
        EXPECTED_BUILD_ID="$current_build_id"
        return 0
    else
        warning "Build not yet updated (still: $current_build_id)"
        return 1
    fi
}

# Check CSS loading
check_css_loading() {
    log "Checking CSS loading..."
    
    # Get CSS file from HTML
    local css_file=$(curl -s "$URL" | grep -o 'href="/_next/static/css/[^"]*"' | head -1 | cut -d'"' -f2)
    
    if [ -n "$css_file" ]; then
        local css_url="https://sge-enhanced-dashboard.onrender.com$css_file"
        log "CSS file: $css_url"
        
        if curl -s -f "$css_url" > /dev/null; then
            success "CSS file is accessible"
            
            # Check for SGE custom classes
            local sge_classes=$(curl -s "$css_url" | grep -c "bg-sg-background" || echo "0")
            if [ "$sge_classes" -gt 0 ]; then
                success "SGE custom classes found in CSS"
                return 0
            else
                error "SGE custom classes not found in CSS"
                return 1
            fi
        else
            error "CSS file is not accessible"
            return 1
        fi
    else
        error "CSS file not found in HTML"
        return 1
    fi
}

# Check content rendering
check_content_rendering() {
    log "Checking content rendering..."
    
    local html_content=$(curl -s "$URL")
    
    # Check for key elements
    local checks=(
        "bg-sg-background"
        "text-sg-primary"
        "bg-sg-primary"
        "bg-sg-accent"
        "grid grid-cols"
        "Total Projects"
        "Instant Analytics"
        "Grant Management"
        "OKR Management"
    )
    
    local failed_checks=0
    
    for check in "${checks[@]}"; do
        if echo "$html_content" | grep -q "$check"; then
            success "✓ Found: $check"
        else
            error "✗ Missing: $check"
            ((failed_checks++))
        fi
    done
    
    if [ $failed_checks -eq 0 ]; then
        success "All content elements are present"
        return 0
    else
        error "$failed_checks content elements are missing"
        return 1
    fi
}

# Check performance metrics
check_performance() {
    log "Checking performance metrics..."
    
    local start_time=$(date +%s)
    local response_time=$(curl -s -w "%{time_total}" -o /dev/null "$URL")
    local end_time=$(date +%s)
    
    log "Response time: ${response_time}s"
    
    if (( $(echo "$response_time < 3.0" | bc -l) )); then
        success "Response time is acceptable (< 3s)"
        return 0
    else
        warning "Response time is slow (> 3s): ${response_time}s"
        return 1
    fi
}

# Main monitoring function
monitor_deployment() {
    log "Starting deployment monitoring..."
    log "URL: $URL"
    log "Max retries: $MAX_RETRIES"
    log "Retry interval: ${RETRY_INTERVAL}s"
    
    local retry_count=0
    local build_updated=false
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "Attempt $((retry_count + 1))/$MAX_RETRIES"
        
        # Check URL accessibility
        if ! check_url_accessibility; then
            error "URL not accessible, retrying..."
            sleep $RETRY_INTERVAL
            ((retry_count++))
            continue
        fi
        
        # Check build update
        if check_build_update; then
            build_updated=true
        fi
        
        # If build is updated, check everything else
        if [ "$build_updated" = true ]; then
            log "Build updated, checking full deployment..."
            
            local all_checks_passed=true
            
            # Check CSS loading
            if ! check_css_loading; then
                all_checks_passed=false
            fi
            
            # Check content rendering
            if ! check_content_rendering; then
                all_checks_passed=false
            fi
            
            # Check performance
            if ! check_performance; then
                all_checks_passed=false
            fi
            
            if [ "$all_checks_passed" = true ]; then
                success "🎉 DEPLOYMENT SUCCESSFUL!"
                success "All checks passed - Dashboard is fully operational"
                return 0
            else
                warning "Some checks failed, but build is updated"
                log "Continuing to monitor for improvements..."
            fi
        fi
        
        sleep $RETRY_INTERVAL
        ((retry_count++))
    done
    
    error "❌ DEPLOYMENT MONITORING TIMEOUT"
    error "Maximum retries reached without successful deployment"
    return 1
}

# Health check function
health_check() {
    log "Running health check..."
    
    local status=0
    
    check_url_accessibility || status=1
    check_css_loading || status=1
    check_content_rendering || status=1
    check_performance || status=1
    
    if [ $status -eq 0 ]; then
        success "Health check passed - Dashboard is healthy"
    else
        error "Health check failed - Dashboard has issues"
    fi
    
    return $status
}

# Main execution
case "${1:-monitor}" in
    "monitor")
        monitor_deployment
        ;;
    "health")
        health_check
        ;;
    "build-id")
        get_build_id
        ;;
    *)
        echo "Usage: $0 [monitor|health|build-id]"
        echo "  monitor   - Monitor deployment progress"
        echo "  health    - Run health check"
        echo "  build-id  - Get current build ID"
        exit 1
        ;;
esac
