#!/bin/bash

API_URL="https://telemedcare-v12.pages.dev"

echo "🔍 RICERCA 3 LEAD MANCANTI SU HUBSPOT (senza filtro eCura)"
echo "================================================================"
echo ""

# Leggo i 3 lead mancanti
MISSING_LEADS=$(cat missing_leads_to_import.json)

# Lead 1: Laura Bianchi
echo "1️⃣ LAURA BIANCHI (l.bianchi@email.it / 340-9876543)"
echo "   Cerco su HubSpot..."
RESPONSE1=$(curl -s -X POST "$API_URL/api/hubspot/search" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "l.bianchi@email.it",
    "phone": "340-9876543",
    "onlyEcura": false
  }')
echo "$RESPONSE1" | jq -r 'if .contacts and (.contacts | length > 0) then "   ✅ TROVATO su HubSpot: ID \(.contacts[0].id)" else "   ❌ NON trovato su HubSpot" end'
echo ""

# Lead 2: Giuseppe Verdi
echo "2️⃣ GIUSEPPE VERDI (g.verdi@email.it / 338-1122334)"
echo "   Cerco su HubSpot..."
RESPONSE2=$(curl -s -X POST "$API_URL/api/hubspot/search" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "g.verdi@email.it",
    "phone": "338-1122334",
    "onlyEcura": false
  }')
echo "$RESPONSE2" | jq -r 'if .contacts and (.contacts | length > 0) then "   ✅ TROVATO su HubSpot: ID \(.contacts[0].id)" else "   ❌ NON trovato su HubSpot" end'
echo ""

# Lead 3: Azienda ABC Srl
echo "3️⃣ AZIENDA ABC SRL (hr@abc.it / 02-12345678)"
echo "   Cerco su HubSpot..."
RESPONSE3=$(curl -s -X POST "$API_URL/api/hubspot/search" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@abc.it",
    "phone": "02-12345678",
    "onlyEcura": false
  }')
echo "$RESPONSE3" | jq -r 'if .contacts and (.contacts | length > 0) then "   ✅ TROVATO su HubSpot: ID \(.contacts[0].id)" else "   ❌ NON trovato su HubSpot" end'
echo ""

echo "================================================================"
echo "✅ Ricerca completata"
echo ""
echo "📄 Salvo i risultati completi in hubspot_search_results.json"
echo "{\"laura_bianchi\": $RESPONSE1, \"giuseppe_verdi\": $RESPONSE2, \"azienda_abc\": $RESPONSE3}" | jq '.' > hubspot_search_results.json

