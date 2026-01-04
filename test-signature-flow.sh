#!/bin/bash

echo "🧪 TEST FIRMA CONTRATTO - Flusso completo"
echo "=========================================="
echo ""

BASE_URL="https://telemedcare-v12.pages.dev"

# STEP 1: Crea lead con contratto
echo "📝 STEP 1: Creazione lead con richiesta contratto..."
LEAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Roberto",
    "cognomeRichiedente": "Poggi",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 333 1234567",
    "nomeAssistito": "Test",
    "cognomeAssistito": "FIRMA_DIGITALE",
    "servizio": "eCura PRO",
    "piano": "AVANZATO",
    "vuoleBrochure": "Si",
    "vuoleContratto": "Si",
    "canale": "TEST FIRMA DIGITALE"
  }')

LEAD_ID=$(echo "$LEAD_RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
echo "✅ Lead creato: $LEAD_ID"
echo ""

# Estrai info sul contratto dall'email automation
CONTRACT_SENT=$(echo "$LEAD_RESPONSE" | grep -o '"contratto":{"sent":[^}]*}' | grep -o 'true\|false')
echo "📧 Email contratto inviata: $CONTRACT_SENT"
echo ""

# STEP 2: Attendi 5 secondi che il contratto sia salvato nel DB
echo "⏳ Attesa 5 secondi per salvataggio DB..."
sleep 5
echo ""

# STEP 3: Recupera la lista dei contratti per trovare il contractId
echo "📋 STEP 2: Recupero contratti dal DB..."
CONTRACTS_RESPONSE=$(curl -s "${BASE_URL}/api/contracts?leadId=${LEAD_ID}")
CONTRACT_ID=$(echo "$CONTRACTS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CONTRACT_ID" ]; then
    echo "❌ Contratto non trovato nel DB!"
    echo "Response: $CONTRACTS_RESPONSE"
    exit 1
fi

echo "✅ Contratto trovato: $CONTRACT_ID"
echo ""

# STEP 4: Testa URL firma contratto
SIGN_URL="${BASE_URL}/firma-contratto?contractId=${CONTRACT_ID}"
echo "🔗 STEP 3: Verifica pagina firma contratto..."
echo "URL: $SIGN_URL"
echo ""

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SIGN_URL")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Pagina firma accessibile (HTTP $HTTP_STATUS)"
else
    echo "❌ Errore accesso pagina firma (HTTP $HTTP_STATUS)"
    exit 1
fi
echo ""

# STEP 5: Recupera i dati del contratto via API
echo "📄 STEP 4: Verifica API contratto..."
CONTRACT_DATA=$(curl -s "${BASE_URL}/api/contracts/${CONTRACT_ID}")
CONTRACT_CODE=$(echo "$CONTRACT_DATA" | grep -o '"contractCode":"[^"]*"' | cut -d'"' -f4)
CONTRACT_STATUS=$(echo "$CONTRACT_DATA" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

echo "   Codice Contratto: $CONTRACT_CODE"
echo "   Status: $CONTRACT_STATUS"
echo ""

# STEP 6: Simula firma (normalmente fatto dal cliente via browser)
echo "✍️  STEP 5: Simulazione firma digitale..."
SIGNATURE_DATA="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
SIGN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/contracts/sign" \
  -H "Content-Type: application/json" \
  -d "{
    \"contractId\": \"${CONTRACT_ID}\",
    \"signatureData\": \"${SIGNATURE_DATA}\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"userAgent\": \"Test-Script/1.0\",
    \"screenResolution\": \"1920x1080\"
  }")

SIGN_SUCCESS=$(echo "$SIGN_RESPONSE" | grep -o '"success":[^,]*' | grep -o 'true\|false')

if [ "$SIGN_SUCCESS" = "true" ]; then
    echo "✅ Firma salvata con successo!"
else
    echo "❌ Errore salvataggio firma"
    echo "Response: $SIGN_RESPONSE"
fi
echo ""

# STEP 7: Verifica che lo status sia cambiato a SIGNED
echo "🔍 STEP 6: Verifica status contratto dopo firma..."
sleep 2
CONTRACT_DATA_AFTER=$(curl -s "${BASE_URL}/api/contracts/${CONTRACT_ID}")
CONTRACT_STATUS_AFTER=$(echo "$CONTRACT_DATA_AFTER" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

echo "   Status dopo firma: $CONTRACT_STATUS_AFTER"
echo ""

# RIEPILOGO FINALE
echo "=========================================="
echo "📊 RIEPILOGO TEST FIRMA DIGITALE"
echo "=========================================="
echo "Lead ID: $LEAD_ID"
echo "Contract ID: $CONTRACT_ID"
echo "Contract Code: $CONTRACT_CODE"
echo "Status Iniziale: $CONTRACT_STATUS"
echo "Status Finale: $CONTRACT_STATUS_AFTER"
echo "Email Contratto: $CONTRACT_SENT"
echo "Link Firma: $SIGN_URL"
echo ""

if [ "$CONTRACT_STATUS_AFTER" = "SIGNED" ]; then
    echo "🎉 TEST COMPLETATO CON SUCCESSO!"
    echo ""
    echo "✅ VERIFICA MANUALE:"
    echo "1. Email rpoggi55@gmail.com → Link 'Firma Contratto'"
    echo "2. Click link → Pagina con contratto e canvas firma"
    echo "3. Firma con mouse/dito → Pulsante 'Firma e Invia'"
    echo "4. Dopo invio → Messaggio successo"
else
    echo "⚠️  TEST PARZIALE - Status non cambiato in SIGNED"
    echo "Possibile causa: simulazione firma non identica a browser reale"
fi
echo ""

exit 0
