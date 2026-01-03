#!/bin/bash

echo "🧪 TEST FINALE - TUTTI I FIX APPLICATI"
echo "========================================"
echo ""

# Test 1: Crea lead con contratto
echo "1️⃣ Creazione lead con CONTRATTO..."
RESPONSE=$(curl -s -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi", 
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Giovanni",
    "cognomeAssistito": "Bianchi",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "condizioniSalute": "Ipertensione, diabete tipo 2",
    "canale": "TEST FINALE COMPLETO - FIX ALL"
  }')

LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId // .id')
echo "   ✅ Lead: $LEAD_ID"

# Estrai risultati email
NOTIFICA=$(echo "$RESPONSE" | jq -r '.emailAutomation.notifica')
BROCHURE=$(echo "$RESPONSE" | jq -r '.emailAutomation.brochure')
CONTRATTO=$(echo "$RESPONSE" | jq -r '.emailAutomation.contratto')

echo "   📧 Notifica: $NOTIFICA"
echo "   📚 Brochure: $BROCHURE"
echo "   📄 Contratto: $CONTRATTO"
echo ""

# Test 2: Verifica statistiche canale
echo "2️⃣ Verifica statistiche dashboard..."
STATS=$(curl -s https://telemedcare-v12.pages.dev/api/admin/leads-dashboard)
LEADS_TOTALI=$(echo "$STATS" | jq -r '.dashboard.kpi.leadsTotali')
CHANNELS=$(echo "$STATS" | jq -r '.dashboard.analytics.channels | length')

echo "   📊 Leads Totali: $LEADS_TOTALI"
echo "   📊 Canali Attivi: $CHANNELS"
echo ""

# Test 3: Verifica template nel DB
echo "3️⃣ Verifica template contratto nel DB..."
curl -s -X POST https://telemedcare-v12.pages.dev/api/admin/run-migrations \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.templates[] | select(.id == "email_invio_contratto") | {id, name}'

echo ""
echo "✅ TEST COMPLETATO!"
echo ""
echo "📋 VERIFICA EMAIL:"
echo "   • info@telemedcare.it - Email notifica con placeholder corretti"
echo "   • rpoggi55@gmail.com - Email contratto con:"
echo "     ✓ Template email_invio_contratto.html"
echo "     ✓ Placeholder {{PIANO}} sostituito (AVANZATO)"
echo "     ✓ Placeholder {{SERVIZIO}} sostituito (eCura PRO)"
echo "     ✓ PDF Brochure allegato (SiDLY Care PRO)"
echo "     ✓ Prezzo corretto €1.024,80/anno"
echo ""
