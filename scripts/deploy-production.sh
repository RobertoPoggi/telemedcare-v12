#!/bin/bash

# TeleMedCare V11.0 - Production Deployment Script
# Deploy automatico in ambiente produzione

set -e  # Exit on any error

echo "🚀 TeleMedCare V11.0 - Production Deployment"
echo "============================================="

# Configuration
PROJECT_NAME="telemedcare-production"
BRANCH="main"
ENVIRONMENT="production"

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
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Preflight checks
log "Running preflight checks..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    error "Must be on $BRANCH branch for production deployment (current: $CURRENT_BRANCH)"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    error "Uncommitted changes detected. Please commit or stash changes before deployment."
    exit 1
fi

# Check if wrangler is authenticated
if ! npx wrangler whoami > /dev/null 2>&1; then
    error "Wrangler not authenticated. Please run 'npx wrangler login' first."
    exit 1
fi

success "Preflight checks passed"

# Build application
log "Building application for production..."
npm run build

if [ ! -d "dist" ]; then
    error "Build failed - dist directory not found"
    exit 1
fi

success "Application built successfully"

# Database migrations
log "Checking database migrations..."

# Apply migrations to production database
if npx wrangler d1 migrations list telemedcare_database > /dev/null 2>&1; then
    log "Applying pending migrations to production database..."
    npx wrangler d1 migrations apply telemedcare_database
    success "Database migrations applied"
else
    warning "Could not check migrations - database may not exist yet"
fi

# Create database if it doesn't exist
log "Ensuring production database exists..."
if ! npx wrangler d1 create telemedcare_database --preview false > /dev/null 2>&1; then
    log "Database already exists or creation failed - continuing..."
fi

# Deploy to Cloudflare Pages
log "Deploying to Cloudflare Pages..."

# Create project if it doesn't exist
if ! npx wrangler pages project list | grep -q "$PROJECT_NAME"; then
    log "Creating Cloudflare Pages project: $PROJECT_NAME"
    npx wrangler pages project create "$PROJECT_NAME" \
        --production-branch "$BRANCH" \
        --compatibility-date 2025-10-06
fi

# Deploy the application
log "Uploading application to $PROJECT_NAME..."
DEPLOY_OUTPUT=$(npx wrangler pages deploy dist \
    --project-name "$PROJECT_NAME" \
    --env production \
    2>&1)

if [ $? -eq 0 ]; then
    success "Deployment completed successfully"
    
    # Extract URL from deploy output
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*' | head -1)
    if [ -n "$DEPLOY_URL" ]; then
        echo ""
        echo "🌐 Production URL: $DEPLOY_URL"
        echo ""
        
        # Test deployment
        log "Testing deployment..."
        if curl -f -s "$DEPLOY_URL" > /dev/null; then
            success "Deployment is responding correctly"
        else
            warning "Deployment may not be fully ready yet"
        fi
    fi
else
    error "Deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Post-deployment checks
log "Running post-deployment checks..."

# Check system health (if URL available)
if [ -n "$DEPLOY_URL" ]; then
    HEALTH_URL="$DEPLOY_URL/api/system/health"
    if curl -f -s "$HEALTH_URL" > /dev/null 2>&1; then
        success "System health check passed"
    else
        warning "System health check failed - may need manual verification"
    fi
fi

# Update project metadata
log "Updating deployment metadata..."

# Create deployment record
DEPLOYMENT_INFO="{
  \"environment\": \"$ENVIRONMENT\",
  \"project_name\": \"$PROJECT_NAME\", 
  \"branch\": \"$BRANCH\",
  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"commit_hash\": \"$(git rev-parse HEAD)\",
  \"deploy_url\": \"$DEPLOY_URL\"
}"

echo "$DEPLOYMENT_INFO" > deployment-production.json

# Log deployment in system (if possible)
if [ -n "$DEPLOY_URL" ]; then
    curl -X POST "$DEPLOY_URL/api/environment/log-deployment" \
        -H "Content-Type: application/json" \
        -d "$DEPLOYMENT_INFO" \
        > /dev/null 2>&1 || true
fi

echo ""
echo "🎉 Production deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "   Environment: $ENVIRONMENT"
echo "   Project: $PROJECT_NAME"
echo "   Branch: $BRANCH" 
echo "   Commit: $(git rev-parse --short HEAD)"
echo "   URL: $DEPLOY_URL"
echo ""
echo "🔍 Next steps:"
echo "   1. Verify application functionality at $DEPLOY_URL"
echo "   2. Check system health at $DEPLOY_URL/api/system/health"
echo "   3. Monitor logs for any issues"
echo "   4. Update DNS if using custom domain"
echo ""

success "Production deployment script completed"