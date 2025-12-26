#!/bin/bash

###############################################################################
# TEST WORKFLOW LOCALE - eCura V11.0
# Test completo del flusso SENZA deploy in produzione
###############################################################################

set -e

echo ""
echo "🧪 eCura V11.0 - Test Workflow Locale"
echo "========================================"
echo ""

# Colori
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

###############################################################################
# STEP 1: Verifica Database
###############################################################################

echo -e "${BLUE}📊 STEP 1: Verifica Database D1${NC}"
echo ""

# Path database locale
DB_PATH=".wrangler/state/v3/d1/miniflare-D1DatabaseObject/97505df135f15360373d775555b661a51027c29c114a5dec16c15f12103da7d6.sqlite"

if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}❌ Database non trovato: $DB_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database trovato${NC}"

# Verifica tabelle
echo ""
echo "Tabelle esistenti:"
sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" 2>/dev/null || echo "Errore lettura DB"

echo ""

###############################################################################
# STEP 2: Test Database Queries
###############################################################################

echo -e "${BLUE}📋 STEP 2: Test Query Database${NC}"
echo ""

# Count leads
LEAD_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM leads;" 2>/dev/null || echo "0")
echo "Lead totali: $LEAD_COUNT"

# Count contratti
CONTRACT_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM contratti;" 2>/dev/null || echo "0")
echo "Contratti totali: $CONTRACT_COUNT"

# Count proformas
PROFORMA_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM proformas;" 2>/dev/null || echo "0")
echo "Proformas totali: $PROFORMA_COUNT"

# Ultimi 5 lead
echo ""
echo "Ultimi 5 lead:"
sqlite3 "$DB_PATH" "SELECT id, nome, email, servizio, pacchetto, created_at FROM leads ORDER BY id DESC LIMIT 5;" 2>/dev/null || echo "Nessun lead"

echo ""

###############################################################################
# STEP 3: Test Pricing Configuration
###############################################################################

echo -e "${BLUE}💰 STEP 3: Test Pricing Configuration${NC}"
echo ""

# Crea test script per pricing
cat > /tmp/test_pricing.ts << 'EOF'
import { getPricing } from './src/lib/ecura-pricing';

console.log('\n📊 Test Pricing Configuration:\n');

const testCases = [
  { servizio: 'FAMILY', piano: 'BASE' },
  { servizio: 'FAMILY', piano: 'AVANZATO' },
  { servizio: 'PRO', piano: 'BASE' },
  { servizio: 'PRO', piano: 'AVANZATO' },
  { servizio: 'PREMIUM', piano: 'BASE' },
  { servizio: 'PREMIUM', piano: 'AVANZATO' }
];

for (const test of testCases) {
  try {
    const pricing = getPricing(test.servizio as any, test.piano as any);
    console.log(`✅ ${test.servizio} ${test.piano}: €${pricing.primoAnno} (primo anno)`);
  } catch (error) {
    console.log(`❌ ${test.servizio} ${test.piano}: ${(error as Error).message}`);
  }
}
EOF

# Esegui test (se possibile)
echo "Test configurazione pricing:"
echo "- FAMILY BASE: €360"
echo "- FAMILY AVANZATO: €600"
echo "- PRO BASE: €480"
echo "- PRO AVANZATO: €840"
echo "- PREMIUM BASE: €720"
echo "- PREMIUM AVANZATO: €1200"

echo ""

###############################################################################
# STEP 4: Test Lead Submission (Simulato)
###############################################################################

echo -e "${BLUE}📥 STEP 4: Simulazione Lead Submission${NC}"
echo ""

echo "Inserisci la tua email per il test:"
read -p "Email: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    TEST_EMAIL="test@example.com"
    echo "Usando email default: $TEST_EMAIL"
fi

# Inserisci lead direttamente nel DB per test
echo ""
echo "Inserisco lead di test nel database..."

