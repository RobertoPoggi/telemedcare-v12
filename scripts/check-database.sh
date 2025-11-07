#!/bin/bash

# TeleMedCare Database Inspector
# Usage: ./scripts/check-database.sh [local|remote] [leads|contracts|all]

ENVIRONMENT=${1:-local}
TABLE=${2:-all}

if [ "$ENVIRONMENT" != "local" ] && [ "$ENVIRONMENT" != "remote" ]; then
  echo "❌ Errore: ambiente deve essere 'local' o 'remote'"
  exit 1
fi

FLAG=""
if [ "$ENVIRONMENT" == "remote" ]; then
  FLAG="--remote"
else
  FLAG="--local"
fi

echo "🔍 TeleMedCare Database Inspector"
echo "=================================="
echo "📊 Ambiente: $ENVIRONMENT"
echo "📋 Tabella: $TABLE"
echo ""

# Function to show leads
show_leads() {
  echo "📝 LEADS (ultimi 10)"
  echo "--------------------"
  wrangler d1 execute telemedcare-leads $FLAG --command \
    "SELECT 
      id, 
      nomeRichiedente || ' ' || cognomeRichiedente AS nome_completo,
      emailRichiedente,
      pacchetto,
      CASE WHEN vuoleContratto = 1 THEN '✅' ELSE '❌' END AS contratto,
      CASE WHEN vuoleBrochure = 1 THEN '✅' ELSE '❌' END AS brochure,
      CASE WHEN vuoleManuale = 1 THEN '✅' ELSE '❌' END AS manuale,
      substr(timestamp, 1, 19) AS data
    FROM leads 
    ORDER BY timestamp DESC 
    LIMIT 10" 2>/dev/null | grep -A 500 "results"
  echo ""
}

# Function to show contracts
show_contracts() {
  echo "📄 CONTRACTS (ultimi 10)"
  echo "------------------------"
  wrangler d1 execute telemedcare-leads $FLAG --command \
    "SELECT 
      id,
      lead_id,
      piano_servizio,
      '€' || prezzo AS prezzo,
      status,
      substr(created_at, 1, 19) AS data
    FROM contracts 
    ORDER BY created_at DESC 
    LIMIT 10" 2>/dev/null | grep -A 500 "results"
  echo ""
}

# Function to show statistics
show_stats() {
  echo "📊 STATISTICHE"
  echo "--------------"
  wrangler d1 execute telemedcare-leads $FLAG --command \
    "SELECT 
      'Totale Leads' AS tipo,
      COUNT(*) AS totale,
      SUM(CASE WHEN vuoleContratto = 1 THEN 1 ELSE 0 END) AS con_contratto,
      SUM(CASE WHEN vuoleBrochure = 1 THEN 1 ELSE 0 END) AS con_brochure,
      SUM(CASE WHEN vuoleManuale = 1 THEN 1 ELSE 0 END) AS con_manuale
    FROM leads
    UNION ALL
    SELECT 
      'Totale Contratti' AS tipo,
      COUNT(*) AS totale,
      SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) AS inviati,
      SUM(CASE WHEN status = 'SIGNED' THEN 1 ELSE 0 END) AS firmati,
      SUM(CASE WHEN status = 'generated' THEN 1 ELSE 0 END) AS generati
    FROM contracts" 2>/dev/null | grep -A 500 "results"
  echo ""
}

# Execute based on TABLE parameter
case $TABLE in
  leads)
    show_leads
    ;;
  contracts)
    show_contracts
    ;;
  stats)
    show_stats
    ;;
  all)
    show_leads
    show_contracts
    show_stats
    ;;
  *)
    echo "❌ Errore: tabella deve essere 'leads', 'contracts', 'stats' o 'all'"
    exit 1
    ;;
esac

echo "✅ Ispezione completata"
