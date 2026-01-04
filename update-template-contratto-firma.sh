#!/bin/bash
echo "📤 Aggiornamento template email_invio_contratto con link firma..."

TEMPLATE_FILE="templates/email_invio_contratto.html"
TEMPLATE_ID="email_invio_contratto"
API_URL="https://telemedcare-v12.pages.dev/api/admin/update-template"

echo "📄 Caricamento template da $TEMPLATE_FILE..."
HTML_CONTENT=$(cat "$TEMPLATE_FILE")
LINE_COUNT=$(echo "$HTML_CONTENT" | wc -l)
echo "✅ Template caricato ($LINE_COUNT righe)"

echo "📤 Upload template al server..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg id "$TEMPLATE_ID" --arg html "$HTML_CONTENT" '{templateId: $id, htmlContent: $html}')" \
  -s | jq .

echo "✅ Template contratto aggiornato con link firma!"
