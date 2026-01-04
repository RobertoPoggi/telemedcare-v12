#!/bin/bash

echo "🧪 TEST REALE CON EMAIL rpoggi55@gmail.com"
echo "=========================================="
echo ""

BASE_URL="https://telemedcare-v12.pages.dev"

# Test con email REALE
echo "📝 Creazione lead CON CONTRATTO + email reale..."
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Roberto",
    "cognomeAssistito": "Poggi",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "canale": "TEST_FINALE_EMAIL_REALE"
  }')

LEAD_ID=$(echo "$RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
NOTIFICA=$(echo "$RESPONSE" | grep -o '"notifica":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)
BROCHURE=$(echo "$RESPONSE" | grep -o '"brochure":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)
CONTRATTO=$(echo "$RESPONSE" | grep -o '"contratto":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)

echo "✅ Lead creato: $LEAD_ID"
echo ""
echo "📧 Email Status:"
echo "   Notifica (info@telemedcare.it): $NOTIFICA"
echo "   Brochure: $BROCHURE"
echo "   Contratto (rpoggi55@gmail.com): $CONTRATTO"
echo ""

# Verifica contratto nel DB
sleep 3
echo "📋 Verifica contratto nel DB..."
CONTRACTS=$(curl -s "${BASE_URL}/api/contracts?leadId=${LEAD_ID}")
CONTRACT_ID=$(echo "$CONTRACTS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$CONTRACT_ID" ]; then
    echo "✅ Contratto trovato: $CONTRACT_ID"
    
    # Recupera dettagli contratto
    CONTRACT_DETAILS=$(curl -s "${BASE_URL}/api/contracts/${CONTRACT_ID}")
    CONTRACT_CODE=$(echo "$CONTRACT_DETAILS" | grep -o '"contractCode":"[^"]*"' | cut -d'"' -f4)
    
    LINK_FIRMA="${BASE_URL}/firma-contratto?contractId=${CONTRACT_ID}"
    
    echo "   Codice: $CONTRACT_CODE"
    echo "   🔗 Link Firma: $LINK_FIRMA"
else
    echo "❌ Contratto NON trovato nel DB!"
fi

echo ""
echo "=========================================="
echo "📊 VERIFICA MANUALE"
echo "=========================================="
echo ""
echo "✅ Controlla ora rpoggi55@gmail.com:"
echo ""
echo "1. Email con oggetto: 'TeleMedCare - Il Tuo Contratto AVANZATO'"
echo ""
echo "2. Deve contenere:"
echo "   🟠 PULSANTE ARANCIONE GRANDE: '✍️ FIRMA IL CONTRATTO ORA'"
echo "   🔵 Pulsante blu: 'Scarica Brochure SiDLY Care PRO'"
echo "   📋 Codice contratto visibile"
echo ""
echo "3. Click pulsante arancione → Apre pagina firma contratto"
echo ""
echo "Se NON vedi il pulsante arancione:"
echo "   → Il template nel DB NON è aggiornato"
echo "   → Esegui: ./update-template-contratto-firma.sh"
echo ""

exit 0
