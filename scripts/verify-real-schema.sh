#!/bin/bash
# Script per verificare lo schema REALE del database Cloudflare D1
# Esegue query PRAGMA per ottenere la struttura effettiva delle tabelle

DATABASE_ID="e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f"
DATABASE_NAME="telemedcare-leads"

echo "=========================================="
echo "📊 VERIFICA SCHEMA DATABASE REALE"
echo "=========================================="
echo ""
echo "Database: $DATABASE_NAME"
echo "ID: $DATABASE_ID"
echo ""

# Elenco tabelle
echo "=========================================="
echo "📋 TABELLE NEL DATABASE"
echo "=========================================="
npx wrangler d1 execute "$DATABASE_NAME" \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" \
  2>/dev/null

echo ""
echo "=========================================="
echo "🔍 SCHEMA TABELLA: leads"
echo "=========================================="
npx wrangler d1 execute "$DATABASE_NAME" \
  --command "PRAGMA table_info(leads);" \
  2>/dev/null

echo ""
echo "=========================================="
echo "🔍 SCHEMA TABELLA: contracts"
echo "=========================================="
npx wrangler d1 execute "$DATABASE_NAME" \
  --command "PRAGMA table_info(contracts);" \
  2>/dev/null

echo ""
echo "=========================================="
echo "🔍 SCHEMA TABELLA: proforma"
echo "=========================================="
npx wrangler d1 execute "$DATABASE_NAME" \
  --command "PRAGMA table_info(proforma);" \
  2>/dev/null

echo ""
echo "=========================================="
echo "🔍 SCHEMA TABELLA: lead_interactions"
echo "=========================================="
npx wrangler d1 execute "$DATABASE_NAME" \
  --command "PRAGMA table_info(lead_interactions);" \
  2>/dev/null

echo ""
echo "=========================================="
echo "📊 SAMPLE: Prima proforma (per verificare dati reali)"
echo "=========================================="
npx wrangler d1 execute "$DATABASE_NAME" \
  --command "SELECT * FROM proforma LIMIT 1;" \
  2>/dev/null

echo ""
echo "✅ Verifica completata!"
echo "Confronta l'output con DB_SCHEMA.md"
