#!/bin/bash
set -e

API_URL="https://telemedcare-v12.pages.dev/api/admin/update-template"
TEMPLATE_ID="email_invio_contratto"
TEMPLATE_FILE="templates/email_invio_contratto.html"

echo "📄 Caricamento template: $TEMPLATE_ID"
LINES=$(wc -l < "$TEMPLATE_FILE")
echo "   File: $TEMPLATE_FILE ($LINES lines)"

TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE" | jq -Rs .)

RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"templateId\": \"$TEMPLATE_ID\",
        \"htmlContent\": $TEMPLATE_CONTENT
    }")

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo "✅ Template contratto aggiornato!"
else
    echo "❌ Errore: $RESPONSE"
    exit 1
fi
