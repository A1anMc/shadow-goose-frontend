#!/bin/bash

# SGE Week 1 Deployment Script
# This script deploys the SGE platform with Week 1 features

set -e  # Exit on any error

echo "🚀 Starting SGE Week 1 Deployment..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected. Committing changes..."
    git add .
    git commit -m "SGE Week 1: Pre-deployment commit - $(date)"
fi

# Step 2: Dependency checks
print_status "Checking dependencies..."

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Step 3: Security audit
print_status "Running security audit..."
if npm audit --audit-level=moderate; then
    print_success "Security audit passed"
else
    print_warning "Security vulnerabilities found. Attempting to fix..."
    npm audit fix --audit-level=moderate || print_warning "Some vulnerabilities could not be automatically fixed"
fi

# Step 4: Build test
print_status "Testing build process..."
if npm run build; then
    print_success "Build test passed"
else
    print_error "Build test failed. Please fix build errors before deploying."
    exit 1
fi

# Step 5: TypeScript check
print_status "Running TypeScript checks..."
if npx tsc --noEmit; then
    print_success "TypeScript checks passed"
else
    print_error "TypeScript errors found. Please fix before deploying."
    exit 1
fi

# Step 6: Environment check
print_status "Checking environment configuration..."

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    print_warning "NEXT_PUBLIC_API_URL not set. Using default development URL."
    export NEXT_PUBLIC_API_URL="http://localhost:8000"
fi

# Step 7: Create deployment backup
print_status "Creating deployment backup..."
BACKUP_BRANCH="backup/week1-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BACKUP_BRANCH"
git push origin "$BACKUP_BRANCH"
git checkout main
print_success "Backup created: $BACKUP_BRANCH"

# Step 8: Deploy to production
print_status "Deploying to production..."

# Check if we're deploying to Render
if [ -n "$RENDER" ]; then
    print_status "Detected Render environment. Triggering deployment..."
    # Render will automatically deploy when we push to main
    git push origin main
    print_success "Deployment triggered on Render"
else
    print_status "Local deployment mode. Starting development server..."
    print_warning "For production deployment, ensure RENDER environment is set."
    npm run dev &
    DEV_PID=$!
    print_success "Development server started (PID: $DEV_PID)"
    print_status "Server running at http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"

    # Wait for user to stop the server
    trap "kill $DEV_PID; print_status 'Server stopped'; exit 0" INT
    wait $DEV_PID
fi

# Step 9: Post-deployment verification
print_status "Running post-deployment checks..."

# Wait a moment for deployment to complete
sleep 10

# Check if the application is responding (if we have a URL)
if [ -n "$NEXT_PUBLIC_API_URL" ] && [ "$NEXT_PUBLIC_API_URL" != "http://localhost:8000" ]; then
    print_status "Verifying deployment..."
    if curl -f -s "$NEXT_PUBLIC_API_URL" > /dev/null; then
        print_success "Deployment verification successful"
    else
        print_warning "Could not verify deployment. Please check manually."
    fi
fi

# Step 10: Success message
echo ""
print_success "🎉 SGE Week 1 Deployment Complete!"
echo ""
echo "✅ Deployed Features:"
echo "   • JWT Authentication"
echo "   • SGE Project Management"
echo "   • Basic Impact Dashboard"
echo "   • Analytics Dashboard"
echo "   • Mobile-Responsive Design"
echo "   • SGE Branding"
echo ""
echo "📊 Next Steps:"
echo "   • Test all functionality"
echo "   • Load SGE project baselines"
echo "   • Train team on new features"
echo "   • Monitor performance metrics"
echo ""
echo "🔗 Useful Links:"
echo "   • Dashboard: /dashboard"
echo "   • Analytics: /analytics"
echo "   • New Project: /projects/new"
echo "   • Login: /login"
echo ""

# Step 11: Rollback instructions
print_status "Rollback Instructions:"
echo "If you need to rollback, run:"
echo "  git checkout $BACKUP_BRANCH"
echo "  git push origin $BACKUP_BRANCH --force"
echo ""

print_success "Deployment script completed successfully!"
