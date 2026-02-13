#!/bin/bash

API_URL="https://telemedcare-v12.pages.dev"

echo "🔍 RICERCA LEAD MANUALI DI OTTAVIA NEL DATABASE"
echo "================================================================"
echo ""

# Recupero tutti i lead
RESPONSE=$(curl -s "$API_URL/api/leads")

# Estraggo l'array dei lead
ALL_LEADS=$(echo "$RESPONSE" | jq '.leads')

# Filtro i lead con email @placeholder.com
MANUAL_LEADS=$(echo "$ALL_LEADS" | jq '[.[] | select(.email != null and (.email | contains("@placeholder.com")))]')

echo "Lead manuali di Ottavia (email @placeholder.com):"
echo "$MANUAL_LEADS" | jq -r '.[] | "  • \(.id) - \(.nome) - \(.email) - Creato: \(.createdAt)"'

MANUAL_COUNT=$(echo "$MANUAL_LEADS" | jq 'length')
echo ""
echo "📊 Totale lead manuali: $MANUAL_COUNT"
echo ""

# Salvo il risultato
echo "$MANUAL_LEADS" | jq '.' > ottavia_manual_leads_in_db.json
echo "✅ Lead salvati in ottavia_manual_leads_in_db.json"

