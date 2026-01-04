#!/bin/bash

echo "🚀 VERIFICA DEPLOY E DEBUG EMAIL COUNT"
echo "======================================="
echo ""

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verifica lo stato del deploy
echo -e "${YELLOW}1️⃣ Verifica stato deploy Cloudflare Pages...${NC}"
DEPLOY_CHECK=$(curl -s 'https://telemedcare-v12.pages.dev/dashboard.html' | grep -c "Carica tutti i lead")

if [ "$DEPLOY_CHECK" -eq "0" ]; then
    echo -e "${RED}❌ DEPLOY NON COMPLETATO!${NC}"
    echo "   Il codice aggiornato NON è ancora online."
    echo ""
    echo "📌 PROSSIMI PASSI:"
    echo "   1. Attendi altri 3-5 minuti"
    echo "   2. Verifica su GitHub che il commit abd6306 sia presente"
    echo "   3. Verifica su Cloudflare Pages che il deploy sia partito"
    echo "   4. Riesegui questo script"
    echo ""
    
    # Mostra ultimo commit GitHub
    echo "📋 Ultimo commit su GitHub:"
    cd /home/user/webapp
    git log --oneline -1
    echo ""
    
    echo "🔗 Link Cloudflare Pages Dashboard:"
    echo "   https://dash.cloudflare.com/?to=/:account/pages/view/telemedcare-v12-pages/deployments"
    echo ""
    
    exit 1
else
    echo -e "${GREEN}✅ Deploy completato!${NC}"
    echo "   Il nuovo codice è online."
fi

echo ""

# 2. Simula il calcolo JavaScript lato client
echo -e "${YELLOW}2️⃣ Simula calcolo email count (come fa il browser)...${NC}"

# Carica i lead
LEADS_JSON=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=100')
TOTAL_LEADS=$(echo "$LEADS_JSON" | jq '.leads | length')

# Calcola 30 giorni fa
THIRTY_DAYS_AGO_MS=$(($(date +%s) * 1000 - 30 * 24 * 60 * 60 * 1000))
THIRTY_DAYS_AGO=$(date -u -d "@$((THIRTY_DAYS_AGO_MS / 1000))" +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -u -r $((THIRTY_DAYS_AGO_MS / 1000)) +%Y-%m-%dT%H:%M:%S.000Z)

echo "   📊 Lead totali: $TOTAL_LEADS"
echo "   📅 Filtrando dal: $THIRTY_DAYS_AGO"

# Conta email con jq (simula il filter JavaScript)
EMAILS_COUNT=$(echo "$LEADS_JSON" | jq --arg cutoff "$THIRTY_DAYS_AGO" '
  [.leads[] | select(
    ((.created_at // .timestamp) >= $cutoff) and 
    (.vuoleBrochure == "Si" or .vuoleContratto == "Si" or .vuoleManuale == "Si")
  )] | length
')

echo "   📧 Email inviate (ultimi 30 giorni): ${GREEN}$EMAILS_COUNT${NC}"

# Conta contratti
CONTRACTS_COUNT=$(echo "$LEADS_JSON" | jq --arg cutoff "$THIRTY_DAYS_AGO" '
  [.leads[] | select(
    ((.created_at // .timestamp) >= $cutoff) and 
    (.vuoleContratto == "Si")
  )] | length
')

echo "   📝 Contratti inviati (ultimi 30 giorni): ${GREEN}$CONTRACTS_COUNT${NC}"

echo ""

# 3. Mostra esempi
echo -e "${YELLOW}3️⃣ Esempi di lead contati:${NC}"
echo "$LEADS_JSON" | jq -r --arg cutoff "$THIRTY_DAYS_AGO" '
  [.leads[] | select(
    ((.created_at // .timestamp) >= $cutoff) and 
    (.vuoleBrochure == "Si" or .vuoleContratto == "Si" or .vuoleManuale == "Si")
  )][:5] | .[] | "   \(.id) | \(.created_at // .timestamp)\n     Brochure: \(.vuoleBrochure) | Contratto: \(.vuoleContratto) | Manuale: \(.vuoleManuale)"
'

echo ""
echo "======================================="
echo -e "${GREEN}✅ SIMULAZIONE COMPLETATA!${NC}"
echo ""
echo "🎯 RISULTATO ATTESO NELLA DASHBOARD:"
echo "   - Lead Totali: $TOTAL_LEADS"
echo "   - Email Inviate (Ultimi 30 giorni): ${GREEN}$EMAILS_COUNT${NC}"
echo "   - Contratti Inviati (Ultimi 30 giorni): ${GREEN}$CONTRACTS_COUNT${NC}"
echo ""
echo "📋 COSA FARE ORA:"
echo "   1. Apri: https://telemedcare-v12.pages.dev/dashboard.html"
echo "   2. Ricarica con cache clear: Ctrl+Shift+R (o Cmd+Shift+R su Mac)"
echo "   3. Verifica che i numeri corrispondano"
echo ""
echo "🐛 SE I NUMERI NON CORRISPONDONO:"
echo "   1. Apri Developer Tools (F12)"
echo "   2. Vai su Console tab"
echo "   3. Ricarica la pagina"
echo "   4. Cerca errori in rosso"
echo "   5. Fai screenshot e condividi"
echo ""
echo "💡 SE EMAIL INVIATE È ANCORA 0:"
echo "   Potrebbe essere un problema di cache del browser."
echo "   Prova:"
echo "   - Ctrl+Shift+R per hard refresh"
echo "   - Oppure apri in incognito mode"
echo ""
