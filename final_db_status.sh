#!/bin/bash

API_URL="https://telemedcare-v12.pages.dev"

echo "📊 STATO FINALE DATABASE TELEMEDCARE"
echo "================================================================"
echo ""

# Recupero tutti i lead
RESPONSE=$(curl -s "$API_URL/api/leads")

TOTAL=$(echo "$RESPONSE" | jq '.total')
echo "🔢 Totale lead nel database: $TOTAL"
echo ""

# Lead di oggi
TODAY_LEADS=$(echo "$RESPONSE" | jq '[.leads[] | select(.createdAt | startswith("2026-02-13"))]')
TODAY_COUNT=$(echo "$TODAY_LEADS" | jq 'length')

echo "📅 Lead creati oggi (2026-02-13): $TODAY_COUNT"
if [ $TODAY_COUNT -gt 0 ]; then
  echo "$TODAY_LEADS" | jq -r '.[] | "  • \(.id) - \(.nome) - Fonte: \(.fonte // "N/A") - \(.createdAt)"' | head -10
  if [ $TODAY_COUNT -gt 10 ]; then
    echo "  ... (altri $((TODAY_COUNT - 10)) lead)"
  fi
fi
echo ""

# Controllo Sergio Mutalipassi
SERGIO=$(echo "$RESPONSE" | jq '.leads[] | select(.nome | contains("Sergio"))')
if [ ! -z "$SERGIO" ]; then
  echo "✅ Sergio Mutalipassi presente:"
  echo "$SERGIO" | jq -r '"  ID: \(.id)\n  Email: \(.email)\n  Fonte: \(.fonte)\n  Creato: \(.createdAt)\n  hs_object_source_detail_1: \(.hs_object_source_detail_1 // "null")"'
else
  echo "❌ Sergio Mutalipassi NON trovato"
fi
echo ""

echo "================================================================"

