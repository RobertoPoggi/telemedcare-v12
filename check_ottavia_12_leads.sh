#!/bin/bash

# I 12 lead manuali di Ottavia importati ieri alle 01:27
OTTAVIA_LEADS=(
  "Alberto Avanzi"
  "Marco Olivieri"
  "Giovanna Giordano"
  "Mary De Sanctis"
  "Francesco Egiziano"
  "Enzo Pedron"
  "Andrea Dindo"
  "Andrea Mercuri"
  "Maria Chiara Baldassini"
  "Adriana Mulassano"
  "Paola Scarpin"
  "Laura Bianchi"
)

API_URL="https://telemedcare-v12.pages.dev"

echo "🔍 VERIFICA 12 LEAD MANUALI DI OTTAVIA"
echo "================================================================"
echo ""

# Recupero tutti i lead
ALL_LEADS=$(curl -s "$API_URL/api/leads" | jq '.leads')

PRESENT=0
MISSING=0

for nome in "${OTTAVIA_LEADS[@]}"; do
  # Cerco il lead per nome (case-insensitive)
  FOUND=$(echo "$ALL_LEADS" | jq -r --arg nome "$nome" '[.[] | select((.nomeRichiedente + " " + .cognomeRichiedente) | ascii_downcase | contains($nome | ascii_downcase))] | length')
  
  if [ "$FOUND" -gt 0 ]; then
    echo "✅ $nome - PRESENTE"
    ((PRESENT++))
  else
    echo "❌ $nome - MANCANTE"
    ((MISSING++))
  fi
done

echo ""
echo "================================================================"
echo "📊 Totale: ${#OTTAVIA_LEADS[@]} lead"
echo "✅ Presenti: $PRESENT"
echo "❌ Mancanti: $MISSING"

