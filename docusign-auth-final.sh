#!/bin/bash

# Ultimate simple DocuSign OAuth - One command solution

source .dev.vars

INTEGRATION_KEY="$DOCUSIGN_INTEGRATION_KEY"
SECRET_KEY="$DOCUSIGN_SECRET_KEY"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔐 DocuSign OAuth - Soluzione Semplice e Veloce          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Questo è il LINK di autorizzazione DocuSign:"
echo ""
echo "https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=$INTEGRATION_KEY&redirect_uri=https://www.docusign.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ COSA FARE (3 passi):"
echo ""
echo "  1️⃣  COPIA il link qui sopra"
echo "  2️⃣  APRILO nel browser (sei già loggato in DocuSign)"
echo "  3️⃣  Clicca 'ALLOW' per autorizzare"
echo ""
echo "  ⚠️  Dopo aver cliccato 'Allow', vedrai un URL tipo:"
echo "     https://www.docusign.com/?code=eyJ0eXAiOiJNVCIsI..."
echo ""
echo "  4️⃣  COPIA l'URL COMPLETO (incluso il 'code=')"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "👉 Incolla qui l'URL completo: " FULL_URL
echo ""

# Extract code
CODE=$(echo "$FULL_URL" | grep -oP '(?<=code=)[^&]+' || echo "$FULL_URL" | sed -n 's/.*code=\([^&]*\).*/\1/p')

if [ -z "$CODE" ]; then
    echo "❌ Errore: Nessun codice trovato"
    echo ""
    echo "💡 Suggerimento: L'URL deve contenere '?code=' o '&code='"
    echo "   Esempio: https://www.docusign.com/?code=eyJ0eXAi..."
    echo ""
    exit 1
fi

echo "✅ Codice estratto: ${CODE:0:60}..."
echo ""
echo "🔄 Richiesta access token a DocuSign..."
echo ""

# Exchange code for token
CREDENTIALS=$(echo -n "$INTEGRATION_KEY:$SECRET_KEY" | base64)

RESPONSE=$(curl -s -X POST "https://account-d.docusign.com/oauth/token" \
  -H "Authorization: Basic $CREDENTIALS" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=$CODE")

# Check for errors
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ Errore da DocuSign:"
    echo "$RESPONSE" | jq '.'
    echo ""
    exit 1
fi

ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token // "null"')
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Errore: Token non ricevuto"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Access Token ricevuto!"
echo ""

# Calculate expiration
EXPIRES_AT=$(date -u -d "+$EXPIRES_IN seconds" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v +${EXPIRES_IN}S +"%Y-%m-%dT%H:%M:%S.000Z")

# Save to database
echo "💾 Salvataggio nel database D1..."

cat > /tmp/save-docusign-token.ts << EOF
import Database from 'better-sqlite3';

const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-telemedcare-leads.sqlite');

try {
  db.prepare('DELETE FROM docusign_tokens').run();
  
  const result = db.prepare(\`
    INSERT INTO docusign_tokens (access_token, token_type, expires_at, scope, refresh_token)
    VALUES (?, ?, ?, ?, ?)
  \`).run(
    \`$ACCESS_TOKEN\`,
    'Bearer',
    '$EXPIRES_AT',
    'signature impersonation',
    \`$REFRESH_TOKEN\`
  );
  
  console.log('✅ Token salvato con ID:', result.lastInsertRowid);
  
  db.close();
} catch (error) {
  console.error('❌ Errore:', error);
  process.exit(1);
}
EOF

npx tsx /tmp/save-docusign-token.ts

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    🎉 COMPLETATO!                             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Dettagli:"
echo "   • Access Token: ${ACCESS_TOKEN:0:40}..."
echo "   • Scadenza: $EXPIRES_AT"
echo "   • Durata: $(($EXPIRES_IN / 60)) minuti"
echo "   • Refresh Token: $([ "$REFRESH_TOKEN" != "null" ] && echo "✅ Sì" || echo "❌ No")"
echo ""
echo "🧪 Ora puoi testare DocuSign inviando un form!"
echo ""
