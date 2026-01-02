#!/bin/bash

# Script per aggiornare TUTTI i template email dal V11
# Usage: ./update-all-templates.sh

set -e

API_URL="https://telemedcare-v12.pages.dev/api/admin/update-template"

# Array di template da aggiornare
declare -a TEMPLATES=(
    "email_notifica_info"
    "email_documenti_informativi"
    "email_invio_contratto"
    "email_benvenuto"
    "email_conferma_attivazione"
)

echo "🔄 Aggiornamento template dal V11..."
echo ""

for TEMPLATE_ID in "${TEMPLATES[@]}"; do
    TEMPLATE_FILE="templates/${TEMPLATE_ID}.html"
    
    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo "❌ File non trovato: $TEMPLATE_FILE"
        continue
    fi
    
    echo "📄 Aggiornamento: $TEMPLATE_ID"
    LINES=$(wc -l < "$TEMPLATE_FILE")
    echo "   File: $TEMPLATE_FILE ($LINES lines)"
    
    # Escape del contenuto HTML per JSON
    TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE" | jq -Rs .)
    
    # Chiamata API
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"templateId\": \"$TEMPLATE_ID\",
            \"htmlContent\": $TEMPLATE_CONTENT
        }")
    
    # Check risultato
    if echo "$RESPONSE" | grep -q "success.*true"; then
        echo "   ✅ Template aggiornato!"
    else
        echo "   ❌ Errore: $RESPONSE"
    fi
    
    echo ""
done

echo "✅ Aggiornamento template completato!"
