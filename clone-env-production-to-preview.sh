#!/bin/bash
# Script per clonare le environment variables da Production a Preview
# usando il token API corretto (quello con permessi Cloudflare Pages)

set -e

echo "🔄 Clonazione Environment Variables: Production → Preview"
echo "=========================================================="
echo ""

# Token API (quello che hai fornito prima: 7qHv_fdmFEXaRI8v1LKOTXWC7P7iPaYXB4-9HqqD)
API_TOKEN="7qHv_fdmFEXaRI8v1LKOTXWC7P7iPaYXB4-9HqqD"
ACCOUNT_ID="8eee3bb064814aa60b770a979332a914"
PROJECT_NAME="telemedcare-v12"

API_BASE="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME"

echo "📥 Step 1: Recupero variabili Production..."
PROD_RESPONSE=$(curl -s -X GET "$API_BASE" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

# Verifica se la richiesta è andata a buon fine
SUCCESS=$(echo "$PROD_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" != "true" ]; then
    echo "❌ Errore nel recupero variabili Production"
    echo "$PROD_RESPONSE" | jq
    exit 1
fi

# Estrai le variabili di Production
PROD_VARS=$(echo "$PROD_RESPONSE" | jq -r '.result.deployment_configs.production.env_vars')

if [ "$PROD_VARS" == "null" ] || [ -z "$PROD_VARS" ]; then
    echo "❌ Nessuna variabile trovata in Production"
    exit 1
fi

echo "✅ Variabili Production trovate:"
echo "$PROD_VARS" | jq 'keys'
echo ""

echo "📤 Step 2: Applico variabili a Preview..."

# Prepara payload per Preview
# IMPORTANTE: Le variabili "secret_text" devono avere solo type, non value
PREVIEW_PAYLOAD=$(cat <<EOF
{
  "deployment_configs": {
    "preview": {
      "env_vars": $PROD_VARS
    }
  }
}
EOF
)

echo "Payload:"
echo "$PREVIEW_PAYLOAD" | jq .
echo ""

# Applica le variabili a Preview
PATCH_RESPONSE=$(curl -s -X PATCH "$API_BASE" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PREVIEW_PAYLOAD")

PATCH_SUCCESS=$(echo "$PATCH_RESPONSE" | jq -r '.success')

if [ "$PATCH_SUCCESS" == "true" ]; then
    echo "✅ Variabili clonate con successo su Preview!"
    echo ""
    echo "Variabili configurate:"
    echo "$PATCH_RESPONSE" | jq -r '.result.deployment_configs.preview.env_vars | keys[]' | while read key; do
        echo "  ✓ $key"
    done
    echo ""
    echo "🎉 Clonazione completata!"
    echo ""
    echo "⏱️  Cloudflare Pages farà un redeploy automatico tra 2-3 minuti."
    echo ""
else
    echo "❌ Errore durante la clonazione"
    echo "$PATCH_RESPONSE" | jq
    exit 1
fi
