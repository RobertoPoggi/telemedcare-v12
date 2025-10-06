#!/bin/bash

# TeleMedCare V11.0 - Test Environment Creation Script
# Crea nuovo ambiente test versionato

set -e  # Exit on any error

echo "🧪 TeleMedCare V11.0 - Test Environment Creation"
echo "================================================"

# Configuration
VERSION=${1:-"auto"}  # Version from parameter or auto-increment
ENVIRONMENT="test"
BASE_PROJECT_NAME="telemedcare-test"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Function to get next version number
get_next_version() {
    local max_version=0
    
    # Check existing projects
    local projects=$(npx wrangler pages project list 2>/dev/null | grep "$BASE_PROJECT_NAME-v" || true)
    
    if [ -n "$projects" ]; then
        while IFS= read -r project; do
            local version=$(echo "$project" | grep -o 'v[0-9]\+' | sed 's/v//')
            if [ "$version" -gt "$max_version" ]; then
                max_version=$version
            fi
        done <<< "$projects"
    fi
    
    echo $((max_version + 1))
}

# Determine version number
if [ "$VERSION" = "auto" ]; then
    VERSION=$(get_next_version)
    log "Auto-generated version: $VERSION"
else
    log "Using specified version: $VERSION"
fi

# Format version with leading zero if needed
FORMATTED_VERSION=$(printf "%02d" "$VERSION")
PROJECT_NAME="${BASE_PROJECT_NAME}-v${VERSION}"
DATABASE_NAME="telemedcare_test_${FORMATTED_VERSION}"

log "Creating test environment:"
log "  Project: $PROJECT_NAME"
log "  Database: $DATABASE_NAME"
log "  Version: $FORMATTED_VERSION"

# Preflight checks
log "Running preflight checks..."

# Check wrangler authentication
if ! npx wrangler whoami > /dev/null 2>&1; then
    error "Wrangler not authenticated. Please run 'npx wrangler login' first."
    exit 1
fi

# Check if project already exists
if npx wrangler pages project list | grep -q "$PROJECT_NAME"; then
    error "Project $PROJECT_NAME already exists"
    exit 1
fi

success "Preflight checks passed"

# Create test database
log "Creating test database: $DATABASE_NAME"

if npx wrangler d1 create "$DATABASE_NAME" > /dev/null 2>&1; then
    success "Database $DATABASE_NAME created successfully"
    
    # Get database ID for configuration
    DATABASE_ID=$(npx wrangler d1 info "$DATABASE_NAME" | grep "Database ID" | awk '{print $3}' || echo "test-db-$FORMATTED_VERSION")
    
else
    # Database might already exist
    warning "Database $DATABASE_NAME may already exist - continuing..."
    DATABASE_ID="test-db-$FORMATTED_VERSION"
fi

# Apply database migrations
log "Applying migrations to test database..."
if [ -d "migrations" ]; then
    npx wrangler d1 migrations apply "$DATABASE_NAME" --local || warning "Local migration application failed"
    npx wrangler d1 migrations apply "$DATABASE_NAME" || warning "Remote migration application failed"
else
    warning "No migrations directory found"
fi

# Seed test data
log "Seeding test database with sample data..."
if [ -f "seed-test.sql" ]; then
    npx wrangler d1 execute "$DATABASE_NAME" --file=seed-test.sql || warning "Test data seeding failed"
elif [ -f "seed.sql" ]; then
    npx wrangler d1 execute "$DATABASE_NAME" --file=seed.sql || warning "General data seeding failed"
else
    warning "No seed data file found"
fi

# Build application
log "Building application for test environment..."
npm run build

if [ ! -d "dist" ]; then
    error "Build failed - dist directory not found"
    exit 1
fi

success "Application built successfully"

# Create Cloudflare Pages project
log "Creating Cloudflare Pages project: $PROJECT_NAME"

npx wrangler pages project create "$PROJECT_NAME" \
    --production-branch "test" \
    --compatibility-date 2025-10-06

success "Project $PROJECT_NAME created"

