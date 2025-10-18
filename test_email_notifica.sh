#!/bin/bash

echo "🧪 TEST EMAIL NOTIFICA (senza contratto)"
echo "========================================="
echo ""

SERVER_URL="http://localhost:8787"

echo "📝 Invio lead senza richiesta contratto..."
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
    "condizioniSalute": "Diabete tipo 2, ipertensione",
    "note": "Test email notifica con tutti i campi - NO contratto",
    "gdprConsent": true
  }')

echo "📊 Risposta API:"
echo "$RESPONSE" | jq '.'
echo ""

# Verifica risposta
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Lead creato con successo!"
  echo ""
  echo "📧 CONTROLLA EMAIL A:"
  echo "   • info@telemedcare.it"
  echo ""
  echo "📋 L'email dovrebbe contenere:"
  echo "   • Nome: Roberto Poggi"
  echo "   • Email: rpoggi55@gmail.com"
  echo "   • Telefono: +39 333 1234567"
  echo "   • CF: PGGRBR75H15F205X"
  echo "   • Indirizzo: Via Roma 123, Milano"
  echo "   • Condizioni salute: Diabete tipo 2, ipertensione"
  echo "   • Note: Test email notifica con tutti i campi - NO contratto"
  echo ""
  echo "🎉 TEST COMPLETATO!"
else
  echo "❌ Errore durante la creazione del lead"
fi
