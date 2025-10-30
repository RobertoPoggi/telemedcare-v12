#!/bin/bash

# Test Semplice Email API
# Invia un lead e verifica l'invio email

BASE_URL="https://3000-im54fr1s0d2wyq94dllwb-02b9cc79.sandbox.novita.ai"

echo "════════════════════════════════════════════════"
echo " 📧 TEST INVIO EMAIL - TeleMedCare V11.0"
echo "════════════════════════════════════════════════"
echo ""

# Email di test
TEST_EMAIL="roberto.poggi@medicagb.com"

echo "📧 Email destinatario: $TEST_EMAIL"
echo ""
echo "🚀 Invio richiesta lead capture..."
echo ""

# Invio lead
RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Roberto",
    "cognome": "Poggi",
    "email": "'"$TEST_EMAIL"'",
    "telefono": "+39 333 1234567",
    "codiceFiscale": "PGGR BT85M01H501Z",
    "servizio": "Telemedicina Base",
    "note": "Test API Keys Reali - RESEND & SENDGRID"
  }')

echo "📨 Risposta del server:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""
echo "════════════════════════════════════════════════"
echo ""
echo "✅ Se la risposta è positiva, controlla:"
echo "   📬 Email: $TEST_EMAIL"
echo "   📁 Cartella: Posta in arrivo (o Spam)"
echo ""
echo "⚠️  NOTA DNS:"
echo "   Se i record DNS non sono configurati,"
echo "   l'email potrebbe finire nello SPAM."
echo ""
echo "📖 Leggi: DNS_CONFIGURATION.md"
echo ""
