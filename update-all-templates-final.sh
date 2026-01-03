#!/bin/bash

# Script per aggiornare TUTTI i template eCura nel database
set -e

API_URL="https://telemedcare-v12.pages.dev/api/admin/update-template"

# Array di template da aggiornare
declare -A TEMPLATES=(
    ["email_notifica_info"]="templates/email_notifica_info.html"
    ["email_documenti_informativi"]="templates/email_documenti_informativi.html"
    ["email_invio_contratto"]="templates/email_invio_contratto.html"
)

echo "🔄 Aggiornamento COMPLETO template eCura..."
echo ""

for TEMPLATE_ID in "${!TEMPLATES[@]}"; do
    TEMPLATE_FILE="${TEMPLATES[$TEMPLATE_ID]}"
    
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
echo ""
echo "📧 TEST: Ora puoi creare un lead con vuoleContratto=Si per verificare"
