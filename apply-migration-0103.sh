#!/bin/bash

# Apply migration 0103 to add configuration details columns
# Usage: ./apply-migration-0103.sh

echo "🔧 Applicazione Migration 0103: Add configuration details columns"
echo "=================================================="

# Read migration file
MIGRATION_FILE="migrations/0103_add_configuration_details_columns.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Reading migration from: $MIGRATION_FILE"

# Apply to production database using wrangler
echo "📤 Applying to production database..."
npx wrangler d1 execute telemedcare-db-production --file="$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Migration 0103 applied successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo "=================================================="
echo "✅ Done! Test the form now."
