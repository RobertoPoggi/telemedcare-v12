#!/bin/bash
# Update email template in D1 database from local HTML file

TEMPLATE_ID="email_notifica_info"
TEMPLATE_FILE="templates/email_notifica_info.html"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Template file not found: $TEMPLATE_FILE"
    exit 1
fi

echo "📝 Caricamento template: $TEMPLATE_ID"
echo "📄 File: $TEMPLATE_FILE ($(wc -l < $TEMPLATE_FILE) lines)"

# Read template content and escape for JSON
TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE" | jq -Rs .)

# Send to API
curl -X POST "https://telemedcare-v12.pages.dev/api/admin/update-template/$TEMPLATE_ID" \
  -H "Content-Type: application/json" \
  -d "{\"html_content\": $TEMPLATE_CONTENT}" \
  | python3 -m json.tool

echo ""
echo "✅ Template aggiornato!"
