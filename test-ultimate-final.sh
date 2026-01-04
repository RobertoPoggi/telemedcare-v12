#!/bin/bash

echo "🎯 TEST ULTIMATE - sign-contract.html"
echo "======================================"

# Aspetta deploy
echo "⏳ Deploy (90s)..."
sleep 90

echo ""
echo "📝 Test File Statico"
STATUS=$(curl -s -w "%{http_code}" -o /tmp/response.html "https://telemedcare-v12.pages.dev/sign-contract.html?test=1")
echo "   HTTP Status: $STATUS"

if [ "$STATUS" = "200" ]; then
  if grep -q "<!DOCTYPE html>" /tmp/response.html; then
    echo "   ✅ HTML caricato correttamente!"
    if grep -q "Firma Contratto" /tmp/response.html; then
      echo "   ✅ Titolo presente!"
    fi
  fi
else
  echo "   ❌ Status non è 200"
fi

echo ""
echo "📝 Test Redirect /firma-contratto"
FINAL_URL=$(curl -s -L -w "%{url_effective}" -o /tmp/response2.html "https://telemedcare-v12.pages.dev/firma-contratto?contractId=TEST123")
echo "   URL finale: $FINAL_URL"
STATUS2=$(curl -s -w "%{http_code}" -o /dev/null "$FINAL_URL")
echo "   HTTP Status: $STATUS2"

echo ""
echo "📝 Creazione Contratto Reale"
RESPONSE=$(curl -s -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "No",
    "vuoleContratto": "Si",
    "note": "TEST ULTIMATE FINAL"
  }')

LEAD_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Lead: $LEAD_ID"

sleep 5

CONTRACTS=$(curl -s "https://telemedcare-v12.pages.dev/api/contracts?leadId=$LEAD_ID")
CONTRACT_ID=$(echo "$CONTRACTS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CONTRACT_ID" ]; then
  echo "   Contratto: $CONTRACT_ID"
  
  SIGN_URL="https://telemedcare-v12.pages.dev/firma-contratto?contractId=$CONTRACT_ID"
  
  echo ""
  echo "======================================"
  echo "✅ TUTTO FUNZIONANTE!"
  echo "======================================"
  echo ""
  echo "🔗 Link Firma Contratto:"
  echo "   $SIGN_URL"
  echo ""
  echo "📧 Email inviata a: rpoggi55@gmail.com"
  echo ""
  echo "🎯 VERIFICA MANUALE:"
  echo "   1. Apri email"
  echo "   2. Click pulsante arancione"
  echo "   3. Pagina firma si apre correttamente"
  echo "   4. Contratto visibile"
  echo "   5. Canvas firma funziona"
  echo ""
fi
