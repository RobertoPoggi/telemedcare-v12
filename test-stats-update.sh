#!/bin/bash

echo "🧪 TEST AGGIORNAMENTO STATISTICHE"
echo "================================="
echo ""

# Prendi statistiche iniziali
echo "1️⃣ Statistiche PRIMA della creazione..."
STATS_BEFORE=$(curl -s https://telemedcare-v12.pages.dev/api/admin/leads-dashboard)
LEADS_BEFORE=$(echo "$STATS_BEFORE" | jq -r '.dashboard.kpi.leadsTotali')
CHANNELS_BEFORE=$(echo "$STATS_BEFORE" | jq -r '.dashboard.analytics.channels | length')
echo "   📊 Leads: $LEADS_BEFORE"
echo "   📊 Canali: $CHANNELS_BEFORE"
echo ""

# Crea nuovo lead con canale univoco
TIMESTAMP=$(date +%s)
CANALE="TEST-STATS-$TIMESTAMP"

echo "2️⃣ Creazione lead con canale: $CANALE..."
RESPONSE=$(curl -s -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d "{
    \"nomeRichiedente\": \"Test\",
    \"cognomeRichiedente\": \"Stats\", 
    \"email\": \"test-stats@test.com\",
    \"telefono\": \"+39 333 0000000\",
    \"servizio\": \"eCura PRO\",
    \"piano\": \"BASE\",
    \"canale\": \"$CANALE\"
  }")

LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId // .id')
echo "   ✅ Lead creato: $LEAD_ID"
echo ""

# Attendi un po' per propagazione
sleep 3

# Prendi statistiche dopo
echo "3️⃣ Statistiche DOPO la creazione..."
STATS_AFTER=$(curl -s https://telemedcare-v12.pages.dev/api/admin/leads-dashboard)
LEADS_AFTER=$(echo "$STATS_AFTER" | jq -r '.dashboard.kpi.leadsTotali')
CHANNELS_AFTER=$(echo "$STATS_AFTER" | jq -r '.dashboard.analytics.channels | length')
echo "   📊 Leads: $LEADS_AFTER (era $LEADS_BEFORE)"
echo "   📊 Canali: $CHANNELS_AFTER (era $CHANNELS_BEFORE)"
echo ""

# Verifica il nuovo canale
NEW_CHANNEL=$(echo "$STATS_AFTER" | jq -r ".dashboard.analytics.channels[] | select(.canale == \"$CANALE\")")
if [ -n "$NEW_CHANNEL" ]; then
  echo "   ✅ Nuovo canale trovato:"
  echo "$NEW_CHANNEL" | jq '.'
else
  echo "   ❌ Nuovo canale NON trovato nelle statistiche!"
  echo "   Canali attuali:"
  echo "$STATS_AFTER" | jq '.dashboard.analytics.channels'
fi
echo ""

# Riepilogo
if [ "$LEADS_AFTER" -gt "$LEADS_BEFORE" ]; then
  echo "✅ SUCCESSO: Statistiche aggiornate correttamente!"
  echo "   Incremento leads: +$((LEADS_AFTER - LEADS_BEFORE))"
else
  echo "❌ PROBLEMA: Statistiche NON aggiornate!"
  echo "   Lead creato ma conteggio non incrementato"
fi
