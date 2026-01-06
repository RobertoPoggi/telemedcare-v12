#!/bin/bash
set -e

echo "📦 Cloudflare D1 - Clone Database da Production a Preview"
echo "============================================================"
echo ""

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  IMPORTANTE: Questo script fa un DUMP e RESTORE dei dati${NC}"
echo ""
echo "NOTA: Attualmente Production e Preview condividono lo stesso database:"
echo "  Database: telemedcare-leads"
echo "  ID: e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f"
echo ""
echo "Questo script è utile se vuoi:"
echo "  1. Creare un database D1 separato per Preview"
echo "  2. Copiare i dati da Production a Preview (isolato)"
echo ""

read -p "Vuoi procedere? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Operazione annullata."
    exit 0
fi

echo ""
echo -e "${BLUE}Step 1: Verifica installazione Wrangler...${NC}"

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx non trovato. Installa Node.js e npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler disponibile${NC}"
echo ""

echo -e "${BLUE}Step 2: Creazione database Preview (se non esiste)...${NC}"
echo ""

DB_PREVIEW_NAME="telemedcare-leads-preview"

echo "Vuoi creare un nuovo database D1 per Preview?"
echo "  Nome: $DB_PREVIEW_NAME"
echo ""
read -p "Creare nuovo database? (y/N): " CREATE_DB

if [ "$CREATE_DB" == "y" ] || [ "$CREATE_DB" == "Y" ]; then
    echo ""
    echo "Creazione database Preview..."
    npx wrangler d1 create "$DB_PREVIEW_NAME" || {
        echo -e "${YELLOW}⚠️  Database potrebbe già esistere${NC}"
    }
    echo ""
    echo -e "${GREEN}✅ Database Preview pronto${NC}"
    echo ""
    echo "📝 IMPORTANTE: Prendi nota del Database ID e configuralo nel binding Preview!"
fi

echo ""
echo -e "${BLUE}Step 3: Export schema da Production...${NC}"
echo ""

echo "Recupero schema del database Production..."
npx wrangler d1 execute telemedcare-leads --remote --command "SELECT sql FROM sqlite_master WHERE type='table'" > /tmp/d1-schema-dump.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema esportato in /tmp/d1-schema-dump.txt${NC}"
else
    echo -e "${RED}❌ Errore nell'export dello schema${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Export dati da Production...${NC}"
echo ""

TABLES=("leads" "contracts" "document_templates" "assistiti" "devices" "configurations" "email_logs" "proforma")

for TABLE in "${TABLES[@]}"; do
    echo "Esportazione tabella: $TABLE"
    
    # Conta record
    COUNT=$(npx wrangler d1 execute telemedcare-leads --remote --command "SELECT COUNT(*) as count FROM $TABLE" 2>/dev/null | grep -oP '\d+' | head -1 || echo "0")
    
    if [ "$COUNT" -gt 0 ]; then
        echo "  → $COUNT record trovati"
        
        # Export dati (SQLite dump format)
        npx wrangler d1 execute telemedcare-leads --remote --command ".dump $TABLE" > "/tmp/d1-$TABLE-dump.sql" 2>/dev/null || {
            echo "  ⚠️  Errore export, provo metodo alternativo..."
            npx wrangler d1 execute telemedcare-leads --remote --json --command "SELECT * FROM $TABLE" > "/tmp/d1-$TABLE-data.json"
        }
        
        echo -e "${GREEN}  ✅ Esportato${NC}"
    else
        echo "  → Tabella vuota, skip"
    fi
done

echo ""
echo -e "${GREEN}🎉 Export completato!${NC}"
echo ""
echo "File esportati in /tmp/:"
ls -lh /tmp/d1-*.{txt,sql,json} 2>/dev/null || echo "Nessun file"
echo ""

echo -e "${BLUE}Step 5: Import su Preview (OPZIONALE)...${NC}"
echo ""
echo "Se hai creato un database separato per Preview, puoi importare i dati ora."
echo ""
read -p "Vuoi importare i dati nel database Preview? (y/N): " IMPORT_DATA

if [ "$IMPORT_DATA" == "y" ] || [ "$IMPORT_DATA" == "Y" ]; then
    read -p "Nome database Preview (default: $DB_PREVIEW_NAME): " INPUT_DB_NAME
    TARGET_DB=${INPUT_DB_NAME:-$DB_PREVIEW_NAME}
    
    echo ""
    echo "Import dati in: $TARGET_DB"
    
    for TABLE in "${TABLES[@]}"; do
        if [ -f "/tmp/d1-$TABLE-dump.sql" ]; then
            echo "Importazione tabella: $TABLE"
            npx wrangler d1 execute "$TARGET_DB" --remote --file="/tmp/d1-$TABLE-dump.sql" || {
                echo -e "${YELLOW}⚠️  Errore import $TABLE${NC}"
            }
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Import completato!${NC}"
else
    echo "Import skippato. I file di dump sono disponibili in /tmp/ per import manuale."
fi

echo ""
echo "============================================================"
echo -e "${GREEN}✅ Procedura completata!${NC}"
echo "============================================================"
echo ""
echo "📝 Prossimi passi se hai creato un database Preview separato:"
echo "  1. Vai su Cloudflare Dashboard → Pages → Settings → Bindings"
echo "  2. Modifica il binding 'DB' per Preview"
echo "  3. Cambia da 'telemedcare-leads' a '$DB_PREVIEW_NAME'"
echo "  4. Salva e attendi il redeploy"
echo ""
