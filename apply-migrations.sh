#!/bin/bash

# TelemedCare V11 - Apply Database Migrations
# This script applies all database migrations to Cloudflare D1

export CLOUDFLARE_API_TOKEN="zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"

echo "🚀 Applying TelemedCare V11 Database Migrations..."
echo ""

# Array of migration files in order
MIGRATIONS=(
  "migrations/0001_initial_schema.sql"
  "migrations/0002_add_missing_tables.sql"
  "migrations/0003_fix_schema.sql"
  "migrations/0004_add_missing_templates.sql"
  "migrations/0005_create_partners_providers.sql"
  "migrations/0006_fix_email_templates.sql"
  "migrations/0007_fix_proforma_schema.sql"
  "migrations/0008_add_missing_lead_fields.sql"
  "migrations/0009_update_email_documenti_template.sql"
  "migrations/0012_populate_templates.sql"
  "migrations/0018_update_email_contratto_dynamic.sql"
  "migrations/0019_create_docusign_envelopes_table.sql"
  "migrations/0020_create_docusign_tokens_table.sql"
  "migrations/0021_create_proformas_table.sql"
  "migrations/0022_create_devices_table.sql"
  "migrations/0023_update_contracts_status.sql"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for migration in "${MIGRATIONS[@]}"; do
  echo "📋 Applying: $(basename $migration)"
  
  if npx wrangler d1 execute telemedcare-leads --remote --file="$migration" 2>&1 | grep -q "error\|Error\|ERROR"; then
    echo "❌ FAILED: $migration"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "✅ SUCCESS: $migration"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  fi
  
  echo ""
done

echo "================================"
echo "🎉 Migration Summary:"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo "================================"

if [ $FAIL_COUNT -eq 0 ]; then
  echo ""
  echo "🎊 ALL MIGRATIONS APPLIED SUCCESSFULLY!"
  echo ""
  echo "🌐 Admin Dashboard: https://telemedcare-v11.pages.dev/admin-dashboard"
  echo "🌐 Lead Form: https://telemedcare-v11.pages.dev/"
  echo ""
else
  echo ""
  echo "⚠️  Some migrations failed. Check errors above."
  echo "💡 Tip: 'table already exists' errors are OK - it means that part was already applied."
  echo ""
fi
