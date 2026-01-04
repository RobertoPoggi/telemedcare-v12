#!/bin/bash

echo "🧪 TEST URL FIRMA STANDALONE"
echo "=============================="
echo ""

# Attendi deploy
echo "⏳ Attesa 90 secondi per deploy..."
sleep 90

echo ""
echo "📋 Test 1: Redirect /firma-contratto"
REDIRECT=$(curl -sI "https://telemedcare-v12.pages.dev/firma-contratto?contractId=test-123" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')
echo "   URL redirect: $REDIRECT"

if [[ "$REDIRECT" == *"sign-contract.html"* ]]; then
    echo "   ✅ Redirect corretto a sign-contract.html"
else
    echo "   ❌ Redirect errato: $REDIRECT"
fi

echo ""
echo "📋 Test 2: Accesso diretto /sign-contract.html"
STATUS=$(curl -sI "https://telemedcare-v12.pages.dev/sign-contract.html" | head -1 | awk '{print $2}')
echo "   Status code: $STATUS"

if [[ "$STATUS" == "200" ]]; then
    echo "   ✅ File accessibile"
else
    echo "   ❌ File non accessibile: HTTP $STATUS"
fi

echo ""
echo "📋 Test 3: Contenuto pagina"
TITLE=$(curl -s "https://telemedcare-v12.pages.dev/sign-contract.html" | grep -o '<title>[^<]*</title>' | head -1)
echo "   Title: $TITLE"

if [[ "$TITLE" == *"Firma"* ]]; then
    echo "   ✅ Pagina corretta"
else
    echo "   ❌ Pagina errata"
fi

echo ""
echo "=============================="
echo "🔗 URL DA TESTARE NEL BROWSER:"
echo "https://telemedcare-v12.pages.dev/sign-contract.html?contractId=contract-1767546038349"
echo ""
echo "⚠️  IMPORTANTE: Apri l'URL direttamente (non dalla dashboard!)"
echo "=============================="
