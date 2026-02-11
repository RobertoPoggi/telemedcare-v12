#!/bin/bash

# ============================================
# DEPLOY MIGRATION 0050 - AUTOMATICO
# TeleMedCare V12.0
# ============================================

set -e

echo "🚀 DEPLOY MIGRATION 0050 - Template Email Contratto"
echo "===================================================="
echo ""

# Verifica che siamo nella directory corretta
if [ ! -f "migrations/0050_update_contract_email_template.sql" ]; then
  echo "❌ Errore: File migration non trovato!"
  echo "   Assicurati di essere nella directory telemedcare-v12"
  exit 1
fi

echo "✅ Migration file trovato"
echo ""

# Aggiorna repository
echo "📥 Aggiornamento repository..."
git pull origin main
echo ""

# Verifica che wrangler sia installato
if ! command -v npx &> /dev/null; then
  echo "❌ Errore: npx non trovato!"
  echo "   Installa Node.js: https://nodejs.org/"
  exit 1
fi

echo "✅ npx trovato"
echo ""

# Esegui login a Cloudflare (se necessario)
echo "🔐 Verifica autenticazione Cloudflare..."
echo ""
echo "Se richiesto, effettua il login con:"
echo "  npx wrangler login"
echo ""
read -p "Premi ENTER per continuare..."
echo ""

# Esegui migration
echo "📊 Esecuzione migration 0050..."
echo ""

npx wrangler d1 execute telemedcare-db \
  --file=./migrations/0050_update_contract_email_template.sql \
  --remote

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration 0050 COMPLETATA con successo!"
  echo ""
else
  echo ""
  echo "❌ Errore durante l'esecuzione della migration"
  echo ""
  echo "Prova manualmente:"
  echo "  npx wrangler login"
  echo "  npx wrangler d1 execute telemedcare-db --file=./migrations/0050_update_contract_email_template.sql --remote"
  echo ""
  exit 1
fi

# Verifica risultato
echo "🔍 Verifica template aggiornato..."
echo ""

npx wrangler d1 execute telemedcare-db \
  --remote \
  --command "SELECT id, name, LENGTH(html_content) as html_length, updated_at FROM document_templates WHERE id = 'email_invio_contratto';"

echo ""
echo "=============================================="
echo "✅ DEPLOY COMPLETATO"
echo "=============================================="
echo ""
echo "Verifica che:"
echo "  - html_length sia circa 5000-6000 (non 2000)"
echo "  - updated_at sia la data odierna"
echo ""
echo "Ora puoi testare:"
echo "  1. Form completamento"
echo "  2. Link firma contratto"
echo "  3. Pulsante manuale invio contratto"
echo ""
