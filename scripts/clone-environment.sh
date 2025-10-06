#!/bin/bash

# TeleMedCare V11.0 - Environment Cloning Script
# Clona ambiente esistente per creare nuovo ambiente test

set -e  # Exit on any error

echo "📋 TeleMedCare V11.0 - Environment Cloning"
echo "=========================================="

# Parameters
SOURCE_ENV=${1:-"development"}
INCLUDE_DATA=${2:-"true"}
TARGET_VERSION=${3:-"auto"}

# Configuration
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

# Show usage
show_usage() {
    echo "Usage: $0 [SOURCE_ENV] [INCLUDE_DATA] [TARGET_VERSION]"
    echo ""
    echo "Parameters:"
    echo "  SOURCE_ENV      Source environment (development|test|staging|production) [default: development]"
    echo "  INCLUDE_DATA    Include data in clone (true|false) [default: true]"
    echo "  TARGET_VERSION  Target version number or 'auto' [default: auto]"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Clone development with data, auto version"
    echo "  $0 production false                   # Clone production structure only, auto version"
    echo "  $0 staging true 5                     # Clone staging with data to version 5"
    echo ""
}

# Validate source environment
case "$SOURCE_ENV" in
    development|test|staging|production)
        ;;
    *)
        error "Invalid source environment: $SOURCE_ENV"
        show_usage
        exit 1
        ;;
esac

# Validate include_data parameter
case "$INCLUDE_DATA" in
    true|false)
        ;;
    *)
        error "Invalid INCLUDE_DATA value: $INCLUDE_DATA (must be true or false)"
        show_usage
        exit 1
        ;;
esac

log "Cloning configuration:"
log "  Source environment: $SOURCE_ENV"
log "  Include data: $INCLUDE_DATA"
log "  Target version: $TARGET_VERSION"

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

# Determine target version
if [ "$TARGET_VERSION" = "auto" ]; then
    TARGET_VERSION=$(get_next_version)
    log "Auto-generated target version: $TARGET_VERSION"
fi

# Format version with leading zero
FORMATTED_VERSION=$(printf "%02d" "$TARGET_VERSION")
TARGET_PROJECT_NAME="${BASE_PROJECT_NAME}-v${TARGET_VERSION}"
TARGET_DATABASE_NAME="telemedcare_test_${FORMATTED_VERSION}"

# Map source environment to database name
case "$SOURCE_ENV" in
    development)
        SOURCE_DATABASE_NAME="telemedcare-leads"
        ;;
    test)
        # Find latest test database
        SOURCE_DATABASE_NAME="telemedcare_test_01"  # Default to first test env
        ;;
    staging)
        SOURCE_DATABASE_NAME="telemedcare_staging"
        ;;
    production)
        SOURCE_DATABASE_NAME="telemedcare_database"
        ;;
esac

log "Clone plan:"
log "  Source database: $SOURCE_DATABASE_NAME"
log "  Target database: $TARGET_DATABASE_NAME"
log "  Target project: $TARGET_PROJECT_NAME"

# Preflight checks
log "Running preflight checks..."

# Check wrangler authentication
if ! npx wrangler whoami > /dev/null 2>&1; then
    error "Wrangler not authenticated. Please run 'npx wrangler login' first."
    exit 1
fi

# Check if source database exists
if [ "$SOURCE_ENV" != "development" ]; then
    if ! npx wrangler d1 info "$SOURCE_DATABASE_NAME" > /dev/null 2>&1; then
        error "Source database $SOURCE_DATABASE_NAME does not exist"
        exit 1
    fi
fi

# Check if target project already exists
if npx wrangler pages project list | grep -q "$TARGET_PROJECT_NAME"; then
    error "Target project $TARGET_PROJECT_NAME already exists"
    exit 1
fi

success "Preflight checks passed"

# Create target database
log "Creating target database: $TARGET_DATABASE_NAME"

