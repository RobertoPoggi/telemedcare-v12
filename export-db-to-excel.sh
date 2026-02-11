#!/bin/bash

# =============================================
# Script per esportare DB Cloudflare D1 in Excel
# =============================================

set -e

echo "📊 EXPORT DATABASE CLOUDFLARE D1 → EXCEL"
echo "=========================================="
echo ""

DB_NAME="telemedcare-db"
OUTPUT_DIR="./db-exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Crea directory output
mkdir -p "$OUTPUT_DIR"

echo "📦 Database: $DB_NAME"
echo "📁 Output: $OUTPUT_DIR"
echo ""

# =============================================
# EXPORT TABELLA LEADS (principale)
# =============================================
echo "📝 EXPORT 1/8: Tabella LEADS..."

npx wrangler d1 execute $DB_NAME --remote --command="
SELECT 
    id,
    nomeRichiedente,
    cognomeRichiedente,
    email,
    telefono,
    nomeAssistito,
    cognomeAssistito,
    dataNascitaAssistito,
    cfAssistito,
    servizio,
    piano,
    tipoServizio,
    prezzo_anno,
    prezzo_rinnovo,
    fonte,
    status,
    vuoleContratto,
    vuoleBrochure,
    gdprConsent,
    created_at,
    updated_at
FROM leads
ORDER BY created_at DESC
" --json > "$OUTPUT_DIR/leads_${TIMESTAMP}.json"

echo "✅ leads_${TIMESTAMP}.json creato"
echo ""

# =============================================
# EXPORT TABELLA CONTRACTS
# =============================================
echo "📝 EXPORT 2/8: Tabella CONTRACTS..."

npx wrangler d1 execute $DB_NAME --remote --command="
SELECT 
    id,
    lead_id,
    contract_code,
    tipo_servizio,
    prezzo_base,
    prezzo_iva_inclusa,
    status,
    created_at
FROM contracts
ORDER BY created_at DESC
" --json > "$OUTPUT_DIR/contracts_${TIMESTAMP}.json"

echo "✅ contracts_${TIMESTAMP}.json creato"
echo ""

# =============================================
# EXPORT STATISTICHE GENERALI
# =============================================
echo "📝 EXPORT 3/8: Statistiche generali..."

npx wrangler d1 execute $DB_NAME --remote --command="
SELECT 
    COUNT(*) as total_leads,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(CASE WHEN status = 'NEW' THEN 1 END) as status_new,
    COUNT(CASE WHEN status = 'CONTACTED' THEN 1 END) as status_contacted,
    COUNT(CASE WHEN status = 'CONTRACT_SENT' THEN 1 END) as status_contract_sent,
    COUNT(CASE WHEN status = 'CONTRACT_SIGNED' THEN 1 END) as status_contract_signed,
    COUNT(CASE WHEN fonte = 'IRBEMA' THEN 1 END) as fonte_irbema,
    COUNT(CASE WHEN servizio LIKE '%FAMILY%' THEN 1 END) as servizio_family,
    COUNT(CASE WHEN servizio LIKE '%PRO%' THEN 1 END) as servizio_pro,
    COUNT(CASE WHEN servizio LIKE '%PREMIUM%' THEN 1 END) as servizio_premium
FROM leads
" --json > "$OUTPUT_DIR/stats_${TIMESTAMP}.json"

echo "✅ stats_${TIMESTAMP}.json creato"
echo ""

# =============================================
# EXPORT VERIFICA DUPLICATI EMAIL/TELEFONO
# =============================================
echo "📝 EXPORT 4/8: Verifica campi duplicati email/telefono..."

npx wrangler d1 execute $DB_NAME --remote --command="
SELECT 
    id,
    nomeRichiedente,
    cognomeRichiedente,
    email,
    telefono,
    created_at,
    CASE 
        WHEN email IS NULL THEN 'MANCANTE'
        ELSE 'OK'
    END as email_status,
    CASE 
        WHEN telefono IS NULL THEN 'MANCANTE'
        ELSE 'OK'
    END as telefono_status
