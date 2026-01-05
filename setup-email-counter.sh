#!/bin/bash

echo "📊 SETUP EMAIL COUNTER"
echo "======================================"
echo ""

echo "Questo script:"
echo "  1. Crea la tabella 'stats' nel database"
echo "  2. Inizializza il contatore a 32 email"
echo ""
echo "⚠️  Procedere?"
echo "Digita YES per confermare:"
read CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "❌ Annullato"
    exit 1
fi

echo ""
echo "🔄 Chiamata API POST /api/setup-email-counter..."

RESPONSE=$(curl -s -X POST 'https://telemedcare-v12.pages.dev/api/setup-email-counter' \
  -H 'Content-Type: application/json')

echo "$RESPONSE" | jq .

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo ""
    echo "✅ SETUP COMPLETATO!"
    echo ""
    echo "🎯 Ora verifica la dashboard:"
    echo "   https://telemedcare-v12.pages.dev/dashboard"
    echo ""
    echo "Dovresti vedere: Email Inviate = 32"
    echo ""
else
    echo ""
    echo "❌ ERRORE durante il setup"
    echo "Dettagli: $RESPONSE"
fi
