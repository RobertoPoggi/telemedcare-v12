#!/bin/bash

echo "🧪 TEST EMAIL WORKFLOW LOCALE"
echo "================================"
echo ""

SERVER_URL="http://localhost:8787"

echo "📝 Invio lead di test..."
echo ""

RESPONSE=$(curl -s -X POST "$SERVER_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "emailRichiedente": "rpoggi55@gmail.com",
    "telefonoRichiedente": "+39 333 1234567",
    "cfRichiedente": "PGGRBR75H15F205X",
    "indirizzoRichiedente": "Via Roma 123, Milano",
    "nomeAssistito": "Roberto",
    "cognomeAssistito": "Poggi",
    "etaAssistito": 48,
    "pacchetto": "AVANZATO",
    "note": "Test completo workflow email con tutti i campi",
    "vuoleContratto": true,
    "gdprConsent": true
  }')

echo "📊 Risposta API:"
echo "$RESPONSE" | jq '.'
echo ""

# Verifica risposta
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId')
EMAILS_SENT=$(echo "$RESPONSE" | jq -r '.emailsSent')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Lead creato con successo!"
  echo "   Lead ID: $LEAD_ID"
  echo "   Email inviate: $EMAILS_SENT"
  echo ""
  echo "📧 Controlla le email:"
  echo "   • rpoggi55@gmail.com"
  echo "   • info@telemedcare.it"
  echo ""
  echo "🎉 TEST COMPLETATO!"
else
  echo "❌ Errore durante la creazione del lead"
  echo "$RESPONSE" | jq '.'
fi
