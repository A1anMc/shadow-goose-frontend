#!/bin/bash

# SGE ML System Testing & Validation Script
# Tests all components of the SGE ML-Enhanced Grant System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS")
            echo -e "${GREEN}✅ PASS${NC}: $message"
            ((PASSED_TESTS++))
            ;;
        "FAIL")
            echo -e "${RED}❌ FAIL${NC}: $message"
            ((FAILED_TESTS++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO${NC}: $message"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  WARN${NC}: $message"
            ;;
        "HEADER")
            echo -e "${PURPLE}🎯 $message${NC}"
            ;;
    esac
    ((TOTAL_TESTS++))
}

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_exit_code=${3:-0}

    print_status "INFO" "Running: $test_name"

    if eval "$test_command" > /dev/null 2>&1; then
        if [ $? -eq $expected_exit_code ]; then
            print_status "PASS" "$test_name"
        else
            print_status "FAIL" "$test_name (expected exit code $expected_exit_code, got $?)"
        fi
    else
        print_status "FAIL" "$test_name"
    fi
}

# Function to check if a file exists
check_file_exists() {
    local file_path=$1
    local description=$2

    if [ -f "$file_path" ]; then
        print_status "PASS" "$description exists: $file_path"
    else
        print_status "FAIL" "$description missing: $file_path"
    fi
}

# Function to check if a directory exists
check_directory_exists() {
    local dir_path=$1
    local description=$2

    if [ -d "$dir_path" ]; then
        print_status "PASS" "$description exists: $dir_path"
    else
        print_status "FAIL" "$description missing: $dir_path"
    fi
}

# Function to validate TypeScript compilation
validate_typescript() {
    print_status "INFO" "Validating TypeScript compilation..."

    if npm run typecheck > /dev/null 2>&1; then
        print_status "PASS" "TypeScript compilation successful"
    else
        print_status "FAIL" "TypeScript compilation failed"
        npm run typecheck
    fi
}

# Function to test SGE ML service
test_sge_ml_service() {
    print_status "INFO" "Testing SGE ML Service..."

    # Check if the service file exists
    check_file_exists "src/lib/services/sge-ml-service.ts" "SGE ML Service"

    # Check if the service exports the required functions
    if grep -q "export.*sgeMLService" src/lib/services/sge-ml-service.ts; then
        print_status "PASS" "SGE ML Service exports singleton instance"
    else
        print_status "FAIL" "SGE ML Service missing singleton export"
    fi

    # Check if the service has the required methods
    local required_methods=("findSGEGrantMatches" "predictSGESuccess" "optimizeSGEContent" "analyzeSGEBusinessMetrics")
    for method in "${required_methods[@]}"; do
        if grep -q "$method" src/lib/services/sge-ml-service.ts; then
            print_status "PASS" "SGE ML Service has method: $method"
        else
            print_status "FAIL" "SGE ML Service missing method: $method"
        fi
    done
}

# Function to test SGE Grant Discovery
test_sge_grant_discovery() {
    print_status "INFO" "Testing SGE Grant Discovery..."

    # Check if the discovery service exists
    check_file_exists "src/lib/services/sge-grant-discovery.ts" "SGE Grant Discovery Service"

    # Check if the discovery engine exports the required functions
    if grep -q "export.*sgeGrantDiscoveryEngine" src/lib/services/sge-grant-discovery.ts; then
        print_status "PASS" "SGE Grant Discovery exports singleton instance"
    else
        print_status "FAIL" "SGE Grant Discovery missing singleton export"
    fi

    # Check if the service has the required methods
    local required_methods=("discoverNewGrants" "searchGrants" "getDiscoveryStats")
    for method in "${required_methods[@]}"; do
        if grep -q "$method" src/lib/services/sge-grant-discovery.ts; then
            print_status "PASS" "SGE Grant Discovery has method: $method"
        else
            print_status "FAIL" "SGE Grant Discovery missing method: $method"
        fi
    done
}

