#!/bin/bash
set -e

echo "📦 D1 Database Clone via SQL Query (Alternative Method)"
echo "========================================================"
echo ""

ACCOUNT_ID="8eee3bb064814aa60b770a979332a914"
API_TOKEN="7qHv_fdmFEXaRI8v1LKOTXWC7P7iPaYXB4-9HqqD"
SOURCE_DB_ID="ef89ed07-bf97-47f1-8f4c-c5049b102e57"
SOURCE_DB_NAME="telemedcare-leads"
TARGET_DB_NAME="telemedcare-leads-preview"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  NOTA: Questo metodo usa l'API REST di Cloudflare D1${NC}"
echo ""
echo "Parametri:"
echo "  Source DB: $SOURCE_DB_NAME ($SOURCE_DB_ID)"
echo "  Target DB: $TARGET_DB_NAME (sarà creato)"
echo ""

read -p "Procedere con il clone? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    exit 0
fi

echo ""
echo "📥 Step 1: Recupero tabelle da Production..."
echo ""

# Ottieni lista tabelle
TABLES_JSON=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$SOURCE_DB_ID/query" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT name, sql FROM sqlite_master WHERE type=\"table\" AND name NOT LIKE \"sqlite_%\" ORDER BY name"}')

# Verifica successo
SUCCESS=$(echo "$TABLES_JSON" | jq -r '.success' 2>/dev/null || echo "false")

if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}❌ Errore nel recupero tabelle${NC}"
    echo "$TABLES_JSON" | jq . 2>/dev/null || echo "$TABLES_JSON"
    echo ""
    echo "Il token API potrebbe non avere i permessi necessari per D1 Database."
    echo ""
    echo "Per creare un token con i permessi corretti:"
    echo "1. Vai su: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Create Token → Custom token"
    echo "3. Permessi richiesti:"
    echo "   - Account → D1 → Edit"
    echo "   - Account → Cloudflare Pages → Edit"
    echo "4. Salva il nuovo token e riesegui questo script"
    exit 1
fi

echo -e "${GREEN}✅ Tabelle recuperate${NC}"
echo ""

# Estrai nomi tabelle
TABLES=$(echo "$TABLES_JSON" | jq -r '.result[0].results[] | .name')
TABLE_COUNT=$(echo "$TABLES" | wc -l)

echo "Trovate $TABLE_COUNT tabelle:"
echo "$TABLES" | while read table; do
    echo "  - $table"
done
echo ""

echo "📤 Step 2: Export dati per ogni tabella..."
echo ""

mkdir -p /tmp/d1-backup
BACKUP_FILE="/tmp/d1-backup/clone-$(date +%Y%m%d_%H%M%S).sql"

echo "-- D1 Database Backup" > "$BACKUP_FILE"
echo "-- Source: $SOURCE_DB_NAME" >> "$BACKUP_FILE"
echo "-- Date: $(date)" >> "$BACKUP_FILE"
echo "" >> "$BACKUP_FILE"

# Per ogni tabella, export schema e dati
echo "$TABLES" | while read TABLE; do
    if [ -z "$TABLE" ]; then
        continue
    fi
    
    echo "Esportazione: $TABLE"
    
    # Ottieni schema
    SCHEMA=$(echo "$TABLES_JSON" | jq -r ".result[0].results[] | select(.name==\"$TABLE\") | .sql")
    echo "" >> "$BACKUP_FILE"
    echo "-- Table: $TABLE" >> "$BACKUP_FILE"
    echo "$SCHEMA;" >> "$BACKUP_FILE"
    echo "" >> "$BACKUP_FILE"
    
    # Conta record
    COUNT_JSON=$(curl -s -X POST \
      "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$SOURCE_DB_ID/query" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"sql\": \"SELECT COUNT(*) as count FROM $TABLE\"}")
    
    COUNT=$(echo "$COUNT_JSON" | jq -r '.result[0].results[0].count' 2>/dev/null || echo "0")
    
    echo "  → $COUNT record"
    
    if [ "$COUNT" -gt 0 ]; then
        # Export dati
        DATA_JSON=$(curl -s -X POST \
          "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/d1/database/$SOURCE_DB_ID/query" \
          -H "Authorization: Bearer $API_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{\"sql\": \"SELECT * FROM $TABLE\"}")
        
        # Salva in formato JSON per ora
        echo "$DATA_JSON" > "/tmp/d1-backup/$TABLE-data.json"
        
        echo "  ✅ Esportato"
    else
        echo "  → Vuota, skip"
    fi
done

echo ""
echo -e "${GREEN}✅ Export completato: $BACKUP_FILE${NC}"
echo ""

# Mostra dimensione backup
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "Dimensione backup: $SIZE"
fi

echo ""
echo "📋 Prossimi passi MANUALI:"
echo ""
echo "1. Crea il database Preview nel dashboard Cloudflare:"
echo "   https://dash.cloudflare.com/$ACCOUNT_ID/workers-and-pages/d1"
echo "   - Click 'Create database'"
echo "   - Nome: $TARGET_DB_NAME"
echo ""
echo "2. Prendi nota del Database ID generato"
echo ""
echo "3. Importa lo schema usando Wrangler con un token con permessi D1:"
echo "   export CLOUDFLARE_API_TOKEN='<token-con-permessi-d1>'"
echo "   npx wrangler d1 execute $TARGET_DB_NAME --remote --file=$BACKUP_FILE"
echo ""
echo "4. Configura il binding nel dashboard Pages:"
echo "   Settings → Bindings → Modifica 'DB' per Preview"
echo "   Seleziona: $TARGET_DB_NAME"
echo ""
echo "File backup disponibili in: /tmp/d1-backup/"
ls -lh /tmp/d1-backup/ 2>/dev/null || echo "Nessun file"
echo ""
echo "========================================================"
