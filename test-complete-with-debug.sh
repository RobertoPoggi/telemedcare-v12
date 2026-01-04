#!/bin/bash

echo "🧪 TEST COMPLETO FIRMA CONTRATTO + DEBUG LOGS"
echo "=============================================="
echo ""

BASE_URL="https://telemedcare-v12.pages.dev"

# Clear logs precedenti
echo "🗑️  Clearing previous logs..."
curl -s "${BASE_URL}/api/debug/logs" > /dev/null
echo ""

# STEP 1: Crea lead con contratto
echo "📝 STEP 1: Creazione lead CON CONTRATTO..."
LEAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Test",
    "cognomeAssistito": "CONTRATTO_DEBUG",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "vuoleManuale": "No",
    "canale": "TEST DEBUG CONTRATTO"
  }')

LEAD_ID=$(echo "$LEAD_RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
echo "✅ Lead creato: $LEAD_ID"
echo ""

# STEP 2: Verifica email automation results
echo "📧 STEP 2: Risultati email automation..."
NOTIFICA=$(echo "$LEAD_RESPONSE" | grep -o '"notifica":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)
BROCHURE=$(echo "$LEAD_RESPONSE" | grep -o '"brochure":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)
CONTRATTO=$(echo "$LEAD_RESPONSE" | grep -o '"contratto":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)

echo "   Notifica: $NOTIFICA"
echo "   Brochure: $BROCHURE"
echo "   Contratto: $CONTRATTO"
echo ""

# STEP 3: Leggi i debug logs
echo "🔍 STEP 3: Debug logs (ultimi 20)..."
DEBUG_LOGS=$(curl -s "${BASE_URL}/api/debug/logs")
echo "$DEBUG_LOGS" | grep -o '"logs":\[[^]]*\]' | sed 's/","/"\n"/g' | head -20
echo ""

# STEP 4: Verifica contratto nel DB
echo "📋 STEP 4: Verifica contratti nel DB per leadId=$LEAD_ID..."
sleep 3
CONTRACTS=$(curl -s "${BASE_URL}/api/contracts?leadId=${LEAD_ID}")
CONTRACT_COUNT=$(echo "$CONTRACTS" | grep -o '"id":"contract-' | wc -l)

if [ "$CONTRACT_COUNT" -gt 0 ]; then
    echo "✅ Contratti trovati: $CONTRACT_COUNT"
    CONTRACT_ID=$(echo "$CONTRACTS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Contract ID: $CONTRACT_ID"
    
    # URL firma
    SIGN_URL="${BASE_URL}/firma-contratto?contractId=${CONTRACT_ID}"
    echo "   🔗 Link Firma: $SIGN_URL"
else
    echo "❌ NESSUN CONTRATTO nel DB!"
fi
echo ""

# RIEPILOGO
echo "=========================================="
echo "📊 RIEPILOGO TEST"
echo "=========================================="
echo "Lead ID: $LEAD_ID"
echo "Email Notifica: $NOTIFICA"
echo "Email Brochure: $BROCHURE"
echo "Email Contratto: $CONTRATTO"
echo "Contratti nel DB: $CONTRACT_COUNT"
echo ""

if [ "$CONTRATTO" = "true" ] && [ "$CONTRACT_COUNT" -gt 0 ]; then
    echo "🎉 TEST SUCCESSO!"
    echo ""
    echo "✅ VERIFICA MANUALE:"
    echo "1. Email rpoggi55@gmail.com → Contratto con link firma"
    echo "2. Click link → Pagina firma contratto"
    echo "3. Dashboard → Contratto presente nella lista"
else
    echo "⚠️  PROBLEMI RILEVATI:"
    [ "$CONTRATTO" = "false" ] && echo "- Email contratto NON inviata"
    [ "$CONTRACT_COUNT" -eq 0 ] && echo "- Contratto NON salvato nel DB"
    echo ""
    echo "📋 Controlla i debug logs sopra per capire cosa è successo"
fi
echo ""

exit 0