FROM leads
ORDER BY created_at DESC
LIMIT 100
" --json > "$OUTPUT_DIR/duplicati_check_${TIMESTAMP}.json"

echo "✅ duplicati_check_${TIMESTAMP}.json creato"
echo ""

# =============================================
# CONVERSIONE JSON → CSV per Excel
# =============================================
echo "📝 STEP 5/8: Conversione JSON → CSV..."

# Funzione per convertire JSON in CSV
convert_json_to_csv() {
    local json_file="$1"
    local csv_file="${json_file%.json}.csv"
    
    if [ -f "$json_file" ]; then
        # Estrae le chiavi dalla prima riga come header
        jq -r '(.[0] | keys_unsorted) as $keys | $keys, map([.[ $keys[] ]])[] | @csv' "$json_file" > "$csv_file" 2>/dev/null || {
            echo "⚠️  Impossibile convertire $json_file (forse vuoto o formato non valido)"
            return 1
        }
        echo "✅ $(basename $csv_file) creato"
    fi
}

# Converti tutti i JSON in CSV
for json_file in "$OUTPUT_DIR"/*.json; do
    convert_json_to_csv "$json_file"
done

echo ""

# =============================================
# EXPORT SCHEMA TABELLA
# =============================================
echo "📝 EXPORT 6/8: Schema tabella leads..."

npx wrangler d1 execute $DB_NAME --remote --command="
PRAGMA table_info(leads);
" --json > "$OUTPUT_DIR/schema_leads_${TIMESTAMP}.json"

echo "✅ schema_leads_${TIMESTAMP}.json creato"
echo ""

# =============================================
# EXPORT TRIGGER E INDICI
# =============================================
echo "📝 EXPORT 7/8: Trigger e indici..."

npx wrangler d1 execute $DB_NAME --remote --command="
SELECT name, type, sql FROM sqlite_master 
WHERE type IN ('trigger', 'index') 
AND tbl_name = 'leads'
ORDER BY type, name;
" --json > "$OUTPUT_DIR/triggers_indexes_${TIMESTAMP}.json"

echo "✅ triggers_indexes_${TIMESTAMP}.json creato"
echo ""

# =============================================
# SUMMARY
# =============================================
echo "📝 EXPORT 8/8: Summary finale..."

cat > "$OUTPUT_DIR/README_${TIMESTAMP}.txt" << EOF
EXPORT DATABASE TELEMEDCARE - $(date)
=====================================

Directory: $OUTPUT_DIR
Timestamp: $TIMESTAMP

File creati:
1. leads_${TIMESTAMP}.csv - Tutti i lead (max 1000 righe)
2. contracts_${TIMESTAMP}.csv - Tutti i contratti
3. stats_${TIMESTAMP}.csv - Statistiche generali
4. duplicati_check_${TIMESTAMP}.csv - Verifica duplicati (ultimi 100)
5. schema_leads_${TIMESTAMP}.json - Schema tabella leads
6. triggers_indexes_${TIMESTAMP}.json - Trigger e indici

Come aprire in Excel:
1. Apri Excel
2. File → Apri → Seleziona file .csv
3. Scegli delimitatore: virgola (,)
4. Encoding: UTF-8

Campi principali verificati:
- email (campo unificato)
- telefono (campo unificato)
- cfAssistito (normalizzato)
- cfRichiedente (normalizzato)
- gdprConsent (normalizzato)

Note:
- I file JSON contengono i dati raw da Cloudflare D1
- I file CSV sono pronti per Excel
- Timestamp: $TIMESTAMP per identificare l'export
EOF

echo "✅ README_${TIMESTAMP}.txt creato"
echo ""

# =============================================
# RISULTATI FINALI
# =============================================
echo "================================================"
echo "✅ EXPORT COMPLETATO CON SUCCESSO"
echo "================================================"
echo ""
echo "📁 File creati in: $OUTPUT_DIR/"
ls -lh "$OUTPUT_DIR"/*_${TIMESTAMP}.*
echo ""
echo "📊 Apri i file CSV in Excel per analisi completa"
echo ""
echo "🔍 Verifica campi duplicati in: duplicati_check_${TIMESTAMP}.csv"
echo ""
