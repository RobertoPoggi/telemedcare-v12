#!/bin/bash
set -e

echo "🚀 D1 Database Quick Clone - Production → Preview"
echo "=================================================="
echo ""

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SOURCE_DB="telemedcare-leads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/d1_backup_${TIMESTAMP}.sql"

echo -e "${YELLOW}NOTA: Production e Preview attualmente condividono lo stesso DB${NC}"
echo ""
echo "Questo script:"
echo "  1. Fa un backup completo di: $SOURCE_DB"
echo "  2. Ti permette di importarlo in un DB separato per Preview"
echo ""

read -p "Procedere? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    exit 0
fi

echo ""
echo "📥 Step 1: Backup database Production..."
echo ""

# Export completo del database
npx wrangler d1 export "$SOURCE_DB" --remote --output="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup completato: $BACKUP_FILE${NC}"
    
    # Mostra dimensione
    SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "   Dimensione: $SIZE"
    
    # Conta statement SQL
    LINES=$(wc -l < "$BACKUP_FILE")
    echo "   Righe SQL: $LINES"
else
    echo "❌ Errore durante il backup"
    exit 1
fi

echo ""
echo "📤 Step 2: Opzioni di restore..."
echo ""

echo "Opzioni:"
echo "  1) Creare nuovo database 'telemedcare-leads-preview' e importare"
echo "  2) Solo salvare il backup (importare manualmente dopo)"
echo ""

read -p "Scelta (1/2): " CHOICE

if [ "$CHOICE" == "1" ]; then
    NEW_DB="telemedcare-leads-preview"
    
    echo ""
    echo "Creazione database: $NEW_DB"
    npx wrangler d1 create "$NEW_DB" 2>/dev/null || echo "Database potrebbe già esistere"
    
    echo ""
    echo "Import dati..."
    npx wrangler d1 execute "$NEW_DB" --remote --file="$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Import completato su $NEW_DB${NC}"
        echo ""
        echo "📝 Prossimi passi:"
        echo "  1. Vai su Cloudflare Pages → Settings → Bindings"
        echo "  2. Modifica binding 'DB' per environment Preview"
        echo "  3. Seleziona database: $NEW_DB"
        echo "  4. Salva (triggera redeploy automatico)"
    else
        echo "❌ Errore durante import"
        exit 1
    fi
else
    echo ""
    echo "Backup salvato in: $BACKUP_FILE"
    echo ""
    echo "Per importare manualmente:"
    echo "  npx wrangler d1 create telemedcare-leads-preview"
    echo "  npx wrangler d1 execute telemedcare-leads-preview --remote --file=$BACKUP_FILE"
fi

echo ""
echo "=================================================="
echo "✅ Operazione completata!"
echo "=================================================="
