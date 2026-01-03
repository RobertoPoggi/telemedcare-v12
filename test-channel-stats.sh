#!/bin/bash

echo "🧪 TEST STATISTICHE CANALE"
echo "=========================="
echo ""

# Test 1: Verifica endpoint statistiche
echo "1️⃣ Verifica endpoint /api/admin/leads-dashboard..."
STATS=$(curl -s https://telemedcare-v12.pages.dev/api/admin/leads-dashboard)
echo "$STATS" | jq '{
  success: .success,
  leadsTotali: .dashboard.kpi.leadsTotali,
  channelsCount: (.dashboard.analytics.channels | length),
  channels: .dashboard.analytics.channels
}'
echo ""

# Test 2: Verifica lead con fonte
echo "2️⃣ Verifica lead con campo fonte..."
LEADS=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=5')
echo "$LEADS" | jq '.leads[:3] | .[] | {id, nome: .nomeRichiedente, fonte, canale, created_at}'
echo ""

echo "✅ TEST COMPLETATO!"
echo ""
echo "Se vedi 'leadsTotali: null' o 'channels: []':"
echo "  → Problema query SQL o DB non accessibile"
echo ""
echo "Se vedi lead ma 'fonte: null':"
echo "  → Campo fonte non viene salvato correttamente"
