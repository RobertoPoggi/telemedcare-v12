#!/bin/bash
set -e

echo "🔄 Cloudflare Pages - Clone Environment Variables (Interactive)"
echo "=================================================================="
echo ""

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="telemedcare-v12"

echo -e "${BLUE}Questo script clonerà tutte le Environment Variables da Production a Preview${NC}"
echo ""

# Chiedi Account ID
echo -e "${YELLOW}📝 Step 1: Account ID${NC}"
echo ""
echo "Dove trovarlo:"
echo "  - URL: https://dash.cloudflare.com/[ACCOUNT-ID]/pages"
echo "  - Oppure: Pages → telemedcare-v12 → Settings → Account ID"
echo ""
read -p "Inserisci il tuo Cloudflare Account ID: " ACCOUNT_ID

if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Account ID obbligatorio!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📝 Step 2: API Token${NC}"
echo ""
echo "Dove crearlo:"
echo "  1. Vai su: https://dash.cloudflare.com/profile/api-tokens"
echo "  2. Create Token → 'Edit Cloudflare Workers'"
echo "  3. Copia il token generato"
echo ""
read -sp "Inserisci il tuo Cloudflare API Token: " API_TOKEN
echo ""

if [ -z "$API_TOKEN" ]; then
    echo -e "${RED}❌ API Token obbligatorio!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Credenziali ricevute${NC}"
echo -e "${GREEN}✅ Account ID: ${ACCOUNT_ID:0:8}...${NC}"
echo ""

# Verifica jq
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq non installato${NC}"
    echo "Installalo con: apt-get install jq"
    exit 1
fi

API_BASE="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME"

echo "📥 Step 3: Recupero variabili da Production..."
echo ""

PROD_VARS=$(curl -s -X GET "$API_BASE" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

# Verifica errori API
SUCCESS=$(echo "$PROD_VARS" | jq -r '.success')

if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}❌ Errore durante il recupero delle variabili${NC}"
    echo ""
    echo "Risposta API:"
    echo "$PROD_VARS" | jq .
    echo ""
    echo "Possibili cause:"
    echo "  - Account ID errato"
    echo "  - API Token non valido o senza permessi"
    echo "  - Progetto 'telemedcare-v12' non trovato"
    exit 1
fi

ENV_VARS=$(echo "$PROD_VARS" | jq -r '.result.deployment_configs.production.env_vars')

if [ "$ENV_VARS" == "null" ] || [ -z "$ENV_VARS" ]; then
    echo -e "${RED}❌ Nessuna variabile trovata in Production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variabili Production recuperate:${NC}"
echo ""
echo "$ENV_VARS" | jq -r 'keys[]' | while read key; do
    TYPE=$(echo "$ENV_VARS" | jq -r ".[\"$key\"].type")
    if [ "$TYPE" == "secret_text" ]; then
        echo "  🔐 $key (secret)"
    else
        VALUE=$(echo "$ENV_VARS" | jq -r ".[\"$key\"].value")
        echo "  📝 $key = ${VALUE:0:20}..."
    fi
done
echo ""

read -p "Vuoi clonare queste variabili su Preview? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Operazione annullata."
    exit 0
fi

echo ""
echo "📤 Step 4: Clonazione su Preview..."
echo ""

PREVIEW_PAYLOAD=$(echo "$ENV_VARS" | jq '{deployment_configs: {preview: {env_vars: .}}}')

RESPONSE=$(curl -s -X PATCH "$API_BASE" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PREVIEW_PAYLOAD")

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ Variabili clonate con successo su Preview!${NC}"
    echo ""
    echo "Variabili configurate in Preview:"
    echo "$RESPONSE" | jq -r '.result.deployment_configs.preview.env_vars | keys[]' | while read key; do
        echo "  ✅ $key"
    done
    echo ""
    echo -e "${GREEN}🎉 Clonazione completata!${NC}"
    echo ""
    echo "Cloudflare Pages farà un redeploy automatico tra pochi minuti."
    echo "Preview URL: https://genspark-ai-developer.telemedcare-v12.pages.dev"
else
    echo -e "${RED}❌ Errore durante la clonazione${NC}"
    echo ""
    echo "$RESPONSE" | jq .
    exit 1
fi

echo ""
echo "=================================================================="
echo "✅ Script completato con successo!"
echo "=================================================================="
