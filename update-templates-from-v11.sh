#!/bin/bash
# Update email templates in D1 database from V11 templates
# This script updates the templates via the migrations endpoint

echo "🔄 Aggiornamento template email da V11..."

# Call migrations endpoint to update templates
curl -X POST "https://telemedcare-v12.pages.dev/api/admin/run-migrations" \
  -H "Content-Type: application/json" \
  -s | python3 -m json.tool

echo "✅ Template aggiornati dal V11"
