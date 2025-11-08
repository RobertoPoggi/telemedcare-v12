#!/bin/bash

# 🚀 Script Automatico Setup Produzione Cloudflare
# Esegue tutte le verifiche e setup necessari

set -e  # Exit on error

echo "🔍 VERIFICA SETUP PRODUZIONE"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  CLOUDFLARE_API_TOKEN non impostato${NC}"
    echo "Esegui: export CLOUDFLARE_API_TOKEN=\"zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3\""
    echo ""
fi

# 1. Verifica Git status
echo "1️⃣  Verifica Git..."
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✅ Repository pulito${NC}"
else
    echo -e "${YELLOW}⚠️  Ci sono modifiche non committate${NC}"
    git status -s
fi
echo ""

# 2. Verifica build locale
echo "2️⃣  Test build locale..."
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ Build locale funziona${NC}"
else
    echo -e "${RED}❌ Build locale fallito${NC}"
    echo "Controlla: /tmp/build.log"
    exit 1
fi
echo ""

# 3. Verifica workflow GitHub Actions
echo "3️⃣  Verifica GitHub Actions workflow..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✅ Workflow configurato${NC}"
else
    echo -e "${RED}❌ Workflow mancante${NC}"
    exit 1
fi
echo ""

# 4. Lista databases D1
echo "4️⃣  Verifica database D1..."
if [ ! -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Database D1 disponibili:"
    npx wrangler d1 list 2>&1 | grep -E "(name|database_id)" || echo "Nessun database trovato"
else
    echo -e "${YELLOW}⚠️  Imposta CLOUDFLARE_API_TOKEN per verificare${NC}"
fi
echo ""

# 5. Verifica migrations
echo "5️⃣  Verifica migrations..."
MIGRATION_COUNT=$(ls -1 migrations/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✅ ${MIGRATION_COUNT} migrations trovate${NC}"
ls -1 migrations/*.sql 2>/dev/null | tail -5 || true
echo ""

# 6. Riepilogo configurazione
echo "================================"
echo "📋 RIEPILOGO CONFIGURAZIONE"
echo "================================"
echo ""
echo "Project: telemedcare-v11"
echo "Account ID: 73e144e1ddc4f4af162d17c313e00c06"
echo "Database: telemedcare-leads"
echo "Branch: main"
echo ""

# 7. Prossimi step
echo "================================"
echo "🎯 PROSSIMI STEP DA FARE:"
echo "================================"
echo ""
echo "1. ✅ GITHUB SECRET:"
echo "   Vai su: https://github.com/RobertoPoggi/telemedcare-v11/settings/secrets/actions"
echo "   Aggiungi: CLOUDFLARE_API_TOKEN = zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"
echo ""
echo "2. ✅ CREA DATABASE D1 (se non esiste):"
echo "   export CLOUDFLARE_API_TOKEN=\"zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3\""
echo "   npx wrangler d1 create telemedcare-leads"
echo ""
echo "3. ✅ APPLICA MIGRATIONS:"
echo "   npx wrangler d1 migrations apply telemedcare-leads --remote"
echo ""
echo "4. ✅ CONFIGURA CLOUDFLARE PAGES:"
echo "   https://dash.cloudflare.com → Workers & Pages → telemedcare-v11"
echo "   Aggiungi binding D1 database: DB → telemedcare-leads"
echo ""
echo "5. ✅ PUSH E DEPLOY:"
echo "   git add ."
echo "   git commit -m \"feat: Setup automatic deployment\""
echo "   git push origin main"
echo ""
echo "================================"
echo "✨ Dopo questi step, ogni push farà deploy automatico!"
echo "================================"
