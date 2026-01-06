#!/bin/bash
set -e

echo "🔄 Script per clonare Environment Variables da Production a Preview"
echo "=================================================================="
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurazione
PROJECT_NAME="telemedcare-v12"
ACCOUNT_ID=""  # Da compilare
API_TOKEN=""   # Da compilare

# Verifica prerequisiti
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ Errore: CLOUDFLARE_API_TOKEN non configurato${NC}"
    echo ""
    echo "Per usare questo script:"
    echo "1. Vai su Cloudflare Dashboard → My Profile → API Tokens"
    echo "2. Crea un nuovo token con permessi 'Cloudflare Pages: Edit'"
    echo "3. Esporta il token:"
    echo "   export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
    echo "4. Trova il tuo Account ID:"
    echo "   - Vai su Cloudflare Dashboard"
    echo "   - Clicca su 'Pages' nella sidebar"
    echo "   - L'Account ID è nell'URL o nelle impostazioni"
    echo ""
    echo "5. Esegui di nuovo lo script"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Errore: CLOUDFLARE_ACCOUNT_ID non configurato${NC}"
    echo ""
    echo "Esporta il tuo Account ID:"
    echo "   export CLOUDFLARE_ACCOUNT_ID='your-account-id'"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ API Token trovato${NC}"
echo -e "${GREEN}✅ Account ID: $CLOUDFLARE_ACCOUNT_ID${NC}"
echo ""

# API Base URL
API_BASE="https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME"

echo "📥 Step 1: Recupero variabili da Production..."
echo ""

# Ottieni le variabili di Production
PROD_VARS=$(curl -s -X GET "$API_BASE" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result.deployment_configs.production.env_vars')

if [ "$PROD_VARS" == "null" ] || [ -z "$PROD_VARS" ]; then
    echo -e "${RED}❌ Errore: Impossibile recuperare variabili da Production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variabili Production recuperate${NC}"
echo "$PROD_VARS" | jq 'keys'
echo ""

echo "📤 Step 2: Clonazione su Preview..."
echo ""

# Prepara il payload per Preview
# Nota: Le variabili sono oggetti con "value" e "type" ("plain_text" o "secret_text")
PREVIEW_PAYLOAD=$(echo "$PROD_VARS" | jq '{deployment_configs: {preview: {env_vars: .}}}')

echo "Payload da inviare:"
echo "$PREVIEW_PAYLOAD" | jq .
echo ""

# Aggiorna le variabili di Preview
RESPONSE=$(curl -s -X PATCH "$API_BASE" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PREVIEW_PAYLOAD")

# Verifica risposta
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ Variabili clonate con successo su Preview!${NC}"
    echo ""
    echo "Variabili configurate:"
    echo "$RESPONSE" | jq -r '.result.deployment_configs.preview.env_vars | keys[]' | while read key; do
        echo "  - $key"
    done
    echo ""
    echo -e "${GREEN}🎉 Clonazione completata!${NC}"
    echo ""
    echo "Cloudflare Pages farà un redeploy automatico tra pochi minuti."
else
    echo -e "${RED}❌ Errore durante la clonazione${NC}"
    echo "$RESPONSE" | jq .
    exit 1
fi

echo ""
echo "=================================================================="
echo "✅ Script completato con successo!"
echo "=================================================================="
