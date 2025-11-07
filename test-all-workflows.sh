#!/bin/bash
# TeleMedCare V11.0 - TEST COMPLETO DI TUTTI I WORKFLOW
# Test esaustivo di tutti i casi d'uso richiesti da Roberto

API_URL="http://localhost:8787/api/lead"
EMAIL="rpoggi55@gmail.com"
RESULTS_FILE="/tmp/test_results.txt"

echo "🚀 INIZIO TEST COMPLETO TELEMEDCARE V11.0" > $RESULTS_FILE
echo "📅 Data: $(date)" >> $RESULTS_FILE
echo "===================================================" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Funzione per inviare lead e verificare risultato
test_workflow() {
    local test_num="$1"
    local test_name="$2"
    local json_data="$3"
    
    echo "🧪 TEST $test_num: $test_name"
    echo "🧪 TEST $test_num: $test_name" >> $RESULTS_FILE
    
    response=$(curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d "$json_data")
    success=$(echo "$response" | jq -r '.success')
    workflow_success=$(echo "$response" | jq -r '.workflow.success')
    workflow_message=$(echo "$response" | jq -r '.workflow.message')
    
    echo "   ✓ Success: $success | Workflow: $workflow_success" >> $RESULTS_FILE
    echo "   📝 Message: $workflow_message" >> $RESULTS_FILE
    
    if [ "$success" = "true" ] && [ "$workflow_success" = "true" ]; then
        echo "   ✅ PASS" >> $RESULTS_FILE
    else
        echo "   ❌ FAIL" >> $RESULTS_FILE
        echo "   Response: $response" >> $RESULTS_FILE
    fi
    
    echo "" >> $RESULTS_FILE
    sleep 1
}

echo "📋 FASE 1: TEST STEP 2A - SOLO DOCUMENTI INFORMATIVI"
echo "===================================================" >> $RESULTS_FILE

# TEST 1: Solo Brochure
test_workflow "1" "Solo Brochure" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 1111111",
  "pacchetto": "BASE",
  "vuoleBrochure": true,
  "vuoleManuale": false,
  "vuoleContratto": false,
  "note": "TEST 1: Solo brochure richiesta"
}'

# TEST 2: Solo Manuale SiDLY
test_workflow "2" "Solo Manuale SiDLY" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 2222222",
  "pacchetto": "BASE",
  "vuoleBrochure": false,
  "vuoleManuale": true,
  "vuoleContratto": false,
  "note": "TEST 2: Solo manuale SiDLY"
}'

# TEST 3: Brochure + Manuale
test_workflow "3" "Brochure + Manuale" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 3333333",
  "pacchetto": "BASE",
  "vuoleBrochure": true,
  "vuoleManuale": true,
  "vuoleContratto": false,
  "note": "TEST 3: Brochure e manuale"
}'

# TEST 4: Nessuna richiesta specifica (auto-send brochure)
test_workflow "4" "Nessuna richiesta - Auto brochure" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 4444444",
  "pacchetto": "BASE",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": false,
  "note": "TEST 4: Nessuna richiesta specifica"
}'

echo "📋 FASE 2: TEST STEP 2B - CONTRATTI CON PDF"
echo "===================================================" >> $RESULTS_FILE

# TEST 5: Contratto BASE
test_workflow "5" "Contratto BASE" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 5555555",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Via Test 123, Milano",
  "pacchetto": "BASE",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "note": "TEST 5: Contratto BASE (480€ + IVA 22%)"
}'

# TEST 6: Contratto ADVANCED
test_workflow "6" "Contratto ADVANCED" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 6666666",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Via Test 456, Roma",
  "pacchetto": "ADVANCED",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "note": "TEST 6: Contratto ADVANCED (840€ + IVA 22%)"
}'

# TEST 7: Contratto + Brochure + Manuale
test_workflow "7" "Contratto + Documenti" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 7777777",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Via Test 789, Torino",
  "pacchetto": "BASE",
  "vuoleBrochure": true,
  "vuoleManuale": true,
  "vuoleContratto": true,
  "note": "TEST 7: Contratto BASE + brochure + manuale"
}'

# TEST 8: Contratto con Assistito diverso da Richiedente
test_workflow "8" "Contratto con Assistito diverso" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 8888888",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Via Test 100, Milano",
  "nomeAssistito": "Mario",
  "cognomeAssistito": "Rossi",
  "dataNascitaAssistito": "1950-05-15",
  "cfAssistito": "RSSMRA50E15F205X",
  "etaAssistito": 75,
  "pacchetto": "ADVANCED",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "note": "TEST 8: Contratto ADVANCED con assistito diverso"
}'

echo "📋 FASE 3: TEST CANALI DI VENDITA E COMMISSIONI"
echo "===================================================" >> $RESULTS_FILE

# TEST 9: Canale IRBEMA (0% commissione)
test_workflow "9" "Canale IRBEMA" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 9999999",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Via IRBEMA 1, Milano",
  "canale": "IRBEMA",
  "pacchetto": "BASE",
  "vuoleContratto": true,
  "note": "TEST 9: Canale IRBEMA - 0% commissione - intestato a richiedente"
}'

# TEST 10: Canale BLK Condomini (5% commissione)
test_workflow "10" "Canale BLK Condomini" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 0000001",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Condominio BLK, Via Test 200, Milano",
  "canale": "BLK_CONDOMINI",
  "pacchetto": "BASE",
  "vuoleContratto": true,
  "note": "TEST 10: BLK Condomini - 5% commissione"
}'

# TEST 11: Welfare Provider Eudaimon (fattura a provider)
test_workflow "11" "Welfare Eudaimon" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 0000002",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Via Eudaimon 10, Milano",
  "canale": "EUDAIMON",
  "pacchetto": "ADVANCED",
  "vuoleContratto": true,
  "note": "TEST 11: Welfare Eudaimon - fattura al provider"
}'

# TEST 12: Convenzione Mondadori (10% sconto)
test_workflow "12" "Convenzione Mondadori" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 0000003",
  "cfRichiedente": "PGGRRT70A01H501Z",
  "indirizzoRichiedente": "Mondadori Spa, Via Test 300, Milano",
  "canale": "MONDADORI",
  "pacchetto": "ADVANCED",
  "vuoleContratto": true,
  "note": "TEST 12: Mondadori - 10% sconto"
}'

echo ""
echo "✅ TEST COMPLETATI! Vedi risultati in: $RESULTS_FILE"
echo ""
cat $RESULTS_FILE