# Create environment-specific wrangler configuration
log "Creating test environment configuration..."

cat > "wrangler-test-v${VERSION}.toml" << EOF
# TeleMedCare V11.0 Test Environment v${VERSION} Configuration
name = "${PROJECT_NAME}"
compatibility_date = "2025-10-06"
pages_build_output_dir = "./dist"
compatibility_flags = ["nodejs_compat"]

[env.test]
name = "${PROJECT_NAME}"

[[env.test.d1_databases]]
binding = "DB"
database_name = "${DATABASE_NAME}"
database_id = "${DATABASE_ID}"

[env.test.vars]
ENVIRONMENT = "test"
DEBUG_MODE = "true"
TEST_VERSION = "${FORMATTED_VERSION}"
EOF

success "Test configuration created: wrangler-test-v${VERSION}.toml"

# Deploy to test environment
log "Deploying to test environment..."

DEPLOY_OUTPUT=$(npx wrangler pages deploy dist \
    --project-name "$PROJECT_NAME" \
    --env test \
    --config "wrangler-test-v${VERSION}.toml" \
    2>&1)

if [ $? -eq 0 ]; then
    success "Test deployment completed successfully"
    
    # Extract URL from deploy output
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*' | head -1)
    if [ -n "$DEPLOY_URL" ]; then
        echo ""
        echo "🌐 Test Environment URL: $DEPLOY_URL"
        echo ""
        
        # Test deployment
        log "Testing deployment..."
        sleep 5  # Wait for deployment to propagate
        if curl -f -s "$DEPLOY_URL" > /dev/null; then
            success "Test deployment is responding correctly"
        else
            warning "Test deployment may not be fully ready yet"
        fi
    fi
else
    error "Test deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Create test environment metadata
log "Creating test environment metadata..."

TEST_ENV_INFO="{
  \"environment\": \"$ENVIRONMENT\",
  \"version\": \"$FORMATTED_VERSION\",
  \"project_name\": \"$PROJECT_NAME\",
  \"database_name\": \"$DATABASE_NAME\",
  \"database_id\": \"$DATABASE_ID\",
  \"created_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"deploy_url\": \"$DEPLOY_URL\",
  \"config_file\": \"wrangler-test-v${VERSION}.toml\"
}"

echo "$TEST_ENV_INFO" > "test-env-v${VERSION}.json"

# Register environment in system (if possible)
if [ -n "$DEPLOY_URL" ]; then
    curl -X POST "$DEPLOY_URL/api/environment/register" \
        -H "Content-Type: application/json" \
        -d "$TEST_ENV_INFO" \
        > /dev/null 2>&1 || true
fi

echo ""
echo "🎉 Test environment v${VERSION} created successfully!"
echo ""
echo "📊 Environment Summary:"
echo "   Version: v${FORMATTED_VERSION}"
echo "   Project: $PROJECT_NAME"
echo "   Database: $DATABASE_NAME"
echo "   URL: $DEPLOY_URL"
echo "   Config: wrangler-test-v${VERSION}.toml"
echo ""
echo "🔍 Available endpoints:"
echo "   Dashboard: $DEPLOY_URL/admin/data-dashboard"
echo "   Testing: $DEPLOY_URL/admin/testing-dashboard"
echo "   API Health: $DEPLOY_URL/api/system/health"
echo ""
echo "🧪 Testing commands:"
echo "   Functional test: curl -X POST $DEPLOY_URL/api/test/functional/run"
echo "   Stress test: curl -X POST $DEPLOY_URL/api/test/stress/start -d '{\"assistiti_count\":10}'"
echo ""

success "Test environment creation completed"

# Optional: Show how to clone from other environments
echo "💡 To clone from other environments:"
echo "   From development: curl -X POST $DEPLOY_URL/api/environment/clone -d '{\"source_environment\":\"development\",\"target_environment\":\"test\",\"include_data\":true}'"
echo "   From production: curl -X POST $DEPLOY_URL/api/environment/clone -d '{\"source_environment\":\"production\",\"target_environment\":\"test\",\"include_data\":false}'"
echo ""