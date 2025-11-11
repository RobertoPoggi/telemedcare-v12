#!/bin/bash
# Test script for all email combinations
# Tests combinations: a, b, c, d, e

BASE_URL="http://127.0.0.1:4001"
EMAIL="rpoggi55@gmail.com"

echo "🧪 TeleMedCare - Test Combinazioni Email"
echo "========================================="
echo ""

# Helper function to send test
send_test() {
    local test_name=$1
    local vuole_contratto=$2
    local vuole_brochure=$3
    local vuole_manuale=$4
    
    echo "📧 Test $test_name:"
    echo "   Contratto: $vuole_contratto | Brochure: $vuole_brochure | Manuale: $vuole_manuale"
    
    curl -X POST "${BASE_URL}/api/lead" \
      -H "Content-Type: application/json" \
      -d "{
        \"nomeRichiedente\": \"Roberto\",
        \"cognomeRichiedente\": \"Poggi\",
        \"emailRichiedente\": \"${EMAIL}\",
        \"telefonoRichiedente\": \"3316432390\",
        \"nomeAssistito\": \"Test\",
        \"cognomeAssistito\": \"Combo${test_name}\",
        \"giornoNascita\": \"15\",
        \"meseNascita\": \"05\",
        \"annoNascita\": \"1960\",
        \"dataNascitaAssistito\": \"1960-05-15\",
        \"luogoNascitaAssistito\": \"Roma\",
        \"etaAssistito\": \"64 anni\",
        \"parentelaAssistito\": \"padre\",
        \"pacchetto\": \"Avanzato\",
        \"condizioniSalute\": \"Test automatico combinazione ${test_name}\",
        \"priority\": \"Media\",
        \"preferenzaContatto\": \"Email\",
        \"vuoleContratto\": ${vuole_contratto},
        \"intestazioneContratto\": \"richiedente\",
        \"luogoNascitaRichiedente\": \"Milano\",
        \"dataNascitaRichiedente\": \"1955-11-28\",
        \"cfRichiedente\": \"PGGRRT55S28D969O\",
        \"indirizzoRichiedente\": \"Via Test ${test_name}\",
        \"capRichiedente\": \"20100\",
        \"cittaRichiedente\": \"Milano\",
        \"provinciaRichiedente\": \"MI\",
        \"vuoleBrochure\": ${vuole_brochure},
        \"vuoleManuale\": ${vuole_manuale},
        \"note\": \"Test combinazione ${test_name}\",
        \"gdprConsent\": true
      }" \
      -s -o /dev/null -w "   Status: %{http_code}\n"
    
    echo "   ✅ Completato"
    echo ""
    sleep 3
}

# Test a) Solo contratto
send_test "A" "true" "false" "false"

# Test b) Contratto + Brochure  
send_test "B" "true" "true" "false"

# Test c) Solo manuale
send_test "C" "false" "false" "true"

# Test d) Solo brochure
send_test "D" "false" "true" "false"

# Test e) Manuale + Brochure
send_test "E" "false" "true" "true"

echo "🎉 Test completati!"
echo ""
echo "Controlla la tua email: ${EMAIL}"
echo "Dashboard: ${BASE_URL}/admin-dashboard"
