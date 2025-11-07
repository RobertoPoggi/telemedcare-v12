#!/bin/bash
##############################################################################
# TEST COMPLETO WORKFLOW - TUTTE LE VARIANTI
# Come richiesto da Roberto Poggi
##############################################################################

API_URL="http://localhost:8787/api/lead"
EMAIL="rpoggi55@gmail.com"

echo "🧪 =========================================="
echo "   TEST COMPLETO WORKFLOW TELEMEDCARE V11"
echo "   Tutte le varianti richieste da Roberto"
echo "=========================================="
echo ""

# Funzione per inviare lead e mostrare risultato
send_lead() {
    local variant_name="$1"
    local json_data="$2"
    
    echo "📋 TEST: $variant_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$json_data")
    
    echo "Response: $response" | jq . 2>/dev/null || echo "$response"
    echo ""
    echo "Attesa 2 secondi..."
    sleep 2
    echo ""
}

##############################################################################
# VARIANTE 1: SOLO BROCHURE
##############################################################################
send_lead "VARIANTE 1: Solo Brochure" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "servizio": "Solo informazioni",
  "vuoleBrochure": true,
  "vuoleManuale": false,
  "vuoleContratto": false,
  "tipoContratto": "",
  "note": "TEST VARIANTE 1: Solo brochure richiesta"
}'

##############################################################################
# VARIANTE 2: BROCHURE + MANUALE SIDLY
##############################################################################
send_lead "VARIANTE 2: Brochure + Manuale SiDLY" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "servizio": "Solo informazioni",
  "vuoleBrochure": true,
  "vuoleManuale": true,
  "vuoleContratto": false,
  "tipoContratto": "",
  "note": "TEST VARIANTE 2: Brochure + Manuale"
}'

##############################################################################
# VARIANTE 3: NESSUNA RICHIESTA SPECIFICA (auto-invio brochure)
##############################################################################
send_lead "VARIANTE 3: Nessuna richiesta (auto brochure)" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "servizio": "Solo informazioni",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": false,
  "tipoContratto": "",
  "note": "TEST VARIANTE 3: Nessuna richiesta (sistema deve inviare brochure automaticamente)"
}'

##############################################################################
# VARIANTE 4: RICHIESTA CONTRATTO BASE
##############################################################################
send_lead "VARIANTE 4: Contratto BASE" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "nomeAssistito": "Maria",
  "cognomeAssistito": "Rossi",
  "dataNascitaAssistito": "1950-05-15",
  "servizio": "Contratto Base",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "tipoContratto": "BASE",
  "intestazioneContratto": "Roberto Poggi",
  "cfRichiedente": "PGGRBR80A01H501Z",
  "indirizzoRichiedente": "Via Roma 1, Milano",
  "note": "TEST VARIANTE 4: Richiesta Contratto BASE"
}'

##############################################################################
# VARIANTE 5: RICHIESTA CONTRATTO ADVANCED
##############################################################################
send_lead "VARIANTE 5: Contratto ADVANCED" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "nomeAssistito": "Maria",
  "cognomeAssistito": "Rossi",
  "dataNascitaAssistito": "1950-05-15",
  "servizio": "Contratto Advanced",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "tipoContratto": "ADVANCED",
  "intestazioneContratto": "Roberto Poggi",
  "cfRichiedente": "PGGRBR80A01H501Z",
  "indirizzoRichiedente": "Via Roma 1, Milano",
  "note": "TEST VARIANTE 5: Richiesta Contratto ADVANCED"
}'

##############################################################################
# VARIANTE 6: CONTRATTO BASE + BROCHURE + MANUALE
##############################################################################
send_lead "VARIANTE 6: Contratto BASE + Documenti" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "nomeAssistito": "Maria",
  "cognomeAssistito": "Rossi",
  "dataNascitaAssistito": "1950-05-15",
  "servizio": "Contratto Base",
  "vuoleBrochure": true,
  "vuoleManuale": true,
  "vuoleContratto": true,
  "tipoContratto": "BASE",
  "intestazioneContratto": "Roberto Poggi",
  "cfRichiedente": "PGGRBR80A01H501Z",
  "indirizzoRichiedente": "Via Roma 1, Milano",
  "note": "TEST VARIANTE 6: Contratto BASE + Brochure + Manuale"
}'

##############################################################################
# VARIANTE 7: CONTRATTO ADVANCED + BROCHURE
##############################################################################
send_lead "VARIANTE 7: Contratto ADVANCED + Brochure" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "nomeAssistito": "Maria",
  "cognomeAssistito": "Rossi",
  "dataNascitaAssistito": "1950-05-15",
  "servizio": "Contratto Advanced",
  "vuoleBrochure": true,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "tipoContratto": "ADVANCED",
  "intestazioneContratto": "Roberto Poggi",
  "cfRichiedente": "PGGRBR80A01H501Z",
  "indirizzoRichiedente": "Via Roma 1, Milano",
  "note": "TEST VARIANTE 7: Contratto ADVANCED + Brochure"
}'

##############################################################################
# TEST CANALI PARTNER
##############################################################################
echo ""
echo "🏢 =========================================="
echo "   TEST CANALI PARTNER"
echo "=========================================="
echo ""

##############################################################################
# VARIANTE 8: CANALE IRBEMA
##############################################################################
send_lead "VARIANTE 8: Canale IRBEMA" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "servizio": "Contratto Base",
  "vuoleBrochure": true,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "tipoContratto": "BASE",
  "fonte": "IRBEMA Partnership",
  "canale": "IRBEMA",
  "note": "TEST VARIANTE 8: Lead da canale IRBEMA"
}'

##############################################################################
# VARIANTE 9: CANALE LUXOTTICA
##############################################################################
send_lead "VARIANTE 9: Canale LUXOTTICA" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "servizio": "Contratto Advanced",
  "vuoleBrochure": true,
  "vuoleManuale": true,
  "vuoleContratto": true,
  "tipoContratto": "ADVANCED",
  "fonte": "Luxottica B2B",
  "canale": "LUXOTTICA_API",
  "note": "TEST VARIANTE 9: Lead da canale LUXOTTICA"
}'

##############################################################################
# VARIANTE 10: CANALE PIRELLI WELFARE
##############################################################################
send_lead "VARIANTE 10: Canale PIRELLI" '{
  "nomeRichiedente": "Roberto",
  "cognomeRichiedente": "Poggi",
  "emailRichiedente": "'$EMAIL'",
  "telefonoRichiedente": "+39 333 123 4567",
  "servizio": "Contratto Base",
  "vuoleBrochure": false,
  "vuoleManuale": false,
  "vuoleContratto": true,
  "tipoContratto": "BASE",
  "fonte": "Pirelli Welfare",
  "canale": "PIRELLI_WELFARE",
  "note": "TEST VARIANTE 10: Lead da canale PIRELLI WELFARE"
}'

echo ""
echo "✅ =========================================="
echo "   TEST COMPLETATI!"
echo "   Controlla email: $EMAIL"
echo "   Controlla logs server per dettagli"
echo "=========================================="
echo ""
echo "📊 RIEPILOGO TEST ESEGUITI:"
echo "   1. Solo Brochure"
echo "   2. Brochure + Manuale"
echo "   3. Nessuna richiesta (auto brochure)"
echo "   4. Contratto BASE"
echo "   5. Contratto ADVANCED"
echo "   6. Contratto BASE + Documenti"
echo "   7. Contratto ADVANCED + Brochure"
echo "   8. Canale IRBEMA"
echo "   9. Canale LUXOTTICA"
echo "   10. Canale PIRELLI"
echo ""
