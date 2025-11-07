#!/bin/bash
################################################################################
# QUICK TEST SCRIPT - TeleMedCare V11.0
# Data: 2025-11-07
# Uso: ./quick-test.sh [URL]
# Esempio: ./quick-test.sh https://telemedcare-v11.pages.dev
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# URL
BASE_URL="${1:-https://telemedcare-v11.pages.dev}"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}TeleMedCare V11.0 - Quick Test${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${BLUE}Testing URL: $BASE_URL${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1/6: Health Check...${NC}"
HEALTH=$(curl -s "$BASE_URL/api/system/health" || echo '{"status":"error"}')
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Sistema online${NC}"
else
    echo -e "${RED}❌ Sistema non risponde correttamente${NC}"
    echo "Response: $HEALTH"
fi
echo ""

# Test 2: Lead Intake - BASE + Richiedente
echo -e "${YELLOW}Test 2/6: Lead Intake BASE + Intestazione RICHIEDENTE...${NC}"
LEAD1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
    -H "Content-Type: application/json" \
    -d '{
        "nomeRichiedente": "Roberto",
        "cognomeRichiedente": "Poggi",
        "emailRichiedente": "rpoggi55@gmail.com",
        "telefonoRichiedente": "+39 123 456 7890",
        "cfRichiedente": "PGGRRT70A01H501Z",
        "indirizzoRichiedente": "Via Roma 123",
        "capRichiedente": "20100",
        "cittaRichiedente": "Milano",
        "provinciaRichiedente": "MI",
        "dataNascitaRichiedente": "1970-01-01",
        "luogoNascitaRichiedente": "Milano",
        "nomeAssistito": "Rosaria",
        "cognomeAssistito": "Ressa",
        "emailAssistito": "rosaria.ressa@test.com",
        "telefonoAssistito": "+39 098 765 4321",
        "etaAssistito": "75",
        "cfAssistito": "RSSRSR50A41H501Z",
        "indirizzoAssistito": "Via Verdi 456",
        "capAssistito": "20100",
        "cittaAssistito": "Milano",
        "provinciaAssistito": "MI",
        "dataNascitaAssistito": "1950-01-01",
        "luogoNascitaAssistito": "Milano",
        "pacchetto": "BASE",
        "vuoleContratto": "Si",
        "intestazioneContratto": "richiedente",
        "condizioniSalute": "Diabete, ipertensione",
        "preferenzaContatto": "Email",
        "urgenzaRisposta": "Alta",
        "giorniRisposta": "1-2 giorni",
        "fonte": "LANDING_PAGE",
        "note": "Test automatico - BASE + RICHIEDENTE"
    }' 2>&1)

if echo "$LEAD1_RESPONSE" | grep -q '"success":true'; then
    LEAD1_ID=$(echo "$LEAD1_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Lead creato: $LEAD1_ID${NC}"
    echo -e "${MAGENTA}   Verifica email a:${NC}"
    echo -e "${MAGENTA}   - rpoggi55@gmail.com (conferma cliente)${NC}"
    echo -e "${MAGENTA}   - info@telemedcare.it (notifica interna)${NC}"
else
    echo -e "${RED}❌ Errore creazione lead${NC}"
    echo "Response: $LEAD1_RESPONSE"
fi
echo ""

# Test 3: Lead Intake - AVANZATO + Assistito
echo -e "${YELLOW}Test 3/6: Lead Intake AVANZATO + Intestazione ASSISTITO...${NC}"
LEAD2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
    -H "Content-Type: application/json" \
    -d '{
        "nomeRichiedente": "Roberto",
        "cognomeRichiedente": "Poggi",
        "emailRichiedente": "rpoggi55@gmail.com",
        "telefonoRichiedente": "+39 123 456 7890",
        "cfRichiedente": "PGGRRT70A01H501Z",
        "indirizzoRichiedente": "Via Roma 123",
        "capRichiedente": "20100",
        "cittaRichiedente": "Milano",
        "provinciaRichiedente": "MI",
        "dataNascitaRichiedente": "1970-01-01",
        "luogoNascitaRichiedente": "Milano",
        "nomeAssistito": "Anna",
        "cognomeAssistito": "Verdi",
        "emailAssistito": "anna.verdi@test.com",
        "telefonoAssistito": "+39 098 765 4321",
        "etaAssistito": "65",
        "cfAssistito": "VRDNNA60A41H501Z",
        "indirizzoAssistito": "Via Garibaldi 789",
        "capAssistito": "20100",
        "cittaAssistito": "Milano",
        "provinciaAssistito": "MI",
        "dataNascitaAssistito": "1960-01-01",
        "luogoNascitaAssistito": "Milano",
        "pacchetto": "AVANZATO",
        "vuoleContratto": "Si",
        "intestazioneContratto": "assistito",
        "condizioniSalute": "Cardiopatia",
        "preferenzaContatto": "Telefono",
        "urgenzaRisposta": "Media",
        "giorniRisposta": "3-5 giorni",
        "fonte": "LANDING_PAGE",
        "note": "Test automatico - AVANZATO + ASSISTITO"
    }' 2>&1)

if echo "$LEAD2_RESPONSE" | grep -q '"success":true'; then
    LEAD2_ID=$(echo "$LEAD2_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Lead creato: $LEAD2_ID${NC}"
    echo -e "${MAGENTA}   Verifica email (contratto intestato ad ANNA VERDI)${NC}"
else
    echo -e "${RED}❌ Errore creazione lead${NC}"
    echo "Response: $LEAD2_RESPONSE"
fi
echo ""

# Test 4: Partner Lead - IRBEMA
echo -e "${YELLOW}Test 4/6: Partner Lead Source - IRBEMA...${NC}"
IRBEMA_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
    -H "Content-Type: application/json" \
    -d '{
        "nomeRichiedente": "Mario",
        "cognomeRichiedente": "Rossi",
        "emailRichiedente": "mario.rossi@test.com",
        "telefonoRichiedente": "+39 111 222 3333",
        "fonte": "IRBEMA",
        "pacchetto": "BASE",
        "note": "Test partner IRBEMA"
    }' 2>&1)

if echo "$IRBEMA_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Lead IRBEMA creato${NC}"
else
    echo -e "${RED}❌ Errore creazione lead IRBEMA${NC}"
fi
echo ""

# Test 5: Partner Lead - Luxottica
echo -e "${YELLOW}Test 5/6: Partner Lead Source - LUXOTTICA...${NC}"
LUXOTTICA_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead" \
    -H "Content-Type: application/json" \
    -d '{
        "nomeRichiedente": "Luigi",
        "cognomeRichiedente": "Bianchi",
        "emailRichiedente": "luigi.bianchi@test.com",
        "telefonoRichiedente": "+39 222 333 4444",
        "fonte": "LUXOTTICA",
        "pacchetto": "AVANZATO",
        "note": "Test partner LUXOTTICA"
    }' 2>&1)