# Function to test SGE Success Prediction
test_sge_success_prediction() {
    print_status "INFO" "Testing SGE Success Prediction..."

    # Check if the prediction service exists
    check_file_exists "src/lib/services/sge-success-prediction.ts" "SGE Success Prediction Service"

    # Check if the prediction engine exports the required functions
    if grep -q "export.*sgeSuccessPredictionEngine" src/lib/services/sge-success-prediction.ts; then
        print_status "PASS" "SGE Success Prediction exports singleton instance"
    else
        print_status "FAIL" "SGE Success Prediction missing singleton export"
    fi

    # Check if the service has the required methods
    local required_methods=("predictApplicationSuccess" "analyzeSuccessTrends" "getPredictionConfidence")
    for method in "${required_methods[@]}"; do
        if grep -q "$method" src/lib/services/sge-success-prediction.ts; then
            print_status "PASS" "SGE Success Prediction has method: $method"
        else
            print_status "FAIL" "SGE Success Prediction missing method: $method"
        fi
    done
}

# Function to test SGE Types
test_sge_types() {
    print_status "INFO" "Testing SGE Type Definitions..."

    # Check if the types file exists
    check_file_exists "src/lib/types/sge-types.ts" "SGE Type Definitions"

    # Check if the required interfaces are defined
    local required_interfaces=("SGEGrant" "SGEApplication" "SGEProfile" "SGEGrantMatch" "SGESuccessPrediction")
    for interface in "${required_interfaces[@]}"; do
        if grep -q "interface $interface" src/lib/types/sge-types.ts; then
            print_status "PASS" "SGE Types has interface: $interface"
        else
            print_status "FAIL" "SGE Types missing interface: $interface"
        fi
    done
}

# Function to test SGE Pages
test_sge_pages() {
    print_status "INFO" "Testing SGE Pages..."

    # Check if the required pages exist
    local required_pages=(
        "pages/sge-dashboard.tsx:SGE Dashboard"
        "pages/sge/grants.tsx:SGE Grants Discovery"
        "pages/sge/applications/success-analysis.tsx:SGE Success Analysis"
        "pages/sge/content-optimization.tsx:SGE Content Optimization"
    )

    for page_info in "${required_pages[@]}"; do
        IFS=':' read -r page_path page_description <<< "$page_info"
        check_file_exists "$page_path" "$page_description"
    done
}

# Function to test SGE Database Schema
test_sge_database() {
    print_status "INFO" "Testing SGE Database Schema..."

    # Check if the schema file exists
    check_file_exists "database/sge-schema.sql" "SGE Database Schema"

    # Check if the required tables are defined
    local required_tables=("sge_grants" "sge_applications" "sge_documents" "sge_team_members" "sge_ml_models")
    for table in "${required_tables[@]}"; do
        if grep -q "CREATE TABLE $table" database/sge-schema.sql; then
            print_status "PASS" "SGE Database has table: $table"
        else
            print_status "FAIL" "SGE Database missing table: $table"
        fi
    done
}

# Function to test SGE Business Requirements
test_sge_business_requirements() {
    print_status "INFO" "Testing SGE Business Requirements..."

    # Check for media focus
    if grep -q "media_type.*documentary\|digital\|community\|multicultural" src/lib/types/sge-types.ts; then
        print_status "PASS" "SGE Types include media focus (documentary, digital, community, multicultural)"
    else
        print_status "FAIL" "SGE Types missing media focus"
    fi

    # Check for cultural representation
    if grep -q "cultural_representation\|cultural_elements" src/lib/types/sge-types.ts; then
        print_status "PASS" "SGE Types include cultural representation"
    else
        print_status "FAIL" "SGE Types missing cultural representation"
    fi

    # Check for social impact
    if grep -q "social_impact\|social_impact_areas" src/lib/types/sge-types.ts; then
        print_status "PASS" "SGE Types include social impact"
    else
        print_status "FAIL" "SGE Types missing social impact"
    fi

    # Check for diversity focus
    if grep -q "diversity_focus" src/lib/types/sge-types.ts; then
        print_status "PASS" "SGE Types include diversity focus"
    else
        print_status "FAIL" "SGE Types missing diversity focus"
    fi
}

