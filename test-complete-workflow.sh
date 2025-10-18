#!/bin/bash

# TeleMedCare V11.0 - Complete Workflow Test Script
# Test tutti i 5 step del workflow con email rpoggi55@gmail.com

BASE_URL="https://3000-iqmebcz1hffq3w0isjyj7-2e77fc33.sandbox.novita.ai"
TEST_EMAIL="rpoggi55@gmail.com"
TEST_NAME="Roberto"
TEST_SURNAME="Poggi"
TEST_PHONE="+393331234567"

echo "🚀 TeleMedCare V11.0 - Test Workflow Completo"
echo "=============================================="
echo "Email test: $TEST_EMAIL"
echo "Base URL: $BASE_URL"
echo ""

# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare step
print_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📍 STEP $1: $2${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Funzione per verificare risposta
check_response() {
    local response=$1
    local step_name=$2
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ $step_name: SUCCESS${NC}"
        return 0
    else
        echo -e "${RED}❌ $step_name: FAILED${NC}"
        echo "Response: $response"
        return 1
    fi
}

# STEP 1: Lead Intake + Contract Generation
print_step "1" "Lead Intake + Contract Generation"
echo "Invio lead con richiesta contratto..."

LEAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "'"$TEST_NAME"'",
    "cognome": "'"$TEST_SURNAME"'",
    "email": "'"$TEST_EMAIL"'",
    "telefono": "'"$TEST_PHONE"'",
    "nomeAssistito": "'"$TEST_NAME"'",
    "cognomeAssistito": "'"$TEST_SURNAME"'",
    "etaAssistito": "65",
    "servizio": "Avanzato",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "vuoleManuale": true,
    "gdprConsent": true,
    "note": "Test completo workflow con firma elettronica e pagamento"
  }')

if check_response "$LEAD_RESPONSE" "Lead Intake"; then
    LEAD_ID=$(echo "$LEAD_RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
    echo "Lead ID: $LEAD_ID"
    echo ""
    echo -e "${YELLOW}📧 Controlla email su $TEST_EMAIL:${NC}"
    echo "  1️⃣  Email notifica a info@telemedcare.it"
    echo "  2️⃣  Email con contratto pre-compilato (Template_Contratto_Avanzato_TeleMedCare)"
    echo ""
    echo -e "${YELLOW}⏸️  PAUSA: Firma il contratto elettronicamente quando arriva${NC}"
    read -p "Premi INVIO quando hai firmato il contratto..." 
else
    echo "STEP 1 FALLITO - Interruzione test"
    exit 1
fi

# STEP 2: Contract Signature + Proforma Generation
print_step "2" "Contract Signature + Proforma Generation"
echo "Simulazione firma contratto..."

CONTRACT_ID="CONTR_$(date +%Y%m%d%H%M%S)"

SIGNATURE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/contracts/sign" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "'"$CONTRACT_ID"'",
    "leadId": "'"$LEAD_ID"'",
    "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "signedBy": "'"$TEST_NAME $TEST_SURNAME"'",
    "signedAt": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"
  }')

if check_response "$SIGNATURE_RESPONSE" "Contract Signature"; then
    echo ""
    echo -e "${YELLOW}📧 Controlla email su $TEST_EMAIL:${NC}"
    echo "  3️⃣  Email con Fattura Proforma (template_proforma_unificato.pdf)"
    echo ""
    echo -e "${YELLOW}⏸️  PAUSA: Effettua il pagamento${NC}"
    read -p "Premi INVIO quando hai effettuato il pagamento..." 
else
    echo "STEP 2 FALLITO - Interruzione test"
    exit 1
fi

# STEP 3: Payment Registration + Welcome Email
print_step "3" "Payment Registration + Welcome Email"
echo "Registrazione pagamento..."

PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "'"$LEAD_ID"'",
    "contractId": "'"$CONTRACT_ID"'",
    "importo": 840.00,
    "metodoPagamento": "Bonifico Bancario",
    "riferimentoTransazione": "TEST_'"$(date +%Y%m%d%H%M%S)"'",
    "note": "Pagamento test workflow completo"
  }')