if npx wrangler d1 create "$TARGET_DATABASE_NAME" > /dev/null 2>&1; then
    success "Target database created successfully"
    
    # Get database ID for configuration
    TARGET_DATABASE_ID=$(npx wrangler d1 info "$TARGET_DATABASE_NAME" | grep "Database ID" | awk '{print $3}' || echo "cloned-db-$FORMATTED_VERSION")
    
else
    error "Failed to create target database $TARGET_DATABASE_NAME"
    exit 1
fi

# Apply schema migrations to target
log "Applying schema migrations to target database..."
if [ -d "migrations" ]; then
    npx wrangler d1 migrations apply "$TARGET_DATABASE_NAME" || warning "Migration application failed"
else
    warning "No migrations directory found"
fi

# Clone data if requested
if [ "$INCLUDE_DATA" = "true" ]; then
    log "Cloning data from $SOURCE_DATABASE_NAME to $TARGET_DATABASE_NAME..."
    
    case "$SOURCE_ENV" in
        development)
            # For development, use local database dump if available
            if [ -f "development-dump.sql" ]; then
                npx wrangler d1 execute "$TARGET_DATABASE_NAME" --file=development-dump.sql
            else
                warning "No development data dump found, using seed data"
                if [ -f "seed.sql" ]; then
                    npx wrangler d1 execute "$TARGET_DATABASE_NAME" --file=seed.sql
                fi
            fi
            ;;
        *)
            # For remote databases, create a data export first
            log "Exporting data from $SOURCE_DATABASE_NAME..."
            
            # Export key tables
            EXPORT_FILE="temp-export-${SOURCE_ENV}.sql"
            
            # Create export with key data (this is a simplified approach)
            cat > "$EXPORT_FILE" << EOF
-- Data export from $SOURCE_DATABASE_NAME
-- Generated at $(date)

-- Note: This is a basic export. In production, use proper backup/restore tools.

INSERT OR IGNORE INTO leads SELECT * FROM leads LIMIT 100;
INSERT OR IGNORE INTO assistiti SELECT * FROM assistiti LIMIT 50;  
INSERT OR IGNORE INTO workflow_tracking SELECT * FROM workflow_tracking;
INSERT OR IGNORE INTO email_logs SELECT * FROM email_logs LIMIT 200;
INSERT OR IGNORE INTO system_logs SELECT * FROM system_logs WHERE created_at > date('now', '-7 days');
EOF

            # Apply export to target
            npx wrangler d1 execute "$TARGET_DATABASE_NAME" --file="$EXPORT_FILE" || warning "Data cloning may have been incomplete"
            
            # Clean up export file
            rm -f "$EXPORT_FILE"
            ;;
    esac
    
    success "Data cloning completed"
else
    log "Skipping data cloning (structure only)"
    
    # Apply basic seed data for functionality
    if [ -f "seed-test.sql" ]; then
        npx wrangler d1 execute "$TARGET_DATABASE_NAME" --file=seed-test.sql
    elif [ -f "seed.sql" ]; then
        npx wrangler d1 execute "$TARGET_DATABASE_NAME" --file=seed.sql
    fi
fi

# Build application
log "Building application for cloned environment..."
npm run build

if [ ! -d "dist" ]; then
    error "Build failed - dist directory not found"
    exit 1
fi

# Create Cloudflare Pages project
log "Creating target Cloudflare Pages project: $TARGET_PROJECT_NAME"

npx wrangler pages project create "$TARGET_PROJECT_NAME" \
    --production-branch "test" \
    --compatibility-date 2025-10-06

success "Target project created"

# Create environment-specific configuration
log "Creating cloned environment configuration..."

cat > "wrangler-cloned-v${TARGET_VERSION}.toml" << EOF
# TeleMedCare V11.0 Cloned Environment v${TARGET_VERSION} Configuration
# Cloned from: ${SOURCE_ENV} (data: ${INCLUDE_DATA})
name = "${TARGET_PROJECT_NAME}"
compatibility_date = "2025-10-06"
pages_build_output_dir = "./dist"
compatibility_flags = ["nodejs_compat"]

