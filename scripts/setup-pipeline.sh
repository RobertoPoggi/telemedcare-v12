#!/bin/bash
# =============================================================
# setup-pipeline.sh
# Configura la pipeline TEST → PREVIEW → PRODUCTION
# 
# ESECUZIONE: dalla tua macchina locale (non dalla sandbox)
# PREREQUISITO: token GitHub PAT con scope 'workflow' e 'repo'
#
# Uso: ./scripts/setup-pipeline.sh <IL_TUO_GITHUB_PAT>
# =============================================================

set -e

PAT="${1:-}"
REPO="RobertoPoggi/telemedcare-v12"

if [ -z "$PAT" ]; then
  echo "❌ Fornisci il tuo GitHub PAT come argomento"
  echo "   Uso: ./scripts/setup-pipeline.sh ghp_xxxxxxxxxxxx"
  echo ""
  echo "   Il PAT deve avere i permessi: repo, workflow"
  echo "   Genera da: https://github.com/settings/tokens"
  exit 1
fi

echo "🔧 Configurazione pipeline TEST → PREVIEW → PRODUCTION"
echo "📦 Repository: $REPO"
echo ""

# Configura git per usare il PAT
git remote set-url origin "https://x-access-token:${PAT}@github.com/${REPO}.git"

# 1. Aggiorna deploy.yml (gestisce tutti e 3 i branch)
echo "📝 Aggiornamento .github/workflows/deploy.yml..."
cat > .github/workflows/deploy.yml << 'WORKFLOW_EOF'
name: Deploy to Cloudflare Pages
# =============================================================
# PIPELINE: TEST → PREVIEW → PRODUCTION
#
# Branch  → Cloudflare alias       → URL
# test    → test-environment       → https://test-environment.telemedcare-v12.pages.dev
# preview → preview                → https://preview.telemedcare-v12.pages.dev
# main    → main (production)      → https://telemedcare-v12.pages.dev
#
# PROCESSO CORRETTO DI SVILUPPO:
#   1. Lavora su branch 'test'
#   2. Verifica su https://test-environment.telemedcare-v12.pages.dev
#   3. Merge test → preview
#   4. Collaudo su https://preview.telemedcare-v12.pages.dev
#   5. Dopo approvazione: merge preview → main → production
# =============================================================

on:
  push:
    branches:
      - main      # → PRODUCTION
      - preview   # → PREVIEW
      - test      # → TEST
  workflow_dispatch:

jobs:
  deploy:
    name: "Deploy → ${{ github.ref_name == 'main' && 'PRODUCTION' || github.ref_name == 'preview' && 'PREVIEW' || 'TEST' }}"
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name == 'main' && 'production' || github.ref_name == 'preview' && 'preview' || 'test' }}
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: "Deploy su Cloudflare Pages"
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: >
            pages deploy dist
            --project-name telemedcare-v12
            --branch ${{ github.ref_name == 'main' && 'main' || github.ref_name == 'preview' && 'preview' || 'test-environment' }}
            --commit-dirty=true

      - name: Riepilogo deploy
        run: |
          if [ "${{ github.ref_name }}" = "main" ]; then
            echo "🚀 PRODUCTION: https://telemedcare-v12.pages.dev"
          elif [ "${{ github.ref_name }}" = "preview" ]; then
            echo "👁️  PREVIEW: https://preview.telemedcare-v12.pages.dev"
          else
            echo "🧪 TEST: https://test-environment.telemedcare-v12.pages.dev"
          fi
          echo "📦 Commit: ${{ github.sha }}"
WORKFLOW_EOF

# 2. Ripristina send-reminders-cron.yml (rimosso accidentalmente dal revert)
echo "📝 Ripristino .github/workflows/send-reminders-cron.yml..."
cat > .github/workflows/send-reminders-cron.yml << 'CRON_EOF'
name: Send Reminder Emails (Cron Giornaliero)
# 🔔 REMINDER AUTOMATICI GIORNALIERI
# ⏰ Esecuzione: Ogni giorno alle 08:00 Italia (07:00 UTC)
# 📧 Invia reminder per:
#    1. Lead con dati incompleti (completamento form)
#    2. Lead con contratto da firmare (CONTRACT_SENT)
#    3. Lead con proforma da pagare (PROFORMA_SENT)

