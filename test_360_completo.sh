#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# TEST 360° COMPLETO - TeleMedCare V11.0
# Tutte le combinazioni possibili di servizio e documenti
# ═══════════════════════════════════════════════════════════════

API_URL="http://localhost:3000/api/lead"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="test_360_report_${TIMESTAMP}.txt"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     TEST 360° COMPLETO - TeleMedCare V11.0 Workflow          ║"
echo "║     Data: $(date '+%Y-%m-%d %H:%M:%S')                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Inizializza report
cat > "$REPORT_FILE" << EOF
═══════════════════════════════════════════════════════════════
TEST 360° COMPLETO - TeleMedCare V11.0
Data: $(date '+%Y-%m-%d %H:%M:%S')
═══════════════════════════════════════════════════════════════

MATRICE TEST:
- Servizi: BASE, AVANZATO
- Documenti: 8 combinazioni possibili
  1. Nessun documento
  2. Solo Contratto
  3. Solo Brochure
  4. Solo Manuale
  5. Contratto + Brochure
  6. Contratto + Manuale
  7. Brochure + Manuale
  8. Contratto + Brochure + Manuale (COMPLETO)
- Urgenze: Immediata, Alta, Media, Bassa

TOTALE TEST: 16 scenari (2 servizi × 8 combinazioni documenti)

═══════════════════════════════════════════════════════════════

EOF

# Contatori
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Funzione test
run_test() {
    local TEST_NUM=$1
    local SERVIZIO=$2
    local URGENZA=$3
    local CONTRATTO=$4
    local BROCHURE=$5
    local MANUALE=$6
    local DESC=$7
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 TEST $TEST_NUM: $DESC"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Servizio: $SERVIZIO"
    echo "  Urgenza: $URGENZA"
    echo "  Documenti richiesti:"
    echo "    - Contratto: $CONTRATTO"
    echo "    - Brochure: $BROCHURE"
    echo "    - Manuale: $MANUALE"
    echo ""
    
    # Prepara payload JSON
    local PAYLOAD=$(cat <<EOF
{
  "nome": "Test",
  "cognomeRichiedente": "Utente $TEST_NUM",
  "email": "test${TEST_NUM}@test.com",
  "telefono": "+39 348 1234567",
  "eta": "65",
  "servizio": "$SERVIZIO",
  "urgenzaRisposta": "$URGENZA",
  "vuoleContratto": $CONTRATTO,
  "vuoleBrochure": $BROCHURE,
  "vuoleManuale": $MANUALE,
  "nomeAssistito": "Assistito Test $TEST_NUM",
  "cognomeAssistito": "Cognome $TEST_NUM",
  "condizioniSalute": "Test condizioni scenario $TEST_NUM",
  "note": "Test automatico 360° - Scenario $TEST_NUM",
  "gdprConsent": true
}
EOF
)
    
    echo "📤 Invio richiesta..."
    local RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" 2>&1)
    
    local HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    local BODY=$(echo "$RESPONSE" | head -n -1)
    
    # Log risultato
    {
        echo ""
        echo "TEST $TEST_NUM: $DESC"
        echo "Servizio: $SERVIZIO | Urgenza: $URGENZA"
        echo "Documenti: Contratto=$CONTRATTO, Brochure=$BROCHURE, Manuale=$MANUALE"
        echo "HTTP Status: $HTTP_CODE"
        echo "Response: $BODY"
        echo "---"
    } >> "$REPORT_FILE"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ PASSED - HTTP 200 OK"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "RESULT: ✅ PASSED" >> "$REPORT_FILE"
    else
        echo "  ❌ FAILED - HTTP $HTTP_CODE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "RESULT: ❌ FAILED" >> "$REPORT_FILE"
    fi
    
    # Pausa tra test
    sleep 2
}

# ═══════════════════════════════════════════════════════════════
# SEZIONE 1: TEST BASE - 8 COMBINAZIONI DOCUMENTI
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  SEZIONE 1: SERVIZIO BASE - 8 Combinazioni Documenti         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

run_test 1 "BASE" "Alta" false false false "BASE - Nessun documento"
run_test 2 "BASE" "Alta" true false false "BASE - Solo Contratto"
run_test 3 "BASE" "Alta" false true false "BASE - Solo Brochure"
run_test 4 "BASE" "Alta" false false true "BASE - Solo Manuale"
run_test 5 "BASE" "Alta" true true false "BASE - Contratto + Brochure"
run_test 6 "BASE" "Alta" true false true "BASE - Contratto + Manuale"
run_test 7 "BASE" "Alta" false true true "BASE - Brochure + Manuale"
run_test 8 "BASE" "Alta" true true true "BASE - COMPLETO (tutti documenti)"

# ═══════════════════════════════════════════════════════════════
# SEZIONE 2: TEST AVANZATO - 8 COMBINAZIONI DOCUMENTI
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  SEZIONE 2: SERVIZIO AVANZATO - 8 Combinazioni Documenti     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

run_test 9 "AVANZATO" "Alta" false false false "AVANZATO - Nessun documento"
run_test 10 "AVANZATO" "Alta" true false false "AVANZATO - Solo Contratto"
run_test 11 "AVANZATO" "Alta" false true false "AVANZATO - Solo Brochure"
run_test 12 "AVANZATO" "Alta" false false true "AVANZATO - Solo Manuale"
run_test 13 "AVANZATO" "Alta" true true false "AVANZATO - Contratto + Brochure"
run_test 14 "AVANZATO" "Alta" true false true "AVANZATO - Contratto + Manuale"
run_test 15 "AVANZATO" "Alta" false true true "AVANZATO - Brochure + Manuale"
run_test 16 "AVANZATO" "Alta" true true true "AVANZATO - COMPLETO (tutti documenti)"

# ═══════════════════════════════════════════════════════════════
# SEZIONE 3: TEST URGENZE - 4 LIVELLI
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  SEZIONE 3: TEST URGENZE - 4 Livelli                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

run_test 17 "BASE" "Immediata" true true true "Urgenza IMMEDIATA (1 giorno)"
run_test 18 "AVANZATO" "Immediata" true true true "AVANZATO - Urgenza IMMEDIATA"
run_test 19 "BASE" "Media" true true true "Urgenza MEDIA (7 giorni)"
run_test 20 "AVANZATO" "Media" true true true "AVANZATO - Urgenza MEDIA"
run_test 21 "BASE" "Bassa" true true true "Urgenza BASSA (quando possibile)"
run_test 22 "AVANZATO" "Bassa" true true true "AVANZATO - Urgenza BASSA"

# ═══════════════════════════════════════════════════════════════
# REPORT FINALE
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    REPORT FINALE TEST 360°                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "  📊 Test Totali:    $TOTAL_TESTS"
echo "  ✅ Test Passati:   $PASSED_TESTS"
echo "  ❌ Test Falliti:   $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "  🎉 TUTTI I TEST SUPERATI! 🎉"
    RESULT="SUCCESS"
else
    echo "  ⚠️  ALCUNI TEST FALLITI"
    RESULT="PARTIAL"
fi

echo ""
echo "  📄 Report salvato in: $REPORT_FILE"
echo ""

# Salva summary nel report
{
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "SUMMARY FINALE"
    echo "═══════════════════════════════════════════════════════════════"
    echo "Test Totali: $TOTAL_TESTS"
    echo "Test Passati: $PASSED_TESTS"
    echo "Test Falliti: $FAILED_TESTS"
    echo "Percentuale Successo: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo "Risultato: $RESULT"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
} >> "$REPORT_FILE"

echo "✅ Test 360° completato!"
echo ""