if check_response "$PAYMENT_RESPONSE" "Payment Registration"; then
    PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | grep -o '"paymentId":"[^"]*"' | cut -d'"' -f4)
    echo "Payment ID: $PAYMENT_ID"
    echo ""
    echo -e "${YELLOW}📧 Controlla email su $TEST_EMAIL:${NC}"
    echo "  4️⃣  Email benvenuto con link form_configurazione"
    echo ""
    echo -e "${YELLOW}⏸️  PAUSA: Compila il form configurazione${NC}"
    read -p "Premi INVIO quando hai compilato il form..." 
else
    echo "STEP 3 FALLITO - Interruzione test"
    exit 1
fi

# STEP 4: Configuration Submission + Info Email
print_step "4" "Configuration Submission + Info Email"
echo "Invio configurazione cliente..."

CONFIG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/configurations" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "'"$LEAD_ID"'",
    "contractId": "'"$CONTRACT_ID"'",
    "paymentId": "'"$PAYMENT_ID"'",
    "indirizzoInstallazione": "Via Test 123, 00100 Roma",
    "contattoEmergenza": "+393331234567",
    "preferenzeMonitoraggio": "24/7",
    "patologie": "Ipertensione, Diabete",
    "allergie": "Nessuna",
    "farmaci": "Metformina 500mg",
    "note": "Configurazione test workflow"
  }')

if check_response "$CONFIG_RESPONSE" "Configuration Submission"; then
    CONFIG_ID=$(echo "$CONFIG_RESPONSE" | grep -o '"configId":"[^"]*"' | cut -d'"' -f4)
    echo "Configuration ID: $CONFIG_ID"
    echo ""
    echo -e "${YELLOW}📧 Verifica email info@telemedcare.it:${NC}"
    echo "  5️⃣  Email con dati configurazione cliente"
else
    echo "STEP 4 FALLITO - Interruzione test"
    exit 1
fi

# STEP 5: Device Association + Confirmation Email
print_step "5" "Device Association + Confirmation Email"
echo "Associazione dispositivo..."

# Prima verifichiamo che ci siano dispositivi disponibili
DEVICES=$(curl -s "$BASE_URL/api/devices/available")
echo "Dispositivi disponibili: $DEVICES"

DEVICE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/devices/associate" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "'"$LEAD_ID"'",
    "contractId": "'"$CONTRACT_ID"'",
    "configId": "'"$CONFIG_ID"'",
    "serialNumber": "SIDLY_TEST_'"$(date +%Y%m%d%H%M%S)"'",
    "modelName": "SiDLY Smart",
    "note": "Associazione test workflow"
  }')

if check_response "$DEVICE_RESPONSE" "Device Association"; then
    echo ""
    echo -e "${YELLOW}📧 Controlla email su $TEST_EMAIL:${NC}"
    echo "  6️⃣  Email conferma associazione dispositivo"
else
    echo "STEP 5 FALLITO - Interruzione test"
    exit 1
fi

# RIEPILOGO FINALE
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ TEST WORKFLOW COMPLETO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 RIEPILOGO:"
echo "  Lead ID: $LEAD_ID"
echo "  Contract ID: $CONTRACT_ID"
echo "  Payment ID: $PAYMENT_ID"
echo "  Config ID: $CONFIG_ID"
echo ""
echo "📧 EMAIL INVIATE (verifica su $TEST_EMAIL):"
echo "  ✅ 1. Notifica lead a info@telemedcare.it"
echo "  ✅ 2. Contratto pre-compilato"
echo "  ✅ 3. Fattura Proforma"
echo "  ✅ 4. Email benvenuto con form configurazione"
echo "  ✅ 5. Configurazione inviata a info@telemedcare.it"
echo "  ✅ 6. Conferma associazione dispositivo"
echo ""
echo -e "${GREEN}🎉 WORKFLOW COMPLETATO CON SUCCESSO!${NC}"
