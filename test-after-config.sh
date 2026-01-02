#!/bin/bash
echo "🧪 TEST DOPO CONFIGURAZIONE RESEND_API_KEY"
echo ""
echo "Attendi 60 secondi per il redeploy di Cloudflare..."
sleep 60
echo ""
echo "📧 Test 1: Endpoint test email"
curl -X POST https://telemedcare-v12.pages.dev/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"rpoggi55@gmail.com"}' -s | jq .
echo ""
echo "✅ Se vedi messageId con ID Resend (non DEMO_), funziona!"
echo ""
echo "📧 Test 2: Inserimento lead completo"
curl -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Test",
    "cognomeRichiedente": "Sistema",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 320 1234567",
    "nomeAssistito": "Assistito",
    "cognomeAssistito": "Test",
    "servizio": "eCura PRO",
    "piano": "BASE",
    "vuoleBrochure": "Si",
    "vuoleContratto": "No",
    "canale": "Test Finale"
  }' -s | jq .
echo ""
echo "✅ Controlla inbox rpoggi55@gmail.com per 2 email!"
