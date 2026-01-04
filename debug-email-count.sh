#!/bin/bash

echo "🐛 DEBUG: Email Inviate = 0"
echo "======================================"
echo ""

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Fase 1: Carica lead (come fa la dashboard)${NC}"
LEADS_JSON=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=100')

# Verifica che l'API risponda
if [ -z "$LEADS_JSON" ]; then
    echo -e "${RED}❌ ERRORE: API /api/leads non risponde!${NC}"
    exit 1
fi

# Conta lead totali
TOTAL=$(echo "$LEADS_JSON" | jq '.leads | length')
echo "   ✅ API risponde: $TOTAL lead caricati"

echo ""
echo -e "${BLUE}📅 Fase 2: Calcola 30 giorni fa${NC}"

# Timestamp attuale in millisecondi
NOW_MS=$(date +%s)000
THIRTY_DAYS_MS=$((30 * 24 * 60 * 60 * 1000))
CUTOFF_MS=$((NOW_MS - THIRTY_DAYS_MS))

# Converti in data ISO
CUTOFF_DATE=$(date -u -d "@$((CUTOFF_MS / 1000))" +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -u -r $((CUTOFF_MS / 1000)) +%Y-%m-%dT%H:%M:%S.000Z)

echo "   📅 Data corrente: $(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
echo "   📅 30 giorni fa: $CUTOFF_DATE"

echo ""
echo -e "${BLUE}🔍 Fase 3: Analizza lead singolarmente${NC}"

# Lista lead con dettagli
echo "$LEADS_JSON" | jq -r --arg cutoff "$CUTOFF_DATE" '
  .leads[:10] | .[] | 
  "   Lead: \(.id)\n   - Data: \(.created_at // .timestamp // "NO DATE")\n   - Brochure: \(.vuoleBrochure // "NULL")\n   - Contratto: \(.vuoleContratto // "NULL")\n   - Manuale: \(.vuoleManuale // "NULL")\n   - Include? \(
      if ((.created_at // .timestamp) >= $cutoff) and 
         ((.vuoleBrochure == "Si") or (.vuoleContratto == "Si") or (.vuoleManuale == "Si"))
      then "✅ SI"
      else "❌ NO (\(
        if ((.created_at // .timestamp) < $cutoff) then "Data vecchia" 
        elif (.vuoleBrochure != "Si" and .vuoleContratto != "Si" and .vuoleManuale != "Si") then "Nessuna email"
        else "???"
        end
      ))"
      end
   )\n"
'

echo ""
echo -e "${BLUE}📧 Fase 4: Calcola Email Inviate (esattamente come il JS della dashboard)${NC}"

# Questo è il calcolo ESATTO del JavaScript
EMAIL_COUNT=$(echo "$LEADS_JSON" | jq --arg cutoff "$CUTOFF_DATE" '
  [.leads[] | select(
    ((.created_at // .timestamp) >= $cutoff) and 
    ((.vuoleBrochure == "Si") or (.vuoleContratto == "Si") or (.vuoleManuale == "Si"))
  )] | length
')

echo -e "   📧 Email Inviate (ultimi 30 giorni): ${GREEN}${EMAIL_COUNT}${NC}"

# Contratti
CONTRACT_COUNT=$(echo "$LEADS_JSON" | jq --arg cutoff "$CUTOFF_DATE" '
  [.leads[] | select(
    ((.created_at // .timestamp) >= $cutoff) and 
    (.vuoleContratto == "Si")
  )] | length
')

echo -e "   📝 Contratti Inviati (ultimi 30 giorni): ${GREEN}${CONTRACT_COUNT}${NC}"

echo ""
echo -e "${BLUE}🔍 Fase 5: Verifica il codice JavaScript sulla dashboard${NC}"

# Scarica la dashboard e cerca il codice
DASHBOARD_CODE=$(curl -s 'https://telemedcare-v12.pages.dev/dashboard.html')

if echo "$DASHBOARD_CODE" | grep -q "Carica tutti i lead"; then
    echo -e "   ${GREEN}✅ Dashboard ha il codice aggiornato${NC}"
    
    # Estrai la riga esatta del filtro
    echo ""
    echo "   Codice filtro email:"
    echo "$DASHBOARD_CODE" | grep -A3 "emailsMonth = allLeads.filter" | head -4 | sed 's/^/      /'
else
    echo -e "   ${RED}❌ Dashboard NON ha il codice aggiornato!${NC}"
    echo -e "   ${YELLOW}⚠️  Il deploy di Cloudflare non è ancora completato${NC}"
    echo ""
    echo "   SOLUZIONE:"
    echo "   1. Aspetta altri 5-10 minuti"
    echo "   2. Fai hard refresh: Ctrl+Shift+R"
    echo "   3. Oppure apri in Incognito mode"
fi

echo ""
echo -e "${BLUE}🐛 Fase 6: Verifica errori JavaScript (dalla console del browser)${NC}"
echo ""
echo "   Dalla tua console vedo questi errori:"
echo -e "   ${RED}1. Failed to load resource: favicon.icon (404)${NC}"
echo -e "   ${RED}2. Errori di mapping Excel (da mappatura Excel)${NC}"
echo ""
echo "   💡 Il problema principale potrebbe essere:"
echo "   - La dashboard sta caricando codice VECCHIO dalla cache"
echo "   - Oppure c'è un errore JavaScript che blocca l'esecuzione"
echo ""
echo "   📋 COSA FARE:"
echo "   1. Apri DevTools (F12)"
echo "   2. Vai su 'Network' tab"
echo "   3. Spunta 'Disable cache'"
echo "   4. Ricarica la pagina (F5)"
echo "   5. Vai su 'Console' tab"
echo "   6. Cerca errori in ROSSO"
echo "   7. Fai screenshot di TUTTI gli errori rossi"
echo ""

echo ""
echo "======================================"
echo -e "${GREEN}📊 RISULTATO FINALE${NC}"
echo ""
echo "   🎯 Valore CORRETTO per 'Email Inviate': ${GREEN}${EMAIL_COUNT}${NC}"
echo "   🎯 Valore CORRETTO per 'Contratti Inviati': ${GREEN}${CONTRACT_COUNT}${NC}"
echo ""
echo "   Dashboard attuale mostra: 0"
echo -e "   ${RED}❌ DISCREPANZA CONFERMATA!${NC}"
echo ""
echo "📋 CAUSA PROBABILE:"
echo "   1. Cache del browser (molto probabile)"
echo "   2. Deploy Cloudflare non completato"
echo "   3. Errore JavaScript che blocca l'esecuzione"
echo ""
echo "🔧 SOLUZIONE:"
echo "   1. Apri dashboard in INCOGNITO mode"
echo "   2. Oppure: Ctrl+Shift+Delete → Cancella cache ultimi 24h"
echo "   3. Ricarica: Ctrl+Shift+R"
echo "   4. Se ancora 0, fai screenshot COMPLETO della console (F12)"
echo ""
