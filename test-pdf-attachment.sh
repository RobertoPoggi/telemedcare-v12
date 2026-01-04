#!/bin/bash

echo "🧪 TEST PDF ALLEGATO + LINK"
echo "============================"
echo ""

# Crea lead con contratto
echo "1️⃣ Creazione lead con CONTRATTO + BROCHURE..."
RESPONSE=$(curl -s -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi", 
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Test",
    "cognomeAssistito": "ALLEGATO_PDF",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "canale": "TEST ALLEGATO PDF"
  }')

LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId // .id')
CONTRATTO=$(echo "$RESPONSE" | jq -r '.emailAutomation.contratto.sent')

echo "   ✅ Lead: $LEAD_ID"
echo "   📄 Email contratto: $CONTRATTO"
echo ""

echo "✅ TEST COMPLETATO!"
echo ""
echo "📧 VERIFICA EMAIL rpoggi55@gmail.com:"
echo ""
echo "   La nuova email DOVREBBE avere:"
echo "   ✅ Allegato PDF: Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf (2.6 MB)"
echo "   ✅ Pulsante BLU nel corpo email (fallback)"
echo ""
echo "   Se l'allegato c'è → 🎉 FUNZIONA!"
echo "   Se manca l'allegato → Il link nel corpo email funziona comunque"
echo ""
