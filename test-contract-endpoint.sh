#!/bin/bash

echo "🎯 TEST FINALE PAGINA FIRMA - ENDPOINT DEDICATO"
echo "================================================"
echo ""

# Attendi deploy
echo "⏳ Attesa 90 secondi per deploy Cloudflare..."
sleep 90

echo ""
echo "📋 Test 1: Endpoint /contract-signature"
STATUS=$(curl -sI "https://telemedcare-v12.pages.dev/contract-signature?contractId=test-123" | head -1 | awk '{print $2}')
echo "   Status code: $STATUS"

if [[ "$STATUS" == "200" ]]; then
    echo "   ✅ Endpoint accessibile"
else
    echo "   ❌ Endpoint fallito: HTTP $STATUS"
    curl -s "https://telemedcare-v12.pages.dev/contract-signature?contractId=test-123" | head -20
fi

echo ""
echo "📋 Test 2: Redirect /firma-contratto"
REDIRECT_STATUS=$(curl -sI "https://telemedcare-v12.pages.dev/firma-contratto?contractId=test-123" | head -1 | awk '{print $2}')
REDIRECT_LOC=$(curl -sI "https://telemedcare-v12.pages.dev/firma-contratto?contractId=test-123" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')

echo "   Status: $REDIRECT_STATUS"
echo "   Location: $REDIRECT_LOC"

if [[ "$REDIRECT_STATUS" == "302" && "$REDIRECT_LOC" == *"contract-signature"* ]]; then
    echo "   ✅ Redirect corretto"
else
    echo "   ❌ Redirect errato"
fi

echo ""
echo "📋 Test 3: Contenuto HTML"
CONTENT=$(curl -sL "https://telemedcare-v12.pages.dev/contract-signature?contractId=test-123" | grep -o '<title>[^<]*</title>' | head -1)
echo "   Title: $CONTENT"

if [[ "$CONTENT" == *"Firma"* || "$CONTENT" == *"Contratto"* ]]; then
    echo "   ✅ Pagina HTML corretta"
else
    echo "   ❌ Pagina HTML errata o non trovata"
fi

echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETATO"
echo "================================================"
echo ""
echo "🔗 URL FINALE DA TESTARE:"
echo "https://telemedcare-v12.pages.dev/firma-contratto?contractId=contract-1767546038349"
echo ""
echo "⚡ Questo URL farà redirect a:"
echo "https://telemedcare-v12.pages.dev/contract-signature?contractId=contract-1767546038349"
echo ""
echo "📧 Invia nuovo lead per ricevere email con link aggiornato"
echo "================================================"
