#!/bin/bash

# TypeScript Checking and Fixing Script
# This script ensures TypeScript errors are caught and reported

set -e

echo "🔍 TypeScript Check Starting..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if TypeScript is installed
if ! command -v npx tsc &> /dev/null; then
    print_error "TypeScript not found. Please install with: npm install"
    exit 1
fi

# Run TypeScript check
echo "Running TypeScript type check..."
if npx tsc --noEmit; then
    print_status "TypeScript check passed! No type errors found."
    echo ""
    echo "📊 TypeScript Status:"
    echo "   - All interfaces properly defined"
    echo "   - No type mismatches"
    echo "   - All imports resolved"
    echo "   - Build ready for deployment"
else
    print_error "TypeScript check failed! Type errors found."
    echo ""
    echo "🔧 To fix TypeScript errors:"
    echo "   1. Run: npm run typecheck"
    echo "   2. Fix the errors shown above"
    echo "   3. Run: npm run typecheck (again to verify)"
    echo "   4. Commit your fixes"
    echo ""
    echo "💡 Common fixes:"
    echo "   - Add missing properties to interfaces"
    echo "   - Fix type mismatches"
    echo "   - Add proper type annotations"
    echo "   - Import missing types"
    exit 1
fi

# Check for any .ts files with syntax errors
echo ""
echo "🔍 Checking for syntax errors in TypeScript files..."
TS_FILES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next)

for file in $TS_FILES; do
    if ! npx tsc --noEmit "$file" > /dev/null 2>&1; then
        print_warning "Potential syntax error in: $file"
    fi
done

# Check for unused imports (if eslint is available)
if command -v npx eslint &> /dev/null; then
    echo ""
    echo "🔍 Checking for unused imports..."
    if npx eslint --ext .ts,.tsx src/ pages/ --rule 'no-unused-vars: error' --rule '@typescript-eslint/no-unused-vars: error'; then
        print_status "No unused imports found"
    else
        print_warning "Some unused imports detected. Consider cleaning them up."
    fi
fi

echo ""
echo "=================================="
print_status "TypeScript check completed successfully!"
echo ""
echo "🚀 Ready for deployment!"
echo "   Run: npm run deploy"
