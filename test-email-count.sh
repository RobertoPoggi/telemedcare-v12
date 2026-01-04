#!/bin/bash

echo "🔍 TEST EMAIL COUNT DASHBOARD"
echo "=============================="
echo ""

# 1. Verifica che il codice sia deployato
echo "1️⃣ Verifica deploy del nuovo codice..."
DEPLOY_CHECK=$(curl -s 'https://telemedcare-v12.pages.dev/dashboard.html' | grep -c "Carica tutti i lead")

if [ "$DEPLOY_CHECK" -eq "0" ]; then
    echo "❌ DEPLOY NON COMPLETATO!"
    echo "   Il codice aggiornato non è ancora online."
    echo "   Attendi altri 2-3 minuti e riprova."
    exit 1
else
    echo "✅ Deploy completato! Codice aggiornato è online."
fi

echo ""

# 2. Carica i lead e calcola le statistiche
echo "2️⃣ Carica lead e calcola statistiche..."
LEADS_JSON=$(curl -s 'https://telemedcare-v12.pages.dev/api/leads?limit=100')

# Conta i lead totali
TOTAL_LEADS=$(echo "$LEADS_JSON" | jq '.leads | length')
echo "   📊 Lead totali (ultimi 100): $TOTAL_LEADS"

# Calcola data 30 giorni fa (ISO format)
THIRTY_DAYS_AGO=$(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -u -v-30d +%Y-%m-%dT%H:%M:%S.000Z)
echo "   📅 Data limite (30 giorni fa): $THIRTY_DAYS_AGO"

# Conta email inviate (lead con vuoleBrochure o vuoleContratto = Si negli ultimi 30 giorni)
EMAILS_COUNT=$(echo "$LEADS_JSON" | jq --arg cutoff "$THIRTY_DAYS_AGO" '
  .leads | map(
    select(
      (.created_at // .timestamp) >= $cutoff and 
      (.vuoleBrochure == "Si" or .vuoleContratto == "Si" or .vuoleManuale == "Si")
    )
  ) | length
')

echo "   📧 Email inviate (ultimi 30 giorni): $EMAILS_COUNT"

echo ""

# 3. Mostra alcuni esempi di lead che dovrebbero essere contati
echo "3️⃣ Esempi di lead che dovrebbero essere contati:"
echo "$LEADS_JSON" | jq -r --arg cutoff "$THIRTY_DAYS_AGO" '
  .leads | map(
    select(
      (.created_at // .timestamp) >= $cutoff and 
      (.vuoleBrochure == "Si" or .vuoleContratto == "Si" or .vuoleManuale == "Si")
    )
  )[:3] | .[] | "   - \(.id) | \(.created_at // .timestamp) | Brochure:\(.vuoleBrochure) Contratto:\(.vuoleContratto) Manuale:\(.vuoleManuale)"
'

echo ""
echo "=============================="
echo "✅ TEST COMPLETATO!"
echo ""
echo "🎯 RISULTATO ATTESO NELLA DASHBOARD:"
echo "   Email Inviate (Ultimi 30 giorni): $EMAILS_COUNT"
echo ""
echo "📋 COSA FARE ORA:"
echo "   1. Apri: https://telemedcare-v12.pages.dev/dashboard.html"
echo "   2. Ricarica la pagina (Ctrl+R o F5)"
echo "   3. Verifica che 'Email Inviate' mostri: $EMAILS_COUNT"
echo ""
echo "💡 SE EMAIL INVIATE = 0:"
echo "   - Apri Developer Tools (F12)"
echo "   - Vai su Console"
echo "   - Cerca errori JavaScript"
echo "   - Condividi screenshot della console"
