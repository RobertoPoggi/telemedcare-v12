#!/bin/bash
# Script per ripristinare il database locale D1

BACKUP_DIR="./db-backups"
DB_PATH=".wrangler/state/v3/d1/miniflare-D1DatabaseObject"

# Se specificato un file, usa quello, altrimenti usa "latest"
if [ -n "$1" ]; then
    BACKUP_FILE="$BACKUP_DIR/$1"
else
    BACKUP_FILE="$BACKUP_DIR/telemedcare_latest.sqlite"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup non trovato: $BACKUP_FILE"
    echo ""
    echo "Backup disponibili:"
    ls -lh "$BACKUP_DIR"/*.sqlite 2>/dev/null || echo "Nessun backup trovato"
    exit 1
fi

# Trova la directory del database
DB_DIR=$(find $DB_PATH -type d 2>/dev/null | head -1)

if [ -z "$DB_DIR" ]; then
    echo "❌ Directory database non trovata. Avvia il server una volta prima."
    exit 1
fi

# Stop server se attivo
echo "🛑 Stopping server..."
lsof -ti:3000,3001 | xargs -r kill -9 2>/dev/null
sleep 2

# Trova e sostituisci il database
DB_FILE=$(find $DB_PATH -name "*.sqlite" 2>/dev/null | head -1)

if [ -n "$DB_FILE" ]; then
    echo "📋 Ripristino database da: $BACKUP_FILE"
    cp "$BACKUP_FILE" "$DB_FILE"
    echo "✅ Database ripristinato!"
else
    echo "❌ File database non trovato"
    exit 1
fi

# Mostra statistiche
echo ""
echo "📊 Statistiche database ripristinato:"
npx wrangler d1 execute telemedcare-leads --local --command="
SELECT 
  (SELECT COUNT(*) FROM leads) as leads,
  (SELECT COUNT(*) FROM contracts) as contracts,
  (SELECT COUNT(*) FROM proforma) as proforma
"
