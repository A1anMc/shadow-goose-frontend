#!/bin/bash

# Pre-commit TypeScript Check Hook
# This script runs before every commit to ensure TypeScript errors are caught

set -e

echo "🔍 Pre-commit TypeScript Check..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if there are any TypeScript files staged for commit
STAGED_TS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')

if [ -z "$STAGED_TS_FILES" ]; then
    print_status "No TypeScript files staged for commit"
    exit 0
fi

echo "Found staged TypeScript files:"
echo "$STAGED_TS_FILES"
echo ""

# Run TypeScript check on staged files
echo "Running TypeScript check on staged files..."

# Create a temporary tsconfig for staged files only
TEMP_TS_CONFIG=$(mktemp)
cat > "$TEMP_TS_CONFIG" << EOF
{
  "extends": "./tsconfig.json",
  "include": [
EOF

for file in $STAGED_TS_FILES; do
    echo "    \"$file\"," >> "$TEMP_TS_CONFIG"
done

cat >> "$TEMP_TS_CONFIG" << EOF
    "next-env.d.ts"
  ]
}
EOF

# Run TypeScript check
if npx tsc --noEmit --project "$TEMP_TS_CONFIG"; then
    print_status "TypeScript check passed for staged files"
else
    print_error "TypeScript check failed for staged files"
    echo ""
    echo "🔧 Please fix the TypeScript errors before committing:"
    echo "   1. Run: npm run typecheck"
    echo "   2. Fix the errors shown above"
    echo "   3. Stage your fixes: git add ."
    echo "   4. Try committing again"
    echo ""
    rm "$TEMP_TS_CONFIG"
    exit 1
fi

# Clean up
rm "$TEMP_TS_CONFIG"

# Also run a full project check to ensure no regressions
echo ""
echo "Running full project TypeScript check..."
if npx tsc --noEmit; then
    print_status "Full project TypeScript check passed"
else
    print_error "Full project TypeScript check failed"
    echo ""
    echo "⚠️  Warning: There are TypeScript errors in the project"
    echo "   Consider fixing them before committing"
    echo ""
    echo "   To continue anyway, use: git commit --no-verify"
    echo "   To fix errors: npm run typecheck"
    exit 1
fi

echo ""
print_status "Pre-commit TypeScript check completed successfully!"
echo "�� Ready to commit!"
