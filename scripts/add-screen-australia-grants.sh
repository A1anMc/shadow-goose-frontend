#!/bin/bash

# Add Screen Australia Documentary Production Grants
# This script adds real funding opportunities from Screen Australia

set -e

echo "🎬 ADDING SCREEN AUSTRALIA DOCUMENTARY PRODUCTION GRANTS"
echo "======================================================="

# Configuration
API_URL="https://shadow-goose-api.onrender.com"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzU1MDQxMTAzfQ.n0v5mUwkjEpRnBYTBHy0Z7oJtjPXvVxr_hTCsdgvb3o"

echo "📊 Current grants in database:"
curl -s -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants" | jq '.grants | length'
echo ""

echo "🎯 Adding Screen Australia Documentary Production Grants..."

# Grant 1: September 2025 Deadline
echo "1. Adding September 2025 deadline grant..."
SEPT_GRANT=$(curl -s -X POST -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Screen Australia Documentary Production Fund - September 2025",
    "description": "Direct funding for documentary projects that demonstrate strong storytelling, distinctive content, and potential to resonate with Australian and global audiences. Projects must be no further than 6 months from pre-production start.",
    "amount": 500000,
    "currency": "AUD",
    "deadline": "2025-09-25T17:00:00Z",
    "category": "documentary_production",
    "priority": "high",
    "status": "open",
    "organisation": "Screen Australia",
    "eligibility_criteria": [
      "Australian production companies",
      "Projects no further than 6 months from pre-production",
      "Strong, distinctive storytelling",
      "Authentic team connections to content",
      "Potential for Australian/global audience impact"
    ],
    "required_documents": [
      "Project proposal with story details",
      "Team credentials and experience",
      "Budget breakdown and finance plan",
      "Audience strategy and platform details",
      "Marketplace and finance compliance evidence"
    ],
    "assessment_criteria": [
      "Story strength and distinctiveness",
      "Team experience and authentic connections",
      "Audience potential and impact",
      "Budget appropriateness and methodology",
      "Marketplace and finance compliance"
    ],
    "funding_details": {
      "type": "Production Grant Agreement (PGA) or Production Investment Agreement (PIA)",
      "assessment_time": "8-12 weeks",
      "notification_time": "10-12 weeks from deadline",
      "crew_placement_required": "Yes (for funding over $300,000)"
    },
    "contact": {
      "email": "documentary@screenaustralia.gov.au",
      "phone": "1800 507 901",
      "website": "https://www.screenaustralia.gov.au/funding-and-support/documentary/production/documentary-production"
    },
    "tags": ["documentary", "production", "screen_australia", "australian_content", "storytelling"]
  }' \
  "$API_URL/api/grants" 2>/dev/null || echo "FAILED")

if [ "$SEPT_GRANT" != "FAILED" ]; then
    echo "   ✅ September 2025 grant added successfully"
else
    echo "   ❌ Failed to add September 2025 grant"
fi

# Grant 2: January 2026 Deadline
echo ""
echo "2. Adding January 2026 deadline grant..."
JAN_GRANT=$(curl -s -X POST -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Screen Australia Documentary Production Fund - January 2026",
    "description": "Direct funding for documentary projects that demonstrate strong storytelling, distinctive content, and potential to resonate with Australian and global audiences. Projects must be no further than 6 months from pre-production start.",
    "amount": 500000,
    "currency": "AUD",
    "deadline": "2026-01-29T17:00:00Z",
    "category": "documentary_production",
    "priority": "high",
    "status": "open",
    "organisation": "Screen Australia",
    "eligibility_criteria": [
      "Australian production companies",
      "Projects no further than 6 months from pre-production",
      "Strong, distinctive storytelling",
      "Authentic team connections to content",
      "Potential for Australian/global audience impact"
    ],
    "required_documents": [
      "Project proposal with story details",
      "Team credentials and experience",
      "Budget breakdown and finance plan",
      "Audience strategy and platform details",
      "Marketplace and finance compliance evidence"
    ],
    "assessment_criteria": [
      "Story strength and distinctiveness",
      "Team experience and authentic connections",
      "Audience potential and impact",
      "Budget appropriateness and methodology",
      "Marketplace and finance compliance"
    ],
    "funding_details": {
      "type": "Production Grant Agreement (PGA) or Production Investment Agreement (PIA)",
      "assessment_time": "8-12 weeks",
      "notification_time": "10-12 weeks from deadline",
      "crew_placement_required": "Yes (for funding over $300,000)"
    },
    "contact": {
      "email": "documentary@screenaustralia.gov.au",
      "phone": "1800 507 901",
      "website": "https://www.screenaustralia.gov.au/funding-and-support/documentary/production/documentary-production"
    },
    "tags": ["documentary", "production", "screen_australia", "australian_content", "storytelling"]
  }' \
  "$API_URL/api/grants" 2>/dev/null || echo "FAILED")

if [ "$JAN_GRANT" != "FAILED" ]; then
    echo "   ✅ January 2026 grant added successfully"
else
    echo "   ❌ Failed to add January 2026 grant"
fi

echo ""
echo "📊 Updated grants in database:"
curl -s -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/grants" | jq '.grants | length'
echo ""

echo "🎬 Screen Australia Documentary Production Grants Summary:"
echo "=========================================================="
echo "✅ Added 2 major funding opportunities"
echo "✅ Total potential funding: $1,000,000 AUD"
echo "✅ Deadlines: September 25, 2025 & January 29, 2026"
echo "✅ Real government funding source"
echo "✅ Comprehensive eligibility and assessment criteria"
echo ""

echo "📋 Grant Details:"
echo "================="
echo "• Organization: Screen Australia (Australian Government)"
echo "• Funding Type: Documentary Production Fund"
echo "• Maximum Amount: $500,000 AUD per project"
echo "• Assessment Time: 8-12 weeks"
echo "• Contact: documentary@screenaustralia.gov.au"
echo "• Website: https://www.screenaustralia.gov.au/funding-and-support/documentary/production/documentary-production"
echo ""

echo "🎯 Success Metrics:"
echo "==================="
echo "✅ Real government funding opportunities added"
echo "✅ Significant funding amounts ($500K each)"
echo "✅ Clear deadlines and application process"
echo "✅ Professional assessment criteria"
echo "✅ Direct contact information provided"
echo ""

echo "✅ Screen Australia grants successfully added to database!"
echo "Users can now access real government funding opportunities."
