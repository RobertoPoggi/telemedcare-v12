#!/bin/bash

echo "🧪 TEST FINALE FIRMA CONTRATTO - DOPO FIX _routes.json"
echo "======================================================"

# Aspetta deploy
echo "⏳ Aspettando deploy (90s)..."
sleep 90

echo ""
echo "📝 Test 1: File statico /firma.html"
echo -n "   HTTP Status: "
curl -s -w "%{http_code}" -o /dev/null "https://telemedcare-v12.pages.dev/firma.html"
echo ""

echo ""
echo "📝 Test 2: Endpoint redirect /firma-contratto"
RESPONSE=$(curl -s -L "https://telemedcare-v12.pages.dev/firma-contratto?contractId=contract-1767546108260")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html>"; then
  echo "   ✅ Pagina HTML caricata correttamente!"
  if echo "$RESPONSE" | grep -q "Firma Contratto"; then
    echo "   ✅ Titolo 'Firma Contratto' presente!"
  else
    echo "   ❌ Titolo 'Firma Contratto' NON trovato"
  fi
else
  echo "   ❌ Risposta NON è HTML valido"
  echo "$RESPONSE" | head -5
fi

echo ""
echo "📝 Test 3: Creazione nuovo contratto per test email"
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
    "note": "TEST FINALE FIRMA - DOPO FIX"
  }')

LEAD_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "   ✅ Lead creato: $LEAD_ID"

sleep 5

CONTRACTS=$(curl -s "https://telemedcare-v12.pages.dev/api/contracts?leadId=$LEAD_ID")
NEW_CONTRACT_ID=$(echo "$CONTRACTS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$NEW_CONTRACT_ID" ]; then
  echo "   ✅ Contratto creato: $NEW_CONTRACT_ID"
  
  NEW_URL="https://telemedcare-v12.pages.dev/firma-contratto?contractId=$NEW_CONTRACT_ID"
  
  echo ""
  echo "======================================================"
  echo "✅ TEST COMPLETATO CON SUCCESSO!"
  echo "======================================================"
  echo ""
  echo "🎯 LINK PER TEST MANUALE:"
  echo "   $NEW_URL"
  echo ""
  echo "📧 Email inviata a: rpoggi55@gmail.com"
  echo "   Oggetto: 'TeleMedCare - Il Tuo Contratto AVANZATO'"
  echo ""
  echo "🔍 VERIFICA:"
  echo "   1. Email contiene pulsante arancione 'FIRMA IL CONTRATTO ORA'"
  echo "   2. Click sul pulsante → Pagina firma carica correttamente"
  echo "   3. Contratto visibile con tutti i dettagli"
  echo "   4. Canvas firma funzionante"
  echo ""
else
  echo "   ❌ ERRORE: Contratto NON trovato nel DB!"
fi
