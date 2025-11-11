#!/bin/bash
# Script per backup del database locale D1

BACKUP_DIR="./db-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_PATH=".wrangler/state/v3/d1/miniflare-D1DatabaseObject"

# Crea directory backup
mkdir -p "$BACKUP_DIR"

# Trova il database
DB_FILE=$(find $DB_PATH -name "*.sqlite" 2>/dev/null | head -1)

if [ -z "$DB_FILE" ]; then
    echo "❌ Database non trovato in $DB_PATH"
    exit 1
fi

# Copia il database
BACKUP_FILE="$BACKUP_DIR/telemedcare_${TIMESTAMP}.sqlite"
cp "$DB_FILE" "$BACKUP_FILE"

# Crea anche un backup "latest"
cp "$DB_FILE" "$BACKUP_DIR/telemedcare_latest.sqlite"

echo "✅ Database salvato in:"
echo "   $BACKUP_FILE"
echo "   $BACKUP_DIR/telemedcare_latest.sqlite"

# Mostra statistiche
echo ""
echo "📊 Statistiche database:"
npx wrangler d1 execute telemedcare-leads --local --command="
SELECT 
  (SELECT COUNT(*) FROM leads) as leads,
  (SELECT COUNT(*) FROM contracts) as contracts,
  (SELECT COUNT(*) FROM proforma) as proforma
"
