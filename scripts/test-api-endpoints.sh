#!/bin/bash

###############################################################################
# TEST API ENDPOINTS - eCura V11.0
# Test specifico di ogni endpoint API senza deploy
###############################################################################

echo ""
echo "🧪 Test API Endpoints eCura V11.0"
echo "===================================="
echo ""

# Server URL (locale)
SERVER_URL="${SERVER_URL:-http://localhost:8788}"

# Colori
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  PREREQUISITO: Server deve essere avviato con 'npm run dev'${NC}"
echo ""
read -p "Server avviato su $SERVER_URL? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Avvia prima il server con: npm run dev"
    exit 1
fi

echo ""

###############################################################################
# Test 1: Health Check
###############################################################################

echo -e "${BLUE}🏥 TEST 1: Health Check${NC}"
echo ""

RESPONSE=$(curl -s "$SERVER_URL/health" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check OK${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}❌ Health check FAILED${NC}"
fi

echo ""

###############################################################################
# Test 2: GET Brochures
###############################################################################

echo -e "${BLUE}📚 TEST 2: GET Brochures${NC}"
echo ""

RESPONSE=$(curl -s "$SERVER_URL/api/brochures" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Brochures endpoint OK${NC}"
    echo "$RESPONSE" | jq '.brochures | length' 2>/dev/null || echo "Risposta ricevuta"
else
    echo -e "${RED}❌ Brochures endpoint FAILED${NC}"
fi

echo ""

###############################################################################
# Test 3: GET Templates
###############################################################################

echo -e "${BLUE}📄 TEST 3: GET Templates${NC}"
echo ""

RESPONSE=$(curl -s "$SERVER_URL/api/templates" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Templates endpoint OK${NC}"
    echo "$RESPONSE" | jq '.templates | length' 2>/dev/null || echo "Risposta ricevuta"
else
    echo -e "${RED}❌ Templates endpoint FAILED${NC}"
fi

echo ""

###############################################################################
# Test 4: POST Lead (Test Completo)
###############################################################################

echo -e "${BLUE}📥 TEST 4: POST Lead (Workflow Completo)${NC}"
echo ""

echo "Inserisci la tua email per il test completo:"
read -p "Email: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    TEST_EMAIL="test-$(date +%s)@example.com"
    echo "Usando email auto-generata: $TEST_EMAIL"
fi

echo ""
echo "Invio lead a $SERVER_URL/api/lead..."
echo ""

RESPONSE=$(curl -s -X POST "$SERVER_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "{
    \"nome\": \"Test\",
    \"cognome\": \"Workflow\",
    \"email\": \"$TEST_EMAIL\",
    \"telefono\": \"335 999 8888\",
    \"servizio\": \"PRO\",
    \"piano\": \"AVANZATO\",
    \"vuoleContratto\": true,
    \"vuoleBrochure\": true,
    \"eta\": 75
  }" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lead submission OK${NC}"
    echo ""
    echo "Risposta:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    # Estrai contract_id se presente
    CONTRACT_ID=$(echo "$RESPONSE" | jq -r '.contractId' 2>/dev/null)
    
    if [ "$CONTRACT_ID" != "null" ] && [ ! -z "$CONTRACT_ID" ]; then
        echo ""
        echo -e "${GREEN}📄 Contratto generato: ID $CONTRACT_ID${NC}"
        
        # Test GET contratto
        echo ""
        echo "Test GET contratto..."
        CONTRACT_RESPONSE=$(curl -s "$SERVER_URL/api/contratti/$CONTRACT_ID" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ GET contratto OK${NC}"
            echo "$CONTRACT_RESPONSE" | jq '.contract.docusign_status' 2>/dev/null
        fi
    fi
else
    echo -e "${RED}❌ Lead submission FAILED${NC}"
    echo "$RESPONSE"
fi

echo ""

###############################################################################
# Test 5: GET Pricing
###############################################################################

echo -e "${BLUE}💰 TEST 5: GET Pricing${NC}"
echo ""

for SERVIZIO in "FAMILY" "PRO" "PREMIUM"; do
  for PIANO in "BASE" "AVANZATO"; do
    RESPONSE=$(curl -s "$SERVER_URL/api/pricing?servizio=$SERVIZIO&piano=$PIANO" 2>/dev/null)
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
      PREZZO=$(echo "$RESPONSE" | jq -r '.pricing.primoAnno' 2>/dev/null)
      echo "✅ $SERVIZIO $PIANO: €$PREZZO"
    else
      echo "❌ $SERVIZIO $PIANO: ERROR"
    fi
  done
done

echo ""

###############################################################################
# Test 6: Database Verification
###############################################################################

echo -e "${BLUE}🗄️  TEST 6: Database Verification${NC}"
echo ""

DB_PATH=".wrangler/state/v3/d1/miniflare-D1DatabaseObject/97505df135f15360373d775555b661a51027c29c114a5dec16c15f12103da7d6.sqlite"

if [ -f "$DB_PATH" ]; then
    echo "Ultimi 3 lead inseriti:"
    sqlite3 "$DB_PATH" "
      SELECT 
        id,
        nome || ' ' || cognome as nome_completo,
        email,
        servizio,
        pacchetto,
        created_at
      FROM leads 
      ORDER BY id DESC 
      LIMIT 3;
    " 2>/dev/null
    
    echo ""
    
    echo "Ultimi 3 contratti generati:"
    sqlite3 "$DB_PATH" "
      SELECT 
        id,
        nome_cliente,
        email_cliente,
        docusign_status,
        created_at
      FROM contratti 
      ORDER BY id DESC 
      LIMIT 3;
    " 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Database non trovato (normale se mai avviato dev server)${NC}"
fi

echo ""

###############################################################################
# Test 7: Dashboard API (se implementato)
###############################################################################

echo -e "${BLUE}📊 TEST 7: Dashboard API${NC}"
echo ""

# Test KPI endpoint
echo "Test /api/dashboard/kpis..."
RESPONSE=$(curl -s "$SERVER_URL/api/dashboard/kpis" 2>/dev/null)

if [ $? -eq 0 ] && echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dashboard KPIs OK${NC}"
    echo "$RESPONSE" | jq '.kpis' 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Dashboard API non ancora implementato (normale)${NC}"
fi

echo ""

###############################################################################
# RIEPILOGO
###############################################################################

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ Test API Completati${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

echo "📧 Email Test: $TEST_EMAIL"
echo ""

echo "🔍 Verifica Manuale:"
echo "  1. Controlla email ricevuta a: $TEST_EMAIL"
echo "  2. Apri link DocuSign"
echo "  3. Firma contratto"
echo "  4. Verifica email Proforma + Stripe"
echo ""

echo "📊 Query Database:"
echo "  sqlite3 $DB_PATH \"SELECT * FROM leads WHERE email = '$TEST_EMAIL';\""
echo "  sqlite3 $DB_PATH \"SELECT * FROM contratti WHERE email_cliente = '$TEST_EMAIL';\""
echo ""

echo "🎯 Se tutto funziona:"
echo "  1. Deploy Producer: wrangler deploy --config wrangler-producer.toml"
echo "  2. Deploy Consumer: wrangler deploy --config wrangler-consumer.toml"
echo "  3. Setup Cloudflare Queue"
echo ""