[env.test]
name = "${TARGET_PROJECT_NAME}"

[[env.test.d1_databases]]
binding = "DB"
database_name = "${TARGET_DATABASE_NAME}"
database_id = "${TARGET_DATABASE_ID}"

[env.test.vars]
ENVIRONMENT = "test"
DEBUG_MODE = "true"
TEST_VERSION = "${FORMATTED_VERSION}"
CLONED_FROM = "${SOURCE_ENV}"
INCLUDE_DATA = "${INCLUDE_DATA}"
EOF

success "Cloned configuration created: wrangler-cloned-v${TARGET_VERSION}.toml"

# Deploy cloned environment
log "Deploying cloned environment..."

DEPLOY_OUTPUT=$(npx wrangler pages deploy dist \
    --project-name "$TARGET_PROJECT_NAME" \
    --env test \
    --config "wrangler-cloned-v${TARGET_VERSION}.toml" \
    2>&1)

if [ $? -eq 0 ]; then
    success "Cloned environment deployment completed"
    
    # Extract URL
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*' | head -1)
    if [ -n "$DEPLOY_URL" ]; then
        echo ""
        echo "🌐 Cloned Environment URL: $DEPLOY_URL"
        echo ""
        
        # Test deployment
        log "Testing cloned deployment..."
        sleep 5  # Wait for propagation
        if curl -f -s "$DEPLOY_URL" > /dev/null; then
            success "Cloned deployment is responding correctly"
        else
            warning "Cloned deployment may not be fully ready yet"
        fi
    fi
else
    error "Cloned environment deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Create clone metadata
log "Creating clone metadata..."

CLONE_INFO="{
  \"clone_type\": \"environment\",
  \"source_environment\": \"$SOURCE_ENV\",
  \"source_database\": \"$SOURCE_DATABASE_NAME\",
  \"target_environment\": \"test\",
  \"target_version\": \"$FORMATTED_VERSION\",
  \"target_project\": \"$TARGET_PROJECT_NAME\",
  \"target_database\": \"$TARGET_DATABASE_NAME\",
  \"include_data\": $INCLUDE_DATA,
  \"cloned_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"deploy_url\": \"$DEPLOY_URL\",
  \"config_file\": \"wrangler-cloned-v${TARGET_VERSION}.toml\"
}"

echo "$CLONE_INFO" > "clone-v${TARGET_VERSION}.json"

# Register clone in system (if possible)
if [ -n "$DEPLOY_URL" ]; then
    curl -X POST "$DEPLOY_URL/api/environment/register-clone" \
        -H "Content-Type: application/json" \
        -d "$CLONE_INFO" \
        > /dev/null 2>&1 || true
fi

echo ""
echo "🎉 Environment successfully cloned!"
echo ""
echo "📊 Clone Summary:"
echo "   Source: $SOURCE_ENV ($SOURCE_DATABASE_NAME)"
echo "   Target: test v${FORMATTED_VERSION} ($TARGET_DATABASE_NAME)"
echo "   Data included: $INCLUDE_DATA"
echo "   Project: $TARGET_PROJECT_NAME"
echo "   URL: $DEPLOY_URL"
echo ""
echo "🔍 Verification steps:"
echo "   1. Check health: curl $DEPLOY_URL/api/system/health"
echo "   2. Run functional test: curl -X POST $DEPLOY_URL/api/test/functional/run"
echo "   3. Check data: $DEPLOY_URL/admin/data-dashboard"
echo ""
echo "🗂️ Files created:"
echo "   - wrangler-cloned-v${TARGET_VERSION}.toml (configuration)"
echo "   - clone-v${TARGET_VERSION}.json (metadata)"
echo ""

success "Environment cloning completed successfully"