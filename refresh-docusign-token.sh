#!/bin/bash

# Script per ottenere un nuovo DocuSign Access Token tramite OAuth

echo "=================================================="
echo "🔐 DocuSign OAuth Token Refresh"
echo "=================================================="
echo ""

# Carica le variabili d'ambiente
source .dev.vars

INTEGRATION_KEY="$DOCUSIGN_INTEGRATION_KEY"
SECRET_KEY="$DOCUSIGN_SECRET_KEY"
ACCOUNT_ID="$DOCUSIGN_ACCOUNT_ID"
REDIRECT_URI="$DOCUSIGN_REDIRECT_URI"

echo "📋 Configurazione:"
echo "   Integration Key: ${INTEGRATION_KEY:0:20}..."
echo "   Redirect URI: $REDIRECT_URI"
echo ""

# Step 1: Generate Authorization URL
AUTH_URL="https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=$INTEGRATION_KEY&redirect_uri=$REDIRECT_URI"

echo "=================================================="
echo "📌 STEP 1: Autorizzazione"
echo "=================================================="
echo ""
echo "1. Apri questo URL nel browser:"
echo ""
echo "   $AUTH_URL"
echo ""
echo "2. Fai login con il tuo account DocuSign Developer"
echo "3. Autorizza l'applicazione"
echo "4. Verrai reindirizzato a: $REDIRECT_URI?code=XXXXX"
echo "5. Copia SOLO il codice (la parte dopo 'code=')"
echo ""
echo "=================================================="
echo ""
read -p "Incolla qui il codice di autorizzazione: " AUTH_CODE
echo ""

if [ -z "$AUTH_CODE" ]; then
    echo "❌ Nessun codice inserito. Uscita."
    exit 1
fi

echo "✅ Codice ricevuto: ${AUTH_CODE:0:20}..."
echo ""

# Step 2: Exchange code for access token
echo "=================================================="
echo "📌 STEP 2: Scambio codice per Access Token"
echo "=================================================="
echo ""

# Encode credentials in base64
CREDENTIALS=$(echo -n "$INTEGRATION_KEY:$SECRET_KEY" | base64)

echo "🔄 Richiedendo token a DocuSign..."

RESPONSE=$(curl -s -X POST "https://account-d.docusign.com/oauth/token" \
  -H "Authorization: Basic $CREDENTIALS" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$AUTH_CODE")

echo ""
echo "📦 Risposta ricevuta:"
echo "$RESPONSE" | jq '.'
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Errore: Impossibile ottenere l'access token"
    echo "   Risposta completa:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Token ottenuto con successo!"
echo ""
echo "=================================================="
echo "📌 STEP 3: Salvataggio nel Database"
echo "=================================================="
echo ""

# Calculate expiration time
EXPIRES_AT=$(date -u -d "+$EXPIRES_IN seconds" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v +${EXPIRES_IN}S +"%Y-%m-%dT%H:%M:%S.000Z")

echo "📊 Dettagli token:"
echo "   Access Token: ${ACCESS_TOKEN:0:30}..."
echo "   Refresh Token: ${REFRESH_TOKEN:0:30}..."
echo "   Scadenza: $EXPIRES_AT"
echo "   Durata: $EXPIRES_IN secondi ($(($EXPIRES_IN / 60)) minuti)"
echo ""

# Create TypeScript script to save token
cat > /tmp/save-new-token.ts << EOF
import Database from 'better-sqlite3';

const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-telemedcare-leads.sqlite');

const accessToken = \`$ACCESS_TOKEN\`;
const refreshToken = \`$REFRESH_TOKEN\`;
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
  
  console.log('✅ Token salvato nel database con ID:', result.lastInsertRowid);
  
  // Verify
  const saved = db.prepare('SELECT id, expires_at, created_at FROM docusign_tokens WHERE id = ?').get(result.lastInsertRowid);
  console.log('📊 Verifica token salvato:', saved);
  
  db.close();
} catch (error) {
  console.error('❌ Errore salvataggio token:', error);
  process.exit(1);
}
EOF

echo "🔄 Salvando token nel database D1..."
npx tsx /tmp/save-new-token.ts

echo ""
echo "=================================================="
echo "✅ PROCESSO COMPLETATO!"
echo "=================================================="
echo ""
echo "🎉 Il nuovo token è stato salvato e sarà valido per i prossimi $(($EXPIRES_IN / 60)) minuti"
echo ""
echo "💡 Nota: Questa volta abbiamo salvato anche il REFRESH TOKEN,"
echo "   quindi in futuro potremo fare refresh automatico senza OAuth!"
echo ""
echo "🧪 Puoi ora testare DocuSign inviando un nuovo form."
echo ""
