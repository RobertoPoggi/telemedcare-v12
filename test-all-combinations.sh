#!/bin/bash

# ========================================================================
# Test Tutte le Combinazioni - Dati Roberto Poggi delle 08:39
# ========================================================================
# Data: 2025-11-10
# Dati base: Roberto Poggi, Rosaria Ressa, Piano Avanzato
# 
# Combinazioni da testare:
# 1. Solo contratto (vuoleContratto=true, vuoleBrochure=false, vuoleManuale=false)
# 2. Contratto + Brochure (vuoleContratto=true, vuoleBrochure=true, vuoleManuale=false)
# 3. Contratto + Manuale (vuoleContratto=true, vuoleBrochure=false, vuoleManuale=true)
# 4. Contratto + Brochure + Manuale (vuoleContratto=true, vuoleBrochure=true, vuoleManuale=true)
# 5. Solo documenti - Brochure (vuoleContratto=false, vuoleBrochure=true, vuoleManuale=false)
# 6. Solo documenti - Manuale (vuoleContratto=false, vuoleBrochure=false, vuoleManuale=true)
# 7. Solo documenti - Brochure + Manuale (vuoleContratto=false, vuoleBrochure=true, vuoleManuale=true)
# ========================================================================

BASE_URL="http://localhost:3001"
API_ENDPOINT="${BASE_URL}/api/lead"

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================================================"
echo "TEST TUTTE LE COMBINAZIONI - TeleMedCare V11.0"
echo "========================================================================"
echo "Endpoint: ${API_ENDPOINT}"
echo "Dati Base: Roberto Poggi / Rosaria Ressa / Piano Avanzato"
echo ""

# Funzione per inviare test
send_test() {
    local test_num=$1
    local test_name=$2
    local vuole_contratto=$3
    local vuole_brochure=$4
    local vuole_manuale=$5
    
    echo -e "${BLUE}========== TEST #${test_num}: ${test_name} ==========${NC}"
    echo "Contratto: ${vuole_contratto} | Brochure: ${vuole_brochure} | Manuale: ${vuole_manuale}"
    
    response=$(curl -s -X POST "${API_ENDPOINT}" \
      -H "Content-Type: application/json" \
      -d "{
        \"nomeRichiedente\": \"Roberto\",
        \"cognomeRichiedente\": \"Poggi\",
        \"emailRichiedente\": \"rpoggi55+test${test_num}@gmail.com\",
        \"telefonoRichiedente\": \"3316432390\",
        \"nomeAssistito\": \"Rosaria\",
        \"cognomeAssistito\": \"Ressa\",
        \"giornoNascita\": \"22\",
        \"meseNascita\": \"12\",
        \"annoNascita\": \"1930\",
        \"dataNascitaAssistito\": \"1930-12-22\",
        \"luogoNascitaAssistito\": \"Bari\",
        \"etaAssistito\": \"94 anni\",
        \"parentelaAssistito\": \"figlio\",
        \"pacchetto\": \"Avanzato\",
        \"condizioniSalute\": \"Cardiopatia\",
        \"priority\": \"Urgente\",
        \"preferenzaContatto\": \"Email\",
        \"vuoleContratto\": ${vuole_contratto},
        \"intestazioneContratto\": \"richiedente\",
        \"luogoNascitaRichiedente\": \"Genova\",
        \"dataNascitaRichiedente\": \"1955-11-28\",
        \"cfRichiedente\": \"PGGRRT55S28D969O\",
        \"indirizzoRichiedente\": \"Via degli Alerami 25\",
        \"capRichiedente\": \"20148\",
        \"cittaRichiedente\": \"Milano\",
        \"provinciaRichiedente\": \"MI\",
        \"vuoleBrochure\": ${vuole_brochure},
        \"vuoleManuale\": ${vuole_manuale},
        \"note\": \"Test #${test_num}: ${test_name}\",
        \"gdprConsent\": true
      }")
    
    if echo "$response" | grep -q "\"success\":true"; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
        lead_id=$(echo "$response" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
        echo "Lead ID: ${lead_id}"
    else
        echo -e "${RED}❌ ERROR${NC}"
        echo "Response: $response"
    fi
    
    echo ""
    sleep 2
}

# TEST 1: Solo Contratto
send_test "1" "Solo Contratto" "true" "false" "false"

# TEST 2: Contratto + Brochure
send_test "2" "Contratto + Brochure" "true" "true" "false"

# TEST 3: Contratto + Manuale
send_test "3" "Contratto + Manuale" "true" "false" "true"

# TEST 4: Contratto + Brochure + Manuale
send_test "4" "Contratto + Brochure + Manuale" "true" "true" "true"

# TEST 5: Solo Brochure
send_test "5" "Solo Documenti - Brochure" "false" "true" "false"

# TEST 6: Solo Manuale
send_test "6" "Solo Documenti - Manuale" "false" "false" "true"

# TEST 7: Brochure + Manuale
send_test "7" "Solo Documenti - Brochure + Manuale" "false" "true" "true"

echo "========================================================================"
echo -e "${GREEN}TEST COMPLETATI${NC}"
echo "========================================================================"
echo ""
echo "Controlla la dashboard per verificare i risultati:"
echo "${BASE_URL}/admin-dashboard"
echo ""
echo "Controlla le email inviate su:"
echo "- info@telemedcare.it (notifiche lead)"
echo "- rpoggi55+test1@gmail.com fino a rpoggi55+test7@gmail.com (contratti/documenti)"
