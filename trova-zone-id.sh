#!/bin/bash

#############################################################################
# TROVA ZONE ID DI TELEMEDCARE.IT
# Script per trovare automaticamente il Zone ID
#############################################################################

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Trova Zone ID per telemedcare.it"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Richiedi API Token
read -sp "Incolla il tuo Cloudflare API Token: " CLOUDFLARE_API_TOKEN
echo ""
echo ""

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Token non fornito. Uscita."
    exit 1
fi

echo "🔍 Cerco il Zone ID per telemedcare.it..."
echo ""

# Chiama API Cloudflare per ottenere tutte le zone
response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=telemedcare.it" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

# Estrai Zone ID
zone_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$zone_id" ]; then
    echo "✅ TROVATO!"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "Zone ID per telemedcare.it:"
    echo ""
    echo "    $zone_id"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "Copia questo ID e usalo nello script setup-telemedcare.sh"
    echo ""
else
    echo "❌ Non trovato. Verifica:"
    echo "1. Che il token API sia corretto"
    echo "2. Che telemedcare.it sia nel tuo account Cloudflare"
    echo "3. Che il token abbia permessi Zone:Read"
    echo ""
    echo "Risposta API:"
    echo "$response"
fi

echo ""
