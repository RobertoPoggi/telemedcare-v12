#!/bin/bash

# Applica migration 0106: Dataset PARTNER (tabelle partners + partner_referrals)
# Uso: CLOUDFLARE_API_TOKEN=xxx ./apply-migration-0106.sh
#
# Database: telemedcare-leads (e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f)
# Puoi anche applicarla dalla Cloudflare Dashboard:
#   Workers & Pages → D1 → telemedcare-leads → Console → incolla il file SQL

set -e

MIGRATION_FILE="migrations/0106_create_partners_table.sql"
DB_NAME="telemedcare-leads"

echo "🤝 Applicazione Migration 0106: Dataset PARTNER"
echo "================================================"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ File migrazione non trovato: $MIGRATION_FILE"
    exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN non impostata."
    echo ""
    echo "Imposta il token e riprova:"
    echo "  export CLOUDFLARE_API_TOKEN=<il_tuo_token>"
    echo "  ./apply-migration-0106.sh"
    echo ""
    echo "Oppure applica manualmente dalla Dashboard Cloudflare:"
    echo "  1. Vai su https://dash.cloudflare.com → Workers & Pages → D1"
    echo "  2. Apri il database: telemedcare-leads"
    echo "  3. Clicca Console"
    echo "  4. Incolla il contenuto di: migrations/0106_create_partners_table.sql"
    echo "  5. Clicca Execute"
    exit 1
fi

echo "📤 Applicazione su database production: $DB_NAME"
npx wrangler d1 execute "$DB_NAME" --file="$MIGRATION_FILE" --remote

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration 0106 applicata con successo!"
    echo "   Tabelle create: partners, partner_referrals"
    echo "   Indici creati: 9 (email, referral_code, status, ruolo, etc.)"
    echo "   Trigger creati: 2 (updated_at automatico)"
    echo ""
    echo "🚀 Il dataset PARTNER è ora attivo su TeleMedCare CRM."
    echo "   API disponibili su: https://telemedcare-v12.pages.dev"
    echo "   - POST /api/partners/public     (registrazione pubblica)"
    echo "   - GET  /api/partners/referral/:code  (verifica referral)"
    echo "   - GET  /api/partners            (lista admin)"
    echo "   - GET  /api/partners/stats      (statistiche)"
else
    echo "❌ Migrazione fallita!"
    exit 1
fi
