#!/bin/bash

echo "🔍 DEBUG: Test inserimento diretto contratto"
echo "=============================================="
echo ""

BASE_URL="https://telemedcare-v12.pages.dev"

# Test 1: Crea un lead e verifica che inviaEmailContratto venga chiamato
echo "📝 Test 1: Creazione lead..."
LEAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Debug",
    "cognomeRichiedente": "Test",
    "email": "debug@test.com",
    "telefono": "+39 333 DEBUG",
    "servizio": "eCura PRO",
    "piano": "BASE",
    "vuoleContratto": "Si"
  }')

LEAD_ID=$(echo "$LEAD_RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
echo "Lead ID: $LEAD_ID"
echo ""

# Attendi che il contratto sia salvato
sleep 5

# Test 2: Verifica se esiste un contratto per questo lead
echo "🔍 Test 2: Ricerca contratti per leadId=$LEAD_ID..."
CONTRACTS=$(curl -s "${BASE_URL}/api/contracts?leadId=${LEAD_ID}")
COUNT=$(echo "$CONTRACTS" | grep -o '"contracts":\[[^]]*\]' | grep -o '{' | wc -l)

echo "Contratti trovati: $COUNT"
echo ""

if [ "$COUNT" -eq 0 ]; then
    echo "❌ NESSUN CONTRATTO SALVATO!"
    echo "Possibili cause:"
    echo "  1. db è undefined nel workflow"
    echo "  2. INSERT fallisce silenziosamente"
    echo "  3. Problema di binding parametri"
    echo "  4. Errore nella generazione HTML"
    echo ""
    echo "Soluzione: Aggiungere più logging nel workflow"
fi

echo "Raw response:"
echo "$CONTRACTS" | head -50

echo ""
echo "✅ TEST COMPLETATO"
