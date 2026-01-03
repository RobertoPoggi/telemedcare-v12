#!/bin/bash
TEMPLATE_FILE="templates/email_invio_contratto.html"
TEMPLATE_ID="email_invio_contratto"
API_URL="https://telemedcare-v12.pages.dev/api/admin/update-template"

echo "📄 Caricamento template: $TEMPLATE_ID"
HTML_CONTENT=$(cat "$TEMPLATE_FILE")
LINES=$(echo "$HTML_CONTENT" | wc -l)
echo "   $LINES righe"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"templateId\": \"$TEMPLATE_ID\",
    \"htmlContent\": $(echo "$HTML_CONTENT" | jq -Rs .)
  }" | jq '.'

echo ""
echo "✅ Template contratto aggiornato (fix PIANO)!"
