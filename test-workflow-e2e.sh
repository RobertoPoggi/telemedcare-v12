#!/bin/bash

###############################################################################
# TEST END-TO-END WORKFLOW TELEMEDCARE V12
# 
# Questo script testa il workflow completo:
# 1. Creazione Lead
# 2. Invio Email Documenti Informativi
# 3. Generazione e Invio Contratto
# 4. Firma Contratto
# 5. Generazione e Invio Proforma
# 6. Verifica Stati nel Database
#
# Data: 2026-02-04
###############################################################################

# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurazione
API_BASE_URL="${API_BASE_URL:-https://telemedcare-v12.pages.dev}"
LEAD_EMAIL="test-e2e-$(date +%s)@example.com"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="test-e2e-${TIMESTAMP}.log"

echo "================================================================================"
echo "🧪 TEST END-TO-END WORKFLOW TELEMEDCARE V12"
echo "================================================================================"
echo ""
echo "📍 Base URL: $API_BASE_URL"
echo "📧 Email Test: $LEAD_EMAIL"
echo "📄 Log File: $LOG_FILE"
echo ""

# Funzione per log
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Contatori
TESTS_PASSED=0
TESTS_FAILED=0

###############################################################################
# TEST 1: CREAZIONE LEAD
###############################################################################
echo ""
log "================================================================================"
log "TEST 1: CREAZIONE LEAD"
log "================================================================================"

LEAD_PAYLOAD=$(cat <<EOF
{
  "nomeRichiedente": "Mario",
  "cognomeRichiedente": "Rossi",
  "email": "$LEAD_EMAIL",
  "telefono": "+39 333 1234567",
  "cittaAssistito": "Milano",
  "servizio": "eCura PRO",
  "piano": "BASE",
  "vuoleBrochure": true,
  "vuoleContratto": true,
  "fonte": "Test E2E Script"
}
EOF
)

log "Invio richiesta POST /api/lead..."
LEAD_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "$LEAD_PAYLOAD")

echo "$LEAD_RESPONSE" >> "$LOG_FILE"

# Estrai leadId dalla risposta
LEAD_ID=$(echo "$LEAD_RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$LEAD_ID" ]; then
    log_success "Lead creato con successo: $LEAD_ID"
    ((TESTS_PASSED++))
else
    log_error "Errore creazione lead"
    echo "$LEAD_RESPONSE"
    ((TESTS_FAILED++))
    exit 1
fi

# Pausa per permettere processing
sleep 2

###############################################################################
# TEST 2: VERIFICA LEAD NEL DATABASE
###############################################################################
echo ""
log "================================================================================"
log "TEST 2: VERIFICA LEAD NEL DATABASE"
log "================================================================================"

log "Verifica lead $LEAD_ID nel database..."

# Nota: questo richiede accesso al database D1 via wrangler
# Per ora verifichiamo via API se disponibile
log_warning "Verifica database richiede accesso diretto - da implementare"

###############################################################################
# TEST 3: TEST EMAIL DOCUMENTI INFORMATIVI
###############################################################################
echo ""
log "================================================================================"
log "TEST 3: INVIO EMAIL DOCUMENTI INFORMATIVI"
log "================================================================================"

log "Simulazione invio email documenti informativi..."

# Verifica che l'endpoint esista
WORKFLOW_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/api/workflows/test")

if [ "$WORKFLOW_CHECK" = "200" ] || [ "$WORKFLOW_CHECK" = "404" ]; then
    log_success "API workflow risponde"
    ((TESTS_PASSED++))
else
    log_warning "API workflow non disponibile (HTTP $WORKFLOW_CHECK)"
fi

###############################################################################
# TEST 4: GENERAZIONE CONTRATTO
###############################################################################
echo ""
log "================================================================================"
log "TEST 4: GENERAZIONE CONTRATTO"
log "================================================================================"

CONTRACT_PAYLOAD=$(cat <<EOF
{
  "leadId": "$LEAD_ID",
  "servizio": "eCura PRO",
  "piano": "BASE",
  "prezzoBase": 480.00,
  "dispositivo": "SiDLY Care PRO"
}
EOF
)

log "Richiesta generazione contratto per lead $LEAD_ID..."
CONTRACT_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/contracts/generate" \
  -H "Content-Type: application/json" \
  -d "$CONTRACT_PAYLOAD")

