#!/bin/bash

echo "🧪 TEST FINALE FIRMA CONTRATTO"
echo "=============================="

# Aspetta deploy
echo "⏳ Aspettando deploy (90s)..."
sleep 90

# Test 1: Contratto esistente
echo ""
echo "📝 Test 1: Link contratto esistente"
CONTRACT_ID="contract-1767545959356"
URL="https://telemedcare-v12.pages.dev/firma-contratto?contractId=$CONTRACT_ID"
echo "🔗 URL: $URL"
echo -n "   HTTP Status: "
curl -s -w "%{http_code}" -o /dev/null "$URL"
echo ""

# Test 2: Nuovo lead con contratto
echo ""
echo "📝 Test 2: Creazione nuovo lead + contratto"
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
    "note": "TEST FINALE FIRMA"
  }')

LEAD_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Lead creato: $LEAD_ID"

# Aspetta salvataggio DB
sleep 5

# Recupera contratto
CONTRACTS=$(curl -s "https://telemedcare-v12.pages.dev/api/contracts?leadId=$LEAD_ID")
NEW_CONTRACT_ID=$(echo "$CONTRACTS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$NEW_CONTRACT_ID" ]; then
  echo "✅ Contratto trovato: $NEW_CONTRACT_ID"
  
  NEW_URL="https://telemedcare-v12.pages.dev/firma-contratto?contractId=$NEW_CONTRACT_ID"
  echo "🔗 URL: $NEW_URL"
  echo -n "   HTTP Status: "
  curl -s -w "%{http_code}" -o /dev/null "$NEW_URL"
  echo ""
  
  echo ""
  echo "=============================="
  echo "✅ TEST COMPLETATO!"
  echo "=============================="
  echo ""
  echo "🎯 LINK PER TEST MANUALE:"
  echo "   $NEW_URL"
  echo ""
  echo "📧 Email inviata a: rpoggi55@gmail.com"
  echo "   Oggetto: 'TeleMedCare - Il Tuo Contratto AVANZATO'"
  echo "   Deve contenere pulsante arancione: '✍️ FIRMA IL CONTRATTO ORA'"
  echo ""
else
  echo "❌ Contratto NON trovato nel DB!"
fi