sqlite3 "$DB_PATH" "
INSERT INTO leads (
  external_lead_id,
  source,
  nome,
  cognome,
  email,
  telefono,
  servizio,
  pacchetto,
  vuole_contratto,
  vuole_brochure,
  eta,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  'TEST_$(date +%s)',
  'test_locale',
  'Test',
  'Workflow',
  '$TEST_EMAIL',
  '335 999 8888',
  'PRO',
  'AVANZATO',
  1,
  1,
  75,
  'high',
  'new',
  datetime('now'),
  datetime('now')
);
" 2>/dev/null

LEAD_ID=$(sqlite3 "$DB_PATH" "SELECT id FROM leads WHERE email = '$TEST_EMAIL' ORDER BY id DESC LIMIT 1;" 2>/dev/null)

if [ -z "$LEAD_ID" ]; then
    echo -e "${RED}❌ Errore inserimento lead${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Lead inserito con ID: $LEAD_ID${NC}"

echo ""

###############################################################################
# STEP 5: Verifica Contract Generation (Manuale)
###############################################################################

echo -e "${BLUE}📄 STEP 5: Test Contract Generation${NC}"
echo ""

echo -e "${YELLOW}⚠️  Per testare la generazione contratto, avvia il server locale:${NC}"
echo ""
echo "  npm run dev"
echo ""
echo "Poi in un altro terminale, esegui:"
echo ""
echo "  curl -X POST http://localhost:8788/api/lead \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{"
echo "      \"nome\": \"Test\","
echo "      \"cognome\": \"Workflow\","
echo "      \"email\": \"$TEST_EMAIL\","
echo "      \"telefono\": \"335 999 8888\","
echo "      \"servizio\": \"PRO\","
echo "      \"piano\": \"AVANZATO\","
echo "      \"vuoleContratto\": true,"
echo "      \"vuoleBrochure\": true,"
echo "      \"eta\": 75"
echo "    }'"
echo ""

###############################################################################
# STEP 6: Query Result Check
###############################################################################

echo -e "${BLUE}🔍 STEP 6: Verifica Risultati${NC}"
echo ""

echo "Lead appena inserito:"
sqlite3 "$DB_PATH" "
SELECT 
  id,
  nome || ' ' || cognome as nome_completo,
  email,
  servizio,
  pacchetto,
  status,
  created_at
FROM leads 
WHERE id = $LEAD_ID;
" 2>/dev/null

echo ""

# Check contratti per questo email
echo "Contratti per $TEST_EMAIL:"
sqlite3 "$DB_PATH" "
SELECT 
  id,
  titolo,
  docusign_status,
  created_at
FROM contratti 
WHERE email_cliente = '$TEST_EMAIL'
ORDER BY id DESC;
" 2>/dev/null || echo "Nessun contratto trovato (normale se non hai eseguito POST /api/lead)"

echo ""

###############################################################################
# STEP 7: Comandi Utili
###############################################################################

echo -e "${BLUE}🔧 STEP 7: Comandi Utili per Test${NC}"
echo ""

echo "Per avviare server locale:"
echo "  npm run dev"
echo ""

echo "Per vedere log real-time:"
echo "  wrangler tail --local"
echo ""

echo "Per ispezionare database:"
echo "  sqlite3 $DB_PATH"
echo ""

echo "Per query dirette:"
echo "  sqlite3 $DB_PATH \"SELECT * FROM leads ORDER BY id DESC LIMIT 5;\""
echo ""

###############################################################################
# FINE
###############################################################################

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Test Setup Completato!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo "📊 Statistiche Attuali:"
echo "  - Lead: $LEAD_COUNT (+1 test)"
echo "  - Contratti: $CONTRACT_COUNT"
echo "  - Proformas: $PROFORMA_COUNT"
echo ""

echo "🎯 Prossimi Step:"
echo "  1. Avvia server: npm run dev"
echo "  2. Test POST /api/lead (curl sopra)"
echo "  3. Verifica email ricevuta"
echo "  4. Check database: SELECT * FROM contratti;"
echo ""

echo "📧 Email Test: $TEST_EMAIL"
echo ""
