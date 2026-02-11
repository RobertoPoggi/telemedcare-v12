#!/bin/bash

# =============================================
# Script per deployare Migration 0040 su Cloudflare D1
# =============================================

set -e

echo "🚀 Deploy Migration 0040 su Cloudflare D1"
echo "=========================================="
echo ""

# Verifica che wrangler sia installato
if ! command -v npx &> /dev/null; then
    echo "❌ ERRORE: npx non trovato"
    exit 1
fi

# Database name
DB_NAME="telemedcare-db"

echo "📦 Database: $DB_NAME"
echo ""

# =============================================
# STEP 1: Aggiungi colonne (ignora errori se esistono)
# =============================================
echo "📝 STEP 1/4: Aggiungi colonne (ignora errori se già esistono)..."

echo "  → Aggiungo colonna 'email'..."
npx wrangler d1 execute $DB_NAME --remote --command="ALTER TABLE leads ADD COLUMN email TEXT;" 2>/dev/null || echo "    ⚠️  Colonna 'email' già esistente (OK)"

echo "  → Aggiungo colonna 'telefono'..."
npx wrangler d1 execute $DB_NAME --remote --command="ALTER TABLE leads ADD COLUMN telefono TEXT;" 2>/dev/null || echo "    ⚠️  Colonna 'telefono' già esistente (OK)"

echo "  → Aggiungo colonna 'emailRichiedente'..."
npx wrangler d1 execute $DB_NAME --remote --command="ALTER TABLE leads ADD COLUMN emailRichiedente TEXT;" 2>/dev/null || echo "    ⚠️  Colonna 'emailRichiedente' già esistente (OK)"

echo "  → Aggiungo colonna 'telefonoRichiedente'..."
npx wrangler d1 execute $DB_NAME --remote --command="ALTER TABLE leads ADD COLUMN telefonoRichiedente TEXT;" 2>/dev/null || echo "    ⚠️  Colonna 'telefonoRichiedente' già esistente (OK)"

echo "✅ STEP 1 completato"
echo ""

# =============================================
# STEP 2: Sincronizza dati esistenti
# =============================================
echo "📝 STEP 2/4: Sincronizza dati esistenti..."

echo "  → Sincronizzazione email → emailRichiedente..."
npx wrangler d1 execute $DB_NAME --remote --command="UPDATE leads SET emailRichiedente = email WHERE emailRichiedente IS NULL AND email IS NOT NULL;"

echo "  → Sincronizzazione emailRichiedente → email..."
npx wrangler d1 execute $DB_NAME --remote --command="UPDATE leads SET email = emailRichiedente WHERE email IS NULL AND emailRichiedente IS NOT NULL;"

echo "  → Sincronizzazione telefono → telefonoRichiedente..."
npx wrangler d1 execute $DB_NAME --remote --command="UPDATE leads SET telefonoRichiedente = telefono WHERE telefonoRichiedente IS NULL AND telefono IS NOT NULL;"

echo "  → Sincronizzazione telefonoRichiedente → telefono..."
npx wrangler d1 execute $DB_NAME --remote --command="UPDATE leads SET telefono = telefonoRichiedente WHERE telefono IS NULL AND telefonoRichiedente IS NOT NULL;"

echo "✅ STEP 2 completato"
echo ""

# =============================================
# STEP 3: Crea trigger (8 trigger)
# =============================================
echo "📝 STEP 3/4: Crea trigger per sincronizzazione automatica..."

echo "  → Trigger 1/8: sync_email_to_emailRichiedente (INSERT)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_email_to_emailRichiedente AFTER INSERT ON leads FOR EACH ROW WHEN NEW.email IS NOT NULL AND NEW.emailRichiedente IS NULL BEGIN UPDATE leads SET emailRichiedente = NEW.email WHERE id = NEW.id; END;"

echo "  → Trigger 2/8: sync_email_on_update (UPDATE)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_email_on_update AFTER UPDATE OF email ON leads FOR EACH ROW WHEN NEW.email IS NOT NULL AND NEW.email != OLD.email BEGIN UPDATE leads SET emailRichiedente = NEW.email WHERE id = NEW.id; END;"

echo "  → Trigger 3/8: sync_emailRichiedente_to_email (INSERT)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_emailRichiedente_to_email AFTER INSERT ON leads FOR EACH ROW WHEN NEW.emailRichiedente IS NOT NULL AND NEW.email IS NULL BEGIN UPDATE leads SET email = NEW.emailRichiedente WHERE id = NEW.id; END;"

echo "  → Trigger 4/8: sync_emailRichiedente_on_update (UPDATE)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_emailRichiedente_on_update AFTER UPDATE OF emailRichiedente ON leads FOR EACH ROW WHEN NEW.emailRichiedente IS NOT NULL AND NEW.emailRichiedente != OLD.emailRichiedente BEGIN UPDATE leads SET email = NEW.emailRichiedente WHERE id = NEW.id; END;"

echo "  → Trigger 5/8: sync_telefono_to_telefonoRichiedente (INSERT)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_telefono_to_telefonoRichiedente AFTER INSERT ON leads FOR EACH ROW WHEN NEW.telefono IS NOT NULL AND NEW.telefonoRichiedente IS NULL BEGIN UPDATE leads SET telefonoRichiedente = NEW.telefono WHERE id = NEW.id; END;"

echo "  → Trigger 6/8: sync_telefono_on_update (UPDATE)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_telefono_on_update AFTER UPDATE OF telefono ON leads FOR EACH ROW WHEN NEW.telefono IS NOT NULL AND NEW.telefono != OLD.telefono BEGIN UPDATE leads SET telefonoRichiedente = NEW.telefono WHERE id = NEW.id; END;"

echo "  → Trigger 7/8: sync_telefonoRichiedente_to_telefono (INSERT)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_telefonoRichiedente_to_telefono AFTER INSERT ON leads FOR EACH ROW WHEN NEW.telefonoRichiedente IS NOT NULL AND NEW.telefono IS NULL BEGIN UPDATE leads SET telefono = NEW.telefonoRichiedente WHERE id = NEW.id; END;"

echo "  → Trigger 8/8: sync_telefonoRichiedente_on_update (UPDATE)..."
npx wrangler d1 execute $DB_NAME --remote --command="CREATE TRIGGER IF NOT EXISTS sync_telefonoRichiedente_on_update AFTER UPDATE OF telefonoRichiedente ON leads FOR EACH ROW WHEN NEW.telefonoRichiedente IS NOT NULL AND NEW.telefonoRichiedente != OLD.telefonoRichiedente BEGIN UPDATE leads SET telefono = NEW.telefonoRichiedente WHERE id = NEW.id; END;"

echo "✅ STEP 3 completato - 8 trigger creati"
echo ""

# =============================================
# STEP 4: Verifica risultati
# =============================================
echo "📝 STEP 4/4: Verifica risultati..."
echo ""

npx wrangler d1 execute $DB_NAME --remote --command="SELECT COUNT(*) as total_leads, COUNT(email) as has_email, COUNT(emailRichiedente) as has_emailRichiedente, COUNT(telefono) as has_telefono, COUNT(telefonoRichiedente) as has_telefonoRichiedente FROM leads;"

echo ""
echo "✅ Migration 0040 COMPLETATA con successo!"
echo ""
echo "🎯 Prossimi passi:"
echo "  1. Verifica che i trigger siano stati creati:"
echo "     npx wrangler d1 execute $DB_NAME --remote --command=\"SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE 'sync_%';\""
echo ""
echo "  2. Testa il form completamento (HTTP 500 → HTTP 200)"
echo ""
