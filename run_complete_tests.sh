#!/bin/bash

# ==========================================
# TEST COMPLETO TELEMEDCARE V11
# ==========================================
# Email test: rpoggi55@gmail.com
# Data: 2025-11-07
# ==========================================

set -e

API_URL="http://localhost:8787"
TEST_EMAIL="rpoggi55@gmail.com"
TEST_PHONE="+39 333 123 4567"

echo "🚀 INIZIO TEST COMPLETO TELEMEDCARE V11"
echo "============================================"
echo "Email test: $TEST_EMAIL"
echo "API URL: $API_URL"
echo ""

# Colori output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==========================================
# TEST 1: SOLO BROCHURE
# ==========================================
echo -e "${YELLOW}TEST 1: Solo Brochure${NC}"
echo "--------------------------------------------"

LEAD1_RESPONSE=$(curl -s -X POST "$API_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "{
    \"nomeRichiedente\": \"Roberto\",
    \"cognomeRichiedente\": \"Poggi\",
    \"emailRichiedente\": \"$TEST_EMAIL\",
    \"telefonoRichiedente\": \"$TEST_PHONE\",
    \"servizio\": \"Solo informazioni\",
    \"vuoleBrochure\": true,
    \"vuoleManuale\": false,
    \"vuoleContratto\": false,
    \"note\": \"TEST 1: Richiesta solo brochure\"
  }")

LEAD1_ID=$(echo $LEAD1_RESPONSE | jq -r '.leadId // empty')

if [ -z "$LEAD1_ID" ]; then
  echo -e "${RED}❌ FALLITO: Lead non creato${NC}"
  echo "Response: $LEAD1_RESPONSE"
else
  echo -e "${GREEN}✅ Lead creato: $LEAD1_ID${NC}"
  echo "Verifica attese:"
  echo "  - Email notifica info@telemedcare.it"
  echo "  - Email con brochure a $TEST_EMAIL"
fi

echo ""
sleep 2

# ==========================================
# TEST 2: BROCHURE + MANUALE
# ==========================================
echo -e "${YELLOW}TEST 2: Brochure + Manuale SiDLY${NC}"
echo "--------------------------------------------"

LEAD2_RESPONSE=$(curl -s -X POST "$API_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "{
    \"nomeRichiedente\": \"Roberto\",
    \"cognomeRichiedente\": \"Poggi\",
    \"emailRichiedente\": \"$TEST_EMAIL\",
    \"telefonoRichiedente\": \"$TEST_PHONE\",
    \"servizio\": \"Pacchetto Base\",
    \"vuoleBrochure\": true,
    \"vuoleManuale\": true,
    \"vuoleContratto\": false,
    \"note\": \"TEST 2: Brochure + Manuale\"
  }")

LEAD2_ID=$(echo $LEAD2_RESPONSE | jq -r '.leadId // empty')

if [ -z "$LEAD2_ID" ]; then
  echo -e "${RED}❌ FALLITO${NC}"
  echo "Response: $LEAD2_RESPONSE"
else
  echo -e "${GREEN}✅ Lead creato: $LEAD2_ID${NC}"
  echo "Verifica attese:"
  echo "  - Email con brochure + manuale a $TEST_EMAIL"
fi

echo ""
sleep 2

# ==========================================
# TEST 3: INFO GENERICHE
# ==========================================
echo -e "${YELLOW}TEST 3: Info generiche (solo brochure automatica)${NC}"
echo "--------------------------------------------"

LEAD3_RESPONSE=$(curl -s -X POST "$API_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "{
    \"nomeRichiedente\": \"Roberto\",
    \"cognomeRichiedente\": \"Poggi\",
    \"emailRichiedente\": \"$TEST_EMAIL\",
    \"telefonoRichiedente\": \"$TEST_PHONE\",
    \"servizio\": \"Richiesta informazioni\",
    \"vuoleBrochure\": false,
    \"vuoleManuale\": false,
    \"vuoleContratto\": false,
    \"note\": \"TEST 3: Solo info generiche\"
  }")

LEAD3_ID=$(echo $LEAD3_RESPONSE | jq -r '.leadId // empty')

if [ -z "$LEAD3_ID" ]; then
  echo -e "${RED}❌ FALLITO${NC}"
else
  echo -e "${GREEN}✅ Lead creato: $LEAD3_ID${NC}"
  echo "Verifica: Email con brochure automatica"
fi

echo ""
sleep 2

# ==========================================
# TEST 4: CONTRATTO BASE
# ==========================================
echo -e "${YELLOW}TEST 4: Contratto Base${NC}"
echo "--------------------------------------------"

LEAD4_RESPONSE=$(curl -s -X POST "$API_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "{
    \"nomeRichiedente\": \"Roberto\",
    \"cognomeRichiedente\": \"Poggi\",
    \"emailRichiedente\": \"$TEST_EMAIL\",
    \"telefonoRichiedente\": \"$TEST_PHONE\",
    \"servizio\": \"Pacchetto Base\",
    \"pacchetto\": \"BASE\",
    \"vuoleBrochure\": false,
    \"vuoleManuale\": false,
    \"vuoleContratto\": true,
    \"note\": \"TEST 4: Richiesta contratto Base\"
  }")

LEAD4_ID=$(echo $LEAD4_RESPONSE | jq -r '.leadId // empty')

if [ -z "$LEAD4_ID" ]; then
  echo -e "${RED}❌ FALLITO${NC}"
  echo "Response: $LEAD4_RESPONSE"
else
  echo -e "${GREEN}✅ Lead creato: $LEAD4_ID${NC}"
  echo "Verifica attese:"
  echo "  - Email notifica info@"
  echo "  - Contratto Base generato"
  echo "  - Email contratto inviata"
fi

echo ""
sleep 2

# ==========================================
# TEST 5: CONTRATTO AVANZATO
# ==========================================
echo -e "${YELLOW}TEST 5: Contratto Avanzato${NC}"
echo "--------------------------------------------"

LEAD5_RESPONSE=$(curl -s -X POST "$API_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "{
    \"nomeRichiedente\": \"Roberto\",
    \"cognomeRichiedente\": \"Poggi\",
    \"emailRichiedente\": \"$TEST_EMAIL\",
    \"telefonoRichiedente\": \"$TEST_PHONE\",
    \"servizio\": \"Pacchetto Avanzato\",
    \"pacchetto\": \"AVANZATO\",
    \"vuoleBrochure\": false,
    \"vuoleManuale\": false,
    \"vuoleContratto\": true,
    \"note\": \"TEST 5: Richiesta contratto Avanzato\"
  }")

LEAD5_ID=$(echo $LEAD5_RESPONSE | jq -r '.leadId // empty')

if [ -z "$LEAD5_ID" ]; then
  echo -e "${RED}❌ FALLITO${NC}"
  echo "Response: $LEAD5_RESPONSE"
else
  echo -e "${GREEN}✅ Lead creato: $LEAD5_ID${NC}"
  echo "Verifica attese:"
  echo "  - Contratto Avanzato generato"
  echo "  - Prezzo: €1024.80 (IVA inclusa)"
fi

echo ""
sleep 2

# ==========================================
# TEST 6: CONTRATTO + DOCUMENTI
# ==========================================
echo -e "${YELLOW}TEST 6: Contratto Avanzato + Brochure + Manuale${NC}"
echo "--------------------------------------------"

LEAD6_RESPONSE=$(curl -s -X POST "$API_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "{
    \"nomeRichiedente\": \"Roberto\",
    \"cognomeRichiedente\": \"Poggi\",
    \"emailRichiedente\": \"$TEST_EMAIL\",
    \"telefonoRichiedente\": \"$TEST_PHONE\",
    \"servizio\": \"Pacchetto Avanzato\",
    \"pacchetto\": \"AVANZATO\",
    \"vuoleBrochure\": true,
    \"vuoleManuale\": true,
    \"vuoleContratto\": true,
    \"note\": \"TEST 6: Tutto completo\"
  }")

LEAD6_ID=$(echo $LEAD6_RESPONSE | jq -r '.leadId // empty')

if [ -z "$LEAD6_ID" ]; then
  echo -e "${RED}❌ FALLITO${NC}"
  echo "Response: $LEAD6_RESPONSE"
else
  echo -e "${GREEN}✅ Lead creato: $LEAD6_ID${NC}"
  echo "Verifica attese:"
  echo "  - Email documenti informativi"
  echo "  - Email contratto Avanzato"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✅ TEST VARIANTI FORM COMPLETATI${NC}"
echo "============================================"
echo ""
echo "Lead creati:"
echo "  TEST 1 (Brochure): $LEAD1_ID"
echo "  TEST 2 (Brochure+Manuale): $LEAD2_ID"
echo "  TEST 3 (Info): $LEAD3_ID"
echo "  TEST 4 (Contratto Base): $LEAD4_ID"
echo "  TEST 5 (Contratto Avanzato): $LEAD5_ID"
echo "  TEST 6 (Tutto): $LEAD6_ID"
echo ""
echo "📧 Verifica email ricevute su: $TEST_EMAIL"
echo ""

# Salva i lead ID per i prossimi test
echo "$LEAD4_ID" > /tmp/lead_base_id.txt
echo "$LEAD5_ID" > /tmp/lead_avanzato_id.txt
echo "$LEAD6_ID" > /tmp/lead_completo_id.txt

echo "✅ Lead ID salvati per test successivi"
echo ""

# ==========================================
# VERIFICA DATABASE
# ==========================================
echo -e "${YELLOW}VERIFICA DATABASE${NC}"
echo "--------------------------------------------"

echo "Conteggio lead creati:"
npx wrangler d1 execute telemedcare-leads --local --command="SELECT COUNT(*) as total FROM leads;" 2>/dev/null | grep -A 1 '"total"' || echo "Errore query database"

echo ""
echo "✅ TEST COMPLETATI - Controlla la tua email!"
