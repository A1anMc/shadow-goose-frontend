#!/bin/bash

echo "=== Shadow Goose Production Deployment ==="
echo "Phase 5: Production Go-Live"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Verify staging environment
print_status "Step 1: Verifying staging environment..."
if curl -s https://shadow-goose-api-staging.onrender.com/health | grep -q "4.2.0"; then
    print_status "✅ Staging API is running v4.2.0"
else
    print_error "❌ Staging API is not running correctly"
    exit 1
fi

if curl -s -o /dev/null -w "%{http_code}" https://shadow-goose-web-staging.onrender.com | grep -q "200"; then
    print_status "✅ Staging frontend is accessible"
else
    print_error "❌ Staging frontend is not accessible"
    exit 1
fi

# Step 2: Production database setup
print_status "Step 2: Production database setup..."
print_warning "Please create production PostgreSQL database and update DATABASE_URL"
print_warning "Example: postgresql://user:password@host/database"

# Step 3: Production environment variables
print_status "Step 3: Production environment variables..."
cat << EOF

=== PRODUCTION ENVIRONMENT VARIABLES ===

Backend Variables:
DATABASE_URL=postgresql://[production_db_user]:[password]@[host]/[db_name]
SECRET_KEY=shadow-goose-secret-key-2025-production
JWT_SECRET_KEY=shadow-goose-jwt-secret-2025-production
CORS_ORIGINS=https://app.shadowgoose.org
SENTRY_DSN=[production_sentry_dsn]
REDIS_URL=[production_redis_url]

Frontend Variables:
NEXT_PUBLIC_API_URL=https://api.shadowgoose.org
NEXT_PUBLIC_CLIENT=shadow-goose
NEXT_PUBLIC_APP_NAME=Shadow Goose Entertainment
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENV=production

EOF

# Step 4: Production deployment
print_status "Step 4: Production deployment..."
print_warning "Please create production services on Render:"
print_warning "- shadow-goose-api (production)"
print_warning "- shadow-goose-web (production)"

# Step 5: Domain configuration
print_status "Step 5: Domain configuration..."
print_warning "Configure DNS records:"
print_warning "app.shadowgoose.org → shadow-goose-web.onrender.com"
print_warning "api.shadowgoose.org → shadow-goose-api.onrender.com"

# Step 6: Production testing
print_status "Step 6: Production testing..."
print_warning "After deployment, test these URLs:"
print_warning "Frontend: https://app.shadowgoose.org"
print_warning "API: https://api.shadowgoose.org"
print_warning "Health: https://api.shadowgoose.org/health"

# Step 7: Monitoring setup
print_status "Step 7: Monitoring setup..."
print_warning "Configure monitoring for:"
print_warning "- Uptime monitoring"
print_warning "- Error tracking (Sentry)"
print_warning "- Performance monitoring"

echo ""
print_status "=== PRODUCTION DEPLOYMENT READY ==="
print_status "Next steps:"
print_status "1. Create production database"
print_status "2. Set up production services on Render"
print_status "3. Configure environment variables"
print_status "4. Deploy code to production"
print_status "5. Configure custom domains"
print_status "6. Test production environment"
print_status "7. Go-live!"

echo ""
print_status "Estimated time to production: 3-4 days"
print_status "Good luck with the deployment! 🚀" 