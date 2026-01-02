#!/bin/bash

# Script per eseguire tutte le migrations su Cloudflare D1
# Uso: ./apply-migrations.sh

set -e

echo "🔧 APPLICAZIONE MIGRATIONS SU CLOUDFLARE D1"
echo "============================================"
echo ""

# Nome database da wrangler.toml
DB_NAME="telemedcare-v12-db"

echo "📋 Migrations da applicare:"
ls -1 migrations/*.sql | grep -v schema.sql

echo ""
echo "⚠️  ATTENZIONE: Questo script applicherà TUTTE le migrations al database $DB_NAME"
echo "   Se alcune migrations sono già state applicate, potrebbero verificarsi errori (ignorabili)"
echo ""

read -p "Vuoi procedere? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Operazione annullata"
    exit 1
fi

echo ""
echo "🚀 Inizio applicazione migrations..."
echo ""

# Applica migrations in ordine
for migration in migrations/000*.sql; do
    echo "📄 Applicazione: $migration"
    
    # Esegui migration
    if npx wrangler d1 execute $DB_NAME --file="$migration" --remote 2>&1; then
        echo "   ✅ Completata"
    else
        echo "   ⚠️  Errore (potrebbe essere già applicata)"
    fi
    
    echo ""
done

echo "============================================"
echo "✅ MIGRATIONS COMPLETATE"
echo ""
echo "Verifica tabelle create:"
npx wrangler d1 execute $DB_NAME --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" --remote

echo ""
echo "Verifica template email:"
npx wrangler d1 execute $DB_NAME --command="SELECT id, name FROM document_templates;" --remote
