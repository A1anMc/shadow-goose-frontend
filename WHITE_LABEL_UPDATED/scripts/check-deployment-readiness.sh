#!/bin/bash

# Deployment Readiness Check Script
# Prevents common deployment failures before they happen

set -e

echo "🔍 Checking deployment readiness..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected"
    echo "Files with changes:"
    git status --porcelain
    echo ""
fi

# Frontend checks
if [ -f "package.json" ]; then
    echo "📦 Frontend deployment checks..."

    # Check for package-lock.json
    if [ ! -f "package-lock.json" ]; then
        print_error "Missing package-lock.json - this will cause deployment failure!"
        echo "Run: npm install"
        exit 1
    else
        print_status "package-lock.json exists"
    fi

    # Check for security vulnerabilities
    echo "🔒 Checking for security vulnerabilities..."
    if npm audit --audit-level=moderate 2>/dev/null | grep -q "found"; then
        print_warning "Security vulnerabilities found"
        echo "Run: npm audit fix"
    else
        print_status "No security vulnerabilities found"
    fi

    # Check if build works
    echo "🏗️  Testing build process..."
    if npm run build >/dev/null 2>&1; then
        print_status "Build test passed"
    else
        print_error "Build test failed - fix before deploying"
        exit 1
    fi

    # Check for TypeScript configuration
    if [ -f "tsconfig.json" ]; then
        print_status "TypeScript configuration exists"
    else
        print_warning "No tsconfig.json found - TypeScript may not work properly"
    fi
fi

# Backend checks
if [ -f "requirements.txt" ]; then
    echo "🐍 Backend deployment checks..."

    # Check Python version compatibility
    if [ -f "runtime.txt" ]; then
        print_status "Python runtime specified"
    else
        print_warning "No runtime.txt found - may cause Python version issues"
    fi

    # Check for syntax errors
    echo "🔍 Checking Python syntax..."
    if python -m py_compile app/main.py 2>/dev/null; then
        print_status "Python syntax check passed"
    else
        print_error "Python syntax errors found"
        exit 1
    fi

    # Check for dependency conflicts
    echo "📋 Checking Python dependencies..."
    if pip check 2>/dev/null; then
        print_status "No Python dependency conflicts"
    else
        print_warning "Python dependency conflicts detected"
        echo "Run: pip check"
    fi
fi

# Environment file checks
if [ -f ".env.example" ] || [ -f "ENV_TEMPLATE.production" ]; then
    print_status "Environment template files exist"
else
    print_warning "No environment template files found"
fi

# Check for critical files
echo "📁 Checking critical files..."
critical_files=("README.md" ".gitignore")
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_warning "$file missing"
    fi
done

# Check GitHub Actions workflows
if [ -d ".github/workflows" ]; then
    echo "🚀 Checking GitHub Actions workflows..."
    workflow_count=$(find .github/workflows -name "*.yml" | wc -l)
    if [ "$workflow_count" -gt 0 ]; then
        print_status "Found $workflow_count GitHub Actions workflow(s)"
    else
        print_warning "No GitHub Actions workflows found"
    fi
fi

# Check for common deployment blockers
echo "🚫 Checking for common deployment blockers..."

# Check for large files that might cause issues
large_files=$(find . -type f -size +50M 2>/dev/null | head -5)
if [ -n "$large_files" ]; then
    print_warning "Large files detected (>50MB):"
    echo "$large_files"
fi

# Check for node_modules in git (should be ignored)
if [ -d "node_modules" ] && git ls-files node_modules >/dev/null 2>&1; then
    print_error "node_modules is tracked in git - this will cause deployment issues!"
    echo "Add node_modules/ to .gitignore"
    exit 1
fi

# Check for .env files in git (should not be committed)
if git ls-files | grep -q "\.env$"; then
    print_error ".env files are committed to git - security risk!"
    echo "Remove .env files from git and add to .gitignore"
    exit 1
fi

echo ""
echo "🎯 Deployment Readiness Summary"
echo "================================"

# Final status
if [ $? -eq 0 ]; then
    print_status "Deployment readiness check passed!"
    echo "✅ Your project is ready for deployment"
else
    print_error "Deployment readiness check failed!"
    echo "❌ Fix the issues above before deploying"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. Commit any pending changes"
echo "2. Push to main branch"
echo "3. Monitor deployment logs"
echo "4. Verify deployment success"

echo ""
echo "🔧 Quick fix commands:"
echo "- npm install (if package-lock.json missing)"
echo "- npm audit fix (if security issues found)"
echo "- git add . && git commit -m 'Fix deployment issues'"
echo "- git push origin main"
