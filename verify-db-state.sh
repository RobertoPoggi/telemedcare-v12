#!/bin/bash
# =====================================================
# Script: Verifica Stato Database (READ-ONLY)
# =====================================================
# Data Creazione: 02 Gennaio 2026 - 09:35
# Database: telemedcare-leads
# Scopo: Verifica tabelle e template SENZA modificare
# SICURO: Solo query SELECT, nessuna modifica
# =====================================================

echo "🔍 VERIFICA STATO DATABASE (READ-ONLY)"
echo "Database: telemedcare-leads"
echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

echo "📋 1. Lista TUTTE le tabelle:"
npx wrangler d1 execute telemedcare-leads --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" --remote

echo ""
echo "📊 2. Verifica tabella document_templates:"
npx wrangler d1 execute telemedcare-leads --command="SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='document_templates';" --remote

echo ""
echo "📧 3. Se esiste, lista template email:"
npx wrangler d1 execute telemedcare-leads --command="SELECT id, name, type FROM document_templates WHERE type='email' ORDER BY id;" --remote 2>&1 || echo "⚠️  Tabella document_templates non esiste"

echo ""
echo "📊 4. Conta leads presenti:"
npx wrangler d1 execute telemedcare-leads --command="SELECT COUNT(*) as total_leads FROM leads;" --remote

echo ""
echo "📊 5. Verifica struttura tabella leads:"
npx wrangler d1 execute telemedcare-leads --command="PRAGMA table_info(leads);" --remote | head -20

echo ""
echo "=========================================="
echo "✅ VERIFICA COMPLETATA (nessuna modifica effettuata)"
