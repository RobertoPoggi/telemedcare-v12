#!/bin/bash

echo "🎯 TEST FINALE - Contratto con Template Ufficiale e Prezzi Corretti"
echo "===================================================================="
echo ""

# Attendi deploy
echo "⏳ Attesa 90 secondi per deploy Cloudflare..."
sleep 90

echo ""
echo "📝 Creazione nuovo lead con contratto AVANZATO..."

RESPONSE=$(curl -s -X POST "https://telemedcare-v12.pages.dev/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Test",
    "cognomeAssistito": "TEMPLATE_UFFICIALE",
    "tipoServizio": "eCura PRO",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "No",
    "vuoleContratto": "Si",
    "vuoleManuale": "No",
    "note": "TEST TEMPLATE UFFICIALE + PREZZO 600€",
    "fonte": "TEST_TEMPLATE_FINALE"
  }')

LEAD_ID=$(echo "$RESPONSE" | grep -o '"id":"LEAD-MANUAL-[0-9]*"' | cut -d'"' -f4)

if [ -z "$LEAD_ID" ]; then
    echo "❌ Errore creazione lead"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Lead creato: $LEAD_ID"
echo ""

# Attendi salvataggio contratto
sleep 5

# Recupera contratto dal DB
echo "📋 Recupero contratto dal DB..."
CONTRACT_RESPONSE=$(curl -s "https://telemedcare-v12.pages.dev/api/contracts?leadId=$LEAD_ID")
CONTRACT_ID=$(echo "$CONTRACT_RESPONSE" | grep -o '"id":"contract-[0-9]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CONTRACT_ID" ]; then
    echo "❌ Contratto NON trovato nel DB"
    echo "Response: $CONTRACT_RESPONSE"
    exit 1
fi

echo "✅ Contratto trovato: $CONTRACT_ID"
echo ""

# Recupera dettagli contratto
echo "📄 Dettagli contratto..."
CONTRACT_DETAILS=$(curl -s "https://telemedcare-v12.pages.dev/api/contracts/$CONTRACT_ID")

PREZZO_PRIMO_ANNO=$(echo "$CONTRACT_DETAILS" | grep -o '"prezzoBase":[0-9]*' | cut -d':' -f2)
CONTRACT_HTML=$(echo "$CONTRACT_DETAILS" | grep -o 'Euro <span class="highlight">[0-9,]*</span>')

echo "   Prezzo primo anno: €${PREZZO_PRIMO_ANNO}"
echo "   Template HTML: $(echo "$CONTRACT_HTML" | head -1)"
echo ""

# Verifica prezzi nel HTML
if echo "$CONTRACT_DETAILS" | grep -q "600,00.*IVA 22%"; then
    echo "✅ Prezzo rinnovo corretto: 600€ + IVA 22%"
else
    echo "❌ Prezzo rinnovo NON corretto nel HTML"
    echo "$CONTRACT_DETAILS" | grep -o "successivi.*IVA" | head -1
fi

echo ""
echo "===================================================================="
echo "🔗 URL FIRMA CONTRATTO:"
echo "https://telemedcare-v12.pages.dev/firma-contratto?contractId=$CONTRACT_ID"
echo ""
echo "📧 VERIFICA EMAIL rpoggi55@gmail.com"
echo "   - Oggetto: 'TeleMedCare - Il Tuo Contratto AVANZATO'"
echo "   - Pulsante arancione: 'FIRMA IL CONTRATTO ORA'"
echo "   - Codice contratto visibile"
echo ""
echo "✅ TEST MANUALE:"
echo "   1. Apri link firma contratto sopra"
echo "   2. Verifica template completo con 'SCRITTURA PRIVATA'"
echo "   3. Verifica prezzo rinnovo: 600€ + IVA 22%"
echo "   4. Disegna firma sul canvas"
echo "   5. Spunta consenso"
echo "   6. Click 'Firma e Invia'"
echo "   7. Verifica messaggio successo (NO errori!)"
echo "===================================================================="
