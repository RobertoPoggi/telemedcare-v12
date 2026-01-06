#!/bin/bash

CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"
CLOUDFLARE_ACCOUNT_ID="8eee3bb064814aa60b770a979332a914"
PROJECT_NAME="telemedcare-v12"
API_BASE="https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME"

echo "🔄 Aggiunta PUBLIC_URL per Preview..."

# Leggi env vars esistenti
CURRENT_VARS=$(curl -s -X GET "$API_BASE" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result.deployment_configs.preview.env_vars')

# Aggiungi PUBLIC_URL
UPDATED_VARS=$(echo "$CURRENT_VARS" | jq '. + {"PUBLIC_URL": {"type": "plain_text", "value": "https://genspark-ai-developer.telemedcare-v12.pages.dev"}}')

# Patch
PATCH_PAYLOAD=$(jq -n --argjson vars "$UPDATED_VARS" '{
  deployment_configs: {
    preview: {
      env_vars: $vars
    }
  }
}')

curl -s -X PATCH "$API_BASE" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PATCH_PAYLOAD" | jq '.success'

echo "✅ PUBLIC_URL aggiunta!"
