#!/bin/bash
#
# TeleMedCare V11.0 - Test Workflow Step 1: Invio Documenti Informativi
# 
# Questo script testa il workflow di invio documenti (brochure/manuale)
# per i lead che richiedono SOLO documentazione e NON il contratto
#

set -e

echo "=========================================="
echo "🧪 TeleMedCare V11.0 - Test Workflow Step 1"
echo "=========================================="
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo "📋 Test Scenario: Lead richiede solo brochure e manuale (NO contratto)"
echo ""

# Test 1: Lead che richiede brochure e manuale
echo -e "${YELLOW}Test 1: Lead Roberto Test - Richiede brochure + manuale${NC}"
echo ""

LEAD_DATA='{
  "nome": "Roberto",
  "cognomeRichiedente": "Test",
  "email": "roberto.test@example.com",
  "telefono": "+39 339 1234567",
  "servizio": "BASE",
  "eta": "65",
  "vuoleBrochure": true,
  "vuoleManuale": true,
  "vuoleContratto": false,
  "note": "Richiedo solo documentazione informativa",
  "privacy": true
}'

echo "📤 Invio lead al server..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "$LEAD_DATA")

echo "$RESPONSE" | jq '.'

# Estrai leadId dalla risposta
LEAD_ID=$(echo "$RESPONSE" | jq -r '.leadId')
WORKFLOW_SUCCESS=$(echo "$RESPONSE" | jq -r '.workflow.success')

echo ""
echo "Lead ID: $LEAD_ID"
echo "Workflow Success: $WORKFLOW_SUCCESS"
echo ""

if [ "$WORKFLOW_SUCCESS" == "true" ]; then
  echo -e "${GREEN}✅ Test 1 PASSED: Workflow documenti completato con successo${NC}"
  
  # Verifica che il messaggio confermi l'invio dei documenti
  WORKFLOW_MESSAGE=$(echo "$RESPONSE" | jq -r '.workflow.message')
  echo "Workflow Message: $WORKFLOW_MESSAGE"
  
  if [[ "$WORKFLOW_MESSAGE" == *"documenti informativi"* ]]; then
    echo -e "${GREEN}✅ Messaggio workflow corretto${NC}"
  else
    echo -e "${RED}❌ Messaggio workflow non corretto${NC}"
  fi
else
  echo -e "${RED}❌ Test 1 FAILED: Workflow documenti fallito${NC}"
  exit 1
fi

echo ""
echo "=========================================="

# Test 2: Lead che richiede solo la brochure
echo -e "${YELLOW}Test 2: Lead Anna Demo - Richiede solo brochure${NC}"
echo ""

LEAD_DATA_2='{
  "nome": "Anna",
  "cognomeRichiedente": "Demo",
  "email": "anna.demo@example.com",
  "telefono": "+39 347 9876543",
  "servizio": "AVANZATO",
  "eta": "58",
  "vuoleBrochure": true,
  "vuoleManuale": false,
  "vuoleContratto": false,
  "note": "Solo brochure informativa grazie",
  "privacy": true
}'

echo "📤 Invio secondo lead al server..."
RESPONSE_2=$(curl -s -X POST "$BASE_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "$LEAD_DATA_2")

echo "$RESPONSE_2" | jq '.'

LEAD_ID_2=$(echo "$RESPONSE_2" | jq -r '.leadId')
WORKFLOW_SUCCESS_2=$(echo "$RESPONSE_2" | jq -r '.workflow.success')

echo ""
echo "Lead ID: $LEAD_ID_2"
echo "Workflow Success: $WORKFLOW_SUCCESS_2"
echo ""

if [ "$WORKFLOW_SUCCESS_2" == "true" ]; then
  echo -e "${GREEN}✅ Test 2 PASSED: Workflow solo brochure completato${NC}"
else
  echo -e "${RED}❌ Test 2 FAILED: Workflow solo brochure fallito${NC}"
  exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 TUTTI I TEST COMPLETATI CON SUCCESSO!${NC}"
echo "=========================================="
echo ""
echo "📧 Verifica la tua email per controllare la ricezione dei documenti"
echo ""
