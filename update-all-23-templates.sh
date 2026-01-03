#!/bin/bash

# Script per aggiornare TUTTI i 23 template nel database D1
set -e

API_URL="https://telemedcare-v12.pages.dev/api/admin/update-template"
TEMPLATE_DIR="templates"

echo "🔄 Aggiornamento COMPLETO 23 template nel database D1..."
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

for TEMPLATE_FILE in "$TEMPLATE_DIR"/*.html; do
    # Estrai nome file senza path e .html
    TEMPLATE_NAME=$(basename "$TEMPLATE_FILE" .html)
    
    # Converti nome file in ID template per DB
    # Template_Proforma_Unificato_TeleMedCare → proforma_unificato
    if [[ "$TEMPLATE_NAME" == "Template_Proforma_Unificato_TeleMedCare" ]]; then
        TEMPLATE_ID="proforma_unificato"
    else
        TEMPLATE_ID="$TEMPLATE_NAME"
    fi
    
    echo "📄 Template: $TEMPLATE_ID"
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
        echo "   ✅ Aggiornato!"
        ((SUCCESS_COUNT++))
    else
        echo "   ❌ Errore: $RESPONSE"
        ((FAIL_COUNT++))
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successi: $SUCCESS_COUNT"
echo "❌ Fallimenti: $FAIL_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
