#!/bin/bash

echo "🧪 TEST EMAIL CON LINK DOWNLOAD"
echo "================================"
echo ""

# Test: Crea lead con contratto
echo "1️⃣ Creazione lead con CONTRATTO..."
RESPONSE=$(curl -s -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi", 
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Test",
    "cognomeAssistito": "LinkDownload",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "canale": "TEST LINK DOWNLOAD"
  }')

LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId // .id')
echo "   ✅ Lead: $LEAD_ID"

CONTRATTO=$(echo "$RESPONSE" | jq -r '.emailAutomation.contratto.sent')
echo "   📄 Email contratto inviata: $CONTRATTO"
echo ""

echo "✅ TEST COMPLETATO!"
echo ""
echo "📧 VERIFICA EMAIL rpoggi55@gmail.com:"
echo "   1. Dovresti ricevere l'email \"📄 TeleMedCare - Il Tuo Contratto AVANZATO\""
echo "   2. L'email DOVREBBE contenere un pulsante blu:"
echo "      📥 Scarica Brochure SiDLY Care PRO"
echo "   3. Cliccando il pulsante si scarica il PDF:"
echo "      https://telemedcare-v12.pages.dev/brochures/Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf"
echo ""
echo "🔍 Se non ricevi l'email o il link non funziona, DIMMI!"
