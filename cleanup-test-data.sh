#!/bin/bash

echo "🧹 PULIZIA DATABASE - Rimozione Lead e Contratti di Test"
echo "========================================================="
echo ""

# 1. Cancella tutti i lead MANUAL
echo "📋 Step 1: Cancellazione lead di test (LEAD-MANUAL-*)..."
LEADS_RESPONSE=$(curl -s "https://telemedcare-v12.pages.dev/api/leads")
MANUAL_LEADS=$(echo "$LEADS_RESPONSE" | grep -o '"id":"LEAD-MANUAL-[0-9]*"' | cut -d'"' -f4)

LEAD_COUNT=0
for LEAD_ID in $MANUAL_LEADS; do
    echo "   Cancellazione $LEAD_ID..."
    DELETE_RESPONSE=$(curl -s -X DELETE "https://telemedcare-v12.pages.dev/api/leads/$LEAD_ID")
    if echo "$DELETE_RESPONSE" | grep -q "success.*true"; then
        echo "   ✅ $LEAD_ID cancellato"
        LEAD_COUNT=$((LEAD_COUNT + 1))
    else
        echo "   ❌ Errore cancellazione $LEAD_ID: $DELETE_RESPONSE"
    fi
done

echo ""
echo "✅ Totale lead cancellati: $LEAD_COUNT"
echo ""

# 2. Cancella tutti i contratti di test (contract-*)
echo "📋 Step 2: Cancellazione contratti di test (contract-*)..."
CONTRACTS_RESPONSE=$(curl -s "https://telemedcare-v12.pages.dev/api/contracts")
TEST_CONTRACTS=$(echo "$CONTRACTS_RESPONSE" | grep -o '"id":"contract-[0-9]*"' | cut -d'"' -f4)

CONTRACT_COUNT=0
for CONTRACT_ID in $TEST_CONTRACTS; do
    echo "   Cancellazione $CONTRACT_ID..."
    DELETE_RESPONSE=$(curl -s -X DELETE "https://telemedcare-v12.pages.dev/api/contracts/$CONTRACT_ID")
    if echo "$DELETE_RESPONSE" | grep -q "success.*true"; then
        echo "   ✅ $CONTRACT_ID cancellato"
        CONTRACT_COUNT=$((CONTRACT_COUNT + 1))
    else
        echo "   ❌ Errore cancellazione $CONTRACT_ID: $DELETE_RESPONSE"
    fi
done

echo ""
echo "✅ Totale contratti cancellati: $CONTRACT_COUNT"
echo ""

echo "========================================================="
echo "🎉 PULIZIA COMPLETATA"
echo "   Lead cancellati: $LEAD_COUNT"
echo "   Contratti cancellati: $CONTRACT_COUNT"
echo "========================================================="
