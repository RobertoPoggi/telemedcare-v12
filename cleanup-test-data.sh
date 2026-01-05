#!/bin/bash
set -e

echo "🗑️  PULIZIA COMPLETA DATI DI TEST"
echo "============================================"
echo ""
echo "Questo script cancella:"
echo "  1) Lead LEAD-MANUAL-*"
echo "  2) Contratti contract-176*"
echo ""

BASE_URL="https://telemedcare-v12.pages.dev"

# ======================================
# STEP 1: Conta Lead LEAD-MANUAL-*
# ======================================
echo "📊 STEP 1: Conteggio Lead di Test..."
LEADS_TOTAL=$(curl -s "$BASE_URL/api/leads?limit=1000" | jq '[.leads[] | select(.id | startswith("LEAD-MANUAL-"))] | length')
echo "   Lead LEAD-MANUAL-* trovati: $LEADS_TOTAL"

# ======================================
# STEP 2: Conta Contratti contract-176*
# ======================================
echo ""
echo "📊 STEP 2: Conteggio Contratti di Test..."
CONTRACTS_TOTAL=$(curl -s "$BASE_URL/api/contratti?limit=1000" | jq '[.contratti[] | select(.id | startswith("contract-176"))] | length')
echo "   Contratti contract-176* trovati: $CONTRACTS_TOTAL"

# ======================================
# STEP 3: Riepilogo e Conferma
# ======================================
echo ""
echo "============================================"
echo "📋 RIEPILOGO:"
echo "   - Lead da cancellare: $LEADS_TOTAL"
echo "   - Contratti da cancellare: $CONTRACTS_TOTAL"
echo "============================================"

if [ "$LEADS_TOTAL" -eq "0" ] && [ "$CONTRACTS_TOTAL" -eq "0" ]; then
    echo "✅ Nessun dato di test da cancellare"
    exit 0
fi

echo ""
echo "⚠️  ATTENZIONE: Questa operazione è IRREVERSIBILE!"
echo "Digita 'YES' per confermare la cancellazione:"
read CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "❌ Operazione annullata"
    exit 1
fi

# ======================================
# STEP 4: Cancella Lead LEAD-MANUAL-*
# ======================================
if [ "$LEADS_TOTAL" -gt "0" ]; then
    echo ""
    echo "🗑️  STEP 4: Cancellazione Lead..."
    
    LEAD_IDS=$(curl -s "$BASE_URL/api/leads?limit=1000" | jq -r '.leads[] | select(.id | startswith("LEAD-MANUAL-")) | .id')
    
    LEADS_DELETED=0
    for ID in $LEAD_IDS; do
        if [ ! -z "$ID" ]; then
            RES=$(curl -s -X DELETE "$BASE_URL/api/leads/$ID")
            if echo "$RES" | grep -q "success.*true"; then
                LEADS_DELETED=$((LEADS_DELETED + 1))
                echo "  ✓ Lead cancellato: $ID"
            else
                echo "  ✗ Errore cancellazione lead: $ID"
            fi
        fi
    done
    
    echo ""
    echo "   Lead cancellati: $LEADS_DELETED / $LEADS_TOTAL"
fi

# ======================================
# STEP 5: Cancella Contratti contract-176*
# ======================================
if [ "$CONTRACTS_TOTAL" -gt "0" ]; then
    echo ""
    echo "🗑️  STEP 5: Cancellazione Contratti..."
    
    CONTRACT_IDS=$(curl -s "$BASE_URL/api/contratti?limit=1000" | jq -r '.contratti[] | select(.id | startswith("contract-176")) | .id')
    
    CONTRACTS_DELETED=0
    for ID in $CONTRACT_IDS; do
        if [ ! -z "$ID" ]; then
            RES=$(curl -s -X DELETE "$BASE_URL/api/contratti/$ID")
            if echo "$RES" | grep -q "success.*true"; then
                CONTRACTS_DELETED=$((CONTRACTS_DELETED + 1))
                echo "  ✓ Contratto cancellato: $ID"
            else
                echo "  ✗ Errore cancellazione contratto: $ID"
            fi
        fi
    done
    
    echo ""
    echo "   Contratti cancellati: $CONTRACTS_DELETED / $CONTRACTS_TOTAL"
fi

# ======================================
# STEP 6: Riepilogo Finale
# ======================================
echo ""
echo "============================================"
echo "✅ PULIZIA COMPLETATA"
echo "============================================"
echo "   Lead cancellati: ${LEADS_DELETED:-0} / $LEADS_TOTAL"
echo "   Contratti cancellati: ${CONTRACTS_DELETED:-0} / $CONTRACTS_TOTAL"
echo ""
echo "✅ Pulizia dati di test completata con successo!"
echo ""
