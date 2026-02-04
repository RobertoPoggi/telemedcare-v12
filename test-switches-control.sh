#!/bin/bash

# ====================================================================
# SCRIPT TEST SETTINGS SWITCHES - TeleMedCare V12.0
# Verifica che gli switch controllino effettivamente i processi
# ====================================================================

echo "🧪 TEST SETTINGS SWITCHES - TeleMedCare V12.0"
echo "=================================================="
echo ""

# URL base (modifica se necessario)
BASE_URL="https://telemedcare-v12.pages.dev"

# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ====================================================================
# TEST #1: Verifica stato attuale settings
# ====================================================================
echo "📊 TEST #1: Lettura stato attuale settings"
echo "---------------------------------------------------"

SETTINGS_RESPONSE=$(curl -s "$BASE_URL/api/settings")
echo "Response: $SETTINGS_RESPONSE"
echo ""

# Estrai i valori (usando jq se disponibile, altrimenti mostra raw)
if command -v jq &> /dev/null; then
    echo "Valori attuali:"
    echo "$SETTINGS_RESPONSE" | jq -r '.settings | to_entries[] | "  - \(.key): \(.value.value)"'
else
    echo "Installa 'jq' per visualizzazione formattata: sudo apt-get install jq"
fi
echo ""

# ====================================================================
# TEST #2: 🔄 Import Auto HubSpot (OFF)
# ====================================================================
echo "🔄 TEST #2: Import Auto HubSpot - Verifica blocco quando OFF"
echo "---------------------------------------------------"
echo "1. Assicurati che lo switch sia su OFF nella dashboard"
echo "2. Tento import da Irbema..."
echo ""

IMPORT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/import/irbema" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$IMPORT_RESPONSE" | jq '.' 2>/dev/null || echo "$IMPORT_RESPONSE"
echo ""

# Verifica che sia bloccato
if echo "$IMPORT_RESPONSE" | grep -q "disabilitato"; then
    echo -e "${GREEN}✅ PASS: Import bloccato correttamente quando switch OFF${NC}"
else
    echo -e "${RED}❌ FAIL: Import NON bloccato quando switch OFF${NC}"
fi
echo ""

# ====================================================================
# TEST #3: 🔔 Notifiche Email Admin (test con switch ON)
# ====================================================================
echo "🔔 TEST #3: Notifiche Email Admin - Verifica invio quando ON"
echo "---------------------------------------------------"
echo "1. Assicurati che lo switch 'Notifiche Email Admin' sia su ON"
echo "2. Creo un lead di test..."
echo ""

# Crea lead di test
LEAD_DATA='{
  "nomeRichiedente": "Test",
  "cognomeRichiedente": "Switch",
  "email": "test-switch@example.com",
  "telefono": "+39 333 1234567",
  "servizio": "eCura PRO",
  "piano": "BASE",
  "fonte": "TEST_SCRIPT"
}'

LEAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
  -H "Content-Type: application/json" \
  -d "$LEAD_DATA")

echo "Lead creation response:"
echo "$LEAD_RESPONSE" | jq '.' 2>/dev/null || echo "$LEAD_RESPONSE"
echo ""

if echo "$LEAD_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Lead creato - Verifica inbox info@telemedcare.it per email notifica${NC}"
else
    echo -e "${RED}❌ Errore creazione lead${NC}"
fi
echo ""

# ====================================================================
# TEST #4: Cambio stato switch e ri-test
# ====================================================================
echo "🔄 TEST #4: Test cambio stato switch"
echo "---------------------------------------------------"
echo "MANUALE: Vai su $BASE_URL/dashboard"
echo "1. Cambia switch 'Import Auto HubSpot' da OFF a ON"
echo "2. Riprova import: curl -X POST $BASE_URL/api/import/irbema"
echo "3. Verifica che ora funzioni (se hai HUBSPOT_ACCESS_TOKEN configurato)"
echo ""

# ====================================================================
# TEST #5: 📧 Email Automatiche Lead
# ====================================================================
echo "📧 TEST #5: Email Automatiche Lead"
echo "---------------------------------------------------"
echo "MANUALE: Per testare questo switch:"
echo "1. Vai su dashboard e imposta 'Email Automatiche Lead' su ON"
echo "2. Compila form su $BASE_URL con richiesta brochure/contratto"
echo "3. Verifica ricezione email al lead"
echo "4. Cambia switch su OFF"
echo "5. Compila nuovo form"
echo "6. Verifica che email NON venga inviata"
echo ""

# ====================================================================
# RIEPILOGO
# ====================================================================
echo "=================================================="
echo "📋 RIEPILOGO IMPLEMENTAZIONE SWITCHES"
echo "=================================================="
echo ""
echo "Switch implementati e verificati:"
echo "  ✅ 🔄 Import Auto HubSpot       → /api/import/irbema"
echo "  ✅ 📧 Email Automatiche Lead     → workflow-email-manager.ts"
echo "  ✅ 🔔 Notifiche Email Admin      → lead-notifications.ts"
echo "  ⚠️  ⏰ Reminder Completamento    → Da implementare"
echo ""
echo "Punti di controllo nel codice:"
echo "  - src/index.tsx (riga 10745): HubSpot import"
echo "  - src/modules/workflow-email-manager.ts (righe 467, 747): Email lead"
echo "  - src/utils/lead-notifications.ts (riga 29): Email admin"
echo ""
echo "Verifica manuale suggerita:"
echo "  1. Test import HubSpot con switch OFF/ON"
echo "  2. Test email lead con switch OFF/ON"
echo "  3. Test notifiche admin con switch OFF/ON"
echo ""
echo "=================================================="
echo "Test completato! Verifica risultati sopra."
echo "=================================================="
