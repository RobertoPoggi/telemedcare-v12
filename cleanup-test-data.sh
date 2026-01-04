#!/bin/bash

echo "🧹 PULIZIA DATABASE - Rimozione Lead e Contratti di Test"
echo "========================================================="
echo ""
echo "⚠️  ATTENZIONE: Questo script cancellerà:"
echo "   - Tutti i lead LEAD-MANUAL-*"
echo "   - Tutti i contratti contract-* (NON CONTRACT_CTR-* che sono produzione)"
echo ""
read -p "Vuoi procedere? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operazione annullata"
    exit 1
fi

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
    sleep 0.5
done

echo ""
echo "✅ Totale lead cancellati: $LEAD_COUNT"
echo ""

# 2. Cancella tutti i contratti di test (contract-* ma NON CONTRACT_CTR-*)
echo "📋 Step 2: Cancellazione contratti di test (contract-*)..."
echo "   (⚠️  Preservati CONTRACT_CTR-* che sono contratti produzione)"
CONTRACTS_RESPONSE=$(curl -s "https://telemedcare-v12.pages.dev/api/contracts")
# Filtra SOLO contract-* (minuscolo), esclude CONTRACT_CTR-*
TEST_CONTRACTS=$(echo "$CONTRACTS_RESPONSE" | grep -o '"id":"contract-[0-9]*"' | cut -d'"' -f4)

CONTRACT_COUNT=0
for CONTRACT_ID in $TEST_CONTRACTS; do
    # Double-check: skip se inizia con CONTRACT_CTR-
    if [[ "$CONTRACT_ID" == CONTRACT_CTR-* ]]; then
        echo "   ⏭️  Saltato $CONTRACT_ID (produzione)"
        continue
    fi
    
    echo "   Cancellazione $CONTRACT_ID..."
    
    # Usa DELETE diretto sul DB (endpoint API potrebbe non esistere)
    DELETE_SQL="DELETE FROM contracts WHERE id = '$CONTRACT_ID'"
    # Nota: questo richiede un endpoint API di amministrazione per eseguire SQL
    # Per ora usiamo un approccio simulato
    
    echo "   ⚠️  Cancellazione manuale richiesta: $CONTRACT_ID"
    echo "      SQL: DELETE FROM contracts WHERE id = '$CONTRACT_ID';"
    CONTRACT_COUNT=$((CONTRACT_COUNT + 1))
    
    sleep 0.5
done

echo ""
echo "⚠️  Contratti da cancellare manualmente: $CONTRACT_COUNT"
echo ""

echo "========================================================="
echo "🎉 PULIZIA COMPLETATA"
echo "   Lead cancellati: $LEAD_COUNT"
echo "   Contratti da cancellare manualmente: $CONTRACT_COUNT"
echo ""
echo "📝 Per cancellare i contratti, esegui queste query nel DB:"
echo ""
for CONTRACT_ID in $TEST_CONTRACTS; do
    if [[ "$CONTRACT_ID" != CONTRACT_CTR-* ]]; then
        echo "   DELETE FROM contracts WHERE id = '$CONTRACT_ID';"
    fi
done
echo ""
echo "========================================================="
