#!/bin/bash

echo "🧪 TEST 4 CASI EMAIL - Brochure e Contratto"
echo "============================================"
echo ""

BASE_URL="https://telemedcare-v12.pages.dev"

# Funzione test
test_caso() {
  local CASO=$1
  local NOME=$2
  local VUOLE_BROCHURE=$3
  local VUOLE_CONTRATTO=$4
  local EMAIL_ATTESA=$5
  
  echo "📝 CASO $CASO: $NOME"
  echo "   vuoleBrochure=$VUOLE_BROCHURE, vuoleContratto=$VUOLE_CONTRATTO"
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/api/leads" \
    -H "Content-Type: application/json" \
    -d "{
      \"nomeRichiedente\": \"Test\",
      \"cognomeRichiedente\": \"Caso$CASO\",
      \"email\": \"test-caso$CASO@example.com\",
      \"servizio\": \"eCura PRO\",
      \"piano\": \"BASE\",
      \"vuoleBrochure\": \"$VUOLE_BROCHURE\",
      \"vuoleContratto\": \"$VUOLE_CONTRATTO\",
      \"canale\": \"TEST_CASO_$CASO\"
    }")
  
  LEAD_ID=$(echo "$RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
  NOTIFICA=$(echo "$RESPONSE" | grep -o '"notifica":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)
  BROCHURE=$(echo "$RESPONSE" | grep -o '"brochure":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)
  CONTRATTO=$(echo "$RESPONSE" | grep -o '"contratto":{"sent":[^}]*}' | grep -o 'true\|false' | head -1)
  
  echo "   Lead: $LEAD_ID"
  echo "   Notifica: $NOTIFICA | Brochure: $BROCHURE | Contratto: $CONTRATTO"
  echo "   Atteso: $EMAIL_ATTESA"
  
  # Verifica
  if [[ "$EMAIL_ATTESA" == "brochure" && "$BROCHURE" == "true" && "$CONTRATTO" == "false" ]]; then
    echo "   ✅ PASS"
  elif [[ "$EMAIL_ATTESA" == "contratto" && "$CONTRATTO" == "true" ]]; then
    echo "   ✅ PASS"
  elif [[ "$EMAIL_ATTESA" == "default_brochure" && "$BROCHURE" == "true" && "$CONTRATTO" == "false" ]]; then
    echo "   ✅ PASS"
  else
    echo "   ❌ FAIL"
  fi
  echo ""
}

# Wait for deploy
echo "⏳ Attesa 90 secondi per deploy..."
sleep 90
echo ""

# CASO 1: Solo Brochure
test_caso 1 "Solo Brochure" "Si" "No" "brochure"

# CASO 2: Solo Contratto
test_caso 2 "Solo Contratto" "No" "Si" "contratto"

# CASO 3: Brochure + Contratto
test_caso 3 "Brochure + Contratto" "Si" "Si" "contratto"

# CASO 4: Default (nessuno) → brochure
test_caso 4 "Default (nessuno)" "No" "No" "default_brochure"

echo "=========================================="
echo "📊 RIEPILOGO TEST"
echo "=========================================="
echo "✅ Tutti i 4 casi testati"
echo ""
echo "📧 VERIFICA MANUALE:"
echo "1. CASO 2 e 3: Email con LINK FIRMA CONTRATTO (pulsante arancione)"
echo "2. CASO 2 e 3: Email con link brochure (pulsante blu)"
echo "3. CASO 1 e 4: Email solo documenti informativi"
echo ""

exit 0
