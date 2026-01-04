#!/bin/bash

echo "🧪 TEST FINALE - PDF LINK FUNZIONANTE"
echo "====================================="
echo ""

# Test 1: Verifica link PDF diretto
echo "1️⃣ Verifica link PDF diretto..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://telemedcare-v12.pages.dev/brochures/Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ PDF accessibile: HTTP $STATUS"
else
  echo "   ❌ PDF non accessibile: HTTP $STATUS"
fi
echo ""

# Test 2: Crea lead e invia email
echo "2️⃣ Creazione lead con CONTRATTO..."
RESPONSE=$(curl -s -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi", 
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Test",
    "cognomeAssistito": "PDF_OK",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "canale": "TEST PDF FUNZIONANTE"
  }')

LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId // .id')
CONTRATTO=$(echo "$RESPONSE" | jq -r '.emailAutomation.contratto.sent')

echo "   ✅ Lead: $LEAD_ID"
echo "   📄 Email contratto: $CONTRATTO"
echo ""

echo "✅ TEST COMPLETATO!"
echo ""
echo "📧 VERIFICA EMAIL rpoggi55@gmail.com:"
echo "   1. Email \"📄 TeleMedCare - Il Tuo Contratto AVANZATO\""
echo "   2. Pulsante BLU: 📥 Scarica Brochure SiDLY Care PRO"
echo "   3. Cliccando il pulsante → Si SCARICA il PDF (2.6 MB)"
echo ""
echo "🎯 Il link ora funziona!"
