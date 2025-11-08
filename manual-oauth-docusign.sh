#!/bin/bash

# Manual OAuth flow for DocuSign - No server needed

source .dev.vars

INTEGRATION_KEY="$DOCUSIGN_INTEGRATION_KEY"
SECRET_KEY="$DOCUSIGN_SECRET_KEY"

echo "=================================================="
echo "🔐 DocuSign Manual OAuth Flow"
echo "=================================================="
echo ""

# Step 1: Generate auth URL
AUTH_URL="https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=$INTEGRATION_KEY&redirect_uri=http://localhost:3001/api/docusign/callback"

echo "📋 STEP 1: Copia e apri questo URL nel browser:"
echo ""
echo "$AUTH_URL"
echo ""
echo "📋 STEP 2: Fai login con DocuSign Developer"
echo ""
echo "📋 STEP 3: Clicca 'Allow' per autorizzare"
echo ""
echo "📋 STEP 4: Vedrai una pagina di errore 'Impossibile raggiungere il sito'"
echo "           Questo è NORMALE! Non preoccuparti."
echo ""
echo "📋 STEP 5: COPIA L'URL COMPLETO dalla barra degli indirizzi del browser"
echo "           L'URL sarà simile a:"
echo "           http://localhost:3001/api/docusign/callback?code=eyJ0eXAi...LUNGO_CODICE..."
echo ""
echo "=================================================="
echo ""
read -p "Incolla qui l'URL completo che vedi nel browser: " FULL_URL

# Extract code from URL
CODE=$(echo "$FULL_URL" | sed -n 's/.*code=\([^&]*\).*/\1/p')

if [ -z "$CODE" ]; then
    echo ""
    echo "❌ Errore: Nessun codice trovato nell'URL"
    echo "   Assicurati di aver copiato l'URL completo che include '?code=...'"
    exit 1
fi

echo ""
echo "✅ Codice estratto: ${CODE:0:50}..."
echo ""

# Step 2: Exchange code for token
echo "🔄 Scambio codice per access token..."
echo ""

CREDENTIALS=$(echo -n "$INTEGRATION_KEY:$SECRET_KEY" | base64)

RESPONSE=$(curl -s -X POST "https://account-d.docusign.com/oauth/token" \
  -H "Authorization: Basic $CREDENTIALS" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$CODE")

echo "📦 Risposta DocuSign:"
echo "$RESPONSE" | jq '.'
echo ""

# Extract tokens
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Errore: Impossibile ottenere l'access token"
    echo "   Risposta completa:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Token ricevuto con successo!"
echo ""

# Calculate expiration
EXPIRES_AT=$(date -u -d "+$EXPIRES_IN seconds" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v +${EXPIRES_IN}S +"%Y-%m-%dT%H:%M:%S.000Z")

echo "📊 Dettagli token:"
echo "   Access Token: ${ACCESS_TOKEN:0:30}..."
echo "   Refresh Token: ${REFRESH_TOKEN:0:30}..."
echo "   Scadenza: $EXPIRES_AT"
echo "   Durata: $(($EXPIRES_IN / 60)) minuti"
echo ""

# Save to database
echo "💾 Salvataggio token nel database..."

cat > /tmp/save-oauth-token.ts << EOF
import Database from 'better-sqlite3';

const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-telemedcare-leads.sqlite');

const accessToken = \`$ACCESS_TOKEN\`;
const refreshToken = \`$REFRESH_TOKEN\`;
const expiresAt = '$EXPIRES_AT';
const tokenType = 'Bearer';
const scope = 'signature impersonation';

try {
  db.prepare('DELETE FROM docusign_tokens').run();
  
  const result = db.prepare(\`
    INSERT INTO docusign_tokens (access_token, token_type, expires_at, scope, refresh_token)
    VALUES (?, ?, ?, ?, ?)
  \`).run(accessToken, tokenType, expiresAt, scope, refreshToken);
  
  console.log('✅ Token salvato con ID:', result.lastInsertRowid);
  
  const saved = db.prepare('SELECT id, expires_at FROM docusign_tokens WHERE id = ?').get(result.lastInsertRowid);
  console.log('📊 Verifica:', saved);
  
  db.close();
} catch (error) {
  console.error('❌ Errore:', error);
  process.exit(1);
}
EOF

npx tsx /tmp/save-oauth-token.ts

echo ""
echo "=================================================="
echo "✅ COMPLETATO!"
echo "=================================================="
echo ""
echo "🎉 Token DocuSign salvato e pronto all'uso!"
echo "⏱️  Valido per i prossimi $(($EXPIRES_IN / 60)) minuti"
echo ""
echo "🧪 Ora puoi testare DocuSign inviando un form!"
echo ""
