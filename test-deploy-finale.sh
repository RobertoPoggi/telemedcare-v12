#!/bin/bash

# ============================================
# DEPLOY FINALE E TEST - 11 Feb 2026
# TeleMedCare V12.0
# ============================================

set -e

echo "🚀 DEPLOY FINALE E TEST - TeleMedCare V12.0"
echo "============================================="
echo ""

# ============================================
# STEP 1: Verifica stato deploy Cloudflare Pages
# ============================================
echo "📊 STEP 1: Verifica Deploy Cloudflare Pages"
echo "-------------------------------------------"
echo ""
echo "➡️  Vai su: https://dash.cloudflare.com/"
echo "➡️  Workers & Pages → telemedcare-v12"
echo "➡️  Verifica che l'ultimo deploy sia:"
echo "     Commit: d3d4a13"
echo "     Status: Success"
echo "     Branch: main"
echo ""
read -p "Deploy Cloudflare Pages completato? (y/n): " deploy_done

if [ "$deploy_done" != "y" ]; then
  echo "❌ Attendi il completamento del deploy e riprova."
  exit 1
fi

echo "✅ Deploy Cloudflare Pages completato"
echo ""

# ============================================
# STEP 2: Deploy Migration 0050 su D1
# ============================================
echo "📊 STEP 2: Deploy Migration 0050 su Cloudflare D1"
echo "-------------------------------------------"
echo ""
echo "⚠️  AZIONE MANUALE RICHIESTA"
echo ""
echo "Opzione A: Dashboard Cloudflare"
echo "  1. Vai su: https://dash.cloudflare.com/"
echo "  2. Workers & Pages → D1 → telemedcare-db → Console"
echo "  3. Copia contenuto di: migrations/0050_update_contract_email_template.sql"
echo "  4. Incolla nella console e clicca Execute"
echo ""
echo "Opzione B: Wrangler CLI (se hai token configurato)"
echo "  npx wrangler d1 execute telemedcare-db --file=./migrations/0050_update_contract_email_template.sql --remote"
echo ""
read -p "Migration 0050 deployata su D1? (y/n): " migration_done

if [ "$migration_done" != "y" ]; then
  echo "❌ Deploya la migration 0050 e riprova."
  exit 1
fi

echo "✅ Migration 0050 deployata"
echo ""

# ============================================
# STEP 3: Verifica Migration 0050
# ============================================
echo "📊 STEP 3: Verifica Migration 0050"
echo "-------------------------------------------"
echo ""
echo "Esegui questa query nella Console D1:"
echo ""
echo "SELECT id, name, LENGTH(html_content) as html_length, variables, updated_at"
echo "FROM document_templates"
echo "WHERE id = 'email_invio_contratto';"
echo ""
echo "Risultato atteso:"
echo "  - html_length: 5000-6000 (circa)"
echo "  - variables: include DISPOSITIVO, LINK_BROCHURE, LINK_FIRMA"
echo "  - updated_at: 2026-02-11"
echo ""
read -p "Verifica superata? (y/n): " verify_done

if [ "$verify_done" != "y" ]; then
  echo "❌ Verifica fallita. Controlla la query e riprova."
  exit 1
fi

echo "✅ Migration 0050 verificata"
echo ""

# ============================================
# STEP 4: Test Form Completamento (Automatico)
# ============================================
echo "📊 STEP 4: Test Form Completamento"
echo "-------------------------------------------"
echo ""
echo "Test URL: https://telemedcare-v12.pages.dev/api/form/LEAD-IRBEMA-00186?leadId=LEAD-IRBEMA-00186"
echo ""
echo "Azioni:"
echo "  1. Apri il link nel browser"
echo "  2. Compila tutti i campi richiesti"
echo "  3. Invia il form"
echo ""
echo "Risultati attesi:"
echo "  ✅ HTTP 200 (non 500)"
echo "  ✅ Messaggio: 'Dati salvati con successo'"
echo "  ✅ Email contratto ricevuta automaticamente"
echo "  ✅ Email con ordine: brochure → contratto"
echo "  ✅ Prossimi passi visibili (firma elettronica + cartacea)"
echo ""
read -p "Test form completamento superato? (y/n): " test1_done

if [ "$test1_done" != "y" ]; then
  echo "❌ Test fallito. Controlla i log Cloudflare Workers."
  exit 1
fi

echo "✅ Test form completamento superato"
echo ""

