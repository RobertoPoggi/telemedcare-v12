#!/bin/bash

###############################################################################
# TEST DIAGNOSTICO ENDPOINTS TELEMEDCARE V12
# 
# Test rapidi per verificare lo stato di salute degli endpoint critici
# Data: 2026-02-04
###############################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_BASE_URL="${API_BASE_URL:-https://telemedcare-v12.pages.dev}"

echo "================================================================================"
echo "🔍 DIAGNOSTICA ENDPOINTS TELEMEDCARE V12"
echo "================================================================================"
echo ""
echo "📍 Base URL: $API_BASE_URL"
echo ""

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

TESTS_PASSED=0
TESTS_FAILED=0

###############################################################################
# TEST 1: HEALTH CHECK
###############################################################################
echo ""
log "================================================================================"
log "TEST 1: HEALTH CHECK"
log "================================================================================"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/")

if [ "$HTTP_CODE" = "200" ]; then
    log_success "Landing page → HTTP $HTTP_CODE"
    ((TESTS_PASSED++))
else
    log_error "Landing page → HTTP $HTTP_CODE"
    ((TESTS_FAILED++))
fi

###############################################################################
# TEST 2: SETTINGS API
###############################################################################
echo ""
log "================================================================================"
log "TEST 2: SETTINGS API"
log "================================================================================"

SETTINGS_RESPONSE=$(curl -s "$API_BASE_URL/api/settings")

if echo "$SETTINGS_RESPONSE" | grep -q 'hubspot_auto_import_enabled'; then
    log_success "GET /api/settings → OK"
    ((TESTS_PASSED++))
    
    echo ""
    echo "Settings attuali:"
    echo "$SETTINGS_RESPONSE" | jq -r '.settings | to_entries[] | "  \(.key): \(.value.value)"' 2>/dev/null || echo "$SETTINGS_RESPONSE"
else
    log_error "GET /api/settings → ERRORE"
    echo "$SETTINGS_RESPONSE"
    ((TESTS_FAILED++))
fi

###############################################################################
# TEST 3: DATABASE CHECK (via debug endpoint)
###############################################################################
echo ""
log "================================================================================"
log "TEST 3: DATABASE STATUS"
log "================================================================================"

DB_RESPONSE=$(curl -s "$API_BASE_URL/api/debug/env")

if echo "$DB_RESPONSE" | grep -q 'DB'; then
    log_success "GET /api/debug/env → OK"
    ((TESTS_PASSED++))
    
    echo ""
    echo "Environment status:"
    echo "$DB_RESPONSE" | jq '.' 2>/dev/null || echo "$DB_RESPONSE"
else
    log_warning "GET /api/debug/env → Endpoint non disponibile"
fi

###############################################################################
# TEST 4: CONTRACTS SIGN ENDPOINT
###############################################################################
echo ""
log "================================================================================"
log "TEST 4: CONTRACTS/SIGN ENDPOINT (senza payload)"
log "================================================================================"

SIGN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/contracts/sign" \
  -H "Content-Type: application/json" \
  -d '{}')

# Ci aspettiamo un errore 400 "Dati firma mancanti"
if echo "$SIGN_RESPONSE" | grep -q 'Dati firma mancanti'; then
    log_success "POST /api/contracts/sign → Endpoint funzionante (errore atteso)"
    ((TESTS_PASSED++))
else
    log_warning "POST /api/contracts/sign → Response inattesa"
    echo "$SIGN_RESPONSE"
fi

###############################################################################
# TEST 5: WORKFLOW EMAIL MANAGER IMPORTS
###############################################################################
echo ""
log "================================================================================"
log "TEST 5: VERIFICA MODULI WORKFLOW"
log "================================================================================"

# Lista moduli critici da verificare
MODULES=(
    "workflow-email-manager"
    "settings-api"
    "email-service"
    "lead-notifications"
)

log "Moduli critici nel codebase:"
for module in "${MODULES[@]}"; do
    if [ -f "src/modules/${module}.ts" ]; then
        SIZE=$(du -h "src/modules/${module}.ts" | cut -f1)
        log_success "${module}.ts exists ($SIZE)"
    else
        log_error "${module}.ts MISSING"
    fi
done

###############################################################################
# TEST 6: SWITCHES CONTROL
###############################################################################
echo ""
log "================================================================================"
log "TEST 6: TEST CONTROL SWITCHES"
log "================================================================================"

# Test aggiornamento setting (torna subito al valore originale)
log "Test UPDATE setting..."

# Leggi valore corrente
CURRENT_VALUE=$(curl -s "$API_BASE_URL/api/settings" | jq -r '.settings.hubspot_auto_import_enabled.value' 2>/dev/null)

if [ -n "$CURRENT_VALUE" ]; then
    log "Valore corrente hubspot_auto_import_enabled: $CURRENT_VALUE"
    
    # Prova ad aggiornare (usando lo stesso valore per non causare side-effects)
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE_URL/api/settings/hubspot_auto_import_enabled" \
      -H "Content-Type: application/json" \
      -d "{\"value\": \"$CURRENT_VALUE\"}")
    
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        log_success "PUT /api/settings/:key → Funzionante"
        ((TESTS_PASSED++))
    else
        log_error "PUT /api/settings/:key → ERRORE"
        echo "$UPDATE_RESPONSE"
        ((TESTS_FAILED++))
    fi
else
    log_warning "Non è stato possibile leggere il valore corrente"
fi

###############################################################################
# TEST 7: DEBUG LOGS
###############################################################################
echo ""
log "================================================================================"
log "TEST 7: DEBUG LOGS"
log "================================================================================"

LOGS_RESPONSE=$(curl -s "$API_BASE_URL/api/debug/logs")

if [ -n "$LOGS_RESPONSE" ] && [ "$LOGS_RESPONSE" != "null" ]; then
    log_success "GET /api/debug/logs → OK"
    ((TESTS_PASSED++))
    
    echo ""
    echo "Ultimi log (se disponibili):"
    echo "$LOGS_RESPONSE" | jq -r '.logs[]' 2>/dev/null | tail -5 || echo "$LOGS_RESPONSE" | head -10
else
    log_warning "GET /api/debug/logs → Nessun log disponibile"
fi

###############################################################################
# REPORT FINALE
###############################################################################
echo ""
echo "================================================================================"
echo "📊 REPORT DIAGNOSTICA"
echo "================================================================================"
echo ""
echo -e "${GREEN}✅ Test Passati: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Test Falliti: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 SISTEMA FUNZIONANTE!${NC}"
    EXIT_CODE=0
else
    echo -e "${YELLOW}⚠️  ALCUNI TEST FALLITI - Verificare dettagli sopra${NC}"
    EXIT_CODE=1
fi

echo "================================================================================"

exit $EXIT_CODE
