#!/bin/bash

# Type Safety Validation Script
# This script validates TypeScript compilation and checks for potential runtime issues

set -e

echo "🛡️ Type Safety Validation"
echo "========================"

# 1. TypeScript compilation check
echo "1. TypeScript compilation check..."
if npm run typecheck > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Running typecheck to show errors:"
    npm run typecheck
    exit 1
fi

# 2. Check for potential undefined property access
echo "2. Checking for potential undefined property access..."
UNDEFINED_ACCESS=$(grep -r "\.slice\|\.map\|\.length\|\.filter" src/ --include="*.tsx" --include="*.ts" | grep -v "?." | grep -v "//" | head -10)

if [ -n "$UNDEFINED_ACCESS" ]; then
    echo "⚠️ Potential undefined access found (first 10):"
    echo "$UNDEFINED_ACCESS" | sed 's/^/  - /'
    echo ""
    echo "Consider adding null checks (?. operator)"
else
    echo "✅ No obvious undefined access patterns found"
fi

# 3. Check for grant object property access without null checks
echo "3. Checking grant object property access..."
GRANT_ACCESS=$(grep -r "grant\." src/ --include="*.tsx" --include="*.ts" | grep -v "grant\.id" | grep -v "grant\.title" | grep -v "grant\.amount" | grep -v "grant\.description" | head -10)

if [ -n "$GRANT_ACCESS" ]; then
    echo "⚠️ Grant property access found (first 10):"
    echo "$GRANT_ACCESS" | sed 's/^/  - /'
    echo ""
    echo "Verify these properties exist in the Grant interface"
else
    echo "✅ No suspicious grant property access found"
fi

# 4. Check for any/specific type usage
echo "4. Checking for any type usage..."
ANY_TYPES=$(grep -r ": any" src/ --include="*.tsx" --include="*.ts" | head -5)

if [ -n "$ANY_TYPES" ]; then
    echo "⚠️ Any types found (first 5):"
    echo "$ANY_TYPES" | sed 's/^/  - /'
    echo ""
    echo "Consider using specific types instead of any"
else
    echo "✅ No any types found"
fi

# 5. Check for console.error usage (potential runtime issues)
echo "5. Checking for error logging..."
ERROR_LOGS=$(grep -r "console\.error" src/ --include="*.tsx" --include="*.ts" | head -5)

if [ -n "$ERROR_LOGS" ]; then
    echo "ℹ️ Error logging found (first 5):"
    echo "$ERROR_LOGS" | sed 's/^/  - /'
    echo ""
    echo "These indicate potential runtime issues to monitor"
else
    echo "✅ No error logging found"
fi

echo ""
echo "✅ Type safety validation complete"
echo ""
echo "📊 SUMMARY:"
echo "  - TypeScript compilation: ✅"
echo "  - Undefined access patterns: $([ -n "$UNDEFINED_ACCESS" ] && echo "⚠️" || echo "✅")"
echo "  - Grant property access: $([ -n "$GRANT_ACCESS" ] && echo "⚠️" || echo "✅")"
echo "  - Any types: $([ -n "$ANY_TYPES" ] && echo "⚠️" || echo "✅")"
echo "  - Error logging: $([ -n "$ERROR_LOGS" ] && echo "ℹ️" || echo "✅")"