on:
  schedule:
    - cron: '0 7 * * 1-5'   # Lun-Ven alle 08:00 IT (07:00 UTC)
  workflow_dispatch:
    inputs:
      environment:
        description: 'Ambiente target'
        required: false
        default: 'production'
        type: choice
        options:
          - production
          - preview
          - test-environment

permissions:
  contents: read

jobs:
  send-reminders:
    name: Invia Reminder Automatici
    runs-on: ubuntu-latest
    steps:
      - name: 📋 Info esecuzione
        run: |
          echo "🔔 Avvio reminder cron"
          echo "⏰ $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
          echo "🌐 Ambiente: ${{ github.event.inputs.environment || 'production' }}"

      - name: 🔔 Trigger Reminder (Production)
        if: ${{ github.event.inputs.environment == 'production' || github.event.inputs.environment == '' || github.event_name == 'schedule' }}
        run: |
          BASE_URL="https://telemedcare-v12.pages.dev"
          RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            "$BASE_URL/api/cron/send-reminders" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}")
          HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
          BODY=$(echo "$RESPONSE" | head -n -1)
          echo "📊 HTTP Status: $HTTP_CODE"
          echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
          if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Completato"
          elif [ "$HTTP_CODE" = "204" ]; then
            echo "⏭️ Cron disabilitato"
          elif [ "$HTTP_CODE" = "429" ]; then
            echo "⏭️ Già eseguito recentemente"
          else
            echo "❌ Errore HTTP $HTTP_CODE"; exit 1
          fi

      - name: 🔔 Trigger Reminder (Preview)
        if: ${{ github.event.inputs.environment == 'preview' }}
        run: |
          BASE_URL="https://preview.telemedcare-v12.pages.dev"
          curl -s -X POST "$BASE_URL/api/cron/send-reminders" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

      - name: 🔔 Trigger Reminder (Test)
        if: ${{ github.event.inputs.environment == 'test-environment' }}
        run: |
          BASE_URL="https://test-environment.telemedcare-v12.pages.dev"
          curl -s -X POST "$BASE_URL/api/cron/send-reminders" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

      - name: 📊 Riepilogo
        if: always()
        run: echo "⏰ Completato: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
CRON_EOF

# 3. Commit e push su main
echo ""
echo "📤 Commit e push su main..."
git add .github/workflows/deploy.yml .github/workflows/send-reminders-cron.yml
git commit -m "ci: pipeline TEST→PREVIEW→PRODUCTION + ripristino send-reminders-cron.yml

- deploy.yml: ora triggera su branch test/preview/main e deploya
  sull'alias Cloudflare corrispondente (test-environment/preview/main)
- send-reminders-cron.yml: ripristinato (era stato rimosso accidentalmente)"

git push origin main

# 4. Propaga su test e preview (già allineati al codice, ora ricevono anche i workflow)
echo "📤 Propagazione su branch test e preview..."
git checkout test
git merge main --no-edit
git push origin test

git checkout preview  
git merge main --no-edit
git push origin preview

git checkout main

# 5. Ripristina URL remote normale
git remote set-url origin "https://github.com/${REPO}.git"

echo ""
echo "✅ Pipeline configurata!"
echo ""
echo "📋 Ambienti attivi:"
echo "   🧪 TEST:       https://test-environment.telemedcare-v12.pages.dev"
echo "   👁️  PREVIEW:    https://preview.telemedcare-v12.pages.dev"  
echo "   🚀 PRODUCTION: https://telemedcare-v12.pages.dev"
echo ""
echo "📋 Flusso di sviluppo:"
echo "   1. Sviluppa su branch 'test'   → push → TEST si aggiorna"
echo "   2. Merge test → preview        → push → PREVIEW si aggiorna"
echo "   3. Approvi → merge preview → main → PRODUCTION si aggiorna"
