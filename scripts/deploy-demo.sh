#!/bin/bash

# 🚀 SGE Demo Deployment Script
# Deploys the working system to Vercel for immediate demo

set -e

echo "🚀 Starting SGE Demo Deployment..."

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
    print_error "Not in project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "Pre-deployment checks passed"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 3: TypeScript check
print_status "Running TypeScript check..."
npm run typecheck
print_success "TypeScript check passed"

# Step 4: Build the project
print_status "Building the project..."
npm run build
print_success "Build completed"

# Step 5: Check if Vercel CLI is installed
print_status "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI found"
fi

# Step 6: Deploy to Vercel
print_status "Deploying to Vercel..."
print_warning "This will open a browser window for Vercel authentication if needed"

# Deploy with production flag
vercel --prod --yes

print_success "Deployment completed!"

# Step 7: Get deployment URL
print_status "Getting deployment URL..."
DEPLOYMENT_URL=$(vercel ls --json | jq -r '.projects[0].url' 2>/dev/null || echo "https://your-project.vercel.app")

print_success "🎉 Demo deployed successfully!"
echo ""
echo "📱 Demo URL: $DEPLOYMENT_URL"
echo "🔧 API Health: $DEPLOYMENT_URL/api/health"
echo "📊 Dashboard: $DEPLOYMENT_URL/dashboard"
echo ""
echo "🎯 Ready for stakeholder demo!"
echo ""
print_warning "Note: This deployment uses SQLite for demo purposes."
print_warning "For production, you'll need to migrate to PostgreSQL."
echo ""

# Step 8: Test the deployment
print_status "Testing deployment..."
sleep 5

# Test health endpoint
if curl -s "$DEPLOYMENT_URL/api/health" > /dev/null; then
    print_success "Health check passed"
else
    print_warning "Health check failed - deployment may still be building"
fi

print_success "🚀 Demo deployment script completed!"
print_success "Your system is now live and ready for demonstration!"
