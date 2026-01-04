#!/bin/bash

echo "🧪 TEST FINALE - TUTTI I 3 FIX"
echo "=============================="
echo ""

# Test 1: Crea lead con contratto e brochure
echo "1️⃣ Creazione lead con CONTRATTO + BROCHURE..."
RESPONSE=$(curl -s -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi", 
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Test",
    "cognomeAssistito": "Finale",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "canale": "TEST FINALE - 3 FIX"
  }')

LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId // .id')
echo "   ✅ Lead: $LEAD_ID"

# Estrai risultati email
NOTIFICA=$(echo "$RESPONSE" | jq -r '.emailAutomation.notifica.sent')
BROCHURE=$(echo "$RESPONSE" | jq -r '.emailAutomation.brochure.sent')
CONTRATTO=$(echo "$RESPONSE" | jq -r '.emailAutomation.contratto.sent')

echo "   📧 Notifica: $NOTIFICA"
echo "   📚 Brochure: $BROCHURE"
echo "   📄 Contratto: $CONTRATTO"
echo ""

# Attendi propagazione
sleep 3

# Test 2: Verifica statistiche
echo "2️⃣ Verifica statistiche canale..."
STATS=$(curl -s https://telemedcare-v12.pages.dev/api/admin/leads-dashboard)
CHANNELS=$(echo "$STATS" | jq '.dashboard.analytics.channels')
echo "   📊 Canali trovati:"
echo "$CHANNELS" | jq -r '.[] | "      \(.canale): \(.count)"'
echo ""

# Test 3: Verifica lead nella dashboard
echo "3️⃣ Verifica flag contratto/brochure nel lead..."
LEAD=$(curl -s "https://telemedcare-v12.pages.dev/api/leads/$LEAD_ID")
VUOLE_CONTRATTO=$(echo "$LEAD" | jq -r '.vuoleContratto')
VUOLE_BROCHURE=$(echo "$LEAD" | jq -r '.vuoleBrochure')
echo "   📄 vuoleContratto: $VUOLE_CONTRATTO (atteso: Si)"
echo "   📚 vuoleBrochure: $VUOLE_BROCHURE (atteso: Si)"
echo ""

echo "✅ TEST COMPLETATO!"
echo ""
echo "📋 VERIFICA MANUALE NECESSARIA:"
echo "   1. Dashboard Leads → Statistiche canale aggiornate?"
echo "   2. Dashboard Leads → Tabella lead con flag ✅ per Contratto e Brochure?"
echo "   3. Email rpoggi55@gmail.com → PDF Brochure allegato?"
echo ""
