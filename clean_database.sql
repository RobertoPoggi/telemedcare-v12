-- =====================================================
-- SCRIPT PULIZIA DATABASE TELEMEDCARE V11
-- =====================================================
-- Cancella TUTTI i dati di test mantenendo solo:
-- - Template email (document_templates)
-- - Schema tabelle
-- 
-- Data: 2025-11-07
-- =====================================================

-- 1. CANCELLA DATI LEAD E CORRELATI
DELETE FROM email_logs;
DELETE FROM pagamenti;
DELETE FROM proforma;
DELETE FROM contratti;
DELETE FROM contracts;
DELETE FROM configurazioni;
DELETE FROM dispositivi;
DELETE FROM leads;

-- 2. RESET AUTO-INCREMENT (se necessario)
-- SQLite non ha TRUNCATE, ma DELETE rimuove tutti i dati

-- 3. VERIFICA PULIZIA
SELECT 'LEADS' as tabella, COUNT(*) as records FROM leads
UNION ALL
SELECT 'CONTRACTS', COUNT(*) FROM contracts
UNION ALL
SELECT 'CONTRATTI', COUNT(*) FROM contratti
UNION ALL
SELECT 'PAGAMENTI', COUNT(*) FROM pagamenti
UNION ALL
SELECT 'PROFORMA', COUNT(*) FROM proforma
UNION ALL
SELECT 'DISPOSITIVI', COUNT(*) FROM dispositivi
UNION ALL
SELECT 'CONFIGURAZIONI', COUNT(*) FROM configurazioni
UNION ALL
SELECT 'EMAIL_LOGS', COUNT(*) FROM email_logs
UNION ALL
SELECT 'TEMPLATES (CONSERVATI)', COUNT(*) FROM document_templates;

-- =====================================================
-- FINE SCRIPT
-- =====================================================
