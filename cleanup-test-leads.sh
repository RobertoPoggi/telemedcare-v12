#!/bin/bash

echo "🗑️  PULIZIA DATI DI TEST"
echo "======================================"
echo ""
echo "⚠️  ATTENZIONE: Questo script cancellerà:"
echo "   - Tutti i lead con ID: LEAD-MANUAL-*"
echo "   - Tutti i contratti con ID: contract-176*"
echo ""
echo "✅ MANTERRÀ tutti i dati reali:"
echo "   - Lead reali (non MANUAL)"
echo "   - Contratti CONTRACT_CTR-* (produzione)"
echo ""

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Richiedi conferma
echo -e "${YELLOW}Vuoi procedere? (digita 'YES' per confermare)${NC}"
read -p "> " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo -e "${RED}❌ Operazione annullata${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Fase 1: Conta dati da cancellare...${NC}"

# Conta lead di test
TEST_LEADS=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=1000' | jq '[.leads[] | select(.id | startswith("LEAD-MANUAL-"))] | length')
echo "   📋 Lead di test da cancellare: $TEST_LEADS"

# Conta contratti di test
TEST_CONTRACTS=$(curl -s 'https://telemedcare-v12.pages.dev/api/contratti?limit=1000' | jq '[.contratti[] | select(.id | startswith("contract-176"))] | length')
echo "   📝 Contratti di test da cancellare: $TEST_CONTRACTS"

echo ""
echo -e "${YELLOW}⚠️  CONFERMA FINALE: Cancellare $TEST_LEADS lead e $TEST_CONTRACTS contratti?${NC}"
echo -e "${YELLOW}Digita 'DELETE' per confermare:${NC}"
read -p "> " FINAL_CONFIRM

if [ "$FINAL_CONFIRM" != "DELETE" ]; then
    echo -e "${RED}❌ Operazione annullata${NC}"
    exit 1
fi

echo ""
echo -e "${RED}🗑️  Fase 2: Cancellazione in corso...${NC}"

# Ottieni lista lead di test
LEAD_IDS=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=1000' | jq -r '.leads[] | select(.id | startswith("LEAD-MANUAL-")) | .id')

# Conta totale
TOTAL_LEADS=$(echo "$LEAD_IDS" | wc -l | tr -d ' ')
DELETED_LEADS=0
FAILED_LEADS=0

echo "   🔄 Cancellazione $TOTAL_LEADS lead di test..."

# Cancella ogni lead
for LEAD_ID in $LEAD_IDS; do
    if [ ! -z "$LEAD_ID" ]; then
        RESPONSE=$(curl -s -X DELETE "https://telemedcare-v12.pages.dev/api/leads/$LEAD_ID")
        
        if echo "$RESPONSE" | grep -q '"success":true'; then
            DELETED_LEADS=$((DELETED_LEADS + 1))
            echo -e "   ${GREEN}✓${NC} $LEAD_ID"
        else
            FAILED_LEADS=$((FAILED_LEADS + 1))
            echo -e "   ${RED}✗${NC} $LEAD_ID (errore)"
        fi
    fi
done

echo ""
echo "   📊 Lead cancellati: $DELETED_LEADS / $TOTAL_LEADS"
if [ $FAILED_LEADS -gt 0 ]; then
    echo -e "   ${RED}⚠️  Falliti: $FAILED_LEADS${NC}"
fi

echo ""

# Ottieni lista contratti di test
CONTRACT_IDS=$(curl -s 'https://telemedcare-v12.pages.dev/api/contratti?limit=1000' | jq -r '.contratti[] | select(.id | startswith("contract-176")) | .id')

# Conta totale
TOTAL_CONTRACTS=$(echo "$CONTRACT_IDS" | wc -l | tr -d ' ')
DELETED_CONTRACTS=0
FAILED_CONTRACTS=0

echo "   🔄 Cancellazione $TOTAL_CONTRACTS contratti di test..."

# Cancella ogni contratto
for CONTRACT_ID in $CONTRACT_IDS; do
    if [ ! -z "$CONTRACT_ID" ]; then
        RESPONSE=$(curl -s -X DELETE "https://telemedcare-v12.pages.dev/api/contratti/$CONTRACT_ID")
        
        if echo "$RESPONSE" | grep -q '"success":true'; then
            DELETED_CONTRACTS=$((DELETED_CONTRACTS + 1))
            echo -e "   ${GREEN}✓${NC} $CONTRACT_ID"
        else
            FAILED_CONTRACTS=$((FAILED_CONTRACTS + 1))
            echo -e "   ${RED}✗${NC} $CONTRACT_ID (errore)"
        fi
    fi
done

echo ""
echo "   📊 Contratti cancellati: $DELETED_CONTRACTS / $TOTAL_CONTRACTS"
if [ $FAILED_CONTRACTS -gt 0 ]; then
    echo -e "   ${RED}⚠️  Falliti: $FAILED_CONTRACTS${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ PULIZIA COMPLETATA!${NC}"
echo ""
echo "📊 RIEPILOGO:"
echo "   - Lead cancellati: $DELETED_LEADS"
echo "   - Contratti cancellati: $DELETED_CONTRACTS"
if [ $((FAILED_LEADS + FAILED_CONTRACTS)) -gt 0 ]; then
    echo -e "   ${RED}- Errori totali: $((FAILED_LEADS + FAILED_CONTRACTS))${NC}"
fi
echo ""
echo "🎯 PROSSIMI PASSI:"
echo "   1. Verifica che la dashboard mostri solo dati reali"
echo "   2. Crea un nuovo lead di test per verificare il flusso completo"
echo "   3. Controlla che Email Inviate venga aggiornato correttamente"
echo ""