# Function to test ML accuracy requirements
test_ml_accuracy() {
    print_status "INFO" "Testing ML Accuracy Requirements..."

    # Check if ML services have accuracy thresholds
    if grep -q "accuracy.*0\.[8-9]" src/lib/services/sge-ml-service.ts; then
        print_status "PASS" "SGE ML Service includes accuracy thresholds"
    else
        print_status "WARN" "SGE ML Service may need accuracy thresholds"
    fi

    if grep -q "confidence.*0\.[8-9]" src/lib/services/sge-success-prediction.ts; then
        print_status "PASS" "SGE Success Prediction includes confidence thresholds"
    else
        print_status "WARN" "SGE Success Prediction may need confidence thresholds"
    fi
}

# Function to test SGE-specific features
test_sge_specific_features() {
    print_status "INFO" "Testing SGE-Specific Features..."

    # Check for SGE profile configuration
    if grep -q "defaultSGEProfile" src/lib/services/sge-ml-service.ts; then
        print_status "PASS" "SGE ML Service includes default SGE profile"
    else
        print_status "FAIL" "SGE ML Service missing default SGE profile"
    fi

    # Check for SGE grant sources
    if grep -q "defaultSGEGrantSources" src/lib/services/sge-grant-discovery.ts; then
        print_status "PASS" "SGE Grant Discovery includes default grant sources"
    else
        print_status "FAIL" "SGE Grant Discovery missing default grant sources"
    fi

    # Check for SGE-specific grant sources
    local sge_sources=("Screen Australia" "Creative Australia" "VicScreen" "Regional Arts Fund")
    for source in "${sge_sources[@]}"; do
        if grep -q "$source" src/lib/services/sge-grant-discovery.ts; then
            print_status "PASS" "SGE Grant Discovery includes source: $source"
        else
            print_status "FAIL" "SGE Grant Discovery missing source: $source"
        fi
    done
}

# Function to run integration tests
run_integration_tests() {
    print_status "INFO" "Running Integration Tests..."

    # Test that all services can be imported without errors
    if npm run build > /dev/null 2>&1; then
        print_status "PASS" "Build successful - all imports working"
    else
        print_status "FAIL" "Build failed - import issues detected"
        npm run build
    fi
}

# Function to generate test report
generate_test_report() {
    print_status "HEADER" "SGE ML System Test Report"
    echo ""
    echo "📊 Test Summary:"
    echo "   Total Tests: $TOTAL_TESTS"
    echo "   Passed: $PASSED_TESTS"
    echo "   Failed: $FAILED_TESTS"
    echo "   Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
    echo ""

    if [ $FAILED_TESTS -eq 0 ]; then
        print_status "PASS" "All tests passed! SGE ML System is ready for deployment."
        exit 0
    else
        print_status "FAIL" "$FAILED_TESTS tests failed. Please fix issues before deployment."
        exit 1
    fi
}

# Main test execution
main() {
    print_status "HEADER" "Starting SGE ML System Testing & Validation"
    echo ""

    # Reset test counters
    TOTAL_TESTS=0
    PASSED_TESTS=0
    FAILED_TESTS=0

    # Run all tests
    validate_typescript
    test_sge_types
    test_sge_ml_service
    test_sge_grant_discovery
    test_sge_success_prediction
    test_sge_pages
    test_sge_database
    test_sge_business_requirements
    test_ml_accuracy
    test_sge_specific_features
    run_integration_tests

    echo ""
    generate_test_report
}

# Run main function
main "$@"