if echo "$LUXOTTICA_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Lead LUXOTTICA creato${NC}"
else
    echo -e "${RED}❌ Errore creazione lead LUXOTTICA${NC}"
fi
echo ""

# Test 6: Database Query (requires wrangler)
echo -e "${YELLOW}Test 6/6: Database Verification...${NC}"
echo -e "${BLUE}Verifica manuale richiesta:${NC}"
echo ""
echo "Esegui questo comando per verificare i lead nel database:"
echo -e "${MAGENTA}npx wrangler d1 execute telemedcare-leads --remote --command=\"SELECT id, nomeRichiedente, cognomeRichiedente, intestazioneContratto, fonte, pacchetto FROM leads ORDER BY created_at DESC LIMIT 5;\"${NC}"
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}RIEPILOGO TEST${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}Test completati!${NC}"
echo ""
echo -e "${YELLOW}Prossimi passi manuali:${NC}"
echo "1. ✅ Verifica email ricevute:"
echo "   - rpoggi55@gmail.com"
echo "   - info@telemedcare.it"
echo ""
echo "2. ✅ Verifica contenuto email:"
echo "   - Nessun placeholder {{VARIABILE}}"
echo "   - Nessun campo 'DA FORNIRE'"
echo "   - Sender: info@telemedcare.it"
echo "   - Tutti i campi popolati correttamente"
echo ""
echo "3. ✅ Testa firma contratto (se lead creati):"
if [ ! -z "$LEAD1_ID" ]; then
    echo "   curl -X POST $BASE_URL/api/contract/sign \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"leadId\": \"$LEAD1_ID\", \"firmaDigitale\": \"Roberto Poggi - Test firma\"}'"
fi
echo ""
echo "4. ✅ Verifica proforma dopo firma contratto"
echo ""
echo -e "${BLUE}Per logs real-time:${NC}"
echo "  npx wrangler pages deployment tail --project-name telemedcare-v11"
echo ""