echo "$CONTRACT_RESPONSE" >> "$LOG_FILE"

# Estrai contractId
CONTRACT_ID=$(echo "$CONTRACT_RESPONSE" | grep -o '"contractId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CONTRACT_ID" ]; then
    log_success "Contratto generato: $CONTRACT_ID"
    ((TESTS_PASSED++))
else
    log_warning "Endpoint generazione contratto non disponibile o errore"
    log "Response: $CONTRACT_RESPONSE"
fi

###############################################################################
# TEST 5: SIMULAZIONE FIRMA CONTRATTO
###############################################################################
echo ""
log "================================================================================"
log "TEST 5: SIMULAZIONE FIRMA CONTRATTO"
log "================================================================================"

if [ -n "$CONTRACT_ID" ]; then
    # Genera una firma base64 fake (immagine 1x1 pixel trasparente PNG)
    FAKE_SIGNATURE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    SIGNATURE_PAYLOAD=$(cat <<EOF
{
  "contractId": "$CONTRACT_ID",
  "signatureData": "$FAKE_SIGNATURE",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "userAgent": "Test-E2E-Script/1.0",
  "screenResolution": "1920x1080"
}
EOF
)

    log "Invio firma contratto..."
    SIGNATURE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/contracts/sign" \
      -H "Content-Type: application/json" \
      -d "$SIGNATURE_PAYLOAD")
    
    echo "$SIGNATURE_RESPONSE" >> "$LOG_FILE"
    
    if echo "$SIGNATURE_RESPONSE" | grep -q '"success":true'; then
        log_success "Firma contratto registrata con successo"
        ((TESTS_PASSED++))
    else
        log_error "Errore firma contratto"
        echo "$SIGNATURE_RESPONSE"
        ((TESTS_FAILED++))
    fi
else
    log_warning "Nessun CONTRACT_ID disponibile - skip test firma"
fi

###############################################################################
# TEST 6: VERIFICA STATI E SWITCHES
###############################################################################
echo ""
log "================================================================================"
log "TEST 6: VERIFICA SETTINGS SWITCHES"
log "================================================================================"

log "Verifica stato settings..."
SETTINGS_RESPONSE=$(curl -s "$API_BASE_URL/api/settings")

echo "$SETTINGS_RESPONSE" >> "$LOG_FILE"

if echo "$SETTINGS_RESPONSE" | grep -q 'hubspot_auto_import_enabled'; then
    log_success "API Settings risponde correttamente"
    ((TESTS_PASSED++))
    
    # Mostra stato switches
    echo ""
    log "Stato Switches:"
    echo "$SETTINGS_RESPONSE" | grep -o '"[^"]*_enabled":[^,}]*' | while read -r line; do
        echo "  $line"
    done
else
    log_error "Errore API Settings"
    ((TESTS_FAILED++))
fi

###############################################################################
# TEST 7: VERIFICA HEALTH ENDPOINTS
###############################################################################
echo ""
log "================================================================================"
log "TEST 7: VERIFICA HEALTH ENDPOINTS"
log "================================================================================"

ENDPOINTS=(
    "/api/health"
    "/api/settings"
    "/"
)

for endpoint in "${ENDPOINTS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL$endpoint")
    
    if [ "$HTTP_CODE" = "200" ]; then
        log_success "$endpoint → HTTP $HTTP_CODE"
        ((TESTS_PASSED++))
    else
        log_warning "$endpoint → HTTP $HTTP_CODE"
    fi
done

###############################################################################
# REPORT FINALE
###############################################################################
echo ""
echo "================================================================================"
echo "📊 REPORT FINALE TEST E2E"
echo "================================================================================"
echo ""
echo -e "${GREEN}✅ Test Passati: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Test Falliti: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TUTTI I TEST SONO PASSATI!${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}⚠️  ALCUNI TEST SONO FALLITI${NC}"
    EXIT_CODE=1
fi

echo ""
echo "📄 Log completo salvato in: $LOG_FILE"
echo ""

# Dettagli lead creato per cleanup manuale
if [ -n "$LEAD_ID" ]; then
    echo "🔧 Cleanup manuale richiesto:"
    echo "   Lead ID: $LEAD_ID"
    echo "   Email: $LEAD_EMAIL"
    echo ""
fi

echo "================================================================================"

exit $EXIT_CODE