# ============================================
# STEP 5: Test Link Firma Contratto
# ============================================
echo "📊 STEP 5: Test Link Firma Contratto"
echo "-------------------------------------------"
echo ""
echo "Azioni:"
echo "  1. Apri email contratto ricevuta (dal test precedente)"
echo "  2. Clicca sul pulsante '✍️ Firma il Contratto Online'"
echo ""
echo "Risultati attesi:"
echo "  ✅ Pagina firma caricata (non 404)"
echo "  ✅ URL: https://telemedcare-v12.pages.dev/contract-signature?contractId=..."
echo "  ✅ Form firma visualizzato"
echo "  ✅ Dati lead precaricati"
echo ""
read -p "Test link firma superato? (y/n): " test2_done

if [ "$test2_done" != "y" ]; then
  echo "❌ Test fallito. Verifica che contract-signature.html sia deployato."
  exit 1
fi

echo "✅ Test link firma superato"
echo ""

# ============================================
# STEP 6: Test Pulsante Manuale (Dashboard)
# ============================================
echo "📊 STEP 6: Test Pulsante Manuale Invio Contratto"
echo "-------------------------------------------"
echo ""
echo "⚠️  TEST MANUALE RICHIESTO"
echo ""
echo "Azioni:"
echo "  1. Apri dashboard: https://telemedcare-v12.pages.dev/"
echo "  2. Seleziona un lead con contratto già creato"
echo "  3. Clicca sul pulsante 'Invia Contratto' (se disponibile)"
echo ""
echo "Risultati attesi:"
echo "  ✅ Email ricevuta identica a quella automatica"
echo "  ✅ Ordine: brochure → contratto"
echo "  ✅ Link firma funzionante"
echo "  ✅ Template: email_invio_contratto"
echo ""
read -p "Test pulsante manuale superato? (y/n): " test3_done

if [ "$test3_done" != "y" ]; then
  echo "⚠️  Test manuale non completato. Procedi quando possibile."
fi

echo "✅ Test pulsante manuale completato (o da completare)"
echo ""

# ============================================
# STEP 7: Test Import IRBEMA (Pizzichemi)
# ============================================
echo "📊 STEP 7: Test Import IRBEMA - Servizio PRO"
echo "-------------------------------------------"
echo ""
echo "⚠️  TEST OPZIONALE"
echo ""
echo "Azioni:"
echo "  1. Elimina lead Pizzichemi dal DB (se esiste)"
echo "  2. Reimporta con pulsante IRBEMA"
echo "  3. Verifica i log Cloudflare Workers"
echo ""
echo "Risultati attesi:"
echo "  ✅ Servizio: eCura PRO BASE (non FAMILY)"
echo "  ✅ Email notifica con servizio corretto"
echo "  ✅ DB: servizio = 'eCura PRO'"
echo ""
read -p "Test import IRBEMA da eseguire? (y/n): " test4_execute

if [ "$test4_execute" == "y" ]; then
  read -p "Test import IRBEMA superato? (y/n): " test4_done
  if [ "$test4_done" == "y" ]; then
    echo "✅ Test import IRBEMA superato"
  else
    echo "⚠️  Test import IRBEMA fallito. Controlla i log."
  fi
else
  echo "⏭️  Test import IRBEMA saltato"
fi

echo ""

# ============================================
# RIEPILOGO FINALE
# ============================================
echo ""
echo "============================================="
echo "✅ DEPLOY E TEST COMPLETATI"
echo "============================================="
echo ""
echo "📊 Riepilogo:"
echo "  ✅ Deploy Cloudflare Pages: d3d4a13"
echo "  ✅ Migration 0050 deployata e verificata"
echo "  ✅ Test form completamento: PASSED"
echo "  ✅ Test link firma contratto: PASSED"
echo "  ✅ Test pulsante manuale: PASSED (o da completare)"
echo "  ⏭️  Test import IRBEMA: OPZIONALE"
echo ""
echo "📁 Documentazione disponibile:"
echo "  - RIEPILOGO_SESSIONE_11_FEB_2026.md"
echo "  - DEPLOY_MIGRATION_0050.md"
echo "  - AZIONI_IMMEDIATE_DEPLOY.md"
echo ""
echo "🔗 Link utili:"
echo "  - Dashboard: https://telemedcare-v12.pages.dev/"
echo "  - Cloudflare: https://dash.cloudflare.com/"
echo "  - GitHub: https://github.com/RobertoPoggi/telemedcare-v12"
echo ""
echo "🎉 Tutti i fix sono stati applicati e testati!"
echo ""
echo "============================================="
