#!/bin/bash

# VERIFY-DOCUSIGN-READY.SH
# Verifica che DocuSign sia pronto per l'uso

echo ""
echo "🚀 ===== VERIFICA DOCUSIGN INTEGRATION ====="
echo ""

# TEST 1: Token nel database
echo "📋 TEST 1: Verifica token nel database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOKEN_COUNT=$(wrangler d1 execute telemedcare-leads --local --command="SELECT COUNT(*) as count FROM docusign_tokens;" 2>&1 | grep -A 5 '"count"' | grep -o '"count": [0-9]*' | grep -o '[0-9]*')

if [ "$TOKEN_COUNT" -gt 0 ]; then
    echo "✅ Token trovato nel database"
    
    # Verifica scadenza
    wrangler d1 execute telemedcare-leads --local --command="SELECT id, token_type, expires_at FROM docusign_tokens ORDER BY created_at DESC LIMIT 1;" 2>&1 | grep -A 20 "results"
    echo ""
else
    echo "❌ Nessun token nel database"
    echo "💡 Esegui: npx tsx oauth-callback-server.ts"
    echo ""
    exit 1
fi

# TEST 2: Credenziali env
echo "📋 TEST 2: Verifica credenziali environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f ".dev.vars" ]; then
    echo "✅ File .dev.vars trovato"
    
    if grep -q "DOCUSIGN_INTEGRATION_KEY" .dev.vars; then
        echo "✅ DOCUSIGN_INTEGRATION_KEY configurato"
    else
        echo "❌ DOCUSIGN_INTEGRATION_KEY mancante"
        exit 1
    fi
    
    if grep -q "DOCUSIGN_SECRET_KEY" .dev.vars; then
        echo "✅ DOCUSIGN_SECRET_KEY configurato"
    else
        echo "❌ DOCUSIGN_SECRET_KEY mancante"
        exit 1
    fi
    
    if grep -q "DOCUSIGN_ACCOUNT_ID" .dev.vars; then
        echo "✅ DOCUSIGN_ACCOUNT_ID configurato"
    else
        echo "❌ DOCUSIGN_ACCOUNT_ID mancante"
        exit 1
    fi
    
    echo ""
else
    echo "❌ File .dev.vars non trovato"
    exit 1
fi

# TEST 3: Tabelle database
echo "📋 TEST 3: Verifica tabelle database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TABLES=$(wrangler d1 execute telemedcare-leads --local --command="SELECT name FROM sqlite_master WHERE type='table' AND (name='docusign_tokens' OR name='docusign_envelopes');" 2>&1 | grep '"name"' | wc -l)

if [ "$TABLES" -eq 2 ]; then
    echo "✅ Tabella docusign_tokens esistente"
    echo "✅ Tabella docusign_envelopes esistente"
    echo ""
else
    echo "❌ Tabelle DocuSign mancanti"
    echo "💡 Esegui migration: wrangler d1 execute telemedcare-leads --local --file=migrations/0019_create_docusign_envelopes_table.sql"
    echo "💡 Esegui migration: wrangler d1 execute telemedcare-leads --local --file=migrations/0020_create_docusign_tokens_table.sql"
    echo ""
    exit 1
fi

# TEST 4: Moduli integration
echo "📋 TEST 4: Verifica moduli integrazione"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "src/modules/docusign-auth.ts" ]; then
    echo "✅ docusign-auth.ts presente"
else
    echo "❌ docusign-auth.ts mancante"
    exit 1
fi

if [ -f "src/modules/docusign-integration.ts" ]; then
    echo "✅ docusign-integration.ts presente"
else
    echo "❌ docusign-integration.ts mancante"
    exit 1
fi

if [ -f "src/modules/docusign-workflow.ts" ]; then
    echo "✅ docusign-workflow.ts presente"
else
    echo "❌ docusign-workflow.ts mancante"
    exit 1
fi

if [ -f "src/modules/docusign-token-manager.ts" ]; then
    echo "✅ docusign-token-manager.ts presente"
else
    echo "❌ docusign-token-manager.ts mancante"
    exit 1
fi

if [ -f "src/modules/docusign-orchestrator-integration.ts" ]; then
    echo "✅ docusign-orchestrator-integration.ts presente"
else
    echo "❌ docusign-orchestrator-integration.ts mancante"
    exit 1
fi

echo ""

# TEST 5: Orchestrator integration
echo "📋 TEST 5: Verifica integrazione orchestrator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "isDocuSignAvailable" src/modules/complete-workflow-orchestrator.ts; then
    echo "✅ isDocuSignAvailable importato nell'orchestrator"
else
    echo "❌ isDocuSignAvailable non trovato nell'orchestrator"
    exit 1
fi

if grep -q "sendContractWithDocuSign" src/modules/complete-workflow-orchestrator.ts; then
    echo "✅ sendContractWithDocuSign importato nell'orchestrator"
else
    echo "❌ sendContractWithDocuSign non trovato nell'orchestrator"
    exit 1
fi

if grep -q "docuSignAvailable" src/modules/complete-workflow-orchestrator.ts; then
    echo "✅ Logica DocuSign presente nell'orchestrator"
else
    echo "❌ Logica DocuSign non trovata nell'orchestrator"
    exit 1
fi

echo ""

# SUMMARY
echo "═══════════════════════════════════════════════════"
echo "🎉 ===== VERIFICA COMPLETATA CON SUCCESSO ====="
echo "═══════════════════════════════════════════════════"
echo ""
echo "✅ Tutti i componenti DocuSign sono pronti!"
echo ""
echo "🎯 DOCUSIGN INTEGRATION: READY FOR USE"
echo ""
echo "📝 Per testare con lead reale:"
echo "  1. Compila form con 'Richiedi Contratto'"
echo "  2. Sistema userà automaticamente DocuSign"
echo "  3. Verifica email con richiesta firma"
echo ""
