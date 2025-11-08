#!/bin/bash

# Script per fare refresh del token usando il refresh_token salvato nel database

echo "=================================================="
echo "🔄 DocuSign Token Refresh (usando Refresh Token)"
echo "=================================================="
echo ""

# Carica le variabili d'ambiente
source .dev.vars

INTEGRATION_KEY="$DOCUSIGN_INTEGRATION_KEY"
SECRET_KEY="$DOCUSIGN_SECRET_KEY"

echo "📋 Configurazione:"
echo "   Integration Key: ${INTEGRATION_KEY:0:20}..."
echo ""

# Get refresh token from database
echo "🔍 Recupero refresh token dal database..."

REFRESH_TOKEN=$(npx wrangler d1 execute telemedcare-leads --local --command "SELECT refresh_token FROM docusign_tokens ORDER BY created_at DESC LIMIT 1" --json | jq -r '.[0].results[0].refresh_token')

if [ "$REFRESH_TOKEN" == "null" ] || [ -z "$REFRESH_TOKEN" ]; then
    echo "❌ Nessun refresh token trovato nel database!"
    echo ""
    echo "💡 Devi prima ottenere un token tramite OAuth flow completo."
    echo "   Usa lo script: ./refresh-docusign-token.sh"
    exit 1
fi

echo "✅ Refresh token trovato: ${REFRESH_TOKEN:0:30}..."
echo ""

# Encode credentials in base64
CREDENTIALS=$(echo -n "$INTEGRATION_KEY:$SECRET_KEY" | base64)

echo "🔄 Richiedendo nuovo access token a DocuSign..."

RESPONSE=$(curl -s -X POST "https://account-d.docusign.com/oauth/token" \
  -H "Authorization: Basic $CREDENTIALS" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$REFRESH_TOKEN")

echo ""
echo "📦 Risposta ricevuta:"
echo "$RESPONSE" | jq '.'
echo ""

# Extract new tokens
NEW_ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
NEW_REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')

if [ "$NEW_ACCESS_TOKEN" == "null" ] || [ -z "$NEW_ACCESS_TOKEN" ]; then
    echo "❌ Errore: Impossibile ottenere il nuovo access token"
    echo "   Risposta completa:"
    echo "$RESPONSE"
    echo ""
    echo "💡 Il refresh token potrebbe essere scaduto."
    echo "   Usa lo script: ./refresh-docusign-token.sh per ottenerne uno nuovo"
    exit 1
fi

echo "✅ Nuovo token ottenuto con successo!"
echo ""

# Calculate expiration time
EXPIRES_AT=$(date -u -d "+$EXPIRES_IN seconds" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v +${EXPIRES_IN}S +"%Y-%m-%dT%H:%M:%S.000Z")

echo "📊 Dettagli nuovo token:"
echo "   Access Token: ${NEW_ACCESS_TOKEN:0:30}..."
echo "   Refresh Token: ${NEW_REFRESH_TOKEN:0:30}..."
echo "   Scadenza: $EXPIRES_AT"
echo "   Durata: $EXPIRES_IN secondi ($(($EXPIRES_IN / 60)) minuti)"
echo ""

# Create TypeScript script to save token
cat > /tmp/save-refreshed-token.ts << EOF
import Database from 'better-sqlite3';

const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-telemedcare-leads.sqlite');

const accessToken = \`$NEW_ACCESS_TOKEN\`;
const refreshToken = \`$NEW_REFRESH_TOKEN\`;
const expiresAt = '$EXPIRES_AT';
const tokenType = 'Bearer';
const scope = 'signature impersonation';

try {
  // Delete old tokens
  db.prepare('DELETE FROM docusign_tokens').run();
  
  // Insert new token
  const result = db.prepare(\`
    INSERT INTO docusign_tokens (access_token, token_type, expires_at, scope, refresh_token)
    VALUES (?, ?, ?, ?, ?)
  \`).run(accessToken, tokenType, expiresAt, scope, refreshToken);
  
  console.log('✅ Token aggiornato nel database con ID:', result.lastInsertRowid);
  
  // Verify
  const saved = db.prepare('SELECT id, expires_at, created_at FROM docusign_tokens WHERE id = ?').get(result.lastInsertRowid);
  console.log('📊 Verifica token aggiornato:', saved);
  
  db.close();
} catch (error) {
  console.error('❌ Errore aggiornamento token:', error);
  process.exit(1);
}
EOF

echo "🔄 Aggiornando token nel database D1..."
npx tsx /tmp/save-refreshed-token.ts

echo ""
echo "=================================================="
echo "✅ TOKEN AGGIORNATO CON SUCCESSO!"
echo "=================================================="
echo ""
echo "🎉 Il token è stato aggiornato e sarà valido per i prossimi $(($EXPIRES_IN / 60)) minuti"
echo ""
echo "🧪 Puoi ora testare DocuSign inviando un nuovo form."
echo ""
