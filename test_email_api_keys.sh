#!/bin/bash

# Test Email con API Keys Reali
# TeleMedCare V11.0

set -e

BASE_URL="https://3000-im54fr1s0d2wyq94dllwb-02b9cc79.sandbox.novita.ai"

echo "═══════════════════════════════════════════════════"
echo "  🧪 TEST EMAIL API KEYS - TeleMedCare V11.0"
echo "═══════════════════════════════════════════════════"
echo ""

# Chiedi email destinatario
read -p "📧 Inserisci la tua email per ricevere i test: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo "❌ Email non fornita. Test annullato."
    exit 1
fi

echo ""
echo "✅ Email destinatario: $TEST_EMAIL"
echo ""

# Test 1: Health Check
echo "───────────────────────────────────────────────────"
echo "📋 TEST 1: Health Check Server"
echo "───────────────────────────────────────────────────"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health" | jq '.')
echo "$HEALTH_RESPONSE"
echo ""

# Test 2: Lead Capture (triggers RESEND email)
echo "───────────────────────────────────────────────────"
echo "📧 TEST 2: Lead Capture → Email RESEND (Primario)"
echo "───────────────────────────────────────────────────"
echo "Invio lead capture form..."
LEAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test",
    "cognome": "API Keys",
    "email": "'"$TEST_EMAIL"'",
    "telefono": "+39 333 1234567",
    "codiceFiscale": "TSTAPI85M01H501Z",
    "servizio": "Telemedicina Base"
  }' | jq '.')

echo "$LEAD_RESPONSE"
echo ""
echo "✅ Verifica la tua email: $TEST_EMAIL"
echo "   Dovresti ricevere una email da TeleMedCare (via RESEND)"
echo ""

# Wait before next test
echo "⏳ Attendo 3 secondi prima del prossimo test..."
sleep 3

# Test 3: Direct email test endpoint (if exists)
echo "───────────────────────────────────────────────────"
echo "📧 TEST 3: Test Diretto Provider Email"
echo "───────────────────────────────────────────────────"

# Test RESEND directly
echo "🔹 Testing RESEND..."
RESEND_TEST=$(curl -s -X POST "$BASE_URL/api/test/email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "'"$TEST_EMAIL"'",
    "subject": "Test RESEND - TeleMedCare",
    "html": "<h1>Test Email RESEND</h1><p>Questa email è stata inviata tramite il provider primario RESEND.</p><p>Se ricevi questa email, RESEND funziona correttamente! ✅</p>",
    "provider": "resend"
  }' 2>/dev/null || echo '{"status":"endpoint not found"}')

echo "$RESEND_TEST" | jq '.' 2>/dev/null || echo "$RESEND_TEST"
echo ""

# Wait before SendGrid test
echo "⏳ Attendo 3 secondi prima del test SendGrid..."
sleep 3

# Test SENDGRID directly
echo "🔹 Testing SENDGRID (Failover)..."
SENDGRID_TEST=$(curl -s -X POST "$BASE_URL/api/test/email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "'"$TEST_EMAIL"'",
    "subject": "Test SENDGRID - TeleMedCare",
    "html": "<h1>Test Email SENDGRID</h1><p>Questa email è stata inviata tramite il provider di failover SENDGRID.</p><p>Se ricevi questa email, SENDGRID funziona correttamente! ✅</p>",
    "provider": "sendgrid"
  }' 2>/dev/null || echo '{"status":"endpoint not found"}')

echo "$SENDGRID_TEST" | jq '.' 2>/dev/null || echo "$SENDGRID_TEST"
echo ""

echo "═══════════════════════════════════════════════════"
echo "  ✅ TEST COMPLETATI"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📬 Controlla la tua email: $TEST_EMAIL"
echo ""
echo "Dovresti ricevere:"
echo "  1️⃣  Email da Lead Capture (via RESEND)"
echo "  2️⃣  Email test diretta RESEND (se endpoint esiste)"
echo "  3️⃣  Email test diretta SENDGRID (se endpoint esiste)"
echo ""
echo "⚠️  NOTA: Se i DNS non sono configurati, le email potrebbero:"
echo "   • Finire nello SPAM"
echo "   • Essere rigettate dal server destinatario"
echo "   • Non avere SPF/DKIM/DMARC verificati"
echo ""
echo "📖 Leggi DNS_CONFIGURATION.md per configurare i DNS"
echo ""
