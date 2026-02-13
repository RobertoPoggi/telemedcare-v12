#!/bin/bash

API_URL="https://telemedcare-v12.pages.dev"

echo "📊 RIEPILOGO FINALE OPERAZIONE TRACKER OTTAVIA"
echo "================================================================"
echo ""

# Leggo il report
REPORT=$(cat tracker_import_report.json)

UPDATED=$(echo "$REPORT" | jq '.updated | length')
IMPORTED=$(echo "$REPORT" | jq '.imported | length')
ERRORS=$(echo "$REPORT" | jq '.errors | length')
SKIPPED=$(echo "$REPORT" | jq '.skipped | length')

echo "✅ Lead aggiornati: $UPDATED"
echo "🆕 Lead importati: $IMPORTED"
echo "❌ Errori: $ERRORS"
echo "⏭️  Skippati: $SKIPPED"
echo ""

# Verifico lo stato finale del database
echo "📊 Stato database attuale:"
RESPONSE=$(curl -s "$API_URL/api/leads")
TOTAL=$(echo "$RESPONSE" | jq '.total')
echo "   Totale lead: $TOTAL"
echo ""

# Lead con CM=OB
LEADS=$(echo "$RESPONSE" | jq '.leads')
CM_OB=$(echo "$LEADS" | jq '[.[] | select(.cm == "OB")] | length')
echo "   Lead con CM=OB: $CM_OB"
echo ""

# Lead con external_source_id valorizzato
WITH_HUBSPOT=$(echo "$LEADS" | jq '[.[] | select(.external_source_id != null and .external_source_id != "")] | length')
echo "   Lead con HubSpot ID: $WITH_HUBSPOT"
echo ""

echo "================================================================"
echo ""
echo "📝 DETTAGLIO AGGIORNAMENTI:"
echo "$REPORT" | jq -r '.updated[] | "   • \(.nome) (\(.lead_id)) → \(.updates | join(", "))"' | head -20
if [ $UPDATED -gt 20 ]; then
  echo "   ... e altri $((UPDATED - 20))"
fi

echo ""
echo "================================================================"
echo ""
echo "⚠️  ERRORI (primi 10):"
echo "$REPORT" | jq -r '.errors[] | "   • \(.nome): \(.errore)"' | head -10

echo ""
echo "================================================================"
echo "✅ OPERAZIONE COMPLETATA"

